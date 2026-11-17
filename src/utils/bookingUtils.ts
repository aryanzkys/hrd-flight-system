import {
  BookingStatus,
  DataPengunjung,
  JadwalPenerbangan,
  PemesananTiket,
  RoleType,
} from '../types/models';

const BOOKING_CODE_CHARSET = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export const BOOKING_STATUS_BADGE_MAP: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  confirmed: {
    label: 'Confirmed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  booked: {
    label: 'Booked',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  'waiting for the payment': {
    label: 'Waiting for the Payment',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
  },
};

function createSixCharToken(): string {
  let token = '';
  for (let idx = 0; idx < 6; idx += 1) {
    const randomIndex = Math.floor(Math.random() * BOOKING_CODE_CHARSET.length);
    token += BOOKING_CODE_CHARSET[randomIndex];
  }
  return token;
}

export function generateKodeBooking(existingList: PemesananTiket[]): string {
  const existingCodes = new Set(
    existingList.map((item) => item.kodeBookingReference),
  );

  let candidate = `BK-${createSixCharToken()}`;
  while (existingCodes.has(candidate)) {
    candidate = `BK-${createSixCharToken()}`;
  }
  return candidate;
}

export function resolveJadwalByIds(
  jadwalIds: string[],
  jadwalList: JadwalPenerbangan[],
): JadwalPenerbangan[] {
  const jadwalMap = new Map(jadwalList.map((jadwal) => [jadwal.id, jadwal]));
  const resolved: JadwalPenerbangan[] = [];

  for (const id of jadwalIds) {
    const found = jadwalMap.get(id);
    if (found) {
      resolved.push(found);
    }
  }

  return resolved;
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface CreateNewBookingParams {
  jadwal: JadwalPenerbangan;
  pemesanRole: RoleType;
  namaPemesan: string;
  emailPemesan: string;
  statusBooking?: BookingStatus;
  existingList: PemesananTiket[];
}

export function createNewBooking(
  params: CreateNewBookingParams,
): PemesananTiket {
  return {
    kodeBookingReference: generateKodeBooking(params.existingList),
    pemesanRole: params.pemesanRole,
    namaPemesan: params.namaPemesan.trim(),
    emailPemesan: params.emailPemesan.trim(),
    untukPengunjung: false,
    jadwalIds: [params.jadwal.id],
    totalHarga: params.jadwal.hargaTiket,
    statusBooking: params.statusBooking ?? 'booked',
    isValidated: false,
    isAuthorized: false,
    eTicketSent: false,
    tanggalPemesanan: getTodayIsoDate(),
  };
}

export interface CreateVisitorBookingParams {
  jadwal: JadwalPenerbangan;
  dataPengunjung: DataPengunjung;
  statusBooking?: BookingStatus;
  existingList: PemesananTiket[];
}

export function createVisitorBooking(
  params: CreateVisitorBookingParams,
): PemesananTiket {
  const cleanedVisitor: DataPengunjung = {
    nama: params.dataPengunjung.nama.trim(),
    nomorIdentitas: params.dataPengunjung.nomorIdentitas.trim(),
    email: params.dataPengunjung.email.trim(),
  };

  return {
    kodeBookingReference: generateKodeBooking(params.existingList),
    pemesanRole: 'MANAJER_TRAVEL',
    namaPemesan: cleanedVisitor.nama,
    emailPemesan: cleanedVisitor.email,
    untukPengunjung: true,
    dataPengunjung: cleanedVisitor,
    jadwalIds: [params.jadwal.id],
    totalHarga: params.jadwal.hargaTiket,
    statusBooking: params.statusBooking ?? 'booked',
    isValidated: true,
    isAuthorized: false,
    eTicketSent: true,
    tanggalPemesanan: getTodayIsoDate(),
  };
}
