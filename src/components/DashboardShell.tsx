import { ReactNode, useEffect, useState } from 'react';
import { roleConfig } from '../config/roleConfig';
import { useApp } from '../context/AppContext';
import { DaftarPengajuanCuti } from './hrd/DaftarPengajuanCuti';
import { RiwayatSisaCuti } from './hrd/RiwayatSisaCuti';
import { MultiDestinasiKomparasi } from './member/MultiDestinasiKomparasi';
import { PesananMember } from './member/PesananMember';
import { ProfilValidasiTiket } from './member/ProfilValidasiTiket';
import { MonitoringStatusBooking } from './travel/MonitoringStatusBooking';
import { OtorisasiKodeBooking } from './travel/OtorisasiKodeBooking';
import { PesanTiketPengunjung } from './travel/PesanTiketPengunjung';
import { CariPesanTiket } from './user/CariPesanTiket';
import { DaftarPesananPengguna } from './user/DaftarPesananPengguna';
import { TiketPengunjung } from './visitor/TiketPengunjung';

const TAB_DESCRIPTION_LOOKUP: Record<string, string> = {
  'Daftar Pengajuan Cuti':
    'Tinjau daftar pengajuan cuti pegawai, saring berdasarkan tanggal, bulan, maupun tahun, dan pantau status pengajuannya.',
  'Riwayat & Sisa Cuti':
    'Pantau saldo sisa cuti tiap pegawai pada tahun berjalan dan telusuri riwayat pengambilan cutinya.',
  'Cari & Pesan Tiket':
    'Cari jadwal penerbangan berdasarkan satu atau beberapa tujuan sekaligus, lalu pilih jadwal yang ingin dipesan.',
  'Daftar Pesanan & Pembatalan':
    'Pantau seluruh pemesanan tiket Anda beserta status booking, dan lakukan pembatalan tiket jika diperlukan.',
  'Multi-Destinasi & Komparasi':
    'Telusuri jadwal penerbangan multi-destinasi, bandingkan harga dan jam keberangkatan antar maskapai, dan lakukan pemesanan tiket member.',
  'Profil & Validasi Tiket':
    'Perbarui data profil personal Member Frequent Traveller dan pantau kesiapan validasi tiket.',
  'Pesanan Saya':
    'Pantau seluruh kode booking, status pembayaran, serta status validasi tiket milik Member Frequent Traveller.',
  'Monitoring Status Booking':
    'Pantau seluruh transaksi booking korporat berdasarkan status confirmed, booked, dan waiting for the payment.',
  'Pesan Tiket Pengunjung':
    'Cari jadwal penerbangan dan buat pemesanan tiket khusus tamu atau pengunjung eksternal korporat.',
  'Otorisasi Kode Booking':
    'Masukkan kode booking reference untuk memverifikasi otorisasi tiket dan memeriksa status booking.',
  'Tiket & E-Tiket Saya':
    'Periksa status pemesanan tiket atas nama pengunjung serta pratinjau notifikasi email dan e-tiket elektronik.',
};

interface FeatureRenderContext {
  selectedPegawaiId?: string;
  onSelectPegawai: (pegawaiId: string) => void;
  onNavigateToOrders: () => void;
  onNavigateToSearch: () => void;
  onNavigateTab: (tabName: string) => void;
  onNavigateToMonitoring: () => void;
}

const FEATURE_TAB_RENDERERS: Record<
  string,
  (ctx: FeatureRenderContext) => ReactNode
