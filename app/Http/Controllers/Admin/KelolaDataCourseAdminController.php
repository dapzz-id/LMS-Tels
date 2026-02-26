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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

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
            $request->validate([
                'file' => 'required|file|mimes:pdf|mimetypes:application/pdf|max:10240',
            ], [
                'file.required' => 'File wajib diunggah.',
                'file.file' => 'File tidak valid.',
                'file.mimes' => 'Format file harus PDF.',
                'file.max' => 'Ukuran file maksimal 10240 KB.',
            ]);

            $file = $request->file('file');
            if ($file === null) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'File tidak valid.',
                ], 422);
            }

            $stored = $this->storePdfFile($file, 'pdfs');

            return response()->json([
                'status' => 'success',
                'message' => 'PDF berhasil diunggah.',
                'url' => $stored['url'],
                'filename' => $stored['filename'],
                'size' => $stored['size'],
            ]);
        } catch (RuntimeException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Admin PDF upload error', ['error' => $e->getMessage()]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengunggah PDF.',
            ], 500);
        }
    }

    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|image|mimes:jpeg,png,jpg,webp,gif|mimetypes:image/jpeg,image/png,image/webp,image/gif|max:5120',
            ], [
                'file.required' => 'File wajib diunggah.',
                'file.file' => 'File tidak valid.',
                'file.mimes' => 'Format file harus jpeg, png, jpg, webp, atau gif.',
                'file.max' => 'Ukuran file maksimal 5120 KB.',
            ]);

            $file = $request->file('file');
            if ($file === null) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'File tidak valid.',
                ], 422);
            }

            $stored = $this->storeImageWithoutMetadata($file, 'images');

            return response()->json([
                'status' => 'success',
                'message' => 'Gambar berhasil diunggah.',
                'url' => $stored['url'],
                'filename' => $stored['filename'],
                'size' => $stored['size'],
            ]);
        } catch (RuntimeException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Admin image upload error', ['error' => $e->getMessage()]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengunggah gambar.',
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
                'pembahasan.*.contents.*.duration' => 'nullable|integer|min:0',
                'pembahasan.*.contents.*.is_required' => 'boolean',
                'pembahasan.*.contents.*.points' => 'integer|min:0',
                'pembahasan.*.contents.*.passing_score' => 'nullable|integer|min:0',
                'pembahasan.*.contents.*.quiz_data' => 'required_if:pembahasan.*.contents.*.type,quiz|array',
                'pembahasan.*.contents.*.quiz_data.timeLimit' => 'nullable|integer|min:1|max:60',
                'pembahasan.*.contents.*.quiz_data.passingScore' => 'nullable|integer|min:0|max:100',
                'pembahasan.*.contents.*.quiz_data.totalPoints' => 'nullable|integer|min:0',
                'pembahasan.*.contents.*.quiz_data.questions' => 'required_if:pembahasan.*.contents.*.type,quiz|array|min:1',
                'pembahasan.*.contents.*.quiz_data.questions.*.question' => 'nullable|string',
                'pembahasan.*.contents.*.quiz_data.questions.*.options' => 'required|array|size:4',
                'pembahasan.*.contents.*.quiz_data.questions.*.options.*' => 'nullable|string',
                'pembahasan.*.contents.*.quiz_data.questions.*.correctAnswer' => 'required|integer|min:0|max:3',
                'pembahasan.*.contents.*.quiz_data.questions.*.points' => 'nullable|integer|min:0',
                'pembahasan.*.contents.*.quiz_data.questions.*.imageUrl' => 'nullable|string', // Add this line for image support
                'pembahasan.*.contents.*.quiz_data.questions.*.optionImages' => 'nullable|array', // Add this line for option images support
                'pembahasan.*.contents.*.quiz_data.questions.*.optionImages.*' => 'nullable|string', // Add this line for option images support
            ];

            $messages = [
                'required' => 'Kolom :attribute wajib diisi.',
                'required_if' => 'Kolom :attribute wajib diisi jika :other bernilai :values.',
                'required_without' => 'Kolom :attribute wajib diisi jika :values tidak diisi.',
                'exists' => 'Data :attribute tidak ditemukan.',
                'string' => 'Kolom :attribute harus berupa teks.',
                'min' => 'Kolom :attribute minimal :min.',
                'max' => 'Kolom :attribute maksimal :max.',
                'file' => 'File :attribute tidak valid.',
                'mimes' => 'Format :attribute harus: :values.',
                'url' => 'Format :attribute tidak valid.',
                'integer' => 'Kolom :attribute harus berupa angka.',
                'array' => 'Kolom :attribute harus berupa array.',
                'boolean' => 'Kolom :attribute harus bernilai true atau false.',
                'in' => 'Kolom :attribute harus salah satu dari: :values.',
                'size' => 'Kolom :attribute harus berisi :size item.',
            ];

            $validator = Validator::make($input, $rules, $messages);
            $this->setCourseValidationAttributes($validator);
            $this->attachQuizConditionalValidation($validator, $input);

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

            // Upload thumbnail if present (re-encode to strip metadata).
            $thumbnailUrl = $request->input('url_thumbnail');
            if ($request->hasFile('thumbnail')) {
                $thumbnailFile = $request->file('thumbnail');
                if ($thumbnailFile !== null) {
                    $thumbnailUpload = $this->storeImageWithoutMetadata($thumbnailFile, 'thumbnails');
                    $thumbnailUrl = $thumbnailUpload['url'];
                }
            }

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
                'pembahasan.*.contents.*.quiz_data.questions.*.question' => 'nullable|string',
                'pembahasan.*.contents.*.quiz_data.questions.*.options' => 'required|array|size:4',
                'pembahasan.*.contents.*.quiz_data.questions.*.options.*' => 'nullable|string',
                'pembahasan.*.contents.*.quiz_data.questions.*.correctAnswer' => 'required|integer|min:0|max:3',
                'pembahasan.*.contents.*.quiz_data.questions.*.imageUrl' => 'nullable|string', // Add this line for image support
                'pembahasan.*.contents.*.quiz_data.questions.*.optionImages' => 'nullable|array', // Add this line for option images support
                'pembahasan.*.contents.*.quiz_data.questions.*.optionImages.*' => 'nullable|string', // Add this line for option images support
            ];

            $messages = [
                'required' => 'Kolom :attribute wajib diisi.',
                'required_if' => 'Kolom :attribute wajib diisi jika :other bernilai :values.',
                'exists' => 'Data :attribute tidak ditemukan.',
                'string' => 'Kolom :attribute harus berupa teks.',
                'min' => 'Kolom :attribute minimal :min.',
                'max' => 'Kolom :attribute maksimal :max.',
                'file' => 'File :attribute tidak valid.',
                'mimes' => 'Format :attribute harus: :values.',
                'url' => 'Format :attribute tidak valid.',
                'integer' => 'Kolom :attribute harus berupa angka.',
                'array' => 'Kolom :attribute harus berupa array.',
                'boolean' => 'Kolom :attribute harus bernilai true atau false.',
                'in' => 'Kolom :attribute harus salah satu dari: :values.',
                'size' => 'Kolom :attribute harus berisi :size item.',
            ];

            $validator = Validator::make($input, $rules, $messages);
            $this->setCourseValidationAttributes($validator);
            $this->attachQuizConditionalValidation($validator, $input);

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
            $existingThumbnail = $kursus->getRawOriginal('url_thumbnail');
            $thumbnailUrl = $existingThumbnail; // Default to existing thumbnail

            if ($request->hasFile('thumbnail')) {
                // Delete old thumbnail if it exists and is stored locally
                if ($existingThumbnail && str_starts_with($existingThumbnail, '/storage/')) {
                    $oldPath = ltrim(str_replace('/storage/', '', $existingThumbnail), '/');
                    Storage::disk('public')->delete($oldPath);
                }

                // Upload new thumbnail (re-encode to strip metadata).
                $thumbnailFile = $request->file('thumbnail');
                if ($thumbnailFile !== null) {
                    $thumbnailUpload = $this->storeImageWithoutMetadata($thumbnailFile, 'thumbnails');
                    $thumbnailUrl = $thumbnailUpload['url'];
                }
            } elseif (isset($input['keep_existing_thumbnail']) && !$input['keep_existing_thumbnail']) {
                // User wants to remove thumbnail
                if ($existingThumbnail && str_starts_with($existingThumbnail, '/storage/')) {
                    $oldPath = ltrim(str_replace('/storage/', '', $existingThumbnail), '/');
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

    private function setCourseValidationAttributes($validator): void
    {
        $validator->setAttributeNames([
            'id_mapel' => 'mata pelajaran',
            'judul_kursus' => 'judul kursus',
            'deskripsi_kursus' => 'deskripsi kursus',
            'url_thumbnail' => 'thumbnail kursus',
            'pembahasan' => 'pembahasan',
            'pembahasan.*.title' => 'judul pembahasan',
            'pembahasan.*.description' => 'deskripsi pembahasan',
            'pembahasan.*.contents' => 'konten pembahasan',
            'pembahasan.*.contents.*.type' => 'tipe konten',
            'pembahasan.*.contents.*.title' => 'judul konten',
            'pembahasan.*.contents.*.description' => 'deskripsi konten',
            'pembahasan.*.contents.*.url' => 'URL konten',
            'pembahasan.*.contents.*.duration' => 'durasi konten',
            'pembahasan.*.contents.*.quiz_data.questions' => 'daftar soal quiz',
            'pembahasan.*.contents.*.quiz_data.questions.*.question' => 'teks pertanyaan quiz',
            'pembahasan.*.contents.*.quiz_data.questions.*.options' => 'pilihan jawaban quiz',
            'pembahasan.*.contents.*.quiz_data.questions.*.correctAnswer' => 'jawaban benar quiz',
        ]);
    }

    private function attachQuizConditionalValidation($validator, array $input): void
    {
        $validator->after(function ($validator) use ($input) {
            $pembahasanList = $input['pembahasan'] ?? [];
            if (!is_array($pembahasanList)) {
                return;
            }

            foreach ($pembahasanList as $pIndex => $pembahasan) {
                $contents = $pembahasan['contents'] ?? null;
                if (!is_array($contents)) {
                    continue;
                }

                foreach ($contents as $cIndex => $content) {
                    $contentType = $content['type'] ?? null;
                    if ($contentType !== 'quiz') {
                        continue;
                    }

                    $questions = $content['quiz_data']['questions'] ?? null;
                    if (!is_array($questions)) {
                        continue;
                    }

                    foreach ($questions as $qIndex => $question) {
                        $questionText = trim((string) ($question['question'] ?? ''));
                        $questionImage = trim((string) ($question['imageUrl'] ?? ''));

                        if ($questionText === '' && $questionImage === '') {
                            $validator->errors()->add(
                                "pembahasan.$pIndex.contents.$cIndex.quiz_data.questions.$qIndex.question",
                                'Pertanyaan quiz wajib diisi: tulis pertanyaan atau unggah gambar pertanyaan.'
                            );
                        }

                        $options = $question['options'] ?? [];
                        $optionImages = $question['optionImages'] ?? [];

                        for ($optionIndex = 0; $optionIndex < 4; $optionIndex++) {
                            $optionText = trim((string) ($options[$optionIndex] ?? ''));
                            $optionImage = trim((string) ($optionImages[$optionIndex] ?? ''));

                            if ($optionText === '' && $optionImage === '') {
                                $humanIndex = $optionIndex + 1;
                                $validator->errors()->add(
                                    "pembahasan.$pIndex.contents.$cIndex.quiz_data.questions.$qIndex.options.$optionIndex",
                                    "Pilihan jawaban ke-$humanIndex wajib diisi: teks atau gambar."
                                );
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * @return array{path:string,url:string,filename:string,size:int}
     */
    private function storePdfFile($file, string $directory): array
    {
        $filename = sprintf('%s_%s.pdf', now()->format('YmdHis'), Str::random(8));
        $path = $file->storeAs(trim($directory, '/'), $filename, 'public');

        return [
            'path' => $path,
            'url' => '/storage/'.ltrim($path, '/'),
            'filename' => $filename,
            'size' => $file->getSize() ?: 0,
        ];
    }

    /**
     * @return array{path:string,url:string,filename:string,size:int}
     */
    private function storeImageWithoutMetadata($file, string $directory): array
    {
        $binary = file_get_contents($file->getRealPath());
        if ($binary === false) {
            throw new RuntimeException('Gagal membaca file gambar.');
        }

        $imageInfo = @getimagesizefromstring($binary);
        $mime = $imageInfo['mime'] ?? null;

        $allowedMimes = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
        ];

        if (!$mime || !array_key_exists($mime, $allowedMimes)) {
            throw new RuntimeException('Format gambar tidak didukung.');
        }

        $resource = @imagecreatefromstring($binary);
        if ($resource === false) {
            throw new RuntimeException('File gambar tidak valid.');
        }

        $extension = $allowedMimes[$mime];
        $filename = sprintf('%s_%s.%s', now()->format('YmdHis'), Str::random(8), $extension);

        $tempPath = tempnam(sys_get_temp_dir(), 'img_');
        if ($tempPath === false) {
            imagedestroy($resource);
            throw new RuntimeException('Gagal memproses file gambar.');
        }

        $outputPath = $tempPath.'.'.$extension;
        @rename($tempPath, $outputPath);

        $written = match ($mime) {
            'image/jpeg' => imagejpeg($resource, $outputPath, 85),
            'image/png' => imagepng($resource, $outputPath, 6),
            'image/gif' => imagegif($resource, $outputPath),
            'image/webp' => function_exists('imagewebp')
                ? imagewebp($resource, $outputPath, 85)
                : false,
            default => false,
        };

        imagedestroy($resource);

        if ($written === false) {
            @unlink($outputPath);
            throw new RuntimeException('Gagal memproses file gambar.');
        }

        $storedBinary = file_get_contents($outputPath);
        @unlink($outputPath);

        if ($storedBinary === false) {
            throw new RuntimeException('Gagal memproses file gambar.');
        }

        $path = trim($directory, '/').'/'.$filename;
        $stored = Storage::disk('public')->put($path, $storedBinary);

        if (!$stored) {
            throw new RuntimeException('Gagal menyimpan file gambar.');
        }

        return [
            'path' => $path,
            'url' => '/storage/'.ltrim($path, '/'),
            'filename' => $filename,
            'size' => Storage::disk('public')->size($path),
        ];
    }

    public function updateClass(Request $request, Kursus $kursus)
    {
        try {
            $request->validate([
                'class' => 'nullable|array',
                'class.*' => 'string|max:255',
            ], [
                'class.array' => 'Kelas harus berupa array.',
                'class.*.string' => 'Setiap kelas harus berupa teks.',
                'class.*.max' => 'Nama kelas maksimal 255 karakter.',
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
            $thumbnail = $kursus->getRawOriginal('url_thumbnail');
            if ($thumbnail && str_starts_with($thumbnail, '/storage/')) {
                $thumbnailPath = ltrim(str_replace('/storage/', '', $thumbnail), '/');
                Storage::disk('public')->delete($thumbnailPath);
            }

            // Delete PDF files from sub_pembahasan
            foreach ($kursus->sub_pembahasan as $sub) {
                if ($sub->url_materi_pdf_sub_pembahasan && str_starts_with($sub->url_materi_pdf_sub_pembahasan, '/storage/')) {
                    $pdfPath = ltrim(str_replace('/storage/', '', $sub->url_materi_pdf_sub_pembahasan), '/');
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
