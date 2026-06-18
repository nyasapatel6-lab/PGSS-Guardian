import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoLocation from 'expo-location';
import { sbLogAlert, sbUpdateVitals, sbListenCommands } from '../lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserData {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  blood: string;
  guardian: {
    name: string;
    rel: string;
    phone: string;
    tele: string;
    email: string;
  };
  health: {
    cond: string;
    rhr: string;
    bp: string;
    meds: string;
    allergy: string;
  };
}

export interface LogEntry {
  id: number;
  type: 'critical' | 'warning' | 'normal';
  title: string;
  sev: number;
  gps: string;
  ts: number;
}

export interface GpsCoords {
  lat: string;
  lng: string;
}

interface AppState {
  user: UserData | null;
  setUser: (u: UserData) => void;
  connected: boolean;
  deviceIP: string;
  sleepMode: boolean;
  bpmHistory: number[];
  logData: LogEntry[];
  fallsToday: number;
  alertsToday: number;
  uptimeStart: number;
  stepCount: number;
  lastSeverity: number;
  gpsCoords: GpsCoords | null;
  currentBpm: number;
  battery: number;
  fallDetected: boolean;
  // Actions
  connectDevice: (ip: string, name: string) => void;
  disconnectDevice: () => void;
  toggleSleep: () => void;
  triggerFallAlert: (sev: number) => void;
  triggerPanic: () => void;
  triggerManualAlert: () => void;
  requestSummary: () => void;
  addLog: (entry: Omit<LogEntry, 'id'>) => void;
  refreshGPS: () => void;
  panicVisible: boolean;
  setPanicVisible: (v: boolean) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function genLogs(): LogEntry[] {
  const types: LogEntry['type'][] = [
    'normal', 'normal', 'warning', 'critical', 'warning', 'normal', 'critical',
  ];
  const titles = {
    normal: ['Normal monitoring session', 'Daily check completed', 'No anomalies detected', 'Routine check — all clear'],
    warning: ['No-motion alert (8AM–10PM)', 'Inactivity detected', 'Low battery warning', 'WiFi reconnection attempt'],
    critical: ['Fall detected — Severity 7/10', 'Fall detected — Severity 4/10', 'Panic button pressed', 'Fall detected — Severity 9/10'],
  };
  const logs: LogEntry[] = [];
  const now = Date.now();
  for (let i = 0; i < 24; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const ts = now - i * 43 * 60000 - Math.random() * 15 * 60000;
    const sev =
      type === 'critical'
        ? Math.ceil(Math.random() * 4 + 4)
        : type === 'warning'
        ? Math.ceil(Math.random() * 3 + 2)
        : 0;
    const titleArr = titles[type];
    logs.push({
      id: i,
      type,
      title: titleArr[Math.floor(Math.random() * titleArr.length)],
      sev,
      gps:
        type === 'critical'
          ? `18.${Math.floor(Math.random() * 9000 + 520000)},73.${Math.floor(Math.random() * 9000 + 850000)}`
          : '—',
      ts,
    });
  }
  return logs.sort((a, b) => b.ts - a.ts);
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppState>({} as AppState);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserData | null>(null);
  const [connected, setConnected] = useState(false);
  const [deviceIP, setDeviceIP] = useState('');
  const [sleepMode, setSleepMode] = useState(false);
  const [bpmHistory, setBpmHistory] = useState<number[]>([]);
  const [logData, setLogData] = useState<LogEntry[]>([]);
  const [fallsToday, setFallsToday] = useState(0);
  const [alertsToday, setAlertsToday] = useState(0);
  const [uptimeStart] = useState(Date.now());
  const [stepCount, setStepCount] = useState(Math.round(Math.random() * 3000 + 500));
  const [lastSeverity, setLastSeverity] = useState(0);
  const [gpsCoords, setGpsCoords] = useState<GpsCoords | null>(null);
  const [currentBpm, setCurrentBpm] = useState(72);
  const [battery, setBattery] = useState(0);
  const [fallDetected, setFallDetected] = useState(false);
  const [panicVisible, setPanicVisible] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  // ── Persist / load user ──────────────────────────────────────────────────
  const setUser = useCallback(async (u: UserData) => {
    setUserState(u);
    await AsyncStorage.setItem('pgss_u', JSON.stringify(u));
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('pgss_u').then((saved) => {
      if (saved) {
        try {
          setUserState(JSON.parse(saved));
        } catch {
          /* ignore */
        }
      }
    });
  }, []);

  // ── Init data when user is set ───────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const init: number[] = [];
    for (let i = 0; i < 10; i++) init.push(65 + Math.round(Math.random() * 20));
    setBpmHistory(init);
    setLogData(genLogs());
    refreshGPS();
    // Listen for remote Supabase commands
    unsubRef.current = sbListenCommands(toggleSleep, triggerPanic);
    return () => { unsubRef.current?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!user]);

