<?php

namespace Database\Seeders;

use App\Models\Kursus;
use App\Models\Mapel;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        // Create sample subjects if they don't exist
        $mapel = Mapel::firstOrCreate(
            ['nama_mapel' => 'Pemrograman Web'],
            ['deskripsi' => 'Belajar dasar-dasar pemrograman web']
        );

        // Create sample courses
        $courses = [
            [
                'id_mapel' => $mapel->id,
                'judul_kursus' => 'HTML & CSS Dasar',
                'deskripsi_kursus' => 'Pelajari dasar-dasar HTML dan CSS untuk membangun website',
                'url_thumbnail' => 'https://placehold.co/600x400/e2e8f0/64748b?text=HTML+CSS',
            ],
            [
                'id_mapel' => $mapel->id,
                'judul_kursus' => 'JavaScript Modern',
                'deskripsi_kursus' => 'Pelajari JavaScript modern untuk pengembangan web interaktif',
                'url_thumbnail' => 'https://placehold.co/600x400/e2e8f0/64748b?text=JavaScript',
            ],
            [
                'id_mapel' => $mapel->id,
                'judul_kursus' => 'React.js Fundamentals',
                'deskripsi_kursus' => 'Pelajari dasar-dasar React.js untuk membangun aplikasi web modern',
                'url_thumbnail' => 'https://placehold.co/600x400/e2e8f0/64748b?text=React',
            ],
        ];

        foreach ($courses as $course) {
            Kursus::firstOrCreate(
                ['judul_kursus' => $course['judul_kursus']],
                $course
            );
        }
    }
} 