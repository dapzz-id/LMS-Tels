<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('kursus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_mapel')->constrained('mapel')->onDelete('cascade');
            $table->string('judul_kursus');
            $table->text('deskripsi_kursus');
            $table->string('url_thumbnail');
            $table->string('status');
            $table->integer('estimated_duration')->nullable(); // in minutes
            $table->json('prerequisites')->nullable();
            $table->json('learning_objectives')->nullable();
            $table->json('target_audience')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('kursus');
    }
};
