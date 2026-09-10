<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Model penghubung antara unit dan field laporan harian
class UnitField extends Model
{
    // Kolom yang boleh diisi mass assignment
    protected $fillable = [
        'unit_id',
        'field_id',
        'column',
        'required',
    ];

    // Relasi ke DailyField terkait
    public function fields()
    {
        return $this->belongsTo(DailyField::class, 'field_id', 'id');
    }
}
