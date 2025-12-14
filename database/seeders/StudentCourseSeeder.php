<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Kursus;
use Illuminate\Database\Seeder;

class StudentCourseSeeder extends Seeder
{
    public function run(): void
    {
        // Get all students
        $students = User::where('tipe_user', 'siswa')->get();
        
        // Get all courses
        $courses = Kursus::all();
        
        // Assign all courses to each student
        foreach ($students as $student) {
            $student->kursus()->sync($courses->pluck('id')->toArray());
        }
    }
} 