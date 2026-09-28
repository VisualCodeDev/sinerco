# Catatan Penting

Kumpulan konsep & gotcha yang gampang bikin bingung (atau bikin bug) kalau
tidak tahu latar belakangnya. Baca ini dulu sebelum ubah bagian-bagian yang
disebut di bawah.

## 1. Cron job WhatsApp (dan jadwal lain)

Jadwal kirim WhatsApp otomatis **BUKAN** disimpan di database atau di file
config -- jadwalnya didefinisikan langsung di kode, di `bootstrap/app.php`,
method `withSchedule()`:

```php
->withSchedule(function (Schedule $schedule) {
    $clients = Client::all();
    foreach ($clients as $client) {
        $interval = $client->auto_send_interval ?? '1h';
        $callback = fn() => app(WhatsAppController::class)->sendAutoMessage($client->client_id);
        match ($interval) {
            '1h' => $schedule->call($callback)->everyMinute(),
            '4h' => $schedule->call($callback)->everyFourHours(),
            '6h' => $schedule->call($callback)->everySixHours(),
            '12h' => $schedule->call($callback)->cron('0 */12 * * *'),
            '1d' => $schedule->call($callback)->daily(),
            default => $schedule->call($callback)->hourly(),
        };
    }
})
```

**Kalau mau nambah pilihan interval baru** (misal '2h'):
1. Tambah case baru di `match()` di atas (`bootstrap/app.php`).
2. Tambah juga pilihannya di form setting client (field `auto_send_interval`,
   lihat `ClientController::setSettings()` & halaman setting client di frontend)
   -- kalau cuma diubah di satu sisi, client bisa pilih interval yang backend-nya
   tidak tahu cara jadwalinnya (bakal jatuh ke default `hourly`).

**Di server production**, semua ini baru beneran jalan kalau cron OS-nya
manggil Laravel scheduler tiap menit:
```
* * * * * cd /path/ke/project && php artisan schedule:run >> /dev/null 2>&1
```
Kalau pesan WhatsApp tidak terkirim, cek DULU apakah cron ini beneran ada &
path `php`/project-nya benar, sebelum curiga ke kode `WhatsAppController`/
`WhatsAppService`. (Riwayat: pernah kejadian cron-nya nunjuk ke path yang
salah di server, jadi kelihatannya "fitur-nya rusak" padahal cron-nya
memang tidak pernah jalan.)

Pesan WhatsApp beneran dikirim lewat provider pihak ketiga **Fonnte**
(`app/Services/WhatsAppService.php`), tokennya di `.env` (`FONNTE_TOKEN` ->
`config('services.fonnte.token')`).

## 2. Client vs Workshop -- saling eksklusif

Sebuah unit (`data_units`) ditempatkan lewat `unit_positions`, dan HANYA BOLEH
dimiliki **Client** ATAU **Workshop**, tidak boleh dua-duanya. Ini dijaga di 3
lapis sekaligus:

1. Validasi request di `DataUnitController` (`addUnitLocation`,
   `updateUnitFull`, `addNewUnit`) -- pakai rule `prohibits`.
2. **CHECK constraint** `chk_client_or_workshop` di tabel `unit_positions`
   (level database, jaring pengaman terakhir).
3. Frontend (`UnitTable.jsx`) otomatis ngosongin field yang satu begitu field
   satunya dipilih.

Konsekuensinya: kalau unit ditempatkan di **Workshop**, `location_id` &
`region_id` HARUS `null` (workshop tidak punya lokasi). Kalau di **Client**,
`location_id` & `region_id` WAJIB diisi.

Field `area` (nama area) **SENGAJA tidak punya kolom sendiri** di
`unit_positions` -- selalu diturunkan lewat relasi `location -> area`. Jangan
coba nyimpen area_id langsung ke unit_positions, itu bukan desainnya.

## 3. Tiga tipe request: SD, STBY, dan Note

`StatusRequest.request_type` bisa `'sd'`, `'stdby'`, atau `'note'`.

- **`sd`/`stdby`**: mengubah status unit (`DataUnit.status`), memicu alarm
  (bikin baris di `AdminNotification`, di-poll tiap 10 detik sama
  `PageLayout.jsx` buat nyalain alarm bunyi/popup), dan hanya boleh SATU yang
  Ongoing per unit di satu waktu.
- **`note`**: TIDAK mengubah status unit, TIDAK memicu alarm sama sekali, dan
  BOLEH ada banyak note Ongoing bersamaan (tidak saling blokir dengan sd/stdby
  ataupun sesama note). Tetap muncul di daftar "ongoing event" yang sama
  (filter-nya cuma berdasarkan `status === 'Ongoing'`, bukan `request_type`).

Kalau nambah tipe baru lagi di masa depan, cek SEMUA tempat yang meng-hardcode
`'sd'`/`'stdby'`: `StatusRequestController` (setRequest/updateRequest),
`StatusRequest::boot()`, `AdminNotificationController::getNotifications()`,
dan `UnitAvailabilityService::dailyStatus()` (yang terakhir ini cuma
menjumlahkan durasi 'sd'/'stdby' buat itung jam running/down/standby -- tipe
baru selain itu otomatis diabaikan, aman, tapi perlu disadari).

