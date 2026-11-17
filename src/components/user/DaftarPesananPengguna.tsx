import { AlertTriangle, ArrowRight, Ticket, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JadwalPenerbangan, PemesananTiket } from '../../types/models';
import { resolveJadwalByIds } from '../../utils/bookingUtils';
import {
  formatRupiah,
  formatTanggalPenerbangan,
} from '../../utils/flightUtils';
import { AlertBanner } from '../common/AlertBanner';
import { EmptyState } from '../common/EmptyState';
import { BookingStatusBadge } from '../common/StatusBadge';

export interface DaftarPesananPenggunaProps {
  onNavigateToSearch?: () => void;
}

interface FlightDetailsCellProps {
  flights: JadwalPenerbangan[];
  jadwalIds: string[];
}

function FlightDetailsCell({
  flights,
  jadwalIds,
}: Readonly<FlightDetailsCellProps>) {
  if (flights.length === 0) {
    return (
      <span className="text-xs text-slate-500">
        Jadwal tidak tersedia ({jadwalIds.join(', ')})
      </span>
    );
  }

  return (
    <div className="space-y-1.5">
      {flights.map((flight) => (
        <div key={flight.id}>
          <div className="font-medium text-slate-900">
            {flight.maskapai}{' '}
            <span className="font-mono text-xs text-slate-500">
              ({flight.kodePenerbangan})
            </span>
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
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
          </div>
        </div>
      ))}
    </div>
  );
}

export function DaftarPesananPengguna({
  onNavigateToSearch,
}: Readonly<DaftarPesananPenggunaProps>) {
  const { pemesananList, jadwalList, batalkanPemesanan } = useApp();
  const [confirmCancelTarget, setConfirmCancelTarget] =
    useState<PemesananTiket | null>(null);
  const [canceledCode, setCanceledCode] = useState<string | null>(null);

  const userOrders = useMemo(
    () => pemesananList.filter((item) => item.pemesanRole === 'PENGGUNA'),
    [pemesananList],
  );

  const handleConfirmCancel = () => {
    if (!confirmCancelTarget) {
      return;
    }
    const targetCode = confirmCancelTarget.kodeBookingReference;
    batalkanPemesanan(targetCode);
    setCanceledCode(targetCode);
    setConfirmCancelTarget(null);
  };

  return (
    <div className="space-y-6">
      {canceledCode && (
        <AlertBanner
          variant="success"
          title={
            <>
              Pesanan tiket dengan kode booking{' '}
              <span className="font-mono font-semibold">{canceledCode}</span>{' '}
              berhasil dibatalkan.
            </>
          }
          onDismiss={() => setCanceledCode(null)}
          dismissLabel="Tutup pemberitahuan pembatalan"
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600">
        <p>
          Total pesanan aktif Pengguna:{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {userOrders.length}
          </span>{' '}
          transaksi
        </p>
        <p className="text-slate-500">
          Perubahan status tersinkronisasi otomatis dengan Manajer Travel
        </p>
      </div>

      {userOrders.length === 0 ? (
        <EmptyState
          icon={<Ticket className="w-5 h-5" aria-hidden="true" />}
          title="Belum ada pesanan tiket aktif"
          description="Anda belum memiliki pemesanan tiket penerbangan untuk peran Pengguna. Cari jadwal penerbangan yang sesuai untuk membuat pemesanan baru."
          action={
            onNavigateToSearch ? (
              <button
                type="button"
                onClick={onNavigateToSearch}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span>Cari Jadwal Penerbangan</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
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
                  <th className="py-3 px-4 whitespace-nowrap">Kode Booking</th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Detail Penerbangan &amp; Maskapai
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Pemesan &amp; Tanggal
                  </th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">
                    Total Harga
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Status Booking
                  </th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm bg-white">
                {userOrders.map((order) => {
                  const flights = resolveJadwalByIds(
                    order.jadwalIds,
                    jadwalList,
                  );

                  return (
                    <tr
                      key={order.kodeBookingReference}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <span className="font-mono font-semibold text-slate-900">
                          {order.kodeBookingReference}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <FlightDetailsCell
                          flights={flights}
                          jadwalIds={order.jadwalIds}
                        />
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="font-medium text-slate-900">
                          {order.namaPemesan}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                          Dipesan{' '}
                          {formatTanggalPenerbangan(order.tanggalPemesanan)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap font-mono tabular-nums font-semibold text-slate-900">
                        {formatRupiah(order.totalHarga)}
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <BookingStatusBadge status={order.statusBooking} />
                      </td>

                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setConfirmCancelTarget(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Batalkan Tiket</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {confirmCancelTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-cancel-booking-title"
        >
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h4
                    id="modal-cancel-booking-title"
                    className="text-base font-semibold text-slate-900"
                  >
                    Batalkan Pesanan Tiket?
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Pesanan dengan kode booking{' '}
                    <span className="font-mono font-semibold text-slate-900">
                      {confirmCancelTarget.kodeBookingReference}
                    </span>{' '}
                    atas nama{' '}
                    <span className="font-medium text-slate-900">
                      {confirmCancelTarget.namaPemesan}
                    </span>{' '}
                    akan dihapus permanen dari daftar pesanan.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setConfirmCancelTarget(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 text-xs font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  Ya, Batalkan Tiket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
