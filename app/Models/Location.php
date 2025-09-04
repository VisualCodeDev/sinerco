<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id', 'id');
    }

    public function unitPositions()
    {
        return $this->hasMany(UnitPosition::class, 'location_id', 'id');
    }
}
