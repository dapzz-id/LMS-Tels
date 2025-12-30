<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Exports\UsersExport;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use App\Imports\UsersImport;
use Maatwebsite\Excel\Facades\Excel;

class KelolaDataUserAdminController extends Controller
{
    public function index() {
        try {
            $data = User::latest()->get();

            return Inertia::render('admin/users/page', [
                'users' => $data
            ]);
        } catch (Exception $e) {
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function show(User $user) {
        try {
            if(!$user) {
                return back()->with('error', 'Data user tidak ditemukan');
            }

            return Inertia::render('admin/users/show', [
                'user' => $user
            ]);
        } catch (Exception $e) {
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function store(Request $request) {
        try {
            $validator = Validator::make($request->all(), [
                'nama_lengkap' => 'required|string',
                'username' => 'required|string|unique:users,username',
                'tipe_user' => 'required|in:guru,siswa,admin',
                'class' => 'nullable|string|max:255',
                'email' => 'required|string|email|unique:users,email',
                'password' => 'required|string|min:6'
            ], [
                'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
                'nama_lengkap.string' => 'Nama lengkap harus berupa teks.',
                'username.required' => 'Username wajib diisi.',
                'username.string' => 'Username harus berupa teks.',
                'username.unique' => 'Username sudah digunakan.',
                'tipe_user.required' => 'Tipe user wajib dipilih.',
                'tipe_user.in' => 'Tipe user harus salah satu dari: guru, siswa, admin.',
                'class.string' => 'Kelas harus berupa teks.',
                'class.max' => 'Kelas maksimal 255 karakter.',
                'email.required' => 'Email wajib diisi.',
                'email.string' => 'Email harus berupa teks.',
                'email.email' => 'Format email tidak valid.',
                'email.unique' => 'Email sudah digunakan.',
                'password.required' => 'Password wajib diisi.',
                'password.string' => 'Password harus berupa teks.',
                'password.min' => 'Password minimal 6 karakter.',
            ]);

            if($validator->fails()) {
                return back()->withErrors($validator->errors());
            }

            $validated = $validator->validated();
            $user = User::create($validated);

            return redirect()->route('admin.users.index')->with('success', 'User berhasil dibuat');
        } catch(Exception $e) {
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function update(Request $request, User $user) {
        try {
            $validator = Validator::make($request->all(), [
                'nama_lengkap' => 'required|string',
                'username' => 'required|string|unique:users,username,'.$user->id,
                'tipe_user' => 'required|in:guru,siswa,admin',
                'class' => 'nullable|string|max:255',
                'email' => 'required|string|email|unique:users,email,'.$user->id,
                'password' => 'nullable|string|min:6'
            ], [
                'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
                'nama_lengkap.string' => 'Nama lengkap harus berupa teks.',
                'username.required' => 'Username wajib diisi.',
                'username.string' => 'Username harus berupa teks.',
                'username.unique' => 'Username sudah digunakan.',
                'tipe_user.required' => 'Tipe user wajib dipilih.',
                'tipe_user.in' => 'Tipe user harus salah satu dari: guru, siswa, admin.',
                'class.string' => 'Kelas harus berupa teks.',
                'class.max' => 'Kelas maksimal 255 karakter.',
                'email.required' => 'Email wajib diisi.',
                'email.string' => 'Email harus berupa teks.',
                'email.email' => 'Format email tidak valid.',
                'email.unique' => 'Email sudah digunakan.',
                'password.string' => 'Password harus berupa teks.',
                'password.min' => 'Password minimal 6 karakter.',
            ]);

            if($validator->fails()) {
                return back()->withErrors($validator->errors());
            }

            $validated = $validator->validated();

            // Only update password if it's provided
            if (empty($validated['password'])) {
                unset($validated['password']);
            }

            $user->update($validated);

            return redirect()->route('admin.users.index')->with('success', 'User berhasil diupdate');
        } catch(Exception $e) {
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function destroy(User $user) {
        try {
            if(!$user) {
                return back()->with('error', 'Data user tidak ditemukan');
            }

            $user->delete();

            return redirect()->route('admin.users.index')->with('success', 'User berhasil dihapus');
        } catch(Exception $e) {
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function export()
    {
        try {
            if (!auth()->check() || auth()->user()->tipe_user !== 'admin') {
                return redirect()->route('login');
            }

            return Excel::download(new UsersExport, 'users.xlsx');
        } catch (Exception $e) {
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240', // 10MB max
        ], [
            'file.required' => 'File wajib diunggah.',
            'file.mimes' => 'Format file harus xlsx, xls, atau csv.',
            'file.max' => 'Ukuran file maksimal 10240 KB.',
        ]);

        try {
            $import = new UsersImport();
            Excel::import($import, $request->file('file'));

            $importedCount = $import->getRowCount();
            $skippedCount = $import->getSkippedCount();

            $message = "Import completed successfully!";
            if ($importedCount > 0) {
                $message .= " {$importedCount} users imported.";
            }
            if ($skippedCount > 0) {
                $message .= " {$skippedCount} rows skipped due to errors.";
            }

            return back()->with('success', $message);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            $errorMessages = [];

            foreach ($failures as $failure) {
                $errorMessages[] = "Row {$failure->row()}: " . implode(', ', $failure->errors());
            }

            return back()->with('error', 'Validation failed: ' . implode('; ', $errorMessages));
        } catch (\Exception $e) {
            return back()->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    public function downloadTemplate()
    {
        try {
            if (!auth()->check() || auth()->user()->tipe_user !== 'admin') {
                return redirect()->route('login');
            }

            // Read sample data from CSV file
            $csvPath = base_path('sample_users.csv');
            $sampleData = [];

            if (file_exists($csvPath)) {
                $handle = fopen($csvPath, 'r');
                if ($handle !== false) {
                    // Skip header row
                    fgetcsv($handle);

                    // Read data rows
                    while (($data = fgetcsv($handle)) !== false) {
                        if (count($data) >= 6) {
                            $sampleData[] = [
                                'nama_lengkap' => $data[0],
                                'username' => $data[1],
                                'email' => $data[2],
                                'tipe_user' => $data[3],
                                'class' => $data[4],
                                'password' => $data[5]
                            ];
                        }
                    }
                    fclose($handle);
                }
            }

            // // If CSV file doesn't exist or is empty, use default sample data
            // if (empty($sampleData)) {
            //     $sampleData = [
            //         [
            //             'nama_lengkap' => 'Test Student 1',
            //             'username' => 'teststudent1',
            //             'email' => 'test1@example.com',
            //             'tipe_user' => 'siswa',
            //             'class' => 'XII TKJ 1',
            //             'password' => 'password123'
            //         ],
            //         [
            //             'nama_lengkap' => 'Test Student 2',
            //             'username' => 'teststudent2',
            //             'email' => 'test2@example.com',
            //             'tipe_user' => 'siswa',
            //             'class' => 'XII TKJ 2',
            //             'password' => 'password123'
            //         ],
            //         [
            //             'nama_lengkap' => 'Test Teacher 1',
            //             'username' => 'testteacher1',
            //             'email' => 'teacher1@example.com',
            //             'tipe_user' => 'guru',
            //             'class' => '',
            //             'password' => 'password123'
            //         ],
            //         [
            //             'nama_lengkap' => 'Test Admin 1',
            //             'username' => 'testadmin1',
            //             'email' => 'admin1@example.com',
            //             'tipe_user' => 'admin',
            //             'class' => '',
            //             'password' => 'password123'
            //         ]
            //     ];
            // }

            return Excel::download(new class($sampleData) implements \Maatwebsite\Excel\Concerns\FromArray, \Maatwebsite\Excel\Concerns\WithHeadings {
                private $data;

                public function __construct($data) {
                    $this->data = $data;
                }

                public function array(): array {
                    return $this->data;
                }

                public function headings(): array {
                    return ['nama_lengkap', 'username', 'email', 'tipe_user', 'class', 'password'];
                }
            }, 'users_template.xlsx');
        } catch (Exception $e) {
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
