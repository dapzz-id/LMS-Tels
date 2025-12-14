<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizSubmission extends Model
{
    protected $table = 'quiz_submissions';
    protected $guarded = ['id'];
    protected $casts = [
        'answers' => 'array',
        'submitted_at' => 'datetime',
    ];
    protected $fillable = [
        'user_id',
        'course_id',
        'quiz_content_id',
        'answers',
        'score',
        'time_taken',
        'submitted_at',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function course() {
        return $this->belongsTo(Kursus::class, 'course_id');
    }
    public function quizContent() {
        return $this->belongsTo(CourseContent::class, 'quiz_content_id');
    }
}
