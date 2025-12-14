<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoalKuis extends Model
{
    protected $table = 'soal_kuis';

    protected $guarded = ['id'];

    public function sub_pembahasan()
    {
        return $this->hasOne(SubPembahasan::class, 'id_kuis');
    }

    public function kuis() {
        return $this->belongsTo(Kuis::class, 'id_kuis');
    }
}
