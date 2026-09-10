<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnitPosition extends Model
{
    // kolom yang boleh diisi mass-assignment
    protected $fillable = [
        'unit_id',
        'client_id',
        'location_id',
        'position_type',
        'workshop_id',
        'region_id',
    ];

    // relasi ke setting daily report milik client
    public function dailyReportSetting()
    {
        return $this->belongsTo(DailyReportSettings::class, 'client_id', 'client_id')
            ->select('client_id', 'minMaxSetting', 'decimalSetting', 'unitSetting');
    }

    // relasi ke semua StatusRequest untuk posisi unit ini
    public function requests()
    {
        return $this->hasMany(StatusRequest::class, 'unit_position_id', 'id');
    }

    // relasi ke semua DailyReport untuk posisi unit ini
    public function reports()
    {
        return $this->hasMany(DailyReport::class, 'unit_position_id', 'id');
    }

    // relasi ke DailyReport paling terbaru (berdasarkan date & time)
    public function latestReport()
    {
        return $this->hasOne(DailyReport::class, 'unit_position_id', 'id')
            ->latestOfMany(['date', 'time']);
    }

    // relasi ke DataUnit terkait posisi ini
    public function unit()
    {
        return $this->belongsTo(DataUnit::class, 'unit_id', 'unit_id');
    }
    public function units()
    {
        return $this->hasMany(DataUnit::class, 'unit_id', 'unit_id');
    }

    // relasi ke setting berita acara posisi unit ini
    public function baSettings()
    {
        return $this->hasOne(BeritaAcara::class, 'unit_position_id', 'id');
    }

    // relasi ke Location tempat unit ini ditempatkan
    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id', 'id');
    }

    // relasi ke Client pemilik posisi unit ini
    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id', 'client_id');
    }

    // relasi ke Region posisi unit ini
    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    // relasi ke user/pekerja yang ditugaskan pada posisi ini
    public function workers()
    {
        return $this->hasMany(UserSetting::class, 'unit_position_id', 'id');

    }
    // relasi ke Workshop terkait posisi unit ini
    public function workshop()
    {
        return $this->belongsTo(Workshop::class, 'workshop_id', 'workshop_id');
    }

    // relasi ke kontrak untuk posisi unit ini (1 unit_position = 1 kontrak)
    public function contract()
    {
        return $this->hasOne(Contract::class, 'unit_position_id', 'id');
    }

}
