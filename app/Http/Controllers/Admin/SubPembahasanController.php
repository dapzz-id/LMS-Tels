<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kursus;
use App\Models\SubPembahasan;
use App\Models\CourseContent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubPembahasanController extends Controller
{
    public function store(Request $request, Kursus $kursus)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ], [
            'title.required' => 'Judul wajib diisi.',
            'title.string' => 'Judul harus berupa teks.',
            'title.max' => 'Judul maksimal 255 karakter.',
            'description.required' => 'Deskripsi wajib diisi.',
            'description.string' => 'Deskripsi harus berupa teks.',
        ]);

        $subPembahasan = $kursus->subPembahasan()->create([
            ...$validated,
            'order' => $kursus->subPembahasan()->count()
        ]);

        return back()->with('success', 'Sub pembahasan created successfully');
    }

    public function storeContent(Request $request, SubPembahasan $subPembahasan)
    {
        $validated = $request->validate([
            'type' => 'required|in:video,pdf,quiz',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'url' => 'required_unless:type,quiz|nullable|string',
            'file_path' => 'nullable|string',
            'duration' => 'nullable|integer|min:1',
            'quiz_data' => 'required_if:type,quiz|nullable|array',
            'quiz_data.quiz_id' => 'required_if:type,quiz|nullable|exists:kuis,id',
            'is_required' => 'boolean',
            'points' => 'integer|min:0',
            'passing_score' => 'nullable|integer|min:0',
            'metadata' => 'nullable|array'
        ], [
            'required' => 'Kolom :attribute wajib diisi.',
            'required_if' => 'Kolom :attribute wajib diisi jika :other bernilai :values.',
            'required_unless' => 'Kolom :attribute wajib diisi kecuali :other bernilai :values.',
            'in' => 'Kolom :attribute harus salah satu dari: :values.',
            'string' => 'Kolom :attribute harus berupa teks.',
            'max' => 'Kolom :attribute maksimal :max karakter.',
            'array' => 'Kolom :attribute harus berupa array.',
            'exists' => 'Data :attribute tidak ditemukan.',
            'boolean' => 'Kolom :attribute harus bernilai true atau false.',
            'integer' => 'Kolom :attribute harus berupa angka.',
            'min' => 'Kolom :attribute minimal :min.',
        ]);

        $content = $subPembahasan->contents()->create([
            ...$validated,
            'kursus_id' => $subPembahasan->id_kursus,
            'order' => $subPembahasan->contents()->count()
        ]);

        return back()->with('success', 'Content added successfully');
    }

    public function updateOrder(Request $request)
    {
        $validated = $request->validate([
            'sub_pembahasan' => 'required|array',
            'sub_pembahasan.*.id' => 'required|exists:sub_pembahasan,id',
            'sub_pembahasan.*.order' => 'required|integer|min:0',
            'sub_pembahasan.*.contents' => 'array',
            'sub_pembahasan.*.contents.*.id' => 'exists:course_contents,id',
            'sub_pembahasan.*.contents.*.order' => 'integer|min:0',
        ], [
            'required' => 'Kolom :attribute wajib diisi.',
            'array' => 'Kolom :attribute harus berupa array.',
            'exists' => 'Data :attribute tidak ditemukan.',
            'integer' => 'Kolom :attribute harus berupa angka.',
            'min' => 'Kolom :attribute minimal :min.',
        ]);

        foreach ($validated['sub_pembahasan'] as $pembahasan) {
            SubPembahasan::where('id', $pembahasan['id'])->update(['order' => $pembahasan['order']]);
            
            if (isset($pembahasan['contents'])) {
                foreach ($pembahasan['contents'] as $content) {
                    CourseContent::where('id', $content['id'])
                        ->update(['order' => $content['order']]);
                }
            }
        }

        return back()->with('success', 'Order updated successfully');
    }

    public function destroy(SubPembahasan $subPembahasan)
    {
        $subPembahasan->delete();
        return back()->with('success', 'Sub pembahasan deleted successfully');
    }

    public function destroyContent(CourseContent $content)
    {
        $content->delete();
        return back()->with('success', 'Content deleted successfully');
    }
} 
