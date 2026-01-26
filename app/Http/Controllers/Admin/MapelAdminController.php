<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mapel;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MapelAdminController extends Controller
{
    public function index()
    {
        try {
            $mapels = Mapel::select(['id', 'nama_mapel', 'created_at'])
                ->latest()
                ->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Berhasil mengambil semua data mata pelajaran',
                'data' => $mapels
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Mapel $mapel)
    {
        try {
            return response()->json([
                'status' => 'success',
                'message' => 'Data mata pelajaran berhasil diambil',
                'data' => $mapel->makeHidden(['created_at', 'updated_at'])
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
                'nama_mapel' => 'required|string|max:255|unique:mapel,nama_mapel'
            ], [
                'nama_mapel.required' => 'Nama mapel wajib diisi.',
                'nama_mapel.string' => 'Nama mapel harus berupa teks.',
                'nama_mapel.max' => 'Nama mapel maksimal 255 karakter.',
                'nama_mapel.unique' => 'Nama mapel sudah digunakan.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $mapel = Mapel::create($validator->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Mata pelajaran berhasil dibuat',
                'data' => $mapel
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Mapel $mapel)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nama_mapel' => 'required|string|max:255|unique:mapel,nama_mapel,'.$mapel->id
            ], [
                'nama_mapel.required' => 'Nama mapel wajib diisi.',
                'nama_mapel.string' => 'Nama mapel harus berupa teks.',
                'nama_mapel.max' => 'Nama mapel maksimal 255 karakter.',
                'nama_mapel.unique' => 'Nama mapel sudah digunakan.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $mapel->update($validator->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Mata pelajaran berhasil diperbarui',
                'data' => $mapel->fresh()
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Mapel $mapel)
    {
        try {
            // Cek apakah mapel digunakan di kursus
            if ($mapel->kursus()->exists()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Tidak dapat menghapus mata pelajaran karena sudah digunakan dalam kursus'
                ], 422);
            }

            $mapel->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Mata pelajaran berhasil dihapus'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }

    public function withCourses(Mapel $mapel)
    {
        try {
            $mapel->load(['kursus' => function($query) {
                $query->select(['id', 'id_mapel', 'judul_kursus', 'url_thumbnail'])
                    ->latest();
            }]);

            return response()->json([
                'status' => 'success',
                'message' => 'Data mata pelajaran dengan kursus berhasil diambil',
                'data' => $mapel
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Terjadi kesalahan teknis: ' . $e->getMessage()
            ], 500);
        }
    }
}
