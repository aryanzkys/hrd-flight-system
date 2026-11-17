import { ArrowRight, ShieldCheck, UserCog } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PROFIL_MEMBER_BELUM_LENGKAP,
  PROFIL_MEMBER_LENGKAP,
} from '../../data/mockData';
import {
  isProfilLengkap,
  JadwalPenerbangan,
  PemesananTiket,
  ProfilPersonal,
} from '../../types/models';
import { resolveJadwalByIds } from '../../utils/bookingUtils';
import { formatRupiah } from '../../utils/flightUtils';
import { AlertBanner } from '../common/AlertBanner';
import { VerificationBadge } from '../common/StatusBadge';

const REQUIRED_FIELDS: { key: keyof ProfilPersonal; label: string }[] = [
  { key: 'memberId', label: 'ID Member' },
  { key: 'namaLengkap', label: 'Nama Lengkap' },
  { key: 'nomorIdentitas', label: 'Nomor Identitas / NIK / Paspor' },
  { key: 'nomorTelepon', label: 'Nomor Telepon' },
  { key: 'email', label: 'Email' },
  { key: 'alamat', label: 'Alamat Lengkap' },
];

interface ValidationFeedback {
  success: boolean;
  message: string;
  kodeBooking: string;
  snapshotProfil?: ProfilPersonal;
}

function getMissingFields(profil: ProfilPersonal): string[] {
  return REQUIRED_FIELDS.filter(
    (field) => profil[field.key].trim().length === 0,
  ).map((field) => field.label);
}

function sanitizeProfilForm(form: ProfilPersonal): ProfilPersonal {
  return {
    memberId: form.memberId.trim(),
    namaLengkap: form.namaLengkap.trim(),
    nomorIdentitas: form.nomorIdentitas.trim(),
    nomorTelepon: form.nomorTelepon.trim(),
    alamat: form.alamat.trim(),
    email: form.email.trim(),
  };
}

function formatBookingOptionSummary(
  booking: PemesananTiket,
  jadwalList: JadwalPenerbangan[],
): string {
  const flights = resolveJadwalByIds(booking.jadwalIds, jadwalList);
  if (flights.length === 0) {
    return `${booking.kodeBookingReference} — Rute tidak ditemukan`;
  }
  const first = flights[0];
  const statusLabel = booking.isValidated
    ? 'Sudah Divalidasi'
    : 'Belum Divalidasi';
  return `${booking.kodeBookingReference} · ${first.maskapai} (${first.lokasiKeberangkatan} → ${first.tujuanPenerbangan}) — ${statusLabel}`;
}

interface ValidationFeedbackBoxProps {
  feedback: ValidationFeedback;
}

function ValidationFeedbackBox({
  feedback,
}: Readonly<ValidationFeedbackBoxProps>) {
  if (!feedback.success) {
    return (
      <AlertBanner
        variant="error"
        title={`Validasi Ditolak: ${feedback.message}`}
        description={
          <>
            Proses validasi untuk kode booking{' '}
            <span className="font-mono font-semibold">
              {feedback.kodeBooking}
            </span>{' '}
            ditolak karena{' '}
            <span className="font-semibold">{feedback.message}</span>. Harap
            lengkapi seluruh field profil personal dan klik Simpan Perubahan
            Profil terlebih dahulu.
          </>
        }
      />
    );
  }

  const snapshot = feedback.snapshotProfil;
  if (!snapshot) {
    return null;
  }

  return (
    <AlertBanner
      variant="success"
      title={feedback.message}
      description={
        <div className="bg-white/90 border border-emerald-200 rounded-md p-3 mt-1.5 space-y-1 text-slate-700">
          <p className="font-semibold text-slate-900">
            Bukti Validasi — {feedback.kodeBooking}
          </p>
          <p>
            <span className="text-slate-500">Nama Lengkap:</span>{' '}
            <span className="font-medium text-slate-900">
              {snapshot.namaLengkap}
            </span>
          </p>
          <p>
            <span className="text-slate-500">Nomor Identitas:</span>{' '}
            <span className="font-mono text-slate-900">
              {snapshot.nomorIdentitas}
            </span>
          </p>
          <p>
            <span className="text-slate-500">Nomor Telepon:</span>{' '}
            <span className="font-mono text-slate-900">
              {snapshot.nomorTelepon}
            </span>
          </p>
          <p>
            <span className="text-slate-500">Email:</span>{' '}
            <span className="text-slate-900">{snapshot.email}</span>
          </p>
          <p>
            <span className="text-slate-500">Alamat:</span>{' '}
            <span className="text-slate-900">{snapshot.alamat}</span>
          </p>
        </div>
      }
    />
  );
}

