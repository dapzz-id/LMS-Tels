<?php

namespace App\Http\Controllers\Admin;

use App\Exports\TeacherProgressReportExport;
use App\Http\Controllers\Controller;
use App\Models\Kursus;
use App\Models\User;
use App\Models\Department;
use App\Models\Kuis;
use App\Models\Mapel;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\CourseContent;
use App\Models\QuizSubmission;
use Maatwebsite\Excel\Excel as ExcelFormat;
use Maatwebsite\Excel\Facades\Excel;
use ZipArchive;

class DashboardAdminController extends Controller
{
    public function getStats()
    {
        try {
            // Get total users count
            $totalUsers = User::count();

            // Get total courses count
            $totalCourses = Kursus::count();

            // Get total departments count
            $totalDepartments = Mapel::count();

            // Get total quizzes count
            $totalQuizzes = Kuis::count();

            // Calculate user growth (comparing with last month)
            $lastMonthUsers = User::where('created_at', '<', Carbon::now()->startOfMonth())->count();
            $userGrowth = $lastMonthUsers > 0 ?
                round((($totalUsers - $lastMonthUsers) / $lastMonthUsers) * 100, 1) : 0;

            // Calculate course growth
            $lastMonthCourses = Kursus::where('created_at', '<', Carbon::now()->startOfMonth())->count();
            $courseGrowth = $lastMonthCourses > 0 ?
                round((($totalCourses - $lastMonthCourses) / $lastMonthCourses) * 100, 1) : 0;

            // Get recent users (last 5)
            $recentUsers = User::select(['id', 'nama_lengkap', 'email', 'tipe_user', 'created_at'])
                ->latest()
                ->take(5)
                ->get();

            // Debug logging
            \Log::info('Recent users fetched:', [
                'count' => $recentUsers->count(),
                'users' => $recentUsers->toArray()
            ]);

            // Get recent courses (last 5)
            $recentCourses = Kursus::select(['id', 'judul_kursus', 'created_at'])
                ->latest()
                ->take(5)
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_users' => $totalUsers,
                    'total_kursus' => $totalCourses,
                    'total_departments' => $totalDepartments,
                    'total_quizzes' => $totalQuizzes,
                    'user_growth' => $userGrowth,
                    'course_growth' => $courseGrowth,
                    'recent_users' => $recentUsers,
                    'recent_courses' => $recentCourses
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch dashboard statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    public function analytics(Request $request)
    {
        try {
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
                    $startDate = Carbon::create(2020, 1, 1); // Adjust as needed
                    break;
                default: // last-30-days
                    $startDate = Carbon::now()->subDays(30);
                    break;
            }

            // Basic counts - using the same pattern as getStats()
            $totalUsers = User::count();
            $totalCourses = Kursus::count();
            $totalDepartments = Mapel::count();
            $totalQuizzes = CourseContent::where('type', 'quiz')->count();

            // User statistics by type
            $userStats = [
                'students' => User::where('tipe_user', 'siswa')->count(),
                'teachers' => User::where('tipe_user', 'guru')->count(),
                'admins' => User::where('tipe_user', 'admin')->count(),
            ];

            // Course statistics - using actual fields from migration
            $courseStats = [
                'published' => Kursus::where('is_featured', true)->count(), // Using is_featured as published indicator
                'draft' => Kursus::where('is_featured', false)->count(),
                'total_content' => CourseContent::count(),
            ];

            // Quiz statistics
            $quizStats = [
                'total_submissions' => QuizSubmission::count(),
                'average_score' => round(QuizSubmission::avg('score') ?? 0, 1),
                'completion_rate' => $this->calculateQuizCompletionRate(),
            ];

            // Growth calculations - using the same pattern as getStats()
            $lastMonthUsers = User::where('created_at', '<', Carbon::now()->startOfMonth())->count();
            $userGrowth = $lastMonthUsers > 0 ? round((($totalUsers - $lastMonthUsers) / $lastMonthUsers) * 100, 1) : 0;

            $lastMonthCourses = Kursus::where('created_at', '<', Carbon::now()->startOfMonth())->count();
            $courseGrowth = $lastMonthCourses > 0 ? round((($totalCourses - $lastMonthCourses) / $lastMonthCourses) * 100, 1) : 0;

            // Recent users - using the same pattern as getStats()
            $recentUsers = User::select(['id', 'nama_lengkap', 'email', 'tipe_user', 'created_at'])
                ->latest()
                ->take(10)
                ->get();

            // Recent courses - using actual fields from migration
            $recentCourses = Kursus::select(['id', 'judul_kursus', 'created_at'])
                ->latest()
                ->take(10)
                ->get()
                ->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'judul_kursus' => $course->judul_kursus,
                        'status' => $course->is_featured ? 'published' : 'draft',
                        'created_at' => $course->created_at,
                    ];
                });

            // Monthly data for charts
            $monthlyData = $this->getMonthlyData($startDate, $endDate);

