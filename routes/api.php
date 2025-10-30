<?php

use App\Http\Controllers\DailyReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// routes/api.php
Route::get('/api/daily-report', [DailyReportController::class, 'getDailyReport']);
