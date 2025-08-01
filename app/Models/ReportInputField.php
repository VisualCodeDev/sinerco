<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportInputField extends Model
{
    public function dataUnits()
    {
        return $this->belongsToMany(DataUnit::class, 'data_unit_field');
    }

    public function subFields()
    {
        return $this->hasMany(ReportSubField::class, 'main_field_id');
    }
}
