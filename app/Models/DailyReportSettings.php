<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

// Model untuk pengaturan laporan harian per klien
class DailyReportSettings extends Model
{
    // Kolom yang boleh diisi mass assignment
    protected $fillable = [
        'client_id',
        'decimalSetting',
        'minMaxSetting',
        'unitSetting',
        'thresholdSetting'
    ];

    // Kolom JSON di-cast otomatis jadi array
    protected $casts = [
        'decimalSetting' => 'array',
        'minMaxSetting' => 'array',
        'unitSetting' => 'array',
        'thresholdSetting' => 'array'
    ];

     // Relasi ke banyak UnitPosition milik klien yang sama
     public function unitPositions()
    {
        return $this->hasMany(UnitPosition::class, 'client_id', 'client_id');
    }
}
