<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubPembahasan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'sub_pembahasan';

    protected $fillable = [
        'id_kursus',
        'title',
        'description',
        'video_title',
        'video_description',
        'url_video_sub_pembahasan',
        'pdf_title',
        'pdf_description',
        'url_materi_pdf_sub_pembahasan',
        'quiz_title',
        'quiz_description',
        'id_kuis',
        'order'
    ];

    protected $casts = [
        'order' => 'integer'
    ];

    public function kursus(): BelongsTo
    {
        return $this->belongsTo(Kursus::class, 'id_kursus');
    }

    public function kuis(): BelongsTo
    {
        return $this->belongsTo(Kuis::class, 'id_kuis');
    }

    public function contents(): HasMany
    {
        return $this->hasMany(CourseContent::class, 'sub_pembahasan_id')->orderBy('order');
    }
}
