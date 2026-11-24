// Uji mesin aturan: node tests/engine.test.mjs
import assert from 'node:assert/strict';
import { zonaKarvonen, modeIntensitas, gerbangProfil, defaultDurasi, zonaDurasi, programDM2, programACLR, jedaTerpanjang, imt, kodeKasus } from '../js/engine.js';
import { PENGATURAN_AWAL } from '../js/data.js';

let lulus = 0;
function uji(nama, fn) { fn(); lulus++; console.log('  ok  ' + nama); }

uji('IMT 80 kg / 170 cm = 27,7', () => assert.equal(imt(80, 170), 27.7));

uji('Karvonen kontinu: HRmax 181, istirahat 40, sedang lalu berat tanpa celah', () => {
  const sedang = zonaKarvonen(181, 40, 0.40, 0.60);
  const berat = zonaKarvonen(181, 40, 0.60, 0.90);
  assert.deepEqual(sedang, { bawah: 97, atas: 124 });
  assert.equal(berat.bawah, sedang.atas + 1);
});

uji('Beta-blocker memaksa mode RPE', () => {
  const m = modeIntensitas({ obat: ['betablocker'], hrMax: 180, hrIstirahat: 60 });
  assert.equal(m.mode, 'RPE');
});

uji('Aritmia memaksa mode RPE', () => assert.equal(modeIntensitas({ aritmia: true, hrMax: 180, hrIstirahat: 60 }).mode, 'RPE'));
uji('Tanpa HRmax memakai RPE', () => assert.equal(modeIntensitas({ obat: [] }).mode, 'RPE'));
uji('HR lengkap tanpa obat memakai HR', () => assert.equal(modeIntensitas({ obat: [], hrMax: 180, hrIstirahat: 60 }).mode, 'HR'));

uji('TD 200/90 memicu gerbang merah', () => {
  const g = gerbangProfil('dm2', { tdS: 200, tdD: 90 });
  assert.ok(g.some(x => x.status === 'merah'));
});
uji('TD 160/100 tidak memicu gerbang merah', () => {
  const g = gerbangProfil('dm2', { tdS: 160, tdD: 100 });
  assert.ok(!g.some(x => x.status === 'merah'));
});
uji('Prosedur kartilago pada ACL-R memicu gerbang merah', () => {
  const g = gerbangProfil('aclr', { tdS: 120, tdD: 80 }, { tambahan: ['kartilago'] });
  assert.ok(g.some(x => x.status === 'merah'));
});

uji('ACL-R pivoting: default 36, batas merah 36', () => {
  const d = defaultDurasi('aclr', { target: 'pivoting', bb: 70, tb: 175, usia: 22 }, PENGATURAN_AWAL);
  assert.equal(d.total, 36);
  assert.equal(d.batasMerah, 36);
  assert.equal(zonaDurasi(34, d), 'merah');
  assert.equal(zonaDurasi(36, d), 'hijau');
});

uji('ACL-R: faktor PAKAR ikut dijumlahkan', () => {
  const p = { ...PENGATURAN_AWAL, faktorImt30: 2, faktorUsia40: 2 };
  const d = defaultDurasi('aclr', { target: 'pivoting', bb: 95, tb: 170, usia: 41 }, p);
  assert.equal(d.total, 40);
  assert.equal(zonaDurasi(38, d), 'kuning');
  assert.equal(zonaDurasi(35, d), 'merah');
});

uji('Pola hari 3–7: jeda tidak pernah lebih dari 2 hari', () => {
  for (const n of [3, 4, 5, 6, 7]) {
    const prog = programDM2({ obat: [] }, 1, { ...PENGATURAN_AWAL, dm2HariAerobik: n });
    const idx = prog.minggu[0].aerobik.hari.map(h => ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].indexOf(h));
    assert.ok(jedaTerpanjang(idx) <= 2, `n=${n}`);
  }
});

uji('DM2: mencapai ≥150 menit pada minggu target dan sesudahnya', () => {
  const prog = programDM2({ obat: [] }, 12, PENGATURAN_AWAL);
  prog.minggu.slice(5).forEach(w => assert.ok(w.aerobik.menitTotal >= 150, `minggu ${w.minggu}`));
  assert.ok(prog.minggu[0].aerobik.menitTotal < 150);
});

uji('DM2: pengguna sekretagog mendapat catatan hipoglikemia', () => {
  const prog = programDM2({ obat: ['sekretagog'] }, 4, PENGATURAN_AWAL);
  assert.ok(prog.minggu[0].catatan.some(c => c.teks.includes('hipoglikemia')));
});

uji('ACL-R: program dimulai sesudah minggu pascaoperasi saat ini', () => {
  const prog = programACLR({}, 36, { mingguPascaop: 3 });
  assert.equal(prog.minggu[0].minggu, 4);
  assert.equal(prog.minggu.at(-1).minggu, 36);
});

uji('Kode kasus berurutan per awalan', () => {
  assert.equal(kodeKasus('KG', [{ kode: 'KG-0001' }, { kode: 'MB-0004' }]), 'KG-0002');
});

console.log(`\n${lulus} uji lulus.`);
