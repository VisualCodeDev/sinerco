<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Middleware alias 'roles' (didaftarkan di bootstrap/app.php) -- pembatasan
// akses per-ROLE di level ROUTE (bukan per-unit, lihat CheckUnitAccess buat
// itu). Dipakai di routes/web.php contohnya `->middleware('roles:super_admin')`.
// Kalau role user tidak cocok, redirect ke daily.list (BUKAN 403 error).
class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!$request->user() || !in_array($request->user()->roleData->name, $roles)) {
            return redirect()->route('daily.list');
        }

        return $next($request);
    }
}
