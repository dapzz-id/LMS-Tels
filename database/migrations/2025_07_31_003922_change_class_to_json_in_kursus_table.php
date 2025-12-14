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
        Schema::table('kursus', function (Blueprint $table) {
            // Drop the existing class column
            $table->dropColumn('class');
        });

        Schema::table('kursus', function (Blueprint $table) {
            // Add the new JSON class column
            $table->json('class')->nullable()->after('target_audience');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kursus', function (Blueprint $table) {
            // Drop the JSON class column
            $table->dropColumn('class');
        });

        Schema::table('kursus', function (Blueprint $table) {
            // Add back the string class column
            $table->string('class')->nullable()->after('target_audience');
        });
    }
};
