<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportSubField extends Model
{
    protected $fillable = ['main_field_id', 'subfield_name', 'subfield_value'];

    protected static function booted()
    {
        static::created(function ($subfield) {
            $mainField = ReportInputField::find($subfield->main_field_id);
            if ($mainField && !$mainField->has_subfields) {
                $mainField->has_subfields = true;
                $mainField->save();
            }
        });
    }
    public function mainField()
    {
        return $this->belongsTo(ReportInputField::class, 'main_field_id');
    }
}
