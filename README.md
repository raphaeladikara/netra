# Netra

Purwarupa web untuk sistem pelacakan kendaraan lintas kamera di kawasan industri —
landing page plus dashboard operator, seluruhnya dengan data contoh.

Intinya bukan "membaca plat". Intinya: **satu kendaraan, dua puluh empat kamera, satu
identitas** — kendaraan yang masuk gerbang tetap dikenali ketika muncul di kamera lain,
bahkan saat platnya tidak terbaca.

Nama kawasan, tenant, angka, dan skor Re-ID di dalamnya fiktif. Ini contoh produk, bukan
materi penawaran.

## Menjalankan

```bash
npm install
npm run dev
```

Landing di `/`, dashboard di `/app`.

```bash
npm run build     # produksi ke dist/
npm run preview   # cek hasil build
```

## Peta rute

| Rute | Isi |
|---|---|
| `/` | Landing page |
| `/app/peta` | Denah kawasan, posisi kendaraan, rute lintas kamera, isi per zona |
| `/app/dinding` | Dinding 4/9/16 kamera (foto asli + klip CCTV), playback, garis waktu |
| `/app/kendaraan` | Pencarian plat/ID, riwayat penampakan, kartu identitas kendaraan |
| `/app/kendaraan/:plat` | Satu perjalanan: rangkaian penampakan, ANPR, galeri Re-ID, topologi |
| `/app/peringatan` | Antrean peringatan, tinjau, tugaskan, tutup |
| `/app/identitas` | Peleburan identitas, serah terima antar kamera, topologi kamera |
| `/app/kamera` | Kesehatan 24 kamera, uptime 14 hari, tiket |
| `/app/analitik` | Lalu lintas, durasi berhenti, jenis peringatan, tenant, akurasi ANPR vs fusion |
| `/app/audit` | Jejak audit, pengguna & peran, kebijakan retensi |
| `/app/petugas` | Aplikasi petugas lapangan (dua layar ponsel) |

## Dari mana gambarnya

Frame kamera, kotak plat, dan kotak per karakter **bukan gambar hiasan** — semuanya
anotasi asli dari dataset publik:

| Aset | Sumber |
|---|---|
| `public/frames/*.jpg` + kotak plat | Indonesian License Plate Dataset — foto, label YOLO, dan string platnya |
| `public/plates/*_ocr.jpg` + kotak karakter | Indonesian License Plate Recognition Dataset — satu crop per plat, label per karakter |
| `public/clips/*.mp4` | Dataset CCTV lalu lintas publik, dipakai sebagai umpan bergerak |

Tiga kendaraan di demo (`L 1731 LI`, `B 2005 POU`, `AB 1633 SY`) memang difoto
berkali-kali oleh dataset itu, di jarak dan sudut berbeda. Itulah yang dipakai sebagai
contoh Re-ID — jadi galeri "kendaraan yang sama di setiap kamera" benar-benar berisi
kendaraan yang sama, bukan dua mobil yang kebetulan mirip.

Klip bergerak sengaja tidak diberi kotak deteksi: untuk klip itu tidak ada anotasi per
frame, dan menggambar kotak di atasnya cuma jadi hiasan yang menyesatkan.

### Membangun ulang aset

Dataset tidak ikut di-commit. Taruh salinannya di suatu tempat, lalu:

```bash
DATA_ROOT=/path/ke/data npx --yes -p sharp@0.34 node scripts/prepare-frames.mjs
```

Daftar frame yang dipakai ada di `scripts/frames.picks.json`. Script menulis
`public/frames`, `public/plates`, dan `src/lib/frames.ts`.

## Susunan berkas

```
src/
  index.css                    token warna, tipografi, keyframe
  lib/data.ts                  kamera, zona, topologi, kendaraan, hop, peringatan
  lib/frames.ts                GENERATED — frame, kotak plat, kotak karakter
  lib/plate.ts                 format plat Indonesia
  components/
    cctv/CameraFeed.tsx        satu ubin kamera: klip, foto, atau adegan prosedural
    cctv/CctvScene.tsx         adegan SVG untuk kamera yang belum punya rekaman
    anpr/PlateExtraction.tsx   pipeline ANPR empat langkah di atas frame asli
    reid/Reid.tsx              peleburan sinyal, serah terima, topologi, galeri
    site/SiteMap.tsx           denah kawasan
    ui.tsx                     Panel, Button, Badge, Stat, Segmented, Field, Dot
  landing/                     Hero, Platform, CrossCamera, Sections, parts
  dashboard/                   Shell + 10 halaman
```

## Model data

Setiap kendaraan punya ID global (`VHC-0001`) yang tidak berubah walau platnya gagal
terbaca di suatu kamera. Setiap penampakan (`Hop`) mencatat **bagaimana** identitasnya
ditetapkan:

| `by` | Artinya |
|---|---|
| `plate` | Plat terbaca dan cocok |
| `fusion` | Plat terbaca sebagian, dikuatkan embedding Re-ID |
| `reid` | Plat tidak terbaca sama sekali; identitas dari embedding + topologi + waktu tempuh |

`topology` di `data.ts` menyimpan kamera mana bertetangga dengan kamera mana beserta
rentang waktu tempuhnya. Ini yang mencegah dua mobil putih sejenis tertukar: kecocokan
penampilan setinggi apa pun tetap ditolak kalau perpindahannya mustahil.

## Deploy ke Vercel

1. Buka [vercel.com/new](https://vercel.com/new), pilih repo `raphaeladikara/netra`.
2. Biarkan setelan bawaan — framework terdeteksi **Vite**, build `npm run build`,
   output `dist`, Root Directory kosong.
3. Deploy.

[vercel.json](vercel.json) mengarahkan semua permintaan yang bukan berkas statis ke
`index.html`. Tanpa itu, membuka `/app/peta` langsung akan 404, karena rutenya ditangani
React Router di sisi klien.

## Catatan

Badge **DATA CONTOH** muncul di setiap layar dashboard. Biarkan sampai data aslinya masuk.

Konteks produk ada di [PRODUCT.md](PRODUCT.md), keputusan visual di [DESIGN.md](DESIGN.md).
