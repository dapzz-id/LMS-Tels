<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class StudentActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'activity_type',
        'page_url',
        'course_id',
        'quiz_id',
        'metadata',
        'last_activity',
        'is_online'
    ];

    protected $casts = [
        'metadata' => 'array',
        'last_activity' => 'datetime',
        'is_online' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Kursus::class, 'course_id');
    }

    public function quiz()
    {
        return $this->belongsTo(CourseContent::class, 'quiz_id');
    }

    // Helper methods
    public static function trackActivity($userId, $activityType, $data = [])
    {
        // Validate user exists and is a student
        $user = User::find($userId);
        if (!$user || $user->tipe_user !== 'siswa') {
            \Log::warning('Attempted to track activity for non-student user', [
                'user_id' => $userId,
                'activity_type' => $activityType
            ]);
            return null;
        }

        // Clean and validate activity data
        $activityData = [
            'user_id' => $userId,
            'activity_type' => $activityType,
            'page_url' => $data['page_url'] ?? null,
            'course_id' => $data['course_id'] ?? null,
            'quiz_id' => $data['quiz_id'] ?? null,
            'metadata' => $data['metadata'] ?? null,
            'last_activity' => now(),
            'is_online' => true
        ];

        // Handle special activity types
        if ($activityType === 'logout') {
            $activityData['is_online'] = false;
        }

        try {
            // For most activity types, create a new record
            // For login/logout/heartbeat, update the existing record for the user
            $updateActivityTypes = ['login', 'logout', 'heartbeat'];

            if (in_array($activityType, $updateActivityTypes)) {
                // Update existing record for the user
                return self::updateOrCreate(
                    ['user_id' => $userId],
                    $activityData
                );
            } else {
                // Create a new record for each activity
                return self::create($activityData);
            }
        } catch (\Exception $e) {
            \Log::error('Error tracking student activity: ' . $e->getMessage(), [
                'user_id' => $userId,
                'activity_type' => $activityType,
                'data' => $activityData
            ]);
            return null;
        }
    }

    public static function markOffline($userId)
    {
        try {
            return self::where('user_id', $userId)->update([
                'is_online' => false,
                'activity_type' => 'logout',
                'last_activity' => now()
            ]);
        } catch (\Exception $e) {
            \Log::error('Error marking user offline: ' . $e->getMessage(), [
                'user_id' => $userId
            ]);
            return false;
        }
    }

    public static function getOnlineStudents($selectedClass = 'all', $sortBy = 'last_activity', $sortOrder = 'desc')
    {
        try {
            $query = self::where('is_online', true)
                ->where('last_activity', '>=', now()->subMinutes(5)) // Consider offline after 5 minutes
                ->with('user');

            // Filter by class if specified
            if ($selectedClass !== 'all') {
                $query->whereHas('user', function ($userQuery) use ($selectedClass) {
                    $userQuery->where('class', $selectedClass);
                });
            }

            // Apply sorting
            $allowedSortFields = ['last_activity', 'activity_type', 'user_id'];
            $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'last_activity';
            $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'desc';

            return $query->orderBy($sortBy, $sortOrder)->get();
        } catch (\Exception $e) {
            \Log::error('Error getting online students: ' . $e->getMessage());
            return collect();
        }
    }

    public static function getRecentActivity($minutes = 30, $selectedClass = 'all')
    {
        try {
            $query = self::where('last_activity', '>=', now()->subMinutes($minutes))
                ->with(['user', 'course']);

            // Filter by class if specified
            if ($selectedClass !== 'all') {
                $query->whereHas('user', function ($userQuery) use ($selectedClass) {
                    $userQuery->where('class', $selectedClass);
                });
            }

            return $query->orderBy('last_activity', 'desc')->get();
        } catch (\Exception $e) {
            \Log::error('Error getting recent activity: ' . $e->getMessage());
            return collect();
        }
    }

    public static function cleanupOldActivities()
    {
        try {
            // Remove activities older than 30 days
            $cutoffDate = now()->subDays(30);
            return self::where('last_activity', '<', $cutoffDate)->delete();
        } catch (\Exception $e) {
            \Log::error('Error cleaning up old activities: ' . $e->getMessage());
            return 0;
        }
    }

    public static function getActivityStats($userId = null, $period = 'today')
    {
        try {
            $query = self::query();

            if ($userId) {
                $query->where('user_id', $userId);
            }

            switch ($period) {
                case 'today':
                    $query->whereDate('last_activity', today());
                    break;
                case 'this_week':
                    $query->whereBetween('last_activity', [now()->startOfWeek(), now()->endOfWeek()]);
                    break;
                case 'this_month':
                    $query->whereBetween('last_activity', [now()->startOfMonth(), now()->endOfMonth()]);
                    break;
            }

            return [
                'total' => $query->count(),
                'by_type' => $query->selectRaw('activity_type, COUNT(*) as count')
                    ->groupBy('activity_type')
                    ->pluck('count', 'activity_type')
                    ->toArray(),
                'unique_users' => $query->distinct('user_id')->count()
            ];
        } catch (\Exception $e) {
            \Log::error('Error getting activity stats: ' . $e->getMessage());
            return [
                'total' => 0,
                'by_type' => [],
                'unique_users' => 0
            ];
        }
    }

    // Scope for filtering by activity type
    public function scopeOfType($query, $type)
    {
        return $query->where('activity_type', $type);
    }

    // Scope for filtering by date range
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('last_activity', [$startDate, $endDate]);
    }

    // Scope for online users only
    public function scopeOnline($query)
    {
        return $query->where('is_online', true)
                    ->where('last_activity', '>=', now()->subMinutes(5));
    }
}
