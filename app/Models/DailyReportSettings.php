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
    ];

    protected $casts = [
        'decimalSetting' => 'array',
        'minMaxSetting' => 'array',
    ];

     public function unitPositions()
    {
        return $this->hasMany(UnitPosition::class, 'client_id', 'client_id');
    }
}
