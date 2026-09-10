<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Riwayat pergerakan unit -- 1 baris per perubahan client/region/location unit.
// Area sengaja tidak disimpan sendiri di sini karena tidak disimpan langsung di
// unit_positions juga (selalu diturunkan dari location->area), jadi cukup ikut
// relasi toLocation/fromLocation->area saat ditampilkan.
class UnitMovementLog extends Model
{
    protected $fillable = [
        'unit_id',
        'action',
        'from_client_id',
        'to_client_id',
        'from_region_id',
        'to_region_id',
        'from_location_id',
        'to_location_id',
        'changed_by',
        'note',
    ];

    public function unit()
    {
        return $this->belongsTo(DataUnit::class, 'unit_id', 'unit_id');
    }

    public function fromClient()
    {
        return $this->belongsTo(Client::class, 'from_client_id', 'client_id');
    }

    public function toClient()
    {
        return $this->belongsTo(Client::class, 'to_client_id', 'client_id');
    }

    public function fromRegion()
    {
        return $this->belongsTo(Region::class, 'from_region_id', 'id');
    }

    public function toRegion()
    {
        return $this->belongsTo(Region::class, 'to_region_id', 'id');
    }

    public function fromLocation()
    {
        return $this->belongsTo(Location::class, 'from_location_id', 'id');
    }

    public function toLocation()
    {
        return $this->belongsTo(Location::class, 'to_location_id', 'id');
    }

    public function changedByUser()
    {
        return $this->belongsTo(User::class, 'changed_by', 'user_id');
    }
}
