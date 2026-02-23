<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $guarded = ['id'];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
    ];

    public function kursus()
    {
        return $this->belongsToMany(Kursus::class, 'siswa_kursus', 'id_siswa', 'id_kursus')
            ->withTimestamps();
    }

    public function courses()
    {
        return $this->belongsToMany(Kursus::class, 'siswa_kursus', 'id_siswa', 'id_kursus')
            ->withTimestamps();
    }

    public function quizSubmissions()
    {
        return $this->hasMany(QuizSubmission::class, 'user_id');
    }

    public function progressKursus()
    {
        return $this->hasMany(ProgressCourse::class, 'id_siswa');
    }

    public function activities()
    {
        return $this->hasMany(StudentActivity::class, 'user_id');
    }
}
