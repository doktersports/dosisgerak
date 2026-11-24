# DosisGerak

Resep latihan mingguan berbasis bukti untuk praktik Kedokteran Olahraga. Aplikasi web progresif (PWA), 100% offline sesudah dipasang.

**Status: Pratinjau 1.0.0.** Aturan klinis belum ditinjau. Jangan dipakai untuk keputusan pasien.

## Pasang di HP

1. Buka https://doktersports.github.io/dosisgerak di Chrome Android.
2. Menu titik tiga → **Instal Aplikasi** (atau **Tambahkan ke Layar Utama**).
3. Buka sekali saat ada sinyal. Sesudah chip **Siap Tanpa Sinyal** muncul, aplikasi bisa dipakai tanpa internet.

## Isi Versi 1.0.0

- Pemilih anatomi (depan/belakang, kanan/kiri/bilateral, 14 regio).
- Profil pasien: TD, HR istirahat, HRmax, aritmia, alat pacu, 17 kelas obat.
- Slider durasi tunggal: default dari diagnosis dan faktor pemberat; zona merah/kuning/hijau.
- ACL-R (kerangka; latihan per fase menunggu kartu aturan).
- DM2/prediabetes: aerobik dan beban mingguan dengan progresi.
- Cadangan berkas JSON (ekspor/impor).

## Privasi

Tanpa nama, nomor rekam medis, atau tanggal lahir. Kasus memakai kode (mis. KG-0001). Data hanya tersimpan di penyimpanan browser HP ini.

## Label Aturan

| Label | Arti |
|---|---|
| BUKTI | Dari sumber terverifikasi (DOI/ISBN tercantum) |
| PAKAR | Besaran ditetapkan klinisi; dapat diubah di Pengaturan |
| DRAF | Disusun dari sumber, belum ditinjau |
| MENUNGGU | Sumber belum ditemukan; tidak boleh dipakai |

## Pengembangan

```
node tests/engine.test.mjs
```

Tanpa build step dan tanpa dependensi. Font: Onest dan Bricolage Grotesque (SIL Open Font License, lihat `fonts/`).

made by @dokter.sports
