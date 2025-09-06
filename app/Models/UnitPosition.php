<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnitPosition extends Model
{
    protected $fillable = [
        'unit_id',
        'client_id',
        'area',
        'location',
    ];

    public function dailyReportSetting()
    {
        return $this->belongsTo(DailyReportSettings::class, 'client_id', 'client_id')
            ->select('client_id', 'minMaxSetting', 'decimalSetting');
    }

    public function unit()
    {
        return $this->belongsTo(DataUnit::class, 'unit_id', 'unit_id');
    }
    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id', 'id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id', 'client_id');
    }

    public function workshop() {
        return $this->belongsTo(Workshop::class, 'workshop_id', 'workshop_id');
    }
}
