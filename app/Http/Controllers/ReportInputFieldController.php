<?php

namespace App\Http\Controllers;

use App\Models\DataUnit;
use App\Models\ReportInputField;
use App\Models\ReportSubField;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Str;

class ReportInputFieldController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getAllInputFields()
    {
        $inputFields = ReportInputField::with('subFields')->get();

        return response()->json($inputFields);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function setSubfield(Request $request)
    {
        $val = $request->validate([
            'fieldId' => 'required',
            'subfield_name' => 'string|required',
        ]);

        $subfield = new ReportSubField();
        $subfield->main_field_id = $val['fieldId'];
        $subfield->subfield_name = $val['subfield_name'];
        $subfield->subfield_value = Str::slug($val['subfield_name'], '_');
        $subfield->save();

        return response()->json(['text' => 'Subfield added', 'type' => 'success', 'newSubfield' => $subfield], 200);
    }

    public function setField(Request $request)
    {
        $val = $request->validate([
            'field_name' => 'string|required',
            'unitId' => 'array|required'
        ]);
        $field = ReportInputField::where('field_name', $val['field_name'])->first();
        if (!$field) {
            $field = new ReportInputField();
            $field->field_name = $val['field_name'];
            $field->field_value = Str::slug($val['field_name'], '_');
            $field->save();
        }

        $field->dataUnits()->attach($val['unitId']);

        return response()->json(['text' => 'Field added', 'type' => 'success', 'newField' => $field], 200);
    }


    public function updateField(Request $request)
    {
        $val = $request->validate([
            'fieldId' => 'required',
            'field_name' => 'string|required',
            'subfields' => 'array|sometimes',
        ]);
        $field = ReportInputField::find($val['fieldId']);
        $field->field_name = $val['field_name'];
        $field->field_value = Str::slug($val['field_name'], '_');
        $field->save();

        $subfields = $request->input('subfields', []);
        $field->subfields()->delete();
        foreach ($subfields as $subfield) {
            $field->subfields()->create($subfield);
        }
        return response()->json(['text' => 'Field updated', 'type' => 'success', 'newField' => $field], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function getUnitField($unitId)
    {
        $unit = DataUnit::with('inputFields.subfields')->find($unitId);
        return response()->json($unit);
    }

    /**
     * Display the specified resource.
     */
    public function deleteField(Request $request)
    {
        $unitId = $request->input('unitId');
        $fieldId = $request->input('fieldId');

        $unit = DataUnit::find($unitId);

        if (!$unit) {
            return response()->json(['text' => 'Unit not found', 'type' => 'error'], 404);
        }

        // Cek apakah field ada di unit ini
        if (!$unit->inputFields()->where('field_id', $fieldId)->exists()) {
            return response()->json(['text' => 'Field not found in this unit', 'type' => 'error'], 404);
        }

        $unit->inputFields()->detach($fieldId);

        return response()->json(['text' => 'Field detached successfully', 'type' => 'success'], 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ReportInputField $reportInputField)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ReportInputField $reportInputField)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ReportInputField $reportInputField)
    {
        //
    }
}
