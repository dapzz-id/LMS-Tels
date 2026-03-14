<?php

use App\Http\Controllers\Admin\DashboardAdminController;
use App\Http\Controllers\Admin\KelolaDataCourseAdminController;
use App\Http\Controllers\Admin\KelolaDataUserAdminController;
use App\Http\Controllers\Admin\KelolaKuisAdminController;
use App\Http\Controllers\Admin\KelolaSoalKuisAdminController;
use App\Http\Controllers\Admin\KelolaSubPembahasanAdminController;
use App\Http\Controllers\Admin\MapelAdminController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\LoginController;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Admin\KelolaDataDepartmentController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\StudentDashboardController;

Route::get('/', function (\Illuminate\Http\Request $request) {
    if (Auth::check()) {
        $tipe_user = Auth::user()->tipe_user;

        // Redirect berdasarkan tipe user
        return match ($tipe_user) {
            'admin' => Inertia::location(route('admin.dashboard')), // Route khusus untuk admin
            'siswa' => app(StudentDashboardController::class)->index($request), // Dashboard khusus untuk siswa
            'guru' => Inertia::location(route('teacher.dashboard')), // Route khusus untuk guru
            default => tap(Auth::logout(), fn() => back()->withErrors(['npk' => 'Hak akses tidak valid.'])),
        };
    }

    return redirect()->route('login');
})->name('student.dashboard');

