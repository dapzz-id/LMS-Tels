<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a default student account
        User::firstOrCreate(
            ['email' => 'student@lms.com'],
            [
                'nama_lengkap' => 'Demo Student',
                'username' => 'student',
                'password' => Hash::make('student123'),
                'tipe_user' => 'siswa',
            ]
        );

        // Create additional sample students
        $students = [
            [
                'nama_lengkap' => 'John Doe',
                'username' => 'johndoe',
                'email' => 'john@example.com',
                'password' => Hash::make('password123'),
                'tipe_user' => 'siswa',
            ],
            [
                'nama_lengkap' => 'Jane Smith',
                'username' => 'janesmith',
                'email' => 'jane@example.com',
                'password' => Hash::make('password123'),
                'tipe_user' => 'siswa',
            ],
            [
                'nama_lengkap' => 'Mike Johnson',
                'username' => 'mikejohnson',
                'email' => 'mike@example.com',
                'password' => Hash::make('password123'),
                'tipe_user' => 'siswa',
            ],
        ];

        foreach ($students as $student) {
            User::firstOrCreate(
                ['email' => $student['email']],
                $student
            );
        }
    }
} 