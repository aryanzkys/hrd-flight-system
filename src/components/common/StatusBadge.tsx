import { BookingStatus, StatusCuti } from '../../types/models';
import { BOOKING_STATUS_BADGE_MAP } from '../../utils/bookingUtils';

export type VerificationState =
  | 'VALIDATED'
  | 'UNVALIDATED'
  | 'AUTHORIZED'
  | 'UNAUTHORIZED'
  | 'WAITING_AUTH'
  | 'VERIFIED_AUTH'
  | 'PROFILE_COMPLETE'
  | 'PROFILE_INCOMPLETE'
  | 'VISITOR_TAG';

interface BadgeStyleMeta {
  label: string;
  className: string;
}

const CUTI_STATUS_LOOKUP: Record<StatusCuti, BadgeStyleMeta> = {
  Disetujui: {
    label: 'Disetujui',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  Menunggu: {
    label: 'Menunggu',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  Ditolak: {
    label: 'Ditolak',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

const VERIFICATION_LOOKUP: Record<VerificationState, BadgeStyleMeta> = {
  VALIDATED: {
    label: 'Sudah Divalidasi',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  UNVALIDATED: {
    label: 'Belum Divalidasi',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  AUTHORIZED: {
    label: 'Terotorisasi',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  UNAUTHORIZED: {
    label: 'Belum Diotorisasi',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  WAITING_AUTH: {
    label: 'Menunggu Otorisasi',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  VERIFIED_AUTH: {
    label: 'Terotorisasi (Verified)',
    className: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold',
  },
  PROFILE_COMPLETE: {
    label: 'Status Profil: Lengkap',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  PROFILE_INCOMPLETE: {
    label: 'Status Profil: Belum Lengkap',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  VISITOR_TAG: {
    label: 'Pengunjung',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
};

export interface BookingStatusBadgeProps {
  status: BookingStatus;
  rawText?: boolean;
}

export function BookingStatusBadge({
  status,
  rawText = false,
}: Readonly<BookingStatusBadgeProps>) {
  const meta = BOOKING_STATUS_BADGE_MAP[status];
  const displayText = rawText ? status : meta.label;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-medium whitespace-nowrap ${meta.className}`}
    >
      {displayText}
    </span>
  );
}

export interface CutiStatusBadgeProps {
  status: StatusCuti;
}

export function CutiStatusBadge({ status }: Readonly<CutiStatusBadgeProps>) {
  const meta = CUTI_STATUS_LOOKUP[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-medium whitespace-nowrap ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

export interface VerificationBadgeProps {
  state: VerificationState;
  customLabel?: string;
}

export function VerificationBadge({
  state,
  customLabel,
}: Readonly<VerificationBadgeProps>) {
  const meta = VERIFICATION_LOOKUP[state];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-medium whitespace-nowrap ${meta.className}`}
    >
      {customLabel ?? meta.label}
    </span>
  );
}
