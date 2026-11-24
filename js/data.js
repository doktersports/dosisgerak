// Data statis DosisGerak. Semua aturan berstatus DRAF sampai ditinjau dr. Yudha.

export const VERSI = '1.0.0-pratinjau.1';

// 14 regio. sisi: false = struktur garis tengah (tanpa pilihan kanan/kiri).
export const REGIO = [
  { id: 'collum', nama: 'Leher', latin: 'Collum', sisi: false },
  { id: 'humeri', nama: 'Bahu', latin: 'Articulatio humeri', sisi: true },
  { id: 'brachium', nama: 'Lengan Atas', latin: 'Brachium', sisi: true },
  { id: 'cubitus', nama: 'Siku', latin: 'Cubitus', sisi: true },
  { id: 'antebrachium', nama: 'Lengan Bawah', latin: 'Antebrachium', sisi: true },
  { id: 'carpus', nama: 'Pergelangan Tangan', latin: 'Carpus', sisi: true },
  { id: 'manus', nama: 'Tangan', latin: 'Manus', sisi: true },
  { id: 'lumbalis', nama: 'Punggung Bawah', latin: 'Regio lumbalis', sisi: false },
  { id: 'coxa', nama: 'Panggul', latin: 'Coxa', sisi: true },
  { id: 'femur', nama: 'Paha', latin: 'Femur', sisi: true },
  { id: 'genu', nama: 'Lutut', latin: 'Genu', sisi: true },
  { id: 'crus', nama: 'Tungkai Bawah', latin: 'Crus', sisi: true },
  { id: 'talocruralis', nama: 'Pergelangan Kaki', latin: 'Articulatio talocruralis', sisi: true },
  { id: 'pes', nama: 'Tumit & Kaki', latin: 'Calx · Pes', sisi: true }
];

// Katalog diagnosis 1.x. tersedia: true hanya untuk yang sudah dibangun di versi ini.
export const DIAGNOSIS = [
  { id: 'aclr', nama: 'ACL-R', panjang: 'Rekonstruksi ACL', kelompok: 'Genu Pascaoperasi', versi: '1.0.0', tersedia: true, regio: ['genu'], kode: 'KG' },
  { id: 'dm2', nama: 'DM2 & Prediabetes', panjang: 'Diabetes Melitus Tipe 2 dan Prediabetes', kelompok: 'Diabetes Melitus', versi: '1.0.0', tersedia: true, regio: null, kode: 'MB' },
  { id: 'meniskus', nama: 'Meniskus: APM · Repair', panjang: 'Menisektomi parsial dan meniscus repair', kelompok: 'Genu Pascaoperasi', versi: '1.1.0', tersedia: false, regio: ['genu'] },
  { id: 'aclr-meniskus', nama: 'ACL-R + Meniskus', panjang: 'ACL-R dengan APM atau meniscus repair', kelompok: 'Genu Pascaoperasi', versi: '1.1.0', tersedia: false, regio: ['genu'] },
  { id: 'ht', nama: 'Hipertensi', panjang: 'Hipertensi', kelompok: 'Kardiometabolik', versi: '1.2.0', tersedia: false, regio: null },
  { id: 'obesitas', nama: 'Obesitas', panjang: 'Obesitas', kelompok: 'Kardiometabolik', versi: '1.2.0', tersedia: false, regio: null },
  { id: 'dm1', nama: 'DM1', panjang: 'Diabetes Melitus Tipe 1', kelompok: 'Diabetes Melitus', versi: '1.2.0', tersedia: false, regio: null },
  { id: 'oa', nama: 'OA Lutut & Panggul', panjang: 'Osteoartritis lutut dan panggul', kelompok: 'Muskuloskeletal', versi: '1.3.0', tersedia: false, regio: ['genu', 'coxa'] },
  { id: 'achilles', nama: 'Tendo Achilles', panjang: 'Tendinopati dan ruptur tendo Achilles', kelompok: 'Muskuloskeletal', versi: '1.4.0', tersedia: false, regio: ['crus', 'talocruralis', 'pes'] },
  { id: 'remaja', nama: 'Remaja Tumbuh', panjang: 'Apofisitis, nyeri tumbuh, beban saat lonjakan pertumbuhan', kelompok: 'Remaja', versi: '1.5.0', tersedia: false, regio: ['genu', 'coxa', 'femur', 'cubitus', 'pes'] }
];

