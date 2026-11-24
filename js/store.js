// Penyimpanan lokal. Semua data hanya ada di HP ini.
import { PENGATURAN_AWAL, VERSI } from './data.js';

const KUNCI = 'dosisgerak-v1';

function kosong() {
  return { versiData: 1, kasus: [], pengaturan: { ...PENGATURAN_AWAL }, cadanganTerakhir: null };
}

export function muat() {
  try {
    const raw = localStorage.getItem(KUNCI);
    if (!raw) return kosong();
    const d = JSON.parse(raw);
    d.pengaturan = { ...PENGATURAN_AWAL, ...(d.pengaturan || {}) };
    d.kasus = Array.isArray(d.kasus) ? d.kasus : [];
    return d;
  } catch (e) {
    return kosong();
  }
}

export function simpan(d) {
  try {
    localStorage.setItem(KUNCI, JSON.stringify(d));
    return true;
  } catch (e) {
    return false;
  }
}

export async function mintaPenyimpananPermanen() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      if (await navigator.storage.persisted()) return 'permanen';
      return (await navigator.storage.persist()) ? 'permanen' : 'sementara';
    }
  } catch (e) { /* abaikan */ }
  return 'tidak-didukung';
}

export async function statusPenyimpanan() {
  try {
    if (navigator.storage && navigator.storage.persisted) {
      return (await navigator.storage.persisted()) ? 'permanen' : 'sementara';
    }
  } catch (e) { /* abaikan */ }
  return 'tidak-didukung';
}

export function eksporBerkas(d) {
  const isi = { aplikasi: 'DosisGerak', versiAplikasi: VERSI, dibuat: new Date().toISOString(), data: d };
  const blob = new Blob([JSON.stringify(isi, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  const tgl = new Date().toISOString().slice(0, 10);
  a.href = URL.createObjectURL(blob);
  a.download = `dosisgerak-cadangan-${tgl}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

export function bacaBerkasImpor(teks) {
  const isi = JSON.parse(teks);
  if (!isi || isi.aplikasi !== 'DosisGerak' || !isi.data || !Array.isArray(isi.data.kasus)) {
    throw new Error('Berkas ini bukan cadangan DosisGerak.');
  }
  return isi.data;
}
