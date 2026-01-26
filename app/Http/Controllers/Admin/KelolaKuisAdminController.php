<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kuis;
use App\Models\SoalKuis;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KelolaKuisAdminController extends Controller
{
    public function index()
    {
        try {
            $kuis = Kuis::withCount('soal_kuis')
                ->select(['id', 'judul_kuis', 'created_at'])
                ->latest()
                ->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Berhasil mengambil semua data kuis',
                'data' => $kuis
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Kuis $kuis)
    {
        try {
            $kuis->load(['soal_kuis' => function($query) {
                $query->select(['id', 'id_kuis', 'soal_kuis', 'kunci_jawaban']);
            }]);

            return response()->json([
                'status' => 'success',
                'message' => 'Data kuis berhasil diambil',
                'data' => $kuis
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'judul_kuis' => 'required|string|max:255|unique:kuis,judul_kuis'
            ], [
                'judul_kuis.required' => 'Judul kuis wajib diisi.',
                'judul_kuis.string' => 'Judul kuis harus berupa teks.',
                'judul_kuis.max' => 'Judul kuis maksimal 255 karakter.',
                'judul_kuis.unique' => 'Judul kuis sudah digunakan.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $kuis = Kuis::create($validator->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Kuis berhasil dibuat',
                'data' => $kuis
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Kuis $kuis)
    {
        try {
            $validator = Validator::make($request->all(), [
                'judul_kuis' => 'required|string|max:255|unique:kuis,judul_kuis,'.$kuis->id
            ], [
                'judul_kuis.required' => 'Judul kuis wajib diisi.',
                'judul_kuis.string' => 'Judul kuis harus berupa teks.',
                'judul_kuis.max' => 'Judul kuis maksimal 255 karakter.',
                'judul_kuis.unique' => 'Judul kuis sudah digunakan.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $kuis->update($validator->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Kuis berhasil diperbarui',
                'data' => $kuis->fresh()
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Kuis $kuis)
    {
        try {
            // Cek apakah kuis digunakan di sub pembahasan
            if ($kuis->sub_pembahasan()->exists()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Tidak dapat menghapus kuis karena sudah digunakan dalam sub pembahasan'
                ], 422);
            }

            $kuis->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Kuis berhasil dihapus'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }
}
