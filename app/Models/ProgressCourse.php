<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgressCourse extends Model
{
    protected $guarded = ['id'];
    protected $table = 'progress_kursus';
    public function siswa()
    {
        return $this->belongsTo(User::class, 'id_siswa');
    }
    public function kursus()
    {
        return $this->belongsTo(Kursus::class, 'id_kursus');
    }
    public function sub_pembahasan()
    {
        return $this->belongsTo(SubPembahasan::class, 'id_sub_pembahasan');
    }
}
