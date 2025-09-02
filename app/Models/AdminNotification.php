<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminNotification extends Model
{
    //
    public function Request()
    {
        return $this->hasMany(StatusRequest::class, 'request_id', 'request_id');
    }
    protected $fillable = [
        'date',
        'time',
        'request_type',
        'status',
        'request_id',
    ];
}
