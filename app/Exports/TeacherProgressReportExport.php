<?php

namespace App\Exports;

use App\Exports\Sheets\TeacherProgressCourseSheet;
use App\Exports\Sheets\TeacherProgressSummarySheet;
use App\Models\CourseContent;
use App\Models\Kursus;
use App\Models\ProgressCourse;
use App\Models\QuizSubmission;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class TeacherProgressReportExport implements WithMultipleSheets
{
    private const VALID_CONTENT_TYPES = ['video', 'pdf', 'quiz'];

    public function __construct(
        private readonly int $teacherId
    ) {
    }

    public function sheets(): array
    {
        $report = $this->buildReportData();

        $sheets = [
            new TeacherProgressSummarySheet($report['summary_rows']),
        ];

        foreach ($report['course_sheets'] as $courseSheet) {
            $sheets[] = new TeacherProgressCourseSheet(
                $courseSheet['title'],
                $courseSheet['rows']
            );
        }

        return $sheets;
    }

    private function buildReportData(): array
    {
        $courses = Kursus::query()
            ->select(['id', 'judul_kursus'])
            ->where('teacher_id', $this->teacherId)
            ->orderBy('judul_kursus')
            ->get();

        if ($courses->isEmpty()) {
            return [
                'summary_rows' => [],
                'course_sheets' => [],
            ];
        }

        $courseIds = $courses->pluck('id')->all();
        $enrollmentsByCourse = $this->getEnrollmentsByCourse($courseIds);
        [$courseContentTotals, $courseSubTypeCounts] = $this->getContentStructureByCourse($courseIds);
        [$progressBySub, $latestProgressAtByPair] = $this->getProgressByStudentAndSub($courseIds);
        [$quizCompletedBySub, $latestQuizAtByPair] = $this->getQuizCompletionByStudentAndSub($courseIds);
        $completedAtByPair = $this->getCompletionTimestampByPair($courseIds);

        $summaryByStudent = [];
        $courseSheets = [];
        $usedSheetTitles = [];

        foreach ($courses as $course) {
            $courseId = (int) $course->id;
            $courseEnrollments = $enrollmentsByCourse[$courseId] ?? [];
            $totalContent = (int) ($courseContentTotals[$courseId] ?? 0);
            $rows = [];

            usort($courseEnrollments, fn ($a, $b) => strcmp((string) $a->nama_lengkap, (string) $b->nama_lengkap));

            foreach ($courseEnrollments as $index => $enrollment) {
                $studentId = (int) $enrollment->id_siswa;
                $pairKey = $this->pairKey($courseId, $studentId);

                $completedContent = $this->calculateCompletedContentCount(
                    $courseId,
                    $studentId,
                    $courseSubTypeCounts,
                    $progressBySub,
                    $quizCompletedBySub
                );

                $progressPercentage = $totalContent > 0
                    ? round(($completedContent / $totalContent) * 100, 1)
                    : 0.0;

                $status = $this->mapProgressStatus($progressPercentage);
                $enrolledAt = $this->formatTimestamp((string) $enrollment->enrolled_at);
                $lastActivityRaw = $this->maxTimestamp(
                    (string) $enrollment->enrolled_at,
                    $latestProgressAtByPair[$pairKey] ?? null,
                    $latestQuizAtByPair[$pairKey] ?? null
                );
                $lastActivity = $this->formatTimestamp($lastActivityRaw);

                $completedAt = '';
                if ($progressPercentage >= 100) {
                    $completedAt = $this->formatTimestamp($completedAtByPair[$pairKey] ?? $lastActivityRaw);
                }

                $rows[] = [
                    $index + 1,
                    (string) $enrollment->nama_lengkap,
                    (string) $enrollment->email,
                    (string) ($enrollment->class ?? ''),
                    $progressPercentage,
                    $status,
                    $completedContent,
                    $totalContent,
                    $enrolledAt,
                    $lastActivity,
                    $completedAt,
                ];

                $studentKey = (string) $studentId;
                if (!isset($summaryByStudent[$studentKey])) {
                    $summaryByStudent[$studentKey] = [
                        'nama_lengkap' => (string) $enrollment->nama_lengkap,
                        'email' => (string) $enrollment->email,
                        'class' => (string) ($enrollment->class ?? ''),
                        'course_count' => 0,
                        'progress_sum' => 0.0,
                        'completed_count' => 0,
                        'in_progress_count' => 0,
                        'not_started_count' => 0,
                        'last_activity' => null,
                    ];
                }

                $summaryByStudent[$studentKey]['course_count']++;
                $summaryByStudent[$studentKey]['progress_sum'] += $progressPercentage;

                if ($progressPercentage >= 100) {
                    $summaryByStudent[$studentKey]['completed_count']++;
                } elseif ($progressPercentage > 0) {
                    $summaryByStudent[$studentKey]['in_progress_count']++;
                } else {
                    $summaryByStudent[$studentKey]['not_started_count']++;
                }

                $summaryByStudent[$studentKey]['last_activity'] = $this->maxTimestamp(
                    $summaryByStudent[$studentKey]['last_activity'],
                    $lastActivityRaw
                );
            }

            $courseSheets[] = [
                'title' => $this->makeUniqueSheetTitle((string) $course->judul_kursus, $usedSheetTitles),
                'rows' => $rows,
            ];
        }

        $summaryRows = collect($summaryByStudent)
            ->sortBy(fn (array $item) => strtolower($item['nama_lengkap']))
            ->values()
            ->map(function (array $item, int $index) {
                $courseCount = (int) $item['course_count'];
                $averageProgress = $courseCount > 0
                    ? round(((float) $item['progress_sum']) / $courseCount, 1)
                    : 0.0;

                return [
                    $index + 1,
                    $item['nama_lengkap'],
                    $item['email'],
                    $item['class'],
                    $courseCount,
                    $averageProgress,
                    (int) $item['completed_count'],
                    (int) $item['in_progress_count'],
                    (int) $item['not_started_count'],
                    $this->formatTimestamp($item['last_activity']),
                ];
            })
            ->all();

        return [
            'summary_rows' => $summaryRows,
            'course_sheets' => $courseSheets,
        ];
    }

    private function getEnrollmentsByCourse(array $courseIds): array
    {
        $rows = DB::table('siswa_kursus as sk')
            ->join('users as u', 'u.id', '=', 'sk.id_siswa')
            ->whereIn('sk.id_kursus', $courseIds)
            ->where('u.tipe_user', 'siswa')
            ->select(
                'sk.id_kursus',
                'sk.id_siswa',
                DB::raw('MIN(sk.created_at) as enrolled_at'),
                'u.nama_lengkap',
                'u.email',
                'u.class'
            )
            ->groupBy(
                'sk.id_kursus',
                'sk.id_siswa',
                'u.nama_lengkap',
                'u.email',
                'u.class'
            )
            ->get();

        $grouped = [];
        foreach ($rows as $row) {
            $grouped[(int) $row->id_kursus][] = $row;
        }

        return $grouped;
    }

    private function getContentStructureByCourse(array $courseIds): array
    {
        $rows = CourseContent::query()
            ->whereIn('kursus_id', $courseIds)
            ->whereIn('type', self::VALID_CONTENT_TYPES)
            ->select(
                'kursus_id',
                'sub_pembahasan_id',
                'type',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('kursus_id', 'sub_pembahasan_id', 'type')
            ->get();

        $courseContentTotals = [];
        $courseSubTypeCounts = [];

        foreach ($rows as $row) {
            $courseId = (int) $row->kursus_id;
            $subId = (int) ($row->sub_pembahasan_id ?? 0);
            $type = (string) $row->type;
            $count = (int) $row->total;

            if (!isset($courseSubTypeCounts[$courseId][$subId])) {
                $courseSubTypeCounts[$courseId][$subId] = [
                    'video' => 0,
                    'pdf' => 0,
                    'quiz' => 0,
                ];
            }

            $courseSubTypeCounts[$courseId][$subId][$type] = $count;
            $courseContentTotals[$courseId] = ($courseContentTotals[$courseId] ?? 0) + $count;
        }

        return [$courseContentTotals, $courseSubTypeCounts];
    }

    private function getProgressByStudentAndSub(array $courseIds): array
    {
        $rows = ProgressCourse::query()
            ->whereIn('id_kursus', $courseIds)
            ->whereNotNull('id_sub_pembahasan')
            ->select(
                'id_kursus',
                'id_siswa',
                'id_sub_pembahasan',
                DB::raw('MAX(progress_per_subbab) as progress_value'),
                DB::raw('MAX(updated_at) as last_progress_at')
            )
            ->groupBy('id_kursus', 'id_siswa', 'id_sub_pembahasan')
            ->get();

        $progressBySub = [];
        $latestProgressAtByPair = [];

        foreach ($rows as $row) {
            $courseId = (int) $row->id_kursus;
            $studentId = (int) $row->id_siswa;
            $subId = (int) $row->id_sub_pembahasan;
            $pairKey = $this->pairKey($courseId, $studentId);

            $progressBySub[$pairKey][$subId] = (int) ($row->progress_value ?? 0);
            $latestProgressAtByPair[$pairKey] = $this->maxTimestamp(
                $latestProgressAtByPair[$pairKey] ?? null,
                $row->last_progress_at
            );
        }

        return [$progressBySub, $latestProgressAtByPair];
    }

    private function getQuizCompletionByStudentAndSub(array $courseIds): array
    {
        $rows = QuizSubmission::query()
            ->join('course_contents', 'quiz_submissions.quiz_content_id', '=', 'course_contents.id')
            ->whereIn('quiz_submissions.course_id', $courseIds)
            ->whereNotNull('course_contents.sub_pembahasan_id')
            ->select(
                'quiz_submissions.course_id',
                'quiz_submissions.user_id',
                'course_contents.sub_pembahasan_id',
                DB::raw('MAX(COALESCE(quiz_submissions.submitted_at, quiz_submissions.created_at)) as last_quiz_at')
            )
            ->groupBy(
                'quiz_submissions.course_id',
                'quiz_submissions.user_id',
                'course_contents.sub_pembahasan_id'
            )
            ->get();

        $quizCompletedBySub = [];
        $latestQuizAtByPair = [];

        foreach ($rows as $row) {
            $courseId = (int) $row->course_id;
            $studentId = (int) $row->user_id;
            $subId = (int) $row->sub_pembahasan_id;
            $pairKey = $this->pairKey($courseId, $studentId);

            $quizCompletedBySub[$pairKey][$subId] = true;
            $latestQuizAtByPair[$pairKey] = $this->maxTimestamp(
                $latestQuizAtByPair[$pairKey] ?? null,
                $row->last_quiz_at
            );
        }

        return [$quizCompletedBySub, $latestQuizAtByPair];
    }

    private function getCompletionTimestampByPair(array $courseIds): array
    {
        $rows = ProgressCourse::query()
            ->whereIn('id_kursus', $courseIds)
            ->where('status', 'selesai')
            ->select(
                'id_kursus',
                'id_siswa',
                DB::raw('MAX(updated_at) as completed_at')
            )
            ->groupBy('id_kursus', 'id_siswa')
            ->get();

        $completedAtByPair = [];
        foreach ($rows as $row) {
            $pairKey = $this->pairKey((int) $row->id_kursus, (int) $row->id_siswa);
            $completedAtByPair[$pairKey] = $row->completed_at;
        }

        return $completedAtByPair;
    }

    private function calculateCompletedContentCount(
        int $courseId,
        int $studentId,
        array $courseSubTypeCounts,
        array $progressBySub,
        array $quizCompletedBySub
    ): int {
        $pairKey = $this->pairKey($courseId, $studentId);
        $subTypeCounts = $courseSubTypeCounts[$courseId] ?? [];

        if ($subTypeCounts === []) {
            return 0;
        }

        $progressPerSub = $progressBySub[$pairKey] ?? [];
        $quizPerSub = $quizCompletedBySub[$pairKey] ?? [];
        $completedCount = 0;

        foreach ($subTypeCounts as $subId => $typeCounts) {
            $effectiveProgress = (int) ($progressPerSub[$subId] ?? 0);
            if (($quizPerSub[$subId] ?? false) && $effectiveProgress < 3) {
                $effectiveProgress = 3;
            }

            if ($effectiveProgress >= 1) {
                $completedCount += (int) ($typeCounts['video'] ?? 0);
            }
            if ($effectiveProgress >= 2) {
                $completedCount += (int) ($typeCounts['pdf'] ?? 0);
            }
            if ($effectiveProgress >= 3) {
                $completedCount += (int) ($typeCounts['quiz'] ?? 0);
            }
        }

        return $completedCount;
    }

    private function mapProgressStatus(float $progressPercentage): string
    {
        if ($progressPercentage >= 100) {
            return 'Selesai';
        }

        if ($progressPercentage > 0) {
            return 'Sedang Berlangsung';
        }

        return 'Belum Mulai';
    }

    private function makeUniqueSheetTitle(string $rawTitle, array &$usedTitles): string
    {
        $baseTitle = $this->sanitizeSheetTitle($rawTitle);
        if ($baseTitle === '') {
            $baseTitle = 'Course';
        }

        if (!isset($usedTitles[$baseTitle])) {
            $usedTitles[$baseTitle] = 1;
            return $baseTitle;
        }

        $counter = ++$usedTitles[$baseTitle];
        do {
            $suffix = ' (' . $counter . ')';
            $maxBaseLength = max(1, 31 - strlen($suffix));
            $candidate = substr($baseTitle, 0, $maxBaseLength) . $suffix;
            $counter++;
        } while (isset($usedTitles[$candidate]));

        $usedTitles[$candidate] = 1;
        return $candidate;
    }

    private function sanitizeSheetTitle(string $title): string
    {
        $clean = preg_replace('/[\\\\\\/?*\\[\\]:]/', ' ', $title) ?? '';
        $clean = trim(preg_replace('/\\s+/', ' ', $clean) ?? '');

        return substr($clean, 0, 31);
    }

    private function pairKey(int $courseId, int $studentId): string
    {
        return $courseId . ':' . $studentId;
    }

    private function maxTimestamp(?string $first, ?string $second, ?string $third = null): ?string
    {
        $values = array_filter([$first, $second, $third]);
        if ($values === []) {
            return null;
        }

        $timestamps = array_map(fn (string $value) => strtotime($value), $values);
        $timestamps = array_filter($timestamps, fn ($value) => $value !== false);

        if ($timestamps === []) {
            return null;
        }

        return date('Y-m-d H:i:s', max($timestamps));
    }

    private function formatTimestamp(?string $value): string
    {
        if (!$value) {
            return '';
        }

        $timestamp = strtotime($value);
        if ($timestamp === false) {
            return '';
        }

        return date('Y-m-d H:i:s', $timestamp);
    }
}
