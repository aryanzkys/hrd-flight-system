import { ArrowUpRight, CalendarX2, RotateCcw } from 'lucide-react';
import { ChangeEvent, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PermohonanCuti } from '../../types/models';
import {
  BULAN_OPTIONS,
  CutiDateFilter,
  extractAvailableYears,
  filterPermohonanCuti,
  formatFilterSummaryLabel,
  formatPeriodeCuti,
  TANGGAL_OPTIONS,
} from '../../utils/cutiUtils';
import { EmptyState } from '../common/EmptyState';
import { CutiStatusBadge } from '../common/StatusBadge';

const INITIAL_FILTER: CutiDateFilter = {
  tanggal: 'ALL',
  bulan: 'ALL',
  tahun: 'ALL',
};

export interface DaftarPengajuanCutiProps {
  onSelectPegawai?: (pegawaiId: string) => void;
}

interface CutiTableRowProps {
  item: PermohonanCuti;
  onSelectPegawai?: (pegawaiId: string) => void;
}

function CutiTableRow({ item, onSelectPegawai }: Readonly<CutiTableRowProps>) {
  return (
    <tr className="hover:bg-slate-50/80 transition-colors">
      <td className="py-3.5 px-4 align-top">
        {onSelectPegawai ? (
          <button
            type="button"
            onClick={() => onSelectPegawai(item.pegawaiId)}
            className="group inline-flex items-center gap-1 font-medium text-slate-900 hover:text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 cursor-pointer text-left"
          >
            <span>{item.namaPegawai}</span>
            <ArrowUpRight
              className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0"
              aria-hidden="true"
            />
          </button>
        ) : (
          <div className="font-medium text-slate-900">{item.namaPegawai}</div>
        )}
        <div className="text-xs font-mono text-slate-500 mt-0.5">
          {item.id} · {item.pegawaiId}
        </div>
      </td>
      <td className="py-3.5 px-4 align-top text-slate-700 whitespace-nowrap font-mono text-xs sm:text-sm tabular-nums">
        {formatPeriodeCuti(item.tanggalMulai, item.tanggalSelesai)}
      </td>
      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap font-mono tabular-nums font-medium text-slate-900">
        {item.lamaWaktuCuti} Hari
      </td>
      <td className="py-3.5 px-4 align-top text-slate-600 max-w-xs leading-relaxed">
        {item.alasan}
      </td>
      <td className="py-3.5 px-4 align-top whitespace-nowrap">
        <CutiStatusBadge status={item.status} />
      </td>
    </tr>
  );
}

export function DaftarPengajuanCuti({
  onSelectPegawai,
}: Readonly<DaftarPengajuanCutiProps>) {
  const { permohonanCutiList } = useApp();
  const [filter, setFilter] = useState<CutiDateFilter>(INITIAL_FILTER);

  const availableYears = useMemo(
    () => extractAvailableYears(permohonanCutiList),
    [permohonanCutiList],
  );

  const filteredList = useMemo(
    () => filterPermohonanCuti(permohonanCutiList, filter),
    [permohonanCutiList, filter],
  );

  const hasActiveFilter =
    filter.tanggal !== 'ALL' ||
    filter.bulan !== 'ALL' ||
    filter.tahun !== 'ALL';

  const handleFilterChange =
    (field: keyof CutiDateFilter) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      setFilter((prev) => ({ ...prev, [field]: value }));
    };

  const handleResetFilter = () => {
    setFilter(INITIAL_FILTER);
  };

  const activePeriodLabel = formatFilterSummaryLabel(filter);

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div className="space-y-1.5">
            <label
              htmlFor="filter-tanggal-cuti"
              className="block text-xs font-medium text-slate-600"
            >
              Tanggal
            </label>
            <select
              id="filter-tanggal-cuti"
              value={filter.tanggal}
              onChange={handleFilterChange('tanggal')}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500 cursor-pointer"
            >
              <option value="ALL">Semua Tanggal</option>
              {TANGGAL_OPTIONS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="filter-bulan-cuti"
              className="block text-xs font-medium text-slate-600"
            >
              Bulan
            </label>
            <select
              id="filter-bulan-cuti"
              value={filter.bulan}
              onChange={handleFilterChange('bulan')}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500 cursor-pointer"
            >
              <option value="ALL">Semua Bulan</option>
              {BULAN_OPTIONS.map((bulan) => (
                <option key={bulan.value} value={bulan.value}>
                  {bulan.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="filter-tahun-cuti"
              className="block text-xs font-medium text-slate-600"
            >
              Tahun
            </label>
            <select
              id="filter-tahun-cuti"
              value={filter.tahun}
              onChange={handleFilterChange('tahun')}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500 cursor-pointer"
            >
              <option value="ALL">Semua Tahun</option>
              {availableYears.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={handleResetFilter}
              disabled={!hasActiveFilter}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600">
        <p>
          Menampilkan{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {filteredList.length}
          </span>{' '}
          dari{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {permohonanCutiList.length}
          </span>{' '}
          pengajuan cuti
        </p>
        <p className="text-slate-500">Periode filter: {activePeriodLabel}</p>
      </div>

      {filteredList.length === 0 ? (
        <EmptyState
          icon={<CalendarX2 className="w-5 h-5" aria-hidden="true" />}
          title="Tidak ada pengajuan cuti pada periode ini"
          description={
            <>
              Belum ditemukan pegawai yang mengajukan cuti untuk filter{' '}
              <span className="font-medium text-slate-800">
                {activePeriodLabel}
              </span>
              . Coba ubah pilihan tanggal, bulan, atau tahun untuk melihat data
              lainnya.
            </>
          }
          action={
            hasActiveFilter ? (
              <button
                type="button"
                onClick={handleResetFilter}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Tampilkan Semua Pengajuan</span>
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4 whitespace-nowrap">Nama Pegawai</th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Periode Cuti yang Diajukan
                  </th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">
                    Lama Waktu Cuti
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">Alasan Cuti</th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Status Pengajuan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm bg-white">
                {filteredList.map((item) => (
                  <CutiTableRow
                    key={item.id}
                    item={item}
                    onSelectPegawai={onSelectPegawai}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
