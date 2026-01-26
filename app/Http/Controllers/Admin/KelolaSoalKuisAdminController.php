<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kuis;
use App\Models\SoalKuis;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KelolaSoalKuisAdminController extends Controller
{
    public function index(Kuis $kuis)
    {
        try {
            $soalKuis = SoalKuis::where('id_kuis', $kuis->id)
                ->select(['id', 'id_kuis', 'soal_kuis', 'kunci_jawaban', 'created_at'])
                ->latest()
                ->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Berhasil mengambil semua data soal kuis',
                'data' => $soalKuis
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(SoalKuis $soalKuis)
    {
        try {
            return response()->json([
                'status' => 'success',
                'message' => 'Data soal kuis berhasil diambil',
                'data' => $soalKuis
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request, Kuis $kuis)
    {
        try {
            $validator = Validator::make($request->all(), [
                'soal_kuis' => 'required|string',
                'url_gambar' => 'nullable|url',
                'opsi_a' => 'required|string',
                'opsi_b' => 'required|string',
                'opsi_c' => 'required|string',
                'opsi_d' => 'required|string',
                'opsi_e' => 'required|string',
                'kunci_jawaban' => 'required|in:a,b,c,d,e'
            ], [
                'required' => 'Kolom :attribute wajib diisi.',
                'string' => 'Kolom :attribute harus berupa teks.',
                'url' => 'Format :attribute tidak valid.',
                'in' => 'Kolom :attribute harus salah satu dari: :values.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $soalKuis = $kuis->soal_kuis()->create($validator->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Soal kuis berhasil dibuat',
                'data' => $soalKuis
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, SoalKuis $soalKuis)
    {
        try {
            $validator = Validator::make($request->all(), [
                'soal_kuis' => 'sometimes|required|string',
                'url_gambar' => 'nullable|url',
                'opsi_a' => 'sometimes|required|string',
                'opsi_b' => 'sometimes|required|string',
                'opsi_c' => 'sometimes|required|string',
                'opsi_d' => 'sometimes|required|string',
                'opsi_e' => 'sometimes|required|string',
                'kunci_jawaban' => 'sometimes|required|in:a,b,c,d,e'
            ], [
                'required' => 'Kolom :attribute wajib diisi.',
                'string' => 'Kolom :attribute harus berupa teks.',
                'url' => 'Format :attribute tidak valid.',
                'in' => 'Kolom :attribute harus salah satu dari: :values.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $soalKuis->update($validator->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Soal kuis berhasil diperbarui',
                'data' => $soalKuis->fresh()
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(SoalKuis $soalKuis)
    {
        try {
            $soalKuis->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Soal kuis berhasil dihapus'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }
}
