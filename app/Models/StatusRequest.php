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

    public function unit()
    {
        return $this->belongsTo(DataUnit::class, 'unitId', 'unitId')
            ->select('unitId', 'status', 'unit');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'requestedBy', 'id')
            ->select('id', 'name');

    }

    public function pic()
    {
        return $this->belongsTo(User::class, 'seenBy', 'id')
            ->select('id', 'name');
    }

    public function location()
    {
        return $this->belongsTo(Location::class, 'locationId', 'id');
    }

    protected $fillable = [
        'date',
        'requestType',
        'timeStart',
        'status',
        'requestId',
        'timeEnd',
        'seenStatus',
        'seenTime',
        'seenBy'
    ];
}
