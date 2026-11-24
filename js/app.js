import { VERSI, REGIO, DIAGNOSIS, OBAT } from './data.js';
import { SUMBER, LABEL_STATUS } from './sumber.js';
import * as E from './engine.js';
import * as S from './store.js';

const app = document.getElementById('app');
let data = S.muat();
let draf = muatDraf();
let konfirmasi = null;
let pilihanMinggu = {};
let idUnik = 0;

/* ---------- Utilitas ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ik = (d, size = 20, sw = 1.9) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const IKON = {
  pulse: '<path d="M3 13h4l2-5 4 10 2-5h6"></path>',
  cek: '<path d="M5 12.5l4.5 4.5L19 7"></path>',
  awas: '<path d="M12 4L21.5 20H2.5Z"></path><path d="M12 10v4.5M12 17.2v0.1"></path>',
  silang: '<path d="M7 7l10 10M17 7L7 17"></path>',
  info: '<circle cx="12" cy="12" r="9"></circle><path d="M12 11v5.5M12 7.8v0.1"></path>',
  kembali: '<path d="M15 5l-7 7 7 7"></path>',
  lanjut: '<path d="M5 12h14M13 6l6 6-6 6"></path>',
  cari: '<circle cx="11" cy="11" r="6.5"></circle><path d="M20 20l-4.2-4.2"></path>',
  tubuh: '<circle cx="12" cy="4.5" r="2.2"></circle><path d="M7 9h10M12 9v6M12 15l-3 6M12 15l3 6"></path>',
  daftar: '<path d="M8 6h12M8 12h12M8 18h12"></path><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle>',
  rumah: '<path d="M4 10.5L12 4l8 6.5V20h-5.5v-5.5h-5V20H4z"></path>',
  kasus: '<rect x="5" y="4" width="14" height="17" rx="3"></rect><path d="M9 4V2.8h6V4M9 10h6M9 14h6M9 18h3"></path>',
  tambah: '<path d="M12 5v14M5 12h14"></path>',
  buku: '<path d="M5 4.5h5.5a2.5 2.5 0 0 1 2.5 2.5v13a2 2 0 0 0-2-2H5z"></path><path d="M19 4.5h-5.5A2.5 2.5 0 0 0 11 7v13a2 2 0 0 1 2-2h6z"></path>',
  gir: '<circle cx="12" cy="12" r="3"></circle><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"></path>',
  unduh: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5"></path><path d="M5 19h14"></path>',
  genu: '<path d="M9 2.5v7.5M15 2.5v7.5"></path><circle cx="12" cy="12.5" r="3.2"></circle><path d="M10 15.5l-1 6M14 15.5l1 6"></path>',
  achilles: '<path d="M10 2.5v12.5c0 2 1 3.5 3 4.5l6 1.5c1.2.3 2-.6 1.6-1.6-.5-1.3-1.8-2-3.6-2.4"></path><path d="M10 15c-2.5 0-4 1.6-4 4v1.5h4"></path>',
  oa: '<circle cx="8" cy="8" r="3.5"></circle><circle cx="16" cy="16" r="3.5"></circle><path d="M10.5 10.5l3 3"></path><path d="M3 21l2.5-2.5M21 3l-2.5 2.5"></path>',
  remaja: '<path d="M6 21V3M6 6h3M6 10h2M6 14h3M6 18h2"></path><path d="M16 20V7M12.5 10.5L16 7l3.5 3.5"></path>',
  ht: '<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"></path><path d="M7 12h2.5l1.5-2.5 2 4.5 1.5-2h2.5"></path>',
  dm: '<path d="M12 3.5s-6 6.6-6 10.8a6 6 0 0 0 12 0C18 10.1 12 3.5 12 3.5z"></path><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"></path>',
  obes: '<rect x="3.5" y="4" width="17" height="16" rx="4"></rect><path d="M8.5 10a3.5 3.5 0 0 1 7 0"></path><path d="M12 10l1.5-1.8"></path>',
  peta: '<path d="M4 6.5l5-2.5 6 2.5 5-2.5v13.5l-5 2.5-6-2.5-5 2.5z"></path><path d="M9 4v13.5M15 6.5V20"></path>'
};
const chip = (kelas, ikon, teks) => `<span class="chip ${kelas}">${ikon ? ik(IKON[ikon], 13, 2.5) : ''}${esc(teks)}</span>`;
const pita = (kelas, ikon, isi) => `<div class="pita ${kelas}">${ik(IKON[ikon], 16, 2.4)}<span>${isi}</span></div>`;
const KELAS_STATUS = { merah: ['r', 'silang'], kuning: ['y', 'awas'], hijau: ['g', 'cek'], info: ['s', 'info'] };

function muatDraf() {
  try { return JSON.parse(sessionStorage.getItem('dosisgerak-draf')) || drafBaru(); } catch (e) { return drafBaru(); }
}
function drafBaru() {
  return {
    tampilan: 'depan', regio: null, sisi: 'D', dx: null,
    profil: { obat: [], tanpaObat: false, aritmia: false, pacu: false, aktivitas: 'aktif', target: 'pivoting' },
    laporan: { mingguPascaop: 0, graft: '', tambahan: [] },
    durasi: null, durasiDx: null, alasanMerah: '', akuiMerah: false
  };
}
const simpanDraf = () => sessionStorage.setItem('dosisgerak-draf', JSON.stringify(draf));
const simpanData = () => S.simpan(data);
const dxInfo = id => DIAGNOSIS.find(d => d.id === id);
const regioInfo = id => REGIO.find(r => r.id === id);
const namaSisi = s => ({ D: 'Kanan', S: 'Kiri', B: 'Bilateral' }[s] || '');
const latinSisi = (r, s) => {
  if (!r) return '';
  const info = regioInfo(r);
  if (!info.sisi || s === 'B') return info.latin + (s === 'B' && info.sisi ? ' (bilateral)' : '');
  const netral = ['Genu', 'Femur', 'Brachium', 'Antebrachium'];
  const kata = netral.includes(info.latin) ? (s === 'D' ? 'dextrum' : 'sinistrum') : (s === 'D' ? 'dextra' : 'sinistra');
  return `${info.latin} ${kata}`;
};

function mingguKini(k) {
  const m = k.masalah[0];
  const hari = Math.floor((Date.now() - new Date(k.mulai).getTime()) / 86400000);
  return Math.min(m.durasi, Math.max(m.mingguAwal, m.mingguAwal + Math.floor(hari / 7)));
}

/* ---------- Sumber dan aturan ---------- */
function blokSumber(r) {
  if (r.label === 'PAKAR' && (!r.sumber || !r.sumber.length)) {
    return '<p>Besaran ditetapkan klinisi. Ubah di Pengaturan.</p>';
  }
  if (!r.sumber || !r.sumber.length) return '<p>Belum ada sumber terverifikasi untuk aturan ini.</p>';
  return r.sumber.map(k => {
    const s = SUMBER[k];
    if (!s) return '';
    const st = s.status === 'terverifikasi' ? chip('g', 'cek', LABEL_STATUS[s.status]) : chip('y', 'awas', LABEL_STATUS[s.status]);
    const doi = s.doi ? `<a href="https://doi.org/${esc(s.doi)}" target="_blank" rel="noopener">doi:${esc(s.doi)}</a>` : '';
    return `<div>${st}<p style="margin-top:4px">${esc(s.vancouver)}</p>${doi}</div>`;
  }).join('');
}
function barisAturan(r, ekstra = '') {
  const id = 'sb' + (++idUnik);
  return `<div><div class="aturan"><span class="teks">${esc(r.teks)}</span>${ekstra}<button type="button" class="tag ${esc(r.label)}" data-act="sumber" data-target="${id}" aria-expanded="false">${esc(r.label)}</button></div><div class="sumber-isi" id="${id}" hidden>${blokSumber(r)}</div></div>`;
}