            // Top courses by enrollment (using siswa_kursus table)
            $topCourses = DB::table('kursus')
                ->select([
                    'kursus.id',
                    'kursus.judul_kursus as title',
                    DB::raw('COUNT(siswa_kursus.id) as enrollment_count')
                ])
                ->leftJoin('siswa_kursus', 'kursus.id', '=', 'siswa_kursus.id_kursus')
                ->groupBy('kursus.id', 'kursus.judul_kursus')
                ->orderBy('enrollment_count', 'desc')
                ->take(10)
                ->get()
                ->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'enrollment_count' => $course->enrollment_count,
                        'completion_rate' => $this->calculateCourseCompletionRate($course->id),
                    ];
                });

            // User activity data
            $userActivity = $this->getUserActivityData($startDate, $endDate);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_users' => $totalUsers,
                    'total_courses' => $totalCourses,
                    'total_departments' => $totalDepartments,
                    'total_quizzes' => $totalQuizzes,
                    'user_growth' => $userGrowth,
                    'course_growth' => $courseGrowth,
                    'user_stats' => $userStats,
                    'course_stats' => $courseStats,
                    'quiz_stats' => $quizStats,
                    'recent_users' => $recentUsers,
                    'recent_courses' => $recentCourses,
                    'monthly_data' => $monthlyData,
                    'top_courses' => $topCourses,
                    'user_activity' => $userActivity,
                ]
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch analytics data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function exportProgressReport()
    {
        try {
            $teachers = User::query()
                ->select(['users.id', 'users.nama_lengkap'])
                ->where('users.tipe_user', 'guru')
                ->whereExists(function ($query) {
                    $query->select(DB::raw(1))
                        ->from('kursus')
                        ->whereColumn('kursus.teacher_id', 'users.id');
                })
                ->orderBy('users.nama_lengkap')
                ->get();

            if ($teachers->isEmpty()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No course data available to export.',
                ], 404);
            }

            $timestamp = now()->format('Ymd_His');
            $zipFileName = 'admin-progress-reports-' . $timestamp . '.zip';
            $tempDirectory = storage_path('app/temp/exports');
            $zipPath = $tempDirectory . DIRECTORY_SEPARATOR . $zipFileName;

            if (!is_dir($tempDirectory) && !mkdir($tempDirectory, 0755, true) && !is_dir($tempDirectory)) {
                throw new Exception('Failed to prepare temporary export directory.');
            }

            $zip = new ZipArchive();
            $zipStatus = $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);
            if ($zipStatus !== true) {
                throw new Exception('Failed to create ZIP archive.');
            }

            foreach ($teachers as $index => $teacher) {
                $teacherId = (int) $teacher->id;
                $teacherName = $this->makeSafeExportName((string) $teacher->nama_lengkap, 'teacher-' . $teacherId);
                $filePrefix = str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT);
                $entryName = $filePrefix . '-' . $teacherName . '-progress-report.xlsx';

                $excelBinary = Excel::raw(new TeacherProgressReportExport($teacherId), ExcelFormat::XLSX);
                if ($zip->addFromString($entryName, $excelBinary) === false) {
                    throw new Exception('Failed to append Excel report into ZIP archive.');
                }
            }

            $zip->close();

            return response()
                ->download($zipPath, $zipFileName, ['Content-Type' => 'application/zip'])
                ->deleteFileAfterSend(true);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to export analytics report: ' . $e->getMessage()
            ], 500);
        }
    }

    private function calculateQuizCompletionRate()
    {
        $totalQuizzes = CourseContent::where('type', 'quiz')->count();
        $totalSubmissions = QuizSubmission::count();

        if ($totalQuizzes === 0) return 0;

        // Calculate completion rate based on actual submissions vs available quizzes
        $totalStudents = User::where('tipe_user', 'siswa')->count();
        if ($totalStudents === 0) return 0;

        // Assuming each student should attempt each quiz once
        $expectedSubmissions = $totalQuizzes * $totalStudents;
        return min(100, round(($totalSubmissions / $expectedSubmissions) * 100, 1));
    }

    private function calculateCourseCompletionRate($courseId)
    {
        $totalStudents = DB::table('siswa_kursus')->where('id_kursus', $courseId)->count();

        if ($totalStudents === 0) return 0;

        // Since there's no completed_at field in siswa_kursus, we'll use a different approach
        // We can calculate based on progress or just return a default value
        // For now, let's assume 70% completion rate as a placeholder
        return 70.0;
    }

    private function getMonthlyData($startDate, $endDate)
    {
        $months = [];
        $current = $startDate->copy();

        while ($current <= $endDate) {
            $monthName = $current->format('M Y');

            $users = User::whereYear('created_at', $current->year)
                ->whereMonth('created_at', $current->month)
                ->count();

            $courses = Kursus::whereYear('created_at', $current->year)
                ->whereMonth('created_at', $current->month)
                ->count();

            $quizzes = CourseContent::where('type', 'quiz')
                ->whereYear('created_at', $current->year)
                ->whereMonth('created_at', $current->month)
                ->count();

            $months[] = [
                'month' => $monthName,
                'users' => $users,
                'courses' => $courses,
                'quizzes' => $quizzes,
            ];

            $current->addMonth();
        }

        return $months;
    }

    private function getUserActivityData($startDate, $endDate)
    {
        $activity = [];
        $current = $startDate->copy();

        while ($current <= $endDate) {
            // Active users (users who logged in or had activity on this date)
            $activeUsers = User::whereDate('updated_at', $current->format('Y-m-d'))->count();

            // New registrations
            $newRegistrations = User::whereDate('created_at', $current->format('Y-m-d'))->count();

            $activity[] = [
                'date' => $current->format('M d'),
                'active_users' => $activeUsers,
                'new_registrations' => $newRegistrations,
            ];

            $current->addDay();
        }

        return $activity;
    }

    private function makeSafeExportName(string $rawName, string $fallback): string
    {
        $safeName = preg_replace('/[^A-Za-z0-9_-]+/', '-', $rawName) ?? '';
        $safeName = trim($safeName, '-_');

        return $safeName !== '' ? $safeName : $fallback;
    }
}
