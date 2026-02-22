<?php

namespace App\Http\Controllers;

use App\Models\CourseContent;
use App\Models\Kursus;
use App\Models\ProgressCourse;
use App\Models\QuizSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user && $user->tipe_user === 'siswa', 403);

        $courses = Kursus::query()
            ->with([
                'teacher:id,nama_lengkap',
                'mapel:id,nama_mapel',
            ])
            ->whereHas('siswa', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->latest()
            ->get([
                'id',
                'teacher_id',
                'id_mapel',
                'judul_kursus',
                'deskripsi_kursus',
                'url_thumbnail',
                'created_at',
            ]);

        if ($courses->isEmpty()) {
            return Inertia::render('dashboard/page', [
                'stats' => [
                    'active_courses' => 0,
                    'assignments_done' => 0,
                    'due_this_week' => 0,
                    'average_grade' => 0,
                ],
                'myCourses' => [],
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
            $updatedAt = (string) $row->updated_at;
            if (!isset($latestProgressAt[$courseKey]) || $updatedAt > $latestProgressAt[$courseKey]) {
                $latestProgressAt[$courseKey] = $updatedAt;
            }
        }

        $progressThresholds = [
            'video' => 1,
            'pdf' => 2,
            'quiz' => 3,
        ];

        $contentsByCourse = $courseContents->groupBy('kursus_id');

        $myCourses = $courses->map(function ($course) use ($contentsByCourse, $progressBySub, $progressThresholds, $latestProgressAt) {
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

            return [
                'id' => $course->id,
                'title' => $course->judul_kursus,
                'teacher_name' => $course->teacher?->nama_lengkap ?? 'Teacher',
                'progress' => $progressPercentage,
                'thumbnail' => $course->url_thumbnail,
                'last_activity_at' => $latestProgressAt[(string) $course->id] ?? null,
            ];
        })->values();

        $quizSubmissions = QuizSubmission::query()
            ->where('user_id', $user->id)
            ->whereIn('course_id', $courseIds)
            ->get(['score', 'total_questions']);

        $assignmentDone = (int) $quizSubmissions->count();
        $averageGrade = $quizSubmissions->count() > 0
            ? (int) round($quizSubmissions->avg(function ($submission) {
                return $submission->total_questions > 0
                    ? ($submission->score / $submission->total_questions) * 100
                    : 0;
            }))
            : 0;

        return Inertia::render('dashboard/page', [
            'stats' => [
                'active_courses' => $myCourses->count(),
                'assignments_done' => $assignmentDone,
                'due_this_week' => 0,
                'average_grade' => $averageGrade,
            ],
            'myCourses' => $myCourses,
        ]);
    }
}

