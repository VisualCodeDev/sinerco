<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyReport extends Model
{
    public function unitAreaLocation()
    {
        return $this->belongsTo(UnitAreaLocation::class, 'unitAreaLocationId', 'unitAreaLocationId');
    }
    public function request()
    {
        return $this->belongsTo(StatusRequest::class, 'requestId', 'requestId');
    }
    protected $fillable = [
        'date',
        'time',
        'sourcePress',
        'suctionPress',
        'dischargePress',
        'speed',
        'manifoldPress',
        'oilPress',
        'oilDiff',
        'runningHours',
        'voltage',
        'waterTemp',
        'befCooler',
        'arfCooler',
        'staticPress',
        'diffPress',
        'mscfd',
        'requestId'
    ];

    protected $casts = [
        'data' => 'array',
    ];
}
