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
        $tipe_user = strtolower(trim($row['tipe_user'] ?? $row['role'] ?? $row['user_type'] ?? 'siswa'));

        // Check for duplicates
        if (User::where('username', $username)->exists()) {
            $this->skippedCount++;
            return null;
        }

        if (User::where('email', $email)->exists()) {
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
            'tipe_user' => 'required|in:admin,siswa,guru',
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
            'tipe_user.required' => 'User type is required.',
            'tipe_user.in' => 'User type must be admin, siswa, or guru.',
        ];
    }
}
