import { DashboardShell } from './components/DashboardShell';
import { Header } from './components/Header';
import { AppProvider } from './context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <DashboardShell />
      </div>
    </AppProvider>
  );
}
