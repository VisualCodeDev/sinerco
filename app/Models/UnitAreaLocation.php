<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnitAreaLocation extends Model
{
    protected $fillable = [
        'unitAreaLocationId',
        'unitId',
        'userDataUnitId',
        'area',
        'location',
    ];

    public function dailyReportSetting()
    {
        return $this->belongsTo(DailyReportSettings::class, 'userDataUnitId', 'userDataUnitId')
            ->select('userDataUnitId', 'minMaxSetting', 'decimalSetting');
    }

    public function unit()
    {
        return $this->belongsTo(DataUnit::class, 'unitId', 'unitId');
    }

    public function user()
    {
        return $this->belongsTo(UserDataUnit::class, 'userDataUnitId', 'userDataUnitId');
    }
}
