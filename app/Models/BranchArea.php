<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Model untuk data area/cabang
class BranchArea extends Model
{
    // Kolom yang boleh diisi mass assignment
    protected $fillable = [
        'user',
        'area',
    ];

    // Kolom yang disembunyikan saat serialisasi
    protected $hidden = [
        'user_id',
    ];
}
