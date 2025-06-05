<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
   public function handle(Request $request, Closure $next, string $roles)
{
    if (!$request->user() || !in_array($request->user()->role, explode(',', $roles))) {
        abort(403, 'Unauthorized.');
    }

    return $next($request);
}
}
