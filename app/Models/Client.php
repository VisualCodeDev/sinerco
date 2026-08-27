<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use SoftDeletes;

    public $incrementing = false; // karena primary key string
    protected $keyType = 'string';
    protected $primaryKey = 'client_id';

    protected static function boot()
    {

        parent::boot();

        static::creating(function ($model) {
            if (empty($model->client_id)) {
                // withTrashed() is required here: client_id is soft-deleted,
                // not actually freed, so a plain query would happily hand out
                // an id that's still occupying a (trashed) row and collide.
                $lastNumber = Client::withTrashed()
                    ->selectRaw("MAX(CAST(SUBSTRING(client_id, 4) AS UNSIGNED)) as max_num")
                    ->value('max_num');
                $number = $lastNumber ? $lastNumber + 1 : 1;
                $model->client_id = 'CLI' . str_pad($number, 3, '0', STR_PAD_LEFT);
            }
        });
    }

    public function locations()
    {
        return $this->belongsToMany(Location::class, 'unit_positions', 'client_id', 'location_id');
    }

    public function unitPositions()
    {
        return $this->hasMany(UnitPosition::class, 'client_id');
    }

    public function units()
    {
        return $this->belongsToMany(DataUnit::class, 'unit_positions', 'client_id', 'unit_id');
    }
    protected static function booted()
    {
        static::saving(function ($model) {
            if (!$model->is_invoice) {
                $model->is_clu = false;
            }
        });
    }
    protected $casts = [
        'is_invoice' => 'boolean',
        'is_clu' => 'boolean',
    ];
    protected $fillable = [
        'client_id',
        'name',
        'input_interval',
        'input_duration',
        'gmt_offset',
        'auto_send_interval',
        'is_invoice',
        'is_clu',
        'disable_duration',
        'template_ba',
        'template_inv',
    ];
}