/* ---------- Kerangka halaman ---------- */
function kepala(judul, sub, kembali, tahap, subHtml) {
  const bar = tahap ? `<div class="tahap">${[1, 2, 3].map(i => `<div class="${i <= tahap ? 'aktif' : ''}"></div>`).join('')}</div>` : '';
  return `<header class="top"><div class="baris"><a class="bulat" href="${kembali}" aria-label="Kembali">${ik(IKON.kembali)}</a><div class="isi"><p class="muted kecil">${subHtml || esc(sub)}</p><h1 style="font-size:22px">${esc(judul)}</h1></div></div>${bar}</header>`;
}
function nav(aktif) {
  const item = (href, ikon, teks, id) => `<a href="${href}" ${aktif === id ? 'aria-current="page"' : ''}>${ik(IKON[ikon], 22)}${teks}</a>`;
  return `<nav class="nav no-print" aria-label="Navigasi utama">${item('#/', 'rumah', 'Beranda', 'beranda')}${item('#/kasus', 'kasus', 'Kasus', 'kasus')}<a href="#/baru/anatomi" class="fab" aria-label="Resep baru">${ik(IKON.tambah, 26, 2.2)}</a>${item('#/pustaka', 'buku', 'Pustaka', 'pustaka')}${item('#/pengaturan', 'gir', 'Pengaturan', 'pengaturan')}</nav>`;
}
const bannerPratinjau = () => `<div class="bagian">${pita('y', 'awas', '<b>Versi Pratinjau ' + esc(VERSI.split('-')[0]) + ' · Aturan Belum Ditinjau.</b> Jangan dipakai untuk keputusan pasien sampai kartu aturan disetujui dokter.')}</div>`;

/* ---------- Beranda ---------- */
const UBIN = [
  { nama: 'Genu Pascaoperasi', sub: 'ACL-R · Meniskus', ikon: 'genu', dx: ['aclr', 'meniskus', 'aclr-meniskus'] },
  { nama: '<i>Tendo Achilles</i>', sub: 'Tendinopati · Ruptur', ikon: 'achilles', dx: ['achilles'] },
  { nama: 'OA Lutut &amp; Panggul', sub: '<i>Genu</i> · <i>Coxa</i>', ikon: 'oa', dx: ['oa'], html: true },
  { nama: 'Remaja Tumbuh', sub: 'Apofisitis · Nyeri Tumbuh', ikon: 'remaja', dx: ['remaja'] },
  { nama: 'Hipertensi', sub: 'Gerbang TD Adaptif', ikon: 'ht', dx: ['ht'] },
  { nama: 'Diabetes Melitus', sub: 'DM1 · DM2 · Prediabetes', ikon: 'dm', dx: ['dm2', 'dm1'] },
  { nama: 'Obesitas', sub: 'Progresi Volume Mingguan', ikon: 'obes', dx: ['obesitas'] }
];
function ubinHtml(filter) {
  const f = (filter || '').toLowerCase().trim();
  const cocok = UBIN.filter(u => !f || (u.nama + ' ' + u.sub + ' ' + u.dx.map(d => dxInfo(d).nama + ' ' + dxInfo(d).panjang).join(' ')).toLowerCase().includes(f));
  const isi = cocok.map(u => {
    const ada = u.dx.some(d => dxInfo(d).tersedia);
    const versi = u.dx.map(d => dxInfo(d).versi).sort()[0];
    const status = ada ? chip('s', null, 'Tersedia') : chip('n', null, 'Versi ' + versi);
    return `<a class="ubin" href="#/baru/diagnosis"><span class="ikon">${ik(IKON[u.ikon])}</span><span style="display:flex;flex-direction:column;gap:2px"><span class="nama">${u.nama}</span><span class="sub">${u.html ? u.sub : esc(u.sub)}</span></span>${status}</a>`;
  }).join('');
  const peta = !f ? `<a class="ubin putus" href="#/versi"><span class="ikon" style="background:#EEF2F7;color:var(--ink2)">${ik(IKON.peta)}</span><span style="display:flex;flex-direction:column;gap:2px"><span class="nama">Peta Versi</span><span class="sub">Rencana 1.x–4.x</span></span></a>` : '';
  return isi + peta || '<p class="muted">Tidak ada diagnosis yang cocok.</p>';
}
function kartuKasus(k) {
  const m = k.masalah[0];
  const d = dxInfo(m.dx);
  const w = mingguKini(k);
  const merah = (k.gerbang || []).some(g => g.status === 'merah');
  const st = merah ? chip('r', 'silang', 'Ada Gerbang Merah') : (m.zona === 'merah' ? chip('r', 'silang', 'Durasi di Bawah Batas Bukti') : chip('g', 'cek', 'Program Aktif'));
  const lokasi = m.regio ? ` · <i>${esc(latinSisi(m.regio, m.sisi))}</i>` : '';
  const persen = Math.round(((w - m.mingguAwal + 1) / (m.durasi - m.mingguAwal + 1)) * 100);
  return `<a class="kartu" href="#/kasus/${esc(k.id)}" style="text-decoration:none;color:inherit"><div class="baris"><span class="kode">${esc(k.kode)}</span><span class="isi"></span>${st}</div><p class="tebal" style="font-size:15.5px">${esc(d.nama)}${lokasi}</p><p class="muted kecil">Minggu ${w} dari ${m.durasi}</p><div class="progres"><div style="width:${Math.max(4, persen)}%"></div></div></a>`;
}
function halamanBeranda() {
  const siap = navigator.serviceWorker && navigator.serviceWorker.controller;
  const tgl = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const kasus = [...data.kasus].sort((a, b) => b.dibuat.localeCompare(a.dibuat)).slice(0, 3);
  const perluCadangan = data.kasus.length && (!data.cadanganTerakhir || Date.now() - new Date(data.cadanganTerakhir).getTime() > 7 * 86400000);
  const hariCadangan = data.cadanganTerakhir ? Math.floor((Date.now() - new Date(data.cadanganTerakhir).getTime()) / 86400000) : null;
  return `
  <header class="top">
    <div class="baris">
      <div class="logo">${ik(IKON.pulse, 22, 2.2).replace('currentColor', '#0E1B3D')}</div>
      <span class="merek">Dosis<span>Gerak</span></span>
      <span class="isi"></span>
      ${siap ? chip('g', 'cek', 'Siap Tanpa Sinyal') : chip('y', 'awas', 'Menyiapkan Offline')}
    </div>
    <div style="display:flex;flex-direction:column;gap:4px">
      <p class="muted" style="font-size:13px">${esc(tgl)}</p>
      <h1 style="font-size:30px">Halo Dokter!</h1>
      <p class="muted" style="font-size:12px">made by @dokter.sports</p>
    </div>
    <div class="cari">${ik(IKON.cari, 20)}<label for="cari" class="sr">Cari</label><input id="cari" type="search" placeholder="Cari Diagnosis, Prosedur, atau Obat" autocomplete="off"></div>
  </header>
  ${bannerPratinjau()}
  <section class="bagian"><div class="kartu-utama">
    <div style="display:flex;flex-direction:column;gap:6px"><h2 style="font-size:20px">Mulai Resep Baru</h2><p>Pilih lewat anatomi atau langsung diagnosis. Profil TD, HR, dan obat pasien dipakai otomatis.</p></div>
    <div class="dua"><a class="btn putih" href="#/baru/anatomi">${ik(IKON.tubuh, 18)}Pilih Anatomi</a><a class="btn garis" href="#/baru/diagnosis">${ik(IKON.daftar, 18)}Pilih Diagnosis</a></div>
  </div></section>
  <section class="bagian">
    <div class="kepala-bagian"><h2>Kasus Dipantau</h2><span class="sela"></span>${data.kasus.length ? '<a class="tautan" href="#/kasus">Lihat Semua</a>' : ''}</div>
    ${kasus.length ? kasus.map(kartuKasus).join('') : '<div class="kartu"><p class="muted">Belum ada kasus. Mulai dari Resep Baru.</p></div>'}
  </section>
  ${perluCadangan ? `<section class="bagian"><div class="kartu-kuning"><div class="isi"><p class="tebal">${hariCadangan === null ? 'Belum Pernah Dicadangkan' : `Cadangan Terakhir ${hariCadangan} Hari Lalu`}</p><p class="kecil">Ekspor berkas cadangan agar data kasus aman saat ganti HP.</p></div><button type="button" class="btn-kecil" data-act="ekspor">Ekspor</button></div></section>` : ''}
  <section class="bagian">
    <div class="kepala-bagian"><h2>Diagnosis</h2>${chip('n', null, 'Versi 1.x')}<span class="sela"></span><a class="tautan" href="#/versi">Peta Versi</a></div>
    <div class="grid2" id="ubin">${ubinHtml('')}</div>
  </section>
  <p class="kaki">DosisGerak ${esc(VERSI)} · 100% Offline · Data Hanya Tersimpan di HP Ini</p>
  ${nav('beranda')}`;
}

