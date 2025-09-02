<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Workshop extends Model
{
    protected $fillable = ['name'];
    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'workshop_id';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->workshop_id)) {
                // Ambil last workshop_id
                $lastId = Workshop::orderBy('workshop_id', 'desc')->first()?->workshop_id;
                $number = $lastId ? (int) substr($lastId, 3) + 1 : 1;
                $model->workshop_id = 'WSP' . str_pad($number, 3, '0', STR_PAD_LEFT);
            }
        });
    }
    public function units()
    {
        return $this->belongsToMany(DataUnit::class, 'workshop_units', 'workshop_id', 'unit_id');
    }
}

