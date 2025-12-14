<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Container\Attributes\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log as FacadesLog;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!Auth::check()) {
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        // Ambil user yang sedang login
        $user = Auth::user();

        FacadesLog::info('MIDDLEWARE: User tipe: ' . $user->tipe_user);
        FacadesLog::info('MIDDLEWARE: Roles yang diizinkan: ', $roles);

        // Periksa apakah tipe user sesuai dengan yang diizinkan
        if (!in_array(strtolower(trim($user->tipe_user)), array_map('strtolower', $roles))) {
             abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        return $next($request);
    }
}