/* ---------- Pemilih anatomi ---------- */
const BENTUK = [
  ['collum', 'M', 'rect', { x: 92, y: 53, width: 16, height: 16, rx: 5 }],
  ['humeri', 'L', 'circle', { cx: 52, cy: 80, r: 11 }], ['humeri', 'R', 'circle', { cx: 148, cy: 80, r: 11 }],
  ['brachium', 'L', 'rect', { x: 38, y: 92, width: 20, height: 58, rx: 10 }], ['brachium', 'R', 'rect', { x: 142, y: 92, width: 20, height: 58, rx: 10 }],
  ['cubitus', 'L', 'ellipse', { cx: 47, cy: 158, rx: 11, ry: 8 }], ['cubitus', 'R', 'ellipse', { cx: 153, cy: 158, rx: 11, ry: 8 }],
  ['antebrachium', 'L', 'rect', { x: 37, y: 168, width: 18, height: 54, rx: 9 }], ['antebrachium', 'R', 'rect', { x: 145, y: 168, width: 18, height: 54, rx: 9 }],
  ['carpus', 'L', 'ellipse', { cx: 46, cy: 228, rx: 9, ry: 5 }], ['carpus', 'R', 'ellipse', { cx: 154, cy: 228, rx: 9, ry: 5 }],
  ['manus', 'L', 'ellipse', { cx: 46, cy: 244, rx: 10, ry: 11 }], ['manus', 'R', 'ellipse', { cx: 154, cy: 244, rx: 10, ry: 11 }],
  ['coxa', 'L', 'ellipse', { cx: 82, cy: 202, rx: 15, ry: 9 }], ['coxa', 'R', 'ellipse', { cx: 118, cy: 202, rx: 15, ry: 9 }],
  ['femur', 'L', 'rect', { x: 68, y: 212, width: 28, height: 66, rx: 13 }], ['femur', 'R', 'rect', { x: 104, y: 212, width: 28, height: 66, rx: 13 }],
  ['genu', 'L', 'ellipse', { cx: 82, cy: 290, rx: 15, ry: 12 }], ['genu', 'R', 'ellipse', { cx: 118, cy: 290, rx: 15, ry: 12 }],
  ['crus', 'L', 'rect', { x: 71, y: 303, width: 22, height: 48, rx: 10 }], ['crus', 'R', 'rect', { x: 107, y: 303, width: 22, height: 48, rx: 10 }],
  ['talocruralis', 'L', 'ellipse', { cx: 82, cy: 357, rx: 10, ry: 5 }], ['talocruralis', 'R', 'ellipse', { cx: 118, cy: 357, rx: 10, ry: 5 }],
  ['pes', 'L', 'ellipse', { cx: 80, cy: 370, rx: 14, ry: 7 }], ['pes', 'R', 'ellipse', { cx: 120, cy: 370, rx: 14, ry: 7 }]
];
// Tampak depan: kiri layar = kanan pasien. Tampak belakang: kiri layar = kiri pasien.
const sisiPasien = (tampilan, sisiLayar) => sisiLayar === 'M' ? 'M' : (tampilan === 'depan' ? (sisiLayar === 'L' ? 'D' : 'S') : (sisiLayar === 'L' ? 'S' : 'D'));
function svgTubuh() {
  const t = draf.tampilan;
  const bentuk = [...BENTUK];
  if (t === 'belakang') bentuk.push(['lumbalis', 'M', 'rect', { x: 74, y: 150, width: 52, height: 36, rx: 10 }]);
  const el = bentuk.map(([regio, sl, tag, at]) => {
    const sp = sisiPasien(t, sl);
    const terpilih = draf.regio === regio && (sp === 'M' || draf.sisi === 'B' || draf.sisi === sp);
    const attr = Object.entries(at).map(([k, v]) => `${k}="${v}"`).join(' ');
    const isi = terpilih ? 'fill="#38BDF8" stroke="#0284C7" stroke-width="2"' : 'fill="#EEF5FA" stroke="#A9BCCD" stroke-width="1.5"';
    return `<${tag} ${attr} ${isi} data-regio="${regio}" data-sisi="${sp}"><title>${esc(regioInfo(regio).nama)}</title></${tag}>`;
  }).join('');
  return `<svg role="img" aria-label="Gambar tubuh tampak ${t}" width="200" height="380" viewBox="0 0 200 385">
    <g fill="#EEF5FA" stroke="#A9BCCD" stroke-width="1.5"><circle cx="100" cy="34" r="22"></circle><path d="M62 72 Q100 62 138 72 L142 120 Q136 150 132 172 L134 198 L66 198 L68 172 Q64 150 58 120 Z"></path></g>${el}</svg>`;
}
function halamanAnatomi() {
  const r = draf.regio ? regioInfo(draf.regio) : null;
  const kiri = draf.tampilan === 'depan' ? 'D · Kanan Pasien' : 'S · Kiri Pasien';
  const kanan = draf.tampilan === 'depan' ? 'S · Kiri Pasien' : 'D · Kanan Pasien';
  const daftarDx = r ? DIAGNOSIS.filter(d => d.regio && d.regio.includes(r.id)) : [];
  const protokol = r ? `<section class="kartu besar"><h3>Protokol untuk <i>${esc(latinSisi(r.id, draf.sisi))}</i></h3>
    ${daftarDx.length ? daftarDx.map(d => d.tersedia
      ? `<div class="baris"><span class="isi tebal">${esc(d.nama)}</span><button type="button" class="btn primer" style="height:40px;font-size:14px" data-act="pilih-dx" data-dx="${d.id}">Pilih</button></div>`
      : `<div class="baris"><span class="isi">${esc(d.nama)}</span>${chip('n', null, 'Versi ' + d.versi)}</div>`).join('') : '<p class="muted">Belum ada protokol untuk regio ini.</p>'}
    ${daftarDx.some(d => d.id === 'remaja') ? pita('s', 'info', 'Usia &lt;18 th membuka gerbang remaja: nyeri paha atau lutut wajib menyingkirkan SCFE lebih dulu.') : ''}
  </section>` : '<div class="kartu"><p class="muted">Ketuk regio pada gambar atau pilih dari daftar.</p></div>';
  return `${kepala('Pilih Anatomi', 'Langkah 1 dari 3 · Resep Baru', '#/', 1)}
  <main class="bagian">
    <div class="saklar" role="group" aria-label="Tampilan tubuh"><button type="button" data-act="tampilan" data-val="depan" aria-pressed="${draf.tampilan === 'depan'}">Depan</button><button type="button" data-act="tampilan" data-val="belakang" aria-pressed="${draf.tampilan === 'belakang'}">Belakang</button></div>
    <div class="tubuh"><div class="sisi-label"><span>${kiri}</span><span>${kanan}</span></div>${svgTubuh()}<p class="tebal" style="font-size:13.5px">${r ? `Terpilih: ${esc(r.nama)}${r.sisi ? ' ' + namaSisi(draf.sisi) : ''} · <i>${esc(latinSisi(r.id, draf.sisi))}</i>` : 'Belum ada regio terpilih'}</p></div>
    <div class="isian"><span class="label">Sisi</span><div class="seg k3" role="group" aria-label="Sisi tubuh">
      ${['D', 'S', 'B'].map(s => `<button type="button" data-act="sisi" data-val="${s}" aria-pressed="${draf.sisi === s}" ${r && !r.sisi ? 'disabled' : ''}>${s === 'B' ? 'Bilateral' : namaSisi(s) + ' (' + s + ')'}</button>`).join('')}
    </div></div>
    <div class="isian"><span class="label">Regio</span><div class="grid2">
      ${REGIO.map(x => `<button type="button" class="regio" data-act="regio" data-val="${x.id}" aria-pressed="${draf.regio === x.id}"><span class="nama">${esc(x.nama)}</span><i>${esc(x.latin)}</i></button>`).join('')}
    </div></div>
    ${protokol}
    <a class="tautan" href="#/baru/diagnosis" style="text-align:center;padding:8px">Pilih Lewat Daftar Diagnosis</a>
  </main>${nav('')}`;
}

