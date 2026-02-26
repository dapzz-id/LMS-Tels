<?php

namespace App\Http\Controllers;

use App\Models\CourseContent;
use App\Models\ProgressCourse;
use App\Models\QuizSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StudentDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user && $user->tipe_user === 'siswa', 403);

        $latestProgressSubquery = ProgressCourse::query()
            ->select('id_kursus', DB::raw('MAX(updated_at) as last_activity_at'))
            ->where('id_siswa', $user->id)
            ->groupBy('id_kursus');

        $courses = $user->courses()
            ->with([
                'teacher:id,nama_lengkap',
                'mapel:id,nama_mapel',
            ])
            ->leftJoinSub($latestProgressSubquery, 'latest_progress', function ($join) {
                $join->on('kursus.id', '=', 'latest_progress.id_kursus');
            })
            ->select([
                'kursus.id',
                'kursus.teacher_id',
                'kursus.id_mapel',
                'kursus.judul_kursus',
                'kursus.deskripsi_kursus',
                'kursus.url_thumbnail',
                'kursus.created_at',
                'kursus.updated_at',
                'latest_progress.last_activity_at',
            ])
            ->orderByDesc('latest_progress.last_activity_at')
            ->orderByDesc('kursus.updated_at')
            ->get();

        if ($courses->isEmpty()) {
            return Inertia::render('dashboard/page', [
                'stats' => [
                    'active_courses' => 0,
                    'assignments_done' => 0,
                    'due_this_week' => 0,
                    'average_grade' => 0,
                ],
                'myCourses' => [],
                'recentlyAccessedCourses' => [],
            ]);
        }

        $courseIds = $courses->pluck('id')->values();

        $courseContents = CourseContent::query()
            ->whereIn('kursus_id', $courseIds)
            ->whereIn('type', ['video', 'pdf', 'quiz'])
            ->get([
                'kursus_id',
                'sub_pembahasan_id',
                'type',
            ]);

        $progressRows = ProgressCourse::query()
            ->where('id_siswa', $user->id)
            ->whereIn('id_kursus', $courseIds)
            ->get([
                'id_kursus',
                'id_sub_pembahasan',
                'progress_per_subbab',
                'updated_at',
            ]);

        $progressBySub = [];
        $latestProgressAt = [];
        foreach ($progressRows as $row) {
            $subKey = $row->id_kursus . ':' . $row->id_sub_pembahasan;
            $progressValue = (int) ($row->progress_per_subbab ?? 0);

            if (!isset($progressBySub[$subKey]) || $progressValue > $progressBySub[$subKey]) {
                $progressBySub[$subKey] = $progressValue;
            }

            $courseKey = (string) $row->id_kursus;
            $updatedAt = strtotime((string) $row->updated_at) ?: null;
            if ($updatedAt !== null && (!isset($latestProgressAt[$courseKey]) || $updatedAt > $latestProgressAt[$courseKey])) {
                $latestProgressAt[$courseKey] = $updatedAt;
            }
        }

        $quizSubmissions = QuizSubmission::query()
            ->where('user_id', $user->id)
            ->whereIn('course_id', $courseIds)
            ->get(['course_id', 'score', 'submitted_at', 'updated_at', 'created_at']);

        $latestQuizAt = [];
        foreach ($quizSubmissions as $submission) {
            $courseKey = (string) $submission->course_id;
            $candidate = $submission->submitted_at ?? $submission->updated_at ?? $submission->created_at;
            $timestamp = $candidate ? (strtotime((string) $candidate) ?: null) : null;

            if ($timestamp !== null && (!isset($latestQuizAt[$courseKey]) || $timestamp > $latestQuizAt[$courseKey])) {
                $latestQuizAt[$courseKey] = $timestamp;
            }
        }

        $progressThresholds = [
            'video' => 1,
            'pdf' => 2,
            'quiz' => 3,
        ];

        $contentsByCourse = $courseContents->groupBy('kursus_id');

        $myCourses = $courses->map(function ($course) use ($contentsByCourse, $progressBySub, $progressThresholds, $latestProgressAt, $latestQuizAt) {
            $contents = $contentsByCourse->get($course->id, collect());
            $totalContent = $contents->count();

            $completedContent = $contents->filter(function ($content) use ($course, $progressBySub, $progressThresholds) {
                $threshold = $progressThresholds[$content->type] ?? 0;
                $subKey = $course->id . ':' . $content->sub_pembahasan_id;
                $progressValue = $progressBySub[$subKey] ?? 0;

                return $progressValue >= $threshold;
            })->count();

            $progressPercentage = $totalContent > 0
                ? (int) round(($completedContent / $totalContent) * 100)
                : 0;

            $courseKey = (string) $course->id;
            $progressTimestamp = $latestProgressAt[$courseKey] ?? null;
            $quizTimestamp = $latestQuizAt[$courseKey] ?? null;
            $queryTimestamp = $course->last_activity_at ? (strtotime((string) $course->last_activity_at) ?: null) : null;

            $lastActivityTimestamp = collect([$progressTimestamp, $quizTimestamp, $queryTimestamp])
                ->filter(fn ($value) => is_int($value))
                ->max();

            $lastActivityAt = $lastActivityTimestamp
                ? now()->setTimestamp((int) $lastActivityTimestamp)->toIso8601String()
                : null;

            return [
                'id' => $course->id,
                'title' => $course->judul_kursus,
                'teacher_name' => $course->teacher?->nama_lengkap ?? 'Teacher',
                'progress' => $progressPercentage,
                'thumbnail' => $course->url_thumbnail,
                'last_activity_at' => $lastActivityAt,
            ];
        })
            ->sortByDesc(function (array $course) {
                return strtotime((string) ($course['last_activity_at'] ?? '1970-01-01T00:00:00Z')) ?: 0;
            })
            ->values();

        $recentlyAccessedCourses = $myCourses
            ->filter(fn (array $course) => !empty($course['last_activity_at']))
            ->take(5)
            ->values();

        $assignmentDone = (int) $quizSubmissions->count();
        $averageGrade = $quizSubmissions->count() > 0
            ? (int) round((float) $quizSubmissions->avg('score'))
            : 0;

        return Inertia::render('dashboard/page', [
            'stats' => [
                'active_courses' => $myCourses->count(),
                'assignments_done' => $assignmentDone,
                'due_this_week' => 0,
                'average_grade' => $averageGrade,
            ],
            'myCourses' => $myCourses,
            'recentlyAccessedCourses' => $recentlyAccessedCourses,
        ]);
    }
}
