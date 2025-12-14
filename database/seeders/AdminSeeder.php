<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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
                'password' => Hash::make('administrator123'),
                'tipe_user' => 'admin',
            ]
        );
        User::firstOrCreate(
            ['email' => 'teacher@lms.com'],
            [
                'nama_lengkap' => 'Teacher',
                'username' => 'teacher',
                'password' => Hash::make('teacher'),
                'tipe_user' => 'guru',
            ]
        );
        User::firstOrCreate(
            ['email' => 'student@lms.com'],
            [
                'nama_lengkap' => 'Student',
                'username' => 'student',
                'password' => Hash::make('student123'),
                'tipe_user' => 'siswa',
            ]
        );
    }
}
