<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Model untuk field/kolom laporan harian
class DailyField extends Model
{
     // Kolom yang boleh diisi mass assignment
     protected $fillable = [
        'name',
        'slug',
    ];

    // Relasi ke banyak Subfield milik field ini
    public function subfields() {
        return $this->hasMany(Subfield::class, 'field_id');
    }
}
