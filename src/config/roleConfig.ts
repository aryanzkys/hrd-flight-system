import { RoleType } from '../types/models';

export interface RoleMenuConfig {
  label: string;
  description: string;
  badgeColor: string;
  tabs: string[];
}

export const ROLE_ORDER: RoleType[] = [
  'HRD_MANAJER',
  'PENGGUNA',
  'MEMBER_FREQUENT_TRAVELLER',
  'MANAJER_TRAVEL',
  'PENGUNJUNG',
];

export const roleConfig: Record<RoleType, RoleMenuConfig> = {
  HRD_MANAJER: {
    label: 'HRD Manajer',
    description:
      'Mengelola persetujuan pengajuan cuti pegawai, memantau riwayat, serta memverifikasi sisa jatah cuti tahunan.',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    tabs: ['Daftar Pengajuan Cuti', 'Riwayat & Sisa Cuti'],
  },
  PENGGUNA: {
    label: 'Pengguna',
    description:
      'Mencari jadwal penerbangan reguler, melakukan pemesanan tiket perjalanan dinas, serta membatalkan pesanan aktif.',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    tabs: ['Cari & Pesan Tiket', 'Daftar Pesanan & Pembatalan'],
  },
  MEMBER_FREQUENT_TRAVELLER: {
    label: 'Member Frequent Traveller',
    description:
      'Mengakses komparasi rute multi-destinasi, melengkapi profil personal untuk validasi tiket, dan memantau pesanan pribadi.',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    tabs: [
      'Multi-Destinasi & Komparasi',
      'Profil & Validasi Tiket',
      'Pesanan Saya',
    ],
  },
  MANAJER_TRAVEL: {
    label: 'Manajer Travel',
    description:
      'Memantau seluruh status booking korporat, membuat pemesanan tiket untuk pengunjung, dan mengotorisasi kode booking.',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    tabs: [
      'Monitoring Status Booking',
      'Pesan Tiket Pengunjung',
      'Otorisasi Kode Booking',
    ],
  },
  PENGUNJUNG: {
    label: 'Pengunjung',
    description:
      'Melihat status pemesanan tiket yang dibuat atas nama pengunjung dan mengakses informasi e-tiket yang telah diterbitkan.',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    tabs: ['Tiket & E-Tiket Saya'],
  },
};
