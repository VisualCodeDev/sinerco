<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class DailyReportSettings extends Model
{
    protected $fillable = [
        'client_id',
        'decimalSetting',
        'minMaxSetting',
        'unitSetting',
    ];

    protected $casts = [
        'decimalSetting' => 'array',
        'minMaxSetting' => 'array',
        'unitSetting' => 'array',
    ];

     public function unitPositions()
    {
        return $this->hasMany(UnitPosition::class, 'client_id', 'client_id');
    }
}
