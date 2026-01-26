<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuizSubmission;
use App\Models\User;
use App\Models\Kursus;
use App\Models\CourseContent;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\FacadesLog;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GradesAdminController extends Controller
{
        public function index(Request $request)
    {
        try {
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
                ->where('course_contents.type', 'quiz');

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
                // We'll apply status filtering after getting the data since we need to calculate percentages
                // This will be handled in the frontend for now
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'submitted_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $submissions = $query->paginate(20);

            // Debug: Log the first submission to see what data we're getting
            Log::info('Total submissions found: ' . $submissions->count());
            if ($submissions->count() > 0) {
                $firstSubmission = $submissions->first();
                Log::info('First submission data:', [
                    'id' => $firstSubmission->id,
                    'score' => $firstSubmission->score,
                    'student_name' => $firstSubmission->student_name,
                    'course_name' => $firstSubmission->course_name,
                    'quiz_data' => $firstSubmission->quiz_data,
                    'quiz_content_id' => $firstSubmission->quiz_content_id,
                ]);

                // Test parsing quiz_data
                if ($firstSubmission->quiz_data) {
                    $quizData = json_decode($firstSubmission->quiz_data, true);
                    Log::info('Parsed quiz data:', [
                        'is_array' => is_array($quizData),
                        'count' => is_array($quizData) ? count($quizData) : 0,
                        'data' => $quizData
                    ]);
                }

                // Test relationship
                if ($firstSubmission->quizContent) {
                    Log::info('QuizContent relationship data:', [
                        'id' => $firstSubmission->quizContent->id,
                        'title' => $firstSubmission->quizContent->title,
                        'quiz_data' => $firstSubmission->quizContent->quiz_data,
                        'type' => $firstSubmission->quizContent->type,
                    ]);
                } else {
                    Log::info('No quizContent relationship found');
                }
            } else {
                Log::info('No submissions found in database');
            }

                        // Calculate statistics
            $totalSubmissions = QuizSubmission::count();
            $totalStudents = QuizSubmission::distinct('user_id')->count();
            $totalCourses = QuizSubmission::distinct('course_id')->count();

            // Calculate average score - use the actual score from quiz_submissions
            $allSubmissions = QuizSubmission::with('quizContent')->get();
            $totalScore = 0;
            $totalQuestions = 0;
            $validSubmissions = 0;

            foreach ($allSubmissions as $submission) {
                if ($submission->quizContent && $submission->quizContent->quiz_data) {
                    $quizData = json_decode($submission->quizContent->quiz_data, true);
                    if (is_array($quizData) && count($quizData) > 0) {
                        $totalQuestions += count($quizData);
                        $totalScore += $submission->score; // This is now the number of correct answers
                        $validSubmissions++;
                    }
                }
            }

            // Calculate average score as percentage
            $averageScore = $totalQuestions > 0 ? ($totalScore / $totalQuestions) * 100 : 0;

            // Get grade distribution by calculating from quiz data
            $gradeDistribution = [];
            $gradeCounts = ['A (90-100)' => 0, 'B (80-89)' => 0, 'C (70-79)' => 0, 'D (60-69)' => 0, 'F (0-59)' => 0];

            foreach ($allSubmissions as $submission) {
                if ($submission->quizContent && $submission->quizContent->quiz_data) {
                    $quizData = json_decode($submission->quizContent->quiz_data, true);
                    if (is_array($quizData) && count($quizData) > 0) {
                        $percentage = ($submission->score / count($quizData)) * 100; // score is now correct answers count

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

            // Get courses for filter
            $courses = Kursus::select('id', 'judul_kursus')->orderBy('judul_kursus')->get();



            // Debug: Log what we're sending to frontend
            Log::info('Sending to frontend:', [
                'submissions_count' => $submissions->count(),
                'first_submission_keys' => $submissions->count() > 0 ? array_keys($submissions->first()->toArray()) : [],
                'first_submission_quiz_data' => $submissions->count() > 0 ? $submissions->first()->quiz_data : null,
            ]);

            // Debug: Check raw data from database
            if ($submissions->count() > 0) {
                $firstSubmissionId = $submissions->first()->id;
                $rawData = DB::table('quiz_submissions')
                    ->join('course_contents', 'quiz_submissions.quiz_content_id', '=', 'course_contents.id')
                    ->where('quiz_submissions.id', $firstSubmissionId)
                    ->select('quiz_submissions.*', 'course_contents.quiz_data', 'course_contents.type')
                    ->first();
                Log::info('Raw database data:', [
                    'submission_id' => $firstSubmissionId,
                    'quiz_data' => $rawData->quiz_data ?? null,
                    'type' => $rawData->type ?? null,
                ]);
            }

            return Inertia::render('admin/grades/page', [
                'submissions' => $submissions,
                'totalSubmissions' => $totalSubmissions,
                'totalStudents' => $totalStudents,
                'totalCourses' => $totalCourses,
                'averageScore' => round($averageScore, 2),
                'gradeDistribution' => $gradeDistribution,
                'courses' => $courses,
                'filters' => [
                    'search' => $request->search,
                    'course' => $request->course,
                    'status' => $request->status,
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching admin grades: ' . $e->getMessage());
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $submission = QuizSubmission::with(['user', 'course', 'quizContent'])
                ->findOrFail($id);

            // Debug: Log the submission data
            Log::info('Show submission data:', [
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

            return Inertia::render('admin/grades/show', [
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

    public function export(Request $request)
    {
        try {
            $query = QuizSubmission::with(['user', 'course', 'quizContent'])
                ->select([
                    'quiz_submissions.id',
                    'quiz_submissions.user_id',
                    'quiz_submissions.course_id',
                    'quiz_submissions.quiz_content_id',
                    'quiz_submissions.score',
                    'quiz_submissions.submitted_at',
                    'users.nama_lengkap as student_name',
                    'users.email as student_email',
                    'kursus.judul_kursus as course_name',
                    'course_contents.title as quiz_title',
                    'course_contents.quiz_data'
                ])
                ->join('users', 'quiz_submissions.user_id', '=', 'users.id')
                ->join('kursus', 'quiz_submissions.course_id', '=', 'kursus.id')
                ->join('course_contents', 'quiz_submissions.quiz_content_id', '=', 'course_contents.id')
                ->where('course_contents.type', 'quiz');

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

            $submissions = $query->get();

            // Create CSV content
            $csvData = "Student Name,Email,Course,Quiz,Score,Total Questions,Percentage,Grade,Submitted At\n";

            foreach ($submissions as $submission) {
                // Get total questions from quiz data
                $totalQuestions = 0;
                if ($submission->quizContent && $submission->quizContent->quiz_data) {
                    $quizData = json_decode($submission->quizContent->quiz_data, true);
                    $totalQuestions = is_array($quizData) ? count($quizData) : 0;
                }

                $percentage = $totalQuestions > 0 ? ($submission->score / $totalQuestions) * 100 : 0;
                $grade = $this->calculateGrade($percentage);

                $csvData .= sprintf(
                    "\"%s\",\"%s\",\"%s\",\"%s\",%d,%d,%.2f%%,%s,\"%s\"\n",
                    $submission->student_name,
                    $submission->student_email,
                    $submission->course_name,
                    $submission->quiz_title,
                    $submission->score,
                    $totalQuestions,
                    $percentage,
                    $grade,
                    $submission->submitted_at->format('Y-m-d H:i:s')
                );
            }

            // Return CSV download
            return response($csvData)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="grades-export.csv"');

        } catch (Exception $e) {
            Log::error('Error exporting grades: ' . $e->getMessage());
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
