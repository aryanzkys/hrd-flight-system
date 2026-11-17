import { CalendarCheck2, History, UserCheck } from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Pegawai, RiwayatCuti } from '../../types/models';
import { EmptyState } from '../common/EmptyState';

const CURRENT_YEAR = 2026;

type YearScope = 'CURRENT_YEAR' | 'ALL_YEARS';

interface SisaCutiIndicator {
  containerClass: string;
  valueClass: string;
  statusLabel: string;
}

function getSisaCutiIndicator(sisaHari: number): SisaCutiIndicator {
  if (sisaHari <= 0) {
    return {
      containerClass: 'bg-rose-50 border-rose-200 text-rose-700',
      valueClass: 'text-rose-700',
      statusLabel: 'Habis',
    };
  }

  if (sisaHari <= 4) {
    return {
      containerClass: 'bg-amber-50 border-amber-200 text-amber-800',
      valueClass: 'text-amber-700',
      statusLabel: 'Menipis',
    };
  }

  return {
    containerClass: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    valueClass: 'text-emerald-700',
    statusLabel: 'Tersedia',
  };
}

function resolveSelectedPegawai(
  pegawaiList: Pegawai[],
  selectedId: string,
): Pegawai | undefined {
  return (
    pegawaiList.find((pegawai) => pegawai.id === selectedId) ?? pegawaiList[0]
  );
}

function sumHariTerpakai(riwayat: RiwayatCuti[]): number {
  return riwayat.reduce((total, item) => total + item.lamaWaktuCuti, 0);
}

function getEmptyScopeSuffix(yearScope: YearScope): string {
  if (yearScope === 'CURRENT_YEAR') {
    return `pada tahun berjalan (${CURRENT_YEAR}).`;
  }
  return 'pada sistem.';
}

export interface RiwayatSisaCutiProps {
  initialPegawaiId?: string;
}

