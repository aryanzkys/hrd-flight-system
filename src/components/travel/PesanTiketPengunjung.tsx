import {
  ArrowLeft,
  ArrowRight,
  MailCheck,
  PlaneTakeoff,
  RotateCcw,
  Search,
  Send,
} from 'lucide-react';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookingStatus,
  JadwalPenerbangan,
  PemesananTiket,
} from '../../types/models';
import { createVisitorBooking } from '../../utils/bookingUtils';
import {
  formatRupiah,
  formatTanggalPenerbangan,
  formatTransitLabel,
} from '../../utils/flightUtils';
import {
  extractUniqueSorted,
  matchesExactFilter,
  matchesTextFilter,
} from '../../utils/memberFlightUtils';
import { AlertBanner } from '../common/AlertBanner';
import { EmptyState } from '../common/EmptyState';

export interface PesanTiketPengunjungProps {
  onNavigateToMonitoring?: () => void;
}

interface CreatedVisitorResult {
  booking: PemesananTiket;
  jadwal: JadwalPenerbangan;
}

interface VisitorSuccessPanelProps {
  result: CreatedVisitorResult;
  onStartNew: () => void;
  onNavigateToMonitoring?: () => void;
}

function VisitorSuccessPanel({
  result,
  onStartNew,
  onNavigateToMonitoring,
}: Readonly<VisitorSuccessPanelProps>) {
  const { booking, jadwal } = result;

  return (
    <div className="space-y-6">
      <AlertBanner
        variant="success"
        title="Pemesanan Tiket Pengunjung Berhasil & E-Tiket Terkirim"
        description={
          <>
            Kode Booking Reference{' '}
            <span className="font-mono font-semibold">
              {booking.kodeBookingReference}
            </span>{' '}
            telah disimpan dan otomatis disinkronkan ke akun Pengunjung serta
            daftar Monitoring Status Booking.
          </>
        }
      />

      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MailCheck
              className="w-4 h-4 text-emerald-700"
              aria-hidden="true"
            />
            <h5 className="text-sm font-semibold text-slate-900">
              Konfirmasi Pengiriman E-Tiket ke Email Pengunjung
            </h5>
          </div>
          <span className="font-mono text-xs text-slate-500">
            {booking.kodeBookingReference}
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500">Email Tujuan Pengiriman</p>
            <p className="font-medium text-slate-900 mt-0.5">
              {booking.emailPemesan}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Nama &amp; Identitas</p>
            <p className="font-medium text-slate-900 mt-0.5">
              {booking.dataPengunjung?.nama ?? booking.namaPemesan} ·{' '}
              <span className="font-mono text-xs text-slate-600">
                {booking.dataPengunjung?.nomorIdentitas ?? '-'}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Maskapai &amp; Rute</p>
            <p className="font-medium text-slate-900 mt-0.5">
              {jadwal.maskapai} ({jadwal.kodePenerbangan}) —{' '}
              {jadwal.lokasiKeberangkatan} → {jadwal.tujuanPenerbangan}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Jadwal &amp; Status</p>
            <p className="font-mono tabular-nums text-slate-900 mt-0.5">
              {formatTanggalPenerbangan(jadwal.tanggalPenerbangan)}{' '}
              {jadwal.jamKeberangkatan} · {booking.statusBooking}
            </p>
          </div>
        </div>

        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onStartNew}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Buat Pemesanan Pengunjung Lainnya
          </button>
          {onNavigateToMonitoring && (
            <button
              type="button"
              onClick={onNavigateToMonitoring}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>Lihat di Monitoring Status Booking</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface VisitorFormStepProps {
  jadwal: JadwalPenerbangan;
  namaPengunjung: string;
  nomorIdentitas: string;
  emailPengunjung: string;
  statusAwal: BookingStatus;
  formError: string;
  onChangeNama: (value: string) => void;
  onChangeIdentitas: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangeStatus: (value: BookingStatus) => void;
  onBack: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function VisitorFormStep({
  jadwal,
  namaPengunjung,
  nomorIdentitas,
  emailPengunjung,
  statusAwal,
  formError,
  onChangeNama,
  onChangeIdentitas,
  onChangeEmail,
  onChangeStatus,
  onBack,
  onSubmit,
}: Readonly<VisitorFormStepProps>) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Pilih Jadwal Lain</span>
        </button>
        <span className="text-xs font-medium text-slate-500">
          Langkah 2 dari 2 · Data Pengunjung
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 border border-slate-200 rounded-lg bg-slate-50 p-5 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <h4 className="font-semibold text-slate-900">
              Tiket Penerbangan Terpilih
            </h4>
            <span className="font-mono text-xs text-slate-600">
              {jadwal.kodePenerbangan}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Maskapai</span>
            <span className="font-medium text-slate-900">
              {jadwal.maskapai}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Rute</span>
            <span className="font-medium text-slate-900 text-right">
              {jadwal.lokasiKeberangkatan} → {jadwal.tujuanPenerbangan}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Jadwal</span>
            <span className="font-mono tabular-nums text-slate-900">
              {formatTanggalPenerbangan(jadwal.tanggalPenerbangan)} ·{' '}
              {jadwal.jamKeberangkatan}
            </span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="font-medium text-slate-700">Harga Tiket</span>
            <span className="font-mono tabular-nums font-semibold text-base text-slate-900">
              {formatRupiah(jadwal.hargaTiket)}
            </span>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="lg:col-span-7 border border-slate-200 rounded-lg bg-white overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <h4 className="text-sm font-semibold text-slate-900">
              Formulir Pemesanan Data Pengunjung
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Lengkapi identitas dan email terdaftar pengunjung untuk pengiriman
              e-tiket.
            </p>
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="visitor-nama"
                className="block text-xs font-medium text-slate-700"
              >
                Nama Lengkap Pengunjung
              </label>
              <input
                id="visitor-nama"
                type="text"
                value={namaPengunjung}
                onChange={(e) => onChangeNama(e.target.value)}
                placeholder="Contoh: Dr. Arif Budiman"
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="visitor-identitas"
                  className="block text-xs font-medium text-slate-700"
                >
                  Nomor Identitas Pengunjung (NIK / Paspor)
                </label>
                <input
                  id="visitor-identitas"
                  type="text"
                  value={nomorIdentitas}
                  onChange={(e) => onChangeIdentitas(e.target.value)}
                  placeholder="Contoh: 3273011204750009"
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-mono text-slate-900 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="visitor-email"
                  className="block text-xs font-medium text-slate-700"
                >
                  Email Terdaftar Pengunjung
                </label>
                <input
                  id="visitor-email"
                  type="email"
                  value={emailPengunjung}
                  onChange={(e) => onChangeEmail(e.target.value)}
                  placeholder="tamu@mitra-eksternal.id"
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="visitor-status-awal"
                className="block text-xs font-medium text-slate-700"
              >
                Status Booking Awal
              </label>
              <select
                id="visitor-status-awal"
                value={statusAwal}
                onChange={(e) =>
                  onChangeStatus(e.target.value as BookingStatus)
                }
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500 cursor-pointer"
              >
                <option value="booked">booked</option>
                <option value="confirmed">confirmed</option>
              </select>
            </div>

            {formError && <AlertBanner variant="error" title={formError} />}

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pesan Tiket &amp; Kirim E-Tiket</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PesanTiketPengunjung({
  onNavigateToMonitoring,
}: Readonly<PesanTiketPengunjungProps>) {
  const { jadwalList, pemesananList, tambahPemesanan } = useApp();

  const [tujuanQuery, setTujuanQuery] = useState<string>('');
  const [selectedMaskapai, setSelectedMaskapai] = useState<string>('ALL');
  const [selectedTanggal, setSelectedTanggal] = useState<string>('ALL');

  const [selectedJadwal, setSelectedJadwal] =
    useState<JadwalPenerbangan | null>(null);
  const [namaPengunjung, setNamaPengunjung] = useState<string>('');
  const [nomorIdentitas, setNomorIdentitas] = useState<string>('');
  const [emailPengunjung, setEmailPengunjung] = useState<string>('');
  const [statusAwal, setStatusAwal] = useState<BookingStatus>('booked');
  const [formError, setFormError] = useState<string>('');
  const [createdResult, setCreatedResult] =
    useState<CreatedVisitorResult | null>(null);

  const maskapaiOptions = useMemo(
    () => extractUniqueSorted(jadwalList.map((item) => item.maskapai)),
    [jadwalList],
  );

  const tanggalOptions = useMemo(
    () =>
      extractUniqueSorted(jadwalList.map((item) => item.tanggalPenerbangan)),
    [jadwalList],
  );

  const filteredFlights = useMemo(
    () =>
      jadwalList.filter(
        (jadwal) =>
          matchesTextFilter(jadwal.tujuanPenerbangan, tujuanQuery) &&
          matchesExactFilter(jadwal.maskapai, selectedMaskapai) &&
          matchesExactFilter(jadwal.tanggalPenerbangan, selectedTanggal),
      ),
    [jadwalList, tujuanQuery, selectedMaskapai, selectedTanggal],
  );

  const handleResetFilters = () => {
    setTujuanQuery('');
    setSelectedMaskapai('ALL');
    setSelectedTanggal('ALL');
  };

  const handleSelectFlight = (jadwal: JadwalPenerbangan) => {
    setSelectedJadwal(jadwal);
    setFormError('');
    setCreatedResult(null);
  };

  const handleBackToSearch = () => {
    setSelectedJadwal(null);
    setFormError('');
  };

  const handleSubmitVisitorOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedJadwal) {
      return;
    }

    if (
      namaPengunjung.trim().length === 0 ||
      nomorIdentitas.trim().length === 0 ||
      emailPengunjung.trim().length === 0
    ) {
      setFormError(
        'Nama lengkap, nomor identitas (NIK/Paspor), dan email terdaftar pengunjung wajib diisi.',
      );
      return;
    }

    const newBooking = createVisitorBooking({
      jadwal: selectedJadwal,
      dataPengunjung: {
        nama: namaPengunjung,
        nomorIdentitas,
        email: emailPengunjung,
      },
      statusBooking: statusAwal,
      existingList: pemesananList,
    });

    tambahPemesanan(newBooking);
    setCreatedResult({ booking: newBooking, jadwal: selectedJadwal });
    setFormError('');
  };

  const handleStartNewVisitorOrder = () => {
    setCreatedResult(null);
    setSelectedJadwal(null);
    setNamaPengunjung('');
    setNomorIdentitas('');
    setEmailPengunjung('');
    setStatusAwal('booked');
  };

  if (createdResult) {
    return (
      <VisitorSuccessPanel
        result={createdResult}
        onStartNew={handleStartNewVisitorOrder}
        onNavigateToMonitoring={onNavigateToMonitoring}
      />
    );
  }

  if (selectedJadwal) {
    return (
      <VisitorFormStep
        jadwal={selectedJadwal}
        namaPengunjung={namaPengunjung}
        nomorIdentitas={nomorIdentitas}
        emailPengunjung={emailPengunjung}
        statusAwal={statusAwal}
        formError={formError}
        onChangeNama={setNamaPengunjung}
        onChangeIdentitas={setNomorIdentitas}
        onChangeEmail={setEmailPengunjung}
        onChangeStatus={setStatusAwal}
        onBack={handleBackToSearch}
        onSubmit={handleSubmitVisitorOrder}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div className="space-y-1.5">
            <label
              htmlFor="visitor-search-tujuan"
              className="block text-xs font-medium text-slate-600"
            >
              Cari Tujuan Penerbangan
            </label>
            <div className="relative">
              <Search
                className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="visitor-search-tujuan"
                type="text"
                value={tujuanQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setTujuanQuery(e.target.value)
                }
                placeholder="Misal: Singapura, Denpasar"
                className="w-full h-9 rounded-lg border border-slate-300 bg-white pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="visitor-filter-maskapai"
              className="block text-xs font-medium text-slate-600"
            >
              Maskapai
            </label>
            <select
              id="visitor-filter-maskapai"
              value={selectedMaskapai}
              onChange={(e) => setSelectedMaskapai(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500 cursor-pointer"
            >
              <option value="ALL">Semua Maskapai</option>
              {maskapaiOptions.map((maskapai) => (
                <option key={maskapai} value={maskapai}>
                  {maskapai}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="visitor-filter-tanggal"
              className="block text-xs font-medium text-slate-600"
            >
              Tanggal Penerbangan
            </label>
            <select
              id="visitor-filter-tanggal"
              value={selectedTanggal}
              onChange={(e) => setSelectedTanggal(e.target.value)}
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

          <div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600">
        <p>
          Langkah 1 dari 2 · Tersedia{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {filteredFlights.length}
          </span>{' '}
          jadwal penerbangan untuk pengunjung
        </p>
      </div>

      {filteredFlights.length === 0 ? (
        <EmptyState
          icon={<PlaneTakeoff className="w-5 h-5" aria-hidden="true" />}
          title="Jadwal penerbangan tidak ditemukan"
          description="Tidak ada jadwal yang sesuai dengan filter tujuan, maskapai, atau tanggal yang dipilih."
          action={
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Filter</span>
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
                  <th className="py-3 px-4 whitespace-nowrap">Rute</th>
                  <th className="py-3 px-4 whitespace-nowrap">Jadwal</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">
                    Harga
                  </th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm bg-white">
                {filteredFlights.map((jadwal) => (
                  <tr
                    key={jadwal.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {jadwal.maskapai}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        <span className="font-mono">
                          {jadwal.kodePenerbangan}
                        </span>{' '}
                        · {formatTransitLabel(jadwal.jumlahTransit)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 font-medium text-slate-900">
                        <span>{jadwal.lokasiKeberangkatan}</span>
                        <ArrowRight
                          className="w-3.5 h-3.5 text-slate-400"
                          aria-hidden="true"
                        />
                        <span>{jadwal.tujuanPenerbangan}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top whitespace-nowrap font-mono tabular-nums text-xs sm:text-sm text-slate-700">
                      {formatTanggalPenerbangan(jadwal.tanggalPenerbangan)} ·{' '}
                      {jadwal.jamKeberangkatan}
                    </td>
                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap font-mono tabular-nums font-semibold text-slate-900">
                      {formatRupiah(jadwal.hargaTiket)}
                    </td>
                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleSelectFlight(jadwal)}
                        className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Pilih Tiket untuk Pengunjung
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
