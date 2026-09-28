<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Tingkat ke-2 dari hierarki Region -> Area -> Location. Unit_position TIDAK
// nyimpen area_id langsung -- area selalu diturunkan lewat location->area.
class Area extends Model
{
    // kolom yang boleh diisi mass-assignment
    protected $fillable = [
        'area',
        'region_id',
    ];

    // relasi ke banyak Location dalam area ini
    public function locations()
    {
        return $this->hasMany(Location::class);
    }

    // relasi ke Region tempat area ini berada
    public function region()
    {
        return $this->belongsTo(Region::class);
    }
}
