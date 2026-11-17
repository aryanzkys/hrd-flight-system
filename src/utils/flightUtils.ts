import { JadwalPenerbangan } from '../types/models';

const SHORT_MONTHS_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export function formatRupiah(nominal: number): string {
  const formatted = new Intl.NumberFormat('id-ID').format(nominal);
  return `Rp ${formatted}`;
}

export function formatTanggalPenerbangan(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) {
    return isoDate;
  }

  const monthIndex = Number(parts[1]) - 1;
  const monthLabel = SHORT_MONTHS_ID[monthIndex] ?? parts[1];
  return `${parts[2]} ${monthLabel} ${parts[0]}`;
}

export function getUniqueDestinations(
  jadwalList: JadwalPenerbangan[],
): string[] {
  const destinationSet = new Set<string>();

  for (const jadwal of jadwalList) {
    const trimmed = jadwal.tujuanPenerbangan.trim();
    if (trimmed.length > 0) {
      destinationSet.add(trimmed);
    }
  }

  return Array.from(destinationSet).sort((a, b) => a.localeCompare(b, 'id'));
}

function parseKeywordDestinations(keywordInput?: string): string[] {
  if (!keywordInput) {
    return [];
  }

  return keywordInput
    .split(',')
    .map((part) => part.toLowerCase().trim())
    .filter((part) => part.length > 0);
}

function buildNormalizedDestinationTerms(
  selectedDestinations: string[],
  keywordInput?: string,
): string[] {
  const fromSelection = selectedDestinations
    .map((item) => item.toLowerCase().trim())
    .filter((item) => item.length > 0);

  const fromKeyword = parseKeywordDestinations(keywordInput);
  return Array.from(new Set([...fromSelection, ...fromKeyword]));
}

function matchesAnyDestination(
  tujuanPenerbangan: string,
  searchTerms: string[],
): boolean {
  const normalizedTarget = tujuanPenerbangan.toLowerCase().trim();
  return searchTerms.some((term) => normalizedTarget.includes(term));
}

export function filterFlightsByDestinations(
  jadwalList: JadwalPenerbangan[],
  selectedDestinations: string[],
  keywordInput?: string,
): JadwalPenerbangan[] {
  const searchTerms = buildNormalizedDestinationTerms(
    selectedDestinations,
    keywordInput,
  );

  if (searchTerms.length === 0) {
    return jadwalList;
  }

  return jadwalList.filter((jadwal) =>
    matchesAnyDestination(jadwal.tujuanPenerbangan, searchTerms),
  );
}

export function formatTransitLabel(jumlahTransit: number): string {
  if (jumlahTransit <= 0) {
    return 'Penerbangan Langsung';
  }
  return `${jumlahTransit} Transit`;
}
