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
            if (empty($model->thresholdSetting)) {
                $model->thresholdSetting = [
                    "source_press" => ["value" => 100, "type" => 'percentage'],
                    "suction_press" => ["value" => 100, "type" => 'percentage'],
                    "discharge_press" => ["value" => 100, "type" => 'percentage'],
                    "speed" => ["value" => 100, "type" => 'percentage'],
                    "manifold_press" => ["value" => 100, "type" => 'percentage'],
                    "oil_press" => ["value" => 100, "type" => 'percentage'],
                    "oil_diff" => ["value" => 100, "type" => 'percentage'],
                    "running_hours" => ["value" => 100, "type" => 'percentage'],
                    "voltage" => ["value" => 100, "type" => 'percentage'],
                    "water_temp" => ["value" => 100, "type" => 'percentage'],
                    "static_press" => ["value" => 100, "type" => 'percentage'],
                    "diff_press" => ["value" => 100, "type" => 'percentage'],
                    "flowrate" => ["value" => 100, "type" => 'percentage'],
                    "aft_cooler" => ["value" => 100, "type" => 'percentage'],
                    "bef_cooler" => ["value" => 100, "type" => 'percentage'],
                ];
            }

            // default visibility
            if (empty($model->visibilitySetting)) {
                $model->visibilitySetting = [
                    "source_press" => true,
                    "suction_press" => true,
                    "discharge_press" => true,
                    "speed" => true,
                    "manifold_press" => true,
                    "oil_press" => true,
                    "oil_diff" => true,
                    "running_hours" => true,
                    "voltage" => true,
                    "water_temp" => true,
                    "static_press" => true,
                    "diff_press" => true,
                    "flowrate" => true,
                    "aft_cooler" => true,
                    "bef_cooler" => true,
                ];
            }
        });
    }

    protected $fillable = [
        'unit_id',
        'unit',
        'status',
        'thresholdSetting',
        'visibilitySetting'
    ];

    protected $casts = [
        'thresholdSetting' => 'array',
        'visibilitySetting' => 'array'
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
