<?php

namespace App\Http\Controllers;

use App\Models\CourseContent;
use App\Models\ProgressCourse;
use App\Models\User;
use App\Models\Kursus;
use App\Models\QuizSubmission;
use App\Models\StudentActivity;
use App\Models\SubPembahasan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function getDataCourse($id)
    {
        $authUser = auth()->user();
        if (!$authUser) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($authUser->tipe_user === 'siswa' && (int) $id !== (int) $authUser->id) {
            return response()->json([
                'message' => 'Anda tidak diizinkan mengakses data siswa lain.',
            ], 403);
        }

        $user = User::with(['kursus.progress'])->find($id);

        if (!$user || $user->kursus->isEmpty()) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        $validKursus = $user->kursus->filter(function ($kursus) {
            return $kursus->progress->contains(function ($progress) {
                return strtolower($progress->status) !== 'belum dimulai' &&
                    $progress->id_sub_pembahasan !== null;
            });
        });

        if ($validKursus->isNotEmpty()) {
            return response()->json([
                'kursus' => $user->kursus,
                'validKursus' => $validKursus->values(),
            ]);
        }

        return response()->json([
            'kursus' => $user->kursus,
            'message' => "You haven't started any of the courses you have"
        ], 200);
    }

    public function getDataCourseku($id = null)
    {
        try {
            Log::info('Fetching course(s). ID: ' . ($id ?? 'all'));

            // Get the authenticated user's class
            $user = auth()->user();
            $userClass = $user->class;

            $query = Kursus::with([
                'mapel:id,nama_mapel',
                'contents' => function($query) {
                    $query->orderBy('order')
                          ->select(['id', 'kursus_id', 'sub_pembahasan_id', 'type', 'title', 'description', 'url', 'quiz_data', 'one_submission_only', 'order']);
                },
                'sub_pembahasan'
            ])
            ->select(['id', 'id_mapel', 'judul_kursus', 'deskripsi_kursus', 'url_thumbnail', 'created_at', 'class'])
            ->latest(); // Order by latest first

            // Filter courses by user's class - only show courses where user's class matches
            if ($userClass) {
                $query->whereJsonContains('class', $userClass);
            } else {
                // If user has no class assigned, don't show any courses
                $query->whereRaw('1 = 0'); // This will return no results
            }

            if ($id !== null) {
                // Get specific course
                $course = $query->find($id);

                if (!$course) {
                    Log::warning('Course not found for ID: ' . $id);
                    return response()->json([
                        'message' => "User doesn't have any course yet",
                        'kursus' => []
                    ]);
                }

                Log::info('Found course:', ['course' => $course->toArray()]);
                return response()->json([
                    'kursus' => [$course] // Wrap single course in array for consistent format
                ]);
            }

            // Get all courses
            $courses = $query->get();

            // dikomen aja lah ya :v
            // if ($courses->isEmpty()) {
            //     Log::info('No courses found');
            //     return response()->json([
            //         'message' => 'No courses found',
            //         'kursus' => []
            //     ]);
            // }

            Log::info('Found courses:', ['count' => $courses->count()]);
            return response()->json([
                'kursus' => $courses
            ]);
        } catch (\Exception $e) {
            Log::error('Error in getDataCourseku: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'message' => 'Failed to load courses. Please try again later.',
                'kursus' => []
            ], 500);
        }
    }

    /**
     * Get quiz submissions for a specific course and user
     */
    public function getQuizSubmissions($courseId)
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            if (!$this->userCanAccessCourse($user, (int) $courseId)) {
                return response()->json([
                    'message' => 'Anda tidak memiliki akses ke kursus ini.',
                ], 403);
            }

            $submissions = QuizSubmission::where('user_id', $user->id)
                ->where('course_id', $courseId)
                ->with(['quizContent:id,title,type'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($submission) {
                    return [
                        'id' => $submission->id,
                        'quiz_content_id' => $submission->quiz_content_id,
                        'quiz_title' => $submission->quizContent->title ?? 'Unknown Quiz',
                        'score' => $submission->score,
                        'submitted_at' => $submission->submitted_at,
                        'passed' => $submission->score >= 70, // Assuming 70% is passing
                    ];
                });

            return response()->json([
                'submissions' => $submissions
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching quiz submissions: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching quiz submissions'], 500);
        }
    }

    public function updateProgress(Request $request)
    {
        $user = auth()->user();
        if (!$user || $user->tipe_user !== 'siswa') {
            return response()->json([
                'message' => 'Hanya siswa yang dapat memperbarui progress.',
            ], 403);
        }

        $validated = $request->validate([
            'siswa_id'=> 'required|exists:users,id',
            'kursus_id'=> 'required|exists:kursus,id',
            'id_sub_pembahasan'=> 'required|exists:sub_pembahasan,id',
            'status'=> 'required|in:belum dimulai,sedang berlangsung,selesai',
            'progress_per_subbab' => 'nullable|integer', // 1 (Video), 2 (PDF), 3 (Quiz)
        ], [
            'siswa_id.required' => 'ID siswa wajib diisi.',
            'siswa_id.exists' => 'Siswa tidak ditemukan.',
            'kursus_id.required' => 'ID kursus wajib diisi.',
            'kursus_id.exists' => 'Kursus tidak ditemukan.',
            'id_sub_pembahasan.required' => 'ID sub pembahasan wajib diisi.',
            'id_sub_pembahasan.exists' => 'Sub pembahasan tidak ditemukan.',
            'status.required' => 'Status wajib diisi.',
            'status.in' => 'Status harus salah satu dari: belum dimulai, sedang berlangsung, selesai.',
            'progress_per_subbab.integer' => 'Progress per subbab harus berupa angka.',
        ]);

        if ((int) $validated['siswa_id'] !== (int) $user->id) {
            return response()->json([
                'message' => 'Anda tidak dapat mengubah progress siswa lain.',
            ], 403);
        }

        if (!$this->userCanAccessCourse($user, (int) $validated['kursus_id'])) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke kursus ini.',
            ], 403);
        }

        $subBelongsToCourse = SubPembahasan::where('id', $validated['id_sub_pembahasan'])
            ->where('id_kursus', $validated['kursus_id'])
            ->exists();

        if (!$subBelongsToCourse) {
            return response()->json([
                'message' => 'Sub pembahasan tidak sesuai dengan kursus.',
            ], 422);
        }

        $progress = $this->upsertProgressWithoutDowngrade(
            (int) $validated['siswa_id'],
            (int) $validated['kursus_id'],
            (int) $validated['id_sub_pembahasan'],
            (int) ($validated['progress_per_subbab'] ?? 0),
            (string) $validated['status']
        );

        if ($progress->wasRecentlyCreated) {
            return response()->json([
                'message' => 'Progress awal berhasil disimpan.',
            ]);
        }

        return response()->json([
            'message' => 'Progress berhasil disimpan.',
            'progress' => $progress,
        ]);
    }

    /**
     * Get completed videos for a specific course and user
     */
    public function getCompletedVideos($courseId)
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            if (!$this->userCanAccessCourse($user, (int) $courseId)) {
                return response()->json([
                    'message' => 'Anda tidak memiliki akses ke kursus ini.',
                ], 403);
            }

            // Get all video content for this course
            $videoContents = CourseContent::where('kursus_id', $courseId)
                ->where('type', 'video')
                ->get();

            $quizCompletedSubLookup = $this->getQuizCompletedSubLookup((int) $user->id, (int) $courseId);
            $completedVideoIds = [];
            foreach ($videoContents as $content) {
                $effectiveProgress = $this->getEffectiveProgressValueForSub(
                    (int) $user->id,
                    (int) $courseId,
                    (int) $content->sub_pembahasan_id,
                    $quizCompletedSubLookup
                );
                $isCompleted = $effectiveProgress >= 1;

                if ($isCompleted) {
                    // Extract YouTube video ID from URL
                    $videoId = $this->extractYouTubeVideoId($content->url);
                    if ($videoId) {
                        $completedVideoIds[] = $videoId;
                    }
                }
            }

            return response()->json([
                'completedVideos' => $completedVideoIds
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching completed videos: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching completed videos'], 500);
        }
    }

    /**
     * Get downloaded PDFs for a specific course and user
     */
    public function getDownloadedPDFs($courseId)
    {
        try {
            $user = auth()->user();

            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            if (!$this->userCanAccessCourse($user, (int) $courseId)) {
                return response()->json([
                    'message' => 'Anda tidak memiliki akses ke kursus ini.',
                ], 403);
            }

            // Get all PDF content for this course
            $pdfContents = CourseContent::where('kursus_id', $courseId)
                ->where('type', 'pdf')
                ->get();

            $quizCompletedSubLookup = $this->getQuizCompletedSubLookup((int) $user->id, (int) $courseId);
            $downloadedPDFs = [];
            foreach ($pdfContents as $content) {
                $effectiveProgress = $this->getEffectiveProgressValueForSub(
                    (int) $user->id,
                    (int) $courseId,
                    (int) $content->sub_pembahasan_id,
                    $quizCompletedSubLookup
                );
                $isDownloaded = $effectiveProgress >= 2;

                if ($isDownloaded) {
                    // Extract PDF filename from URL
                    $pdfFilename = $content->url ? basename($content->url) : null;
                    if ($pdfFilename) {
                        $downloadedPDFs[] = $pdfFilename;
                    }
                }
            }

            return response()->json([
                'downloadedPDFs' => $downloadedPDFs
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching downloaded PDFs: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching downloaded PDFs'], 500);
        }
    }

    /**
     * Save video completion progress to database
     */
    public function saveVideoCompletion(Request $request)
    {
        try {
            $user = auth()->user();

            if (!$user || $user->tipe_user !== 'siswa') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Hanya siswa yang dapat menyimpan progress.'
                ], 403);
            }

            $validated = $request->validate([
                'course_id' => 'required|exists:kursus,id',
                'content_id' => 'required|exists:course_contents,id',
                'video_id' => 'required|string',
                'duration' => 'required|integer'
            ], [
                'course_id.required' => 'Kursus wajib diisi.',
                'course_id.exists' => 'Kursus tidak ditemukan.',
                'content_id.required' => 'Konten wajib diisi.',
                'content_id.exists' => 'Konten tidak ditemukan.',
                'video_id.required' => 'Video ID wajib diisi.',
                'video_id.string' => 'Video ID harus berupa teks.',
                'duration.required' => 'Durasi wajib diisi.',
                'duration.integer' => 'Durasi harus berupa angka.',
            ]);

            if (!$this->userCanAccessCourse($user, (int) $validated['course_id'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki akses ke kursus ini.',
                ], 403);
            }

            $content = CourseContent::where('id', $validated['content_id'])
                ->where('kursus_id', $validated['course_id'])
                ->where('type', 'video')
                ->first();

            if (!$content) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Konten video tidak valid untuk kursus ini.',
                ], 422);
            }

            // Save progress as completed - using progress_per_subbab = 1 for video completion
            $progress = $this->upsertProgressWithoutDowngrade(
                (int) $user->id,
                (int) $validated['course_id'],
                (int) $content->sub_pembahasan_id,
                1,
                'selesai'
            );

            // Track activity
            StudentActivity::trackActivity($user->id, 'video_completion', [
                'course_id' => $validated['course_id'],
                'metadata' => [
                    'content_id' => $validated['content_id'],
                    'video_id' => $validated['video_id'],
                    'duration' => $validated['duration'],
                ],
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Video completion saved successfully',
                'progress' => $progress
            ]);
        } catch (\Exception $e) {
            Log::error('Error saving video completion: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to save video completion'
            ], 500);
        }
    }

    /**
     * Save PDF download progress to database
     */
    public function savePDFDownload(Request $request)
    {
        try {
            $user = auth()->user();

            if (!$user || $user->tipe_user !== 'siswa') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Hanya siswa yang dapat menyimpan progress.'
                ], 403);
            }

            $validated = $request->validate([
                'course_id' => 'required|exists:kursus,id',
                'content_id' => 'required|exists:course_contents,id',
                'pdf_filename' => 'required|string'
            ], [
                'course_id.required' => 'Kursus wajib diisi.',
                'course_id.exists' => 'Kursus tidak ditemukan.',
                'content_id.required' => 'Konten wajib diisi.',
                'content_id.exists' => 'Konten tidak ditemukan.',
                'pdf_filename.required' => 'Nama file PDF wajib diisi.',
                'pdf_filename.string' => 'Nama file PDF harus berupa teks.',
            ]);

            if (!$this->userCanAccessCourse($user, (int) $validated['course_id'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki akses ke kursus ini.',
                ], 403);
            }

            $content = CourseContent::where('id', $validated['content_id'])
                ->where('kursus_id', $validated['course_id'])
                ->where('type', 'pdf')
                ->first();

            if (!$content) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Konten PDF tidak valid untuk kursus ini.',
                ], 422);
            }

            // Save progress as completed - using progress_per_subbab = 2 for PDF download
            $progress = $this->upsertProgressWithoutDowngrade(
                (int) $user->id,
                (int) $validated['course_id'],
                (int) $content->sub_pembahasan_id,
                2,
                'selesai'
            );

            // Track activity
            StudentActivity::trackActivity($user->id, 'pdf_download_completion', [
                'course_id' => $validated['course_id'],
                'metadata' => [
                    'content_id' => $validated['content_id'],
                    'pdf_filename' => $validated['pdf_filename'],
                ],
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'PDF download saved successfully',
                'progress' => $progress
            ]);
        } catch (\Exception $e) {
            Log::error('Error saving PDF download: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to save PDF download'
            ], 500);
        }
    }

    /**
     * Save quiz completion progress to database
     */
    public function saveQuizCompletion(Request $request)
    {
        try {
            $user = auth()->user();

            if (!$user || $user->tipe_user !== 'siswa') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Hanya siswa yang dapat menyimpan progress.'
                ], 403);
            }

            $validated = $request->validate([
                'course_id' => 'required|exists:kursus,id',
                'content_id' => 'required|exists:course_contents,id',
                'quiz_id' => 'required|exists:course_contents,id',
                'score' => 'required|numeric|min:0|max:100'
            ], [
                'course_id.required' => 'Kursus wajib diisi.',
                'course_id.exists' => 'Kursus tidak ditemukan.',
                'content_id.required' => 'Konten wajib diisi.',
                'content_id.exists' => 'Konten tidak ditemukan.',
                'quiz_id.required' => 'Kuis wajib diisi.',
                'quiz_id.exists' => 'Kuis tidak ditemukan.',
                'score.required' => 'Skor wajib diisi.',
                'score.numeric' => 'Skor harus berupa angka.',
                'score.min' => 'Skor minimal 0.',
                'score.max' => 'Skor maksimal 100.',
            ]);

            if (!$this->userCanAccessCourse($user, (int) $validated['course_id'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki akses ke kursus ini.',
                ], 403);
            }

            $content = CourseContent::where('id', $validated['content_id'])
                ->where('kursus_id', $validated['course_id'])
                ->where('type', 'quiz')
                ->first();

            $quizContent = CourseContent::where('id', $validated['quiz_id'])
                ->where('kursus_id', $validated['course_id'])
                ->where('type', 'quiz')
                ->first();

            if (!$content || !$quizContent) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data kuis tidak valid untuk kursus ini.',
                ], 422);
            }

            // Save progress as completed - using progress_per_subbab = 3 for quiz completion
            $progress = $this->upsertProgressWithoutDowngrade(
                (int) $user->id,
                (int) $validated['course_id'],
                (int) $content->sub_pembahasan_id,
                3,
                'selesai'
            );

            // Also save the quiz submission
            $quizSubmission = QuizSubmission::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'course_id' => $validated['course_id'],
                    'quiz_content_id' => $quizContent->id,
                ],
                [
                    'score' => $validated['score'],
                    'submitted_at' => now(),
                ]
            );

            // Track activity
            StudentActivity::trackActivity($user->id, 'quiz_completion_progress', [
                'course_id' => $validated['course_id'],
                'quiz_id' => $quizContent->id,
                'metadata' => [
                    'content_id' => $validated['content_id'],
                    'score' => $validated['score'],
                ],
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Quiz completion saved successfully',
                'progress' => $progress,
                'quiz_submission' => $quizSubmission
            ]);
        } catch (\Exception $e) {
            Log::error('Error saving quiz completion: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to save quiz completion'
            ], 500);
        }
    }

    private function upsertProgressWithoutDowngrade(
        int $studentId,
        int $courseId,
        int $subPembahasanId,
        int $requestedProgress,
        string $requestedStatus
    ): ProgressCourse {
        $requestedProgress = max(0, min(3, $requestedProgress));

        $progressQuery = ProgressCourse::where('id_siswa', $studentId)
            ->where('id_kursus', $courseId)
            ->where('id_sub_pembahasan', $subPembahasanId);

        $maxSavedProgress = (int) ((clone $progressQuery)->max('progress_per_subbab') ?? 0);
        $resolvedProgress = max($maxSavedProgress, $requestedProgress);

        $resolvedStatus = $requestedStatus;
        if ($resolvedProgress >= 3) {
            $resolvedStatus = 'selesai';
        } elseif ($resolvedProgress > 0 && $resolvedStatus === 'belum dimulai') {
            $resolvedStatus = 'sedang berlangsung';
        }

        $latestProgress = (clone $progressQuery)->latest('id')->first();
        if ($latestProgress) {
            (clone $progressQuery)->update([
                'progress_per_subbab' => $resolvedProgress,
                'status' => $resolvedStatus,
            ]);

            return $latestProgress->refresh();
        }

        return ProgressCourse::create([
            'id_siswa' => $studentId,
            'id_kursus' => $courseId,
            'id_sub_pembahasan' => $subPembahasanId,
            'progress_per_subbab' => $resolvedProgress,
            'status' => $resolvedStatus,
        ]);
    }

    /**
     * @return array<int, bool>
     */
    private function getQuizCompletedSubLookup(int $studentId, int $courseId): array
    {
        $subIds = QuizSubmission::query()
            ->where('user_id', $studentId)
            ->where('course_id', $courseId)
            ->join('course_contents', 'quiz_submissions.quiz_content_id', '=', 'course_contents.id')
            ->pluck('course_contents.sub_pembahasan_id')
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        return array_fill_keys($subIds, true);
    }

    /**
     * @param array<int, bool> $quizCompletedSubLookup
     */
    private function getEffectiveProgressValueForSub(
        int $studentId,
        int $courseId,
        int $subPembahasanId,
        array $quizCompletedSubLookup
    ): int {
        $progressValue = (int) (ProgressCourse::query()
            ->where('id_siswa', $studentId)
            ->where('id_kursus', $courseId)
            ->where('id_sub_pembahasan', $subPembahasanId)
            ->max('progress_per_subbab') ?? 0);

        if (isset($quizCompletedSubLookup[$subPembahasanId])) {
            $progressValue = max($progressValue, 3);
        }

        return $progressValue;
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

    public function openLearnPage($id)
    {
        $user = auth()->user();
        if (!$user || $user->tipe_user !== 'siswa') {
            abort(403);
        }

        $courseId = (int) $id;
        if (!$this->userCanAccessCourse($user, $courseId)) {
            abort(403);
        }

        // Ensure student-course relation exists once student starts learning.
        $user->kursus()->syncWithoutDetaching([$courseId]);

        return Inertia::render('dashboard/courses/[id]/learn/page', ['id' => $courseId]);
    }

    /**
     * Extract YouTube video ID from URL
     */
    private function extractYouTubeVideoId($url)
    {
        if (!$url) return null;

        $regExp = '/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/';
        preg_match($regExp, $url, $matches);
        return isset($matches[1]) ? $matches[1] : null;
    }

    public function learn($id)
    {
        $mockCourse = [
            'id' => (int)$id,
            'title' => 'Administrasi Sistem Jaringan',
            'subtitle' => 'dari Nol',
            'category' => 'System Admin',
            'description' => 'Pelajari dasar-dasar administrasi sistem dan jaringan untuk mengelola infrastruktur IT.',
            'longDescription' => 'Kursus ini dirancang untuk pemula yang ingin memahami dasar-dasar administrasi sistem dan jaringan. Anda akan mempelajari konsep dasar sistem operasi Linux, konfigurasi server, manajemen jaringan, dan praktik terbaik dalam pengelolaan infrastruktur IT.',
            'level' => 'Beginner',
            'duration' => '15 jam',
            'language' => 'Bahasa Indonesia',
            'certification' => 'Sertifikat Penyelesaian',
            'enrollmentStatus' => 'Free Access',
            'startDate' => '2023-09-10',
            'endDate' => '2023-12-10',
            'price' => 'Free',
            'prerequisites' => ['Pengetahuan dasar komputer', 'Koneksi internet'],
            'objectives' => [
                'Memahami dasar-dasar sistem operasi Linux',
                'Menguasai konfigurasi server dasar',
                'Memahami manajemen jaringan',
                'Menerapkan praktik terbaik administrasi sistem'
            ],
            'instructor' => [
                'name' => 'John Doe',
                'title' => 'Senior System Administrator',
                'bio' => 'Pengalaman 10+ tahun dalam administrasi sistem dan jaringan',
                'avatar' => '/images/instructor.jpg'
            ],
            'rating' => 4.8,
            'reviewCount' => 120,
            'studentsEnrolled' => 500,
            'portal' => 'LMS',
            'bgColor' => '#4F46E5',
            'syllabus' => [
                [
                    'id' => 1,
                    'title' => 'Pengenalan Sistem Operasi Linux',
                    'lessons' => [
                        [
                            'id' => 101,
                            'title' => 'Apa itu Linux?',
                            'type' => 'video',
                            'duration' => '15 menit',
                            'description' => 'Pengenalan dasar sistem operasi Linux'
                        ],
                        [
                            'id' => 102,
                            'title' => 'Instalasi Linux',
                            'type' => 'video',
                            'duration' => '20 menit',
                            'description' => 'Panduan instalasi Linux untuk pemula'
                        ]
                    ]
                ],
                [
                    'id' => 2,
                    'title' => 'Dasar-dasar Command Line',
                    'lessons' => [
                        [
                            'id' => 201,
                            'title' => 'Navigasi File System',
                            'type' => 'video',
                            'duration' => '15 menit',
                            'description' => 'Belajar navigasi menggunakan command line'
                        ],
                        [
                            'id' => 202,
                            'title' => 'Manipulasi File dan Direktori',
                            'type' => 'video',
                            'duration' => '20 menit',
                            'description' => 'Operasi dasar file dan direktori'
                        ]
                    ]
                ]
            ]
        ];

        return Inertia::render('dashboard/courses/[id]/learn/page', [
            'course' => $mockCourse
        ]);
    }
}
