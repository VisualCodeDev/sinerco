<?php

use App\Http\Controllers\AdminNotificationController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DailyReportController;
use App\Http\Controllers\DailyReportSettingsController;
use App\Http\Controllers\DataUnitController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StatusRequestController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\UserPermissionController;
use App\Http\Controllers\UserSettingController;
use App\Http\Controllers\UserUnitController;
use App\Http\Controllers\WorkshopController;
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
})->name('dashboard')->middleware('auth', 'roles:super_admin,technician');

Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('guest');

Route::get('/fetch/auth', [AuthenticatedSessionController::class, 'getCurrent'])->name('auth.get')
    ->middleware('auth');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::controller(DailyReportController::class)->group(function () {
    Route::post('/unit/daily/{unit_position_id}/add', 'setReport')->name('daily.add')->middleware('auth');
    Route::post('/unit/daily/update', 'editReport')->name('daily.edit')->middleware('auth');
    // Route::get('/daily', 'index')->name('daily')->middleware('auth');
    Route::get('/unit/daily/{unit_position_id}', 'index')->name('daily')->middleware(['auth', 'unit.access']);

    Route::get('/fetch/unit/daily', 'getDataReportBasedOnDate')->name('getDataReportBasedOnDate')->middleware('auth');
    Route::get('/api/daily-data', 'getReport')->name('getDataReport');
});

Route::middleware('auth:sanctum')->get('/api/my-auth', function () {
    return Auth::user();
})->name('auth.user');

Route::controller(DailyReportSettingsController::class)->middleware(['auth', 'roles:super_admin'])->group(function () {
    Route::get('/input-validation', 'index')->name('input.setting');
    Route::get('/fetch/unit/configuration/{client_id}', 'getUnitSetting')->name('unit.setting.get');

    Route::post('/client/report-setting', 'setSetting')->name('daily.setting');
});

Route::controller(StatusRequestController::class)->group(function () {
    Route::get('/get-request', 'getFiveRequestedUnit')->name('getRequestUnitStatus')->middleware('auth');
    Route::get('/request', 'getRequest')->name('request')->middleware('auth');

    Route::post('/request/post', 'setRequest')->name('request.post')->middleware('auth');
    Route::post('/request/update', 'updateRequest')->name('request.update')->middleware('auth');
    Route::get('/request/seen/{id}', 'seenRequest')->name('request.seen')->middleware('auth');

    Route::post('/request/move-to-history', 'moveToHistory')
        ->name('request.moveToHistory')
        ->middleware('auth');
});

Route::controller(DataUnitController::class)->middleware('auth')->group(function () {
    Route::get('/unit/setting', 'unitSetting')->name('unit.interval.setting');
    Route::get('/unit/location', 'unitLocation')->name('unit.position');
    Route::get('/unit/location/setting', 'unitLocationSetting')->name('unit.position.setting');
    Route::get('/unit/list', 'unitList')->name('daily.list');
    Route::get('/fetch/get-all-unit', 'getAllUnit')->name('unit.get');
    Route::get('/api/get-unit-data', 'getUnit')->name('getUnitAreaLocation');
    Route::get('/api/get-selected-unit-data', 'getSelectedUnit')->name('getSelectedUnit');
    Route::get('/api/get-unit-status', 'getUnitStatus')->name('getUnitStatus');

    Route::post('/unit/setting/set', 'setInterval')->name('unit.interval.set');
    Route::post('/unit/location/add', 'addUnitLocation')->name('unit.position.add');

    Route::get('/unit/list/add', 'create')->name('unit.add.page')->middleware('roles:super_admin');
    Route::post('/unit/list/add', 'addNewUnit')->name('unit.add')->middleware('roles:super_admin');
});

Route::get('/get/server-time', function () {
    return response()->json(['server_time' => now()->toDateTimeString()]);
})->name('server.time');

Route::controller(ClientController::class)->middleware(['auth', 'roles:super_admin'])->group(function () {
    Route::get('/fetch/get-filtered-area-location', 'getFilteredAreaLocation')->name('area.filter.get');
    Route::get('/fetch/get-filtered-unit', 'clientDetail')->name('unit.filter.get');
    Route::get('/fetch/client', 'getAllClient')->name('client.get');
    Route::get('/fetch/client/units', 'getAllClientAndUnits')->name('client.unit.get');
    Route::get('/fetch/selected-client', 'getSelectedClient')->name('client.selected.get');

    Route::get('/client/list', 'index')->name('client.list');
    Route::get('/client/{client_id}', 'clientDetail')->name('client.detail');

    Route::post('/client/settings', 'setSettings')->name('client.settings');
    Route::post('/client/settings/duration', 'updateDurationDisable')->name('duration.update.disable');
});

Route::controller(UserSettingController::class)
    ->middleware(['auth', 'roles:super_admin'])
    ->group(function () {
        Route::get('/fetch/permitted/{user_id}', 'getPermittedUnitData')->name('permittedUnitData.get');
        Route::get('/fetch/users', 'getAllUsers')->name('user.get');
        Route::get('/users/setting/add-user', 'newUserIndex')->name('user.new');
        Route::post('/users//setting/add-user/new', 'addNewUser')->name('user.add');
        Route::get('/users', 'index')->name('allocation.setting');
        Route::get('/users/setting/{user_id}/', 'allocationSettings')->name('allocation');
        Route::post('/users/setting/{user_id}/information/edit', 'editUser')->name('user.edit');
        Route::post('/users/setting/{user_id}/allocation/add', 'allocationSettingsAdd')->name('allocation.add');
        Route::post('/users/setting/{user_id}/allocationremove', 'allocationSettingsRemove')->name('allocation.remove');

        Route::post('/users/bulk-delete', 'delete')->name('user.bulkDelete');
        Route::post('/users/bulk-reset', 'reset')->name('user.bulk.reset');
        Route::post('/users/bulk-edit', 'bulkAllocation')->name('user.bulk.allocation');
    });


Route::controller(AdminNotificationController::class)->group(function () {
    Route::get('/api/notifications', 'getNotifications');
});

Route::controller(ProfileController::class)->middleware(['auth', "roles:super_admin,technician"])->group(function () {
    Route::get('/profile/{user_id}/', 'index')->name('profile');
    Route::get('/fetch/roles', 'getAllRoles')->name('roles.get');
});

Route::controller(LocationController::class)->middleware('auth')->group(function () {
    Route::get('/area', 'index')->name('areas');
});

Route::controller(WorkshopController::class)->group(function () {
    Route::get('/workshop/list', 'index')->name('workshops');
    Route::get('/fetch/workshop', 'getAllWorkshops')->name('workshop.get');
});
require __DIR__ . '/auth.php';
