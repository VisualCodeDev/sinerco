<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSetting extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function unitArea()
    {
        return $this->belongsTo(UnitPosition::class, 'unit_position_id', 'id');
    }
    protected $fillable = [
        'user_id',
        'unit_position_id',
    ];
}