// Kelas obat. efek dipakai mesin aturan. Dampak tiap baris masih DRAF:
// akan diverifikasi ke lampiran obat ACSM GETP edisi 12.
export const OBAT = [
  { id: 'betablocker', nama: 'β-blocker', contoh: 'bisoprolol, propranolol, carvedilol, atenolol', dampak: 'HR tumpul, target memakai RPE. Propranolol dapat menutupi gejala hipoglikemia.', efek: { hrTidakValid: true } },
  { id: 'ccb-nondhp', nama: 'CCB Non-DHP', contoh: 'diltiazem, verapamil', dampak: 'HR turun, target memakai RPE.', efek: { hrTidakValid: true } },
  { id: 'ccb-dhp', nama: 'CCB DHP', contoh: 'amlodipine, nifedipine', dampak: 'Hipotensi pascalatihan; pendinginan lebih panjang.', efek: { hipotensiPasca: true } },
  { id: 'acei-arb', nama: 'ACEi / ARB', contoh: 'captopril, ramipril, candesartan, valsartan, telmisartan', dampak: 'Hipotensi pascalatihan.', efek: { hipotensiPasca: true } },
  { id: 'diuretik', nama: 'Diuretik', contoh: 'HCT, furosemide, spironolactone', dampak: 'Dehidrasi, gangguan elektrolit, risiko panas.', efek: { dehidrasi: true } },
  { id: 'alfablocker', nama: 'α-blocker', contoh: 'doxazosin, prazosin', dampak: 'Hipotensi ortostatik.', efek: { hipotensiPasca: true } },
  { id: 'antiaritmia', nama: 'Antiaritmia / Penurun HR', contoh: 'amiodarone, digoxin, ivabradine', dampak: 'HR tidak valid, target memakai RPE.', efek: { hrTidakValid: true } },
  { id: 'insulin', nama: 'Insulin', contoh: 'glargine, aspart, dll.', dampak: 'Risiko hipoglikemia saat dan sesudah latihan.', efek: { hipoglikemia: true } },
  { id: 'sekretagog', nama: 'Sekretagog Insulin', contoh: 'glimepiride, gliclazide, glibenclamide', dampak: 'Risiko hipoglikemia saat dan sesudah latihan.', efek: { hipoglikemia: true } },
  { id: 'antidm-lain', nama: 'Antidiabetik Lain', contoh: 'metformin, sitagliptin, vildagliptin, acarbose, pioglitazone', dampak: 'Risiko hipoglikemia rendah bila dipakai tunggal. Pioglitazone: retensi cairan.', efek: {} },
  { id: 'sglt2i', nama: 'SGLT2i', contoh: 'dapagliflozin, empagliflozin', dampak: 'Dehidrasi; risiko ketoasidosis euglikemik.', efek: { dehidrasi: true } },
  { id: 'glp1', nama: 'GLP-1 RA / Tirzepatide', contoh: 'liraglutide, semaglutide, tirzepatide', dampak: 'Massa otot ikut turun; latihan beban diprioritaskan.', efek: { prioritasBeban: true } },
  { id: 'statin', nama: 'Statin', contoh: 'atorvastatin, simvastatin, rosuvastatin', dampak: 'Pantau nyeri otot.', efek: {} },
  { id: 'antikoagulan', nama: 'Antikoagulan / Antiplatelet', contoh: 'rivaroxaban, enoxaparin, warfarin, aspirin, clopidogrel', dampak: 'Risiko perdarahan; hindari kontak dan benturan.', efek: { perdarahan: true } },
  { id: 'oains', nama: 'OAINS', contoh: 'ibuprofen, diklofenak, meloxicam, celecoxib', dampak: 'Menutupi nyeri; dapat menaikkan TD.', efek: {} },
  { id: 'fluorokuinolon', nama: 'Fluorokuinolon', contoh: 'ciprofloxacin, levofloxacin', dampak: 'Risiko tendinopati dan ruptur tendon.', efek: { tendon: true } },
  { id: 'lain', nama: 'Lain-lain', contoh: 'salbutamol, kortikosteroid sistemik, amitriptilin, levotiroksin', dampak: 'Takikardia, hiperglikemia, atau hipotensi ortostatik tergantung obat.', efek: {} }
];

// Besaran PAKAR: ditetapkan dr. Yudha di Pengaturan. Nilai 0 = belum ditetapkan.
export const PENGATURAN_AWAL = {
  aclrDasarNonPivoting: 36,   // minggu; PAKAR (belum ada batas bukti untuk target non-pivoting)
  faktorImt30: 0,             // minggu tambahan bila IMT >= 30
  faktorSedenter: 0,          // minggu tambahan bila tidak aktif sebelum cedera
  faktorUsia40: 0,            // minggu tambahan bila usia >= 40 tahun
  dm2Durasi: 12,              // minggu; PAKAR
  dm2HariAerobik: 5,          // hari/minggu; minimum 3 menurut ACSM 2022
  dm2VolumeAwalPersen: 50,    // % dari 150 menit pada minggu 1; PAKAR
  dm2MingguCapaiTarget: 6     // minggu saat 150 menit tercapai; PAKAR
};

export const NAMA_HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
