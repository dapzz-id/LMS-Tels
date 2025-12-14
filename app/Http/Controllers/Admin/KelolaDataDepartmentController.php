<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mapel;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class KelolaDataDepartmentController extends Controller
{
    public function index()
    {
        try {
            $departments = Mapel::select(['id', 'nama_mapel', 'deskripsi', 'created_at'])
                ->latest()
                ->get();

            return Inertia::render('admin/departments/page', [
                'departments' => $departments
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Technical error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_mapel' => 'required|string|min:3|max:255|unique:mapel,nama_mapel',
                'deskripsi' => 'nullable|string'
            ]);

            $department = Mapel::create($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Department created successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'failed',
                'message' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Technical error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Mapel $department)
    {
        try {
            $validated = $request->validate([
                'nama_mapel' => 'required|string|min:3|max:255|unique:mapel,nama_mapel,' . $department->id,
                'deskripsi' => 'nullable|string'
            ]);

            $department->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Department updated successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'failed',
                'message' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Technical error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Mapel $department)
    {
        try {
            $department->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Department deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Technical error: ' . $e->getMessage()
            ], 500);
        }
    }
}
