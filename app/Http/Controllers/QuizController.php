<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\CourseContent;
use App\Models\Kursus;
use App\Models\QuizSubmission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class QuizController extends Controller
{
    /**
     * Render quiz page. Supports routes:
     * - /quiz/{id}
     * - /dashboard/courses/{courseId}/quiz/{id}
     */
    public function show(Request $request, ...$params)
    {
        $courseId = null;
        $id = null;

        if (count($params) === 2) {
            [$courseId, $id] = $params;
        } elseif (count($params) === 1) {
            $id = $params[0];
            $courseId = $request->integer('course_id') ?: null;
        }

        try {
            $user = auth()->user();
            if (!$user) {
                return Inertia::render('dashboard/courses/[id]/quiz/page', [
                    'error' => 'Sesi Anda telah berakhir. Silakan login kembali.',
                    'quiz' => null,
                    'id' => $id,
                    'courseId' => $courseId,
                ])->toResponse($request)->setStatusCode(401);
            }

            $quizQuery = CourseContent::where('id', $id)
                ->where('type', 'quiz');

            if ($courseId !== null) {
                $quizQuery->where('kursus_id', $courseId);
            }

            $quiz = $quizQuery->first();

            if (!$quiz) {
                return Inertia::render('dashboard/courses/[id]/quiz/page', [
                    'error' => 'Quiz tidak ditemukan.',
                    'quiz' => null,
                    'id' => $id,
                    'courseId' => $courseId,
                ])->toResponse($request)->setStatusCode(404);
            }

            $resolvedCourseId = (int) ($courseId ?? $quiz->kursus_id);
            if (!$this->userCanAccessCourse($user, $resolvedCourseId)) {
                return Inertia::render('dashboard/courses/[id]/quiz/page', [
                    'error' => 'Anda tidak memiliki akses ke quiz ini.',
                    'quiz' => null,
                    'id' => $id,
                    'courseId' => $resolvedCourseId,
                ])->toResponse($request)->setStatusCode(403);
            }

            if ($quiz->one_submission_only) {
                $existingSubmission = QuizSubmission::where('user_id', $user->id)
                    ->where('quiz_content_id', $quiz->id)
                    ->latest('id')
                    ->first();

                if ($existingSubmission) {
                    return Inertia::render('dashboard/courses/[id]/quiz/page', [
                        'error' => 'Quiz ini hanya dapat dikerjakan sekali.',
                        'quiz' => null,
                        'id' => $id,
                        'courseId' => $resolvedCourseId,
                        'existing_submission' => $existingSubmission,
                    ]);
                }
            }

            $processedData = $this->processQuizData($quiz->quiz_data);
            $questions = [];

            foreach ($processedData['questions'] as $index => $question) {
                $questions[] = [
                    'id' => $index + 1,
                    'question' => $question['question'] ?? '',
                    'options' => $question['options'] ?? ['', '', '', ''],
                    'correct_answer' => (int) ($question['correctAnswer'] ?? 0),
                    'explanation' => $question['explanation'] ?? '',
                    'points' => (int) ($question['points'] ?? 10),
                    'timeLimit' => $question['timeLimit'] ?? null,
                    'imageUrl' => $question['imageUrl'] ?? null,
                    'optionImages' => $question['optionImages'] ?? null,
                ];
            }

            return Inertia::render('dashboard/courses/[id]/quiz/page', [
                'quiz' => [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'description' => $quiz->description,
                    'time_limit' => $processedData['timeLimit'],
                    'passing_score' => $processedData['passingScore'],
                    'questions' => $questions,
                    'one_submission_only' => (bool) $quiz->one_submission_only,
                    'show_grades' => (bool) $quiz->show_grades,
                ],
                'error' => null,
                'id' => $id,
                'courseId' => $resolvedCourseId,
            ]);
        } catch (\Throwable $e) {
            Log::error('Quiz show failed', ['error' => $e->getMessage()]);

            return Inertia::render('dashboard/courses/[id]/quiz/page', [
                'error' => 'Terjadi kesalahan saat memuat quiz.',
                'quiz' => null,
                'id' => $id,
                'courseId' => $courseId,
            ])->toResponse($request)->setStatusCode(500);
        }
    }

    /**
     * Validate and normalize quiz data structure.
     */
    private function processQuizData($quizData): array
    {
        if (is_string($quizData)) {
            $decoded = json_decode($quizData, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $quizData = $decoded;
            } else {
                Log::warning('Invalid quiz_data JSON format', [
                    'error' => json_last_error_msg(),
                ]);

                return [
                    'questions' => [],
                    'timeLimit' => 30,
                    'passingScore' => 70,
                    'isValid' => false,
                ];
            }
        }

        if (!is_array($quizData)) {
            return [
                'questions' => [],
                'timeLimit' => 30,
                'passingScore' => 70,
                'isValid' => false,
            ];
        }

        if (isset($quizData['questions']) && is_array($quizData['questions'])) {
            return [
                'questions' => $this->normalizeQuestions($quizData['questions']),
                'timeLimit' => (int) ($quizData['timeLimit'] ?? 30),
                'passingScore' => (int) ($quizData['passingScore'] ?? 70),
                'isValid' => true,
            ];
        }

        if (isset($quizData[0]['question'])) {
            return [
                'questions' => $this->normalizeQuestions($quizData),
                'timeLimit' => 30,
                'passingScore' => 70,
                'isValid' => true,
            ];
        }

        if (isset($quizData['question'])) {
            return [
                'questions' => $this->normalizeQuestions([$quizData]),
                'timeLimit' => 30,
                'passingScore' => 70,
                'isValid' => true,
            ];
        }

        return [
            'questions' => [],
            'timeLimit' => 30,
            'passingScore' => 70,
            'isValid' => false,
        ];
    }

    /**
     * @param array<int, mixed> $questions
     * @return array<int, array<string, mixed>>
     */
    private function normalizeQuestions(array $questions): array
    {
        $normalized = [];

        foreach ($questions as $question) {
            $normalized[] = [
                'question' => $question['question'] ?? '',
                'options' => $question['options'] ?? ['', '', '', ''],
                'correctAnswer' => (int) ($question['correctAnswer'] ?? 0),
                'explanation' => $question['explanation'] ?? '',
                'points' => (int) ($question['points'] ?? 10),
                'timeLimit' => isset($question['timeLimit']) ? (int) $question['timeLimit'] : null,
                'imageUrl' => $question['imageUrl'] ?? null,
                'optionImages' => $question['optionImages'] ?? null,
            ];
        }

        return $normalized;
    }

    public function submit(Request $request, $id)
    {
        try {
            $user = auth()->user();
            if (!$user || $user->tipe_user !== 'siswa') {
                return response()->json([
                    'message' => 'Hanya siswa yang dapat mengirim jawaban quiz.',
                ], 403);
            }

            $quiz = CourseContent::where('id', $id)
                ->where('type', 'quiz')
                ->first();

            if (!$quiz) {
                return response()->json(['message' => 'Quiz tidak ditemukan.'], 404);
            }

            $validated = $request->validate([
                'answers' => 'required|array',
                'time_taken' => 'nullable|integer|min:0',
                'course_id' => 'required|exists:kursus,id',
            ], [
                'answers.required' => 'Jawaban wajib diisi.',
                'answers.array' => 'Jawaban harus berupa array.',
                'time_taken.integer' => 'Waktu pengerjaan harus berupa angka.',
                'time_taken.min' => 'Waktu pengerjaan tidak boleh kurang dari 0.',
                'course_id.required' => 'Kursus wajib dipilih.',
                'course_id.exists' => 'Kursus tidak ditemukan.',
            ]);

            if ((int) $quiz->kursus_id !== (int) $validated['course_id']) {
                return response()->json([
                    'message' => 'Quiz tidak sesuai dengan kursus.',
                ], 422);
            }

            if (!$this->userCanAccessCourse($user, (int) $validated['course_id'])) {
                return response()->json([
                    'message' => 'Anda tidak memiliki akses ke kursus ini.',
                ], 403);
            }

            if ($quiz->one_submission_only) {
                $alreadySubmitted = QuizSubmission::where('user_id', $user->id)
                    ->where('quiz_content_id', $quiz->id)
                    ->exists();

                if ($alreadySubmitted) {
                    return response()->json([
                        'message' => 'Quiz ini hanya dapat dikerjakan sekali.',
                    ], 409);
                }
            }

            $processedData = $this->processQuizData($quiz->quiz_data);
            if (!$processedData['isValid']) {
                return response()->json(['message' => 'Data quiz tidak valid.'], 400);
            }

            $questions = $processedData['questions'];
            $totalQuestions = count($questions);

            if ($totalQuestions === 0) {
                return response()->json(['message' => 'Quiz tidak memiliki pertanyaan yang valid.'], 422);
            }

            $userAnswers = $validated['answers'];
            $correctAnswers = 0;
            $questionResults = [];

            foreach ($questions as $index => $question) {
                $userAnswer = isset($userAnswers[$index]) ? (int) $userAnswers[$index] : null;
                $correctAnswer = (int) ($question['correctAnswer'] ?? 0);
                $isCorrect = $userAnswer !== null && $userAnswer === $correctAnswer;

                if ($isCorrect) {
                    $correctAnswers++;
                }

                $questionResults[] = [
                    'question_index' => $index,
                    'question' => $question['question'],
                    'user_answer' => $userAnswer,
                    'correct_answer' => $correctAnswer,
                    'is_correct' => $isCorrect,
                ];
            }

            $percentageScore = ($correctAnswers / $totalQuestions) * 100;
            $score = round($percentageScore, 2);
            $passingScore = (int) $processedData['passingScore'];
            $passed = $score >= $passingScore;

            QuizSubmission::create([
                'user_id' => $user->id,
                'course_id' => $validated['course_id'],
                'quiz_content_id' => $quiz->id,
                'answers' => $userAnswers,
                'score' => $score,
                'time_taken' => $validated['time_taken'] ?? null,
                'submitted_at' => now(),
            ]);

            $isEligible = Certificate::isEligibleForCertificate($user->id, (int) $validated['course_id']);

            return response()->json([
                'message' => 'Quiz berhasil dikirim.',
                'score' => $score,
                'correct_answers' => $correctAnswers,
                'total_questions' => $totalQuestions,
                'percentage' => $percentageScore,
                'passed' => $passed,
                'passing_score' => $passingScore,
                'question_results' => $questionResults,
                'certificate_eligible' => $isEligible,
            ]);
        } catch (\Throwable $e) {
            Log::error('Quiz submit failed', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat mengirim quiz.',
            ], 500);
        }
    }

    private function userCanAccessCourse(User $user, int $courseId): bool
    {
        if ($user->tipe_user !== 'siswa') {
            return true;
        }

        $enrolled = DB::table('siswa_kursus')
            ->where('id_siswa', $user->id)
            ->where('id_kursus', $courseId)
            ->exists();

        if ($enrolled) {
            return true;
        }

        $course = Kursus::select(['id', 'class'])->find($courseId);
        if (!$course) {
            return false;
        }

        $classes = is_array($course->class) ? $course->class : [];
        if (empty($classes)) {
            return false;
        }

        return $user->class !== null && in_array($user->class, $classes, true);
    }
}

