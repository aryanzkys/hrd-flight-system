import {
  ArrowRight,
  Mail,
  Plane,
  Search,
  Ticket,
  X,
} from 'lucide-react';
import { ChangeEvent, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JadwalPenerbangan, PemesananTiket } from '../../types/models';
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

function matchesVisitorQuery(order: PemesananTiket, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) {
    return true;
  }

  const visitorName = (
    order.dataPengunjung?.nama ?? order.namaPemesan
  ).toLowerCase();
  const visitorEmail = (
    order.dataPengunjung?.email ?? order.emailPemesan
  ).toLowerCase();
  const code = order.kodeBookingReference.toLowerCase();

  return (
    visitorName.includes(normalized) ||
    visitorEmail.includes(normalized) ||
    code.includes(normalized)
  );
}

interface ETicketModalProps {
  order: PemesananTiket;
  flights: JadwalPenerbangan[];
  onClose: () => void;
}

function ETicketModal({
  order,
  flights,
  onClose,
}: Readonly<ETicketModalProps>) {
  const visitorName = order.dataPengunjung?.nama ?? order.namaPemesan;
  const visitorId = order.dataPengunjung?.nomorIdentitas ?? '-';
  const recipientEmail = order.dataPengunjung?.email ?? order.emailPemesan;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-eticket-title"
    >
      <div className="bg-white border border-slate-200 rounded-lg max-w-xl w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-600" aria-hidden="true" />
            <h4
              id="modal-eticket-title"
              className="text-sm sm:text-base font-semibold text-slate-900"
            >
              Notifikasi Email &amp; E-Tiket Elektronik
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pratinjau e-tiket"
            className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="border border-slate-200 rounded-lg bg-slate-50 p-4 text-xs space-y-1.5">
            <p>
              <span className="text-slate-500">Kepada:</span>{' '}
              <span className="font-medium text-slate-900">
                {recipientEmail}
              </span>
            </p>
            <p>
              <span className="text-slate-500">Subjek:</span>{' '}
              <span className="font-semibold text-slate-900">
                E-Tiket Perjalanan Korporat — {order.kodeBookingReference}
              </span>
            </p>
            <p className="text-slate-600 pt-1 leading-relaxed">
              Yth. {visitorName}, berikut adalah konfirmasi e-tiket elektronik
              Anda yang telah diterbitkan oleh Manajer Travel.
            </p>
          </div>

          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4" aria-hidden="true" />
                <span className="text-xs font-semibold tracking-wide">
                  E-TIKET ELEKTRONIK
                </span>
              </div>
              <span className="font-mono text-sm font-semibold">
                {order.kodeBookingReference}
              </span>
            </div>

            <div className="p-5 space-y-4 text-sm bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                <div>
                  <p className="text-xs text-slate-500">Nama Penumpang</p>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {visitorName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">
                    Nomor Identitas (NIK / Paspor)
                  </p>
                  <p className="font-mono text-slate-900 mt-0.5">{visitorId}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {flights.map((flight) => (
                  <div
                    key={flight.id}
                    className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-900">
                        {flight.maskapai}
                      </span>
                      <span className="font-mono text-slate-600">
                        {flight.kodePenerbangan}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <span>{flight.lokasiKeberangkatan}</span>
                      <ArrowRight
                        className="w-3.5 h-3.5 text-slate-400"
                        aria-hidden="true"
                      />
                      <span>{flight.tujuanPenerbangan}</span>
                    </div>
                    <div className="text-xs font-mono tabular-nums text-slate-600">
                      {formatTanggalPenerbangan(flight.tanggalPenerbangan)} ·{' '}
                      Keberangkatan {flight.jamKeberangkatan}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <BookingStatusBadge status={order.statusBooking} />
                  <VerificationBadge
                    state={order.isAuthorized ? 'AUTHORIZED' : 'WAITING_AUTH'}
                  />
                </div>
                <span className="font-mono tabular-nums font-semibold text-sm text-slate-900">
                  {formatRupiah(order.totalHarga)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TiketPengunjung() {
  const { pemesananList, jadwalList } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeETicketOrder, setActiveETicketOrder] =
    useState<PemesananTiket | null>(null);

  const visitorOrders = useMemo(
    () =>
      pemesananList.filter(
        (item) =>
          item.untukPengunjung && matchesVisitorQuery(item, searchQuery),
      ),
    [pemesananList, searchQuery],
  );

  const activeModalFlights = useMemo(
    () =>
      activeETicketOrder
        ? resolveJadwalByIds(activeETicketOrder.jadwalIds, jadwalList)
        : [],
    [activeETicketOrder, jadwalList],
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex-1 max-w-md space-y-1.5">
          <label
            htmlFor="visitor-ticket-search"
            className="block text-xs font-medium text-slate-600"
          >
            Cari Tiket Pengunjung
          </label>
          <div className="relative">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="visitor-ticket-search"
              type="text"
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Filter nama pengunjung, email, atau kode booking..."
              className="w-full h-9 rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
            />
          </div>
        </div>

        <p className="text-xs text-slate-600">
          Menampilkan{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-900">
            {visitorOrders.length}
          </span>{' '}
          tiket pengunjung
        </p>
      </div>

      {visitorOrders.length === 0 ? (
        <EmptyState
          icon={<Ticket className="w-5 h-5" aria-hidden="true" />}
          title="Belum ada tiket pengunjung yang cocok"
          description="Tiket yang dipesankan oleh Manajer Travel untuk pengunjung akan muncul otomatis di halaman ini."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visitorOrders.map((order) => {
            const flights = resolveJadwalByIds(order.jadwalIds, jadwalList);
            const visitorName =
              order.dataPengunjung?.nama ?? order.namaPemesan;
            const visitorId = order.dataPengunjung?.nomorIdentitas ?? '-';
            const visitorEmail =
              order.dataPengunjung?.email ?? order.emailPemesan;

            return (
              <article
                key={order.kodeBookingReference}
                className="border border-slate-200 rounded-lg bg-white overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <span className="font-mono text-base font-semibold text-slate-900">
                        {order.kodeBookingReference}
                      </span>
                      <p className="text-xs font-mono tabular-nums text-slate-500">
                        Dipesan {formatTanggalPenerbangan(order.tanggalPemesanan)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <BookingStatusBadge status={order.statusBooking} />
                      <VerificationBadge
                        state={
                          order.isAuthorized ? 'AUTHORIZED' : 'WAITING_AUTH'
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-slate-900 text-sm">
                      {visitorName}
                    </p>
                    <p className="text-slate-600">
                      Identitas:{' '}
                      <span className="font-mono text-slate-800">
                        {visitorId}
                      </span>{' '}
                      · {visitorEmail}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {flights.map((flight) => (
                      <div
                        key={flight.id}
                        className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2 font-medium text-slate-900">
                          <span>
                            {flight.maskapai} ({flight.kodePenerbangan})
                          </span>
                          <span className="font-mono tabular-nums font-semibold">
                            {formatRupiah(flight.hargaTiket)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <span>{flight.lokasiKeberangkatan}</span>
                          <ArrowRight
                            className="w-3 h-3 text-slate-400"
                            aria-hidden="true"
                          />
                          <span>{flight.tujuanPenerbangan}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {formatTanggalPenerbangan(
                              flight.tanggalPenerbangan,
                            )}{' '}
                            {flight.jamKeberangkatan}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                  {order.eTicketSent ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>E-Tiket Terkirim ke Email</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveETicketOrder(order)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Lihat Email &amp; E-Tiket
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500">
                      E-tiket belum diterbitkan ke email pengunjung
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {activeETicketOrder && (
        <ETicketModal
          order={activeETicketOrder}
          flights={activeModalFlights}
          onClose={() => setActiveETicketOrder(null)}
        />
      )}
    </div>
  );
}
