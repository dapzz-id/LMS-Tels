<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function index()
    {
        if (Auth::check()) {
            $tipe_user = Auth::user()->tipe_user;
            Log::info('User: ' . Auth::user());
            Log::info('Tipe User: ' . $tipe_user);
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

        $user = User::where('email', $credentials['email'])->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email tidak terdaftar'
            ], 401);
        }

        if (!Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Password salah'
            ], 401);
        }

        if (Auth::attempt($credentials)) {
            return response()->json([
                'status' => 'success',
                'message' => 'Login berhasil',
                'data' => [
                    'user' => Auth::user(),
                    'tipe_user' => Auth::user()->tipe_user,
                ]
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Login gagal. Silakan coba lagi.'
        ], 401);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerate();

        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
