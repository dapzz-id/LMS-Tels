<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'certificate_number',
        'title',
        'description',
        'issued_at',
        'expires_at',
        'pdf_path',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'issued_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Kursus::class, 'course_id');
    }

    /**
     * Generate a unique certificate number
     */
    public static function generateCertificateNumber($userId, $courseId)
    {
        $prefix = 'CERT';
        $year = date('Y');
        $userHash = substr(md5($userId), 0, 4);
        $courseHash = substr(md5($courseId), 0, 4);
        $random = strtoupper(substr(md5(time() . rand()), 0, 4));

        return "{$prefix}-{$year}-{$userHash}{$courseHash}{$random}";
    }

    /**
     * Check if a user has completed a course and is eligible for a certificate
     * Modified to allow flexible navigation - user just needs to pass all required quizzes
     */
    public static function isEligibleForCertificate($userId, $courseId)
    {
        // Get the course
        $course = Kursus::find($courseId);
        if (!$course) {
            return false;
        }

        // Get all required quiz content for the course
        $requiredQuizzes = $course->contents()
            ->where('type', 'quiz')
            ->where('is_required', true)
            ->get();

        // If there are no required quizzes, user can get certificate
        if ($requiredQuizzes->isEmpty()) {
            return true;
        }

        // Check if user has completed all required quizzes with passing scores
        foreach ($requiredQuizzes as $quiz) {
            $submission = QuizSubmission::where('user_id', $userId)
                ->where('quiz_content_id', $quiz->id)
                ->orderBy('score', 'desc')
                ->first();

            // If no submission or score is below passing score
            if (!$submission || $submission->score < ($quiz->passing_score ?? 70)) {
                return false;
            }
        }

        // User has passed all required quizzes, so they're eligible for certificate
        return true;
    }

    /**
     * Check if the school logo exists
     */
    public static function hasSchoolLogo()
    {
        return file_exists(public_path('Logo_SMK_Telekomunikasi_Telesandi_Bekasi.png'));
    }

    /**
     * Issue a certificate to a user for completing a course
     */
    public static function issueCertificate($userId, $courseId)
    {
        // Check if already issued
        $existing = self::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->first();

        if ($existing) {
            return $existing;
        }

        // Check eligibility
        if (!self::isEligibleForCertificate($userId, $courseId)) {
            return null;
        }

        // Get course and user details
        $course = Kursus::find($courseId);
        $user = User::find($userId);

        if (!$course || !$user) {
            return null;
        }

        // Create certificate
        $certificate = self::create([
            'user_id' => $userId,
            'course_id' => $courseId,
            'certificate_number' => self::generateCertificateNumber($userId, $courseId),
            'title' => "Completion Certificate - {$course->judul_kursus}",
            'description' => "This certificate is awarded to {$user->nama_lengkap} for successfully completing the course {$course->judul_kursus}",
            'issued_at' => now(),
            'metadata' => [
                'course_title' => $course->judul_kursus,
                'user_name' => $user->nama_lengkap, // Use nama_lengkap instead of name
                'completion_date' => now()->toDateString(),
                'instructor' => $course->teacher ? $course->teacher->nama_lengkap : 'N/A', // Use nama_lengkap for instructor too
                'school_name' => 'SMK Telekomunikasi Telesandi Bekasi',
                'school_address' => 'Jl. KH. Agus Salim No. 43, Bekasi',
                'signer_name' => 'Guruh Wijanarko, S.T., M.Pd.',
                'signer_npk' => '2008 0002'
            ]
        ]);

        return $certificate;
    }
}
