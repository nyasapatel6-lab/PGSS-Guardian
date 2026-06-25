import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Linking,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS, RADIUS } from '../../constants/theme';

function getGreet() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning 👋' : h < 17 ? 'Good afternoon 👋' : 'Good evening 👋';
}

function useClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    function tick() {
      const d = new Date();
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      const s = d.getSeconds().toString().padStart(2, '0');
      const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      setTime(`${h}:${m}:${s} · ${date}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function DashboardScreen() {
  const app = useApp();
  const clock = useClock();
  const bpm = app.currentBpm;
  const bpmStatus = bpm > 100 ? 'HIGH' : bpm < 55 ? 'LOW' : 'Normal';

  function openMaps() {
    if (app.gpsCoords) {
      Linking.openURL(`https://maps.google.com/?q=${app.gpsCoords.lat},${app.gpsCoords.lng}`);
    }
  }

  function callGuardian() {
    if (app.user?.guardian.phone) Linking.openURL(`tel:${app.user.guardian.phone.replace(/\s/g, '')}`);
  }
  function smsGuardian() {
    if (app.user?.guardian.phone) {
      const gps = app.gpsCoords ? `+GPS:+https://maps.google.com/?q=${app.gpsCoords.lat},${app.gpsCoords.lng}` : '';
      Linking.openURL(`sms:${app.user.guardian.phone.replace(/\s/g, '')}?body=PGSS+ALERT:+Please+check+on+${encodeURIComponent(app.user.name)}${gps}`);
    }
  }
  function teleGuardian() {
    const t = app.user?.guardian.tele?.replace('@', '');
    if (t) Linking.openURL(`https://t.me/${t}`);
  }
  function emailGuardian() {
    if (app.user?.guardian.email) {
      const gps = app.gpsCoords ? `. GPS: https://maps.google.com/?q=${app.gpsCoords.lat},${app.gpsCoords.lng}` : '';
      Linking.openURL(`mailto:${app.user.guardian.email}?subject=PGSS+Emergency+Alert&body=Please+check+on+${encodeURIComponent(app.user!.name)}${gps}`);
    }
  }

  const mins = Math.floor((Date.now() - app.uptimeStart) / 60000);
  const uptime = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Fall detected banner */}
      {app.fallDetected && (
        <View style={[styles.banner, { backgroundColor: 'rgba(198,40,40,0.12)', borderColor: 'rgba(239,83,80,0.3)' }]}>
          <Text style={{ fontSize: 20 }}>🆘</Text>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.accent2 }}>Fall Detected!</Text>
            <Text style={{ fontSize: 11, color: COLORS.text2 }}>Severity {app.lastSeverity}/10 · GPS sent · Alert via Telegram</Text>
          </View>
        </View>
      )}
      {app.sleepMode && (
        <View style={[styles.banner, { backgroundColor: 'rgba(127,119,221,0.1)', borderColor: 'rgba(127,119,221,0.3)' }]}>
          <Text style={{ fontSize: 20 }}>🌙</Text>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.purple }}>Sleep Mode Active</Text>
            <Text style={{ fontSize: 11, color: COLORS.text2 }}>No-motion alerts suppressed.</Text>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topbar}>
          <View>
            <Text style={styles.greet}>{getGreet()}</Text>
            <Text style={styles.userName}>{app.user?.name ?? '...'}</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={[styles.sdot, { backgroundColor: app.sleepMode ? COLORS.purple : app.connected ? COLORS.teal : COLORS.text3 }]} />
            <Text style={styles.statusTxt}>{app.sleepMode ? 'Sleep mode' : app.connected ? 'Connected' : 'No device'}</Text>
          </View>
        </View>

        {/* RTC Clock */}
        <Text style={styles.rtcClock}>{clock}</Text>

        {/* BPM Hero */}
        <View style={styles.heroCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={[styles.liveDot]} />
            <Text style={{ fontSize: 10, color: COLORS.text3, marginLeft: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Live Heart Rate</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={styles.bpmNum}>{bpm}</Text>
            <Text style={styles.bpmUnit}>BPM</Text>
            <View style={{ marginLeft: 'auto' }}>
              <View style={[styles.bpmTag, bpmStatus === 'Normal' ? styles.tagNormal : bpmStatus === 'HIGH' ? styles.tagHigh : styles.tagLow]}>
                <Text style={[styles.bpmTagTxt, bpmStatus === 'Normal' ? { color: COLORS.teall } : bpmStatus === 'HIGH' ? { color: COLORS.accent2 } : { color: COLORS.amber }]}>{bpmStatus}</Text>
              </View>
            </View>
          </View>
          {/* Mini ECG bars */}
          <View style={{ flexDirection: 'row', height: 36, alignItems: 'flex-end', gap: 2, marginTop: 10 }}>
            {app.bpmHistory.map((v, i) => {
              const max = Math.max(...app.bpmHistory);
              const min = Math.min(...app.bpmHistory);
              const h = Math.round(8 + ((v - min) / (max - min || 1)) * 26);
              return <View key={i} style={{ flex: 1, height: h, borderRadius: 2, backgroundColor: v > 100 ? 'rgba(239,83,80,0.6)' : 'rgba(29,158,117,0.5)' }} />;
            })}
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard icon="📍" badge="READY" badgeStyle="info" val="SAFE" valColor={COLORS.green} label="FALL DETECT" sub="3-frame debounce" />
          <StatCard icon="⚡" badge={app.battery > 20 ? 'OK' : 'LOW'} badgeStyle={app.battery > 20 ? 'ok' : 'warn'} val={app.connected ? `${app.battery}%` : '--%'} valColor={app.battery < 20 ? COLORS.amber : COLORS.green} label="BATTERY" sub={app.connected ? (app.battery > 20 ? 'Battery OK' : 'Low battery!') : 'Connect device'} />
          <StatCard icon="👟" badge="EST." badgeStyle="info" val={app.stepCount.toLocaleString()} valColor={COLORS.bluel} label="STEP COUNT" sub="Daily summary · Telegram" />
          <StatCard icon="🐕" badge="OK" badgeStyle="ok" val="ACTIVE" valColor={COLORS.green} label="WATCHDOG" sub="30s auto-reboot" />
        </View>

        {/* Fall Severity */}
        {app.lastSeverity > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Fall Severity Score</Text>
            <Text style={[styles.sevNum, { color: app.lastSeverity <= 3 ? COLORS.teall : app.lastSeverity <= 6 ? COLORS.amber : COLORS.accent2 }]}>
              {app.lastSeverity}/10
            </Text>
            <View style={styles.sevBarBg}>
              <View style={[styles.sevBarFill, {
                width: `${app.lastSeverity * 10}%` as `${number}%`,
                backgroundColor: app.lastSeverity <= 3 ? COLORS.teall : app.lastSeverity <= 6 ? COLORS.amber : COLORS.accent2,
              }]} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
              <Text style={{ fontSize: 10, color: COLORS.text3 }}>Low (1)</Text>
              <Text style={{ fontSize: 10, color: COLORS.text3 }}>High (10)</Text>
            </View>
          </View>
        )}

        {/* GPS Card */}
        <TouchableOpacity style={styles.gpsCard} onPress={openMaps}>
          <Text style={{ fontSize: 28 }}>📡</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.text }}>GPS Location</Text>
            <Text style={{ fontSize: 11, color: COLORS.text2, marginTop: 2 }}>
              {app.gpsCoords ? `${app.gpsCoords.lat}, ${app.gpsCoords.lng}` : 'Acquiring coordinates...'}
            </Text>
            <Text style={{ fontSize: 11, color: COLORS.bluel, marginTop: 4 }}>↗ Open in Google Maps</Text>
          </View>
        </TouchableOpacity>

        {/* Guardian */}
        <Text style={styles.sectionHdr}>Emergency Contact</Text>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.avatar}><Text style={{ fontSize: 18 }}>👤</Text></View>
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text }}>{app.user?.guardian.name ?? 'Not set'}</Text>
              <Text style={{ fontSize: 11, color: COLORS.text2 }}>{app.user ? `${app.user.guardian.rel} · ${app.user.guardian.phone}` : 'Set up guardian contact'}</Text>
            </View>
          </View>
          <View style={styles.gActions}>
            {[['📞', 'Call', callGuardian], ['💬', 'SMS', smsGuardian], ['✈️', 'Telegram', teleGuardian], ['📧', 'Email', emailGuardian]].map(([icon, label, fn]) => (
              <TouchableOpacity key={label as string} style={styles.gBtn} onPress={fn as () => void}>
                <Text style={{ fontSize: 17, textAlign: 'center' }}>{icon as string}</Text>
                <Text style={{ fontSize: 11, color: COLORS.text2, textAlign: 'center', marginTop: 3 }}>{label as string}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily Summary */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 14, marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text }}>Daily Summary</Text>
          <TouchableOpacity onPress={app.requestSummary}><Text style={{ fontSize: 12, color: COLORS.accent2 }}>Request now</Text></TouchableOpacity>
        </View>
        <View style={[styles.card, { flexDirection: 'row', flexWrap: 'wrap', gap: 0 }]}>
          {[
            { val: app.fallsToday.toString(), label: 'Falls Today', color: COLORS.text },
            { val: app.alertsToday.toString(), label: 'Manual Alerts', color: COLORS.text },
            { val: app.stepCount.toLocaleString(), label: 'Est. Steps 👟', color: COLORS.teall },
            { val: uptime, label: 'Uptime', color: COLORS.bluel },
          ].map((item) => (
            <View key={item.label} style={{ width: '50%', paddingVertical: 4 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: item.color }}>{item.val}</Text>
              <Text style={{ fontSize: 10, color: COLORS.text3, textTransform: 'uppercase', letterSpacing: 0.6 }}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, badge, badgeStyle, val, valColor, label, sub }: {
  icon: string; badge: string; badgeStyle: 'ok' | 'warn' | 'info' | 'crit'; val: string; valColor: string; label: string; sub: string;
}) {
  const badgeColors: Record<string, [string, string]> = {
    ok: ['rgba(29,158,117,0.2)', COLORS.teall],
    warn: ['rgba(239,159,39,0.2)', COLORS.amber],
    info: ['rgba(55,138,221,0.2)', COLORS.bluel],
    crit: ['rgba(198,40,40,0.2)', COLORS.accent2],
  };
  const [bg, fg] = badgeColors[badgeStyle] ?? badgeColors.info;
  return (
    <View style={styles.statCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
        <View style={{ backgroundColor: bg, borderRadius: 3, paddingHorizontal: 7, paddingVertical: 2 }}>
          <Text style={{ fontSize: 10, fontWeight: '600', color: fg }}>{badge}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 22, fontWeight: '700', color: valColor }}>{val}</Text>
      <Text style={{ fontSize: 10, color: COLORS.text3, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2 }}>{label}</Text>
      <Text style={{ fontSize: 10, color: COLORS.text2, marginTop: 5 }}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { marginHorizontal: 14, marginBottom: 8, borderRadius: RADIUS.small, padding: 11, flexDirection: 'row', alignItems: 'center', borderWidth: 0.5 },
  topbar: { padding: 18, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greet: { fontSize: 21, fontWeight: '700', letterSpacing: -0.3, color: COLORS.text },
  userName: { fontSize: 12, color: COLORS.text2, marginTop: 2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: COLORS.bg3, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: 20 },
  sdot: { width: 8, height: 8, borderRadius: 4 },
  statusTxt: { fontSize: 12, color: COLORS.text2 },
  rtcClock: { fontSize: 11, color: COLORS.text3, textAlign: 'center', marginBottom: 8 },
  heroCard: { marginHorizontal: 14, marginBottom: 14, backgroundColor: COLORS.bg2, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: RADIUS.card, padding: 18 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.accent2 },
  bpmNum: { fontSize: 52, fontWeight: '700', color: COLORS.accent2, letterSpacing: -2 },
  bpmUnit: { fontSize: 15, color: COLORS.text3, paddingBottom: 8, marginLeft: 6 },
  bpmTag: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 4 },
  bpmTagTxt: { fontSize: 11, fontWeight: '600' },
  tagNormal: { backgroundColor: 'rgba(29,158,117,0.2)' },
  tagHigh: { backgroundColor: 'rgba(198,40,40,0.2)' },
  tagLow: { backgroundColor: 'rgba(239,159,39,0.2)' },
  statsGrid: { marginHorizontal: 14, marginBottom: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  statCard: { width: '47.5%', backgroundColor: COLORS.bg2, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: RADIUS.card, padding: 14 },
  card: { marginHorizontal: 14, marginBottom: 14, backgroundColor: COLORS.bg2, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: RADIUS.card, padding: 14 },
  cardTitle: { fontSize: 12, fontWeight: '600', color: COLORS.text2, marginBottom: 8 },
  sevNum: { fontSize: 24, fontWeight: '700', textAlign: 'right' },
  sevBarBg: { height: 10, backgroundColor: COLORS.bg4, borderRadius: 5, overflow: 'hidden', marginBottom: 4 },
  sevBarFill: { height: '100%', borderRadius: 5 },
  gpsCard: { marginHorizontal: 14, marginBottom: 14, backgroundColor: COLORS.bg2, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: RADIUS.card, padding: 14, flexDirection: 'row', alignItems: 'center' },
  sectionHdr: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginHorizontal: 14, marginBottom: 8 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(239,83,80,0.12)', alignItems: 'center', justifyContent: 'center' },
  gActions: { flexDirection: 'row', gap: 7, marginTop: 12 },
  gBtn: { flex: 1, padding: 9, backgroundColor: COLORS.bg3, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: RADIUS.small, alignItems: 'center' },
});