/* ---------- Daftar diagnosis ---------- */
function halamanDiagnosis() {
  const kelompok = [...new Set(DIAGNOSIS.map(d => d.kelompok))];
  return `${kepala('Pilih Diagnosis', 'Langkah 1 dari 3 · Resep Baru', '#/', 1)}
  <main class="bagian">
    ${kelompok.map(g => `<section class="kartu besar"><h3>${esc(g)}</h3>${DIAGNOSIS.filter(d => d.kelompok === g).map(d => `<div class="baris"><div class="isi"><p class="tebal">${esc(d.nama)}</p><p class="muted kecil">${esc(d.panjang)}</p></div>${d.tersedia ? `<button type="button" class="btn primer" style="height:40px;font-size:14px" data-act="pilih-dx" data-dx="${d.id}">Pilih</button>` : chip('n', null, 'Versi ' + d.versi)}</div>`).join('')}</section>`).join('')}
  </main>${nav('')}`;
}

/* ---------- Profil pasien ---------- */
function isianAngka(kunci, label, satuan, bantuan = '') {
  const [a, b] = kunci.split('.');
  const nilai = draf[a][b] ?? '';
  return `<div class="isian"><label for="f-${b}">${esc(label)}${satuan ? ` (${esc(satuan)})` : ''}</label><input id="f-${b}" type="number" inputmode="decimal" data-f="${kunci}" value="${esc(nilai)}">${bantuan ? `<span class="bantuan">${esc(bantuan)}</span>` : ''}</div>`;
}
function segPilihan(kunci, opsi, label) {
  const [a, b] = kunci.split('.');
  return `<div class="isian"><span class="label">${esc(label)}</span><div class="seg k${opsi.length}" role="group" aria-label="${esc(label)}">${opsi.map(([v, t]) => `<button type="button" data-act="set" data-f="${kunci}" data-val="${v}" aria-pressed="${draf[a][b] === v}">${esc(t)}</button>`).join('')}</div></div>`;
}
function halamanProfil() {
  if (!draf.dx) { location.hash = '#/baru/diagnosis'; return ''; }
  const d = dxInfo(draf.dx);
  const p = draf.profil;
  const nilaiImt = E.imt(Number(p.bb), Number(p.tb));
  const prefix = d.kode;
  const lokasi = draf.regio ? ` · <i>${esc(latinSisi(draf.regio, draf.sisi))}</i>` : '';
  const aclr = draf.dx === 'aclr';
  const tambahan = [['meniskus-repair', 'Meniscus Repair'], ['apm', 'APM (Menisektomi Parsial)'], ['kartilago', 'Prosedur Kartilago'], ['ligamen-lain', 'Rekonstruksi Ligamen Lain']];
  return `${kepala('Profil Pasien', 'Langkah 2 dari 3 · ' + d.nama, d.regio ? '#/baru/anatomi' : '#/baru/diagnosis', 2)}
  <main class="bagian">
    <div class="kartu"><p class="tebal" style="font-size:15.5px">${esc(d.nama)}${lokasi}</p><p class="muted kecil">Kode otomatis: ${esc(E.kodeKasus(prefix, data.kasus))}. Jangan isi nama, nomor rekam medis, atau tanggal lahir.</p></div>
    <section class="kartu besar"><h3>Data Dasar</h3><div class="grid-isian">${isianAngka('profil.usia', 'Usia', 'th')}${isianAngka('profil.bb', 'BB', 'kg')}${isianAngka('profil.tb', 'TB', 'cm')}<div class="isian"><span class="label">IMT</span><p id="imt" style="height:46px;display:flex;align-items:center;font-weight:700">${nilaiImt ?? '–'}</p></div></div></section>
    <section class="kartu besar"><h3>Tanda Vital</h3><div class="grid-isian">${isianAngka('profil.tdS', 'TD Sistolik', 'mmHg')}${isianAngka('profil.tdD', 'TD Diastolik', 'mmHg')}${isianAngka('profil.hrIstirahat', 'HR Istirahat', 'kali/menit')}${isianAngka('profil.hrMax', 'HRmax', 'kali/menit', 'Opsional: dari uji latih atau SakuSKO')}</div>
      <label class="centang"><input type="checkbox" data-cek="profil.aritmia" ${p.aritmia ? 'checked' : ''}><span><span class="nama">Aritmia</span><br><span class="sub">HR tidak dipakai; target memakai RPE.</span></span></label>
      <label class="centang"><input type="checkbox" data-cek="profil.pacu" ${p.pacu ? 'checked' : ''}><span><span class="nama">Alat Pacu Jantung</span><br><span class="sub">HR tidak dipakai; target memakai RPE.</span></span></label>
    </section>
    <section class="kartu besar"><h3>Obat Rutin</h3><div class="daftar-centang">
      <label class="centang"><input type="checkbox" data-tanpa-obat ${p.tanpaObat ? 'checked' : ''}><span><span class="nama">Tidak Mengonsumsi Obat Rutin</span><br><span class="sub">Kalibrasi standar; zona HR berlaku bila HRmax diisi.</span></span></label>
      ${OBAT.map(o => `<label class="centang"><input type="checkbox" data-obat="${o.id}" ${p.obat.includes(o.id) ? 'checked' : ''}><span><span class="nama">${esc(o.nama)}</span><br><span class="sub">${esc(o.contoh)}</span></span></label>`).join('')}
    </div></section>
    <section class="kartu besar"><h3>Aktivitas</h3>
      ${segPilihan('profil.aktivitas', [['atlet', 'Atlet'], ['aktif', 'Aktif'], ['sedenter', 'Sedenter']], aclr ? 'Tingkat Aktivitas Sebelum Cedera' : 'Tingkat Aktivitas Saat Ini')}
      ${aclr ? segPilihan('profil.target', [['harian', 'Aktivitas Harian'], ['rekreasi', 'Olahraga Non-Pivoting'], ['pivoting', 'Olahraga Pivoting']], 'Target Aktivitas') : ''}
    </section>
    ${aclr ? `<section class="kartu besar"><h3>Laporan Operasi</h3>
      <div class="grid-isian">${isianAngka('laporan.mingguPascaop', 'Minggu Pascaoperasi', 'saat ini')}<div class="isian"><label for="f-graft">Jenis Graft</label><select id="f-graft" data-f="laporan.graft">${[['', 'Tidak Tercatat'], ['hamstring', 'Hamstring'], ['bptb', 'BPTB'], ['quadriceps', 'Quadriceps'], ['lain', 'Lainnya']].map(([v, t]) => `<option value="${v}" ${draf.laporan.graft === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div></div>
      <span class="label">Prosedur Tambahan</span><div class="daftar-centang">${tambahan.map(([v, t]) => `<label class="centang"><input type="checkbox" data-tambahan="${v}" ${draf.laporan.tambahan.includes(v) ? 'checked' : ''}><span class="nama">${t}</span></label>`).join('')}</div>
    </section>` : ''}
    <a class="btn primer" href="#/baru/durasi">Lanjut: Durasi Program ${ik(IKON.lanjut, 18, 2.2)}</a>
  </main>${nav('')}`;
}

/* ---------- Durasi ---------- */
function rentang(dx) { return dx === 'dm2' ? [4, 52] : [1, 60]; }
function halamanDurasi() {
  if (!draf.dx) { location.hash = '#/baru/diagnosis'; return ''; }
  const d = dxInfo(draf.dx);
  const p = draf.profil;
  const def = E.defaultDurasi(draf.dx, p, data.pengaturan);
  if (draf.durasi == null || draf.durasiDx !== draf.dx) { draf.durasi = def.total; draf.durasiDx = draf.dx; simpanDraf(); }
  const [min, max] = rentang(draf.dx);
  const pct = v => ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * 100;
  const batas = def.batasMerah;
  const wMerah = batas != null ? pct(batas) : 0;
  const wKuning = Math.max(0, pct(def.total) - wMerah);
  const gerbang = E.gerbangProfil(draf.dx, p, draf.dx === 'aclr' ? draf.laporan : null);
  const mode = E.modeIntensitas(p);
  const nilaiImt = E.imt(Number(p.bb), Number(p.tb));
  const penanda = `${batas != null ? `<i class="batas" style="left:${pct(batas)}%"></i>` : ''}${batas !== def.total ? `<i style="left:${pct(def.total)}%"></i>` : ''}`;
  const legenda = batas != null && batas === def.total
    ? `<span><i class="batas"></i>Default = Batas Bukti ${batas} Minggu</span>`
    : `${batas != null ? `<span><i class="batas"></i>Batas Bukti ${batas} Minggu</span>` : ''}<span><i></i>Default ${def.total} Minggu</span>`;
  const adaMerah = gerbang.some(g => g.status === 'merah');
  return `${kepala('Atur Durasi Program', 'Langkah 3 dari 3 · ' + d.nama, '#/baru/profil', 3)}
  <main class="bagian">
    <div class="kartu"><p class="tebal" style="font-size:15.5px">${esc(d.nama)}${draf.regio ? ` · <i>${esc(latinSisi(draf.regio, draf.sisi))}</i>` : ''}</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${p.usia ? chip('n', null, p.usia + ' th') : ''}${nilaiImt ? chip('n', null, 'IMT ' + String(nilaiImt).replace('.', ',')) : ''}${chip('n', null, 'Target ' + mode.mode)}${draf.dx === 'aclr' ? chip('n', null, { harian: 'Aktivitas Harian', rekreasi: 'Non-Pivoting', pivoting: 'Pivoting' }[p.target]) : ''}</div>
      <p class="muted kecil">${esc(mode.alasan.join(' '))}</p></div>
    ${gerbang.map(g => pita(KELAS_STATUS[g.status][0], KELAS_STATUS[g.status][1], esc(g.teks))).join('')}
    <section class="kartu besar"><h3>Rincian Default</h3>
      ${def.rincian.map((r, i) => barisAturan(r.belumDitetapkan ? { ...r, teks: r.teks + ' (Besaran Belum Ditetapkan)' } : r, `<span class="nilai-rincian">${r.belumDitetapkan ? '–' : (i === 0 ? r.nilai : (r.nilai >= 0 ? '+' : '') + r.nilai)}</span>`)).join('')}
      <div style="height:1px;background:var(--line)"></div>
      <div class="baris tebal"><span class="isi">Default</span><span>${def.total} Minggu</span></div>
      <p class="muted kecil">BUKTI = dari sumber. PAKAR = besaran ditetapkan klinisi, dapat diubah di Pengaturan. Ketuk label untuk melihat sumber.</p>
    </section>
    <section class="kartu besar">
      <div class="baris" style="align-items:baseline"><h3 class="isi">Durasi Program</h3><span class="angka-besar" id="nilai-durasi">${draf.durasi}</span><span class="muted">Minggu</span></div>
      <div class="lintasan"><div class="warna" aria-hidden="true"><div style="width:${wMerah}%;background:#D64545"></div><div style="width:${wKuning}%;background:#E8B10E"></div><div style="flex:1;background:#2B9A57"></div></div>
        <div class="penanda" aria-hidden="true">${penanda}</div><label for="durasi" class="sr">Durasi program dalam minggu</label><input id="durasi" type="range" min="${min}" max="${max}" step="1" value="${draf.durasi}"></div>
      <div class="ujung-slider" aria-hidden="true"><span>${min}</span><span>${max}</span></div>
      <div class="legenda-slider">${legenda}</div>
      <div id="status-durasi"></div>
      <div id="kotak-alasan" hidden><div class="isian"><label for="alasan">Alasan Klinis (Wajib)</label><textarea id="alasan" rows="3" placeholder="Contoh: pasien hanya kembali ke aktivitas harian">${esc(draf.alasanMerah)}</textarea></div></div>
      ${batas != null ? `<p class="muted kecil">Batas bukti: laju cedera ulang turun 51% per bulan penundaan RTS hingga 9 bulan (Grindem 2016).</p>` : '<p class="muted kecil">Belum ada batas bukti untuk target ini, sehingga tidak ada zona merah.</p>'}
    </section>
    ${draf.dx === 'aclr' ? `<section class="kartu besar"><h3>Tumpuan · Instruksi Operator</h3>${barisAturan({ teks: 'ACL-R tanpa cedera penyerta: ROM dini, tumpuan tanpa batasan, dan isometrik quadriceps sejak awal pascaoperasi. Instruksi operator selalu didahulukan.', label: 'BUKTI', sumber: ['aspetar2023'] })}</section>` : ''}
    ${adaMerah ? `<label class="centang"><input type="checkbox" id="akui" ${draf.akuiMerah ? 'checked' : ''}><span><span class="nama">Saya Sudah Menilai Gerbang Merah di Atas</span><br><span class="sub">Program tetap dibuat; status merah tercatat di kasus.</span></span></label>` : ''}
    <button type="button" class="btn primer" id="buat" data-act="buat">Buat Program</button>
  </main>${nav('')}`;
}
function perbaruiDurasi() {
  const el = document.getElementById('durasi');
  if (!el) return;
  const def = E.defaultDurasi(draf.dx, draf.profil, data.pengaturan);
  const zona = E.zonaDurasi(draf.durasi, def);
  document.getElementById('nilai-durasi').textContent = draf.durasi;
  const teks = {
    merah: 'Merah · Di Bawah Batas Bukti. Alasan klinis wajib diisi dan ikut tercetak di program.',
    kuning: 'Kuning · Lebih Cepat dari Default' + (def.batasMerah != null ? ', Masih di Atas Batas Bukti' : ''),
    hijau: 'Hijau · Sesuai Default atau Lebih Lama'
  }[zona];
  const [k, i] = KELAS_STATUS[zona];
  document.getElementById('status-durasi').innerHTML = pita(k, i, esc(teks));
  document.getElementById('kotak-alasan').hidden = zona !== 'merah';
  const gerbangMerah = E.gerbangProfil(draf.dx, draf.profil, draf.dx === 'aclr' ? draf.laporan : null).some(g => g.status === 'merah');
  const boleh = (zona !== 'merah' || draf.alasanMerah.trim().length > 0) && (!gerbangMerah || draf.akuiMerah);
  const btn = document.getElementById('buat');
  btn.textContent = `Buat Program ${draf.durasi} Minggu`;
  btn.disabled = !boleh;
}
function buatKasus() {
  const d = dxInfo(draf.dx);
  const def = E.defaultDurasi(draf.dx, draf.profil, data.pengaturan);
  const id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
  const laporan = draf.dx === 'aclr' ? { ...draf.laporan } : null;
  const kasus = {
    id,
    kode: E.kodeKasus(d.kode, data.kasus),
    dibuat: new Date().toISOString(),
    mulai: new Date().toISOString().slice(0, 10),
    versiAplikasi: VERSI,
    profil: JSON.parse(JSON.stringify(draf.profil)),
    gerbang: E.gerbangProfil(draf.dx, draf.profil, laporan),
    masalah: [{
      dx: draf.dx, regio: draf.regio, sisi: draf.sisi, durasi: draf.durasi,
      defaultDurasi: def.total, rincian: def.rincian, batasMerah: def.batasMerah,
      zona: E.zonaDurasi(draf.durasi, def), alasanMerah: draf.alasanMerah,
      laporan, mingguAwal: draf.dx === 'aclr' ? Math.max(1, (Number(draf.laporan.mingguPascaop) || 0) + 1) : 1
    }]
  };
  data.kasus.push(kasus);
  simpanData();
  draf = drafBaru();
  simpanDraf();
  location.hash = '#/kasus/' + id;
}

/* ---------- Kasus ---------- */
function halamanDaftarKasus() {
  const kasus = [...data.kasus].sort((a, b) => b.dibuat.localeCompare(a.dibuat));
  return `${kepala('Kasus', `${kasus.length} kasus tersimpan di HP ini`, '#/', 0)}
  <main class="bagian">${kasus.length ? kasus.map(kartuKasus).join('') : '<div class="kartu"><p class="muted">Belum ada kasus.</p></div>'}</main>${nav('kasus')}`;
}
function kartuMingguDM2(w) {
  return `<section class="kartu besar"><h3>Minggu ${w.minggu}${w.evaluasi ? ' · ' : ''}${w.evaluasi ? chip('s', 'info', 'Evaluasi') : ''}</h3>
    <p class="label">Aerobik</p>
    ${barisAturan({ teks: `${w.aerobik.menitPerSesi} menit × ${w.aerobik.hari.length} hari = ${w.aerobik.menitTotal} menit (${w.aerobik.hari.join(', ')})`, label: w.aerobik.label, sumber: w.aerobik.label === 'BUKTI' ? ['kanaley2022'] : [] })}
    ${barisAturan({ teks: w.aerobik.intensitas.teks, label: w.aerobik.intensitas.label, sumber: w.aerobik.intensitas.sumber })}
    <p class="label">Latihan Beban</p>
    ${barisAturan({ teks: `${w.beban.hari.join(' dan ')}: ${w.beban.teks}`, label: w.beban.label, sumber: w.beban.sumber })}
    <p class="label">Keamanan</p>
    ${w.catatan.map(c => barisAturan(c)).join('')}
  </section>`;
}
function kartuMingguACLR(w, prog, k) {
  return `<section class="kartu besar"><h3>Minggu ${w.minggu} Pascaoperasi</h3>
    ${barisAturan(w.tumpuan)}${barisAturan(w.rom)}
    ${pita('y', 'awas', 'Fase dan latihan mingguan menunggu kartu aturan ACL-R yang sedang diriset.')}
    ${w.akhir ? `<p class="label">Syarat Return to Sport</p>${barisAturan(prog.aturan[2])}${k.masalah[0].batasMerah ? barisAturan(prog.aturan[1]) : ''}` : ''}
  </section>
  <section class="kartu besar"><h3>Tanda Bahaya</h3>${prog.tandaBahaya.map(t => barisAturan({ teks: t, label: 'MENUNGGU', sumber: [] })).join('')}</section>`;
}
function halamanKasus(id) {
  const k = data.kasus.find(x => x.id === id);
  if (!k) return `${kepala('Kasus Tidak Ditemukan', '', '#/kasus', 0)}<main class="bagian"><div class="kartu"><p>Kasus ini tidak ada di HP ini.</p></div></main>${nav('kasus')}`;
  const m = k.masalah[0];
  const d = dxInfo(m.dx);
  const prog = E.buatProgram(k, data.pengaturan);
  const kini = mingguKini(k);
  const pilih = pilihanMinggu[k.id] ?? kini;
  const w = prog.minggu.find(x => x.minggu === pilih) || prog.minggu[0];
  const mode = E.modeIntensitas(k.profil);
  const [zk, zi] = KELAS_STATUS[m.zona];
  const obat = E.catatanObat(k.profil);
  const hapusSiap = konfirmasi === 'hapus-' + k.id;
  return `${kepala(k.kode, '', '#/kasus', 0, esc(d.nama) + (m.regio ? ' · <i>' + esc(latinSisi(m.regio, m.sisi)) + '</i>' : ''))}
  ${bannerPratinjau()}
  <main class="bagian">
    <div style="display:flex;flex-wrap:wrap;gap:6px">${chip(zk, zi, { merah: 'Durasi Merah', kuning: 'Durasi Kuning', hijau: 'Durasi Hijau' }[m.zona])}${chip('n', null, `${m.durasi} Minggu`)}${chip('n', null, 'Target ' + mode.mode)}</div>
    ${(k.gerbang || []).map(g => pita(KELAS_STATUS[g.status][0], KELAS_STATUS[g.status][1], esc(g.teks))).join('')}
    ${m.zona === 'merah' ? pita('r', 'silang', 'Alasan durasi di bawah batas bukti: ' + esc(m.alasanMerah)) : ''}
    <section class="kartu besar"><h3>Ringkasan Program</h3><p class="muted kecil">${esc(prog.ringkas)}</p>${prog.aturan.map(r => barisAturan(r)).join('')}</section>
    <div><p class="label" style="margin-bottom:8px">Pilih Minggu</p><div class="minggu-pilih">${prog.minggu.map(x => `<button type="button" data-act="minggu" data-kasus="${k.id}" data-val="${x.minggu}" aria-pressed="${x.minggu === w.minggu}" class="${x.minggu === kini ? 'kini' : ''}" aria-label="Minggu ${x.minggu}${x.minggu === kini ? ', minggu ini' : ''}">${x.minggu}</button>`).join('')}</div></div>
    ${m.dx === 'dm2' ? kartuMingguDM2(w) : kartuMingguACLR(w, prog, k)}
    ${obat.length ? `<section class="kartu besar"><h3>Catatan Obat</h3>${obat.map(o => barisAturan({ teks: `${o.nama}: ${o.teks}`, label: 'DRAF', sumber: o.sumber })).join('')}</section>` : ''}
    <div class="dua no-print"><a class="btn tipis" href="#/kasus/${esc(k.id)}/pasien">Lembar Pasien</a><button type="button" class="btn bahaya" data-act="hapus-kasus" data-kasus="${esc(k.id)}">${hapusSiap ? 'Ketuk Lagi untuk Hapus' : 'Hapus Kasus'}</button></div>
  </main>${nav('kasus')}`;
}
function halamanLembarPasien(id) {
  const k = data.kasus.find(x => x.id === id);
  if (!k) { location.hash = '#/kasus'; return ''; }
  const m = k.masalah[0];
  const prog = E.buatProgram(k, data.pengaturan);
  const kini = mingguKini(k);
  const w = prog.minggu.find(x => x.minggu === (pilihanMinggu[k.id] ?? kini)) || prog.minggu[0];
  let isi = '';
  if (m.dx === 'dm2') {
    const intens = w.aerobik.intensitas.mode === 'HR' ? w.aerobik.intensitas.teks.replace('Sedang: ', 'Denyut nadi ').replace(/ \(.*\)/, '') : 'Napas lebih cepat, tetapi masih bisa bicara kalimat pendek.';
    const hipo = E.adaEfek(k.profil, 'hipoglikemia');
    isi = `<ul>
      <li><b>Jalan cepat atau sepeda statis ${w.aerobik.menitPerSesi} menit</b> pada hari ${w.aerobik.hari.join(', ')}.</li>
      <li>Kekuatan latihan: ${esc(intens)}</li>
      <li><b>Latihan otot</b> pada hari ${w.beban.hari.join(' dan ')}, untuk otot lengan, dada, punggung, perut, dan kaki.</li>
      <li>Usahakan latihan sesudah makan.</li>
      ${hipo ? '<li><b>Cek gula darah sebelum dan sesudah latihan.</b> Selalu bawa permen atau minuman manis.</li><li>Gula darah bisa turun sampai malam hari sesudah latihan. Waspadai gemetar, keringat dingin, atau lemas.</li>' : ''}
      <li>Minum air yang cukup. Hindari latihan di siang yang terik.</li>
    </ul>`;
  } else {
    isi = `<ul><li>Gerakkan lutut sejak awal dan latih otot paha depan sesuai arahan dokter.</li><li>Boleh menapak sesuai kenyamanan, kecuali dokter bedah memberi aturan lain.</li><li>Program latihan rinci per minggu akan ditambahkan dokter.</li></ul>
      <p class="tebal">Segera hubungi dokter bila:</p><ul>${prog.tandaBahaya.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
  }
  return `<div class="no-print">${kepala('Lembar Pasien', k.kode, '#/kasus/' + k.id, 0)}</div>
  <article class="lembar">
    <span class="watermark">PRATINJAU · Belum Ditinjau Dokter</span>
    <h1 style="font-size:24px">Program Latihan Anda</h1>
    <p class="muted">${esc(k.kode)} · Minggu ${w.minggu} dari ${m.durasi}</p>
    ${isi}
    <p class="tebal">Berhenti dan hubungi dokter bila muncul nyeri dada, pusing berat, atau sesak yang tidak wajar.</p>
    <p class="muted kecil">Dibuat dengan DosisGerak · made by @dokter.sports</p>
  </article>
  <div class="bagian no-print"><button type="button" class="btn primer" data-act="cetak">Cetak / Simpan PDF</button></div>
  ${nav('kasus')}`;
}

/* ---------- Pustaka, versi, pengaturan ---------- */
function halamanPustaka() {
  return `${kepala('Pustaka', 'Sumber yang dipakai aturan versi ini', '#/', 0)}
  <main class="bagian">
    ${pita('s', 'info', 'Tautan DOI butuh sinyal. Teks rujukan tetap tampil tanpa sinyal.')}
    ${Object.entries(SUMBER).map(([k, s]) => `<section class="kartu"><div class="baris"><p class="tebal isi">${esc(s.singkat)}</p>${s.status === 'terverifikasi' ? chip('g', 'cek', LABEL_STATUS[s.status]) : chip('y', 'awas', LABEL_STATUS[s.status])}</div><p class="kecil">${esc(s.vancouver)}</p>${s.doi ? `<a class="kecil" href="https://doi.org/${esc(s.doi)}" target="_blank" rel="noopener">doi:${esc(s.doi)}</a>` : ''}<p class="muted kecil">${esc(s.jenis)}</p></section>`).join('')}
  </main>${nav('pustaka')}`;
}
function halamanVersi() {
  const grup = {};
  DIAGNOSIS.forEach(d => { (grup[d.versi] = grup[d.versi] || []).push(d); });
  return `${kepala('Peta Versi', 'Isi 1.x dan rencana sesudahnya', '#/', 0)}
  <main class="bagian">
    ${Object.keys(grup).sort().map(v => `<section class="kartu"><div class="baris"><p class="tebal isi">Versi ${v}</p>${grup[v].some(d => d.tersedia) ? chip('s', null, 'Tersedia') : chip('n', null, 'Rencana')}</div><p class="kecil">${grup[v].map(d => esc(d.nama)).join(' · ')}</p></section>`).join('')}
    <section class="kartu"><p class="tebal">2.x · Multi-Diagnosis dan Multi-Regio</p><p class="kecil muted">Satu kasus memuat beberapa diagnosis dan regio; aturan paling ketat menang.</p></section>
    <section class="kartu"><p class="tebal">3.x · Populasi Khusus</p><p class="kecil muted">Gerbang trimester kehamilan dan risiko jatuh.</p></section>
    <section class="kartu"><p class="tebal">4.x · Kardio-Renal-Onkologi</p><p class="kecil muted">Resep dari hasil uji latih.</p></section>
  </main>${nav('')}`;
}
const LABEL_PENGATURAN = [
  ['aclrDasarNonPivoting', 'ACL-R: Dasar Target Non-Pivoting', 'minggu'],
  ['faktorImt30', 'ACL-R: Tambahan bila IMT ≥30', 'minggu'],
  ['faktorSedenter', 'ACL-R: Tambahan bila Sedenter', 'minggu'],
  ['faktorUsia40', 'ACL-R: Tambahan bila Usia ≥40', 'minggu'],
  ['dm2Durasi', 'DM2: Durasi Default', 'minggu'],
  ['dm2HariAerobik', 'DM2: Hari Aerobik per Minggu (3–7)', 'hari'],
  ['dm2VolumeAwalPersen', 'DM2: Volume Minggu 1', '% dari 150 menit'],
  ['dm2MingguCapaiTarget', 'DM2: Minggu Mencapai 150 Menit', 'minggu']
];
function halamanPengaturan() {
  return `${kepala('Pengaturan', 'Besaran PAKAR, cadangan, dan data', '#/', 0)}
  <main class="bagian">
    <section class="kartu besar"><h3>Besaran PAKAR</h3><p class="muted kecil">Nilai ini ditetapkan klinisi dan tampil berlabel PAKAR di setiap program. Nilai 0 berarti belum ditetapkan.</p>
      <div class="grid-isian">${LABEL_PENGATURAN.map(([k, l, s]) => `<div class="isian"><label for="p-${k}">${esc(l)} (${esc(s)})</label><input id="p-${k}" type="number" inputmode="numeric" data-p="${k}" value="${esc(data.pengaturan[k])}"></div>`).join('')}</div>
    </section>
    <section class="kartu besar"><h3>Penyimpanan</h3><p class="kecil" id="status-simpan">Memeriksa…</p><button type="button" class="btn tipis" data-act="permanen">Minta Penyimpanan Permanen</button></section>
    <section class="kartu besar"><h3>Cadangan</h3><p class="muted kecil">${data.cadanganTerakhir ? 'Ekspor terakhir: ' + esc(new Date(data.cadanganTerakhir).toLocaleDateString('id-ID')) : 'Belum pernah diekspor.'}</p>
      <div class="dua"><button type="button" class="btn primer" data-act="ekspor">${ik(IKON.unduh, 18)}Ekspor</button><label class="btn tipis" for="impor">Impor</label></div>
      <input id="impor" type="file" accept="application/json,.json" hidden>
      <div id="pesan-impor"></div>
    </section>
    <section class="kartu besar"><h3>Data</h3><button type="button" class="btn bahaya" data-act="hapus-semua">${konfirmasi === 'hapus-semua' ? 'Ketuk Lagi untuk Menghapus Semua Data' : 'Hapus Semua Data'}</button></section>
    <section class="kartu"><p class="tebal">DosisGerak ${esc(VERSI)}</p><p class="muted kecil">100% offline. Data hanya tersimpan di HP ini.</p><p class="muted kecil">made by @dokter.sports</p></section>
  </main>${nav('pengaturan')}`;
}

/* ---------- Router ---------- */
function render() {
  idUnik = 0;
  const h = location.hash.replace(/^#/, '') || '/';
  const bagian = h.split('/').filter(Boolean);
  let html;
  if (h === '/') html = halamanBeranda();
  else if (bagian[0] === 'baru' && bagian[1] === 'anatomi') html = halamanAnatomi();
  else if (bagian[0] === 'baru' && bagian[1] === 'diagnosis') html = halamanDiagnosis();
  else if (bagian[0] === 'baru' && bagian[1] === 'profil') html = halamanProfil();
  else if (bagian[0] === 'baru' && bagian[1] === 'durasi') html = halamanDurasi();
  else if (bagian[0] === 'kasus' && bagian[1] && bagian[2] === 'pasien') html = halamanLembarPasien(bagian[1]);
  else if (bagian[0] === 'kasus' && bagian[1]) html = halamanKasus(bagian[1]);
  else if (bagian[0] === 'kasus') html = halamanDaftarKasus();
  else if (bagian[0] === 'pustaka') html = halamanPustaka();
  else if (bagian[0] === 'versi') html = halamanVersi();
  else if (bagian[0] === 'pengaturan') html = halamanPengaturan();
  else html = halamanBeranda();
  if (!html) return;
  app.innerHTML = html;
  if (bagian[1] === 'durasi') perbaruiDurasi();
  if (bagian[0] === 'pengaturan') S.statusPenyimpanan().then(tampilStatusSimpan);
}
function tampilStatusSimpan(st) {
  const el = document.getElementById('status-simpan');
  if (!el) return;
  el.textContent = { permanen: 'Permanen: Chrome tidak akan menghapus data ini otomatis.', sementara: 'Sementara: Chrome bisa menghapus data bila ruang penyimpanan penuh. Ekspor cadangan secara rutin.', 'tidak-didukung': 'Browser ini tidak melaporkan status penyimpanan.' }[st];
}

/* ---------- Interaksi ---------- */
function setNilai(kunci, nilai) {
  const [a, b] = kunci.split('.');
  draf[a][b] = nilai;
  simpanDraf();
}
app.addEventListener('click', e => {
  const t = e.target.closest('[data-act],[data-regio]');
  if (!t) return;
  if (t.dataset.regio && !t.dataset.act) {
    draf.regio = t.dataset.regio;
    const sp = t.dataset.sisi;
    if (sp !== 'M' && draf.sisi !== 'B') draf.sisi = sp;
    simpanDraf(); render(); return;
  }
  const act = t.dataset.act;
  if (act !== 'hapus-kasus' && act !== 'hapus-semua') konfirmasi = null;
  switch (act) {
    case 'sumber': {
      const box = document.getElementById(t.dataset.target);
      box.hidden = !box.hidden;
      t.setAttribute('aria-expanded', String(!box.hidden));
      break;
    }
    case 'tampilan': draf.tampilan = t.dataset.val; simpanDraf(); render(); break;
    case 'sisi': draf.sisi = t.dataset.val; simpanDraf(); render(); break;
    case 'regio': draf.regio = t.dataset.val; simpanDraf(); render(); break;
    case 'pilih-dx': {
      const d = dxInfo(t.dataset.dx);
      if (draf.dx !== d.id) { draf.durasi = null; }
      draf.dx = d.id;
      if (d.regio && !d.regio.includes(draf.regio)) { draf.regio = d.regio[0]; simpanDraf(); location.hash = '#/baru/anatomi'; break; }
      if (!d.regio) draf.regio = null;
      simpanDraf(); location.hash = '#/baru/profil'; break;
    }
    case 'set': setNilai(t.dataset.f, t.dataset.val); draf.durasi = null; render(); break;
    case 'buat': buatKasus(); break;
    case 'minggu': pilihanMinggu[t.dataset.kasus] = Number(t.dataset.val); render(); break;
    case 'hapus-kasus': {
      const id = t.dataset.kasus;
      if (konfirmasi === 'hapus-' + id) {
        data.kasus = data.kasus.filter(k => k.id !== id); simpanData(); konfirmasi = null; location.hash = '#/kasus';
      } else { konfirmasi = 'hapus-' + id; render(); }
      break;
    }
    case 'hapus-semua':
      if (konfirmasi === 'hapus-semua') { localStorage.removeItem('dosisgerak-v1'); data = S.muat(); konfirmasi = null; location.hash = '#/'; render(); }
      else { konfirmasi = 'hapus-semua'; render(); }
      break;
    case 'ekspor':
      S.eksporBerkas(data); data.cadanganTerakhir = new Date().toISOString(); simpanData(); render(); break;
    case 'permanen': S.mintaPenyimpananPermanen().then(tampilStatusSimpan); break;
    case 'cetak': window.print(); break;
  }
});
app.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'cari') { document.getElementById('ubin').innerHTML = ubinHtml(t.value); return; }
  if (t.id === 'durasi') { draf.durasi = Number(t.value); simpanDraf(); perbaruiDurasi(); return; }
  if (t.id === 'alasan') { draf.alasanMerah = t.value; simpanDraf(); perbaruiDurasi(); return; }
  if (t.dataset.f) {
    const angka = t.type === 'number';
    setNilai(t.dataset.f, angka ? (t.value === '' ? '' : Number(t.value)) : t.value);
    draf.durasi = null; simpanDraf();
    if (t.dataset.f === 'profil.bb' || t.dataset.f === 'profil.tb') {
      const v = E.imt(Number(draf.profil.bb), Number(draf.profil.tb));
      document.getElementById('imt').textContent = v ? String(v).replace('.', ',') : '–';
    }
    return;
  }
  if (t.dataset.p) {
    data.pengaturan[t.dataset.p] = t.value === '' ? 0 : Number(t.value);
    simpanData();
  }
});
app.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'akui') { draf.akuiMerah = t.checked; simpanDraf(); perbaruiDurasi(); return; }
  if (t.dataset.cek) { setNilai(t.dataset.cek, t.checked); return; }
  if (t.hasAttribute('data-tanpa-obat')) {
    draf.profil.tanpaObat = t.checked;
    if (t.checked) { draf.profil.obat = []; app.querySelectorAll('[data-obat]').forEach(x => { x.checked = false; }); }
    simpanDraf(); return;
  }
  if (t.dataset.obat) {
    const id = t.dataset.obat;
    draf.profil.obat = t.checked ? [...new Set([...draf.profil.obat, id])] : draf.profil.obat.filter(x => x !== id);
    if (t.checked) { draf.profil.tanpaObat = false; const tanpa = app.querySelector('[data-tanpa-obat]'); if (tanpa) tanpa.checked = false; }
    simpanDraf(); return;
  }
  if (t.dataset.tambahan) {
    const v = t.dataset.tambahan;
    draf.laporan.tambahan = t.checked ? [...new Set([...draf.laporan.tambahan, v])] : draf.laporan.tambahan.filter(x => x !== v);
    simpanDraf(); return;
  }
  if (t.dataset.f && t.tagName === 'SELECT') { setNilai(t.dataset.f, t.value); return; }
  if (t.id === 'impor' && t.files && t.files[0]) {
    t.files[0].text().then(teks => {
      try {
        const baru = S.bacaBerkasImpor(teks);
        data = { ...S.muat(), ...baru };
        simpanData();
        document.getElementById('pesan-impor').innerHTML = pita('g', 'cek', `Impor berhasil: ${data.kasus.length} kasus.`);
      } catch (err) {
        document.getElementById('pesan-impor').innerHTML = pita('r', 'silang', esc(err.message));
      }
    });
  }
});

window.addEventListener('hashchange', () => { konfirmasi = null; render(); window.scrollTo(0, 0); });

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(() => {
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!location.hash || location.hash === '#/') render(); });
  }).catch(() => {});
}
render();
