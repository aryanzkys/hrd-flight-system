export type RoleType =
  | 'HRD_MANAJER'
  | 'PENGGUNA'
  | 'MEMBER_FREQUENT_TRAVELLER'
  | 'MANAJER_TRAVEL'
  | 'PENGUNJUNG';

export type StatusCuti = 'Menunggu' | 'Disetujui' | 'Ditolak';

export interface Pegawai {
  id: string;
  nama: string;
  divisi: string;
  sisaWaktuCuti: number;
}

export interface PermohonanCuti {
  id: string;
  pegawaiId: string;
  namaPegawai: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  lamaWaktuCuti: number;
  alasan: string;
  status: StatusCuti;
}

export interface RiwayatCuti {
  id: string;
  pegawaiId: string;
  tahun: number;
  periode: string;
  lamaWaktuCuti: number;
  keterangan: string;
}

export interface JadwalPenerbangan {
  id: string;
  kodePenerbangan: string;
  maskapai: string;
  lokasiKeberangkatan: string;
  tujuanPenerbangan: string;
  tanggalPenerbangan: string;
  jamKeberangkatan: string;
  hargaTiket: number;
  isMultiDestinasi: boolean;
  ruteMultiDestinasi?: string[];
  jumlahTransit: number;
}

export interface ProfilPersonal {
  memberId: string;
  namaLengkap: string;
  nomorIdentitas: string;
  nomorTelepon: string;
  alamat: string;
  email: string;
}

export type BookingStatus =
  | 'confirmed'
  | 'booked'
  | 'waiting for the payment';

export interface DataPengunjung {
  nama: string;
  nomorIdentitas: string;
  email: string;
}

export interface PemesananTiket {
  kodeBookingReference: string;
  pemesanRole: RoleType;
  namaPemesan: string;
  emailPemesan: string;
  untukPengunjung: boolean;
  dataPengunjung?: DataPengunjung;
  jadwalIds: string[];
  totalHarga: number;
  statusBooking: BookingStatus;
  isValidated: boolean;
  isAuthorized: boolean;
  eTicketSent: boolean;
  tanggalPemesanan: string;
}

export function isProfilLengkap(
  profil: ProfilPersonal | null | undefined,
): boolean {
  if (!profil) {
    return false;
  }

  const requiredFields: string[] = [
    profil.memberId,
    profil.namaLengkap,
    profil.nomorIdentitas,
    profil.nomorTelepon,
    profil.alamat,
    profil.email,
  ];

  return requiredFields.every((value) => value.trim().length > 0);
}
