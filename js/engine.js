// Mesin aturan DosisGerak. Fungsi murni tanpa DOM, sehingga bisa diuji dengan node.
// Setiap keluaran membawa label BUKTI/PAKAR dan kunci sumber.

import { OBAT, NAMA_HARI } from './data.js';

const BUKTI = 'BUKTI';
const PAKAR = 'PAKAR';
// Grindem 2016: risiko cedera ulang turun sampai 9 bulan. 9 × 30,4 hari ÷ 7 = 39,1 → 39 minggu.
export const BATAS_PIVOTING = 39;

export function imt(bb, tb) {
  if (!bb || !tb) return null;
  const m = tb / 100;
  return Math.round((bb / (m * m)) * 10) / 10;
}

// Karvonen dengan batas kontinu: zona [lo, hi) sehingga tidak ada denyut yang jatuh di celah.
export function zonaKarvonen(hrMax, hrIstirahat, lo, hi) {
  if (!hrMax || !hrIstirahat || hrMax <= hrIstirahat) return null;
  const hrr = hrMax - hrIstirahat;
  return {
    bawah: Math.ceil(hrIstirahat + lo * hrr),
    atas: Math.ceil(hrIstirahat + hi * hrr) - 1
  };
}

export function obatTerpilih(profil) {
  const ids = (profil && profil.obat) || [];
  return OBAT.filter(o => ids.includes(o.id));
}

export function adaEfek(profil, efek) {
  return obatTerpilih(profil).some(o => o.efek && o.efek[efek]);
}

// Menentukan apakah target intensitas memakai HR atau RPE.
export function modeIntensitas(profil) {
  const alasan = [];
  if (profil.aritmia) alasan.push('Aritmia: HR tidak mencerminkan beban latihan.');
  if (profil.pacu) alasan.push('Alat pacu jantung: HR tidak mencerminkan beban latihan.');
  obatTerpilih(profil).filter(o => o.efek.hrTidakValid).forEach(o => alasan.push(`${o.nama}: respons HR tumpul.`));
  if (alasan.length) return { mode: 'RPE', alasan };
  if (!profil.hrMax || !profil.hrIstirahat) {
    return { mode: 'RPE', alasan: ['HRmax atau HR istirahat belum diisi, sehingga zona HR tidak bisa dihitung.'] };
  }
  return { mode: 'HR', alasan: ['Tanpa aritmia, alat pacu, atau obat penumpul HR.'] };
}

// Gerbang keamanan dari profil. status: merah | kuning | info
export function gerbangProfil(dx, profil, laporan) {
  const g = [];
  const s = Number(profil.tdS) || 0;
  const d = Number(profil.tdD) || 0;
  if (!s || !d) {
    g.push({ status: 'kuning', teks: 'TD istirahat belum diisi.', label: PAKAR, sumber: [] });
  } else if (s >= 200 || d >= 110) {
    g.push({ status: 'merah', teks: `TD istirahat ${s}/${d} mmHg mencapai ambang ≥200/110 (kontraindikasi relatif). Tunda latihan dan evaluasi.`, label: BUKTI, sumber: ['nchpad'] });
  }
  if (profil.aritmia || profil.pacu) {
    g.push({ status: 'kuning', teks: 'Aritmia atau alat pacu jantung tercatat. Pastikan sudah ada evaluasi kardiologi.', label: PAKAR, sumber: [] });
  }
  if (dx === 'aclr' && laporan) {
    const t = laporan.tambahan || [];
    if (t.includes('kartilago')) {
      g.push({ status: 'merah', teks: 'Prosedur kartilago tercatat. Di luar protokol standar: ikuti instruksi operator.', label: PAKAR, sumber: [] });
    }
    if (t.includes('meniskus-repair') || t.includes('apm')) {
      g.push({ status: 'merah', teks: 'Ada prosedur meniskus penyerta. Protokol ACL-R + meniskus baru tersedia di versi 1.1.0.', label: PAKAR, sumber: [] });
    }
    if (t.includes('ligamen-lain')) {
      g.push({ status: 'merah', teks: 'Ada rekonstruksi ligamen lain. Di luar protokol ACL-R tanpa cedera penyerta.', label: PAKAR, sumber: [] });
    }
  }
  return g;
}

// Catatan keamanan dari obat dan diagnosis.
export function catatanObat(profil) {
  return obatTerpilih(profil).map(o => ({ nama: o.nama, teks: o.dampak, label: 'DRAF', sumber: ['acsmGetp12'] }));
}