  // ── Simulation heartbeat ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    startSim();
    const stepInt = setInterval(() => {
      if (!sleepMode) setStepCount((s) => s + Math.round(Math.random() * 3));
    }, 5000);
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      clearInterval(stepInt);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!user, sleepMode]);

  function startSim() {
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    let t = 0;
    simTimerRef.current = setInterval(() => {
      t++;
      const bpm = 60 + Math.round(Math.sin(t * 0.1) * 15 + Math.random() * 8);
      setCurrentBpm(bpm);
      setBpmHistory((prev) => {
        const next = [...prev, bpm];
        return next.length > 10 ? next.slice(-10) : next;
      });
      if (connected) setBattery(85 + Math.round(Math.random() * 10));
      if (connected && user) {
        sbUpdateVitals({ bpm, battery: connected ? 90 : 0, fall_score: 0, gps: gpsCoords, device: deviceIP });
      }
    }, 2000);
  }

  // ── GPS ──────────────────────────────────────────────────────────────────
  const refreshGPS = useCallback(async () => {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await ExpoLocation.getCurrentPositionAsync({});
      setGpsCoords({
        lat: loc.coords.latitude.toFixed(6),
        lng: loc.coords.longitude.toFixed(6),
      });
    } else {
      setGpsCoords({ lat: '18.520430', lng: '73.856744' });
    }
  }, []);

  // ── Device connection ────────────────────────────────────────────────────
  const connectDevice = useCallback((ip: string, name: string) => {
    setTimeout(() => {
      setConnected(true);
      setDeviceIP(ip);
      // Start HTTP polling
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = setInterval(async () => {
        try {
          const ctrl = new AbortController();
          const id = setTimeout(() => ctrl.abort(), 2000);
          const res = await fetch(`http://${ip}/data`, { signal: ctrl.signal });
          clearTimeout(id);
          const d = await res.json();
          if (d.bpm !== undefined) {
            setCurrentBpm(d.bpm);
            setBpmHistory((prev) => {
              const next = [...prev, d.bpm];
              return next.length > 10 ? next.slice(-10) : next;
            });
            if (d.battery) setBattery(d.battery);
            if (d.fall) triggerFallAlert(d.fall_score ?? Math.ceil(Math.random() * 5 + 3));
            if (d.gps) setGpsCoords({ lat: d.gps.lat, lng: d.gps.lng });
            sbUpdateVitals({ bpm: d.bpm, battery: d.battery ?? 85, fall_score: d.fall_score ?? 0, gps: gpsCoords, device: ip });
          }
        } catch { /* device offline — sim continues */ }
      }, 2000);
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsCoords]);

  const disconnectDevice = useCallback(() => {
    setConnected(false);
    setDeviceIP('');
    setBattery(0);
    if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
  }, []);

  // ── Sleep toggle ─────────────────────────────────────────────────────────
  const toggleSleep = useCallback(() => {
    setSleepMode((prev) => !prev);
  }, []);

  // ── Fall alert ───────────────────────────────────────────────────────────
  const triggerFallAlert = useCallback((sev: number) => {
    setLastSeverity(sev);
    setFallsToday((f) => f + 1);
    setAlertsToday((a) => a + 1);
    setFallDetected(true);
    const loc = gpsCoords ? `${gpsCoords.lat},${gpsCoords.lng}` : 'unknown';
    const entry: LogEntry = {
      id: Date.now(),
      type: 'critical',
      title: `Fall Detected — Severity ${sev}/10`,
      sev,
      gps: loc,
      ts: Date.now(),
    };
    setLogData((prev) => [entry, ...prev]);
    if (user) {
      sbLogAlert({ type: 'fall', severity: sev, gps: loc, user: user.name, guardian: user.guardian.tele, device: deviceIP || 'simulation' });
    }
    setTimeout(() => setFallDetected(false), 8000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsCoords, user, deviceIP]);

  // ── Panic ────────────────────────────────────────────────────────────────
  const triggerPanic = useCallback(() => {
    setPanicVisible(true);
    setAlertsToday((a) => a + 1);
    const loc = gpsCoords ? `${gpsCoords.lat},${gpsCoords.lng}` : 'unknown';
    if (user) {
      sbLogAlert({ type: 'panic', severity: 10, gps: loc, user: user.name, guardian: user.guardian.tele, device: deviceIP || 'simulation' });
    }
    const entry: LogEntry = {
      id: Date.now(),
      type: 'critical',
      title: 'Panic Button Pressed',
      sev: 10,
      gps: loc,
      ts: Date.now(),
    };
    setLogData((prev) => [entry, ...prev]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsCoords, user, deviceIP]);

  // ── Manual alert ─────────────────────────────────────────────────────────
  const triggerManualAlert = useCallback(() => {
    setAlertsToday((a) => a + 1);
    const loc = gpsCoords ? `${gpsCoords.lat},${gpsCoords.lng}` : 'unknown';
    if (user) {
      sbLogAlert({ type: 'manual', severity: 5, gps: loc, user: user.name, guardian: user.guardian.tele, device: deviceIP || 'simulation' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsCoords, user, deviceIP]);

  // ── Request daily summary ────────────────────────────────────────────────
  const requestSummary = useCallback(() => {
    // In a real implementation this would call a Supabase edge function or send a Telegram bot message
    console.log('Summary requested');
  }, []);

  const addLog = useCallback((entry: Omit<LogEntry, 'id'>) => {
    setLogData((prev) => [{ ...entry, id: Date.now() }, ...prev]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        connected,
        deviceIP,
        sleepMode,
        bpmHistory,
        logData,
        fallsToday,
        alertsToday,
        uptimeStart,
        stepCount,
        lastSeverity,
        gpsCoords,
        currentBpm,
        battery,
        fallDetected,
        connectDevice,
        disconnectDevice,
        toggleSleep,
        triggerFallAlert,
        triggerPanic,
        triggerManualAlert,
        requestSummary,
        addLog,
        refreshGPS,
        panicVisible,
        setPanicVisible,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
