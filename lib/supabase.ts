import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON } from '../constants/theme';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ── Insert a fall alert row into the "alerts" table ──
export async function sbLogAlert(payload: {
  type?: string;
  severity?: number;
  gps?: string | null;
  user?: string;
  guardian?: string;
  device?: string;
}) {
  await supabase.from('alerts').insert([
    {
      type: payload.type ?? 'fall',
      severity: payload.severity ?? 0,
      gps: payload.gps ?? null,
      user_name: payload.user ?? 'Unknown',
      guardian: payload.guardian ?? '',
      device_ip: payload.device ?? 'simulation',
    },
  ]);
}

// ── Upsert latest vitals into the "vitals" table (single row, id=1) ──
export async function sbUpdateVitals(vitals: {
  bpm: number;
  battery: number;
  fall_score: number;
  gps?: { lat: string; lng: string } | null;
  device?: string;
}) {
  await supabase.from('vitals').upsert([
    {
      id: 1,
      bpm: vitals.bpm ?? 0,
      battery: vitals.battery ?? 0,
      fall_score: vitals.fall_score ?? 0,
      gps_lat: vitals.gps ? parseFloat(vitals.gps.lat) : null,
      gps_lng: vitals.gps ? parseFloat(vitals.gps.lng) : null,
      device_ip: vitals.device ?? '',
    },
  ]);
}

// ── Realtime listener for remote commands (sleep / panic) ──
export function sbListenCommands(
  onSleep: () => void,
  onPanic: () => void
) {
  const channel = supabase
    .channel('commands')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'commands' },
      (payload) => {
        const cmd = payload.new as { action: string };
        if (cmd.action === 'sleep') onSleep();
        if (cmd.action === 'panic') onPanic();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
