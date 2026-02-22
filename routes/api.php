<?php

use App\Http\Controllers\CourseController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\KelolaDataCourseAdminController;
use App\Http\Controllers\CertificateController;

Route::get('/getIDUser', function () {
    $user = Auth::user();

    return response()->json([
        'id' => $user?->id,
        'name' => $user?->nama_lengkap,
        'email' => $user?->email,
    ]);
})->middleware(['web', 'auth', 'auth.session']);

Route::middleware(['web', 'auth', 'auth.session'])->group(function () {
    Route::get('/getDataCourse/{id}', [CourseController::class, 'getDataCourse'])->name('getDataCourse');
    Route::get('/getDataCourseku', [CourseController::class, 'getDataCourseku'])->name('getDataCourseku');
    Route::get('/getDataCourseku/{id}', [CourseController::class, 'getDataCourseku'])->name('getDataCourseku.single');
    Route::get('/quiz-submissions/{courseId}', [CourseController::class, 'getQuizSubmissions'])->name('quiz.submissions');
    Route::get('/progress/completed-videos/{courseId}', [CourseController::class, 'getCompletedVideos'])->name('progress.completed.videos');
    Route::get('/progress/downloaded-pdfs/{courseId}', [CourseController::class, 'getDownloadedPDFs'])->name('progress.downloaded.pdfs');
    Route::post('/updateProgress', [CourseController::class, 'updateProgress'])->name('updateProgress');
    Route::post('/student/activity', [App\Http\Controllers\Admin\StudentMonitoringController::class, 'trackStudentActivity'])->name('student.activity');

    // New routes for saving progress directly to database
    Route::post('/progress/video-completion', [CourseController::class, 'saveVideoCompletion'])->name('progress.video.completion');
    Route::post('/progress/pdf-download', [CourseController::class, 'savePDFDownload'])->name('progress.pdf.download');
    Route::post('/progress/quiz-completion', [CourseController::class, 'saveQuizCompletion'])->name('progress.quiz.completion');
});

Route::middleware(['web', 'auth', 'auth.session', 'role:admin'])->group(function () {
    Route::prefix('admin')->group(function () {
        Route::post('/upload', [App\Http\Controllers\Admin\FileUploadController::class, 'upload'])->name('admin.upload');
    });
});

Route::middleware(['web', 'auth', 'auth.session'])->group(function () {
    Route::get('/courses/student', [CourseController::class, 'getDataCourseku']);

    // Certificate API routes with proper authentication
    Route::get('/certificates', [CertificateController::class, 'index']);
    Route::get('/certificates/{id}', [CertificateController::class, 'getCertificate']);
    Route::get('/certificates/eligibility/{courseId}', [CertificateController::class, 'checkEligibility']);
    Route::post('/certificates/issue/{courseId}', [CertificateController::class, 'issueCertificate']);
    Route::post('/certificates/generate-pdf/{id}', [CertificateController::class, 'generatePdf']);
});

Route::middleware(['web', 'auth', 'auth.session', 'role:admin'])->prefix('admin')->group(function () {
    Route::post('/courses', [KelolaDataCourseAdminController::class, 'store']);
    Route::post('/upload', [App\Http\Controllers\Admin\FileUploadController::class, 'upload'])->name('admin.upload');
});

// Route::prefix('admin')->middleware(['auth', 'role:admin'])->group(function () {
//     Route::post('/upload-pdf', [KelolaSubPembahasanAdminController::class, 'uploadPdf']);
// });
