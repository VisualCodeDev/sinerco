<?php

namespace App\Providers;

use Auth;
use Cookie;
use Event;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Event::listen(Login::class, function (Login $event) {
            if (request()->boolean('remember')) {
                $cookieName = Auth::getRecallerName();

                Cookie::queue(
                    Cookie::make(
                        $cookieName,
                        $event->user->getRememberToken(),
                        60 * 24 * 7
                    )
                );
            }
        });
    }
}