export function ProfilValidasiTiket() {
  const {
    profilMember,
    setProfilMember,
    pemesananList,
    jadwalList,
    validasiTiketMember,
  } = useApp();

  const [formData, setFormData] = useState<ProfilPersonal>(profilMember);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationFeedback, setValidationFeedback] =
    useState<ValidationFeedback | null>(null);

  const memberBookings = useMemo(
    () =>
      pemesananList.filter(
        (item) => item.pemesanRole === 'MEMBER_FREQUENT_TRAVELLER',
      ),
    [pemesananList],
  );

  const [selectedKodeBooking, setSelectedKodeBooking] = useState<string>(
    () => memberBookings[0]?.kodeBookingReference ?? '',
  );

  useEffect(() => {
    setFormData(profilMember);
  }, [profilMember]);

  const activeKodeBooking = useMemo(() => {
    const exists = memberBookings.some(
      (item) => item.kodeBookingReference === selectedKodeBooking,
    );
    if (exists) {
      return selectedKodeBooking;
    }
    return memberBookings[0]?.kodeBookingReference ?? '';
  }, [memberBookings, selectedKodeBooking]);

  const selectedBooking = useMemo(
    () =>
      memberBookings.find(
        (item) => item.kodeBookingReference === activeKodeBooking,
      ) ?? null,
    [memberBookings, activeKodeBooking],
  );

  const selectedBookingFlights = useMemo(
    () =>
      selectedBooking
        ? resolveJadwalByIds(selectedBooking.jadwalIds, jadwalList)
        : [],
    [selectedBooking, jadwalList],
  );

  const profilLengkap = isProfilLengkap(profilMember);
  const missingFields = getMissingFields(profilMember);
  const profileBadgeState = profilLengkap
    ? 'PROFILE_COMPLETE'
    : 'PROFILE_INCOMPLETE';

  const handleFieldChange =
    (field: keyof ProfilPersonal) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleaned = sanitizeProfilForm(formData);
    setProfilMember(cleaned);
    setFormData(cleaned);
    setSuccessMessage('Data profil personal berhasil diperbarui dan disimpan.');
    setValidationFeedback(null);
  };

  const handleLoadPreset = (preset: ProfilPersonal) => {
    setProfilMember({ ...preset });
    setSuccessMessage(null);
    setValidationFeedback(null);
  };

  const handleValidateTicket = () => {
    if (!activeKodeBooking) {
      return;
    }
    const result = validasiTiketMember(activeKodeBooking);
    if (!result.success) {
      setValidationFeedback({
        success: false,
        message: result.message,
        kodeBooking: activeKodeBooking,
      });
      return;
    }

    setValidationFeedback({
      success: true,
      message: result.message,
      kodeBooking: activeKodeBooking,
      snapshotProfil: { ...profilMember },
    });
  };

  return (
    <div className="space-y-6">
      <div className="border border-slate-200 rounded-lg bg-slate-50 p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <VerificationBadge state={profileBadgeState} />
            <span className="text-xs font-mono text-slate-500">
              Member ID: {profilMember.memberId}
            </span>
          </div>

          {profilLengkap ? (
            <p className="text-xs sm:text-sm text-slate-600">
              Seluruh data identitas dan kontak member telah terisi lengkap dan
              memenuhi syarat validasi tiket.
            </p>
          ) : (
            <div className="text-xs sm:text-sm text-rose-800 space-y-1">
              <p className="font-medium">
                Lengkapi field wajib berikut agar validasi tiket dapat
                diproses:
              </p>
              <p className="text-xs text-rose-700">
                Field masih kosong: {missingFields.join(', ')}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleLoadPreset(PROFIL_MEMBER_BELUM_LENGKAP)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer"
          >
            Muat Contoh Profil Tidak Lengkap
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset(PROFIL_MEMBER_LENGKAP)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer"
          >
            Muat Contoh Profil Lengkap
          </button>
        </div>
      </div>

      {successMessage && (
        <AlertBanner
          variant="success"
          title={successMessage}
          onDismiss={() => setSuccessMessage(null)}
          dismissLabel="Tutup pemberitahuan simpan profil"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 border border-slate-200 rounded-lg bg-white overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserCog
                className="w-4 h-4 text-slate-500"
                aria-hidden="true"
              />
              <h4 className="text-sm font-semibold text-slate-900">
                Pembaruan Data Profil Personal
              </h4>
            </div>
            <span className="text-xs text-slate-500">Semua field wajib</span>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="profil-member-id"
                  className="block text-xs font-medium text-slate-700"
                >
                  ID Member
                </label>
                <input
                  id="profil-member-id"
                  type="text"
                  value={formData.memberId}
                  disabled
                  readOnly
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-mono text-slate-600 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="profil-nama-lengkap"
                  className="block text-xs font-medium text-slate-700"
                >
                  Nama Lengkap
                </label>
                <input
                  id="profil-nama-lengkap"
                  type="text"
                  value={formData.namaLengkap}
                  onChange={handleFieldChange('namaLengkap')}
                  placeholder="Masukkan nama lengkap sesuai KTP/Paspor"
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="profil-nomor-identitas"
                  className="block text-xs font-medium text-slate-700"
                >
                  Nomor Identitas / NIK / Paspor
                </label>
                <input
                  id="profil-nomor-identitas"
                  type="text"
                  value={formData.nomorIdentitas}
                  onChange={handleFieldChange('nomorIdentitas')}
                  placeholder="Contoh: 3174051908890002"
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-mono text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="profil-nomor-telepon"
                  className="block text-xs font-medium text-slate-700"
                >
                  Nomor Telepon
                </label>
                <input
                  id="profil-nomor-telepon"
                  type="tel"
                  value={formData.nomorTelepon}
                  onChange={handleFieldChange('nomorTelepon')}
                  placeholder="Contoh: 081294827100"
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-mono text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="profil-email"
                className="block text-xs font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="profil-email"
                type="email"
                value={formData.email}
                onChange={handleFieldChange('email')}
                placeholder="nama@korporat.co.id"
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="profil-alamat"
                className="block text-xs font-medium text-slate-700"
              >
                Alamat Lengkap
              </label>
              <textarea
                id="profil-alamat"
                rows={3}
                value={formData.alamat}
                onChange={handleFieldChange('alamat')}
                placeholder="Masukkan alamat tempat tinggal lengkap"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-colors cursor-pointer"
              >
                Simpan Perubahan Profil
              </button>
            </div>
          </div>
        </form>

        <section className="lg:col-span-5 border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="w-4 h-4 text-slate-500"
                aria-hidden="true"
              />
              <h4 className="text-sm font-semibold text-slate-900">
                Panel Validasi Tiket Member
              </h4>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {memberBookings.length} Tiket
            </span>
          </div>

          <div className="p-5 space-y-4">
            {memberBookings.length === 0 ? (
              <p className="text-xs text-slate-600">
                Belum ada pesanan tiket milik Member Frequent Traveller yang
                perlu divalidasi.
              </p>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label
                    htmlFor="select-member-booking-validate"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Pilih Pesanan Tiket Member
                  </label>
                  <select
                    id="select-member-booking-validate"
                    value={activeKodeBooking}
                    onChange={(event) => {
                      setSelectedKodeBooking(event.target.value);
                      setValidationFeedback(null);
                    }}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500 cursor-pointer"
                  >
                    {memberBookings.map((booking) => (
                      <option
                        key={booking.kodeBookingReference}
                        value={booking.kodeBookingReference}
                      >
                        {formatBookingOptionSummary(booking, jadwalList)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBooking && (
                  <div className="border border-slate-200 rounded-lg bg-slate-50 p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold text-slate-900">
                        {selectedBooking.kodeBookingReference}
                      </span>
                      <VerificationBadge
                        state={
                          selectedBooking.isValidated
                            ? 'VALIDATED'
                            : 'UNVALIDATED'
                        }
                      />
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      {selectedBookingFlights.map((flight) => (
                        <div
                          key={flight.id}
                          className="flex items-center justify-between gap-2 text-slate-700"
                        >
                          <span className="font-medium">
                            {flight.maskapai} ({flight.kodePenerbangan})
                          </span>
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <span>{flight.lokasiKeberangkatan}</span>
                            <ArrowRight
                              className="w-3 h-3 text-slate-400"
                              aria-hidden="true"
                            />
                            <span>{flight.tujuanPenerbangan}</span>
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-slate-500">Total Harga</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-900">
                        {formatRupiah(selectedBooking.totalHarga)}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleValidateTicket}
                  className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Validasi Tiket</span>
                </button>
              </>
            )}

            {validationFeedback && (
              <ValidationFeedbackBox feedback={validationFeedback} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