// Default durasi slider. rincian: baris-baris hitungan yang tampil di bawah slider.
export function defaultDurasi(dx, profil, pengaturan) {
  const rincian = [];
  let batasMerah = null;
  if (dx === 'aclr') {
    if (profil.target === 'pivoting') {
      rincian.push({ teks: 'Dasar: ACL-R → olahraga pivoting (9 bulan ≈ 39 minggu)', nilai: BATAS_PIVOTING, label: BUKTI, sumber: ['grindem2016'] });
      batasMerah = BATAS_PIVOTING;
    } else {
      rincian.push({ teks: 'Dasar: ACL-R → aktivitas non-pivoting', nilai: pengaturan.aclrDasarNonPivoting, label: PAKAR, sumber: ['vanMelick2016'] });
    }
    const nilaiImt = imt(profil.bb, profil.tb);
    if (nilaiImt && nilaiImt >= 30) {
      rincian.push({ teks: 'IMT ≥30', nilai: pengaturan.faktorImt30, label: PAKAR, sumber: [], belumDitetapkan: !pengaturan.faktorImt30 });
    }
    if (profil.aktivitas === 'sedenter') {
      rincian.push({ teks: 'Tidak aktif sebelum cedera', nilai: pengaturan.faktorSedenter, label: PAKAR, sumber: [], belumDitetapkan: !pengaturan.faktorSedenter });
    }
    if (Number(profil.usia) >= 40) {
      rincian.push({ teks: 'Usia ≥40 tahun', nilai: pengaturan.faktorUsia40, label: PAKAR, sumber: [], belumDitetapkan: !pengaturan.faktorUsia40 });
    }
  } else if (dx === 'dm2') {
    rincian.push({ teks: 'Siklus program dengan evaluasi minggu 4, 8, 12', nilai: pengaturan.dm2Durasi, label: PAKAR, sumber: [] });
  }
  const total = rincian.reduce((a, r) => a + (Number(r.nilai) || 0), 0);
  return { rincian, total, batasMerah };
}

export function zonaDurasi(nilai, def) {
  if (def.batasMerah != null && nilai < def.batasMerah) return 'merah';
  if (nilai < def.total) return 'kuning';
  return 'hijau';
}

// Pola hari latihan aerobik: jeda tidak lebih dari 2 hari berturut-turut (termasuk pergantian minggu).
const POLA_HARI = { 3: [0, 2, 4], 4: [0, 1, 3, 5], 5: [0, 1, 3, 4, 5], 6: [0, 1, 2, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6] };

export function jedaTerpanjang(hari) {
  const set = new Set(hari);
  let maks = 0;
  for (let mulai = 0; mulai < 7; mulai++) {
    if (set.has(mulai)) continue;
    let n = 0;
    while (n < 7 && !set.has((mulai + n) % 7)) n++;
    maks = Math.max(maks, n);
  }
  return maks;
}

function bulat5(x) { return Math.max(5, Math.ceil(x / 5) * 5); }

export function intensitasAerobik(profil) {
  const m = modeIntensitas(profil);
  if (m.mode === 'HR') {
    const z = zonaKarvonen(Number(profil.hrMax), Number(profil.hrIstirahat), 0.40, 0.60);
    return { mode: 'HR', teks: `Sedang: ${z.bawah}–${z.atas} kali/menit (40–<60% HRR, Karvonen)`, label: BUKTI, sumber: ['garber2011'], alasan: m.alasan };
  }
  return { mode: 'RPE', teks: 'Sedang: RPE 12–13 dari skala 6–20 (masih bisa bicara kalimat pendek)', label: BUKTI, sumber: ['garber2011'], alasan: m.alasan };
}

