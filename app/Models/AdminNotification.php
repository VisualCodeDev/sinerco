<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminNotification extends Model
{
    //
    public function Request()
    {
        return $this->hasMany(StatusRequest::class, 'requestId', 'requestId');
    }
    protected $fillable = [
        'date',
        'time',
        'requestType',
        'status',
        'requestId',
    ];
}
