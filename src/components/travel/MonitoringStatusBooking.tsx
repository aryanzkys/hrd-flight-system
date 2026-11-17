import { ArrowRight, ClipboardList } from 'lucide-react';
import { useMemo, useState } from 'react';
import { roleConfig } from '../../config/roleConfig';
import { useApp } from '../../context/AppContext';
import {
  BookingStatus,
  JadwalPenerbangan,
  PemesananTiket,
} from '../../types/models';
import { resolveJadwalByIds } from '../../utils/bookingUtils';
import {
  formatRupiah,
  formatTanggalPenerbangan,
} from '../../utils/flightUtils';
import { EmptyState } from '../common/EmptyState';
import {
  BookingStatusBadge,
  VerificationBadge,
} from '../common/StatusBadge';

type StatusFilter = 'ALL' | BookingStatus;

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Semua Status' },
  { value: 'confirmed', label: 'confirmed' },
  { value: 'booked', label: 'booked' },
  { value: 'waiting for the payment', label: 'waiting for the payment' },
];

interface PassengerCellProps {
  order: PemesananTiket;
}

function PassengerCell({ order }: Readonly<PassengerCellProps>) {
  const roleLabel = roleConfig[order.pemesanRole].label;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-medium text-slate-900">{order.namaPemesan}</span>
        {order.untukPengunjung && <VerificationBadge state="VISITOR_TAG" />}
      </div>
      <div className="text-xs text-slate-500 mt-0.5">
        {roleLabel} · {order.emailPemesan}
      </div>
    </div>
  );
}

interface MonitoringFlightCellProps {
  flights: JadwalPenerbangan[];
  jadwalIds: string[];
}

function MonitoringFlightCell({
  flights,
  jadwalIds,
}: Readonly<MonitoringFlightCellProps>) {
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

export function MonitoringStatusBooking() {
  const { pemesananList, jadwalList } = useApp();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const counts = useMemo(
    () => ({
      all: pemesananList.length,
      confirmed: pemesananList.filter(
        (item) => item.statusBooking === 'confirmed',
      ).length,
      booked: pemesananList.filter((item) => item.statusBooking === 'booked')
        .length,
      waiting: pemesananList.filter(
        (item) => item.statusBooking === 'waiting for the payment',
      ).length,
    }),
    [pemesananList],
  );

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'ALL') {
      return pemesananList;
    }
    return pemesananList.filter(
      (item) => item.statusBooking === statusFilter,
    );
  }, [pemesananList, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-slate-200 rounded-lg p-4 bg-white">
          <p className="text-xs font-medium text-slate-500">Semua Status</p>
          <p className="mt-1.5 text-2xl font-semibold text-slate-900 font-mono tabular-nums">
            {counts.all}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Total seluruh booking
          </p>
        </div>

        <div className="border border-slate-200 rounded-lg p-4 bg-white">
          <p className="text-xs font-medium text-emerald-700">confirmed</p>
          <p className="mt-1.5 text-2xl font-semibold text-emerald-700 font-mono tabular-nums">
            {counts.confirmed}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Terkonfirmasi &amp; siap jalan
          </p>
        </div>

        <div className="border border-slate-200 rounded-lg p-4 bg-white">
          <p className="text-xs font-medium text-sky-700">booked</p>
          <p className="mt-1.5 text-2xl font-semibold text-sky-700 font-mono tabular-nums">
            {counts.booked}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Reservasi tercatat aktif
          </p>
        </div>

        <div className="border border-slate-200 rounded-lg p-4 bg-white">
          <p className="text-xs font-medium text-amber-800">
            waiting for the payment
          </p>
          <p className="mt-1.5 text-2xl font-semibold text-amber-700 font-mono tabular-nums">
            {counts.waiting}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Menunggu penyelesaian pembayaran
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg"
          role="group"
          aria-label="Filter Status Booking"
        >
          {STATUS_FILTER_OPTIONS.map((option) => {
            const isSelected = statusFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-slate-600">
          Menampilkan{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {filteredBookings.length}
          </span>{' '}
          dari{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {pemesananList.length}
          </span>{' '}
          booking
        </p>
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-5 h-5" aria-hidden="true" />}
          title="Tidak ada transaksi dengan status tersebut"
          description={
            <>
              Belum ada kode booking dengan status{' '}
              <span className="font-mono font-semibold text-slate-800">
                {statusFilter}
              </span>
              .
            </>
          }
        />
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4 whitespace-nowrap">
                    Kode Booking Reference
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Pemesan / Penumpang
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Maskapai &amp; Rute Penerbangan
                  </th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">
                    Total Harga
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Status Booking
                  </th>
                  <th className="py-3 px-4 whitespace-nowrap">
                    Status Otorisasi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm bg-white">
                {filteredBookings.map((order) => {
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
                        <div className="text-xs font-mono tabular-nums text-slate-500 mt-0.5">
                          {formatTanggalPenerbangan(order.tanggalPemesanan)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <PassengerCell order={order} />
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <MonitoringFlightCell
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
                            order.isAuthorized ? 'AUTHORIZED' : 'UNAUTHORIZED'
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
