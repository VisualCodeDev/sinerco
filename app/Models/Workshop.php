<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Workshop extends Model
{
    protected $fillable = ['name'];

    public function units()
    {
        return $this->belongsToMany(DataUnit::class, 'workshop_units', 'workshop_id', 'unit_id');
    }
}