## 4. Perhitungan Curve & Performance

```
Performance = Flowrate / Referensi x 100
```

Referensi-nya ada 2 metode (dicek berurutan):

1. **Fix** (`DataUnit.curveFixedValue`) -- kalau diisi (>0), dipakai LANGSUNG
   sebagai referensi. Suction/discharge pressure sama sekali tidak dipakai.
2. **Variable** -- kalau Fix kosong: `Referensi = Curve::interpolate(suction,
   discharge, valve) x (curve_percentage / 100)`. `curve_percentage` rentang
   0-100% (BUKAN "+100% baseline" seperti versi lama -- kalau nemu kode/data
   lama yang masih pakai formula `(100 + persen) / 100`, itu sudah usang &
   sudah dikonversi lewat migration `convert_curve_percentage_to_direct_
   multiplier_in_data_units_table`).

Logic ini ADA DI DUA TEMPAT yang harus tetap sinkron: `DailyReportController::
calculatePerformance()` (laporan per jam) dan blok invoice di
`ExportController::exportInvoice()` (kolom `{{curve}}`).

`Curve::interpolate()` (model `Curve`) melakukan interpolasi bilinear dari
tabel `curves` yang di-seed manual per valve config. **PENTING**: tiap valve
config punya rentang suction/discharge SENDIRI-SENDIRI (tidak semua valve
nyakup semua tekanan) -- kalau input di luar rentang valve itu, hasilnya
di-*clamp* ke titik terdekat (bukan interpolasi asli), jadi kelihatan seperti
angka valid padahal cuma tebakan dari ujung data yang ada.

Performance juga di-prorate berdasarkan jam unit BENERAN jalan hari itu (`24 -
down - standby`, dihitung dari `UnitAvailabilityService::dailyStatus()`) --
supaya unit yang cuma jalan setengah hari (kena SD/STBY) tidak kelihatan
performanya sama seperti yang jalan penuh 24 jam.

## 5. `input_interval` -- bukan tiap client selalu per jam

Client bisa diatur laporannya diisi tiap 1, 2, 3 jam (atau lebih) lewat
`Client.input_interval`. Ini dipakai di BANYAK tempat buat itung rata-rata
yang benar:

- **Pembaginya HARUS "jumlah pembacaan yang DIHARAPKAN per hari"**
  (`24 / input_interval`), BUKAN jumlah laporan yang benar-benar keisi (biar
  jam yang belum diisi ikut dihitung 0, bukan di-skip dari rata-rata) DAN
  BUKAN jumlah jam yang sudah berlalu (yang cuma benar kalau interval-nya 1
  jam).
- Tempat yang pakai logic ini: `ExportController::getAvgByHourRange()`
  (backend, semua jenis export) dan `DynamicLineChart.jsx`'s
  `buildSeriesRows()` (frontend, grafik).
- X-axis grafik jam-jaman (`DynamicLineChart.jsx`) juga HARUS ngikutin step
  interval ini (`generateFullHours(step)`) -- kalau tidak, jam-jam di antara
  jadwal pembacaan asli bakal selalu jatuh ke 0 dan bikin grafiknya
  zigzag/curvy padahal datanya sebenarnya baik-baik saja.

## 6. Riwayat perpindahan unit (Movement Log)

`UnitMovementLog` (lewat `UnitMovementLogger` service) mencatat SETIAP kali
`client_id`/`workshop_id`/`region_id`/`location_id` sebuah unit berubah.
Karena semua endpoint yang mengubah field-field ini pakai query builder
(`UnitPosition::whereIn(...)->update([...])`, bukan `$model->save()`),
kondisi "sebelum" harus diambil MANUAL dulu sebelum update jalan:

```php
$before = UnitMovementLogger::snapshot($unitIds);
UnitPosition::whereIn('unit_id', $unitIds)->update([...]);
UnitMovementLogger::commit($before, 'nama_action');
```

Kalau nambah endpoint baru yang mengubah field-field itu, JANGAN LUPA pola di
atas -- kalau tidak, perubahannya tidak akan tercatat di riwayat sama sekali
(tidak error, cuma diam-diam tidak ke-log).

## 7. `getPermittedUnit()` vs `getAllUnitsFlat()`

Ada 2 fungsi MIRIP BANGET di `DataUnitController` yang sama-sama meng-flatten
data unit jadi struktur datar buat dikirim ke frontend, tapi dipakai endpoint
BEDA:

- `getPermittedUnit()` -- dipakai `unit.get` (List of Unit / UnitTable.jsx).
- `getAllUnitsFlat()` -- dipakai `getUnitStatus` (Home.jsx dashboard, di-cache
  5 detik).

**Kalau nambah field baru ke response unit (misal kolom baru di data_units
atau unit_positions), WAJIB update KEDUA fungsi ini** (dan kedua branch
non-admin/super_admin di dalam `getPermittedUnit()`, jadi total ada 3 tempat).
Sudah beberapa kali kejadian field baru cuma ditambahin di salah satu, hasilnya
salah satu halaman jalan normal tapi halaman lain datanya selalu kosong/blank
tanpa error apa pun.
