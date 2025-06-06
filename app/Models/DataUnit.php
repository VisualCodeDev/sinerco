<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataUnit extends Model
{
    protected $primaryKey = 'unitId';
    public $incrementing = false;
    protected $keyType = 'string';
    public $fillable = [
        'status',
    ];
}
