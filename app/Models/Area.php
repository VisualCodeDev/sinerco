<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    protected $fillable = [
        'area',
        'region_id',
    ];

    public function locations()
    {
        return $this->hasMany(Location::class);
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }
}
