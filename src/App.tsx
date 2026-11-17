import { CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { isProfilLengkap, RoleType } from './types/models';

const ROLE_OPTIONS: { value: RoleType; label: string }[] = [
  { value: 'PENGGUNA', label: 'Pengguna' },
  { value: 'HRD_MANAJER', label: 'HRD Manajer' },
  { value: 'MEMBER_FREQUENT_TRAVELLER', label: 'Frequent Traveller' },
  { value: 'MANAJER_TRAVEL', label: 'Manajer Travel' },
  { value: 'PENGUNJUNG', label: 'Pengunjung' },
];

function SummaryMetric({
  label,
  count,
  detail,
}: {
  label: string;
  count: number;
  detail: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 font-mono tabular-nums">
        {count}
      </p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function ArchitectureStatusView() {
  const {
    currentRole,
    setCurrentRole,
    pegawaiList,
    permohonanCutiList,
    riwayatCutiList,
    jadwalList,
    profilMember,
    profilMemberAccounts,
    switchProfilMemberAccount,
    pemesananList,
    resetToInitialData,
  } = useApp();

  const cutiMenunggu = permohonanCutiList.filter(
    (item) => item.status === 'Menunggu',
  ).length;
  const cutiDisetujui = permohonanCutiList.filter(
    (item) => item.status === 'Disetujui',
  ).length;
  const cutiDitolak = permohonanCutiList.filter(
    (item) => item.status === 'Ditolak',
  ).length;

  const bookingConfirmed = pemesananList.filter(
    (item) => item.statusBooking === 'confirmed',
  ).length;
  const bookingBooked = pemesananList.filter(
    (item) => item.statusBooking === 'booked',
  ).length;
  const bookingWaiting = pemesananList.filter(
    (item) => item.statusBooking === 'waiting for the payment',
  ).length;

  const profilLengkap = isProfilLengkap(profilMember);
  const jadwalMultiDestinasi = jadwalList.filter(
    (item) => item.isMultiDestinasi,
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <span className="text-base font-semibold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            Portal HRD &amp; Corporate Travel
          </span>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#ringkasan"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Ringkasan Data
            </a>
            <a
              href="#modul-cuti"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Manajemen Cuti
            </a>
            <a
              href="#modul-travel"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Tiket &amp; Otorisasi
            </a>
          </nav>

          <button
            type="button"
            onClick={resetToInitialData}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Data Awal</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <section className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-500">
              Fondasi Arsitektur Modular · Tahap 1
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 text-balance">
              Status Penyimpanan Terpusat &amp; Validasi Skema Data
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Seluruh tipe data TypeScript, dataset simulasi awal, dan context
              state dengan sinkronisasi localStorage telah aktif dan dimuat
              melalui useApp().
            </p>
          </div>

          <div className="pt-2">
            <p className="text-xs font-medium text-slate-500 mb-2">
              Simulasi Peran Aktif ({currentRole})
            </p>
            <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
              {ROLE_OPTIONS.map((role) => {
                const isActive = currentRole === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setCurrentRole(role.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {role.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="ringkasan"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <SummaryMetric
            label="Data Pegawai"
            count={pegawaiList.length}
            detail="Pegawai aktif tahun berjalan"
          />
          <SummaryMetric
            label="Permohonan Cuti"
            count={permohonanCutiList.length}
            detail="Lintas tanggal &amp; status"
          />
          <SummaryMetric
            label="Riwayat Cuti"
            count={riwayatCutiList.length}
            detail="Catatan cuti tahun berjalan"
          />
          <SummaryMetric
            label="Jadwal Penerbangan"
            count={jadwalList.length}
            detail={`${jadwalMultiDestinasi} rute multi-destinasi`}
          />
          <SummaryMetric
            label="Pemesanan Tiket"
            count={pemesananList.length}
            detail="Seluruh status booking"
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            id="modul-cuti"
            className="bg-white border border-slate-200 rounded-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-slate-900">
                Modul Manajemen Cuti Pegawai
              </h2>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {pegawaiList.length} Pegawai
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-sm">
              <div className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-slate-600">Permohonan Menunggu</span>
                <span className="font-mono tabular-nums font-medium text-amber-700">
                  {cutiMenunggu}
                </span>
              </div>
              <div className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-slate-600">Permohonan Disetujui</span>
                <span className="font-mono tabular-nums font-medium text-emerald-700">
                  {cutiDisetujui}
                </span>
              </div>
              <div className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-slate-600">Permohonan Ditolak</span>
                <span className="font-mono tabular-nums font-medium text-rose-700">
                  {cutiDitolak}
                </span>
              </div>
              <div className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-slate-600">
                  Entri Riwayat Cuti (2026)
                </span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  {riwayatCutiList.length}
                </span>
              </div>
            </div>
          </div>

          <div
            id="modul-travel"
            className="bg-white border border-slate-200 rounded-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-slate-900">
                Modul Pemesanan &amp; Otorisasi Tiket
              </h2>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {pemesananList.length} Booking
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-sm">
              <div className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-slate-600">Status Confirmed</span>
                <span className="font-mono tabular-nums font-medium text-emerald-700">
                  {bookingConfirmed}
                </span>
              </div>
              <div className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-slate-600">Status Booked</span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  {bookingBooked}
                </span>
              </div>
              <div className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-slate-600">
                  Status Waiting for the Payment
                </span>
                <span className="font-mono tabular-nums font-medium text-amber-700">
                  {bookingWaiting}
                </span>
              </div>
              <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs text-slate-500">
                    Akun Simulasi Frequent Traveller
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <span>{profilMember.namaLengkap}</span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span className="font-mono text-xs text-slate-600">
                      {profilMember.memberId}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs pt-0.5">
                    {profilLengkap ? (
                      <>
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-emerald-600"
                          aria-hidden="true"
                        />
                        <span className="text-emerald-700 font-medium">
                          Profil Lengkap — Siap Validasi Tiket
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle
                          className="w-3.5 h-3.5 text-rose-600"
                          aria-hidden="true"
                        />
                        <span className="text-rose-700 font-medium">
                          Profil Belum Lengkap — Validasi Ditolak
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
                  {profilMemberAccounts.map((account) => {
                    const selected =
                      profilMember.memberId === account.memberId;
                    return (
                      <button
                        key={account.memberId}
                        type="button"
                        onClick={() =>
                          switchProfilMemberAccount(account.memberId)
                        }
                        className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          selected
                            ? 'bg-white text-slate-900 shadow-xs font-medium'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {account.memberId}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ArchitectureStatusView />
    </AppProvider>
  );
}
