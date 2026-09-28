<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

// Cuma render halaman "Database" (tab Clients/Areas/Workshops/Fields/dll di
// resources/js/Pages/Database/*.jsx) -- data & CRUD-nya masing-masing ditangani
// controller lain (ClientController, LocationController, WorkshopController,
// DailyFieldController, DataUnitController).
class DatabaseController extends Controller
{
    // Halaman "Database": tab berisi tabel-tabel data inti (Client, Area, Input Setting, Field, Role, Unit)
    // yang bisa diedit inline, gaya yang sama dengan tabel List of Unit.
    public function index()
    {
        return Inertia::render('Database/Database');
    }
}
