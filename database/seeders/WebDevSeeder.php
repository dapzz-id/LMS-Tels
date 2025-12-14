<?php

namespace Database\Seeders;

use App\Models\Mapel;
use Illuminate\Database\Seeder;

class WebDevSeeder extends Seeder
{
    public function run(): void
    {
        Mapel::firstOrCreate(
            ['nama_mapel' => 'Web Development'],
            [
                'deskripsi' => 'Learn modern web development technologies and practices'
            ]
        );
    }
} 