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

        return response()->json(['text' => 'Subfield added', 'type' => 'success'], 200);
    }

    public function setField(Request $request)
    {
        $val = $request->validate([
            'field_name' => 'string|required',
            'unitId' => 'array|required'
        ]);

        $field = new ReportInputField();
        $field->field_name = $val['field_name'];
        $field->field_value = Str::slug($val['field_name'], '_');
        $field->save(); 

        $field->dataUnits()->attach($val['unitId']);

        return response()->json(['text' => 'Field added', 'type' => 'success'], 200);
    }


    public function updateField(Request $request)
    {
        $val = $request->validate([
            'fieldId' => 'required',
            'field_name' => 'string|required'
        ]);
        $field = ReportInputField::find($val['fieldId']);
        $field->field_name = $val['field_name'];
        $field->field_value = Str::slug($val['field_name'], '_');
        $field->save();

        return response()->json(['text' => 'Field updated', 'type' => 'success'], 200);
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
    public function show(ReportInputField $reportInputField)
    {
        //
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
