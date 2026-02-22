<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'nama_lengkap' => $user->nama_lengkap,
                    // Compatibility for legacy components that still read `name`.
                    'name' => $user->nama_lengkap,
                    'username' => $user->username,
                    'email' => $user->email,
                    'tipe_user' => $user->tipe_user,
                    'class' => $user->class,
                    'email_verified_at' => $user->email_verified_at,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'status' => fn () => $request->session()->get('status'),
            ],
            'app' => [
                'vNetLink' => config('app.v_net_link'),
            ],
            'csrf_token' => csrf_token(),
        ];
    }
}
