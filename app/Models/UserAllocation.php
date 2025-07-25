<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAllocation extends Model
{
    public function user()
    {
        return $this->belongsTo(DataUnit::class, 'userId', 'userId');
    }

    public function unitArea()
    {
        return $this->belongsTo(UnitAreaLocation::class, 'unitAreaLocationId', 'unitAreaLocationId');
    }
    protected $fillable = [
        'userId',
        'unitAreaLocationId',
    ];
}
