<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Kontrak nempel ke 1 unit_position (bukan unit_id) -- kontrak itu perjanjian
// dengan client tertentu SAAT INI, kalau unit dipindah ke client lain itu jadi
// kontrak baru.
class Contract extends Model
{
    protected $fillable = [
        'unit_position_id',
        'contract_number',
        'start_date',
        'end_date',
        'status',
        'document_path',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
    ];

    public function unitPosition()
    {
        return $this->belongsTo(UnitPosition::class, 'unit_position_id', 'id');
    }
}
