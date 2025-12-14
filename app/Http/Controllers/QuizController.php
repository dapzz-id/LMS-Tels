<?php

namespace App\Http\Controllers;

use App\Models\CourseContent;
use App\Models\QuizSubmission;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class QuizController extends Controller
{
    // Always render the Inertia UI page for quiz routes
    public function show(Request $request, $courseId, $id)
    {
        try {
            $quiz = CourseContent::where('id', $id)
                ->where('type', 'quiz')
                ->first();

            if (!$quiz) {
                return Inertia::render('dashboard/courses/[id]/quiz/page', [
                    'error' => 'Quiz not found',
                    'quiz' => null,
                    'id' => $id,
                    'courseId' => $courseId,
                ]);
            }

            // Check if one submission only is enabled and user has already taken the quiz
            if ($quiz->one_submission_only) {
                $existingSubmission = QuizSubmission::where('user_id', auth()->id())
                    ->where('quiz_content_id', $quiz->id)
                    ->first();

                if ($existingSubmission) {
                    return Inertia::render('dashboard/courses/[id]/quiz/page', [
                        'error' => 'You have already taken this quiz and cannot retake it.',
                        'quiz' => null,
                        'id' => $id,
                        'courseId' => $courseId,
                        'existing_submission' => $existingSubmission,
                    ]);
                }
            }

            // Transform quiz_data to match expected frontend structure
            $processedData = $this->processQuizData($quiz->quiz_data);

            $questions = [];
            foreach ($processedData['questions'] as $index => $q) {
                $questions[] = [
                    'id' => $index + 1,
                    'question' => $q['question'] ?? '',
                    'options' => $q['options'] ?? ['', '', '', ''],
                    'correct_answer' => $q['correctAnswer'] ?? 0,
                    'explanation' => $q['explanation'] ?? '',
                    'points' => $q['points'] ?? 10,
                    'timeLimit' => $q['timeLimit'] ?? null,
                    'imageUrl' => $q['imageUrl'] ?? null, // Keep this line for image support
                    'optionImages' => $q['optionImages'] ?? null, // Add this line for option images support
                ];
            }

            // Log the questions data for debugging
            Log::info('Questions data being sent to frontend:', [
                'questions' => $questions,
                'processedQuestions' => $processedData['questions']
            ]);

            // Add specific logging for optionImages
            foreach ($questions as $index => $question) {
                Log::info("Question {$index} optionImages:", [
                    'optionImages' => $question['optionImages'] ?? null,
                    'hasOptionImages' => isset($question['optionImages'])
                ]);
            }

            $quizPageData = [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'time_limit' => $processedData['timeLimit'],
                'passing_score' => $processedData['passingScore'],
                'questions' => $questions,
                'one_submission_only' => $quiz->one_submission_only,
                'show_grades' => $quiz->show_grades,
            ];

            // Log the final quiz data being sent to frontend
            Log::info('Final quiz data sent to frontend:', [
                'quizPageData' => $quizPageData,
                'processedData' => $processedData
            ]);

            // Log the quiz data being sent to frontend for debugging
            Log::info('Quiz data being sent to frontend:', [
                'quizPageData' => $quizPageData,
                'courseId' => $courseId,
                'routeCourseId' => $courseId,
                'sessionCourseId' => session('currentCourseId'),
                'rawQuizData' => $quiz->quiz_data
            ]);

            return Inertia::render('dashboard/courses/[id]/quiz/page', [
                'quiz' => $quizPageData,
                'error' => null,
                'id' => $id,
                'courseId' => $courseId,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in QuizController@show: ' . $e->getMessage());
            return Inertia::render('dashboard/courses/[id]/quiz/page', [
                'error' => 'Error fetching quiz: ' . $e->getMessage(),
                'quiz' => null,
                'id' => $id,
                'courseId' => $courseId,
            ]);
        }
    }

    /**
     * Validate and process quiz data
     */
    private function processQuizData($quizData)
    {
        // Handle string data by decoding it
        if (is_string($quizData)) {
            $decodedData = json_decode($quizData, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $quizData = $decodedData;
            } else {
                Log::error('Failed to decode quiz data JSON: ' . json_last_error_msg());
                return [
                    'questions' => [],
                    'timeLimit' => 30,
                    'passingScore' => 70,
                    'isValid' => false
                ];
            }
        }

        // If it's not an array at this point, it's invalid
        if (!is_array($quizData)) {
            Log::warning('Quiz data is not an array:', ['quizData' => $quizData]);
            return [
                'questions' => [],
                'timeLimit' => 30,
                'passingScore' => 70,
                'isValid' => false
            ];
        }

        // Handle the correct structure with timeLimit, passingScore, and questions
        if (isset($quizData['questions']) && is_array($quizData['questions'])) {
            $questions = $quizData['questions'];
            $timeLimit = $quizData['timeLimit'] ?? 30;
            $passingScore = $quizData['passingScore'] ?? 70;

            // Log the extracted values for debugging
            Log::info('Extracted quiz values:', [
                'timeLimit' => $timeLimit,
                'passingScore' => $passingScore,
                'questionsCount' => count($questions),
                'rawQuizData' => $quizData
            ]);

            // Ensure each question has the required fields
            $processedQuestions = [];
            foreach ($questions as $question) {
                $processedQuestions[] = [
                    'question' => $question['question'] ?? '',
                    'options' => $question['options'] ?? ['', '', '', ''],
                    'correctAnswer' => $question['correctAnswer'] ?? 0,
                    'explanation' => $question['explanation'] ?? '',
                    'points' => $question['points'] ?? 10,
                    'timeLimit' => $question['timeLimit'] ?? null,
                    'imageUrl' => $question['imageUrl'] ?? null, // Keep this line for image support
                    'optionImages' => $question['optionImages'] ?? null, // Add this line for option images support
                ];
            }

            return [
                'questions' => $processedQuestions,
                'timeLimit' => $timeLimit,
                'passingScore' => $passingScore,
                'isValid' => true
            ];
        }

        // Handle old structure (backward compatibility) - array of questions directly
        if (is_array($quizData) && !isset($quizData['questions']) && isset($quizData[0]['question'])) {
            $questions = $quizData;

            // Ensure each question has the required fields
            $processedQuestions = [];
            foreach ($questions as $question) {
                $processedQuestions[] = [
                    'question' => $question['question'] ?? '',
                    'options' => $question['options'] ?? ['', '', '', ''],
                    'correctAnswer' => $question['correctAnswer'] ?? 0,
                    'explanation' => $question['explanation'] ?? '',
                    'points' => $question['points'] ?? 10,
                    'timeLimit' => $question['timeLimit'] ?? null,
                    'imageUrl' => $question['imageUrl'] ?? null, // Keep this line for image support
                    'optionImages' => $question['optionImages'] ?? null, // Add this line for option images support
                ];
            }

            return [
                'questions' => $processedQuestions,
                'timeLimit' => 30,
                'passingScore' => 70,
                'isValid' => true
            ];
        }

        // Handle single question object
        if (is_array($quizData) && isset($quizData['question'])) {
            $questions = [$quizData];

            // Ensure the question has the required fields
            $processedQuestions = [];
            foreach ($questions as $question) {
                $processedQuestions[] = [
                    'question' => $question['question'] ?? '',
                    'options' => $question['options'] ?? ['', '', '', ''],
                    'correctAnswer' => $question['correctAnswer'] ?? 0,
                    'explanation' => $question['explanation'] ?? '',
                    'points' => $question['points'] ?? 10,
                    'timeLimit' => $question['timeLimit'] ?? null,
                    'imageUrl' => $question['imageUrl'] ?? null, // Keep this line for image support
                    'optionImages' => $question['optionImages'] ?? null, // Add this line for option images support
                ];
            }

            return [
                'questions' => $processedQuestions,
                'timeLimit' => 30,
                'passingScore' => 70,
                'isValid' => true
            ];
        }

        // If we get here, the data structure is not recognized
        Log::warning('Unrecognized quiz data structure:', ['quizData' => $quizData]);
        return [
            'questions' => [],
            'timeLimit' => 30,
            'passingScore' => 70,
            'isValid' => false
        ];
    }

    // Submit quiz answers, calculate score, and store submission
    public function submit(Request $request, $id)
    {
        try {
            $quiz = CourseContent::where('id', $id)
                ->where('type', 'quiz')
                ->first();

            if (!$quiz) {
                return response()->json(['message' => 'Quiz not found'], 404);
            }

            $validated = $request->validate([
                'answers' => 'required|array',
                'time_taken' => 'nullable|integer|min:0',
                'course_id' => 'required|exists:kursus,id',
            ]);

            // Process quiz data using helper function
            $processedData = $this->processQuizData($quiz->quiz_data);

            if (!$processedData['isValid']) {
                return response()->json(['message' => 'Invalid quiz data'], 400);
            }

            $userAnswers = $validated['answers'];
            $correctAnswers = 0;
            $totalQuestions = count($processedData['questions']);
            $questions = $processedData['questions'];
            $passingScore = $processedData['passingScore'];
            $timeLimit = $processedData['timeLimit'];

            // Grade the quiz using simple percentage calculation
            $questionResults = [];
            foreach ($questions as $index => $question) {
                $isCorrect = isset($userAnswers[$index]) && $userAnswers[$index] == $question['correctAnswer'];

                if ($isCorrect) {
                    $correctAnswers++;
                }

                $questionResults[] = [
                    'question_index' => $index,
                    'question' => $question['question'],
                    'user_answer' => $userAnswers[$index] ?? null,
                    'correct_answer' => $question['correctAnswer'],
                    'is_correct' => $isCorrect
                ];
            }

            // Calculate percentage score: (correct_answers / total_questions) * 100
            $percentageScore = $totalQuestions > 0 ? ($correctAnswers / $totalQuestions) * 100 : 0;

            // Determine if passed
            $passed = $percentageScore >= $passingScore;

            // Store the percentage score
            $score = round($percentageScore, 2);

            // Store quiz submission
            $submission = QuizSubmission::create([
                'user_id' => auth()->id(),
                'course_id' => $validated['course_id'],
                'quiz_content_id' => $quiz->id,
                'answers' => $userAnswers, // store as array
                'score' => $score, // store percentage score
                'time_taken' => $request->time_taken ?? null, // store time taken in seconds
                'submitted_at' => now(),
            ]);

            // Check if the user has completed the course after this quiz
            $userId = auth()->id();
            $courseId = $validated['course_id'];

            // Check if user is now eligible for a certificate (but don't auto-issue)
            $isEligible = Certificate::isEligibleForCertificate($userId, $courseId);

            if ($isEligible) {
                Log::info('User ' . $userId . ' is now eligible for certificate for course ' . $courseId);
            }

            return response()->json([
                'message' => 'Quiz submitted successfully',
                'score' => $score,
                'correct_answers' => $correctAnswers,
                'total_questions' => $totalQuestions,
                'percentage' => $percentageScore,
                'passed' => $passed,
                'passing_score' => $passingScore,
                'question_results' => $questionResults,
                'certificate_eligible' => $isEligible // Send eligibility status to frontend
            ]);
        } catch (\Exception $e) {
            Log::error('Error in QuizController@submit: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error submitting quiz',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
