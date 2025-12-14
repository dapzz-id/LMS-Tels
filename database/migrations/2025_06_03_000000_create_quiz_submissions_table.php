<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('quiz_submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('course_id');
            $table->unsignedBigInteger('quiz_content_id');
            $table->json('answers');
            $table->float('score');
            $table->timestamp('submitted_at');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('course_id')->references('id')->on('kursus')->onDelete('cascade');
            $table->foreign('quiz_content_id')->references('id')->on('course_contents')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('quiz_submissions');
    }
};
