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
        Schema::create('siswa_kursus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_siswa')->constrained('users')->cascadeOnDelete();
            $table->foreignId('id_kursus')->constrained('kursus')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('siswa_kursus');
    }
};
