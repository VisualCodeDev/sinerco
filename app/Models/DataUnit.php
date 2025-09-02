<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataUnit extends Model
{
    protected $primaryKey = 'unitId';
    public $incrementing = false;
    protected $keyType = 'string';
    public $fillable = [
        'status',
    ];
    protected $appends = ['client', 'location'];

    public function unitAreaLocations()
    {
        return $this->hasOne(UnitAreaLocation::class, 'unitId', 'unitId');
    }
    public function getClientAttribute()
    {
        return $this->unitAreaLocation?->client;
    }
    public function getLocationAttribute()
    {
        return $this->unitAreaLocation?->location;
    }
}
