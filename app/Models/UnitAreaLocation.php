<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnitAreaLocation extends Model
{
    protected $fillable = [
        'unitAreaLocationId',
        'unitId',
        'clientId',
        'area',
        'location',
    ];

    public function dailyReportSetting()
    {
        return $this->belongsTo(DailyReportSettings::class, 'clientId', 'clientId')
            ->select('clientId', 'minMaxSetting', 'decimalSetting');
    }

    public function unit()
    {
        return $this->belongsTo(DataUnit::class, 'unitId', 'unitId');
    }
    public function location()
    {
        return $this->belongsTo(Location::class, 'locationId', 'id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'clientId', 'clientId');
    }
}
