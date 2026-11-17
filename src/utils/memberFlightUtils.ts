import { JadwalPenerbangan } from '../types/models';

export interface MultiDestinationCriteria {
  tanggal: string;
  lokasiKeberangkatan: string;
  tujuanPenerbangan: string;
}

export interface MultiDestinationResult {
  flights: JadwalPenerbangan[];
  jumlahPenerbangan: number;
  hargaTermurah: number;
  hargaTermahal: number;
}

export interface PreferenceCriteria {
  tujuan: string;
  tanggal: string;
  jamKeberangkatan: string;
}

export interface ComparedFlightItem {
  jadwal: JadwalPenerbangan;
  selisihHarga: number;
  isTermurah: boolean;
}

export function matchesExactFilter(value: string, filter: string): boolean {
  const normalizedFilter = filter.trim();
  if (normalizedFilter.length === 0 || normalizedFilter === 'ALL') {
    return true;
  }
  return value.trim().toLowerCase() === normalizedFilter.toLowerCase();
}

export function matchesTextFilter(value: string, query: string): boolean {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length === 0 || normalizedQuery === 'ALL') {
    return true;
  }
  return value.toLowerCase().includes(normalizedQuery.toLowerCase());
}

function matchesDestinationOrTransit(
  jadwal: JadwalPenerbangan,
  tujuanQuery: string,
): boolean {
  if (matchesTextFilter(jadwal.tujuanPenerbangan, tujuanQuery)) {
    return true;
  }

  if (!jadwal.ruteMultiDestinasi || jadwal.ruteMultiDestinasi.length === 0) {
    return false;
  }

  return jadwal.ruteMultiDestinasi.some((kota) =>
    matchesTextFilter(kota, tujuanQuery),
  );
}

function computePriceBounds(flights: JadwalPenerbangan[]): {
  hargaTermurah: number;
  hargaTermahal: number;
} {
  if (flights.length === 0) {
    return { hargaTermurah: 0, hargaTermahal: 0 };
  }

  const prices = flights.map((item) => item.hargaTiket);
  return {
    hargaTermurah: Math.min(...prices),
    hargaTermahal: Math.max(...prices),
  };
}

export function filterMultiDestinationFlights(
  jadwalList: JadwalPenerbangan[],
  criteria: MultiDestinationCriteria,
): MultiDestinationResult {
  const flights = jadwalList.filter(
    (jadwal) =>
      jadwal.isMultiDestinasi &&
      matchesExactFilter(jadwal.tanggalPenerbangan, criteria.tanggal) &&
      matchesTextFilter(
        jadwal.lokasiKeberangkatan,
        criteria.lokasiKeberangkatan,
      ) &&
      matchesDestinationOrTransit(jadwal, criteria.tujuanPenerbangan),
  );

  const bounds = computePriceBounds(flights);

  return {
    flights,
    jumlahPenerbangan: flights.length,
    hargaTermurah: bounds.hargaTermurah,
    hargaTermahal: bounds.hargaTermahal,
  };
}

export function compareFlightsByPreference(
  jadwalList: JadwalPenerbangan[],
  preference: PreferenceCriteria,
): ComparedFlightItem[] {
  const matched = jadwalList.filter(
    (jadwal) =>
      matchesTextFilter(jadwal.tujuanPenerbangan, preference.tujuan) &&
      matchesExactFilter(jadwal.tanggalPenerbangan, preference.tanggal) &&
      matchesExactFilter(jadwal.jamKeberangkatan, preference.jamKeberangkatan),
  );

  if (matched.length === 0) {
    return [];
  }

  const sorted = [...matched].sort((a, b) => a.hargaTiket - b.hargaTiket);
  const lowestPrice = sorted[0].hargaTiket;

  return sorted.map((jadwal) => ({
    jadwal,
    selisihHarga: jadwal.hargaTiket - lowestPrice,
    isTermurah: jadwal.hargaTiket === lowestPrice,
  }));
}

export function extractUniqueSorted(values: string[]): string[] {
  return Array.from(
    new Set(values.map((v) => v.trim()).filter((v) => v.length > 0)),
  ).sort((a, b) => a.localeCompare(b, 'id'));
}

export function formatFullMultiRoute(jadwal: JadwalPenerbangan): string {
  const rute = jadwal.ruteMultiDestinasi;
  if (!rute || rute.length === 0) {
    return `${jadwal.lokasiKeberangkatan} → ${jadwal.tujuanPenerbangan}`;
  }

  const startsWithOrigin = rute[0] === jadwal.lokasiKeberangkatan;
  const endsWithDestination =
    rute[rute.length - 1] === jadwal.tujuanPenerbangan;

  if (startsWithOrigin && endsWithDestination) {
    return rute.join(' → ');
  }

  return [
    jadwal.lokasiKeberangkatan,
    ...rute,
    jadwal.tujuanPenerbangan,
  ].join(' → ');
}
