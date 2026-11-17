import { ArrowRight, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { roleConfig } from '../../config/roleConfig';
import { useApp } from '../../context/AppContext';
import { JadwalPenerbangan, PemesananTiket } from '../../types/models';
import { resolveJadwalByIds } from '../../utils/bookingUtils';
import {
  formatRupiah,
  formatTanggalPenerbangan,
} from '../../utils/flightUtils';
import { AlertBanner } from '../common/AlertBanner';
import {
  BookingStatusBadge,
  VerificationBadge,
} from '../common/StatusBadge';

interface AuthorizationFeedback {
  success: boolean;
  message: string;
  attemptedCode: string;
  booking?: PemesananTiket;
}

interface VerifiedBookingCardProps {
  booking: PemesananTiket;
  message: string;
  jadwalList: JadwalPenerbangan[];
}

function VerifiedBookingCard({
  booking,
  message,
  jadwalList,
}: Readonly<VerifiedBookingCardProps>) {
  const flights = resolveJadwalByIds(booking.jadwalIds, jadwalList);
  const roleLabel = roleConfig[booking.pemesanRole].label;
  const passengerName = booking.dataPengunjung?.nama ?? booking.namaPemesan;
  const passengerEmail = booking.dataPengunjung?.email ?? booking.emailPemesan;

  return (
    <div
      role="status"
      className="border border-emerald-200 bg-emerald-50/80 rounded-lg p-5 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200">
        <div className="flex items-center gap-2.5">
          <CheckCircle2
            className="w-5 h-5 text-emerald-700 shrink-0"
            aria-hidden="true"
          />
          <div>
            <h4 className="text-sm sm:text-base font-semibold text-emerald-950">
              {message}
            </h4>
            <p className="text-xs text-emerald-800">
              Kode Booking Reference tervalidasi dan status booking telah
              diperiksa.
            </p>
          </div>
        </div>

        <VerificationBadge state="VERIFIED_AUTH" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-emerald-200 rounded-lg p-4 text-sm">
        <div>
          <p className="text-xs text-slate-500">Kode Booking Reference</p>
          <p className="font-mono text-base font-semibold text-slate-900 mt-0.5">
            {booking.kodeBookingReference}
          </p>
          <p className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
            Tanggal Pesan: {formatTanggalPenerbangan(booking.tanggalPemesanan)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Status Booking Terverifikasi</p>
          <div className="mt-1">
            <BookingStatusBadge status={booking.statusBooking} rawText />
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-500">Total Harga Tiket</p>
          <p className="font-mono tabular-nums text-base font-semibold text-slate-900 mt-0.5">
            {formatRupiah(booking.totalHarga)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-emerald-200 rounded-lg p-4 text-xs sm:text-sm">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500">
            Data Pemesan / Penumpang
          </p>
          <p className="font-semibold text-slate-900">{passengerName}</p>
          <p className="text-xs text-slate-600">
            {roleLabel} · {passengerEmail}
          </p>
          {booking.untukPengunjung && booking.dataPengunjung && (
            <p className="text-xs font-mono text-indigo-700 pt-0.5">
              Pengunjung · ID: {booking.dataPengunjung.nomorIdentitas}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500">
            Detail Maskapai &amp; Rute
          </p>
          {flights.map((flight) => (
            <div key={flight.id} className="text-xs space-y-0.5">
              <p className="font-semibold text-slate-900">
                {flight.maskapai} ({flight.kodePenerbangan})
              </p>
              <p className="text-slate-600 flex items-center gap-1.5">
                <span>{flight.lokasiKeberangkatan}</span>
                <ArrowRight
                  className="w-3 h-3 text-slate-400"
                  aria-hidden="true"
                />
                <span>{flight.tujuanPenerbangan}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {formatTanggalPenerbangan(flight.tanggalPenerbangan)}{' '}
                  {flight.jamKeberangkatan}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatAttemptedLabel(attemptedCode: string): string {
  if (attemptedCode.length > 0) {
    return `"${attemptedCode}"`;
  }
  return 'kosong';
}

export function OtorisasiKodeBooking() {
  const { pemesananList, jadwalList, otorisasiTiketByKode } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);

  const [kodeInput, setKodeInput] = useState<string>('');
  const [feedback, setFeedback] = useState<AuthorizationFeedback | null>(null);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setKodeInput(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const attempted = kodeInput.trim();
    const result = otorisasiTiketByKode(attempted);

    if (!result.success) {
      setFeedback({
        success: false,
        message: result.message,
        attemptedCode: attempted,
      });
      setKodeInput('');
      inputRef.current?.focus();
      return;
    }

    setFeedback({
      success: true,
      message: result.message,
      attemptedCode: attempted.toUpperCase(),
      booking: result.booking,
    });
  };

  const handleQuickFillCode = (code: string) => {
    setKodeInput(code);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="border border-slate-200 rounded-lg bg-slate-50 p-5 space-y-4"
      >
        <div className="space-y-1">
          <label
            htmlFor="input-kode-booking-reference"
            className="block text-xs sm:text-sm font-semibold text-slate-900"
          >
            Masukkan Kode Booking Reference
          </label>
          <p className="text-xs text-slate-600">
            Verifikasi kode booking untuk mengotorisasi tiket pesawat dan
            memeriksa status booking aktual.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <KeyRound
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              id="input-kode-booking-reference"
              type="text"
              value={kodeInput}
              onChange={handleInputChange}
              placeholder="Contoh: BK-202601"
              className="w-full h-10 rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm font-mono uppercase text-slate-900 placeholder:font-sans placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 text-xs sm:text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>Otorisasi &amp; Cek Status Booking</span>
          </button>
        </div>
      </form>

      {feedback && !feedback.success && (
        <AlertBanner
          variant="error"
          title={`Otorisasi Gagal: ${feedback.message}`}
          description={
            <>
              Input{' '}
              <span className="font-mono font-semibold">
                {formatAttemptedLabel(feedback.attemptedCode)}
              </span>{' '}
              ditolak karena{' '}
              <span className="font-semibold">{feedback.message}</span>. Silakan
              ulangi input dengan kode booking reference yang terdaftar pada
              sistem.
            </>
          }
        />
      )}

      {feedback?.success && feedback.booking && (
        <VerifiedBookingCard
          booking={feedback.booking}
          message={feedback.message}
          jadwalList={jadwalList}
        />
      )}

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <h4 className="text-xs font-semibold text-slate-700">
            Tabel Referensi Kode Booking Terdaftar (Bantuan Pengujian)
          </h4>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {pemesananList.length} Kode Booking
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-2.5 px-4 whitespace-nowrap">
                  Kode Booking Reference
                </th>
                <th className="py-2.5 px-4 whitespace-nowrap">Pemesan</th>
                <th className="py-2.5 px-4 whitespace-nowrap">
                  Status Booking
                </th>
                <th className="py-2.5 px-4 whitespace-nowrap">
                  Status Otorisasi
                </th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap">
                  Pilih Cepat
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm bg-white">
              {pemesananList.map((item) => (
                <tr
                  key={item.kodeBookingReference}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                    {item.kodeBookingReference}
                  </td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {item.namaPemesan}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <BookingStatusBadge status={item.statusBooking} />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <VerificationBadge
                      state={item.isAuthorized ? 'AUTHORIZED' : 'UNAUTHORIZED'}
                    />
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickFillCode(item.kodeBookingReference)
                      }
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Gunakan Kode
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
