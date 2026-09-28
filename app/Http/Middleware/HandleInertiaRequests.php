<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

// Setup dasar Inertia.js (bawaan starter kit, belum banyak dikustom -- share()
// props global-nya masih di-comment-out). Auth user & Ziggy route helper
// sekarang di-load per-halaman lewat useAuth() (resources/js/Components/Auth/
// auth.jsx) & bootstrap.js, bukan lewat shared props middleware ini.
class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            // 'auth' => [
            //     'user' => $user ? [
            //         'id' => $user->id,
            //         'name' => $user->name,
            //         'email' => $user->email, // opsional
            //         'role' => $user->roleData?->name,
            //     ] : null,
            // ],
            // 'ziggy' => fn() => [
            //     ...(new Ziggy)->toArray(),
            //     'location' => $request->url(),
            // ],
        ];
    }
}
