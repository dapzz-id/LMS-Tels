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
        Schema::create('progress_kursus', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_siswa');
            $table->unsignedBigInteger('id_kursus');
            $table->unsignedBigInteger('id_sub_pembahasan')->nullable();
            $table->integer('progress_per_subbab')->nullable(); //1 (Video), 2 (Materi), 3 (Quiz)
            $table->enum('status', ['belum dimulai', 'sedang berlangsung', 'selesai'])->default('belum dimulai');
            $table->timestamps();
    
            $table->foreign('id_siswa')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_kursus')->references('id')->on('kursus')->onDelete('cascade');
            $table->foreign('id_sub_pembahasan')->references('id')->on('sub_pembahasan')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progress_courses');
    }
};
