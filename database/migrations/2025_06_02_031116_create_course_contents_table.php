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
        Schema::create('course_contents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('kursus_id');
            $table->unsignedBigInteger('sub_pembahasan_id');
            $table->string('type'); // video, pdf, quiz
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('url')->nullable();
            $table->integer('duration')->nullable();
            $table->boolean('is_required')->default(true);
            $table->integer('points')->nullable();
            $table->integer('passing_score')->nullable();
            $table->json('quiz_data')->nullable();
            $table->integer('order')->nullable();
            $table->timestamps();

            $table->foreign('kursus_id')->references('id')->on('kursus')->onDelete('cascade');
            $table->foreign('sub_pembahasan_id')->references('id')->on('sub_pembahasan')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_contents');
    }
};
