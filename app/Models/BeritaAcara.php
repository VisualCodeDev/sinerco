<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BeritaAcara extends Model
{
     // kolom yang boleh diisi mass-assignment
     protected $fillable = [
        'unit_position_id',
        'spv_name',
        'spv_department',
        'pic_name',
        'pic_department',
        'client_name',
        'client_department',
    ];
}
