<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    public function area()
    {
        return $this->belongsTo(Area::class, 'areaId', 'id');
    }
}
