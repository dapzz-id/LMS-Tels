<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class StudentMonitoringController extends Controller
{
    public function index(Request $request)
    {
        $selectedClass = $request->get('class', 'all');
        $sortBy = $request->get('sort_by', 'last_activity');
        $sortOrder = $request->get('sort_order', 'desc');

        $onlineStudents = StudentActivity::getOnlineStudents($selectedClass, $sortBy, $sortOrder);
        $recentActivity = StudentActivity::getRecentActivity(30, $selectedClass);

        $stats = [
            'total_online' => $onlineStudents->count(),
            'total_students' => User::where('tipe_user', 'siswa')->count(),
            'active_courses' => $recentActivity->where('activity_type', 'course_view')->unique('course_id')->count(),
            'active_quizzes' => $recentActivity->where('activity_type', 'quiz_start')->unique('quiz_id')->count(),
        ];

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
            ->values();

        // Check user role and render appropriate page
        $user = auth()->user();
        if ($user && $user->tipe_user === 'guru') {
            // Teacher view
            return Inertia::render('teacher/student-monitoring/page', [
                'onlineStudents' => $onlineStudents,
                'recentActivity' => $recentActivity,
                'stats' => $stats,
                'filters' => [
                    'selectedClass' => $selectedClass,
                    'sortBy' => $sortBy,
                    'sortOrder' => $sortOrder,
                    'availableClasses' => $availableClasses
                ]
            ]);
        } else {
            // Admin view
            return Inertia::render('admin/student-monitoring/page', [
                'onlineStudents' => $onlineStudents,
                'recentActivity' => $recentActivity,
                'stats' => $stats,
                'filters' => [
                    'selectedClass' => $selectedClass,
                    'sortBy' => $sortBy,
                    'sortOrder' => $sortOrder,
                    'availableClasses' => $availableClasses
                ]
            ]);
        }
    }

    public function getLiveData(Request $request)
    {
        $selectedClass = $request->get('class', 'all');
        $sortBy = $request->get('sort_by', 'last_activity');
        $sortOrder = $request->get('sort_order', 'desc');

        $onlineStudents = StudentActivity::getOnlineStudents($selectedClass, $sortBy, $sortOrder);
        $recentActivity = StudentActivity::getRecentActivity(5, $selectedClass); // Last 5 minutes

        $stats = [
            'total_online' => $onlineStudents->count(),
            'total_students' => User::where('tipe_user', 'siswa')->count(),
            'active_courses' => $recentActivity->where('activity_type', 'course_view')->unique('course_id')->count(),
            'active_quizzes' => $recentActivity->where('activity_type', 'quiz_start')->unique('quiz_id')->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'onlineStudents' => $onlineStudents,
                'recentActivity' => $recentActivity,
                'stats' => $stats,
                'lastUpdate' => now()->toISOString()
            ]
        ]);
    }

    public function trackStudentActivity(Request $request)
    {
        $request->validate([
            'activity_type' => 'required|string',
            'page_url' => 'nullable|string',
            'course_id' => 'nullable|string',
            'quiz_id' => 'nullable|string',
            'metadata' => 'nullable|array'
        ], [
            'activity_type.required' => 'Jenis aktivitas wajib diisi.',
            'activity_type.string' => 'Jenis aktivitas harus berupa teks.',
            'page_url.string' => 'URL halaman harus berupa teks.',
            'course_id.string' => 'ID kursus harus berupa teks.',
            'quiz_id.string' => 'ID kuis harus berupa teks.',
            'metadata.array' => 'Metadata harus berupa array.',
        ]);

        $userId = auth()->id();

        // Only track activities for students
        $user = auth()->user();
        if (!$user || $user->tipe_user !== 'siswa') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only students can track activities'
            ], 403);
        }

        // Clean and validate the activity data
        $activityData = [
            'page_url' => $request->page_url,
            'course_id' => $request->course_id,
            'quiz_id' => $request->quiz_id,
            'metadata' => array_merge($request->metadata ?? [], [
                'tracked_at' => now()->toISOString(),
                'user_agent' => $request->header('User-Agent'),
                'ip_address' => $request->ip()
            ])
        ];

        try {
            StudentActivity::trackActivity($userId, $request->activity_type, $activityData);

            return response()->json([
                'status' => 'success',
                'message' => 'Activity tracked successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error tracking student activity: ' . $e->getMessage(), [
                'user_id' => $userId,
                'activity_type' => $request->activity_type,
                'data' => $activityData
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to track activity'
            ], 500);
        }
    }

    public function getStudentDetails($studentId)
    {
        $student = User::where('id', $studentId)
            ->where('tipe_user', 'siswa')
            ->firstOrFail();

        $activities = StudentActivity::where('user_id', $studentId)
            ->with(['course', 'quiz'])
            ->orderBy('last_activity', 'desc')
            ->take(50)
            ->get();

        $currentActivity = StudentActivity::where('user_id', $studentId)
            ->where('is_online', true)
            ->first();

        // Get activity statistics
        $activityStats = [
            'total_activities' => StudentActivity::where('user_id', $studentId)->count(),
            'today_activities' => StudentActivity::where('user_id', $studentId)
                ->whereDate('last_activity', today())
                ->count(),
            'this_week_activities' => StudentActivity::where('user_id', $studentId)
                ->whereBetween('last_activity', [now()->startOfWeek(), now()->endOfWeek()])
                ->count(),
            'most_active_course' => StudentActivity::where('user_id', $studentId)
                ->whereNotNull('course_id')
                ->selectRaw('course_id, COUNT(*) as activity_count')
                ->groupBy('course_id')
                ->orderBy('activity_count', 'desc')
                ->first()
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'student' => $student,
                'activities' => $activities,
                'currentActivity' => $currentActivity,
                'activityStats' => $activityStats
            ]
        ]);
    }

    public function getActivitySummary(Request $request)
    {
        $selectedClass = $request->get('class', 'all');
        $today = now()->startOfDay();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();

        // Build base query with class filter
        $baseQuery = StudentActivity::query();
        if ($selectedClass !== 'all') {
            $baseQuery->whereHas('user', function ($query) use ($selectedClass) {
                $query->where('class', $selectedClass);
            });
        }

        $summary = [
            'today' => [
                'total_activities' => (clone $baseQuery)->whereDate('last_activity', today())->count(),
                'unique_students' => (clone $baseQuery)->whereDate('last_activity', today())->distinct('user_id')->count(),
                'login_count' => (clone $baseQuery)->whereDate('last_activity', today())
                    ->where('activity_type', 'login')
                    ->count(),
                'course_views' => (clone $baseQuery)->whereDate('last_activity', today())
                    ->where('activity_type', 'course_view')
                    ->count(),
                'quiz_submissions' => (clone $baseQuery)->whereDate('last_activity', today())
                    ->where('activity_type', 'quiz_submit')
                    ->count(),
            ],
            'this_week' => [
                'total_activities' => (clone $baseQuery)->whereBetween('last_activity', [$thisWeek, now()])->count(),
                'unique_students' => (clone $baseQuery)->whereBetween('last_activity', [$thisWeek, now()])->distinct('user_id')->count(),
                'most_active_day' => (clone $baseQuery)->whereBetween('last_activity', [$thisWeek, now()])
                    ->selectRaw('DATE(last_activity) as date, COUNT(*) as count')
                    ->groupBy('date')
                    ->orderBy('count', 'desc')
                    ->first(),
            ],
            'this_month' => [
                'total_activities' => (clone $baseQuery)->whereBetween('last_activity', [$thisMonth, now()])->count(),
                'unique_students' => (clone $baseQuery)->whereBetween('last_activity', [$thisMonth, now()])->distinct('user_id')->count(),
            ]
        ];

        return response()->json([
            'status' => 'success',
            'data' => $summary
        ]);
    }

    public function getClassStats()
    {
        $classStats = User::where('tipe_user', 'siswa')
            ->whereNotNull('class')
            ->selectRaw('class, COUNT(*) as total_students')
            ->groupBy('class')
            ->orderBy('class')
            ->get()
            ->map(function ($class) {
                $onlineStudents = StudentActivity::whereHas('user', function ($query) use ($class) {
                    $query->where('class', $class->class);
                })
                ->where('is_online', true)
                ->where('last_activity', '>=', now()->subMinutes(5))
                ->count();

                return [
                    'class' => $class->class,
                    'total_students' => $class->total_students,
                    'online_students' => $onlineStudents,
                    'online_percentage' => $class->total_students > 0 ? round(($onlineStudents / $class->total_students) * 100, 1) : 0
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $classStats
        ]);
    }
}
