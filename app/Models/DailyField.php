<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyField extends Model
{
     protected $fillable = [
        'name',
        'slug',
    ];

    public function subfields() {
        return $this->hasMany(Subfield::class, 'field_id');
    }
}
