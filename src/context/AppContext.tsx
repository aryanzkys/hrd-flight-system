import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  INITIAL_JADWAL_PENERBANGAN_LIST,
  INITIAL_PEGAWAI_LIST,
  INITIAL_PEMESANAN_TIKET_LIST,
  INITIAL_PERMOHONAN_CUTI_LIST,
  INITIAL_PROFIL_MEMBER_ACCOUNTS,
  INITIAL_RIWAYAT_CUTI_LIST,
  PROFIL_MEMBER_LENGKAP,
} from '../data/mockData';
import {
  JadwalPenerbangan,
  Pegawai,
  PemesananTiket,
  PermohonanCuti,
  ProfilPersonal,
  RiwayatCuti,
  RoleType,
} from '../types/models';

const STORAGE_KEY = 'portal_hr_travel_state_v1';

interface PersistedAppState {
  currentRole: RoleType;
  pegawaiList: Pegawai[];
  permohonanCutiList: PermohonanCuti[];
  riwayatCutiList: RiwayatCuti[];
  jadwalList: JadwalPenerbangan[];
  profilMember: ProfilPersonal;
  profilMemberAccounts: ProfilPersonal[];
  pemesananList: PemesananTiket[];
}

interface AppContextValue extends PersistedAppState {
  setCurrentRole: Dispatch<SetStateAction<RoleType>>;
  setPegawaiList: Dispatch<SetStateAction<Pegawai[]>>;
  setPermohonanCutiList: Dispatch<SetStateAction<PermohonanCuti[]>>;
  setRiwayatCutiList: Dispatch<SetStateAction<RiwayatCuti[]>>;
  setJadwalList: Dispatch<SetStateAction<JadwalPenerbangan[]>>;
  setProfilMember: Dispatch<SetStateAction<ProfilPersonal>>;
  setProfilMemberAccounts: Dispatch<SetStateAction<ProfilPersonal[]>>;
  switchProfilMemberAccount: (memberId: string) => void;
  setPemesananList: Dispatch<SetStateAction<PemesananTiket[]>>;
  resetToInitialData: () => void;
}

function createInitialState(): PersistedAppState {
  return {
    currentRole: 'PENGGUNA',
    pegawaiList: INITIAL_PEGAWAI_LIST,
    permohonanCutiList: INITIAL_PERMOHONAN_CUTI_LIST,
    riwayatCutiList: INITIAL_RIWAYAT_CUTI_LIST,
    jadwalList: INITIAL_JADWAL_PENERBANGAN_LIST,
    profilMember: PROFIL_MEMBER_LENGKAP,
    profilMemberAccounts: INITIAL_PROFIL_MEMBER_ACCOUNTS,
    pemesananList: INITIAL_PEMESANAN_TIKET_LIST,
  };
}

function loadStateFromStorage(): PersistedAppState {
  const defaults = createInitialState();
  if (typeof window === 'undefined') {
    return defaults;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaults;
    }
    const parsed = JSON.parse(raw) as Partial<PersistedAppState>;
    return {
      currentRole: parsed.currentRole ?? defaults.currentRole,
      pegawaiList: Array.isArray(parsed.pegawaiList)
        ? parsed.pegawaiList
        : defaults.pegawaiList,
      permohonanCutiList: Array.isArray(parsed.permohonanCutiList)
        ? parsed.permohonanCutiList
        : defaults.permohonanCutiList,
      riwayatCutiList: Array.isArray(parsed.riwayatCutiList)
        ? parsed.riwayatCutiList
        : defaults.riwayatCutiList,
      jadwalList: Array.isArray(parsed.jadwalList)
        ? parsed.jadwalList
        : defaults.jadwalList,
      profilMember: parsed.profilMember ?? defaults.profilMember,
      profilMemberAccounts: Array.isArray(parsed.profilMemberAccounts)
        ? parsed.profilMemberAccounts
        : defaults.profilMemberAccounts,
      pemesananList: Array.isArray(parsed.pemesananList)
        ? parsed.pemesananList
        : defaults.pemesananList,
    };
  } catch {
    return defaults;
  }
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [initialState] = useState<PersistedAppState>(() =>
    loadStateFromStorage(),
  );

  const [currentRole, setCurrentRole] = useState<RoleType>(
    initialState.currentRole,
  );
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>(
    initialState.pegawaiList,
  );
  const [permohonanCutiList, setPermohonanCutiList] = useState<
    PermohonanCuti[]
  >(initialState.permohonanCutiList);
  const [riwayatCutiList, setRiwayatCutiList] = useState<RiwayatCuti[]>(
    initialState.riwayatCutiList,
  );
  const [jadwalList, setJadwalList] = useState<JadwalPenerbangan[]>(
    initialState.jadwalList,
  );
  const [profilMember, setProfilMember] = useState<ProfilPersonal>(
    initialState.profilMember,
  );
  const [profilMemberAccounts, setProfilMemberAccounts] = useState<
    ProfilPersonal[]
  >(initialState.profilMemberAccounts);
  const [pemesananList, setPemesananList] = useState<PemesananTiket[]>(
    initialState.pemesananList,
  );

  useEffect(() => {
    const stateToPersist: PersistedAppState = {
      currentRole,
      pegawaiList,
      permohonanCutiList,
      riwayatCutiList,
      jadwalList,
      profilMember,
      profilMemberAccounts,
      pemesananList,
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist));
    } catch {
      // Ignore storage quota or private browsing errors
    }
  }, [
    currentRole,
    pegawaiList,
    permohonanCutiList,
    riwayatCutiList,
    jadwalList,
    profilMember,
    profilMemberAccounts,
    pemesananList,
  ]);

  const switchProfilMemberAccount = useCallback(
    (memberId: string) => {
      const target = profilMemberAccounts.find(
        (account) => account.memberId === memberId,
      );
      if (target) {
        setProfilMember(target);
      }
    },
    [profilMemberAccounts],
  );

  const resetToInitialData = useCallback(() => {
    const defaults = createInitialState();
    setCurrentRole(defaults.currentRole);
    setPegawaiList(defaults.pegawaiList);
    setPermohonanCutiList(defaults.permohonanCutiList);
    setRiwayatCutiList(defaults.riwayatCutiList);
    setJadwalList(defaults.jadwalList);
    setProfilMember(defaults.profilMember);
    setProfilMemberAccounts(defaults.profilMemberAccounts);
    setPemesananList(defaults.pemesananList);

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      currentRole,
      setCurrentRole,
      pegawaiList,
      setPegawaiList,
      permohonanCutiList,
      setPermohonanCutiList,
      riwayatCutiList,
      setRiwayatCutiList,
      jadwalList,
      setJadwalList,
      profilMember,
      setProfilMember,
      profilMemberAccounts,
      setProfilMemberAccounts,
      switchProfilMemberAccount,
      pemesananList,
      setPemesananList,
      resetToInitialData,
    }),
    [
      currentRole,
      pegawaiList,
      permohonanCutiList,
      riwayatCutiList,
      jadwalList,
      profilMember,
      profilMemberAccounts,
      switchProfilMemberAccount,
      pemesananList,
      resetToInitialData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp harus digunakan di dalam AppProvider');
  }
  return context;
}
