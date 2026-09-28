# routes/

Semua route web (halaman Inertia + endpoint API/AJAX) proyek ini ada di
`web.php` -- tidak dipisah per-modul, jadi filenya panjang. Polanya:

```php
Route::controller(DataUnitController::class)->middleware('auth')->group(function () {
    Route::get('/some/path', 'methodName')->name('some.route.name');
    // route lain buat controller yang sama...
});
```

Setiap grup `Route::controller(...)` mengelompokkan route berdasarkan
controller-nya. Middleware yang sering dipakai:

- `auth` -- wajib login (hampir semua route pakai ini).
- `roles:super_admin,technician,...` -- middleware alias, lihat `RoleMiddleware`
  (`app/Http/Middleware/RoleMiddleware.php`). Redirect ke `daily.list` kalau
  role user tidak cocok (bukan 403).
- `unit.access` -- middleware alias, lihat `CheckUnitAccess`
  (`app/Http/Middleware/CheckUnitAccess.php`). Cek user ditugaskan ke
  unit_position dari parameter route `{unit_name}` atau tidak.

Nama route (`->name(...)`) dipakai frontend lewat helper `route()` (Ziggy) --
kalau ganti/hapus nama route, cari dulu semua pemakaiannya di
`resources/js/` sebelum diubah, biar tidak ada halaman yang tiba-tiba error
"route not found".