// Login, register and password reset routes - must be before auth middleware routes
Route::get('/login', [LoginController::class, 'index'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.post');

// Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
// Route::post('register', [RegisteredUserController::class, 'store']);

// Password Reset Routes
Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
    ->name('password.request');
Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
    ->name('password.email');
Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
    ->name('password.reset');
Route::post('reset-password', [NewPasswordController::class, 'store'])
    ->name('password.store');

Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::put('/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('/verify-email', EmailVerificationPromptController::class)->name('verification.notice');
    Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
    Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('/confirm-password', [ConfirmablePasswordController::class, 'show'])->name('password.confirm');
    Route::post('/confirm-password', [ConfirmablePasswordController::class, 'store']);
});

Route::middleware(['web', 'auth'])->group(function () {
    Route::prefix('/api')->group(function () {
        Route::prefix('admin')->middleware('role:admin')->group(function () {
            Route::get('/get-stats', [DashboardAdminController::class, 'getStats']);
            Route::get('/analytics', [DashboardAdminController::class, 'analytics']);
            Route::get('/analytics/export', [DashboardAdminController::class, 'exportProgressReport']);
            Route::post('/upload', [KelolaSubPembahasanAdminController::class, 'store']);
            Route::post('/upload-pdf', [KelolaSubPembahasanAdminController::class, 'uploadPdf']);

            // Course management routes
            Route::prefix('courses')->group(function () {
                Route::get('/', [KelolaDataCourseAdminController::class, 'index']);
                Route::post('/', [KelolaDataCourseAdminController::class, 'store']);
                Route::get('/{id}', [KelolaDataCourseAdminController::class, 'show']);
                Route::get('/{id}/status', [KelolaDataCourseAdminController::class, 'checkStatus']);
                Route::put('/{kursus:id}', [KelolaDataCourseAdminController::class, 'update']);
                Route::delete('/{id}', [KelolaDataCourseAdminController::class, 'destroy']);
            });
        });

        Route::middleware('role:admin')->group(function () {
            Route::resource('users', KelolaDataUserAdminController::class);
            Route::resource('kursus', KelolaDataCourseAdminController::class);
            Route::resource('kuis', KelolaKuisAdminController::class);
            Route::resource('soal_kuis', KelolaSoalKuisAdminController::class);
            Route::resource('sub_pembahasan', KelolaSubPembahasanAdminController::class);
            Route::resource('mapel', MapelAdminController::class);
        });

        // Add student course routes
        Route::get('/getIDUser', function () {
            $user = auth()->user();

            return response()->json([
                'id' => auth()->id(),
                'name' => $user?->nama_lengkap,
                'email' => $user?->email,
            ]);
        });

        Route::get('/getDataCourseku/{userId?}', [App\Http\Controllers\CourseController::class, 'getDataCourseku']);
        Route::post('/updateProgress', [App\Http\Controllers\CourseController::class, 'updateProgress']);

        // Quiz routes
        Route::get('/quizzes/{id}', [QuizController::class, 'show'])->name('api.quizzes.show')->middleware('role:siswa');
        Route::post('/quizzes/{id}/submit', [QuizController::class, 'submit'])->name('api.quizzes.submit')->middleware('role:siswa');

        // Certificate routes were here but removed to avoid conflicts
        // They are now properly defined in api.php with correct middleware
    });
});

// Dashboard routes - users
Route::middleware(['auth', 'verified'])->group(function () {
    // Legacy dashboard path compatibility
    Route::get('/dashboard', function () {
        return redirect()->route('student.dashboard');
    })->name('student.dashboard.legacy')->middleware('role:siswa');

    // Student courses
    Route::get('/dashboard/courses', function () {
        return Inertia::render('dashboard/courses/page');
    })->name('student.courses')->middleware('role:siswa');

    // Student settings
    Route::get('/dashboard/settings', function () {
        return Inertia::render('dashboard/settings/page');
    })->name('student.settings')->middleware('role:siswa');

    // Student grades
    Route::get('/dashboard/grades', [App\Http\Controllers\StudentGradesController::class, 'index'])->name('student.grades')->middleware('role:siswa');

    Route::get('/dashboard/courses/{id}', function ($id) {
        return Inertia::render('dashboard/courses/[id]/page', ['id' => $id]);
    })->name('student.courses.show')->middleware('role:siswa');

    Route::get('/dashboard/courses/{id}/learn', [App\Http\Controllers\CourseController::class, 'openLearnPage'])
        ->name('student.courses.learn')
        ->middleware('role:siswa');

    Route::get('/dashboard/courses/{courseId}/quiz/{id}', [QuizController::class, 'show'])
        ->name('student.quiz.course')
        ->middleware('role:siswa');

    // Certificate routes
    Route::get('/dashboard/certificates', [CertificateController::class, 'index'])->name('student.certificates')->middleware('role:siswa');
    Route::get('/dashboard/certificates/{id}', [CertificateController::class, 'show'])->name('student.certificates.show')->middleware('role:siswa');
    Route::get('/dashboard/certificates/{id}/download', [CertificateController::class, 'download'])->name('student.certificates.download')->middleware('role:siswa');

    // Other student routes
    Route::get('/dashboard/library', function () {
        return Inertia::render('dashboard/library/page');
    })->name('student.library')->middleware('role:siswa');

    Route::get('/dashboard/assignments', function () {
        return Inertia::render('dashboard/assignments/page');
    })->name('student.assignments')->middleware('role:siswa');

    Route::get('/dashboard/assignments/{id}', function ($id) {
        return Inertia::render('dashboard/assignments/[id]/page', ['id' => $id]);
    })->name('student.assignments.show')->middleware('role:siswa');

});

// Teacher routes
Route::middleware(['auth', 'role:guru'])->prefix('teacher')->group(function () {
    Route::get('/', function () {
        return Inertia::render('teacher/page');
    })->name('teacher.dashboard');

    // Course routes
    Route::prefix('courses')->group(function () {
        Route::get('/', [App\Http\Controllers\Teacher\TeacherCourseController::class, 'index'])->name('teacher.courses.index');
        Route::get('/create', [App\Http\Controllers\Teacher\TeacherCourseController::class, 'create'])->name('teacher.courses.create');
        Route::post('/', [App\Http\Controllers\Teacher\TeacherCourseController::class, 'store'])->name('teacher.courses.store');
        Route::get('/{kursus}', [App\Http\Controllers\Teacher\TeacherCourseController::class, 'show'])->name('teacher.courses.show');
        Route::get('/{kursus}/edit', [App\Http\Controllers\Teacher\TeacherCourseController::class, 'edit'])->name('teacher.courses.edit');
        Route::put('/{kursus}', [App\Http\Controllers\Teacher\TeacherCourseController::class, 'update'])->name('teacher.courses.update');
        Route::delete('/{kursus}', [App\Http\Controllers\Teacher\TeacherCourseController::class, 'destroy'])->name('teacher.courses.destroy');
        Route::post('/upload-pdf', [App\Http\Controllers\Teacher\TeacherCourseController::class, 'uploadPdf'])->name('teacher.courses.upload-pdf');
        Route::post('/upload-image', [App\Http\Controllers\Teacher\TeacherCourseController::class, 'uploadImage'])->name('teacher.courses.upload-image'); // Add this line
        Route::get('/{kursus}/student-progress', [App\Http\Controllers\Teacher\TeacherCourseController::class, 'studentProgress'])->name('teacher.courses.student-progress');
        Route::get('/{id}/status', [App\Http\Controllers\Teacher\TeacherCourseController::class, 'checkStatus'])->name('teacher.courses.check-status');
    });

    Route::get('/students', [App\Http\Controllers\Teacher\TeacherStudentsController::class, 'index'])->name('teacher.students');
    Route::get('/student-progress', [App\Http\Controllers\Teacher\TeacherStudentsController::class, 'index'])->name('teacher.student-progress');
    Route::delete('/students/{studentId}/courses/{courseId}', [App\Http\Controllers\Teacher\TeacherStudentsController::class, 'removeFromCourse'])->name('teacher.students.remove-course');

    Route::get('/assignments', function () {
        return Inertia::render('teacher/assignments/page');
    })->name('teacher.assignments');

    Route::get('/assignments/new', function () {
        return Inertia::render('teacher/assignments/new/page');
    })->name('teacher.assignments.new');

    Route::get('/assignments/templates', function () {
        return Inertia::render('teacher/assignments/templates/page');
    })->name('teacher.assignments.templates');

    Route::get('/courses/new', function () {
        return redirect()->route('teacher.courses.create');
    })->name('teacher.courses.new');

    Route::get('/announcements/new', function () {
        return Inertia::render('teacher/announcements/new/page');
    })->name('teacher.announcements.new');

    Route::get('/materials/upload', function () {
        return Inertia::render('teacher/materials/upload/page');
    })->name('teacher.materials.upload');

    Route::get('/analytics', function () {
        return Inertia::render('teacher/analytics/page');
    })->name('teacher.analytics');

    Route::get('/student-grades', [App\Http\Controllers\Teacher\TeacherStudentGradesController::class, 'index'])->name('teacher.student-grades');
    Route::get('/student-grades/{id}', [App\Http\Controllers\Teacher\TeacherStudentGradesController::class, 'show'])->name('teacher.student-grades.show');

    // Student Monitoring
    Route::get('/student-monitoring', [App\Http\Controllers\Admin\StudentMonitoringController::class, 'index'])->name('teacher.student-monitoring');

});

// Semua route admin hanya diakses oleh admin yang sudah login
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/', fn () => Inertia::render('admin/page'))->name('admin.dashboard');

    // Course routes
    Route::prefix('courses')->group(function () {
        Route::get('/', [KelolaDataCourseAdminController::class, 'index'])->name('admin.courses.index');
        Route::get('/create', [KelolaDataCourseAdminController::class, 'create'])->name('admin.courses.create');
        Route::post('/', [KelolaDataCourseAdminController::class, 'store'])->name('admin.courses.store');
        Route::post('/upload-pdf', [KelolaDataCourseAdminController::class, 'uploadPdf'])->name('admin.courses.upload-pdf');
        Route::post('/upload-image', [KelolaDataCourseAdminController::class, 'uploadImage'])->name('admin.courses.upload-image'); // Add this line
        Route::get('/{kursus}', [KelolaDataCourseAdminController::class, 'show'])->name('admin.courses.show');
        Route::get('/{kursus}/edit', [KelolaDataCourseAdminController::class, 'edit'])->name('admin.courses.edit');
        Route::put('/{kursus}', [KelolaDataCourseAdminController::class, 'update'])->name('admin.courses.update');
        Route::patch('/{kursus}/class', [KelolaDataCourseAdminController::class, 'updateClass'])->name('admin.courses.update-class');
        Route::delete('/{kursus}', [KelolaDataCourseAdminController::class, 'destroy'])->name('admin.courses.destroy');
    });

    // Grades routes
    Route::prefix('grades')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\GradesAdminController::class, 'index'])->name('admin.grades');
        Route::get('/{id}', [App\Http\Controllers\Admin\GradesAdminController::class, 'show'])->name('admin.grades.show');
        Route::post('/export', [App\Http\Controllers\Admin\GradesAdminController::class, 'export'])->name('admin.grades.export');
    });

    // Users
    Route::get('/users', [KelolaDataUserAdminController::class, 'index'])->name('admin.users');
    Route::get('/users/export', [KelolaDataUserAdminController::class, 'export'])->name('admin.users.export');
    Route::get('/users/template', [KelolaDataUserAdminController::class, 'downloadTemplate'])->name('admin.users.template');
    Route::get('/users/new', fn () => Inertia::render('admin/users/new/page'))->name('admin.users.new');
    Route::post('/users', [KelolaDataUserAdminController::class, 'store'])->name('admin.users.store');
    Route::post('/users/import', [KelolaDataUserAdminController::class, 'import'])->name('admin.users.import');
    Route::get('/users/{user}', [KelolaDataUserAdminController::class, 'show'])->name('admin.users.show');
    Route::put('/users/{user}', [KelolaDataUserAdminController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{user}', [KelolaDataUserAdminController::class, 'destroy'])->name('admin.users.destroy');

    // Lain-lain
    Route::get('/settings', fn () => Inertia::render('admin/settings/page'))->name('admin.settings');
    Route::get('/roles', fn () => Inertia::render('admin/roles/page'))->name('admin.roles');
    Route::get('/logs', fn () => Inertia::render('admin/logs/page'))->name('admin.logs');
    Route::get('/analytics', fn () => Inertia::render('admin/analytics/page'))->name('admin.analytics');
    Route::get('/integrations', fn () => Inertia::render('admin/integrations/page'))->name('admin.integrations');

    // Student Monitoring
    Route::get('/student-monitoring', [App\Http\Controllers\Admin\StudentMonitoringController::class, 'index'])->name('admin.student-monitoring');

    // Student Progress
    Route::get('/student-progress', [App\Http\Controllers\Admin\StudentProgressController::class, 'index'])->name('admin.student-progress');
    Route::get('/student-progress/{studentId}', [App\Http\Controllers\Admin\StudentProgressController::class, 'show'])->name('admin.student-progress.show');

    // Departments
    Route::get('/departments', [KelolaDataDepartmentController::class, 'index'])->name('departments.index');
    Route::post('/departments', [KelolaDataDepartmentController::class, 'store'])->name('departments.store');
    Route::put('/departments/{department}', [KelolaDataDepartmentController::class, 'update'])->name('departments.update');
    Route::delete('/departments/{department}', [KelolaDataDepartmentController::class, 'destroy'])->name('departments.destroy');
});

