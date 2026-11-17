import {
  ArrowRight,
  Check,
  PlaneTakeoff,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookingStatus,
  JadwalPenerbangan,
  PemesananTiket,
} from '../../types/models';
import { createNewBooking } from '../../utils/bookingUtils';
import {
  filterFlightsByDestinations,
  formatRupiah,
  formatTanggalPenerbangan,
  formatTransitLabel,
  getUniqueDestinations,
} from '../../utils/flightUtils';
import { AlertBanner } from '../common/AlertBanner';
import { EmptyState } from '../common/EmptyState';

export interface CariPesanTiketProps {
  onBookFlight?: (jadwal: JadwalPenerbangan) => void;
  onNavigateToOrders?: () => void;
}

const DEFAULT_NAMA_PEMESAN = 'Budi Santoso';
const DEFAULT_EMAIL_PEMESAN = 'budi.santoso@email.com';

function formatActiveSearchSummary(
  selectedDestinations: string[],
  keywordInput: string,
): string {
  const parts: string[] = [...selectedDestinations];
  const trimmedKeyword = keywordInput.trim();
  if (trimmedKeyword.length > 0) {
    parts.push(`"${trimmedKeyword}"`);
  }
  return parts.length > 0 ? parts.join(', ') : 'Semua Tujuan';
}

