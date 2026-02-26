<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Kursus;
use App\Models\ProgressCourse;
use App\Models\QuizSubmission;
use App\Models\StudentActivity;
use App\Models\CourseContent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentProgressController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $selectedClass = $request->get('class', 'all');
        $sortBy = $request->get('sort_by', 'nama_lengkap');
        $sortOrder = $request->get('sort_order', 'asc');

        // Get students with their progress data
        $studentsQuery = User::where('tipe_user', 'siswa')
            ->with(['progressKursus.kursus', 'quizSubmissions.quizContent.kursus']);

        // Apply search filter
        if ($search) {
            $studentsQuery->where(function ($query) use ($search) {
                $query->where('nama_lengkap', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('class', 'like', "%{$search}%");
            });
        }

        // Apply class filter
        if ($selectedClass !== 'all') {
            $studentsQuery->where('class', $selectedClass);
        }

        // Apply sorting
        $allowedSortFields = ['nama_lengkap', 'email', 'class', 'created_at'];
        $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'nama_lengkap';
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'asc';

        $students = $studentsQuery->orderBy($sortBy, $sortOrder)
            ->paginate(15)
            ->withQueryString();

        // Get available classes for filtering
        $availableClasses = User::where('tipe_user', 'siswa')
            ->whereNotNull('class')
            ->where('class', '!=', '')
            ->distinct()
            ->pluck('class')
            ->filter(function($class) {
                return !empty(trim($class));
            })
            ->sort()
            ->values()
            ->toArray(); // Convert to array

        // Process students to add progress statistics
        $processedStudents = [];
        foreach ($students as $student) {
            // Add progress statistics to each student
            $progressStats = $this->getStudentProgressStats($student);

            // Convert student to array and add progress stats
            $studentArray = $student->toArray();
            $studentArray['progress_stats'] = $progressStats;

            $processedStudents[] = $studentArray;
        }

        // Ensure we're returning the data in the correct format
        $studentsData = [
            'data' => $processedStudents,
            'links' => $students->linkCollection()->toArray(),
            'meta' => [
                'current_page' => $students->currentPage(),
                'first_page_url' => $students->url(1),
                'from' => $students->firstItem(),
                'last_page' => $students->lastPage(),
                'last_page_url' => $students->url($students->lastPage()),
                'next_page_url' => $students->nextPageUrl(),
                'path' => $students->path(),
                'per_page' => $students->perPage(),
                'prev_page_url' => $students->previousPageUrl(),
                'to' => $students->lastItem(),
                'total' => $students->total(),
            ]
        ];

        return Inertia::render('admin/student-progress/page', [
            'students' => $studentsData,
            'filters' => [
                'search' => $search,
                'selectedClass' => $selectedClass,
                'sortBy' => $sortBy,
                'sortOrder' => $sortOrder,
                'availableClasses' => $availableClasses ?? []
            ]
        ]);
    }

    public function show($studentId)
    {
        try {
            $student = User::where('id', $studentId)
                ->where('tipe_user', 'siswa')
                ->with([])
                ->firstOrFail();

            // Get all courses with their contents
            $courses = Kursus::with(['contents', 'sub_pembahasan'])
                ->orderBy('judul_kursus')
                ->get();

            // Get student's progress for each course
            $courseProgress = [];
            foreach ($courses as $course) {
                $courseProgress[] = $this->getCourseProgressForStudent($student, $course);
            }

            // Debug information
            \Log::info('Student progress data for student ID: ' . $studentId, [
                'course_progress_count' => count($courseProgress),
                'course_progress_details' => array_map(function($cp) {
                    return [
                        'course_id' => $cp['course']['id'] ?? 'unknown',
                        'total_content' => $cp['total_content'] ?? 0,
                        'completed_content' => $cp['completed_content'] ?? 0,
                        'progress_percentage' => $cp['progress_percentage'] ?? 0
                    ];
                }, $courseProgress)
            ]);

            // Get recent activity
            $recentActivity = StudentActivity::where('user_id', $studentId)
                ->with(['course', 'quiz'])
                ->orderBy('last_activity', 'desc')
                ->take(20)
                ->get()
                ->toArray(); // Convert to array

            return Inertia::render('admin/student-progress/[id]/page', [
                'student' => $student->toArray(), // Convert to array
                'courseProgress' => $courseProgress,
                'recentActivity' => $recentActivity
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in show method: ' . $e->getMessage(), [
                'student_id' => $studentId ?? 'unknown'
            ]);

            // Return empty data if student not found or any other error
            return Inertia::render('admin/student-progress/[id]/page', [
                'student' => null,
                'courseProgress' => [],
                'recentActivity' => []
            ]);
        }
    }

    private function getStudentProgressStats($student)
    {
        try {
            // Total courses assigned to student (based on class)
            $totalCourses = Kursus::whereJsonContains('class', $student->class)
                ->count();

            // Courses with progress (any content completed or quiz taken)
            $progressedCourses = $this->getCoursesWithProgress($student);

            // Completed courses (all required content completed)
            $completedCourses = $this->getCompletedCoursesCount($student);

            // Total quizzes taken
            $totalQuizzes = QuizSubmission::where('user_id', $student->id)
                ->count();

            // Passed quizzes
            $passedQuizzes = QuizSubmission::where('user_id', $student->id)
                ->where('score', '>=', 70) // Assuming 70% is passing
                ->count();

            return [
                'total_courses' => $totalCourses,
                'progressed_courses' => $progressedCourses,
                'completed_courses' => $completedCourses,
                'completion_rate' => $totalCourses > 0 ? round(($completedCourses / $totalCourses) * 100, 1) : 0,
                'total_quizzes' => $totalQuizzes,
                'passed_quizzes' => $passedQuizzes,
                'quiz_pass_rate' => $totalQuizzes > 0 ? round(($passedQuizzes / $totalQuizzes) * 100, 1) : 0
            ];
        } catch (\Exception $e) {
            // Return default stats if there's an error
            return [
                'total_courses' => 0,
                'progressed_courses' => 0,
                'completed_courses' => 0,
                'completion_rate' => 0,
                'total_quizzes' => 0,
                'passed_quizzes' => 0,
                'quiz_pass_rate' => 0
            ];
        }
    }

    private function getCoursesWithProgress($student)
    {
        try {
            // Get courses where student has any progress (content completed or quiz taken)
            $coursesWithContentProgress = ProgressCourse::where('id_siswa', $student->id)
                ->distinct('id_kursus')
                ->pluck('id_kursus');

            $coursesWithQuizProgress = QuizSubmission::where('user_id', $student->id)
                ->distinct('course_id')
                ->pluck('course_id');

            // Merge and count unique courses
            $allCoursesWithProgress = $coursesWithContentProgress->merge($coursesWithQuizProgress)->unique();

            return $allCoursesWithProgress->count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    private function getCourseProgressForStudent($student, $course)
    {
        try {
            // Get all content items for this course
            // Use already loaded contents if available, otherwise fetch from database
            $courseContents = $course->contents ?? CourseContent::where('kursus_id', $course->id)->get();

            // Count only valid content types
            $validContentTypes = ['video', 'pdf', 'quiz'];
            $totalContent = $courseContents->filter(function($content) use ($validContentTypes) {
                return in_array($content->type, $validContentTypes);
            })->count();

            // Get completed content items for this student
            // This now considers all types of content (video, PDF, quiz) that have been completed
            $completedContent = $this->getCompletedContentCount($student, $course);

            // Debug information
            \Log::info('Course progress calculation for course ID: ' . $course->id, [
                'student_id' => $student->id,
                'total_content' => $totalContent,
                'completed_content' => $completedContent
            ]);

            // Get quiz submissions for this course
            $quizSubmissions = QuizSubmission::where('user_id', $student->id)
                ->where('course_id', $course->id)
                ->with('quizContent')
                ->get()
                ->toArray(); // Convert to array

            // Calculate overall progress
            $progressPercentage = $totalContent > 0 ? round(($completedContent / $totalContent) * 100, 1) : 0;

            // Check if course is completed (all content completed)
            $isCompleted = $totalContent > 0 && $completedContent == $totalContent;

            \Log::info('Final course progress for course ID: ' . $course->id, [
                'student_id' => $student->id,
                'progress_percentage' => $progressPercentage,
                'is_completed' => $isCompleted
            ]);

            return [
                'course' => $course->toArray(), // Convert to array
                'total_content' => $totalContent,
                'completed_content' => $completedContent,
                'progress_percentage' => $progressPercentage,
                'is_completed' => $isCompleted,
                'quiz_submissions' => $quizSubmissions,
                'completion_status' => $this->getCompletionStatus($progressPercentage)
            ];
        } catch (\Exception $e) {
            \Log::error('Error in getCourseProgressForStudent: ' . $e->getMessage(), [
                'student_id' => $student->id ?? 'unknown',
                'course_id' => $course->id ?? 'unknown'
            ]);

            // Return default course progress if there's an error
            return [
                'course' => $course->toArray(),
                'total_content' => 0,
                'completed_content' => 0,
                'progress_percentage' => 0,
                'is_completed' => false,
                'quiz_submissions' => [],
                'completion_status' => 'not_started'
            ];
        }
    }

    /**
     * Get the count of completed content items for a student in a course
     * This method now properly counts video completions, PDF downloads, and quiz completions
     * using the progress_kursus table as the primary reference and actual progress_per_subbab values
     */
    private function getCompletedContentCount($student, $course)
    {
        try {
            // Get all content items for this course
            // Use already loaded contents if available, otherwise fetch from database
            $courseContents = $course->contents ?? CourseContent::where('kursus_id', $course->id)->get();

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

            foreach ($courseContents as $content) {
                // Only count content that has a valid type
                if (in_array($content->type, ['video', 'pdf', 'quiz'])) {
                    // Check if this content item has been completed based on its type
                    // Using progress_kursus table as the primary reference for all content types
                    // and using the actual progress_per_subbab integer values
                    $progressValue = 0;

                    // Get the actual progress_per_subbab value
                    $progressValue = (int) (ProgressCourse::where('id_siswa', $student->id)
                        ->where('id_kursus', $course->id)
                        ->where('id_sub_pembahasan', $content->sub_pembahasan_id)
                        ->max('progress_per_subbab') ?? 0);

                    if ($quizCompletedSubLookup->has((int) $content->sub_pembahasan_id)) {
                        $progressValue = max($progressValue, 3);
                    }

                    // Debug information
                    \Log::info('Progress check for content ID: ' . $content->id . ' (type: ' . $content->type . ')', [
                        'student_id' => $student->id,
                        'course_id' => $course->id,
                        'sub_pembahasan_id' => $content->sub_pembahasan_id,
                        'progress_value' => $progressValue,
                        'progress_record_exists' => $progressValue > 0
                    ]);

                    // Check if the progress value meets or exceeds the expected value for completion
                    // This handles the case where a higher progress value indicates completion of lower content types
                    $isCompleted = false;

                    // Map content types to minimum required progress_per_subbab values
                    $minRequiredProgressValues = [
                        'video' => 1,  // Video completion requires progress_per_subbab >= 1
                        'pdf' => 2,    // PDF download requires progress_per_subbab >= 2
                        'quiz' => 3    // Quiz completion requires progress_per_subbab >= 3
                    ];

                    $minRequiredValue = $minRequiredProgressValues[$content->type] ?? 0;
                    $isCompleted = ($progressValue >= $minRequiredValue);

                    \Log::info('Content completion check: ' . ($isCompleted ? 'COMPLETED' : 'NOT COMPLETED'), [
                        'content_type' => $content->type,
                        'min_required' => $minRequiredValue,
                        'actual' => $progressValue
                    ]);

                    if ($isCompleted) {
                        $completedCount++;
                        \Log::info('Content marked as completed, total completed count: ' . $completedCount);
                    }
                }
            }

            \Log::info('Final completed content count for course ID: ' . $course->id, [
                'student_id' => $student->id,
                'completed_count' => $completedCount
            ]);

            return $completedCount;
        } catch (\Exception $e) {
            \Log::error('Error in getCompletedContentCount: ' . $e->getMessage(), [
                'student_id' => $student->id ?? 'unknown',
                'course_id' => $course->id ?? 'unknown'
            ]);
            return 0;
        }
    }

    private function getCompletedCoursesCount($student)
    {
        try {
            // Get courses assigned to student's class
            $assignedCourses = Kursus::whereJsonContains('class', $student->class)
                ->pluck('id');

            $completedCount = 0;
            foreach ($assignedCourses as $courseId) {
                $totalContent = CourseContent::where('kursus_id', $courseId)->count();
                $completedContent = $this->getCompletedContentCount($student, Kursus::find($courseId));

                if ($totalContent > 0 && $completedContent == $totalContent) {
                    $completedCount++;
                }
            }

            return $completedCount;
        } catch (\Exception $e) {
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