// Student Activity Tracking API (for students to report their activities)
Route::post('/api/student/activity', [App\Http\Controllers\Admin\StudentMonitoringController::class, 'trackStudentActivity'])->name('api.student.activity')->middleware('auth');

// Quiz routes
Route::get('/quiz/{id}', [QuizController::class, 'show'])->name('student.quiz.show')->middleware(['auth', 'role:siswa']);
Route::post('/quiz/{id}/submit', [QuizController::class, 'submit'])->name('student.quiz.submit')->middleware(['auth', 'role:siswa']);

// Teacher Analytics API route (keep this as API since it's used by the analytics page)
Route::prefix('api/teacher')->middleware(['auth', 'role:guru'])->group(function () {
    Route::get('/analytics', [App\Http\Controllers\Teacher\TeacherAnalyticsController::class, 'analytics'])->name('api.teacher.analytics');
    Route::get('/analytics/export', [App\Http\Controllers\Teacher\TeacherAnalyticsController::class, 'exportProgressReport'])->name('api.teacher.analytics.export');

    // Teacher Student Monitoring API routes
    Route::get('/student-monitoring/live-data', [App\Http\Controllers\Admin\StudentMonitoringController::class, 'getLiveData'])->name('api.teacher.student-monitoring.live-data');
    Route::get('/student-monitoring/student/{studentId}', [App\Http\Controllers\Admin\StudentMonitoringController::class, 'getStudentDetails'])->name('api.teacher.student-monitoring.student-details');
    Route::get('/student-monitoring/summary', [App\Http\Controllers\Admin\StudentMonitoringController::class, 'getActivitySummary'])->name('api.teacher.student-monitoring.summary');
    Route::get('/student-monitoring/class-stats', [App\Http\Controllers\Admin\StudentMonitoringController::class, 'getClassStats'])->name('api.teacher.student-monitoring.class-stats');
});

