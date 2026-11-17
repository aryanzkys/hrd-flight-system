import { ReactNode } from 'react';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: Readonly<EmptyStateProps>) {
  return (
    <div className="border border-slate-200 rounded-lg bg-slate-50/60 px-6 py-12 text-center space-y-3">
      <div className="mx-auto w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <div className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          {description}
        </div>
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
