# Netra — keputusan visual

Dunia visualnya adalah **ruang kendali yang lampunya diredupkan**: layar biru di
ruangan gelap, denah kawasan sebagai gambar teknik, dan angka yang dibaca sekilas.
Bukan "SaaS gelap dengan aksen" — gelapnya dipilih dari tempat pemakaiannya.

## Logo

Tiga kerucut kamera yang menutup ke satu titik: banyak sudut pandang, satu identitas.
Di ukuran 16px ketiga bajinya terbaca sebagai iris — yang memang arti kata *netra*.
Geometrinya satu baji yang diputar 120°, jadi celah dan bobotnya identik di semua
ukuran. Titik sian di tengah adalah subjek yang sedang dilihat semua kamera.

Wordmark: Plus Jakarta Sans ExtraBold, huruf kecil, tracking -0.045em.

## Token

Semua token hidup di `src/index.css` blok `@theme`. Tidak ada warna mentah di komponen
kecuali di dalam SVG adegan CCTV dan grafik.

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `ink` | `hsl(222 42% 5%)` | latar aplikasi |
| `ink-2` | `hsl(220 38% 8%)` | latar sekunder, bingkai |
| `panel` | `hsl(220 34% 9.5%)` | permukaan kartu |
| `raised` | `hsl(219 26% 15%)` | kontrol, chip |
| `line` / `line-2` | `hsl(217 25% 17%)` / `hsl(217 24% 25%)` | garis pemisah, garis kontrol |
| `paper` / `dim` / `faint` | 96% / 72% / 54% lightness | tiga tingkat teks |
| `azure` | `hsl(217 91% 58%)` | aksi utama, identitas |
| `azure-hi` | `hsl(213 94% 66%)` | hover aksi utama |
| `ice` | `hsl(205 95% 78%)` | ikon dan penekanan di atas panel |
| `ok` `warn` `alarm` | hijau / kuning / merah | status, tidak pernah dipinjam untuk seri grafik |
| `scan` | `hsl(188 92% 56%)` | kotak deteksi mesin, titik kamera |

Pembagian kerjanya tegas: **biru = produk dan tindakan, sian = yang dilihat mesin,
kuning/merah = yang butuh manusia.** Warna status tidak pernah dipakai sebagai warna
dekoratif.

## Tipografi

- Plus Jakarta Sans untuk semua teks.
- JetBrains Mono untuk yang harus dibandingkan sebagai deret: plat nomor, jam,
  ID kamera, persentase, dan label sumbu. Bukan sebagai kostum "teknis".
- Judul landing memakai `clamp()` dengan tracking sampai `-0.045em`; makin besar
  makin rapat.
- Angka tabel selalu `tabular-nums`.

## Umpan kamera

Tiga sumber, berurutan sesuai kejujurannya:

1. **Klip CCTV** untuk kamera yang punya rekaman bergerak. Tanpa kotak deteksi — untuk
   klip itu tidak ada anotasi per frame, dan kotak karangan di atas rekaman asli akan
   menyesatkan.
2. **Foto dataset** dengan kotak plat asli dari anotasinya. Ini yang membawa cerita
   deteksi.
3. **Adegan SVG prosedural** (`CctvScene.tsx`) untuk kamera yang belum punya rekaman
   sama sekali, misalnya kamera yang sedang mati.

Semua diberi grade tipis ke arah CCTV: saturasi turun, kontras naik sedikit, lalu
lapisan vignette dan interlace dari UI.

## Denah kawasan

Satu sistem koordinat (1000 × 620), dua proyeksi:

- **Denah** — tegak lurus dari atas, untuk membaca posisi dengan presisi.
- **Isometrik** — geometri yang sama diekstrusi, untuk membaca tempatnya sekilas.

Karena keduanya diproyeksikan dari sumber yang sama, tidak mungkin melenceng satu
sama lain. Label tetap tegak, tidak ikut dimiringkan — peta taktis boleh miring,
tulisannya tidak.

Bentuknya dibedakan supaya tidak perlu dibaca dua kali: **belah ketupat = kamera**,
**lingkaran = mobil**, **persegi panjang = truk**. Cakupan kamera hanya muncul saat
disorot atau saat lapisannya dinyalakan; plat hanya muncul untuk kendaraan yang
dipilih. Yang selalu terlihat cuma yang selalu dibutuhkan: posisi, status, dan
jumlah per zona.

## Gerak

Satu gerakan utama: **sapuan analisis** yang turun pelan di feed kamera yang sedang
difokuskan. Sisanya berhemat — hanya denyut pada status yang benar-benar hidup, ping
sekali pada kendaraan terpilih di peta, dan `nt-rise` untuk masuknya hero.

Umpan kamera kecil (`compact`) tidak beranimasi sama sekali: dinding 16 kamera harus
tetap ringan. Seluruh animasi dimatikan di `prefers-reduced-motion`.

## Grafik

Palet kategorikal  /  — diverifikasi dengan validator dataviz pada
permukaan : lolos pita lightness, ambang chroma, pemisahan CVD
(protan ΔE 26,5 · tritan ΔE 28,0), dan kontras. Ukuran tunggal memakai satu hue biru.

Aturan yang dipegang: tidak pernah dua sumbu Y, legenda selalu ada untuk dua seri
atau lebih, teks memakai token teks bukan warna seri, dan tersedia tampilan tabel.

## Permukaan browser

Scrollbar, caret, ring fokus, dan warna seleksi diambil dari palet, bukan dari
default browser.

## Yang sengaja tidak dipakai

- Teks bergradien.
- Kaca/blur sebagai hiasan (blur hanya di header yang menempel dan di tooltip).
- Garis tebal berwarna di sisi kartu.
- Kartu seragam ikon + judul + paragraf sebagai struktur halaman.

## Grid biru

Latar bergaris di hero dan di timeline arsip adalah **permukaan gambar teknik**, sama
seperti denah kawasan di dalamnya — bukan hiasan. Ia berhenti persis di tempat
kontennya berhenti jadi denah.