// Admin API routes
Route::prefix('api/admin')->middleware(['auth', 'role:admin'])->group(function () {
    Route::post('/courses', [App\Http\Controllers\Admin\KelolaDataCourseAdminController::class, 'store'])->name('api.admin.courses.store');
    Route::post('/upload-pdf', [App\Http\Controllers\Admin\KelolaDataCourseAdminController::class, 'uploadPdf'])->name('api.admin.upload-pdf');

    // Student Monitoring API routes
    Route::get('/student-monitoring/live-data', [App\Http\Controllers\Admin\StudentMonitoringController::class, 'getLiveData'])->name('api.admin.student-monitoring.live-data');
    Route::get('/student-monitoring/student/{studentId}', [App\Http\Controllers\Admin\StudentMonitoringController::class, 'getStudentDetails'])->name('api.admin.student-monitoring.student-details');
    Route::get('/student-monitoring/summary', [App\Http\Controllers\Admin\StudentMonitoringController::class, 'getActivitySummary'])->name('api.admin.student-monitoring.summary');
    Route::get('/student-monitoring/class-stats', [App\Http\Controllers\Admin\StudentMonitoringController::class, 'getClassStats'])->name('api.admin.student-monitoring.class-stats');
});

// Download PDF route
Route::get('/download/pdf/{filename}', function (string $filename) {
    $safeFilename = basename($filename);

    if (
        $safeFilename !== $filename ||
        !preg_match('/^[A-Za-z0-9._-]+$/', $safeFilename)
    ) {
        abort(404);
    }

    $path = storage_path('app/public/pdfs/' . $safeFilename);
    if (!file_exists($path)) {
        abort(404);
    }

    return response()->download(
        $path,
        $safeFilename,
        ['X-Content-Type-Options' => 'nosniff']
    );
})->name('download.pdf')->middleware('auth');

// Comment out or remove this line if it exists
// require __DIR__.'/auth.php';
