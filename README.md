# Netra

Purwarupa web untuk platform video intelligence kawasan industri — landing page plus
dashboard operator, seluruhnya dengan data contoh.

Nama, angka, tenant, dan rekaman di dalamnya fiktif. Ini contoh produk, bukan materi
penawaran.

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Landing di `/`, dashboard di `/app`.

```bash
npm run build     # produksi ke dist/
npm run preview   # cek hasil build
```

## Peta rute

| Rute | Isi |
|---|---|
| `/` | Landing page |
| `/app/peta` | Denah kawasan, posisi kendaraan live, kamera |
| `/app/dinding` | Dinding 4/9/16 kamera, live dan putar ulang, garis waktu rekaman |
| `/app/kendaraan` | Pencarian plat, riwayat penampakan, kartu kendaraan |
| `/app/kendaraan/:plat` | Detail satu perjalanan: rangkaian penampakan + rute di peta |
| `/app/peringatan` | Antrean peringatan, tinjau, tugaskan, tutup |
| `/app/kamera` | Kesehatan 24 kamera, uptime 14 hari, tiket |
| `/app/analitik` | Lalu lintas per jam, durasi berhenti, jenis peringatan, tenant, uptime, akurasi |
| `/app/audit` | Jejak audit, pengguna & peran, kebijakan retensi |
| `/app/petugas` | Aplikasi petugas lapangan (dua layar ponsel) |

## Susunan berkas

```
src/
  index.css                 token warna, tipografi, keyframe
  lib/data.ts               seluruh data contoh (PRNG bersumber seed tetap)
  lib/rng.ts                PRNG deterministik
  components/
    brand/Logo.tsx          mark + wordmark
    ui.tsx                  Panel, Button, Badge, Stat, Segmented, Field, Dot
    cctv/CctvScene.tsx      adegan CCTV prosedural (6 jenis, SVG)
    cctv/CameraFeed.tsx     bingkai + overlay deteksi di atas adegan
    site/SiteMap.tsx        denah kawasan (dipakai landing dan dashboard)
  landing/                  Hero, Platform, Sections, parts (nav & footer)
  dashboard/                Shell + 9 halaman
```

## Mengganti data contoh dengan data asli

- **Angka dan daftar** — ubah `src/lib/data.ts`. Semua halaman membaca dari sana.
- **Rekaman kamera** — taruh snapshot di `public/`, lalu
  `<CameraFeed camera={c} src="/snapshots/cam-01.jpg" />`. Lapisan overlay deteksi
  tidak berubah; `boxes` menerima kotak dalam persen terhadap frame.
- **Denah kawasan** — `BLOCKS` di `src/components/site/SiteMap.tsx` memakai sistem
  koordinat 1000×620. Koordinat kamera dan kendaraan di `data.ts` memakai sistem yang
  sama.

## Catatan

Badge **DATA CONTOH** muncul di setiap layar dashboard. Biarkan sampai data aslinya
masuk.

Konteks produk ada di [PRODUCT.md](PRODUCT.md), keputusan visual di [DESIGN.md](DESIGN.md).
