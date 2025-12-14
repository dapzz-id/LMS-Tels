<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('sub_pembahasan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_kursus')->constrained('kursus')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            // Video content fields
            $table->string('video_title')->nullable();
            $table->text('video_description')->nullable();
            $table->string('url_video_sub_pembahasan')->nullable();
            // PDF content fields
            $table->string('pdf_title')->nullable();
            $table->text('pdf_description')->nullable();
            $table->string('url_materi_pdf_sub_pembahasan')->nullable();
            // Quiz content fields
            $table->string('quiz_title')->nullable();
            $table->text('quiz_description')->nullable();
            $table->foreignId('id_kuis')->nullable()->constrained('kuis')->onDelete('set null');
            $table->integer('order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('sub_pembahasan');
    }
}; 