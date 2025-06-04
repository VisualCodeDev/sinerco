<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class DailyReportSettings extends Model
{
    protected $fillable = [
        'clientId',
        'decimalSetting',
        'minMaxSetting',
    ];

    protected $casts = [
        'decimalSetting' => 'array',
        'minMaxSetting' => 'array',
    ];

     public function unitAreaLocations()
    {
        return $this->hasMany(UnitAreaLocation::class, 'userDataUnitId', 'userDataUnitId');
    }
}
