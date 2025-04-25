<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyReport extends Model
{
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
        'approval1',
        'approval2'
    ];
}
