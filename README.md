# Sinerco

Aplikasi monitoring unit compressor/genset -- laporan harian per jam, request
SD (shutdown) / STBY (standby) / Note, notifikasi WhatsApp otomatis, sampai
generate dokumen Invoice/Denda/Berita Acara. Dibangun pakai Laravel 11
(backend) + React via Inertia.js (frontend).

Untuk penjelasan konsep-konsep yang gampang bikin bingung dev baru (curve
Fix vs Variable, kenapa ada tipe request "Note", cron WhatsApp, dst), baca
**[CATATAN_PENTING.md](CATATAN_PENTING.md)** dulu sebelum ngoprek kode.

## Struktur folder

Tiap folder besar punya README sendiri yang lebih detail:

- [`app/Http/Controllers/`](app/Http/Controllers/README.md) -- semua endpoint API/halaman
- [`app/Models/`](app/Models/README.md) -- model Eloquent & relasi antar tabel
- [`app/Services/`](app/Services/README.md) -- logic yang dipakai bareng beberapa controller
- [`database/migrations/`](database/migrations/README.md) -- riwayat perubahan skema
- [`routes/`](routes/README.md) -- daftar route
- [`resources/js/Pages/`](resources/js/Pages/README.md) -- 1 file = 1 halaman (di-render Inertia)
- [`resources/js/Components/`](resources/js/Components/README.md) -- komponen React yang dipakai ulang

## Menjalankan proyek ini secara lokal

```bash
composer install
npm install
cp .env.example .env      # lalu isi DB_* sesuai database lokal kamu
php artisan key:generate
php artisan migrate --seed
npm run dev                # atau `npm run build` buat production build
php artisan serve
```

Kalau mau test cron WhatsApp/jadwal lain secara lokal:

```bash
php artisan schedule:work   # jalan terus, ngecek jadwal tiap menit (mirip cron di server)
```

## Yang perlu diperhatikan sebelum deploy ke production

Setiap kali ada migration baru, jangan lupa:

```bash
php artisan migrate
php artisan optimize:clear   # WAJIB kalau ada perubahan di routes/web.php atau config -- kalau tidak, cache lama masih kepake
npm run build                # WAJIB kalau ada perubahan di resources/js -- kalau tidak, JS lama masih ke-serve
```

Seeder (`php artisan db:seed --class=NamaSeeder`) TIDAK otomatis ikut jalan
pas `migrate` -- harus dijalankan manual kalau memang perlu (mis. re-seed
`RemarkListSeeder` setelah nambah daftar remark baru).
