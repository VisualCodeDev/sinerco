<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Model untuk data workshop
class Workshop extends Model
{
    public $incrementing = false; // primary key bukan angka auto increment
    protected $keyType = 'string'; // tipe primary key berupa string
    protected $primaryKey = 'workshop_id';

    // Kolom yang boleh diisi mass assignment
    protected $fillable = [
        'name',
        'workshop_id',
    ];

    // Auto generate workshop_id saat data baru dibuat
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->workshop_id)) {
                // Ambil last workshop_id
                $lastId = Workshop::orderBy('workshop_id', 'desc')->first()?->workshop_id;
                $number = $lastId ? (int) substr($lastId, 3) + 1 : 1;
                // Format id jadi WSP001, WSP002, dst
                $model->workshop_id = 'WSP' . str_pad($number, 3, '0', STR_PAD_LEFT);
            }
        });
    }
    // Relasi many-to-many ke DataUnit lewat tabel unit_positions
    public function units()
    {
        return $this->belongsToMany(DataUnit::class, 'unit_positions', 'workshop_id', 'unit_id');
    }
}

