# app/Models/

Model Eloquent proyek ini. Tiap file punya komentar ringkas di atas `class`-nya.
Beberapa relasi kunci yang paling penting dipahami:

```
DataUnit (data fisik unit)
   |-- hasOne --> UnitPosition (dimana & milik siapa unit ini ditempatkan)
                     |-- belongsTo --> Client   -+-- SALING EKSKLUSIF, lihat
                     |-- belongsTo --> Workshop -+   CATATAN_PENTING.md poin 2
                     |-- belongsTo --> Location --> Area --> Region
                     |-- hasMany  --> StatusRequest (event SD/STBY/Note)
                     |-- hasMany  --> DailyReport   (laporan per jam)
```

| Model | Catatan |
|---|---|
| `UnitPosition` | **Model paling sentral.** "Dimana unit ditempatkan", bukan data fisiknya. |
| `DataUnit` | Data fisik unit + setting curve (`curve_percentage`, `curveFixedValue`). |
| `StatusRequest` | 1 baris = 1 event SD/STBY/Note. Boot hook-nya urus sinkronisasi ke DailyReport & alarm. |
| `DailyReport` | 1 baris = 1 pembacaan per jam. Kolom `data` (JSON) isinya dinamis tergantung field yang terdaftar. |
| `RemarkList` | Daftar remark autocomplete, auto-learn tiap ada remark baru diketik. |
| `UnitMovementLog` | Riwayat perpindahan client/workshop/region/location unit (lihat `UnitMovementLogger` service). |
| `Client` / `Workshop` | 2 kemungkinan pemilik `UnitPosition`. |
| `Region` / `Area` / `Location` | Hierarki lokasi 3 tingkat -- `area` sengaja tidak disimpan langsung di `UnitPosition`. |
| `Curve` | Tabel lookup kurva kompresor per valve config, dipakai `Curve::interpolate()`. |
| `User` / `Role` | Login & hak akses (role: operator/technician/super_admin). |

Model lain (`AdminNotification`, `BeritaAcara`, `Contract`, `DailyField`,
`Subfield`, `UnitField`, `DailyReportSettings`, `UserSetting`, `BranchArea`)
sudah punya komentar sendiri di file masing-masing.
