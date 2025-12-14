<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Kursus;
use App\Models\User;
use App\Models\QuizSubmission;
use App\Models\ProgressCourse;
use App\Models\CourseContent;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TeacherStudentsController extends Controller
{
    public function index()
    {
        try {
            $teacherId = auth()->id();

            // Get all students enrolled in teacher's courses
            $enrolledStudents = DB::table('siswa_kursus')
                ->join('users', 'siswa_kursus.id_siswa', '=', 'users.id')
                ->join('kursus', 'siswa_kursus.id_kursus', '=', 'kursus.id')
                ->where('kursus.teacher_id', $teacherId)
                ->select([
                    'users.id as student_id',
                    'users.nama_lengkap as student_name',
                    'users.email as student_email',
                    'kursus.id as course_id',
                    'kursus.judul_kursus as course_name',
                    'siswa_kursus.progress',
                    'siswa_kursus.completed_at',
                    'siswa_kursus.created_at as enrollment_date'
                ])
                ->get();

            // Get quiz submissions for teacher's courses
            $quizSubmissions = QuizSubmission::whereIn('course_id', function($query) use ($teacherId) {
                $query->select('id')->from('kursus')->where('teacher_id', $teacherId);
            })->get();

            // Get course progress for teacher's courses
            $courseProgress = ProgressCourse::whereIn('id_kursus', function($query) use ($teacherId) {
                $query->select('id')->from('kursus')->where('teacher_id', $teacherId);
            })->get();

            // Process student data
            $students = $enrolledStudents->map(function ($enrollment) use ($quizSubmissions, $courseProgress) {
                $studentQuizSubmissions = $quizSubmissions->where('user_id', $enrollment->student_id);
                $studentProgress = $courseProgress->where('id_siswa', $enrollment->student_id)->first();

                // Calculate average score
                $averageScore = $studentQuizSubmissions->count() > 0
                    ? round($studentQuizSubmissions->avg(function($submission) {
                        return $submission->total_questions > 0
                            ? ($submission->score / $submission->total_questions) * 100
                            : 0;
                    }), 2)
                    : 0;

                // Determine last active (simplified for demo)
                $lastActive = $enrollment->enrollment_date ?
                    \Carbon\Carbon::parse($enrollment->enrollment_date)->diffForHumans() :
                    'Never';

                return [
                    'id' => $enrollment->student_id,
                    'name' => $enrollment->student_name,
                    'email' => $enrollment->student_email,
                    'course_name' => $enrollment->course_name,
                    'course_id' => $enrollment->course_id,
                    'progress' => $enrollment->progress ?? 0,
                    'completed_at' => $enrollment->completed_at,
                    'last_active' => $lastActive,
                    'quiz_submissions_count' => $studentQuizSubmissions->count(),
                    'average_score' => $averageScore
                ];
            });

            // Calculate statistics
            $totalStudents = $students->unique('id')->count();
            $totalCourses = $students->unique('course_id')->count();
            $averageProgress = $students->count() > 0 ? round($students->avg('progress'), 1) : 0;
            $activeStudents = $students->where('progress', '>', 0)->where('completed_at', null)->count();

            return Inertia::render('teacher/students/page', [
                'students' => $students,
                'totalStudents' => $totalStudents,
                'totalCourses' => $totalCourses,
                'averageProgress' => $averageProgress,
                'activeStudents' => $activeStudents
            ]);
        } catch (Exception $e) {
            Log::error('Error fetching teacher students: ' . $e->getMessage());
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function progress()
    {
        try {
            $teacherId = auth()->id();

            // Get all courses created by this teacher
            $courses = Kursus::where('teacher_id', $teacherId)
                ->with(['sub_pembahasan.contents'])
                ->get();

            // Get all students enrolled in teacher's courses
            $studentIds = DB::table('siswa_kursus')
                ->join('kursus', 'siswa_kursus.id_kursus', '=', 'kursus.id')
                ->where('kursus.teacher_id', $teacherId)
                ->distinct('siswa_kursus.id_siswa')
                ->pluck('siswa_kursus.id_siswa');

            $students = User::whereIn('id', $studentIds)
                ->select(['id', 'nama_lengkap', 'email', 'class'])
                ->get();

            // Get progress data for each student in each course
            $studentProgressData = [];
            foreach ($students as $student) {
                $studentCourseProgress = [];
                foreach ($courses as $course) {
                    // Check if student is enrolled in this course
                    $isEnrolled = DB::table('siswa_kursus')
                        ->where('id_siswa', $student->id)
                        ->where('id_kursus', $course->id)
                        ->exists();

                    if ($isEnrolled) {
                        $progressData = $this->getCourseProgressForStudent($student, $course);
                        $studentCourseProgress[] = [
                            'course' => $course,
                            'progress' => $progressData
                        ];
                    }
                }

                if (!empty($studentCourseProgress)) {
                    $studentProgressData[] = [
                        'student' => $student,
                        'courses' => $studentCourseProgress
                    ];
                }
            }

            return Inertia::render('teacher/students/progress', [
                'studentProgress' => $studentProgressData,
                'courses' => $courses
            ]);
        } catch (Exception $e) {
            Log::error('Error fetching teacher student progress: ' . $e->getMessage());
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the course progress for a specific student
     */
    private function getCourseProgressForStudent($student, $course)
    {
        try {
            // Get all content items for this course
            $courseContents = collect();
            foreach ($course->sub_pembahasan as $sub) {
                $courseContents = $courseContents->merge($sub->contents);
            }

            // Count only valid content types
            $validContentTypes = ['video', 'pdf', 'quiz'];
            $totalContent = $courseContents->filter(function($content) use ($validContentTypes) {
                return in_array($content->type, $validContentTypes);
            })->count();

            // Get completed content items for this student
            $completedContent = $this->getCompletedContentCount($student, $course);

            // Get quiz submissions for this course
            $quizSubmissions = QuizSubmission::where('user_id', $student->id)
                ->where('course_id', $course->id)
                ->get();

            // Calculate overall progress
            $progressPercentage = $totalContent > 0 ? round(($completedContent / $totalContent) * 100, 1) : 0;

            // Check if course is completed (all content completed)
            $isCompleted = $totalContent > 0 && $completedContent == $totalContent;

            return [
                'total_content' => $totalContent,
                'completed_content' => $completedContent,
                'progress_percentage' => $progressPercentage,
                'is_completed' => $isCompleted,
                'quiz_submissions' => $quizSubmissions,
                'completion_status' => $this->getCompletionStatus($progressPercentage)
            ];
        } catch (Exception $e) {
            Log::error('Error in getCourseProgressForStudent: ' . $e->getMessage());
            return [
                'total_content' => 0,
                'completed_content' => 0,
                'progress_percentage' => 0,
                'is_completed' => false,
                'quiz_submissions' => collect(),
                'completion_status' => 'not_started'
            ];
        }
    }

    /**
     * Get the count of completed content items for a student in a course
     */
    private function getCompletedContentCount($student, $course)
    {
        try {
            $completedCount = 0;

            foreach ($course->sub_pembahasan as $sub) {
                foreach ($sub->contents as $content) {
                    // Only count content that has a valid type
                    if (in_array($content->type, ['video', 'pdf', 'quiz'])) {
                        // Get the actual progress_per_subbab value
                        $progressRecord = ProgressCourse::where('id_siswa', $student->id)
                            ->where('id_kursus', $course->id)
                            ->where('id_sub_pembahasan', $sub->id)
                            ->first();

                        $progressValue = $progressRecord ? $progressRecord->progress_per_subbab : 0;

                        // Map content types to minimum required progress_per_subbab values
                        $minRequiredProgressValues = [
                            'video' => 1,  // Video completion requires progress_per_subbab >= 1
                            'pdf' => 2,    // PDF download requires progress_per_subbab >= 2
                            'quiz' => 3    // Quiz completion requires progress_per_subbab >= 3
                        ];

                        $minRequiredValue = $minRequiredProgressValues[$content->type] ?? 0;
                        $isCompleted = ($progressValue >= $minRequiredValue);

                        if ($isCompleted) {
                            $completedCount++;
                        }
                    }
                }
            }

            return $completedCount;
        } catch (Exception $e) {
            Log::error('Error in getCompletedContentCount: ' . $e->getMessage());
            return 0;
        }
    }

    private function getCompletionStatus($percentage)
    {
        if ($percentage == 100) return 'completed';
        if ($percentage >= 75) return 'almost_completed';
        if ($percentage >= 50) return 'in_progress';
        if ($percentage > 0) return 'started';
        return 'not_started';
    }
}
