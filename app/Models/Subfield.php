<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subfield extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'field_id'
    ];

    public function field()
    {
        return $this->belongsTo(DailyField::class, 'field_id', 'id');
    }
}
