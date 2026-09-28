<?php

namespace App\Http\Controllers;

use App\Models\UnitField;
use Illuminate\Http\Request;

// Resource controller standar (stub bawaan `php artisan make:controller
// --resource`) buat model UnitField -- endpoint yang BENERAN dipakai buat urus
// pivot unit_fields (getUnitFields, dsb) ada di DataUnitController.
class UnitFieldController extends Controller
{
    // Menampilkan daftar field unit (belum diimplementasikan)
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(UnitField $unitField)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UnitField $unitField)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UnitField $unitField)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UnitField $unitField)
    {
        //
    }
}
