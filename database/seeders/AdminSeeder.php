<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'administrator@lms.com'],
            [
                'nama_lengkap' => 'Administrator',
                'username' => 'administrator',
                'password' => bcrypt('administrator123'),
                'tipe_user' => 'admin',
            ]
        );
        User::firstOrCreate(
            ['email' => 'teacher@lms.com'],
            [
                'nama_lengkap' => 'Teacher',
                'username' => 'teacher',
                'password' => bcrypt('teacher'),
                'tipe_user' => 'guru',
            ]
        );
        User::firstOrCreate(
            ['email' => 'student@lms.com'],
            [
                'nama_lengkap' => 'Student',
                'username' => 'student',
                'password' => bcrypt('student123'),
                'tipe_user' => 'siswa',
            ]
        );
    }
}