interface BookingModalDialogProps {
  jadwal: JadwalPenerbangan;
  namaPemesan: string;
  emailPemesan: string;
  statusAwal: BookingStatus;
  formError: string;
  onChangeNama: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangeStatus: (value: BookingStatus) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function BookingModalDialog({
  jadwal,
  namaPemesan,
  emailPemesan,
  statusAwal,
  formError,
  onChangeNama,
  onChangeEmail,
  onChangeStatus,
  onClose,
  onSubmit,
}: Readonly<BookingModalDialogProps>) {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-booking-title"
    >
      <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h4
              id="modal-booking-title"
              className="text-base font-semibold text-slate-900"
            >
              Konfirmasi Pemesanan Tiket
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Periksa detail penerbangan dan lengkapi data pemesan.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal pemesanan"
            className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-slate-900">
                {jadwal.maskapai}
              </span>
              <span className="font-mono text-xs font-medium text-slate-600">
                {jadwal.kodePenerbangan}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span>{jadwal.lokasiKeberangkatan}</span>
              <ArrowRight
                className="w-3.5 h-3.5 text-slate-400"
                aria-hidden="true"
              />
              <span>{jadwal.tujuanPenerbangan}</span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200 text-xs">
              <span className="font-mono tabular-nums text-slate-600">
                {formatTanggalPenerbangan(jadwal.tanggalPenerbangan)} ·{' '}
                {jadwal.jamKeberangkatan}
              </span>
              <span className="font-mono tabular-nums font-semibold text-slate-900 text-sm">
                {formatRupiah(jadwal.hargaTiket)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="booking-nama-pemesan"
                className="block text-xs font-medium text-slate-700"
              >
                Nama Pemesan
              </label>
              <input
                id="booking-nama-pemesan"
                type="text"
                value={namaPemesan}
                onChange={(event) => onChangeNama(event.target.value)}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="booking-email-pemesan"
                className="block text-xs font-medium text-slate-700"
              >
                Email Pemesan
              </label>
              <input
                id="booking-email-pemesan"
                type="email"
                value={emailPemesan}
                onChange={(event) => onChangeEmail(event.target.value)}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="booking-status-awal"
                className="block text-xs font-medium text-slate-700"
              >
                Status Awal Transaksi
              </label>
              <select
                id="booking-status-awal"
                value={statusAwal}
                onChange={(event) =>
                  onChangeStatus(event.target.value as BookingStatus)
                }
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500 cursor-pointer"
              >
                <option value="booked">Booked</option>
                <option value="waiting for the payment">
                  Waiting for the Payment
                </option>
              </select>
            </div>
          </div>

          {formError && (
            <AlertBanner variant="error" title={formError} />
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Konfirmasi Pemesanan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CariPesanTiket({
  onBookFlight,
  onNavigateToOrders,
}: Readonly<CariPesanTiketProps>) {
  const { currentRole, jadwalList, pemesananList, tambahPemesanan } = useApp();
  const [keywordInput, setKeywordInput] = useState<string>('');
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    [],
  );

  const [bookingJadwal, setBookingJadwal] = useState<JadwalPenerbangan | null>(
    null,
  );
  const [namaPemesan, setNamaPemesan] = useState<string>(DEFAULT_NAMA_PEMESAN);
  const [emailPemesan, setEmailPemesan] = useState<string>(
    DEFAULT_EMAIL_PEMESAN,
  );
  const [statusAwal, setStatusAwal] = useState<BookingStatus>('booked');
  const [formError, setFormError] = useState<string>('');
  const [createdBooking, setCreatedBooking] = useState<PemesananTiket | null>(
    null,
  );

  const uniqueDestinations = useMemo(
    () => getUniqueDestinations(jadwalList),
    [jadwalList],
  );

  const filteredFlights = useMemo(
    () =>
      filterFlightsByDestinations(
        jadwalList,
        selectedDestinations,
        keywordInput,
      ),
    [jadwalList, selectedDestinations, keywordInput],
  );

  const hasActiveSearch =
    selectedDestinations.length > 0 || keywordInput.trim().length > 0;

  const activeSearchLabel = formatActiveSearchSummary(
    selectedDestinations,
    keywordInput,
  );

  const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setKeywordInput(event.target.value);
  };

  const handleToggleDestination = (destination: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(destination)
        ? prev.filter((item) => item !== destination)
        : [...prev, destination],
    );
  };

  const handleResetSearch = () => {
    setKeywordInput('');
    setSelectedDestinations([]);
  };

  const handleOpenBookingModal = (jadwal: JadwalPenerbangan) => {
    if (onBookFlight) {
      onBookFlight(jadwal);
      return;
    }
    setBookingJadwal(jadwal);
    setNamaPemesan(DEFAULT_NAMA_PEMESAN);
    setEmailPemesan(DEFAULT_EMAIL_PEMESAN);
    setStatusAwal('booked');
    setFormError('');
  };

  const handleCloseBookingModal = () => {
    setBookingJadwal(null);
    setFormError('');
  };

  const handleConfirmBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingJadwal) {
      return;
    }

    if (namaPemesan.trim().length === 0 || emailPemesan.trim().length === 0) {
      setFormError('Nama pemesan dan email pemesan wajib diisi.');
      return;
    }

    const pesananBaru = createNewBooking({
      jadwal: bookingJadwal,
      pemesanRole: currentRole,
      namaPemesan,
      emailPemesan,
      statusBooking: statusAwal,
      existingList: pemesananList,
    });

    tambahPemesanan(pesananBaru);
    setCreatedBooking(pesananBaru);
    setBookingJadwal(null);
    setFormError('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <label
              htmlFor="search-destination-input"
              className="block text-xs font-medium text-slate-700"
            >
              Cari Satu atau Beberapa Tujuan Penerbangan
            </label>
            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="search-destination-input"
                type="text"
                value={keywordInput}
                onChange={handleKeywordChange}
                placeholder="Ketik satu atau beberapa tujuan, misal: Jakarta, Denpasar, Surabaya"
                className="w-full h-10 rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetSearch}
            disabled={!hasActiveSearch}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Pencarian</span>
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-600">
            Pilih cepat kota tujuan (klik untuk memilih satu atau beberapa
            tujuan sekaligus):
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {uniqueDestinations.map((destination) => {
              const isSelected = selectedDestinations.includes(destination);
              return (
                <button
                  key={destination}
                  type="button"
                  onClick={() => handleToggleDestination(destination)}
                  aria-pressed={isSelected}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:text-slate-900'
                  }`}
                >
                  {isSelected && (
                    <Check className="w-3 h-3 shrink-0" aria-hidden="true" />
                  )}
                  <span>{destination}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {createdBooking && (
        <AlertBanner
          variant="success"
          title={
            <>
              Pemesanan tiket berhasil dibuat — Kode Booking:{' '}
              <span className="font-mono">
                {createdBooking.kodeBookingReference}
              </span>
            </>
          }
          description={
            <>
              Pemesan: {createdBooking.namaPemesan} · Status:{' '}
              <span className="font-medium">
                {createdBooking.statusBooking}
              </span>{' '}
              · Total: {formatRupiah(createdBooking.totalHarga)}
            </>
          }
          onDismiss={() => setCreatedBooking(null)}
          dismissLabel="Tutup pemberitahuan pemesanan"
          actions={
            onNavigateToOrders ? (
              <button
                type="button"
                onClick={onNavigateToOrders}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 rounded-md hover:bg-emerald-800 transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>Lihat Daftar Pesanan</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            ) : undefined
          }
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600">
        <p>
          Ditemukan{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {filteredFlights.length}
          </span>{' '}
          dari{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {jadwalList.length}
          </span>{' '}
          jadwal penerbangan
        </p>
        <p className="text-slate-500">Tujuan dicari: {activeSearchLabel}</p>
      </div>

      {filteredFlights.length === 0 ? (
        <EmptyState
          icon={<PlaneTakeoff className="w-5 h-5" aria-hidden="true" />}
          title="Jadwal penerbangan tidak ditemukan"
          description={
            <>
              Belum ada jadwal penerbangan yang tersedia untuk tujuan{' '}
              <span className="font-medium text-slate-800">
                {activeSearchLabel}
              </span>
              . Coba ubah kata kunci kota tujuan atau pilih destinasi lain.
            </>
          }
          action={
            hasActiveSearch ? (
              <button
                type="button"
                onClick={handleResetSearch}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Tampilkan Semua Jadwal</span>
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
                  <th className="py-3 px-4 whitespace-nowrap">
                    Maskapai &amp; Kode
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Rute Penerbangan
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Jadwal Penerbangan
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
                {filteredFlights.map((jadwal) => (
                  <tr
                    key={jadwal.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {jadwal.maskapai}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono font-medium text-slate-700">
                          {jadwal.kodePenerbangan}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{formatTransitLabel(jadwal.jumlahTransit)}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <div className="inline-flex items-center gap-2 font-medium text-slate-900 whitespace-nowrap">
                        <span>{jadwal.lokasiKeberangkatan}</span>
                        <ArrowRight
                          className="w-3.5 h-3.5 text-slate-400 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{jadwal.tujuanPenerbangan}</span>
                      </div>
                      {jadwal.isMultiDestinasi && jadwal.ruteMultiDestinasi && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Rute: {jadwal.ruteMultiDestinasi.join(' → ')}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="font-mono tabular-nums text-slate-900">
                        {formatTanggalPenerbangan(jadwal.tanggalPenerbangan)}
                      </div>
                      <div className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
                        Berangkat {jadwal.jamKeberangkatan}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap font-mono tabular-nums font-semibold text-slate-900">
                      {formatRupiah(jadwal.hargaTiket)}
                    </td>

                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenBookingModal(jadwal)}
                        className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Pesan Tiket
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {bookingJadwal && (
        <BookingModalDialog
          jadwal={bookingJadwal}
          namaPemesan={namaPemesan}
          emailPemesan={emailPemesan}
          statusAwal={statusAwal}
          formError={formError}
          onChangeNama={setNamaPemesan}
          onChangeEmail={setEmailPemesan}
          onChangeStatus={setStatusAwal}
          onClose={handleCloseBookingModal}
          onSubmit={handleConfirmBooking}
        />
      )}
    </div>
  );
}
