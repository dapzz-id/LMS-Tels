<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Kursus;
use App\Models\User;
use App\Models\QuizSubmission;
use App\Models\ProgressCourse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TeacherStudentGradesController extends Controller
{
    public function index(Request $request)
    {
        try {
            $teacherId = auth()->id();

            // Get all courses created by the teacher
            $courses = Kursus::where('teacher_id', $teacherId)
                ->with(['mapel:id,nama_mapel'])
                ->select(['id', 'id_mapel', 'judul_kursus', 'teacher_id'])
                ->get();

            // Get quiz submissions for teacher's courses with proper column names
            $query = QuizSubmission::with(['user', 'course', 'quizContent'])
                ->select([
                    'quiz_submissions.id',
                    'quiz_submissions.user_id',
                    'quiz_submissions.course_id',
                    'quiz_submissions.quiz_content_id',
                    'quiz_submissions.score',
                    'quiz_submissions.submitted_at',
                    'quiz_submissions.created_at',
                    'quiz_submissions.updated_at',
                    'users.nama_lengkap as student_name',
                    'users.email as student_email',
                    'kursus.judul_kursus as course_name',
                    'course_contents.title as quiz_title',
                    'course_contents.quiz_data'
                ])
                ->join('users', 'quiz_submissions.user_id', '=', 'users.id')
                ->join('kursus', 'quiz_submissions.course_id', '=', 'kursus.id')
                ->join('course_contents', 'quiz_submissions.quiz_content_id', '=', 'course_contents.id')
                ->where('course_contents.type', 'quiz')
                ->where('kursus.teacher_id', $teacherId);

            // Apply filters
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('users.nama_lengkap', 'like', "%{$search}%")
                      ->orWhere('users.email', 'like', "%{$search}%")
                      ->orWhere('kursus.judul_kursus', 'like', "%{$search}%")
                      ->orWhere('course_contents.title', 'like', "%{$search}%");
                });
            }

            if ($request->filled('course')) {
                $query->where('quiz_submissions.course_id', $request->course);
            }

            if ($request->filled('status')) {
                // Status filtering will be handled in the frontend for now
                // as we need to calculate percentages to determine grade ranges
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'submitted_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $submissions = $query->paginate(20);

            // Calculate statistics for teacher's courses only
            $totalSubmissions = QuizSubmission::join('kursus', 'quiz_submissions.course_id', '=', 'kursus.id')
                ->where('kursus.teacher_id', $teacherId)
                ->count();

            $totalStudents = QuizSubmission::join('kursus', 'quiz_submissions.course_id', '=', 'kursus.id')
                ->where('kursus.teacher_id', $teacherId)
                ->distinct('quiz_submissions.user_id')
                ->count();

            $totalCourses = $courses->count();

            // Calculate average score for teacher's courses
            $allSubmissions = QuizSubmission::with('quizContent')
                ->join('kursus', 'quiz_submissions.course_id', '=', 'kursus.id')
                ->where('kursus.teacher_id', $teacherId)
                ->get();

            $totalScore = 0;
            $totalQuestions = 0;
            $validSubmissions = 0;

            foreach ($allSubmissions as $submission) {
                if ($submission->quizContent && $submission->quizContent->quiz_data) {
                    $quizData = json_decode($submission->quizContent->quiz_data, true);
                    if (is_array($quizData) && count($quizData) > 0) {
                        $totalQuestions += count($quizData);
                        $totalScore += $submission->score;
                        $validSubmissions++;
                    }
                }
            }

            // Calculate average score as percentage
            $averageScore = $totalQuestions > 0 ? ($totalScore / $totalQuestions) * 100 : 0;

            // Get grade distribution for teacher's courses
            $gradeDistribution = [];
            $gradeCounts = ['A (90-100)' => 0, 'B (80-89)' => 0, 'C (70-79)' => 0, 'D (60-69)' => 0, 'F (0-59)' => 0];

            foreach ($allSubmissions as $submission) {
                if ($submission->quizContent && $submission->quizContent->quiz_data) {
                    $quizData = json_decode($submission->quizContent->quiz_data, true);
                    if (is_array($quizData) && count($quizData) > 0) {
                        $percentage = ($submission->score / count($quizData)) * 100;

                        if ($percentage >= 90) $gradeCounts['A (90-100)']++;
                        elseif ($percentage >= 80) $gradeCounts['B (80-89)']++;
                        elseif ($percentage >= 70) $gradeCounts['C (70-79)']++;
                        elseif ($percentage >= 60) $gradeCounts['D (60-69)']++;
                        else $gradeCounts['F (0-59)']++;
                    }
                }
            }

            foreach ($gradeCounts as $grade => $count) {
                if ($count > 0) {
                    $gradeDistribution[] = ['grade_range' => $grade, 'count' => $count];
                }
            }

            // Get enrolled students data for teacher's courses with progress information
            $enrolledStudents = DB::table('siswa_kursus')
                ->join('users', 'siswa_kursus.id_siswa', '=', 'users.id')
                ->join('kursus', 'siswa_kursus.id_kursus', '=', 'kursus.id')
                ->leftJoin('progress_kursus', function($join) {
                    $join->on('siswa_kursus.id_siswa', '=', 'progress_kursus.id_siswa')
                         ->on('siswa_kursus.id_kursus', '=', 'progress_kursus.id_kursus');
                })
                ->where('kursus.teacher_id', $teacherId)
                ->select([
                    'users.id as student_id',
                    'users.nama_lengkap as student_name',
                    'users.email as student_email',
                    'kursus.id as course_id',
                    'kursus.judul_kursus as course_name',
                    'kursus.id_mapel',
                    'progress_kursus.status as progress_status',
                    'progress_kursus.progress_per_subbab'
                ])
                ->get();

            // Group data by course
            $courseData = $courses->map(function ($course) use ($enrolledStudents, $submissions) {
                $courseStudents = $enrolledStudents->where('course_id', $course->id);
                $courseSubmissions = $submissions->where('course_id', $course->id);

                return [
                    'id' => $course->id,
                    'judul_kursus' => $course->judul_kursus,
                    'mapel' => $course->mapel ? [
                        'id' => $course->mapel->id,
                        'nama_mapel' => $course->mapel->nama_mapel
                    ] : null,
                    'enrolled_students' => $courseStudents->count(),
                    'students' => $courseStudents->map(function ($student) use ($courseSubmissions) {
                        $studentSubmissions = $courseSubmissions->where('user_id', $student->student_id);

                        // Calculate progress percentage based on status
                        $progressPercentage = 0;
                        $isCompleted = false;

                        if ($student->progress_status) {
                            switch ($student->progress_status) {
                                case 'belum dimulai':
                                    $progressPercentage = 0;
                                    break;
                                case 'sedang berlangsung':
                                    $progressPercentage = 50; // Default to 50% for in progress
                                    break;
                                case 'selesai':
                                    $progressPercentage = 100;
                                    $isCompleted = true;
                                    break;
                            }
                        }

                        return [
                            'id' => $student->student_id,
                            'name' => $student->student_name,
                            'email' => $student->student_email,
                            'enrollment_progress' => $progressPercentage,
                            'enrollment_completed' => $isCompleted,
                            'quiz_submissions' => $studentSubmissions->values(),
                            'average_quiz_score' => $studentSubmissions->count() > 0
                                ? round($studentSubmissions->avg('score'), 2)
                                : 0
                        ];
                    })->values()
                ];
            });

            // Get courses for filter dropdown (only teacher's courses)
            $coursesForFilter = Kursus::where('teacher_id', $teacherId)
                ->select('id', 'judul_kursus')
                ->orderBy('judul_kursus')
                ->get();

            return Inertia::render('teacher/student-grades/page', [
                'submissions' => $submissions,
                'courses' => $coursesForFilter,
                'totalSubmissions' => $totalSubmissions,
                'totalStudents' => $totalStudents,
                'totalCourses' => $totalCourses,
                'averageScore' => round($averageScore, 2),
                'gradeDistribution' => $gradeDistribution,
                'filters' => [
                    'search' => $request->search,
                    'course' => $request->course,
                    'status' => $request->status,
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching teacher student grades: ' . $e->getMessage());
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $teacherId = auth()->id();

            $submission = QuizSubmission::with(['user', 'course', 'quizContent'])
                ->join('kursus', 'quiz_submissions.course_id', '=', 'kursus.id')
                ->where('kursus.teacher_id', $teacherId)
                ->where('quiz_submissions.id', $id)
                ->first();

            if (!$submission) {
                abort(404, 'Submission not found or you do not have access to it.');
            }

            // Debug: Log the submission data
            \Log::info('Teacher show submission data:', [
                'id' => $submission->id,
                'user' => $submission->user ? $submission->user->nama_lengkap : 'No user',
                'course' => $submission->course ? $submission->course->judul_kursus : 'No course',
                'quizContent' => $submission->quizContent ? $submission->quizContent->title : 'No quiz content',
                'quizContent_id' => $submission->quiz_content_id,
            ]);

            // Parse quiz data to get questions and answers - handle double-escaped JSON
            $quizData = [];
            $totalQuestions = 0;

            if ($submission->quizContent && $submission->quizContent->quiz_data) {
                $quizDataString = $submission->quizContent->quiz_data;
                if (is_string($quizDataString) && str_starts_with($quizDataString, '"')) {
                    $quizDataString = json_decode($quizDataString, true);
                }
                $quizData = json_decode($quizDataString, true);
                $totalQuestions = is_array($quizData) ? count($quizData) : 0;
            }

            $studentAnswers = $submission->answers ?? [];

            $detailedResults = [];
            if (is_array($quizData)) {
                foreach ($quizData as $index => $question) {
                    $studentAnswer = $studentAnswers[$index] ?? null;
                    $isCorrect = $studentAnswer === $question['correctAnswer'];

                    $detailedResults[] = [
                        'question' => $question['question'],
                        'options' => $question['options'],
                        'correct_answer' => $question['correctAnswer'],
                        'student_answer' => $studentAnswer,
                        'is_correct' => $isCorrect
                    ];
                }
            }

            // Add total_questions to submission data
            $submission->total_questions = $totalQuestions;

            return Inertia::render('teacher/student-grades/show', [
                'submission' => $submission,
                'detailedResults' => $detailedResults
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching submission details: ' . $e->getMessage());
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    private function calculateGrade($percentage)
    {
        if ($percentage >= 90) return 'A';
        if ($percentage >= 80) return 'B';
        if ($percentage >= 70) return 'C';
        if ($percentage >= 60) return 'D';
        return 'F';
    }
}
