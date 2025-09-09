<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    public $incrementing = false; // karena primary key string
    protected $keyType = 'string';
    protected $primaryKey = 'client_id';

    protected static function boot()
    {

        parent::boot();

        static::creating(function ($model) {
            if (empty($model->client_id)) {
                // Ambil last client_id
                $lastId = Client::orderBy('client_id', 'desc')->first()?->client_id;
                $number = $lastId ? (int) substr($lastId, 3) + 1 : 1;
                $model->client_id = 'CLI' . str_pad($number, 3, '0', STR_PAD_LEFT);
            }
        });
    }

    public function units() {
        return $this->belongsToMany(DataUnit::class, 'unit_positions', 'client_id', 'unit_id');
    }
    protected $fillable = [
        'client_id',
        'name',
        'input_interval',
        'input_duration',
        'disable_duration'
    ];
}
