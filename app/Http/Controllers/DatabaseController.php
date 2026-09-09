<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class DatabaseController extends Controller
{
    // Halaman "Database": tab berisi tabel-tabel data inti (Client, Area, Input Setting, Field, Role, Unit)
    // yang bisa diedit inline, gaya yang sama dengan tabel List of Unit.
    public function index()
    {
        return Inertia::render('Database/Database');
    }
}
