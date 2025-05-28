<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BranchArea extends Model
{
    protected $fillable = [
        'user',
        'area',
    ];

    protected $hidden = [
        'userId',
    ];
}
