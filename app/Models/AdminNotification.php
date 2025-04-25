<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminNotification extends Model
{
    //
    protected $fillable = [
        'date',
        'time',
        'requestType',
        'status',  
        'requestId',
    ];
}
