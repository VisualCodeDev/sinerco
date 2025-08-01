<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataUnit extends Model
{
    protected $primaryKey = 'unitId';
    public $incrementing = false;
    protected $keyType = 'string';
    public $fillable = [
        'status',
    ];

    public function inputFields()
    {
        return $this->belongsToMany(
            ReportInputField::class,
            'data_unit_field', 
            'unit_id',
            'field_id'
        );
    }
}
