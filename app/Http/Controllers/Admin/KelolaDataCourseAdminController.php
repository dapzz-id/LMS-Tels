<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kursus;
use App\Models\Mapel;
use App\Models\CourseContent;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class KelolaDataCourseAdminController extends Controller
{
    public function index()
    {
        try {
            // Get available classes from users table
            $availableClasses = \App\Models\User::whereNotNull('class')
                ->where('class', '!=', '')
                ->distinct()
                ->pluck('class')
                ->filter()
                ->values()
                ->toArray();

            $kursus = Kursus::with(['mapel:id,nama_mapel', 'sub_pembahasan.contents'])
                ->select(['id', 'id_mapel', 'judul_kursus', 'deskripsi_kursus', 'url_thumbnail', 'class', 'created_at'])
                ->latest()
                ->get()
                ->map(function ($course) {
                    // Log the thumbnail URL for debugging
                    Log::info('Course thumbnail URL:', [
                        'course_id' => $course->id,
                        'course_title' => $course->judul_kursus,
                        'url_thumbnail' => $course->url_thumbnail,
                        'url_thumbnail_raw' => $course->getRawOriginal('url_thumbnail'),
                        'url_thumbnail_type' => gettype($course->url_thumbnail)
                    ]);

                    return [
                        'id' => $course->id,
                        'id_mapel' => $course->id_mapel,
                        'judul_kursus' => $course->judul_kursus,
                        'deskripsi_kursus' => $course->deskripsi_kursus,
                        'url_thumbnail' => $course->url_thumbnail,
                        'class' => $course->class ?? [],
                        'created_at' => $course->created_at->format('Y-m-d H:i:s'),
                        'mapel' => $course->mapel ? [
                            'id' => $course->mapel->id,
                            'nama_mapel' => $course->mapel->nama_mapel
                        ] : null,
                        'content_count' => $course->sub_pembahasan->sum(function ($sub) {
                            return $sub->contents->count();
                        })
                    ];
                });

            return Inertia::render('admin/courses/page', [
                'courses' => $kursus,
                'availableClasses' => $availableClasses
            ]);
        } catch (Exception $e) {
            Log::error('Error fetching courses: ' . $e->getMessage());
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function create()
    {
        try {
            $mapel = Mapel::select(['id', 'nama_mapel'])->get();
            return Inertia::render('admin/courses/create', [
                'mapel' => $mapel
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Kursus $kursus)
    {
        try {
            // Load mapel, sub_pembahasan with their contents
            $kursus->load([
                'mapel:id,nama_mapel',
                'sub_pembahasan' => function($query) {
                    $query->orderBy('order')
                          ->with(['contents' => function($contentQuery) {
                              $contentQuery->orderBy('order');
                          }]);
                }
            ]);

            return Inertia::render('admin/courses/[id]/page', [
                'course' => $kursus
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    private function extractYoutubeId($url)
    {
        $pattern = '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i';
        if (preg_match($pattern, $url, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /**
     * Upload PDF file for course content
     */
    public function uploadPdf(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:pdf|max:10240', // 10MB max
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('file');

            // Generate unique filename
            $filename = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());

            // Store file in public/storage/pdfs directory
            $path = $file->storeAs('pdfs', $filename, 'public');

            // Return the storage path with leading slash to make it absolute
            $url = '/storage/' . $path;

            return response()->json([
                'status' => 'success',
                'message' => 'PDF uploaded successfully',
                'url' => $url,
                'filename' => $filename
            ]);

        } catch (\Exception $e) {
            Log::error('PDF upload error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    public function uploadImage(Request $request)
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:jpeg,png,jpg,webp,gif|max:5120', // 5MB max
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('file');

            // Generate unique filename
            $filename = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());

            // Store file in public/storage/images directory
            $path = $file->storeAs('images', $filename, 'public');

            // Return the storage path with leading slash to make it absolute
            $url = '/storage/' . $path;

            return response()->json([
                'status' => 'success',
                'message' => 'Image uploaded successfully',
                'url' => $url,
                'filename' => $filename
            ]);

        } catch (\Exception $e) {
            Log::error('Image upload error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('Incoming course creation request:', $request->all());

            // Decode JSON string to array if needed
            $input = $request->all();
            foreach (['pembahasan', 'prerequisites', 'learning_objectives', 'target_audience'] as $key) {
                if (isset($input[$key]) && is_string($input[$key])) {
                    $input[$key] = json_decode($input[$key], true);
                }
            }

            // Validation rules
            $rules = [
                'id_mapel' => 'required|exists:mapel,id',
                'judul_kursus' => 'required|string|min:3|max:255',
                'deskripsi_kursus' => 'required|string|min:10',
                'thumbnail' => 'nullable|file|mimes:jpeg,png,jpg,webp|max:5120',
                'url_thumbnail' => 'required_without:thumbnail|url|max:255',
                'estimated_duration' => 'nullable|integer|min:0',
                'prerequisites' => 'nullable|array',
                'prerequisites.*' => 'string',
                'learning_objectives' => 'nullable|array',
                'learning_objectives.*' => 'string',
                'target_audience' => 'nullable|array',
                'target_audience.*' => 'string',
                'class' => 'nullable|array',
                'class.*' => 'string|max:255',
                'is_featured' => 'boolean',
                'pembahasan' => 'nullable|array',
                'pembahasan.*.title' => 'required|string|min:3',
                'pembahasan.*.description' => 'required|string|min:10',
                'pembahasan.*.contents' => 'required|array|min:1',
                'pembahasan.*.contents.*.type' => 'required|in:video,pdf,quiz',
                'pembahasan.*.contents.*.title' => 'required|string|min:3',
                'pembahasan.*.contents.*.description' => 'required|string|min:10',
                'pembahasan.*.contents.*.url' => 'required_if:pembahasan.*.contents.*.type,video',
                'pembahasan.*.contents.*.duration' => 'required_if:pembahasan.*.contents.*.type,video|integer|min:0',
                'pembahasan.*.contents.*.is_required' => 'boolean',
                'pembahasan.*.contents.*.points' => 'integer|min:0',
                'pembahasan.*.contents.*.passing_score' => 'nullable|integer|min:0',
                'pembahasan.*.contents.*.quiz_data' => 'required_if:pembahasan.*.contents.*.type,quiz|array',
                'pembahasan.*.contents.*.quiz_data.timeLimit' => 'nullable|integer|min:1|max:60',
                'pembahasan.*.contents.*.quiz_data.passingScore' => 'nullable|integer|min:0|max:100',
                'pembahasan.*.contents.*.quiz_data.totalPoints' => 'nullable|integer|min:0',
                'pembahasan.*.contents.*.quiz_data.questions' => 'required_if:pembahasan.*.contents.*.type,quiz|array|min:1',
                'pembahasan.*.contents.*.quiz_data.questions.*.question' => 'required|string|min:1',
                'pembahasan.*.contents.*.quiz_data.questions.*.options' => 'required|array|size:4',
                'pembahasan.*.contents.*.quiz_data.questions.*.options.*' => 'required|string|min:1',
                'pembahasan.*.contents.*.quiz_data.questions.*.correctAnswer' => 'required|integer|min:0|max:3',
                'pembahasan.*.contents.*.quiz_data.questions.*.points' => 'nullable|integer|min:0',
                'pembahasan.*.contents.*.quiz_data.questions.*.imageUrl' => 'nullable|string', // Add this line for image support
                'pembahasan.*.contents.*.quiz_data.questions.*.optionImages' => 'nullable|array', // Add this line for option images support
                'pembahasan.*.contents.*.quiz_data.questions.*.optionImages.*' => 'nullable|string', // Add this line for option images support
            ];

            $validator = Validator::make($input, $rules);

            if ($validator->fails()) {
                Log::error('Validation failed:', $validator->errors()->toArray());
                Log::info('Input data for validation:', $input);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Handle class data - convert from JSON string if needed
            if (isset($input['class']) && is_string($input['class'])) {
                $input['class'] = json_decode($input['class'], true);
            }

            // Upload thumbnail if present
            $thumbnailUrl = $request->hasFile('thumbnail')
                ? '/storage/' . $request->file('thumbnail')->storeAs(
                    'thumbnails',
                    time() . '_' . $request->file('thumbnail')->getClientOriginalName(),
                    'public'
                )
                : $request->input('url_thumbnail');

            // Transaction untuk database
            DB::beginTransaction();

            $course = Kursus::create([
                'id_mapel' => $input['id_mapel'],
                'judul_kursus' => $input['judul_kursus'],
                'deskripsi_kursus' => $input['deskripsi_kursus'],
                'url_thumbnail' => $thumbnailUrl,
                'status' => "published",
                'estimated_duration' => $input['estimated_duration'] ?? null,
                'prerequisites' => $input['prerequisites'],
                'learning_objectives' => $input['learning_objectives'],
                'target_audience' => $input['target_audience'],
                'class' => $input['class'] ?? [],
                'is_featured' => $input['is_featured'] ?? false
            ]);

            // Simpan pembahasan dan kontennya
            foreach ($input['pembahasan'] as $index => $p) {
                // Create sub_pembahasan
                $sub = $course->sub_pembahasan()->create([
                    'title' => $p['title'],
                    'description' => $p['description'],
                    'order' => $index + 1
                ]);

                // Process each content type and update sub_pembahasan accordingly
                foreach ($p['contents'] as $contentIndex => $content) {
                    if ($content['type'] === 'video') {
                        $youtubeId = $this->extractYoutubeId($content['url']);
                        $videoUrl = $youtubeId
                            ? "https://www.youtube.com/embed/" . $youtubeId
                            : $content['url'];

                        $sub->update([
                            'video_title' => $content['title'],
                            'video_description' => $content['description'],
                            'url_video_sub_pembahasan' => $videoUrl,
                        ]);
                    } elseif ($content['type'] === 'pdf') {
                        $sub->update([
                            'pdf_title' => $content['title'],
                            'pdf_description' => $content['description'],
                            'url_materi_pdf_sub_pembahasan' => $content['url'] ?? null,
                        ]);
                    } elseif ($content['type'] === 'quiz') {
                        $sub->update([
                            'quiz_title' => $content['title'],
                            'quiz_description' => $content['description'],
                        ]);
                    }

                    // Also create content record for compatibility
                    $contentData = [
                        'kursus_id' => $course->id,
                        'sub_pembahasan_id' => $sub->id,
                        'type' => $content['type'],
                        'title' => $content['title'],
                        'description' => $content['description'],
                        'url' => $content['url'] ?? null,
                        'duration' => in_array($content['type'], ['video', 'quiz']) ? ($content['duration'] ?? null) : null,
                        'is_required' => $content['is_required'] ?? true,
                        'points' => $content['points'] ?? 0,
                        'passing_score' => $content['passing_score'] ?? null,
                        'one_submission_only' => $content['one_submission_only'] ?? false,
                        'show_grades' => $content['show_grades'] ?? true,
                        'order' => $contentIndex + 1
                    ];

                    // Ensure YouTube embed URL for video content
                    if ($content['type'] === 'video' && !empty($content['url'])) {
                        $youtubeId = $this->extractYoutubeId($content['url']);
                        $contentData['url'] = $youtubeId
                            ? "https://www.youtube.com/embed/" . $youtubeId
                            : $content['url'];
                    }

                    if ($content['type'] === 'quiz' && isset($content['quiz_data'])) {
                        $contentData['quiz_data'] = json_encode($content['quiz_data']);
                    }

                    $course->contents()->create($contentData);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Course created successfully',
                'data' => [
                    'id' => $course->id,
                    'title' => $course->judul_kursus
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Course creation error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create course',
                'debug' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function checkStatus($id)
    {
        try {
            $course = Kursus::findOrFail($id);
            return response()->json([
                'status' => 'success',
                'data' => [
                    'course_status' => $course->status
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Course not found'
            ], 404);
        }
    }

    public function edit(Kursus $kursus)
    {
        try {
            $mapel = Mapel::select(['id', 'nama_mapel'])->get();

            // Get available classes from users table
            $availableClasses = \App\Models\User::whereNotNull('class')
                ->where('class', '!=', '')
                ->distinct()
                ->pluck('class')
                ->filter()
                ->values()
                ->toArray();

            // Load sub_pembahasan with their contents instead of direct contents
            $kursus->load([
                'mapel:id,nama_mapel',
                'sub_pembahasan' => function($query) {
                    $query->orderBy('order')
                          ->with(['contents' => function($contentQuery) {
                              $contentQuery->orderBy('order');
                          }]);
                }
            ]);

            return Inertia::render('admin/courses/[id]/edit', [
                'course' => $kursus,
                'mapel' => $mapel,
                'availableClasses' => $availableClasses
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Kursus $kursus)
    {
        try {
            Log::info('Incoming course update request:', $request->all());

            // Decode JSON string to array if needed
            $input = $request->all();
            foreach (['pembahasan', 'prerequisites', 'learning_objectives', 'target_audience'] as $key) {
                if (isset($input[$key]) && is_string($input[$key])) {
                    $input[$key] = json_decode($input[$key], true);
                }
            }

            // Handle class data - convert from JSON string if needed
            if (isset($input['class']) && is_string($input['class'])) {
                $input['class'] = json_decode($input['class'], true);
            }

            // Updated validation rules to match React frontend structure
            $rules = [
                'id_mapel' => 'required|exists:mapel,id',
                'judul_kursus' => 'required|string|min:3|max:255',
                'deskripsi_kursus' => 'required|string|min:10',
                'thumbnail' => 'nullable|file|mimes:jpeg,png,jpg,webp|max:5120',
                'estimated_duration' => 'nullable|integer|min:0',
                'prerequisites' => 'nullable|array',
                'prerequisites.*' => 'string',
                'learning_objectives' => 'nullable|array',
                'learning_objectives.*' => 'string',
                'target_audience' => 'nullable|array',
                'target_audience.*' => 'string',
                'class' => 'nullable|array',
                'class.*' => 'string|max:255',
                'is_featured' => 'nullable|boolean',
                'keep_existing_thumbnail' => 'nullable|boolean',
                // Fixed pembahasan validation rules
                'pembahasan' => 'nullable|array',
                'pembahasan.*.title' => 'required|string|min:3',
                'pembahasan.*.description' => 'required|string|min:10',
                'pembahasan.*.contents' => 'required|array|min:1',
                'pembahasan.*.contents.*.type' => 'required|in:video,pdf,quiz',
                'pembahasan.*.contents.*.title' => 'required|string|min:3',
                'pembahasan.*.contents.*.description' => 'required|string|min:10',
                'pembahasan.*.contents.*.url' => 'nullable|string',
                'pembahasan.*.contents.*.duration' => 'nullable|integer|min:0',
                'pembahasan.*.contents.*.is_required' => 'nullable|boolean',
                'pembahasan.*.contents.*.points' => 'nullable|integer|min:0',
                'pembahasan.*.contents.*.passing_score' => 'nullable|integer|min:0',
                // Quiz validation rules - Updated to match the correct structure
                'pembahasan.*.contents.*.quiz_data' => 'nullable|array',
                'pembahasan.*.contents.*.quiz_data.timeLimit' => 'nullable|integer|min:1|max:60',
                'pembahasan.*.contents.*.quiz_data.passingScore' => 'nullable|integer|min:0|max:100',
                'pembahasan.*.contents.*.quiz_data.questions' => 'required_if:pembahasan.*.contents.*.type,quiz|array|min:1',
                'pembahasan.*.contents.*.quiz_data.questions.*.question' => 'required|string|min:1',
                'pembahasan.*.contents.*.quiz_data.questions.*.options' => 'required|array|size:4',
                'pembahasan.*.contents.*.quiz_data.questions.*.options.*' => 'required|string|min:1',
                'pembahasan.*.contents.*.quiz_data.questions.*.correctAnswer' => 'required|integer|min:0|max:3',
                'pembahasan.*.contents.*.quiz_data.questions.*.imageUrl' => 'nullable|string', // Add this line for image support
                'pembahasan.*.contents.*.quiz_data.questions.*.optionImages' => 'nullable|array', // Add this line for option images support
                'pembahasan.*.contents.*.quiz_data.questions.*.optionImages.*' => 'nullable|string', // Add this line for option images support
            ];

            $validator = Validator::make($input, $rules);

            if ($validator->fails()) {
                Log::error('Validation failed:', $validator->errors()->toArray());
                Log::info('Input data for validation:', $input);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Convert string boolean values to actual booleans
            $input['keep_existing_thumbnail'] = filter_var($input['keep_existing_thumbnail'] ?? true, FILTER_VALIDATE_BOOLEAN);
            $input['is_featured'] = filter_var($input['is_featured'] ?? false, FILTER_VALIDATE_BOOLEAN);

            // Handle class data - convert from JSON string if needed
            if (isset($input['class']) && is_string($input['class'])) {
                $input['class'] = json_decode($input['class'], true);
            }

            // Handle thumbnail upload
            $thumbnailUrl = $kursus->url_thumbnail; // Default to existing thumbnail

            if ($request->hasFile('thumbnail')) {
                // Delete old thumbnail if it exists and is stored locally
                if ($kursus->url_thumbnail && str_starts_with($kursus->url_thumbnail, 'storage/')) {
                    $oldPath = str_replace('storage/', '', $kursus->url_thumbnail);
                    Storage::disk('public')->delete($oldPath);
                }

                // Upload new thumbnail
                $thumbnailPath = $request->file('thumbnail')->storeAs(
                    'thumbnails',
                    time() . '_' . $request->file('thumbnail')->getClientOriginalName(),
                    'public'
                );
                $thumbnailUrl = '/storage/' . $thumbnailPath;
            } elseif (isset($input['keep_existing_thumbnail']) && !$input['keep_existing_thumbnail']) {
                // User wants to remove thumbnail
                if ($kursus->url_thumbnail && str_starts_with($kursus->url_thumbnail, 'storage/')) {
                    $oldPath = str_replace('storage/', '', $kursus->url_thumbnail);
                    Storage::disk('public')->delete($oldPath);
                }
                $thumbnailUrl = null;
            }

            // Transaction untuk database
            DB::beginTransaction();

            $kursus->update([
                'id_mapel' => $input['id_mapel'],
                'judul_kursus' => $input['judul_kursus'],
                'deskripsi_kursus' => $input['deskripsi_kursus'],
                'url_thumbnail' => $thumbnailUrl,
                'status' => "published",
                'estimated_duration' => $input['estimated_duration'] ?? null,
                'prerequisites' => $input['prerequisites'] ?? [],
                'learning_objectives' => $input['learning_objectives'] ?? [],
                'target_audience' => $input['target_audience'] ?? [],
                'class' => $input['class'] ?? [],
                'is_featured' => $input['is_featured'] ?? false
            ]);

            // Clear existing content before adding new ones
            $kursus->sub_pembahasan()->delete();
            $kursus->contents()->delete();

            // Simpan pembahasan dan kontennya
            if (isset($input['pembahasan']) && is_array($input['pembahasan'])) {
                foreach ($input['pembahasan'] as $index => $p) {
                    $sub = $kursus->sub_pembahasan()->create([
                        'id_kursus' => $kursus->id,
                        'title' => $p['title'],
                        'description' => $p['description'],
                        'order' => $index + 1
                    ]);

                    // Process each content type and update sub_pembahasan accordingly
                    foreach ($p['contents'] as $contentIndex => $content) {
                        if ($content['type'] === 'video') {
                            $youtubeId = $this->extractYoutubeId($content['url']);
                            $videoUrl = $youtubeId
                                ? "https://www.youtube.com/embed/" . $youtubeId
                                : $content['url'];

                            $sub->update([
                                'video_title' => $content['title'],
                                'video_description' => $content['description'],
                                'url_video_sub_pembahasan' => $videoUrl,
                            ]);
                        } elseif ($content['type'] === 'pdf') {
                            $sub->update([
                                'pdf_title' => $content['title'],
                                'pdf_description' => $content['description'],
                                'url_materi_pdf_sub_pembahasan' => $content['url'] ?? null,
                            ]);
                        } elseif ($content['type'] === 'quiz') {
                            $sub->update([
                                'quiz_title' => $content['title'],
                                'quiz_description' => $content['description'],
                            ]);
                        }

                        // Also create content record for compatibility
                        $contentData = [
                            'kursus_id' => $kursus->id,
                            'sub_pembahasan_id' => $sub->id,
                            'type' => $content['type'],
                            'title' => $content['title'],
                            'description' => $content['description'],
                            'url' => $content['url'] ?? null,
                            'duration' => in_array($content['type'], ['video', 'quiz']) ? ($content['duration'] ?? null) : null,
                            'is_required' => $content['is_required'] ?? true,
                            'points' => $content['points'] ?? 0,
                            'passing_score' => $content['passing_score'] ?? null,
                            'one_submission_only' => $content['one_submission_only'] ?? false,
                            'show_grades' => $content['show_grades'] ?? true,
                            'order' => $contentIndex + 1
                        ];

                        // Ensure YouTube embed URL for video content
                        if ($content['type'] === 'video' && !empty($content['url'])) {
                            $youtubeId = $this->extractYoutubeId($content['url']);
                            $contentData['url'] = $youtubeId
                                ? "https://www.youtube.com/embed/" . $youtubeId
                                : $content['url'];
                        }

                        // Handle quiz data properly - FIXED to handle the new structure
                        if ($content['type'] === 'quiz' && isset($content['quiz_data'])) {
                            // Check if quiz_data is already in the correct format
                            if (is_array($content['quiz_data']) && isset($content['quiz_data']['timeLimit'])) {
                                // Already in correct format
                                $contentData['quiz_data'] = json_encode($content['quiz_data']);
                            } else if (is_array($content['quiz_data']) && isset($content['quiz_data'][0]['question'])) {
                                // Convert to the correct format
                                $quizStructure = [
                                    'timeLimit' => 30,
                                    'passingScore' => 70,
                                    'questions' => []
                                ];

                                foreach ($content['quiz_data'] as $question) {
                                    $quizStructure['questions'][] = [
                                        'question' => $question['question'] ?? '',
                                        'options' => $question['options'] ?? ['', '', '', ''],
                                        'correctAnswer' => $question['correctAnswer'] ?? 0,
                                        'timeLimit' => $question['timeLimit'] ?? null,
                                        'points' => $question['points'] ?? 10,
                                        'explanation' => $question['explanation'] ?? '',
                                        'imageUrl' => $question['imageUrl'] ?? null, // Ensure imageUrl is handled
                                        'optionImages' => $question['optionImages'] ?? null // Ensure optionImages is handled
                                    ];
                                }

                                $contentData['quiz_data'] = json_encode($quizStructure);
                            } else {
                                // Handle as string if it's already JSON
                                $contentData['quiz_data'] = is_string($content['quiz_data']) ? $content['quiz_data'] : json_encode($content['quiz_data']);
                            }
                        }

                        $sub->contents()->create($contentData);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Course updated successfully',
                'data' => [
                    'id' => $kursus->id,
                    'title' => $kursus->judul_kursus
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Course update error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update course',
                'debug' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function updateClass(Request $request, Kursus $kursus)
    {
        try {
            $request->validate([
                'class' => 'nullable|array',
                'class.*' => 'string|max:255',
            ]);

            $kursus->update([
                'class' => $request->input('class', [])
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Classes updated successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Kursus $kursus)
    {
        try {
            // Delete associated files before deleting the course
            if ($kursus->url_thumbnail && str_starts_with($kursus->url_thumbnail, 'storage/')) {
                $thumbnailPath = str_replace('storage/', '', $kursus->url_thumbnail);
                Storage::disk('public')->delete($thumbnailPath);
            }

            // Delete PDF files from sub_pembahasan
            foreach ($kursus->sub_pembahasan as $sub) {
                if ($sub->url_materi_pdf_sub_pembahasan && str_starts_with($sub->url_materi_pdf_sub_pembahasan, 'storage/')) {
                    $pdfPath = str_replace('storage/', '', $sub->url_materi_pdf_sub_pembahasan);
                    Storage::disk('public')->delete($pdfPath);
                }
            }

            // Force delete to bypass soft deletes and trigger cascade deletes
            $kursus->forceDelete();

            return response()->json([
                'status' => 'success',
                'message' => 'Kursus berhasil dihapus'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }
}
