# resources/js/Components/

Komponen React yang dipakai berulang di banyak halaman (bukan halaman penuh --
itu ada di [`resources/js/Pages/`](../Pages/README.md)).

| File/Folder | Fungsi |
|---|---|
| `Dashboard/` | Komponen inti dashboard -- `UnitTable.jsx` (tabel & form add/edit unit, termasuk pemilihan Client/Workshop, lihat CATATAN_PENTING.md poin 2), `DailyReport.jsx`, `DailyReportForm.jsx`. |
| `RequestComponents/` | Modal buat bikin request SD/STBY/Note (`RequestModal.jsx`) -- remark suggestion di sini filternya berdasarkan tipe request yang dipilih. |
| `Events/` | `OnGoingEvent.jsx` -- daftar request yang masih Ongoing. |
| `utils/` | Helper murni JS (bukan komponen) -- kolom tabel per halaman (`utils/DataUnit/`, `utils/Request/`, dst), fungsi tanggal/jam (`functions-util.jsx`), daftar konstanta (`variables-util.jsx`). |
| `Toast/` | Notifikasi toast (`ToastProvider.jsx` -- context, dipasang di `app.jsx`). |
| `Auth/` | `auth.jsx` -- hook `useAuth()`, ambil data user login lewat API (`route('auth.get')`), BUKAN lewat shared Inertia props. |
| `DynamicLineChart.jsx` | Grafik garis (Recharts) buat lihat tren data unit/area dari waktu ke waktu -- X-axis-nya ngikutin `input_interval` client (lihat CATATAN_PENTING.md poin 5). |
| `TableComponent.jsx` | Tabel generik dipakai di hampir semua halaman list -- kolom & sorting-nya dikonfigurasi lewat file di `utils/`. |
| `StatusPill.jsx` | Badge warna status (running=hijau, stdby=kuning, note=abu-abu, selain itu=merah). |
| `Modal.jsx` | Modal generik (dipakai hampir semua form popup). |
| `db.jsx` | Kumpulan fungsi fetch data ke endpoint backend (`getFields`, `getAllUnits`, dst) -- dipanggil dari halaman/komponen lain. |

Kalau nambah komponen baru yang bakal dipakai lebih dari 1 halaman, taruh di
sini, BUKAN duplikat kodenya di tiap halaman yang butuh.