> = {
  'HRD_MANAJER:Daftar Pengajuan Cuti': (ctx) => (
    <DaftarPengajuanCuti onSelectPegawai={ctx.onSelectPegawai} />
  ),
  'HRD_MANAJER:Riwayat & Sisa Cuti': (ctx) => (
    <RiwayatSisaCuti initialPegawaiId={ctx.selectedPegawaiId} />
  ),
  'PENGGUNA:Cari & Pesan Tiket': (ctx) => (
    <CariPesanTiket onNavigateToOrders={ctx.onNavigateToOrders} />
  ),
  'PENGGUNA:Daftar Pesanan & Pembatalan': (ctx) => (
    <DaftarPesananPengguna onNavigateToSearch={ctx.onNavigateToSearch} />
  ),
  'MEMBER_FREQUENT_TRAVELLER:Multi-Destinasi & Komparasi': (ctx) => (
    <MultiDestinasiKomparasi onNavigateTab={ctx.onNavigateTab} />
  ),
  'MEMBER_FREQUENT_TRAVELLER:Profil & Validasi Tiket': () => (
    <ProfilValidasiTiket />
  ),
  'MEMBER_FREQUENT_TRAVELLER:Pesanan Saya': (ctx) => (
    <PesananMember onNavigateTab={ctx.onNavigateTab} />
  ),
  'MANAJER_TRAVEL:Monitoring Status Booking': () => (
    <MonitoringStatusBooking />
  ),
  'MANAJER_TRAVEL:Pesan Tiket Pengunjung': (ctx) => (
    <PesanTiketPengunjung onNavigateToMonitoring={ctx.onNavigateToMonitoring} />
  ),
  'MANAJER_TRAVEL:Otorisasi Kode Booking': () => <OtorisasiKodeBooking />,
  'PENGUNJUNG:Tiket & E-Tiket Saya': () => <TiketPengunjung />,
};

export function DashboardShell() {
  const { currentRole } = useApp();

  const activeConfig = roleConfig[currentRole];
  const [activeTab, setActiveTab] = useState<string>(activeConfig.tabs[0]);
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    setActiveTab(roleConfig[currentRole].tabs[0]);
    setSelectedPegawaiId(undefined);
  }, [currentRole]);

  const handleSelectPegawai = (pegawaiId: string) => {
    setSelectedPegawaiId(pegawaiId);
    setActiveTab('Riwayat & Sisa Cuti');
  };

  const handleNavigateToOrders = () => {
    setActiveTab('Daftar Pesanan & Pembatalan');
  };

  const handleNavigateToSearch = () => {
    setActiveTab('Cari & Pesan Tiket');
  };

  const handleNavigateToMonitoring = () => {
    setActiveTab('Monitoring Status Booking');
  };

  const resolvedActiveTab = activeConfig.tabs.includes(activeTab)
    ? activeTab
    : activeConfig.tabs[0];

  const tabDescription =
    TAB_DESCRIPTION_LOOKUP[resolvedActiveTab] ??
    'Ruang kerja modular siap digunakan.';

  const featureKey = `${currentRole}:${resolvedActiveTab}`;
  const renderFeatureContent = FEATURE_TAB_RENDERERS[featureKey];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <section className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-medium whitespace-nowrap shrink-0 w-fit ${activeConfig.badgeColor}`}
            >
              {activeConfig.label}
            </span>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Ruang Kerja {activeConfig.label}
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              {activeConfig.description}
            </p>
          </div>

          <div className="text-xs font-mono text-slate-500 whitespace-nowrap shrink-0">
            {activeConfig.tabs.length} Modul Menu Tersedia
          </div>
        </div>

        <nav
          aria-label="Navigasi Modul Peran"
          className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-2 overflow-x-auto"
        >
          {activeConfig.tabs.map((tabName) => {
            const isSelected = resolvedActiveTab === tabName;
            return (
              <button
                key={tabName}
                type="button"
                onClick={() => setActiveTab(tabName)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tabName}
              </button>
            );
          })}
        </nav>
      </section>

      <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">
              {activeConfig.label} · Menu Aktif
            </p>
            <h3 className="text-lg font-semibold text-slate-900">
              {resolvedActiveTab}
            </h3>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              {tabDescription}
            </p>
          </div>
        </div>

        {renderFeatureContent?.({
          selectedPegawaiId,
          onSelectPegawai: handleSelectPegawai,
          onNavigateToOrders: handleNavigateToOrders,
          onNavigateToSearch: handleNavigateToSearch,
          onNavigateTab: setActiveTab,
          onNavigateToMonitoring: handleNavigateToMonitoring,
        })}
      </section>
    </main>
  );
}
