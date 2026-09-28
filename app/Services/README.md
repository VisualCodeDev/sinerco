# app/Services/

Logic yang dipakai bareng oleh lebih dari satu controller, dipisah ke sini
biar tidak duplikat.

| Service | Dipakai untuk |
|---|---|
| `UnitAvailabilityService` | Hitung jam running/standby/down unit per tanggal dari daftar `StatusRequest`-nya. Dipakai `ExportController` (rekap bulanan/invoice) DAN `DailyReportController` (proration performance per jam) -- kalau ubah logic-nya, keduanya kena dampak. |
| `UnitMovementLogger` | Catat riwayat perpindahan client/workshop/region/location unit. Lihat [CATATAN_PENTING.md](../../CATATAN_PENTING.md) poin 6 buat pola pakainya (snapshot dulu sebelum update). |
| `WhatsAppService` | Kirim pesan lewat provider Fonnte. **Jadwal kirimnya TIDAK di sini** -- lihat `WhatsAppController` & `bootstrap/app.php` (CATATAN_PENTING.md poin 1). |
