# resources/js/Pages/

Halaman-halaman yang di-render lewat Inertia (`Inertia::render('Folder/File')`
di controller Laravel = file `resources/js/Pages/Folder/File.jsx`). 1 file = 1
halaman penuh, biasanya dibungkus `<PageLayout>` (lihat
`resources/js/Layouts/PageLayout.jsx` -- di situ juga tempat alarm SD/STBY
di-poll & ditampilkan, lihat CATATAN_PENTING.md poin 3).

| Folder/File | Isi |
|---|---|
| `Home.jsx` | Dashboard utama -- ringkasan status unit (running/standby/down/workshop). |
| `Daily/` | Halaman laporan harian per unit (isi laporan per jam). |
| `Request/` | Halaman daftar & histori request SD/STBY/Note. |
| `Database/` | Tab-tab master data (Client, Area, Workshop, Field, dll). |
| `Unit/` | Setting per-unit, movement log, relokasi unit. |
| `Client/` | Detail & daftar client. |
| `Workshop/` | Detail & daftar workshop. |
| `Location/` | Manajemen Region/Area/Location. |
| `User/` | Manajemen user & penugasan (allocation). |
| `BA/` | Halaman Berita Acara. |
| `Auth/` | Login, dsb (bawaan starter kit). |
| `Profile/` | Halaman profil user sendiri. |

Komponen yang dipakai ULANG di banyak halaman ada di
[`resources/js/Components/`](../Components/README.md), bukan di sini.
