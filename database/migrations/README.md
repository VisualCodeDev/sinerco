# database/migrations/

Riwayat perubahan skema database, urut berdasarkan timestamp nama file (paling
lama di atas). Beberapa yang penting buat dipahami kalau mau ubah struktur
`data_units`/`unit_positions`/`remark_lists`:

- `..._create_unit_positions_table.php` -- tabel paling sentral, lihat komentar
  di `app/Models/UnitPosition.php` & [CATATAN_PENTING.md](../../CATATAN_PENTING.md) poin 2.
- `..._add_client_or_workshop_check_constraint_to_unit_positions_table.php` --
  CHECK constraint yang mencegah `client_id` & `workshop_id` terisi bersamaan.
- `..._rename_performance_fixed_value_to_curve_fixed_value_in_data_units_table.php`
  & `..._convert_curve_percentage_to_direct_multiplier_in_data_units_table.php`
  -- riwayat perubahan formula curve, lihat CATATAN_PENTING.md poin 4.
- `..._create_remark_lists_table.php` & `..._add_request_type_to_remark_lists_table.php`
  -- daftar remark autocomplete, kolom `request_type`-nya JSON array (1 remark
  bisa berlaku buat lebih dari 1 tipe request).

**Catatan buat migration baru yang mengubah tipe/default kolom** (pakai
`->change()`): server production/dev di proyek ini pakai **MariaDB**, bukan
MySQL murni -- beberapa syntax (mis. `RENAME COLUMN`) tidak didukung di versi
MariaDB yang dipakai (10.4), harus pakai `ALTER TABLE ... CHANGE` lewat
`DB::statement()` sebagai gantinya (lihat migration rename curveFixedValue di
atas sebagai contoh).

Seeder (`database/seeders/*.php`) **TIDAK otomatis jalan** pas `php artisan
migrate` -- jalankan manual: `php artisan db:seed --class=NamaSeeder`.
