<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kuis extends Model
{
    protected $table = 'kuis';

    protected $guarded = ['id'];

    public function soal_kuis() {
        return $this->hasMany(SoalKuis::class, 'id_kuis');
    }
}
