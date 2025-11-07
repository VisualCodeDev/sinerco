<?php

use App\Http\Controllers\WhatsAppController;
use App\Http\Middleware\CheckUnitAccess;
use App\Http\Middleware\RoleMiddleware;
use App\Models\Client;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        channels: __DIR__ . '/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'roles' => RoleMiddleware::class,
            'unit.access' => CheckUnitAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->withSchedule(function (Schedule $schedule) {
        // Ambil semua client
        $clients = Client::all();

        foreach ($clients as $client) {
            $interval = $client->auto_send_interval ?? '1h'; // default 1 jam
    
            $callback = fn() => app(WhatsAppController::class)->sendAutoMessage($client->client_id);

            // Tentukan jadwal dinamis
            match ($interval) {
                '1h' => $schedule->call($callback)->hourly(),
                '4h' => $schedule->call($callback)->everyFourHours(),
                '6h' => $schedule->call($callback)->everySixHours(),
                '12h' => $schedule->call($callback)->cron('0 */12 * * *'),
                '1d' => $schedule->call($callback)->daily(),
                default => $schedule->call($callback)->hourly(), // fallback
            };
        }
    })
    ->create();
