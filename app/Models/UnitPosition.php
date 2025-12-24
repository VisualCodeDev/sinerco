<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnitPosition extends Model
{
    protected $fillable = [
        'unit_id',
        'client_id',
        'location_id',
        'position_type',
        'workshop_id',
    ];

    public function dailyReportSetting()
    {
        return $this->belongsTo(DailyReportSettings::class, 'client_id', 'client_id')
            ->select('client_id', 'minMaxSetting', 'decimalSetting', 'unitSetting');
    }

    public function requests()
    {
        return $this->hasMany(StatusRequest::class, 'unit_position_id', 'id');
    }

    public function reports()
    {
        return $this->hasMany(DailyReport::class, 'unit_position_id', 'id');
    }

    public function unit()
    {
        return $this->belongsTo(DataUnit::class, 'unit_id', 'unit_id');
    }
    public function baSettings()
    {
        return $this->hasOne(BeritaAcara::class, 'unit_position_id', 'id');
    }

    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id', 'id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id', 'client_id');
    }

    public function workers()
    {
        return $this->hasMany(UserSetting::class, 'unit_position_id', 'id');

    }
    public function workshop()
    {
        return $this->belongsTo(Workshop::class, 'workshop_id', 'workshop_id');
    }

}
