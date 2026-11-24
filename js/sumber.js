// Daftar sumber. Setiap aturan di data.js merujuk ke kunci di sini.
// status: 'terverifikasi' = sudah dicek ke halaman sumber;
//         'cek-ulang'     = dikutip dari ingatan, wajib dicek sebelum dipakai untuk pasien;
//         'sekunder'      = dari sumber sekunder, perlu konfirmasi ke sumber primer.

export const SUMBER = {
  grindem2016: {
    singkat: 'Grindem 2016',
    vancouver: 'Grindem H, Snyder-Mackler L, Moksnes H, Engebretsen L, Risberg MA. Simple decision rules can reduce reinjury risk by 84% after ACL reconstruction: the Delaware-Oslo ACL cohort study. Br J Sports Med. 2016;50(13):804-8.',
    doi: '10.1136/bjsports-2016-096031',
    jenis: 'Kohort prospektif',
    status: 'terverifikasi'
  },
  aspetar2023: {
    singkat: 'Aspetar 2023',
    vancouver: 'Kotsifaki R, Korakakis V, King E, Barbosa O, Maree D, Pantouveris M, et al. Aspetar clinical practice guideline on rehabilitation after anterior cruciate ligament reconstruction. Br J Sports Med. 2023;57(9):500-14.',
    doi: '10.1136/bjsports-2022-106158',
    jenis: 'Pedoman praktik klinis',
    status: 'terverifikasi'
  },
  kanaley2022: {
    singkat: 'ACSM 2022 (DM2)',
    vancouver: 'Kanaley JA, Colberg SR, Corcoran MH, Malin SK, Rodriguez NR, Crespo CJ, et al. Exercise/physical activity in individuals with type 2 diabetes: a consensus statement from the American College of Sports Medicine. Med Sci Sports Exerc. 2022;54(2):353-68.',
    doi: '10.1249/MSS.0000000000002800',
    jenis: 'Konsensus',
    status: 'terverifikasi'
  },
  garber2011: {
    singkat: 'Garber 2011 (ACSM)',
    vancouver: 'Garber CE, Blissmer B, Deschenes MR, Franklin BA, Lamonte MJ, Lee IM, et al. Quantity and quality of exercise for developing and maintaining cardiorespiratory, musculoskeletal, and neuromotor fitness in apparently healthy adults: guidance for prescribing exercise. Med Sci Sports Exerc. 2011;43(7):1334-59.',
    doi: '10.1249/MSS.0b013e318213fefb',
    jenis: 'Position stand',
    status: 'cek-ulang'
  },
  nchpad: {
    singkat: 'NCHPAD (hipertensi)',
    vancouver: 'National Center on Health, Physical Activity and Disability. Hypertension [Internet]. NCHPAD; [dikutip 24 Nov 2026]. Tersedia di: https://www.nchpad.org/77/584/Hypertension',
    doi: null,
    jenis: 'Sumber sekunder (merujuk ACSM)',
    status: 'sekunder'
  },
  acsmGetp12: {
    singkat: 'ACSM GETP 12',
    vancouver: "American College of Sports Medicine. ACSM's guidelines for exercise testing and prescription. Edisi 12. Philadelphia: Wolters Kluwer; 2025. ISBN 978-1-9752-1920-8.",
    doi: null,
    jenis: 'Buku pedoman',
    status: 'cek-ulang'
  }
};

export const LABEL_STATUS = {
  'terverifikasi': 'Terverifikasi',
  'cek-ulang': 'Perlu Cek Ulang',
  'sekunder': 'Sumber Sekunder'
};
