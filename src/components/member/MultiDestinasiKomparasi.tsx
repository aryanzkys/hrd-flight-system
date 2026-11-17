import {
  ArrowLeft,
  ArrowRight,
  GitCompare,
  PlaneTakeoff,
  RotateCcw,
  Route,
  UserCheck,
} from 'lucide-react';
import { ChangeEvent, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  JadwalPenerbangan,
  PemesananTiket,
  ProfilPersonal,
} from '../../types/models';
import { createNewBooking } from '../../utils/bookingUtils';
import {
  formatRupiah,
  formatTanggalPenerbangan,
  formatTransitLabel,
} from '../../utils/flightUtils';
import {
  ComparedFlightItem,
  compareFlightsByPreference,
  extractUniqueSorted,
  filterMultiDestinationFlights,
  formatFullMultiRoute,
  MultiDestinationCriteria,
  MultiDestinationResult,
  PreferenceCriteria,
} from '../../utils/memberFlightUtils';
import { AlertBanner } from '../common/AlertBanner';
import { EmptyState } from '../common/EmptyState';

type SubMode = 'MULTI_DESTINASI' | 'KOMPARASI';

const INITIAL_MULTI_CRITERIA: MultiDestinationCriteria = {
  tanggal: 'ALL',
  lokasiKeberangkatan: 'ALL',
  tujuanPenerbangan: 'ALL',
};

const INITIAL_PREFERENCE: PreferenceCriteria = {
  tujuan: 'ALL',
  tanggal: 'ALL',
  jamKeberangkatan: 'ALL',
};

export interface MultiDestinasiKomparasiProps {
  onNavigateTab?: (tabName: string) => void;
}

interface PriceComparisonCellProps {
  item: ComparedFlightItem;
}

function PriceComparisonCell({ item }: Readonly<PriceComparisonCellProps>) {
  if (item.isTermurah) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium whitespace-nowrap">
        Harga Termurah
      </span>
    );
  }

  return (
    <span className="font-mono tabular-nums text-xs font-medium text-slate-600 whitespace-nowrap">
      + {formatRupiah(item.selisihHarga)}
    </span>
  );
}

interface MemberBookingPageProps {
  jadwal: JadwalPenerbangan;
  profilMember: ProfilPersonal;
  createdBooking: PemesananTiket | null;
  onBack: () => void;
  onConfirm: () => void;
  onNavigateTab?: (tabName: string) => void;
}

