<?php

use App\Http\Middleware\RoleMiddleware;
use Illuminate\Http\Request;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->api(append: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Throwable $exception, Request $request) {
            if ($exception instanceof ValidationException) {
                return null;
            }

            $statusCode = $exception instanceof HttpExceptionInterface
                ? $exception->getStatusCode()
                : 500;

            if ($request->expectsJson() || $request->is('api/*')) {
                $message = match ($statusCode) {
                    403 => 'Anda tidak memiliki akses ke resource ini.',
                    404 => 'Resource tidak ditemukan.',
                    default => 'Terjadi kesalahan pada server.',
                };

                return response()->json([
                    'message' => $message,
                ], $statusCode);
            }

            if ($request->header('X-Inertia') && in_array($statusCode, [403, 404, 500, 503], true)) {
                $title = match ($statusCode) {
                    403 => 'Akses Ditolak',
                    404 => 'Halaman Tidak Ditemukan',
                    503 => 'Layanan Tidak Tersedia',
                    default => 'Terjadi Kesalahan',
                };

                $message = match ($statusCode) {
                    403 => 'Anda tidak memiliki izin untuk membuka halaman ini.',
                    404 => 'Halaman yang Anda tuju tidak tersedia atau sudah dipindahkan.',
                    503 => 'Layanan sedang dalam perawatan. Coba kembali beberapa saat lagi.',
                    default => 'Terjadi gangguan pada server. Silakan coba lagi.',
                };

                return Inertia::render('Error', [
                    'status' => $statusCode,
                    'title' => $title,
                    'message' => $message,
                ])->toResponse($request)->setStatusCode($statusCode);
            }

            return null;
        });
    })->create();
