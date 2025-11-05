<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnitField extends Model
{
    public function fields()
    {
        return $this->belongsTo(DailyField::class, 'field_id', 'id');
    }
}
