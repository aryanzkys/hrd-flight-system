import { PermohonanCuti } from '../types/models';

export interface CutiDateFilter {
  tanggal: string;
  bulan: string;
  tahun: string;
}

export interface BulanOption {
  value: string;
  label: string;
  shortLabel: string;
}

export const BULAN_OPTIONS: BulanOption[] = [
  { value: '1', label: 'Januari', shortLabel: 'Jan' },
  { value: '2', label: 'Februari', shortLabel: 'Feb' },
  { value: '3', label: 'Maret', shortLabel: 'Mar' },
  { value: '4', label: 'April', shortLabel: 'Apr' },
  { value: '5', label: 'Mei', shortLabel: 'Mei' },
  { value: '6', label: 'Juni', shortLabel: 'Jun' },
  { value: '7', label: 'Juli', shortLabel: 'Jul' },
  { value: '8', label: 'Agustus', shortLabel: 'Agu' },
  { value: '9', label: 'September', shortLabel: 'Sep' },
  { value: '10', label: 'Oktober', shortLabel: 'Okt' },
  { value: '11', label: 'November', shortLabel: 'Nov' },
  { value: '12', label: 'Desember', shortLabel: 'Des' },
];

export const TANGGAL_OPTIONS: string[] = Array.from({ length: 31 }, (_, idx) =>
  String(idx + 1),
);

interface DateParts {
  year: number;
  month: number;
  day: number;
}

function parseDateParts(isoDate: string): DateParts | null {
  const segments = isoDate.split('-');
  if (segments.length !== 3) {
    return null;
  }

  const year = Number(segments[0]);
  const month = Number(segments[1]);
  const day = Number(segments[2]);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }

  return { year, month, day };
}

function buildTargetIsoDate(year: string, month: string, day: string): string {
  const paddedMonth = month.padStart(2, '0');
  const paddedDay = day.padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
}

function isExactDateInRange(
  targetIsoDate: string,
  startIsoDate: string,
  endIsoDate: string,
): boolean {
  return targetIsoDate >= startIsoDate && targetIsoDate <= endIsoDate;
}

function matchesYear(item: PermohonanCuti, yearFilter: string): boolean {
  if (yearFilter === 'ALL') {
    return true;
  }
  const targetYear = Number(yearFilter);
  const start = parseDateParts(item.tanggalMulai);
  const end = parseDateParts(item.tanggalSelesai);
  return start?.year === targetYear || end?.year === targetYear;
}

function matchesMonth(item: PermohonanCuti, monthFilter: string): boolean {
  if (monthFilter === 'ALL') {
    return true;
  }
  const targetMonth = Number(monthFilter);
  const start = parseDateParts(item.tanggalMulai);
  const end = parseDateParts(item.tanggalSelesai);
  return start?.month === targetMonth || end?.month === targetMonth;
}

function matchesDay(item: PermohonanCuti, dayFilter: string): boolean {
  if (dayFilter === 'ALL') {
    return true;
  }
  const targetDay = Number(dayFilter);
  const start = parseDateParts(item.tanggalMulai);
  return start?.day === targetDay;
}

export function matchesCutiFilter(
  item: PermohonanCuti,
  filter: CutiDateFilter,
): boolean {
  const isFullDateSelected =
    filter.tahun !== 'ALL' &&
    filter.bulan !== 'ALL' &&
    filter.tanggal !== 'ALL';

  if (isFullDateSelected) {
    const targetIso = buildTargetIsoDate(
      filter.tahun,
      filter.bulan,
      filter.tanggal,
    );
    return isExactDateInRange(
      targetIso,
      item.tanggalMulai,
      item.tanggalSelesai,
    );
  }

  return (
    matchesYear(item, filter.tahun) &&
    matchesMonth(item, filter.bulan) &&
    matchesDay(item, filter.tanggal)
  );
}

export function filterPermohonanCuti(
  list: PermohonanCuti[],
  filter: CutiDateFilter,
): PermohonanCuti[] {
  return list.filter((item) => matchesCutiFilter(item, filter));
}

export function extractAvailableYears(list: PermohonanCuti[]): number[] {
  const yearSet = new Set<number>([2025, 2026, 2027]);

  for (const item of list) {
    const start = parseDateParts(item.tanggalMulai);
    const end = parseDateParts(item.tanggalSelesai);
    if (start) {
      yearSet.add(start.year);
    }
    if (end) {
      yearSet.add(end.year);
    }
  }

  return Array.from(yearSet).sort((a, b) => a - b);
}

export function formatTanggalIndonesia(isoDate: string): string {
  const parts = parseDateParts(isoDate);
  if (!parts) {
    return isoDate;
  }

  const bulanInfo = BULAN_OPTIONS[parts.month - 1];
  const monthText = bulanInfo ? bulanInfo.shortLabel : String(parts.month);
  const dayText = String(parts.day).padStart(2, '0');
  return `${dayText} ${monthText} ${parts.year}`;
}

export function formatPeriodeCuti(
  tanggalMulai: string,
  tanggalSelesai: string,
): string {
  const startFormatted = formatTanggalIndonesia(tanggalMulai);
  const endFormatted = formatTanggalIndonesia(tanggalSelesai);
  return `${startFormatted} - ${endFormatted}`;
}

export function formatFilterSummaryLabel(filter: CutiDateFilter): string {
  const segments: string[] = [];

  if (filter.tanggal !== 'ALL') {
    segments.push(`Tanggal ${filter.tanggal}`);
  }

  if (filter.bulan !== 'ALL') {
    const foundMonth = BULAN_OPTIONS.find((m) => m.value === filter.bulan);
    segments.push(foundMonth ? foundMonth.label : `Bulan ${filter.bulan}`);
  }

  if (filter.tahun !== 'ALL') {
    segments.push(`Tahun ${filter.tahun}`);
  }

  return segments.length > 0 ? segments.join(' · ') : 'Semua Periode';
}
