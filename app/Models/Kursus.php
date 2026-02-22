<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Kursus extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'kursus';

    protected $guarded = ['id'];

    protected $fillable = [
        'id_mapel',
        'teacher_id',
        'judul_kursus',
        'deskripsi_kursus',
        'url_thumbnail',
        'estimated_duration',
        'difficulty_level',
        'prerequisites',
        'learning_objectives',
        'target_audience',
        'class',
        'is_featured',
        'view_count',
        'enrollment_count',
        'status'
    ];

    protected $casts = [
        'prerequisites' => 'array',
        'learning_objectives' => 'array',
        'target_audience' => 'array',
        'class' => 'array',
        'is_featured' => 'boolean',
        'view_count' => 'integer',
        'enrollment_count' => 'integer',
        'estimated_duration' => 'integer',
        'difficulty_level' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    public function siswa()
    {
        return $this->belongsToMany(User::class, 'siswa_kursus', 'id_kursus', 'id_siswa')
            ->withPivot(['progress', 'completed_at'])
            ->withTimestamps();
    }

    public function mapel(): BelongsTo
    {
        return $this->belongsTo(Mapel::class, 'id_mapel');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function sub_pembahasan() {
        return $this->hasMany(SubPembahasan::class, 'id_kursus')->orderBy('order');
    }

    public function progress(){
        return $this->hasMany(ProgressCourse::class, 'id_kursus');
    }

    public function contents(): HasMany
    {
        return $this->hasMany(CourseContent::class, 'kursus_id')->orderBy('order');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function getTotalDurationAttribute()
    {
        return $this->contents()->sum('duration');
    }

    public function getProgressPercentageAttribute()
    {
        if ($this->contents()->count() === 0) {
            return 0;
        }
        return round(($this->progress()->where('status', 'selesai')->count() / $this->contents()->count()) * 100);
    }

    public function getDifficultyTextAttribute()
    {
        return match($this->difficulty_level) {
            1 => 'Beginner',
            2 => 'Elementary',
            3 => 'Intermediate',
            4 => 'Advanced',
            5 => 'Expert',
            default => 'Not Specified'
        };
    }
}
