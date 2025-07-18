<?php

use App\Http\Controllers\AdminNotificationController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DailyReportController;
use App\Http\Controllers\DailyReportSettingsController;
use App\Http\Controllers\DataUnitController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StatusRequestController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\UserAllocationController;
use App\Http\Controllers\UserPermissionController;
use App\Http\Controllers\UserUnitController;
use App\Models\AdminNotification;
use App\Models\DailyReportSettings;
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
    return Inertia::render('Home');
})->name('dashboard');

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::controller(DailyReportController::class)->group(function () {
    Route::get('/unit-list', 'dailyList')->name('daily.list')->middleware('auth');
    Route::post('/unit/daily/{unitAreaLocationId}/add', 'setReport')->name('daily.add')->middleware('auth');
    // Route::get('/daily', 'index')->name('daily')->middleware('auth');
    Route::get('/unit/daily/{unitAreaLocationId}', 'index')->name('daily')->middleware('auth');
    Route::get('/api/daily-data', 'getReport')->name('getDataReport');
});

Route::middleware('auth:sanctum')->get('/api/my-auth', function () {
    return Auth::user();
})->name('auth.user');

Route::controller(DailyReportSettingsController::class)->group(function () {
    Route::post('/client/{clientId}/report-setting', 'setSetting')->name('daily.setting')->middleware('auth');
});

Route::controller(StatusRequestController::class)->group(function () {
    Route::get('/request', 'getRequest')->name('request')->middleware('auth');
    Route::post('/request/post', 'setRequest')->name('request.post')->middleware('auth');
    Route::post('/request/update', 'updateRequest')->name('request.update')->middleware('auth');
});

Route::controller(DataUnitController::class)->group(function () {
    Route::get('/api/get-unit-area-location', 'getUnitAreaLocation')->name('getUnitAreaLocation');
});

Route::controller(ClientController::class)->group(function () {
    Route::get('/client-list', 'index')->name('client.list');
    Route::get('/client/{clientId}', 'clientDetail')->name('client.detail');
});

Route::controller(UserAllocationController::class)->group(function () {
    Route::get('/setting/user-alocation', 'index')->name('allocation.setting')->middleware('auth');
    Route::get('/user-allocation/{userId}', 'allocationSettings')->name('allocation')->middleware('auth');
    Route::post('/user-allocation/{userId}/add', 'allocationSettingsAdd')->name('allocation.add')->middleware('auth');
    Route::post('/user-allocation/{userId}/remove', 'allocationSettingsRemove')->name('allocation.remove')->middleware('auth');
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
