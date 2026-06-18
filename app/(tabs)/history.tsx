import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../../context/AppContext';
import type { LogEntry } from '../../context/AppContext';
import { COLORS, RADIUS } from '../../constants/theme';

type Filter = 'all' | 'critical' | 'warning' | 'normal';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: '🔴 Critical' },
  { key: 'warning', label: '🟡 Warning' },
  { key: 'normal', label: '🟢 Normal' },
];

const BADGE_COLORS: Record<LogEntry['type'], [string, string]> = {
  critical: ['rgba(198,40,40,0.2)', COLORS.accent2],
  warning: ['rgba(239,159,39,0.2)', COLORS.amber],
  normal: ['rgba(29,158,117,0.2)', COLORS.teall],
};

export default function HistoryScreen() {
  const { logData } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all' ? logData : logData.filter((l) => l.type === filter);

  function formatTime(ts: number) {
    const d = new Date(ts);
    const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return `${date} · ${time}`;
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View style={{ padding: 18, paddingBottom: 6 }}>
        <Text style={{ fontSize: 21, fontWeight: '700', color: COLORS.text }}>Activity Log</Text>
        <Text style={{ fontSize: 12, color: COLORS.text2, marginTop: 2 }}>SPIFFS-stored sessions · severity scores · RTC timestamps</Text>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f.key} style={[styles.chip, filter === f.key && styles.chipActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.chipTxt, filter === f.key && styles.chipActiveTxt]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Log list */}
      <ScrollView contentContainerStyle={{ padding: 14, paddingTop: 4 }} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <Text style={{ textAlign: 'center', padding: 36, color: COLORS.text3 }}>No records</Text>
        ) : (
          filtered.map((item) => {
            const [badgeBg, badgeFg] = BADGE_COLORS[item.type];
            return (
              <View key={item.id} style={styles.logItem}>
                <View style={styles.logTop}>
                  <Text style={styles.logTitle}>{item.title}</Text>
                  <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.badgeTxt, { color: badgeFg }]}>{item.type.toUpperCase()}</Text>
                  </View>
                </View>
                {item.sev > 0 && <Text style={styles.logMeta}>📊 Severity score: {item.sev}/10</Text>}
                {item.gps && item.gps !== '—' && <Text style={styles.logMeta}>📍 GPS: {item.gps}</Text>}
                <Text style={styles.logTime}>⏱️ {formatTime(item.ts)}</Text>
              </View>
            );
          })
        )}
        <View style={{ height: 8 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: { paddingHorizontal: 14, paddingVertical: 10, gap: 7 },
  chip: { paddingVertical: 6, paddingHorizontal: 13, borderRadius: 20, backgroundColor: COLORS.bg3, borderWidth: 0.5, borderColor: COLORS.border2 },
  chipActive: { backgroundColor: 'rgba(198,40,40,0.15)', borderColor: COLORS.accent2 },
  chipTxt: { fontSize: 11, color: COLORS.text2 },
  chipActiveTxt: { color: COLORS.accent2 },
  logItem: { backgroundColor: COLORS.bg2, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: RADIUS.card, padding: 13, marginBottom: 9 },
  logTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 },
  logTitle: { fontSize: 13, color: COLORS.text, flex: 1, marginRight: 8, lineHeight: 18 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 3 },
  badgeTxt: { fontSize: 10, fontWeight: '600' },
  logMeta: { fontSize: 10, color: COLORS.text3, marginTop: 4 },
  logTime: { fontSize: 10, color: COLORS.text3, marginTop: 7 },
});
