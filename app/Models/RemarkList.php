<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RemarkList extends Model
{
    protected $fillable = [
        'remark',
        'request_type',
    ];

    protected $casts = [
        'request_type' => 'array',
    ];
}
