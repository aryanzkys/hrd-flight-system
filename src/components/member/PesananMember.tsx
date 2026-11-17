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
import {
  BookingStatusBadge,
  VerificationBadge,
} from '../common/StatusBadge';

export interface PesananMemberProps {
  onNavigateTab?: (tabName: string) => void;
}

interface MemberFlightCellProps {
  flights: JadwalPenerbangan[];
  jadwalIds: string[];
}

function MemberFlightCell({
  flights,
  jadwalIds,
}: Readonly<MemberFlightCellProps>) {
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

export function PesananMember({
  onNavigateTab,
}: Readonly<PesananMemberProps>) {
  const { pemesananList, jadwalList, batalkanPemesanan } = useApp();
  const [confirmCancelOrder, setConfirmCancelOrder] =
    useState<PemesananTiket | null>(null);
  const [canceledCode, setCanceledCode] = useState<string | null>(null);

  const memberOrders = useMemo(
    () =>
      pemesananList.filter(
        (item) => item.pemesanRole === 'MEMBER_FREQUENT_TRAVELLER',
      ),
    [pemesananList],
  );

  const handleConfirmCancel = () => {
    if (!confirmCancelOrder) {
      return;
    }
    const targetCode = confirmCancelOrder.kodeBookingReference;
    batalkanPemesanan(targetCode);
    setCanceledCode(targetCode);
    setConfirmCancelOrder(null);
  };

  return (
    <div className="space-y-6">
      {canceledCode && (
        <AlertBanner
          variant="success"
          title={
            <>
              Pesanan member dengan kode booking{' '}
              <span className="font-mono font-semibold">{canceledCode}</span>{' '}
              telah dibatalkan.
            </>
          }
          onDismiss={() => setCanceledCode(null)}
          dismissLabel="Tutup pemberitahuan pembatalan"
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600">
        <p>
          Total pesanan Member Frequent Traveller:{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {memberOrders.length}
          </span>{' '}
          tiket
        </p>
        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('Profil & Validasi Tiket')}
            className="text-xs font-medium text-slate-700 hover:text-slate-900 underline cursor-pointer self-start sm:self-auto"
          >
            Kelola Profil &amp; Validasi Tiket →
          </button>
        )}
      </div>

      {memberOrders.length === 0 ? (
        <EmptyState
          icon={<Ticket className="w-5 h-5" aria-hidden="true" />}
          title="Belum ada pesanan tiket member"
          description="Anda belum memiliki pesanan aktif sebagai Member Frequent Traveller. Gunakan menu Multi-Destinasi & Komparasi untuk memesan penerbangan."
          action={
            onNavigateTab ? (
              <button
                type="button"
                onClick={() => onNavigateTab('Multi-Destinasi & Komparasi')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span>Cari &amp; Bandingkan Penerbangan</span>
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
                    Detail Jadwal Penerbangan
                  </th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">
                    Total Harga
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Status Booking
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Status Validasi
                  </th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm bg-white">
                {memberOrders.map((order) => {
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
                        <div className="font-mono font-semibold text-slate-900">
                          {order.kodeBookingReference}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                          {formatTanggalPenerbangan(order.tanggalPemesanan)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <MemberFlightCell
                          flights={flights}
                          jadwalIds={order.jadwalIds}
                        />
                      </td>

                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap font-mono tabular-nums font-semibold text-slate-900">
                        {formatRupiah(order.totalHarga)}
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <BookingStatusBadge status={order.statusBooking} />
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <VerificationBadge
                          state={
                            order.isValidated ? 'VALIDATED' : 'UNVALIDATED'
                          }
                        />
                      </td>

                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setConfirmCancelOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Batalkan Pesanan</span>
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

      {confirmCancelOrder && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-cancel-member-order-title"
        >
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h4
                    id="modal-cancel-member-order-title"
                    className="text-base font-semibold text-slate-900"
                  >
                    Batalkan Pesanan Member?
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Pesanan member dengan kode booking{' '}
                    <span className="font-mono font-semibold text-slate-900">
                      {confirmCancelOrder.kodeBookingReference}
                    </span>{' '}
                    akan dihapus dari daftar pemesanan.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setConfirmCancelOrder(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 text-xs font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  Ya, Batalkan Pesanan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