export function programDM2(profil, durasi, p) {
  const target = 150;
  const hariN = Math.min(7, Math.max(3, Number(p.dm2HariAerobik) || 5));
  const hari = POLA_HARI[hariN];
  const awal = Math.min(100, Math.max(10, Number(p.dm2VolumeAwalPersen) || 50)) / 100;
  const capai = Math.max(1, Number(p.dm2MingguCapaiTarget) || 6);
  const intens = intensitasAerobik(profil);
  const hipo = adaEfek(profil, 'hipoglikemia');
  const panas = true;
  const minggu = [];
  for (let w = 1; w <= durasi; w++) {
    const fraksi = capai <= 1 || w >= capai ? 1 : awal + (1 - awal) * (w - 1) / (capai - 1);
    const perSesi = bulat5((target * fraksi) / hari.length);
    const total = perSesi * hari.length;
    const catatan = [];
    if (hipo) {
      catatan.push({ teks: 'Pengguna insulin atau sekretagog: cek glukosa sebelum dan sesudah latihan, bawa karbohidrat cepat.', label: BUKTI, sumber: ['kanaley2022'] });
      catatan.push({ teks: 'Waspadai hipoglikemia tertunda: sensitivitas insulin dapat meningkat hingga 2–72 jam sesudah latihan.', label: BUKTI, sumber: ['kanaley2022'] });
      catatan.push({ teks: 'Ambang glukosa sebelum latihan: menunggu sumber (pedoman ADA terbaru).', label: 'MENUNGGU', sumber: [] });
    }
    if (panas) {
      catatan.push({ teks: 'Penyandang DM2 lebih rentan deplesi volume dan cedera panas: latih pagi atau sore, cukupi cairan.', label: BUKTI, sumber: ['kanaley2022'] });
    }
    catatan.push({ teks: 'Latihan sesudah makan membantu menurunkan glukosa.', label: BUKTI, sumber: ['kanaley2022'] });
    minggu.push({
      minggu: w,
      aerobik: {
        menitTotal: total,
        menitPerSesi: perSesi,
        hari: hari.map(i => NAMA_HARI[i]),
        targetTercapai: total >= target,
        intensitas: intens,
        label: w >= capai ? BUKTI : PAKAR
      },
      beban: { hari: [NAMA_HARI[0], NAMA_HARI[3]], teks: 'Semua kelompok otot besar, 2 hari tidak berurutan.', label: BUKTI, sumber: ['kanaley2022'] },
      evaluasi: w % 4 === 0,
      catatan
    });
  }
  return {
    ringkas: `Aerobik ${hari.length} hari/minggu, naik bertahap ke ${target} menit/minggu; beban 2 hari/minggu.`,
    aturan: [
      { teks: 'Aerobik intensitas sedang–berat minimal 150 menit/minggu, tersebar ≥3 hari, jeda tidak lebih dari 2 hari berturut-turut.', label: BUKTI, sumber: ['kanaley2022'] },
      { teks: 'Latihan beban semua kelompok otot besar ≥2 hari/minggu.', label: BUKTI, sumber: ['kanaley2022'] },
      { teks: `Progresi: minggu 1 mulai ${Math.round(awal * 100)}% target, mencapai 150 menit di minggu ${capai}.`, label: PAKAR, sumber: [] }
    ],
    minggu
  };
}

export function programACLR(profil, durasi, laporan) {
  const mulai = Math.max(1, (Number(laporan && laporan.mingguPascaop) || 0) + 1);
  const minggu = [];
  for (let w = mulai; w <= durasi; w++) {
    minggu.push({
      minggu: w,
      tumpuan: { teks: 'Tumpuan tanpa batasan, sesuai toleransi, kecuali ada instruksi operator berbeda.', label: BUKTI, sumber: ['aspetar2023'] },
      rom: { teks: 'ROM aktif dan isometrik quadriceps sejak awal pascaoperasi, mengikuti instruksi operator.', label: BUKTI, sumber: ['aspetar2023'] },
      latihan: null,
      akhir: w === durasi
    });
  }
  return {
    ringkas: 'ACL-R tanpa cedera penyerta. Latihan per fase menunggu kartu aturan ACL-R.',
    aturan: [
      { teks: 'ROM dini, tumpuan tanpa batasan, dan isometrik quadriceps dapat dimulai segera pascaoperasi tanpa mengganggu laksitas lutut.', label: BUKTI, sumber: ['aspetar2023'] },
      { teks: 'Untuk olahraga pivoting, laju cedera ulang turun 51% per bulan penundaan RTS hingga 9 bulan.', label: BUKTI, sumber: ['grindem2016'] },
      { teks: 'Syarat RTS: skor >90% sisi sehat pada semua tes kekuatan quadriceps dan fungsi.', label: BUKTI, sumber: ['grindem2016'] }
    ],
    tandaBahaya: ['Nyeri dan bengkak betis (curiga DVT)', 'Demam, luka kemerahan atau bernanah', 'Efusi bertambah dari minggu ke minggu', 'Kehilangan ekstensi penuh'],
    minggu
  };
}

export function buatProgram(kasus, pengaturan) {
  const m = kasus.masalah[0];
  if (m.dx === 'dm2') return programDM2(kasus.profil, m.durasi, pengaturan);
  if (m.dx === 'aclr') return programACLR(kasus.profil, m.durasi, m.laporan);
  return null;
}

export function kodeKasus(prefix, kasusAda) {
  const nomor = kasusAda
    .map(k => k.kode)
    .filter(k => k && k.startsWith(prefix + '-'))
    .map(k => parseInt(k.split('-')[1], 10) || 0);
  const berikut = (nomor.length ? Math.max(...nomor) : 0) + 1;
  return `${prefix}-${String(berikut).padStart(4, '0')}`;
}