function MemberBookingPage({
  jadwal,
  profilMember,
  createdBooking,
  onBack,
  onConfirm,
  onNavigateTab,
}: Readonly<MemberBookingPageProps>) {
  const displayName =
    profilMember.namaLengkap.trim().length > 0
      ? profilMember.namaLengkap
      : 'Member Frequent Traveller';
  const displayEmail =
    profilMember.email.trim().length > 0 ? profilMember.email : '-';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Kembali ke Daftar Penerbangan</span>
        </button>
        <span className="text-xs font-mono text-slate-500">
          Member ID: {profilMember.memberId}
        </span>
      </div>

      {createdBooking ? (
        <AlertBanner
          variant="success"
          title={
            <>
              Pemesanan Tiket Member Berhasil Dibuat — Kode Booking:{' '}
              <span className="font-mono font-semibold">
                {createdBooking.kodeBookingReference}
              </span>
            </>
          }
          description={
            <>
              Total Harga: {formatRupiah(createdBooking.totalHarga)} · Status:{' '}
              {createdBooking.statusBooking}. Lanjutkan ke validasi profil agar
              tiket siap diotorisasi.
            </>
          }
          actions={
            onNavigateTab ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab('Profil & Validasi Tiket')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 rounded-md hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  <span>Profil &amp; Validasi Tiket</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('Pesanan Saya')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-emerald-900 bg-white border border-emerald-300 rounded-md hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <span>Pesanan Saya</span>
                </button>
              </div>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900">
                Detail Penerbangan Terpilih
              </h4>
              <span className="font-mono text-xs font-medium text-slate-600">
                {jadwal.kodePenerbangan}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Maskapai</span>
                <span className="font-medium text-slate-900">
                  {jadwal.maskapai}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-500 shrink-0">Rute</span>
                <span className="font-medium text-slate-900 text-right">
                  {formatFullMultiRoute(jadwal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tanggal &amp; Jam</span>
                <span className="font-mono tabular-nums text-slate-900">
                  {formatTanggalPenerbangan(jadwal.tanggalPenerbangan)} ·{' '}
                  {jadwal.jamKeberangkatan}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Transit</span>
                <span className="text-slate-900">
                  {formatTransitLabel(jadwal.jumlahTransit)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="font-medium text-slate-700">Total Harga</span>
                <span className="text-lg font-mono tabular-nums font-semibold text-slate-900">
                  {formatRupiah(jadwal.hargaTiket)}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-5 bg-white flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <h4 className="text-sm font-semibold text-slate-900">
                  Data Pemesan Member Frequent Traveller
                </h4>
                <UserCheck
                  className="w-4 h-4 text-slate-400"
                  aria-hidden="true"
                />
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Nama Lengkap Member</p>
                  <p className="font-medium text-slate-900 mt-0.5">
                    {displayName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email Member</p>
                  <p className="font-medium text-slate-900 mt-0.5">
                    {displayEmail}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Peran Pemesan</p>
                  <p className="font-mono text-xs text-slate-700 mt-0.5">
                    MEMBER_FREQUENT_TRAVELLER ({profilMember.memberId})
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Konfirmasi Pemesanan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MultiDestinasiSubViewProps {
  criteria: MultiDestinationCriteria;
  tanggalOptions: string[];
  originOptions: string[];
  destinationOptions: string[];
  result: MultiDestinationResult;
  onChangeCriteria: (
    field: keyof MultiDestinationCriteria,
  ) => (event: ChangeEvent<HTMLSelectElement>) => void;
  onReset: () => void;
  onSelectFlight: (jadwal: JadwalPenerbangan) => void;
}

function MultiDestinasiSubView({
  criteria,
  tanggalOptions,
  originOptions,
  destinationOptions,
  result,
  onChangeCriteria,
  onReset,
  onSelectFlight,
}: Readonly<MultiDestinasiSubViewProps>) {
  const lowestPriceDisplay =
    result.jumlahPenerbangan > 0 ? formatRupiah(result.hargaTermurah) : '-';
  const highestPriceDisplay =
    result.jumlahPenerbangan > 0 ? formatRupiah(result.hargaTermahal) : '-';

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div className="space-y-1.5">
            <label
              htmlFor="multi-tanggal"
              className="block text-xs font-medium text-slate-600"
            >
              Tanggal Penerbangan
            </label>
            <select
              id="multi-tanggal"
              value={criteria.tanggal}
              onChange={onChangeCriteria('tanggal')}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500 cursor-pointer"
            >
              <option value="ALL">Semua Tanggal</option>
              {tanggalOptions.map((tgl) => (
                <option key={tgl} value={tgl}>
                  {formatTanggalPenerbangan(tgl)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="multi-origin"
              className="block text-xs font-medium text-slate-600"
            >
              Lokasi Keberangkatan
            </label>
            <select
              id="multi-origin"
              value={criteria.lokasiKeberangkatan}
              onChange={onChangeCriteria('lokasiKeberangkatan')}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500 cursor-pointer"
            >
              <option value="ALL">Semua Keberangkatan</option>
              {originOptions.map((origin) => (
                <option key={origin} value={origin}>
                  {origin}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="multi-destination"
              className="block text-xs font-medium text-slate-600"
            >
              Tujuan / Kota Transit
            </label>
            <select
              id="multi-destination"
              value={criteria.tujuanPenerbangan}
              onChange={onChangeCriteria('tujuanPenerbangan')}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500 cursor-pointer"
            >
              <option value="ALL">Semua Tujuan</option>
              {destinationOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-slate-200 rounded-lg p-4 bg-white">
          <p className="text-xs font-medium text-slate-500">
            Jumlah Penerbangan Ditemukan
          </p>
          <p className="mt-1.5 text-2xl font-semibold text-slate-900 font-mono tabular-nums">
            {result.jumlahPenerbangan}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Rute multi-destinasi tersedia
          </p>
        </div>

        <div className="border border-slate-200 rounded-lg p-4 bg-white">
          <p className="text-xs font-medium text-slate-500">Harga Terendah</p>
          <p className="mt-1.5 text-2xl font-semibold text-emerald-700 font-mono tabular-nums">
            {lowestPriceDisplay}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Opsi tarif paling efisien
          </p>
        </div>

        <div className="border border-slate-200 rounded-lg p-4 bg-white">
          <p className="text-xs font-medium text-slate-500">Harga Tertinggi</p>
          <p className="mt-1.5 text-2xl font-semibold text-slate-900 font-mono tabular-nums">
            {highestPriceDisplay}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Batas atas rentang tarif
          </p>
        </div>
      </div>

      {result.flights.length === 0 ? (
        <EmptyState
          icon={<PlaneTakeoff className="w-5 h-5" aria-hidden="true" />}
          title="Tidak ada rute multi-destinasi yang cocok"
          description="Sesuaikan kombinasi tanggal, lokasi keberangkatan, atau kota tujuan untuk melihat jadwal multi-destinasi lainnya."
          action={
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Tampilkan Semua Multi-Destinasi</span>
            </button>
          }
        />
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4 whitespace-nowrap">
                    Maskapai &amp; Kode
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Rute Multi-Destinasi
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Jumlah Transit
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Tanggal &amp; Jam
                  </th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">
                    Harga Tiket
                  </th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm bg-white">
                {result.flights.map((jadwal) => (
                  <tr
                    key={jadwal.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {jadwal.maskapai}
                      </div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">
                        {jadwal.kodePenerbangan}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top text-slate-700 font-medium">
                      {formatFullMultiRoute(jadwal)}
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap text-slate-600">
                      {formatTransitLabel(jadwal.jumlahTransit)}
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap font-mono tabular-nums text-xs sm:text-sm">
                      <div className="text-slate-900">
                        {formatTanggalPenerbangan(jadwal.tanggalPenerbangan)}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {jadwal.jamKeberangkatan}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap font-mono tabular-nums font-semibold text-slate-900">
                      {formatRupiah(jadwal.hargaTiket)}
                    </td>

                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectFlight(jadwal)}
                        className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Pesan Penerbangan
                      </button>
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

interface KomparasiPreferensiSubViewProps {
  preference: PreferenceCriteria;
  tujuanOptions: string[];
  tanggalOptions: string[];
  jamOptions: string[];
  comparedFlights: ComparedFlightItem[];
  onChangePreference: (
    field: keyof PreferenceCriteria,
  ) => (event: ChangeEvent<HTMLSelectElement>) => void;
  onReset: () => void;
  onSelectFlight: (jadwal: JadwalPenerbangan) => void;
}

function KomparasiPreferensiSubView({
  preference,
  tujuanOptions,
  tanggalOptions,
  jamOptions,
  comparedFlights,
  onChangePreference,
  onReset,
  onSelectFlight,
}: Readonly<KomparasiPreferensiSubViewProps>) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div className="space-y-1.5">
            <label
              htmlFor="pref-tujuan"
              className="block text-xs font-medium text-slate-600"
            >
              Tujuan Penerbangan
            </label>
            <select
              id="pref-tujuan"
              value={preference.tujuan}
              onChange={onChangePreference('tujuan')}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500 cursor-pointer"
            >
              <option value="ALL">Semua Tujuan</option>
              {tujuanOptions.map((tujuan) => (
                <option key={tujuan} value={tujuan}>
                  {tujuan}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="pref-tanggal"
              className="block text-xs font-medium text-slate-600"
            >
              Tanggal Penerbangan
            </label>
            <select
              id="pref-tanggal"
              value={preference.tanggal}
              onChange={onChangePreference('tanggal')}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500 cursor-pointer"
            >
              <option value="ALL">Semua Tanggal</option>
              {tanggalOptions.map((tgl) => (
                <option key={tgl} value={tgl}>
                  {formatTanggalPenerbangan(tgl)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="pref-jam"
              className="block text-xs font-medium text-slate-600"
            >
              Jam Keberangkatan
            </label>
            <select
              id="pref-jam"
              value={preference.jamKeberangkatan}
              onChange={onChangePreference('jamKeberangkatan')}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500 cursor-pointer"
            >
              <option value="ALL">Semua Jam</option>
              {jamOptions.map((jam) => (
                <option key={jam} value={jam}>
                  {jam}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600">
        <p>
          Menampilkan{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {comparedFlights.length}
          </span>{' '}
          penerbangan terurut dari harga termurah
        </p>
        <p className="text-slate-500">
          Selisih harga dihitung terhadap tarif terendah pada hasil filter
        </p>
      </div>

      {comparedFlights.length === 0 ? (
        <EmptyState
          icon={<GitCompare className="w-5 h-5" aria-hidden="true" />}
          title="Tidak ada jadwal sesuai preferensi Anda"
          description="Ubah kombinasi tujuan, tanggal, atau jam keberangkatan untuk membandingkan tarif maskapai lainnya."
          action={
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Preferensi</span>
            </button>
          }
        />
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4 whitespace-nowrap">Maskapai</th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Kode Penerbangan
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Tanggal &amp; Jam Keberangkatan
                  </th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">
                    Harga Tiket
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Perbandingan Harga
                  </th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm bg-white">
                {comparedFlights.map((item) => (
                  <tr
                    key={item.jadwal.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-medium text-slate-900">
                        {item.jadwal.maskapai}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.jadwal.lokasiKeberangkatan} →{' '}
                        {item.jadwal.tujuanPenerbangan}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap font-mono text-slate-800">
                      {item.jadwal.kodePenerbangan}
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap font-mono tabular-nums text-xs sm:text-sm">
                      <span className="text-slate-900">
                        {formatTanggalPenerbangan(
                          item.jadwal.tanggalPenerbangan,
                        )}
                      </span>{' '}
                      <span className="text-slate-500">
                        · {item.jadwal.jamKeberangkatan}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap font-mono tabular-nums font-semibold text-slate-900">
                      {formatRupiah(item.jadwal.hargaTiket)}
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <PriceComparisonCell item={item} />
                    </td>

                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectFlight(item.jadwal)}
                        className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Pilih &amp; Pesan
                      </button>
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

export function MultiDestinasiKomparasi({
  onNavigateTab,
}: Readonly<MultiDestinasiKomparasiProps>) {
  const { jadwalList, profilMember, pemesananList, tambahPemesanan } =
    useApp();
  const [subMode, setSubMode] = useState<SubMode>('MULTI_DESTINASI');
  const [multiCriteria, setMultiCriteria] = useState<MultiDestinationCriteria>(
    INITIAL_MULTI_CRITERIA,
  );
  const [preference, setPreference] =
    useState<PreferenceCriteria>(INITIAL_PREFERENCE);
  const [selectedFlight, setSelectedFlight] =
    useState<JadwalPenerbangan | null>(null);
  const [createdBooking, setCreatedBooking] = useState<PemesananTiket | null>(
    null,
  );

  const multiDestSource = useMemo(
    () => jadwalList.filter((item) => item.isMultiDestinasi),
    [jadwalList],
  );

  const multiTanggalOptions = useMemo(
    () =>
      extractUniqueSorted(
        multiDestSource.map((item) => item.tanggalPenerbangan),
      ),
    [multiDestSource],
  );

  const multiOriginOptions = useMemo(
    () =>
      extractUniqueSorted(
        multiDestSource.map((item) => item.lokasiKeberangkatan),
      ),
    [multiDestSource],
  );

  const multiDestinationOptions = useMemo(() => {
    const cities = multiDestSource.flatMap((item) => [
      item.tujuanPenerbangan,
      ...(item.ruteMultiDestinasi ?? []),
    ]);
    return extractUniqueSorted(cities);
  }, [multiDestSource]);

  const prefTujuanOptions = useMemo(
    () =>
      extractUniqueSorted(jadwalList.map((item) => item.tujuanPenerbangan)),
    [jadwalList],
  );

  const prefTanggalOptions = useMemo(
    () =>
      extractUniqueSorted(jadwalList.map((item) => item.tanggalPenerbangan)),
    [jadwalList],
  );

  const prefJamOptions = useMemo(
    () => extractUniqueSorted(jadwalList.map((item) => item.jamKeberangkatan)),
    [jadwalList],
  );

  const multiResult = useMemo(
    () => filterMultiDestinationFlights(jadwalList, multiCriteria),
    [jadwalList, multiCriteria],
  );

  const comparedFlights = useMemo(
    () => compareFlightsByPreference(jadwalList, preference),
    [jadwalList, preference],
  );

  const handleMultiCriteriaChange =
    (field: keyof MultiDestinationCriteria) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      setMultiCriteria((prev) => ({ ...prev, [field]: value }));
    };

  const handlePreferenceChange =
    (field: keyof PreferenceCriteria) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      setPreference((prev) => ({ ...prev, [field]: value }));
    };

  const handleOpenBookingPage = (jadwal: JadwalPenerbangan) => {
    setSelectedFlight(jadwal);
    setCreatedBooking(null);
  };

  const handleBackToList = () => {
    setSelectedFlight(null);
    setCreatedBooking(null);
  };

  const handleConfirmMemberBooking = () => {
    if (!selectedFlight) {
      return;
    }

    const namaPemesan =
      profilMember.namaLengkap.trim().length > 0
        ? profilMember.namaLengkap
        : 'Member Frequent Traveller';
    const emailPemesan =
      profilMember.email.trim().length > 0
        ? profilMember.email
        : 'member@korporat.co.id';

    const newBooking = createNewBooking({
      jadwal: selectedFlight,
      pemesanRole: 'MEMBER_FREQUENT_TRAVELLER',
      namaPemesan,
      emailPemesan,
      statusBooking: 'booked',
      existingList: pemesananList,
    });

    tambahPemesanan(newBooking);
    setCreatedBooking(newBooking);
  };

  if (selectedFlight) {
    return (
      <MemberBookingPage
        jadwal={selectedFlight}
        profilMember={profilMember}
        createdBooking={createdBooking}
        onBack={handleBackToList}
        onConfirm={handleConfirmMemberBooking}
        onNavigateTab={onNavigateTab}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg"
        role="tablist"
        aria-label="Sub-mode Pencarian & Komparasi"
      >
        <button
          type="button"
          role="tab"
          aria-selected={subMode === 'MULTI_DESTINASI'}
          onClick={() => setSubMode('MULTI_DESTINASI')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            subMode === 'MULTI_DESTINASI'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Route className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Pencarian Multi-Destinasi (US4)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={subMode === 'KOMPARASI'}
          onClick={() => setSubMode('KOMPARASI')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            subMode === 'KOMPARASI'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Komparasi Preferensi Penerbangan (US6)</span>
        </button>
      </div>

      {subMode === 'MULTI_DESTINASI' ? (
        <MultiDestinasiSubView
          criteria={multiCriteria}
          tanggalOptions={multiTanggalOptions}
          originOptions={multiOriginOptions}
          destinationOptions={multiDestinationOptions}
          result={multiResult}
          onChangeCriteria={handleMultiCriteriaChange}
          onReset={() => setMultiCriteria(INITIAL_MULTI_CRITERIA)}
          onSelectFlight={handleOpenBookingPage}
        />
      ) : (
        <KomparasiPreferensiSubView
          preference={preference}
          tujuanOptions={prefTujuanOptions}
          tanggalOptions={prefTanggalOptions}
          jamOptions={prefJamOptions}
          comparedFlights={comparedFlights}
          onChangePreference={handlePreferenceChange}
          onReset={() => setPreference(INITIAL_PREFERENCE)}
          onSelectFlight={handleOpenBookingPage}
        />
      )}
    </div>
  );
}
