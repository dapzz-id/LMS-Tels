<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Kursus;
use App\Models\Mapel;
use App\Models\CourseContent;
use App\Models\ProgressCourse;
use App\Models\QuizSubmission;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class TeacherCourseController extends Controller
{
    public function index()
    {
        try {
            $teacherId = auth()->id();

            $kursus = Kursus::with(['mapel:id,nama_mapel', 'sub_pembahasan.contents'])
                ->select(['id', 'id_mapel', 'teacher_id', 'judul_kursus', 'deskripsi_kursus', 'url_thumbnail', 'created_at', 'is_featured'])
                ->where('teacher_id', $teacherId) // Filter by teacher ID
                ->latest()
                ->get()
                ->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'id_mapel' => $course->id_mapel,
                        'judul_kursus' => $course->judul_kursus,
                        'deskripsi_kursus' => $course->deskripsi_kursus,
                        'url_thumbnail' => $course->url_thumbnail,
                        'created_at' => $course->created_at->format('Y-m-d H:i:s'),
                        'mapel' => $course->mapel ? [
                            'id' => $course->mapel->id,
                            'nama_mapel' => $course->mapel->nama_mapel
                        ] : null,
                        'content_count' => $course->sub_pembahasan->sum(function ($sub) {
                            return $sub->contents->count();
                        }),
                        'student_count' => DB::table('siswa_kursus')->where('id_kursus', $course->id)->count()
                    ];
                });

            return Inertia::render('teacher/courses/page', [
                'courses' => $kursus
            ]);
        } catch (Exception $e) {
            Log::error('Error fetching teacher courses: ' . $e->getMessage());
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

            // Get available classes from users table
            $availableClasses = \App\Models\User::whereNotNull('class')
                ->where('class', '!=', '')
                ->distinct()
                ->pluck('class')
                ->filter()
                ->values()
                ->toArray();

            return Inertia::render('teacher/courses/create', [
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

    public function show(Kursus $kursus)
    {
        try {
            // Check if the course belongs to the authenticated teacher
            if ($kursus->teacher_id !== auth()->id()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Unauthorized access to this course'
                ], 403);
            }

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

            return Inertia::render('teacher/courses/[id]/page', [
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
            Log::error('Teacher PDF upload error', ['error' => $e->getMessage()]);

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengunggah PDF.',
            ], 500);
        }
    }

    /**
     * Upload image file for quiz questions
     */
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
            Log::error('Teacher image upload error', ['error' => $e->getMessage()]);

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
            foreach (['pembahasan', 'prerequisites', 'learning_objectives', 'target_audience', 'class'] as $key) {
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
                'pembahasan.*.contents.*.quiz_data.questions' => 'required_if:pembahasan.*.contents.*.type,quiz|array|min:1',
                'pembahasan.*.contents.*.quiz_data.questions.*.question' => 'nullable|string|min:1',
                'pembahasan.*.contents.*.quiz_data.questions.*.options' => 'required|array|size:4',
                'pembahasan.*.contents.*.quiz_data.questions.*.options.*' => 'nullable|string|min:1',
                'pembahasan.*.contents.*.quiz_data.questions.*.correctAnswer' => 'required|integer|min:0|max:3',
                'pembahasan.*.contents.*.quiz_data.questions.*.imageUrl' => 'nullable|string',
                'pembahasan.*.contents.*.quiz_data.questions.*.optionImages' => 'nullable|array|size:4',
                'pembahasan.*.contents.*.quiz_data.questions.*.optionImages.*' => 'nullable|string',
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
                'pembahasan.*.contents.*.quiz_data.questions.required_if' => 'Untuk konten quiz, minimal 1 soal wajib diisi.',
                'pembahasan.*.contents.*.quiz_data.questions.*.options.size' => 'Setiap soal quiz harus memiliki tepat 4 pilihan jawaban.',
                'pembahasan.*.contents.*.quiz_data.questions.*.correctAnswer.required' => 'Jawaban benar untuk setiap soal quiz wajib dipilih.',
                'pembahasan.*.contents.*.quiz_data.questions.*.correctAnswer.min' => 'Jawaban benar tidak valid.',
                'pembahasan.*.contents.*.quiz_data.questions.*.correctAnswer.max' => 'Jawaban benar tidak valid.',
            ];

            $validator = Validator::make($input, $rules, $messages);
            $this->setCourseValidationAttributes($validator);
            $this->attachQuizConditionalValidation($validator, $input);

            if ($validator->fails()) {
                Log::error('Validation failed:', $validator->errors()->toArray());
                $firstError = $validator->errors()->first();
                return response()->json([
                    'status' => 'error',
                    'message' => $firstError ?: 'Validasi gagal. Mohon periksa data kursus dan quiz yang diisi.',
                    'errors' => $validator->errors()
                ], 422);
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
                'teacher_id' => auth()->id(), // Set teacher ID
                'judul_kursus' => $input['judul_kursus'],
                'deskripsi_kursus' => $input['deskripsi_kursus'],
                'url_thumbnail' => $thumbnailUrl,
                'status' => "published",
                'estimated_duration' => $input['estimated_duration'] ?? null,
                'prerequisites' => $input['prerequisites'],
                'learning_objectives' => $input['learning_objectives'],
                'target_audience' => $input['target_audience'],
                'is_featured' => $input['is_featured'] ?? false
            ]);

            // Simpan pembahasan dan kontennya
            if (isset($input['pembahasan']) && is_array($input['pembahasan'])) {
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

                        $sub->contents()->create($contentData);
                    }
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
            $course = Kursus::where('teacher_id', auth()->id())->findOrFail($id);
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
            // Check if the course belongs to the authenticated teacher
            if ($kursus->teacher_id !== auth()->id()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Unauthorized access to this course'
                ], 403);
            }

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

            return Inertia::render('teacher/courses/[id]/edit', [
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
            // Check if the course belongs to the authenticated teacher
            if ($kursus->teacher_id !== auth()->id()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Unauthorized access to this course'
                ], 403);
            }

            Log::info('Incoming course update request:', $request->all());

            // Decode JSON string to array if needed
            $input = $request->all();
            foreach (['pembahasan', 'prerequisites', 'learning_objectives', 'target_audience', 'class'] as $key) {
                if (isset($input[$key]) && is_string($input[$key])) {
                    $input[$key] = json_decode($input[$key], true);
                }
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
                // Quiz validation rules
                'pembahasan.*.contents.*.quiz_data' => 'nullable|array',
                'pembahasan.*.contents.*.quiz_data.timeLimit' => 'nullable|integer|min:1|max:60',
                'pembahasan.*.contents.*.quiz_data.passingScore' => 'nullable|integer|min:0|max:100',
                'pembahasan.*.contents.*.quiz_data.questions' => 'required_if:pembahasan.*.contents.*.type,quiz|array|min:1',
                'pembahasan.*.contents.*.quiz_data.questions.*.question' => 'nullable|string|min:1',
                'pembahasan.*.contents.*.quiz_data.questions.*.options' => 'required|array|size:4',
                'pembahasan.*.contents.*.quiz_data.questions.*.options.*' => 'nullable|string|min:1',
                'pembahasan.*.contents.*.quiz_data.questions.*.correctAnswer' => 'required|integer|min:0|max:3',
                'pembahasan.*.contents.*.quiz_data.questions.*.imageUrl' => 'nullable|string',
                'pembahasan.*.contents.*.quiz_data.questions.*.optionImages' => 'nullable|array|size:4',
                'pembahasan.*.contents.*.quiz_data.questions.*.optionImages.*' => 'nullable|string',
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
                'pembahasan.*.contents.*.quiz_data.questions.required_if' => 'Untuk konten quiz, minimal 1 soal wajib diisi.',
                'pembahasan.*.contents.*.quiz_data.questions.*.options.size' => 'Setiap soal quiz harus memiliki tepat 4 pilihan jawaban.',
                'pembahasan.*.contents.*.quiz_data.questions.*.correctAnswer.required' => 'Jawaban benar untuk setiap soal quiz wajib dipilih.',
                'pembahasan.*.contents.*.quiz_data.questions.*.correctAnswer.min' => 'Jawaban benar tidak valid.',
                'pembahasan.*.contents.*.quiz_data.questions.*.correctAnswer.max' => 'Jawaban benar tidak valid.',
            ];

            $validator = Validator::make($input, $rules, $messages);
            $this->setCourseValidationAttributes($validator);
            $this->attachQuizConditionalValidation($validator, $input);

            if ($validator->fails()) {
                Log::error('Validation failed:', $validator->errors()->toArray());
                $firstError = $validator->errors()->first();
                return response()->json([
                    'status' => 'error',
                    'message' => $firstError ?: 'Validasi gagal. Mohon periksa data kursus dan quiz yang diisi.',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Convert string boolean values to actual booleans
            $input['keep_existing_thumbnail'] = filter_var($input['keep_existing_thumbnail'] ?? true, FILTER_VALIDATE_BOOLEAN);
            $input['is_featured'] = filter_var($input['is_featured'] ?? false, FILTER_VALIDATE_BOOLEAN);

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
                'class' => $input['class'] ?? [],
                'status' => "published",
                'estimated_duration' => $input['estimated_duration'] ?? null,
                'prerequisites' => $input['prerequisites'] ?? [],
                'learning_objectives' => $input['learning_objectives'] ?? [],
                'target_audience' => $input['target_audience'] ?? [],
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

                        if ($content['type'] === 'quiz' && isset($content['quiz_data'])) {
                            $contentData['quiz_data'] = json_encode($content['quiz_data']);
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

    public function destroy(Kursus $kursus)
    {
        try {
            // Check if the course belongs to the authenticated teacher
            if ($kursus->teacher_id !== auth()->id()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Unauthorized access to this course'
                ], 403);
            }

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

            $kursus->delete();

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

    public function studentProgress(Kursus $kursus)
    {
        try {
            // Check if the course belongs to the authenticated teacher
            if ($kursus->teacher_id !== auth()->id()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Unauthorized access to this course'
                ], 403);
            }

            // Get all students enrolled in this course
            $studentIds = DB::table('siswa_kursus')
                ->where('id_kursus', $kursus->id)
                ->pluck('id_siswa');

            $students = User::whereIn('id', $studentIds)
                ->select(['id', 'nama_lengkap', 'email', 'class'])
                ->get();

            // Get progress for each student
            $studentProgress = [];
            foreach ($students as $student) {
                $progressData = $this->getCourseProgressForStudent($student, $kursus);
                $studentProgress[] = [
                    'student' => $student,
                    'progress' => $progressData
                ];
            }

            return Inertia::render('teacher/courses/[id]/student-progress', [
                'course' => $kursus,
                'studentProgress' => $studentProgress
            ]);
        } catch (Exception $e) {
            Log::error('Error fetching student progress: ' . $e->getMessage());
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the course progress for a specific student
     * This method is similar to the one in StudentProgressController but adapted for teacher use
     */
    private function getCourseProgressForStudent($student, $course)
    {
        try {
            // Get all content items for this course
            $courseContents = CourseContent::where('kursus_id', $course->id)->get();

            // Count only valid content types
            $validContentTypes = ['video', 'pdf', 'quiz'];
            $totalContent = $courseContents->filter(function($content) use ($validContentTypes) {
                return in_array($content->type, $validContentTypes);
            })->count();

            // Get completed content items for this student
            $completedContent = $this->getCompletedContentCount($student, $course);

            // Get quiz submissions for this course
            $quizSubmissions = QuizSubmission::where('user_id', $student->id)
                ->where('course_id', $course->id)
                ->with('quizContent')
                ->get()
                ->toArray();

            // Calculate overall progress
            $progressPercentage = $totalContent > 0 ? round(($completedContent / $totalContent) * 100, 1) : 0;

            // Check if course is completed (all content completed)
            $isCompleted = $totalContent > 0 && $completedContent == $totalContent;

            return [
                'total_content' => $totalContent,
                'completed_content' => $completedContent,
                'progress_percentage' => $progressPercentage,
                'is_completed' => $isCompleted,
                'quiz_submissions' => $quizSubmissions,
                'completion_status' => $this->getCompletionStatus($progressPercentage)
            ];
        } catch (Exception $e) {
            Log::error('Error in getCourseProgressForStudent: ' . $e->getMessage());
            return [
                'total_content' => 0,
                'completed_content' => 0,
                'progress_percentage' => 0,
                'is_completed' => false,
                'quiz_submissions' => [],
                'completion_status' => 'not_started'
            ];
        }
    }

    /**
     * Get the count of completed content items for a student in a course
     */
    private function getCompletedContentCount($student, $course)
    {
        try {
            // Get all content items for this course
            $courseContents = CourseContent::where('kursus_id', $course->id)->get();

            $completedCount = 0;
            $quizCompletedSubLookup = QuizSubmission::query()
                ->where('user_id', $student->id)
                ->where('course_id', $course->id)
                ->join('course_contents', 'quiz_submissions.quiz_content_id', '=', 'course_contents.id')
                ->pluck('course_contents.sub_pembahasan_id')
                ->filter()
                ->map(fn ($id) => (int) $id)
                ->unique()
                ->flip();

            foreach ($courseContents as $content) {
                // Only count content that has a valid type
                if (in_array($content->type, ['video', 'pdf', 'quiz'])) {
                    // Get the actual progress_per_subbab value
                    $progressValue = (int) (ProgressCourse::where('id_siswa', $student->id)
                        ->where('id_kursus', $course->id)
                        ->where('id_sub_pembahasan', $content->sub_pembahasan_id)
                        ->max('progress_per_subbab') ?? 0);

                    if ($quizCompletedSubLookup->has((int) $content->sub_pembahasan_id)) {
                        $progressValue = max($progressValue, 3);
                    }

                    // Map content types to minimum required progress_per_subbab values
                    $minRequiredProgressValues = [
                        'video' => 1,  // Video completion requires progress_per_subbab >= 1
                        'pdf' => 2,    // PDF download requires progress_per_subbab >= 2
                        'quiz' => 3    // Quiz completion requires progress_per_subbab >= 3
                    ];

                    $minRequiredValue = $minRequiredProgressValues[$content->type] ?? 0;
                    $isCompleted = ($progressValue >= $minRequiredValue);

                    if ($isCompleted) {
                        $completedCount++;
                    }
                }
            }

            return $completedCount;
        } catch (Exception $e) {
            Log::error('Error in getCompletedContentCount: ' . $e->getMessage());
            return 0;
        }
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

    private function getCompletionStatus($percentage)
    {
        if ($percentage == 100) return 'completed';
        if ($percentage >= 75) return 'almost_completed';
        if ($percentage >= 50) return 'in_progress';
        if ($percentage > 0) return 'started';
        return 'not_started';
    }
}
