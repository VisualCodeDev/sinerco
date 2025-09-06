<?php

namespace App\Http\Middleware;

use App\Models\UserSetting;
use Auth;
use Closure;
use Illuminate\Http\Request;
use Log;
use Symfony\Component\HttpFoundation\Response;

class CheckUnitAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        $unitPositionId = $request->route('unit_position_id'); // ambil parameter dari route
        // Cek apakah user memiliki akses ke unit_position_id ini
        $hasAccess = UserSetting::where('user_id', $user->user_id)
            ->where('unit_position_id', $unitPositionId)
            ->exists();

        if (!$hasAccess && $user->roleData->name !== 'super_admin') {
            // Kalau tidak punya akses
            return response()->json(['error' => 'Unauthorized access to this unit'], 403);
            // Atau bisa redirect:
            // return redirect()->route('dashboard')->with('error', 'You do not have permission to access this unit.');
        }

        return $next($request);
    }
}
