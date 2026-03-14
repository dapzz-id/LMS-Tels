<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="light">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="turbo-cache-control" content="no-cache" />
        <meta name="turbo-visit-control" content="reload" />
        <meta name="description" content="LMS TELS adalah platform pembelajaran jarak jauh yang memudahkan siswa dalam belajar dan mengerjakan tugas secara online dengan praktis dan efisien.">
        <meta name="keywords" content="LMS, TELS, Telesandi, Telkom, Bekasi, IT, Syntax, pembelajaran, jarak jauh, online, siswa, tugas">
        <meta name="author" content="Tri Developer">

        <title inertia>{{ config('app.name', 'LMS TELS') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <link rel="icon" type="image/png" href="{{ asset('logotelesandi.png') }}" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead

        <!-- MathJax for mathematical equations -->
        <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
        <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    </head>
    <body class="min-h-screen bg-background font-sans antialiased">
        @inertia
    </body>
</html>
