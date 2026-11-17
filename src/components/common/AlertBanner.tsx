import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { ReactNode } from 'react';

export type AlertVariant = 'success' | 'warning' | 'error' | 'info';

interface AlertStyleMeta {
  containerClass: string;
  titleClass: string;
  bodyClass: string;
  closeClass: string;
  role: 'status' | 'alert';
}

const ALERT_STYLE_LOOKUP: Record<AlertVariant, AlertStyleMeta> = {
  success: {
    containerClass: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    titleClass: 'text-emerald-950',
    bodyClass: 'text-emerald-800',
    closeClass: 'text-emerald-700 hover:text-emerald-900',
    role: 'status',
  },
  warning: {
    containerClass: 'border-amber-200 bg-amber-50 text-amber-950',
    titleClass: 'text-amber-900',
    bodyClass: 'text-amber-800',
    closeClass: 'text-amber-700 hover:text-amber-900',
    role: 'alert',
  },
  error: {
    containerClass: 'border-rose-200 bg-rose-50 text-rose-950',
    titleClass: 'text-rose-900',
    bodyClass: 'text-rose-800',
    closeClass: 'text-rose-700 hover:text-rose-900',
    role: 'alert',
  },
  info: {
    containerClass: 'border-sky-200 bg-sky-50 text-sky-950',
    titleClass: 'text-sky-950',
    bodyClass: 'text-sky-800',
    closeClass: 'text-sky-700 hover:text-sky-900',
    role: 'status',
  },
};

function renderAlertIcon(variant: AlertVariant): ReactNode {
  if (variant === 'success') {
    return (
      <CheckCircle2
        className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5"
        aria-hidden="true"
      />
    );
  }
  if (variant === 'info') {
    return (
      <Info
        className="w-4 h-4 text-sky-700 shrink-0 mt-0.5"
        aria-hidden="true"
      />
    );
  }
  const colorClass = variant === 'error' ? 'text-rose-700' : 'text-amber-700';
  return (
    <AlertTriangle
      className={`w-4 h-4 ${colorClass} shrink-0 mt-0.5`}
      aria-hidden="true"
    />
  );
}

export interface AlertBannerProps {
  variant: AlertVariant;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export function AlertBanner({
  variant,
  title,
  description,
  actions,
  onDismiss,
  dismissLabel = 'Tutup pemberitahuan',
}: Readonly<AlertBannerProps>) {
  const style = ALERT_STYLE_LOOKUP[variant];

  return (
    <div
      role={style.role}
      className={`border rounded-lg px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${style.containerClass}`}
    >
      <div className="flex items-start gap-2.5 text-xs sm:text-sm">
        {renderAlertIcon(variant)}
        <div className="space-y-1">
          <div className={`font-semibold ${style.titleClass}`}>{title}</div>
          {description && (
            <div className={`text-xs leading-relaxed ${style.bodyClass}`}>
              {description}
            </div>
          )}
        </div>
      </div>

      {(actions || onDismiss) && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label={dismissLabel}
              className={`p-1.5 rounded cursor-pointer ${style.closeClass}`}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
