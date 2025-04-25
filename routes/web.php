<?php

use App\Http\Controllers\AdminNotificationController;
use App\Http\Controllers\DailyReportController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StatusRequestController;
use App\Models\AdminNotification;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// });

Route::controller(DailyReportController::class)->group(function() {
    Route::post('/daily/add', 'setReport');
    Route::get('/dashboard', 'getReport')->name('dashboard');
});

Route::controller(StatusRequestController::class)->group(function() {
    Route::get('/request', 'index')->name('req');
    Route::post('/request/post', 'setRequest');
    Route::post('/request/update', 'updateRequest');
    Route::get('/', 'getRequest');
});

Route::controller(AdminNotificationController::class)->group(function() {
    Route::get('/api/notifications', 'getNotifications');
});

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

require __DIR__.'/auth.php';
