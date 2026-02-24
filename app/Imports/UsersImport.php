<?php

namespace App\Imports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Illuminate\Support\Facades\Hash;

class UsersImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnError
{
    use SkipsErrors;

    private $rowCount = 0;
    private $skippedCount = 0;
    private $rawRowCount = 0;

    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        // Skip empty rows
        if (empty($row['nama_lengkap']) && empty($row['username']) && empty($row['email'])) {
            $this->skippedCount++;
            return null;
        }

        $nama_lengkap = trim($row['nama_lengkap'] ?? $row['full_name'] ?? $row['name'] ?? '');
        $username = trim($row['username'] ?? '');
        $email = trim($row['email'] ?? '');
        $tipe_user = $this->normalizeUserType($this->getRawUserType($row));

        // Check for duplicates
        if (User::where('username', $username)->exists()) {
            $this->skippedCount++;
            return null;
        }

        if (User::where('email', $email)->exists()) {
            $this->skippedCount++;
            return null;
        }

        $this->rawRowCount++;

        // Deteksi row kosong
        if (
            empty($row['nama_lengkap']) &&
            empty($row['username']) &&
            empty($row['email']) &&
            empty($row['tipe_user']) &&
            empty($row['class'])
        ) {
            $this->skippedCount++;
            return null;
        }

        $this->rowCount++;
        return new User([
            'nama_lengkap' => $nama_lengkap,
            'username' => $username,
            'email' => $email,
            'tipe_user' => $tipe_user,
            'class' => trim($row['class'] ?? ''),
            'password' => Hash::make($row['password'] ?? 'password123'), // Default password if not provided
        ]);
    }

    private function getRawUserType(array $row): string
    {
        return strtolower(trim((string) ($row['tipe_user'] ?? $row['role'] ?? $row['user_type'] ?? '')));
    }

    private function normalizeUserType(string $value): string
    {
        $map = [
            'admin' => 'admin',
            'teacher' => 'guru',
            'guru' => 'guru',
            'student' => 'siswa',
            'siswa' => 'siswa',
        ];

        return $map[$value] ?? $value;
    }

    /**
     * Get the number of rows processed
     */
    public function getRowCount(): int
    {
        return $this->rowCount;
    }

    /**
     * Get the number of rows skipped
     */
    public function getSkippedCount(): int
    {
        return $this->skippedCount;
    }

    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            'nama_lengkap' => 'required|string|max:255',
            'username' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'tipe_user' => [
                'required_without_all:role,user_type',
                'nullable',
                function ($attribute, $value, $fail) {
                    $normalized = $this->normalizeUserType(strtolower(trim((string) $value)));
                    if ($value !== null && $value !== '' && !in_array($normalized, ['admin', 'siswa', 'guru'], true)) {
                        $fail('User type must be one of: admin, guru/teacher, siswa/student.');
                    }
                },
            ],
            'role' => [
                'required_without_all:tipe_user,user_type',
                'nullable',
                function ($attribute, $value, $fail) {
                    $normalized = $this->normalizeUserType(strtolower(trim((string) $value)));
                    if ($value !== null && $value !== '' && !in_array($normalized, ['admin', 'siswa', 'guru'], true)) {
                        $fail('User type must be one of: admin, guru/teacher, siswa/student.');
                    }
                },
            ],
            'user_type' => [
                'required_without_all:tipe_user,role',
                'nullable',
                function ($attribute, $value, $fail) {
                    $normalized = $this->normalizeUserType(strtolower(trim((string) $value)));
                    if ($value !== null && $value !== '' && !in_array($normalized, ['admin', 'siswa', 'guru'], true)) {
                        $fail('User type must be one of: admin, guru/teacher, siswa/student.');
                    }
                },
            ],
            'class' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:6',
        ];
    }

    /**
     * @return array
     */
    public function customValidationMessages()
    {
        return [
            'nama_lengkap.required' => 'Nama lengkap is required.',
            'username.required' => 'Username is required.',
            'username.unique' => 'Username already exists.',
            'email.required' => 'Email is required.',
            'email.email' => 'Email must be a valid email address.',
            'email.unique' => 'Email already exists.',
            'tipe_user.required_without_all' => 'User type is required (use tipe_user, role, or user_type column).',
            'role.required_without_all' => 'User type is required (use tipe_user, role, or user_type column).',
            'user_type.required_without_all' => 'User type is required (use tipe_user, role, or user_type column).',
        ];
    }

    public function getRawRowCount(): int
    {
        return $this->rawRowCount;
    }
}
