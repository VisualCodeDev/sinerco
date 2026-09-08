<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Model untuk subfield/anak field dari DailyField
class Subfield extends Model
{
    // Kolom yang boleh diisi mass assignment
    protected $fillable = [
        'name',
        'slug',
        'field_id'
    ];

    // Relasi ke DailyField induknya
    public function field()
    {
        return $this->belongsTo(DailyField::class, 'field_id', 'id');
    }
}
