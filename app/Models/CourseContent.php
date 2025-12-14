<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseContent extends Model
{
    use HasFactory;

    protected $fillable = [
        'kursus_id',
        'sub_pembahasan_id',
        'type',
        'title',
        'description',
        'url',
        'duration',
        'is_required',
        'points',
        'passing_score',
        'quiz_data',
        'one_submission_only',
        'show_grades',
        'order',
    ];

    protected $casts = [
        'quiz_data' => 'array',
        'is_required' => 'boolean',
        'one_submission_only' => 'boolean',
        'show_grades' => 'boolean',
        'points' => 'integer',
        'passing_score' => 'integer',
        'duration' => 'integer',
        'order' => 'integer',
    ];

    public function kursus()
    {
        return $this->belongsTo(Kursus::class, 'kursus_id');
    }

    public function subPembahasan()
    {
        return $this->belongsTo(SubPembahasan::class, 'sub_pembahasan_id');
    }


}
