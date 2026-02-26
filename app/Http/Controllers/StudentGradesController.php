<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\QuizSubmission;
use App\Models\Kursus;
use App\Models\CourseContent;
use App\Models\Certificate;
use App\Models\ProgressCourse;
use Inertia\Inertia;

class StudentGradesController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get all quiz submissions for the logged-in student
        $quizSubmissions = QuizSubmission::where('user_id', $user->id)
            ->with(['course', 'quizContent'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform the data for the frontend
        $grades = $quizSubmissions->map(function ($submission) {
            $totalQuestions = $this->extractTotalQuestions($submission->quizContent?->quiz_data);
            $normalizedScore = $this->normalizeScore((float) $submission->score, $totalQuestions);

            return [
                'id' => $submission->id,
                'course_name' => $submission->course->judul_kursus ?? 'Unknown Course',
                'course_code' => 'COURSE-' . $submission->course_id,
                'quiz_title' => $submission->quizContent->title ?? 'Quiz',
                'score' => $normalizedScore,
                'max_score' => 100,
                'percentage' => $normalizedScore,
                'letter_grade' => $this->getLetterGrade($normalizedScore),
                'submitted_at' => $submission->submitted_at,
                'created_at' => $submission->created_at,
            ];
        });

        // Get user's courses with completion status
        $userCourses = Kursus::whereHas('siswa', function ($query) use ($user) {
            $query->where('users.id', $user->id);
        })->with('contents')->get();

        // Calculate overall statistics
        $totalQuizzes = $grades->count();
        $averageScore = $totalQuizzes > 0 ? $grades->avg('score') : 0;
        $highestScore = $grades->max('score') ?? 0;
        $lowestScore = $grades->min('score') ?? 0;

        // Group by course and add completion/certificate info
        $courseGrades = $userCourses->map(function ($course) use ($user, $grades) {
            $courseQuizzes = $grades->filter(function ($grade) use ($course) {
                return $grade['course_name'] === $course->judul_kursus;
            });

            $courseScore = $courseQuizzes->count() > 0 ? $courseQuizzes->avg('score') : 0;

            // Check if course is completed
            $completed = $this->isCourseCompleted($user->id, $course->id);

            // Check certificate eligibility
            $certificateEligible = Certificate::isEligibleForCertificate($user->id, $course->id);

            // Check if certificate is already issued and get certificate data
            $certificate = Certificate::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            $certificateIssued = $certificate ? true : false;
            $certificateTitle = $certificate ? $certificate->title : null;
            $certificateId = $certificate ? $certificate->id : null;

            return [
                'course_name' => $course->judul_kursus,
                'course_code' => 'COURSE-' . $course->id,
                'average_score' => round($courseScore, 2),
                'letter_grade' => $this->getLetterGrade($courseScore),
                'total_quizzes' => $courseQuizzes->count(),
                'highest_score' => $courseQuizzes->max('score') ?? 0,
                'lowest_score' => $courseQuizzes->min('score') ?? 0,
                'quizzes' => $courseQuizzes->values(),
                'course_id' => $course->id,
                'completed' => $completed,
                'certificate_eligible' => $certificateEligible,
                'certificate_issued' => $certificateIssued,
                'certificate_title' => $certificateTitle,
                'certificate_id' => $certificateId,
            ];
        })->values();

        // Get certificates for the user
        $certificates = Certificate::where('user_id', $user->id)
            ->with('course')
            ->orderBy('issued_at', 'desc')
            ->get()
            ->map(function ($certificate) {
                return [
                    'id' => $certificate->id,
                    'title' => $certificate->title,
                    'course_name' => $certificate->course ? $certificate->course->judul_kursus : 'Unknown Course',
                    'issued_at' => $certificate->issued_at->format('F j, Y'),
                    'certificate_number' => $certificate->certificate_number,
                ];
            });

        return Inertia::render('dashboard/grades/page', [
            'grades' => $grades,
            'courseGrades' => $courseGrades,
            'certificates' => $certificates,
            'statistics' => [
                'totalQuizzes' => $totalQuizzes,
                'averageScore' => round($averageScore, 2),
                'highestScore' => $highestScore,
                'lowestScore' => $lowestScore,
                'overallGrade' => $this->getLetterGrade($averageScore),
            ],
        ]);
    }

    private function getLetterGrade($score)
    {
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 70) return 'C';
        if ($score >= 60) return 'D';
        return 'F';
    }

    private function extractTotalQuestions($quizData): int
    {
        if (empty($quizData)) {
            return 0;
        }

        $parsed = $quizData;
        for ($attempt = 0; $attempt < 2; $attempt++) {
            if (!is_string($parsed)) {
                break;
            }

            $decoded = json_decode($parsed, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                break;
            }

            $parsed = $decoded;
        }

        if (is_array($parsed)) {
            if (array_key_exists('questions', $parsed) && is_array($parsed['questions'])) {
                return count($parsed['questions']);
            }

            return count($parsed);
        }

        return 0;
    }

    private function normalizeScore(float $storedScore, int $totalQuestions): float
    {
        $score = max(0, $storedScore);

        // Backward compatibility for legacy submissions that stored raw correct-answer counts.
        $isLikelyRawCount = $totalQuestions > 0 && floor($score) === $score && $score <= $totalQuestions;
        if ($isLikelyRawCount) {
            return round(($score / $totalQuestions) * 100, 2);
        }

        return round(min($score, 100), 2);
    }

    private function isCourseCompleted($userId, $courseId)
    {
        // Check if user has completed all required content in the course
        $course = Kursus::with('contents')->find($courseId);

        if (!$course) {
            return false;
        }

        // Get all required content
        $requiredContent = $course->contents()->where('is_required', true)->get();

        if ($requiredContent->isEmpty()) {
            return true; // No required content means course is completed
        }

        // Check if all required quizzes have been passed
        foreach ($requiredContent as $content) {
            if ($content->type === 'quiz') {
                $submission = QuizSubmission::where('user_id', $userId)
                    ->where('quiz_content_id', $content->id)
                    ->orderBy('score', 'desc')
                    ->first();

                // If no submission or score is below passing score
                if (!$submission || $submission->score < $content->passing_score) {
                    return false;
                }
            } else {
                // For non-quiz content, check if it's marked as completed in progress
                $progress = ProgressCourse::where('id_siswa', $userId)
                    ->where('id_kursus', $courseId)
                    ->where('id_sub_pembahasan', $content->sub_pembahasan_id)
                    ->where('status', 'selesai')
                    ->first();

                if (!$progress) {
                    return false;
                }
            }
        }

        return true;
    }
}
