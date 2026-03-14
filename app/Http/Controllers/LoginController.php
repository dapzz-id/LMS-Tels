<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class LoginController extends Controller
{
    public function index()
    {
        if (Auth::check()) {
            $tipe_user = Auth::user()->tipe_user;
            if ($tipe_user == 'guru') {
                return redirect()->route('teacher.dashboard');
            } elseif ($tipe_user == 'siswa') {
                return redirect()->route('student.dashboard');
            } elseif ($tipe_user == 'admin') {
                return redirect()->route('admin.dashboard');
            }
        }
        return Inertia::render('login/Index');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email atau password salah'
            ], 401);
        }

        $request->session()->regenerate();

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil',
            'data' => [
                'user' => [
                    'id' => Auth::id(),
                    'nama_lengkap' => Auth::user()->nama_lengkap,
                    'email' => Auth::user()->email,
                    'tipe_user' => Auth::user()->tipe_user,
                ],
                'tipe_user' => Auth::user()->tipe_user,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Inertia::location('/login');
    }
}
