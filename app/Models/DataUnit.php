<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataUnit extends Model
{
    public $incrementing = false; // karena primary key string
    protected $keyType = 'string';
    protected $primaryKey = 'unit_id';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->unit_id)) {
                // Ambil last unit_id
                $lastId = DataUnit::orderBy('unit_id', 'desc')->first()?->unit_id;
                $number = $lastId ? (int) substr($lastId, 3) + 1 : 1;
                $model->unit_id = 'UNT' . str_pad($number, 3, '0', STR_PAD_LEFT);
            }
        });
    }

    protected $fillable = [
        'unit_id',
        'unit',
        'status',
    ];
    protected $appends = ['client', 'location'];

    public function unitPositions()
    {
        return $this->hasOne(UnitPosition::class, 'unit_id', 'unit_id');
    }
    public function getClientAttribute()
    {
        return $this->unitPositions?->client;
    }
    public function getLocationAttribute()
    {
        return $this->unitPositions?->location;
    }

    public function workshopUnits()
    {
        return $this->belongsToMany(Workshop::class, 'workshop_units', 'unit_id', 'workshop_id')
            ->withTimestamps();
    }

}
