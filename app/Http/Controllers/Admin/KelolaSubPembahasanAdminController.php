<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kursus;
use App\Models\Kuis;
use App\Models\SubPembahasan;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class KelolaSubPembahasanAdminController extends Controller
{
    public function index()
    {
        try {
            $subPembahasan = SubPembahasan::with(['kursus:id,judul_kursus', 'kuis:id,judul_kuis'])
                ->select(['id', 'id_kursus', 'id_kuis', 'title', 'description', 'created_at'])
                ->latest()
                ->get();

            return Inertia::render('Admin/SubPembahasan/Index', [
                'subPembahasan' => $subPembahasan
            ]);
        } catch (Exception $e) {
            return back()->with('error', 'Terjadi kesalahan teknis: ' . $e->getMessage());
        }
    }

    public function show(SubPembahasan $subPembahasan)
    {
        try {
            $subPembahasan->load(['kursus:id,judul_kursus', 'kuis:id,judul_kuis']);

            return Inertia::render('Admin/SubPembahasan/Show', [
                'subPembahasan' => $subPembahasan
            ]);
        } catch (Exception $e) {
            return back()->with('error', 'Terjadi kesalahan teknis: ' . $e->getMessage());
        }
    }

    public function uploadPdf(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|mimes:pdf|max:10240', // 10MB max
            ], [
                'file.required' => 'File wajib diunggah.',
                'file.mimes' => 'Format file harus PDF.',
                'file.max' => 'Ukuran file maksimal 10240 KB.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $validator->errors()->first()
                ], 422);
            }

            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('pdfs', $filename, 'public');

            return response()->json([
                'status' => 'success',
                'url' => Storage::url($filePath),
                'message' => 'File uploaded successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error uploading file: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_kursus' => 'required|exists:kursus,id',
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'contents' => 'required|array|min:1',
                'contents.*.type' => 'required|in:video,pdf,quiz',
                'contents.*.title' => 'required|string|max:255',
                'contents.*.description' => 'required|string',
                // Video content validation
                'contents.*.url' => 'required_if:contents.*.type,video|url',
                'contents.*.duration' => 'required_if:contents.*.type,video|integer|min:0',
                // PDF content validation
                'contents.*.url' => 'required_if:contents.*.type,pdf|string',
                // Quiz content validation
                'contents.*.quiz_data' => 'required_if:contents.*.type,quiz|array',
                'contents.*.quiz_data.*.question' => 'required|string|min:1',
                'contents.*.quiz_data.*.options' => 'required|array|size:4',
                'contents.*.quiz_data.*.options.*' => 'required|string|min:1',
                'contents.*.quiz_data.*.correctAnswer' => 'required|integer|min:0|max:3',
                'contents.*.quiz_data.*.timeLimit' => 'nullable|integer|min:1|max:60',
                'order' => 'nullable|integer'
            ], [
                'required' => 'Kolom :attribute wajib diisi.',
                'exists' => 'Data :attribute tidak ditemukan.',
                'string' => 'Kolom :attribute harus berupa teks.',
                'max' => 'Kolom :attribute maksimal :max.',
                'array' => 'Kolom :attribute harus berupa array.',
                'min' => 'Kolom :attribute minimal :min.',
                'in' => 'Kolom :attribute harus salah satu dari: :values.',
                'required_if' => 'Kolom :attribute wajib diisi jika :other bernilai :values.',
                'url' => 'Format :attribute tidak valid.',
                'integer' => 'Kolom :attribute harus berupa angka.',
                'size' => 'Kolom :attribute harus berisi :size item.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Validate course status
            $course = Kursus::find($request->id_kursus);
            if (!$course) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Course not found'
                ], 404);
            }

            if ($course->status === 'published') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot modify a published course'
                ], 422);
            }

            DB::beginTransaction();

            try {
                $subPembahasan = SubPembahasan::create([
                    'id_kursus' => $request->id_kursus,
                    'title' => $request->title,
                    'description' => $request->description,
                    'order' => $request->order ?? 0
                ]);

                foreach ($request->contents as $content) {
                    $contentData = [
                        'sub_pembahasan_id' => $subPembahasan->id,
                        'type' => $content['type'],
                        'title' => $content['title'],
                        'description' => $content['description'],
                        'order' => $content['order'] ?? 0
                    ];

                    if ($content['type'] === 'video') {
                        $contentData['url'] = $content['url'];
                        $contentData['duration'] = $content['duration'];
                    } elseif ($content['type'] === 'pdf') {
                        $contentData['url'] = $content['url'];
                    } elseif ($content['type'] === 'quiz') {
                        $contentData['quiz_data'] = $content['quiz_data'];
                    }

                    $subPembahasan->contents()->create($contentData);
                }

                DB::commit();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Sub pembahasan berhasil dibuat',
                    'data' => $subPembahasan->load('contents')
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'status' => 'error',
                    'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
                ], 500);
            }

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, SubPembahasan $subPembahasan)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id_kursus' => 'sometimes|required|exists:kursus,id',
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                // Video content validation
                'video_title' => 'sometimes|required|string|max:255',
                'video_description' => 'sometimes|required|string',
                'url_video_sub_pembahasan' => 'sometimes|required|url',
                // PDF content validation
                'pdf_title' => 'sometimes|required|string|max:255',
                'pdf_description' => 'sometimes|required|string',
                'file' => 'sometimes|required|mimes:pdf|max:10240',
                // Quiz content validation
                'quiz_title' => 'sometimes|required|string|max:255',
                'quiz_description' => 'sometimes|required|string',
                'id_kuis' => 'sometimes|required|exists:kuis,id',
                'order' => 'nullable|integer'
            ], [
                'required' => 'Kolom :attribute wajib diisi.',
                'exists' => 'Data :attribute tidak ditemukan.',
                'string' => 'Kolom :attribute harus berupa teks.',
                'max' => 'Kolom :attribute maksimal :max.',
                'url' => 'Format :attribute tidak valid.',
                'mimes' => 'Format file harus PDF.',
                'integer' => 'Kolom :attribute harus berupa angka.',
            ]);

            if ($validator->fails()) {
                return back()->withErrors($validator)->withInput();
            }

            $data = $validator->validated();

            // Handle PDF file upload if provided
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $filename = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('pdfs', $filename, 'public');
                $data['url_materi_pdf_sub_pembahasan'] = Storage::url($filePath);

                // Delete old file if exists
                if ($subPembahasan->url_materi_pdf_sub_pembahasan) {
                    $oldPath = str_replace('/storage/', '', $subPembahasan->url_materi_pdf_sub_pembahasan);
                    Storage::delete($oldPath);
                }
            }

            $subPembahasan->update($data);

            return redirect()->route('admin.sub-pembahasan.index')
                ->with('success', 'Sub pembahasan berhasil diperbarui');
        } catch (Exception $e) {
            return back()->with('error', 'Terjadi kesalahan teknis: ' . $e->getMessage());
        }
    }

    public function destroy(SubPembahasan $subPembahasan)
    {
        try {
            // Delete PDF file if exists
            if ($subPembahasan->url_materi_pdf_sub_pembahasan) {
                $filePath = str_replace('/storage/', '', $subPembahasan->url_materi_pdf_sub_pembahasan);
                Storage::delete($filePath);
            }

            $subPembahasan->delete();

            return redirect()->route('admin.sub-pembahasan.index')
                ->with('success', 'Sub pembahasan berhasil dihapus');
        } catch (Exception $e) {
            return back()->with('error', 'Terjadi kesalahan teknis: ' . $e->getMessage());
        }
    }
}
