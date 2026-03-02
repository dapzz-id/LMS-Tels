<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Kursus;
use App\Models\User;
use App\Models\QuizSubmission;
use App\Models\ProgressCourse;
use App\Models\CourseContent;
use Exception;
use RuntimeException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TeacherStudentsController extends Controller
{
    public function removeFromCourse(int $studentId, int $courseId)
    {
        try {
            $teacherId = auth()->id();

            $isTeacherCourse = DB::table('kursus')
                ->where('id', $courseId)
                ->where('teacher_id', $teacherId)
                ->exists();

            if (!$isTeacherCourse) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Unauthorized access to this course',
                ], 403);
            }

            $result = DB::transaction(function () use ($studentId, $courseId) {
                $enrollmentDeleted = DB::table('siswa_kursus')
                    ->where('id_siswa', $studentId)
                    ->where('id_kursus', $courseId)
                    ->delete();

                if ($enrollmentDeleted === 0) {
                    throw new RuntimeException('Student is not enrolled in this course.');
                }

                $progressDeleted = ProgressCourse::query()
                    ->where('id_siswa', $studentId)
                    ->where('id_kursus', $courseId)
                    ->delete();

                return [
                    'enrollment_deleted' => $enrollmentDeleted,
                    'progress_deleted' => $progressDeleted,
                ];
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Student removed from course and progress deleted successfully.',
                'data' => $result,
            ]);
        } catch (RuntimeException $e) {
            return response()->json([
                'status' => 'failed',
                'message' => $e->getMessage(),
            ], 404);
        } catch (Exception $e) {
            Log::error('Error removing student from course: ' . $e->getMessage(), [
                'student_id' => $studentId,
                'course_id' => $courseId,
                'teacher_id' => auth()->id(),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis saat menghapus siswa dari course.',
            ], 500);
        }
    }

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
                    'siswa_kursus.created_at as enrollment_date'
                ])
                ->orderByDesc('siswa_kursus.created_at')
                ->get();

            if ($enrolledStudents->isEmpty()) {
                return Inertia::render('teacher/students/page', [
                    'students' => [],
                    'totalStudents' => 0,
                    'totalCourses' => 0,
                    'averageProgress' => 0,
                    'activeStudents' => 0,
                ]);
            }

            $courseIds = $enrolledStudents->pluck('course_id')->unique()->values();
            $studentIds = $enrolledStudents->pluck('student_id')->unique()->values();

            $courseContents = CourseContent::query()
                ->whereIn('kursus_id', $courseIds)
                ->whereIn('type', ['video', 'pdf', 'quiz'])
                ->select(['kursus_id', 'sub_pembahasan_id', 'type'])
                ->get();

            // Fallback for legacy courses that still store learning items directly in sub_pembahasan.
            if ($courseContents->isEmpty()) {
                $legacySubItems = DB::table('sub_pembahasan')
                    ->whereIn('id_kursus', $courseIds)
                    ->select([
                        'id as sub_pembahasan_id',
                        'id_kursus as kursus_id',
                        'url_video_sub_pembahasan',
                        'url_materi_pdf_sub_pembahasan',
                        'id_kuis',
                    ])
                    ->get();

                $courseContents = $legacySubItems->flatMap(function ($item) {
                    $rows = collect();

                    if (!empty($item->url_video_sub_pembahasan)) {
                        $rows->push((object) [
                            'kursus_id' => $item->kursus_id,
                            'sub_pembahasan_id' => $item->sub_pembahasan_id,
                            'type' => 'video',
                        ]);
                    }

                    if (!empty($item->url_materi_pdf_sub_pembahasan)) {
                        $rows->push((object) [
                            'kursus_id' => $item->kursus_id,
                            'sub_pembahasan_id' => $item->sub_pembahasan_id,
                            'type' => 'pdf',
                        ]);
                    }

                    if (!empty($item->id_kuis)) {
                        $rows->push((object) [
                            'kursus_id' => $item->kursus_id,
                            'sub_pembahasan_id' => $item->sub_pembahasan_id,
                            'type' => 'quiz',
                        ]);
                    }

                    return $rows;
                })->values();
            }

            $contentsByCourse = $courseContents->groupBy('kursus_id');

            $progressRows = ProgressCourse::query()
                ->whereIn('id_kursus', $courseIds)
                ->whereIn('id_siswa', $studentIds)
                ->select([
                    'id_siswa',
                    'id_kursus',
                    'id_sub_pembahasan',
                    'progress_per_subbab',
                    'updated_at',
                ])
                ->get();

            $progressBySub = [];
            $latestProgressAt = [];
            foreach ($progressRows as $row) {
                $subKey = "{$row->id_siswa}:{$row->id_kursus}:{$row->id_sub_pembahasan}";
                $currentValue = (int) ($row->progress_per_subbab ?? 0);

                if (!isset($progressBySub[$subKey]) || $currentValue > $progressBySub[$subKey]) {
                    $progressBySub[$subKey] = $currentValue;
                }

                $enrollmentKey = "{$row->id_siswa}:{$row->id_kursus}";
                $updatedAt = (string) $row->updated_at;
                if (!isset($latestProgressAt[$enrollmentKey]) || $updatedAt > $latestProgressAt[$enrollmentKey]) {
                    $latestProgressAt[$enrollmentKey] = $updatedAt;
                }
            }

            // Get quiz submissions for teacher's courses
            $quizSubmissions = QuizSubmission::query()
                ->whereIn('course_id', $courseIds)
                ->whereIn('user_id', $studentIds)
                ->select(['user_id', 'course_id', 'score'])
                ->get();

            $progressThresholds = [
                'video' => 1,
                'pdf' => 2,
                'quiz' => 3,
            ];

            // Process student data
            $students = $enrolledStudents->map(function ($enrollment) use (
                $quizSubmissions,
                $contentsByCourse,
                $progressBySub,
                $latestProgressAt,
                $progressThresholds
            ) {
                $courseContents = $contentsByCourse->get($enrollment->course_id, collect());
                $totalContent = $courseContents->count();

                $completedContent = $courseContents->filter(function ($content) use ($enrollment, $progressBySub, $progressThresholds) {
                    $threshold = $progressThresholds[$content->type] ?? 0;
                    $subKey = "{$enrollment->student_id}:{$enrollment->course_id}:{$content->sub_pembahasan_id}";
                    $progressValue = $progressBySub[$subKey] ?? 0;

                    return $progressValue >= $threshold;
                })->count();

                $progress = $totalContent > 0 ? round(($completedContent / $totalContent) * 100, 1) : 0;

                $studentQuizSubmissions = $quizSubmissions
                    ->where('user_id', $enrollment->student_id)
                    ->where('course_id', $enrollment->course_id);

                // Calculate average score
                $averageScore = $studentQuizSubmissions->count() > 0
                    ? round((float) $studentQuizSubmissions->avg('score'), 2)
                    : 0;

                $enrollmentKey = "{$enrollment->student_id}:{$enrollment->course_id}";
                $lastActivityAt = $latestProgressAt[$enrollmentKey] ?? $enrollment->enrollment_date;

                // Determine last active (simplified for demo)
                $lastActive = $lastActivityAt ?
                    \Carbon\Carbon::parse($lastActivityAt)->diffForHumans() :
                    'Never';

                return [
                    'id' => $enrollment->student_id,
                    'name' => $enrollment->student_name,
                    'email' => $enrollment->student_email,
                    'course_name' => $enrollment->course_name,
                    'course_id' => $enrollment->course_id,
                    'progress' => $progress,
                    'completed_at' => $progress >= 100 ? $lastActivityAt : null,
                    'last_active' => $lastActive,
                    'quiz_submissions_count' => $studentQuizSubmissions->count(),
                    'average_score' => $averageScore
                ];
            });

            // Calculate statistics
            $totalStudents = $students->unique('id')->count();
            $totalCourses = $students->unique('course_id')->count();
            $averageProgress = $students->count() > 0 ? round($students->avg('progress'), 1) : 0;
            $activeStudents = $students
                ->filter(fn ($student) => $student['progress'] > 0 && $student['progress'] < 100)
                ->unique('id')
                ->count();

            return Inertia::render('teacher/students/page', [
                'students' => $students,
                'totalStudents' => $totalStudents,
                'totalCourses' => $totalCourses,
                'averageProgress' => $averageProgress,
                'activeStudents' => $activeStudents
            ]);
        } catch (Exception $e) {
            Log::error('Error fetching teacher students: ' . $e->getMessage());
            return Inertia::render('teacher/students/page', [
                'students' => [],
                'totalStudents' => 0,
                'totalCourses' => 0,
                'averageProgress' => 0,
                'activeStudents' => 0,
                'error' => 'Terjadi kesalahan teknis saat memuat data siswa.',
            ]);
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
            return Inertia::render('teacher/students/progress', [
                'studentProgress' => [],
                'courses' => [],
                'error' => 'Terjadi kesalahan teknis saat memuat progress siswa.',
            ]);
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
            $quizCompletedSubLookup = QuizSubmission::query()
                ->where('user_id', $student->id)
                ->where('course_id', $course->id)
                ->join('course_contents', 'quiz_submissions.quiz_content_id', '=', 'course_contents.id')
                ->pluck('course_contents.sub_pembahasan_id')
                ->filter()
                ->map(fn ($id) => (int) $id)
                ->unique()
                ->flip();

            foreach ($course->sub_pembahasan as $sub) {
                foreach ($sub->contents as $content) {
                    // Only count content that has a valid type
                    if (in_array($content->type, ['video', 'pdf', 'quiz'])) {
                        // Get the actual progress_per_subbab value
                        $progressValue = (int) (ProgressCourse::where('id_siswa', $student->id)
                            ->where('id_kursus', $course->id)
                            ->where('id_sub_pembahasan', $sub->id)
                            ->max('progress_per_subbab') ?? 0);

                        if ($quizCompletedSubLookup->has((int) $sub->id)) {
                            $progressValue = max($progressValue, 3);
                        }

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
