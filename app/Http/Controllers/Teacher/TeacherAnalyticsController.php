<?php

namespace App\Http\Controllers\Teacher;

use App\Exports\TeacherProgressReportExport;
use App\Http\Controllers\Controller;
use App\Models\Kursus;
use App\Models\User;
use App\Models\Kuis;
use App\Models\Mapel;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\CourseContent;
use App\Models\QuizSubmission;
use Maatwebsite\Excel\Facades\Excel;

class TeacherAnalyticsController extends Controller
{
    public function analytics(Request $request)
    {
        try {
            $teacherId = auth()->id();
            $range = $request->get('range', 'last-30-days');

            // Calculate date range
            $endDate = Carbon::now();
            switch ($range) {
                case 'last-7-days':
                    $startDate = Carbon::now()->subDays(7);
                    break;
                case 'last-90-days':
                    $startDate = Carbon::now()->subDays(90);
                    break;
                case 'all-time':
                    $startDate = Carbon::create(2020, 1, 1);
                    break;
                default: // last-30-days
                    $startDate = Carbon::now()->subDays(30);
                    break;
            }

            // Get teacher's courses
            $teacherCourses = Kursus::where('teacher_id', $teacherId)->pluck('id');

            // Basic counts for teacher's courses
            $totalCourses = $teacherCourses->count();
            $totalStudents = DB::table('siswa_kursus')
                ->whereIn('id_kursus', $teacherCourses)
                ->distinct('id_siswa')
                ->count('id_siswa');
            $totalQuizzes = CourseContent::whereIn('kursus_id', $teacherCourses)
                ->where('type', 'quiz')
                ->count();
            $totalContent = CourseContent::whereIn('kursus_id', $teacherCourses)->count();

            // Course statistics
            $courseStats = [
                'published' => Kursus::where('teacher_id', $teacherId)->where('status', 'published')->count(),
                'draft' => Kursus::where('teacher_id', $teacherId)->where('status', 'draft')->count(),
                'total_content' => $totalContent,
            ];

            // Quiz statistics for teacher's courses
            $quizStats = [
                'total_submissions' => QuizSubmission::whereIn('course_id', $teacherCourses)->count(),
                'average_score' => round(QuizSubmission::whereIn('course_id', $teacherCourses)->avg('score') ?? 0, 1),
                'completion_rate' => $this->calculateTeacherQuizCompletionRate($teacherCourses),
            ];

            // Growth calculations for teacher's courses
            $lastMonthCourses = Kursus::where('teacher_id', $teacherId)
                ->where('created_at', '<', Carbon::now()->startOfMonth())
                ->count();
            $courseGrowth = $lastMonthCourses > 0 ?
                round((($totalCourses - $lastMonthCourses) / $lastMonthCourses) * 100, 1) : 0;

            // Recent students enrolled in teacher's courses
            $recentStudents = DB::table('users')
                ->join('siswa_kursus', 'users.id', '=', 'siswa_kursus.id_siswa')
                ->whereIn('siswa_kursus.id_kursus', $teacherCourses)
                ->select(['users.id', 'users.nama_lengkap', 'users.email', 'users.tipe_user', 'siswa_kursus.created_at'])
                ->latest('siswa_kursus.created_at')
                ->take(10)
                ->get();

            // Recent courses by teacher
            $recentCourses = Kursus::where('teacher_id', $teacherId)
                ->select(['id', 'judul_kursus', 'status', 'created_at'])
                ->latest()
                ->take(10)
                ->get()
                ->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'judul_kursus' => $course->judul_kursus,
                        'status' => $course->status ?? 'draft',
                        'created_at' => $course->created_at,
                    ];
                });

            // Monthly chart data for current year (Jan -> current month)
            $monthlyData = $this->getTeacherMonthlyDataYearToDate($teacherId, $teacherCourses);

            // Top courses by enrollment for this teacher
            $topCourses = DB::table('kursus')
                ->select([
                    'kursus.id',
                    'kursus.judul_kursus as title',
                    DB::raw('COUNT(siswa_kursus.id) as enrollment_count')
                ])
                ->leftJoin('siswa_kursus', 'kursus.id', '=', 'siswa_kursus.id_kursus')
                ->where('kursus.teacher_id', $teacherId)
                ->groupBy('kursus.id', 'kursus.judul_kursus')
                ->orderBy('enrollment_count', 'desc')
                ->take(10)
                ->get()
                ->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'enrollment_count' => $course->enrollment_count,
                        'completion_rate' => $this->calculateTeacherCourseCompletionRate($course->id),
                    ];
                });

            // Student activity data for teacher's courses
            $studentActivity = $this->getTeacherStudentActivityData($teacherCourses, $startDate, $endDate);

            // Engagement metrics
            $engagementData = $this->getTeacherEngagementData($teacherCourses, $startDate, $endDate);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_courses' => $totalCourses,
                    'total_students' => $totalStudents,
                    'total_quizzes' => $totalQuizzes,
                    'total_content' => $totalContent,
                    'course_growth' => $courseGrowth,
                    'course_stats' => $courseStats,
                    'quiz_stats' => $quizStats,
                    'recent_students' => $recentStudents,
                    'recent_courses' => $recentCourses,
                    'monthly_data' => $monthlyData,
                    'top_courses' => $topCourses,
                    'student_activity' => $studentActivity,
                    'engagement_data' => $engagementData,
                ]
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch teacher analytics data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function exportProgressReport(Request $request)
    {
        try {
            $teacherId = auth()->id();
            $fileName = 'teacher-progress-report-' . now()->format('Ymd_His') . '.xlsx';

            return Excel::download(new TeacherProgressReportExport($teacherId), $fileName);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to export teacher progress report: ' . $e->getMessage()
            ], 500);
        }
    }

    private function calculateTeacherQuizCompletionRate($teacherCourses)
    {
        $totalQuizzes = CourseContent::whereIn('kursus_id', $teacherCourses)
            ->where('type', 'quiz')
            ->count();

        $totalSubmissions = QuizSubmission::whereIn('course_id', $teacherCourses)->count();

        if ($totalQuizzes === 0) return 0;

        // Calculate completion rate based on actual submissions vs available quizzes
        $totalStudents = DB::table('siswa_kursus')
            ->whereIn('id_kursus', $teacherCourses)
            ->distinct('id_siswa')
            ->count('id_siswa');

        if ($totalStudents === 0) return 0;

        // Assuming each student should attempt each quiz once
        $expectedSubmissions = $totalQuizzes * $totalStudents;
        return min(100, round(($totalSubmissions / $expectedSubmissions) * 100, 1));
    }

    private function calculateTeacherCourseCompletionRate($courseId)
    {
        $totalStudents = DB::table('siswa_kursus')->where('id_kursus', $courseId)->count();

        if ($totalStudents === 0) return 0;

        // Calculate based on progress data
        $completedStudents = DB::table('progress_kursus')
            ->where('id_kursus', $courseId)
            ->where('status', 'selesai')
            ->count();

        return $totalStudents > 0 ? round(($completedStudents / $totalStudents) * 100, 1) : 0;
    }

    private function getTeacherMonthlyDataYearToDate($teacherId, $teacherCourses)
    {
        $months = [];
        $current = Carbon::now()->startOfYear();
        $endDate = Carbon::now();

        while ($current <= $endDate) {
            $monthName = $current->format('M Y');

            $courses = Kursus::where('teacher_id', $teacherId)
                ->whereYear('created_at', $current->year)
                ->whereMonth('created_at', $current->month)
                ->count();

            $students = DB::table('siswa_kursus')
                ->join('kursus', 'siswa_kursus.id_kursus', '=', 'kursus.id')
                ->where('kursus.teacher_id', $teacherId)
                ->whereYear('siswa_kursus.created_at', $current->year)
                ->whereMonth('siswa_kursus.created_at', $current->month)
                ->count();

            $quizzes = CourseContent::whereIn('kursus_id', $teacherCourses)
                ->where('type', 'quiz')
                ->whereYear('created_at', $current->year)
                ->whereMonth('created_at', $current->month)
                ->count();

            $months[] = [
                'month' => $monthName,
                'courses' => $courses,
                'students' => $students,
                'quizzes' => $quizzes,
            ];

            $current->addMonth();
        }

        return $months;
    }

    private function getTeacherStudentActivityData($teacherCourses, $startDate, $endDate)
    {
        $activity = [];
        $current = $startDate->copy();

        while ($current <= $endDate) {
            // Active students (students who had activity in teacher's courses on this date)
            $activeStudents = DB::table('progress_kursus')
                ->whereIn('id_kursus', $teacherCourses)
                ->whereDate('updated_at', $current->format('Y-m-d'))
                ->distinct('id_siswa')
                ->count('id_siswa');

            // New enrollments in teacher's courses
            $newEnrollments = DB::table('siswa_kursus')
                ->whereIn('id_kursus', $teacherCourses)
                ->whereDate('created_at', $current->format('Y-m-d'))
                ->count();

            $activity[] = [
                'date' => $current->format('M d'),
                'active_students' => $activeStudents,
                'new_enrollments' => $newEnrollments,
            ];

            $current->addDay();
        }

        return $activity;
    }

    private function getTeacherEngagementData($teacherCourses, $startDate, $endDate)
    {
        // Calculate engagement metrics for teacher's courses
        $totalEnrollments = DB::table('siswa_kursus')
            ->whereIn('id_kursus', $teacherCourses)
            ->count();

        $activeEnrollments = DB::table('progress_kursus')
            ->whereIn('id_kursus', $teacherCourses)
            ->whereIn('status', ['sedang berlangsung', 'selesai'])
            ->count();

        $engagementRate = $totalEnrollments > 0 ? round(($activeEnrollments / $totalEnrollments) * 100, 1) : 0;

        // Average completion rate
        $completedEnrollments = DB::table('progress_kursus')
            ->whereIn('id_kursus', $teacherCourses)
            ->where('status', 'selesai')
            ->count();

        $completionRate = $totalEnrollments > 0 ? round(($completedEnrollments / $totalEnrollments) * 100, 1) : 0;

        // Average quiz score
        $averageScore = QuizSubmission::whereIn('course_id', $teacherCourses)->avg('score') ?? 0;

        return [
            'engagement_rate' => $engagementRate,
            'completion_rate' => $completionRate,
            'average_score' => round($averageScore, 1),
            'total_enrollments' => $totalEnrollments,
            'active_enrollments' => $activeEnrollments,
            'completed_enrollments' => $completedEnrollments,
        ];
    }
}
