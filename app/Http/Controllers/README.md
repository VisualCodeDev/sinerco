# app/Http/Controllers/

Semua endpoint API & halaman (render Inertia) proyek ini. Tiap file punya
komentar ringkas di atas `class`-nya -- baca itu dulu buat tau tanggung jawab
tiap controller. Ringkasan cepat:

| Controller | Tanggung jawab |
|---|---|
| `DataUnitController` | **Paling besar & paling sering dipakai.** CRUD unit, penempatan ke client/workshop, setting per-unit, status dashboard. |
| `DailyReportController` | Laporan harian per jam + perhitungan curve/performance (lihat [CATATAN_PENTING.md](../../../CATATAN_PENTING.md) poin 4). |
| `DailyReportSettingsController` | Setting laporan PER CLIENT (beda dengan setting per unit di `DataUnitController`). |
| `StatusRequestController` | Request SD/STBY/Note + daftar remark suggestion (lihat poin 3 di CATATAN_PENTING.md). |
| `AdminNotificationController` | Alarm SD/STBY yang di-poll frontend tiap 10 detik. |
| `ExportController` | Generate Invoice/Denda/BA/BAPM/BAP (paling banyak baris kode di proyek ini). |
| `ClientController` / `WorkshopController` | 2 kemungkinan "pemilik" sebuah unit -- saling eksklusif (poin 2 CATATAN_PENTING.md). |
| `LocationController` | Hierarki Region -> Area -> Location. |
| `UserSettingController` | Penugasan user ke unit (siapa boleh akses unit mana). |
| `ProfileController` | Data profil user sendiri (beda dengan penugasan di atas). |
| `WhatsAppController` | Kirim rekap laporan otomatis -- **jadwalnya ada di `bootstrap/app.php`, bukan di sini** (poin 1 CATATAN_PENTING.md). |
| `BeritaAcaraController` | Data form Berita Acara (dokumennya di-generate lewat `ExportController`). |
| `ContractController` | Data & dokumen kontrak per unit_position. |
| `DailyFieldController` | Master data field laporan (bukan required/tidaknya per unit -- itu di `DataUnitController`). |
| `UnitAreaLocationController` / `UnitFieldController` | Stub resource controller bawaan, belum ada logic custom (endpoint yang beneran dipakai ada di controller lain). |

Controller lain (`Controller.php` -- base class kosong) tidak masuk daftar
karena tidak punya logic sendiri.
