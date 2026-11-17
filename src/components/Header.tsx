import { RotateCcw, Users } from 'lucide-react';
import { ChangeEvent } from 'react';
import { ROLE_ORDER, roleConfig } from '../config/roleConfig';
import { useApp } from '../context/AppContext';
import { RoleType } from '../types/models';

export function Header() {
  const { currentRole, setCurrentRole, resetToInitialData } = useApp();

  const handleRoleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setCurrentRole(event.target.value as RoleType);
  };

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 truncate">
            Sistem Manajemen Cuti &amp; Tiket Penerbangan
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <label
              htmlFor="role-switcher"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 whitespace-nowrap shrink-0"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Peran Aktif</span>
            </label>
            <select
              id="role-switcher"
              value={currentRole}
              onChange={handleRoleChange}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500 transition-colors cursor-pointer"
            >
              {ROLE_ORDER.map((roleKey) => (
                <option key={roleKey} value={roleKey}>
                  {roleConfig[roleKey].label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={resetToInitialData}
            className="inline-flex items-center gap-2 h-9 px-3.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Data Awal</span>
          </button>
        </div>
      </div>
    </header>
  );
}
