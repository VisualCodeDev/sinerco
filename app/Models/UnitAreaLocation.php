<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnitAreaLocation extends Model
{
    public function unit()
    {
        return $this->belongsTo(DataUnit::class, 'unitId', 'unitId');
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'clientId', 'clientId');
    }
}
