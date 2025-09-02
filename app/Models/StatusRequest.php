<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Str;

class StatusRequest extends Model
{
    //
    public $primaryKey = 'request_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->request_id = (string) Str::uuid();
        });

        static::created(function ($statusRequest) {
            AdminNotification::create([
                'request_id' => $statusRequest->request_id,
                'date' => $statusRequest->start_date,
                'time' => $statusRequest->start_time,
                'request_type' => $statusRequest->request_type,
                'status' => $statusRequest->status,
            ]);
        });
    }

    public function unitPosition()
    {
        return $this->belongsTo(UnitPosition::class, 'unit_position_id', 'id')
            ->with('unit', 'location');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'requested_by', 'user_id')
            ->select('user_id', 'name');

    }

    public function pic()
    {
        return $this->belongsTo(User::class, 'seen_by', 'user_id')
            ->select('user_id', 'name');
    }

    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id', 'id');
    }

    protected $fillable = [
        'date',
        'request_type',
        'time_start',
        'status',
        'request_id',
        'time_end',
        'seen_status',
        'seen_time',
        'seen_by',
        'unit_position_id'
    ];
}
