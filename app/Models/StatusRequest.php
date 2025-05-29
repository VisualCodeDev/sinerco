<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Str;

class StatusRequest extends Model
{
    //
    public $incrementing = false;
    protected $keyType = 'string';

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->requestId = (string) Str::uuid();
        });

        static::created(function ($statusRequest) {
            AdminNotification::create([
                'requestId' => $statusRequest->requestId,
                'date' => $statusRequest->startDate,
                'time' => $statusRequest->startTime,
                'requestType' => $statusRequest->requestType,
                'status' => $statusRequest->status,
            ]);
        });
    }

    protected $protected = [
        'date',
        'requestType',
        'timeStart',
        'status',
        'requestId',
        'timeEnd'
    ];
}
