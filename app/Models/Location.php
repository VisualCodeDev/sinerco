<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Tingkat ke-3 (paling detail) dari hierarki Region -> Area -> Location. Cuma
// unit yang ditempatkan di CLIENT yang punya location_id -- workshop tidak.
class Location extends Model
{
    // kolom yang boleh diisi mass-assignment
    protected $fillable = [
        'area',
        'area_id',
        'location',
    ];

    // relasi ke Area tempat lokasi ini berada
    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id', 'id');
    }

    // relasi ke banyak UnitPosition di lokasi ini
    public function unitPositions()
    {
        return $this->hasMany(UnitPosition::class, 'location_id', 'id');
    }

    // relasi many-to-many ke DataUnit lewat tabel unit_positions
    public function units()
    {
        return $this->belongsToMany(DataUnit::class, 'unit_positions', 'location_id', 'unit_id');
    }
}
