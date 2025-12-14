<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('activity_type'); // 'login', 'logout', 'page_view', 'quiz_start', 'quiz_submit', 'course_view'
            $table->string('page_url')->nullable(); // Current page URL
            $table->string('course_id')->nullable(); // If activity is course-related
            $table->string('quiz_id')->nullable(); // If activity is quiz-related
            $table->json('metadata')->nullable(); // Additional data like quiz answers, progress, etc.
            $table->timestamp('last_activity')->useCurrent();
            $table->boolean('is_online')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'is_online']);
            $table->index(['last_activity']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_activities');
    }
};
