<?php

use App\Http\Controllers\AdminNotificationController;
use App\Http\Controllers\DailyReportController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StatusRequestController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
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

// Route::get('/', [AuthenticatedSessionController::class, 'create'])
//     ->middleware('guest')
//     ->name('login');

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('dashboard');

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::controller(DailyReportController::class)->group(function () {
    Route::post('/daily/add', 'setReport')->name('daily.add')->middleware('auth');
    Route::get('/daily', 'getReport')->name('daily')->middleware('auth');
});

Route::controller(StatusRequestController::class)->group(function () {
    Route::get('/request', 'getRequest')->name('request')->middleware('auth');
    Route::post('/request/post', 'setRequest')->name('request.post')->middleware('auth');
    Route::post('/request/update', 'updateRequest')->name('request.update')->middleware('auth');
});

// Route::get('/dashboard', function () {
//     return Inertia::render('Welcome');
// });

Route::controller(AdminNotificationController::class)->group(function () {
    Route::get('/api/notifications', 'getNotifications');
});

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

require __DIR__ . '/auth.php';
