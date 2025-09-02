<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyReport extends Model
{
    public function unitPosition()
    {
        return $this->belongsTo(UnitPosition::class, 'unit_position_id', 'id');
    }
    public function request()
    {
        return $this->belongsTo(StatusRequest::class, 'request_id', 'request_id');
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
        'request_id'
    ];
}