export function RiwayatSisaCuti({
  initialPegawaiId,
}: Readonly<RiwayatSisaCutiProps>) {
  const { pegawaiList, riwayatCutiList } = useApp();
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<string>(
    () => initialPegawaiId ?? pegawaiList[0]?.id ?? '',
  );
  const [yearScope, setYearScope] = useState<YearScope>('CURRENT_YEAR');

  useEffect(() => {
    if (initialPegawaiId) {
      setSelectedPegawaiId(initialPegawaiId);
    }
  }, [initialPegawaiId]);

  const selectedPegawai = useMemo(
    () => resolveSelectedPegawai(pegawaiList, selectedPegawaiId),
    [pegawaiList, selectedPegawaiId],
  );

  const activePegawaiId = selectedPegawai?.id ?? '';

  const allEmployeeHistory = useMemo(
    () =>
      riwayatCutiList.filter((item) => item.pegawaiId === activePegawaiId),
    [riwayatCutiList, activePegawaiId],
  );

  const currentYearHistory = useMemo(
    () => allEmployeeHistory.filter((item) => item.tahun === CURRENT_YEAR),
    [allEmployeeHistory],
  );

  const displayedHistory =
    yearScope === 'CURRENT_YEAR' ? currentYearHistory : allEmployeeHistory;

  const totalTerpakaiTahunIni = useMemo(
    () => sumHariTerpakai(currentYearHistory),
    [currentYearHistory],
  );

  const handlePegawaiChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPegawaiId(event.target.value);
  };

  if (!selectedPegawai) {
    return (
      <div className="border border-slate-200 rounded-lg bg-slate-50 p-8 text-center text-sm text-slate-600">
        Belum ada data pegawai yang terdaftar di dalam sistem.
      </div>
    );
  }

  const sisaIndicator = getSisaCutiIndicator(selectedPegawai.sisaWaktuCuti);

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5 flex-1 max-w-md">
          <label
            htmlFor="select-pegawai-riwayat"
            className="block text-xs font-medium text-slate-600"
          >
            Pilih Pegawai
          </label>
          <select
            id="select-pegawai-riwayat"
            value={activePegawaiId}
            onChange={handlePegawaiChange}
            className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500 cursor-pointer"
          >
            {pegawaiList.map((pegawai) => (
              <option key={pegawai.id} value={pegawai.id}>
                {pegawai.nama} — {pegawai.divisi}
              </option>
            ))}
          </select>
        </div>

        <div
          className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start sm:self-auto"
          role="group"
          aria-label="Filter Tahun Riwayat Cuti"
        >
          <button
            type="button"
            onClick={() => setYearScope('CURRENT_YEAR')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              yearScope === 'CURRENT_YEAR'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tahun Berjalan ({CURRENT_YEAR})
          </button>
          <button
            type="button"
            onClick={() => setYearScope('ALL_YEARS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              yearScope === 'ALL_YEARS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Tahun
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-slate-200 rounded-lg p-5 bg-white">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-slate-500">Profil Pegawai</p>
            <UserCheck className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {selectedPegawai.nama}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {selectedPegawai.divisi} ·{' '}
            <span className="font-mono text-slate-500">
              {selectedPegawai.id}
            </span>
          </p>
        </div>

        <div className="border border-slate-200 rounded-lg p-5 bg-white">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-slate-500">
              Sisa Waktu Cuti ({CURRENT_YEAR})
            </p>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${sisaIndicator.containerClass}`}
            >
              {sisaIndicator.statusLabel}
            </span>
          </div>
          <p
            className={`mt-2 text-3xl font-semibold font-mono tabular-nums ${sisaIndicator.valueClass}`}
          >
            {selectedPegawai.sisaWaktuCuti}{' '}
            <span className="text-sm font-sans font-medium">Hari</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Jatah cuti tersisa pada tahun berjalan
          </p>
        </div>

        <div className="border border-slate-200 rounded-lg p-5 bg-white">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-slate-500">
              Total Terpakai ({CURRENT_YEAR})
            </p>
            <CalendarCheck2
              className="w-4 h-4 text-slate-400"
              aria-hidden="true"
            />
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-900 font-mono tabular-nums">
            {totalTerpakaiTahunIni}{' '}
            <span className="text-sm font-sans font-medium text-slate-600">
              Hari
            </span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Dari {currentYearHistory.length} riwayat pengambilan cuti
          </p>
        </div>
      </div>

      {displayedHistory.length === 0 ? (
        <EmptyState
          icon={<History className="w-5 h-5" aria-hidden="true" />}
          title="Belum ada riwayat cuti tercatat"
          description={
            <>
              Pegawai{' '}
              <span className="font-medium text-slate-800">
                {selectedPegawai.nama}
              </span>{' '}
              belum memiliki catatan pengambilan cuti{' '}
              {getEmptyScopeSuffix(yearScope)}
            </>
          }
        />
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
            <h4 className="text-xs font-semibold text-slate-700">
              Daftar Riwayat Cuti — {selectedPegawai.nama}
            </h4>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {displayedHistory.length} Catatan
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4 whitespace-nowrap">Tahun</th>
                  <th className="py-3 px-4 whitespace-nowrap">Periode Cuti</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">
                    Lama Waktu Cuti
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm bg-white">
                {displayedHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 align-top font-mono tabular-nums font-medium text-slate-900 whitespace-nowrap">
                      {item.tahun}
                    </td>
                    <td className="py-3.5 px-4 align-top font-mono tabular-nums text-xs sm:text-sm text-slate-700 whitespace-nowrap">
                      {item.periode}
                    </td>
                    <td className="py-3.5 px-4 align-top text-right font-mono tabular-nums font-medium text-slate-900 whitespace-nowrap">
                      {item.lamaWaktuCuti} Hari
                    </td>
                    <td className="py-3.5 px-4 align-top text-slate-600 leading-relaxed">
                      {item.keterangan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
