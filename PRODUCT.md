# Netra — konteks produk

## Apa ini

Purwarupa web untuk **Netra**, platform video intelligence untuk kawasan industri.
Nama, angka, dan seluruh isinya fiktif — dipakai sebagai contoh produk, bukan materi
penawaran ke klien mana pun.

Dua permukaan:

| Rute | Mode | Untuk siapa |
|---|---|---|
| `/` | Persuade | Pengelola kawasan yang sedang membandingkan vendor |
| `/app/*` | Operate | Operator command center, supervisor, teknisi, petugas lapangan |

## Mekanisme yang membedakan

Kamera yang sudah terpasang dibaca terus-menerus, lalu penampakan yang terpisah-pisah
dijahit jadi **satu perjalanan kendaraan**: masuk lewat gerbang mana, lewat kamera apa
saja, berhenti berapa lama, keluar jam berapa — semuanya bisa dicari lewat plat nomor
dan disertai snapshot bukti.

Ini yang dijual. Bukan "AI", bukan jumlah filter.

## Batas yang dipegang

- Semua inferensi di on-premise. Video tidak keluar dari infrastruktur pelanggan.
- Plat dengan keyakinan rendah tidak dibuang, tapi masuk antrean verifikasi manusia.
- Membuka palang tidak boleh bergantung pada satu prediksi AI tanpa fallback manusia.
- Setiap pencarian dan ekspor bukti tercatat di jejak audit yang tidak bisa dihapus
  dari dalam aplikasi.

## Fase pertama (yang ditampilkan purwarupa ini)

Deteksi & pelacakan kendaraan, ANPR plat Indonesia, catatan masuk/keluar, perjalanan
lintas kamera, peta, timeline, pencarian plat, peringatan, bukti, kesehatan kamera,
audit log.

Di luar fase pertama: pengenalan wajah, kontrol gate otomatis tanpa verifikasi manusia,
sensor drainase, tenant app.

## Peran pengguna

| Peran | Yang dia lakukan |
|---|---|
| Operator | Memantau peta & dinding kamera, mencari plat, meninjau peringatan |
| Supervisor | Menugaskan, menutup peringatan, mengubah ambang batas zona |
| Teknisi | Menangani kamera bermasalah |
| Petugas lapangan | Menerima tugas di ponsel, menutup dengan foto bukti |
| Auditor | Membaca jejak audit dan laporan |

## Bahasa

Bahasa Indonesia, termasuk di landing page. Istilah teknis yang memang dipakai di
lapangan (ANPR, RTSP, ONVIF, VMS, uptime, bitrate) tetap dalam bentuk aslinya.

## Data

Seluruh angka berasal dari `src/lib/data.ts` dan dibangkitkan dengan PRNG bersumber
seed tetap, jadi tampilannya identik di setiap reload. Badge **DATA CONTOH** ada di
setiap layar dashboard supaya tidak pernah tertukar dengan data produksi.
