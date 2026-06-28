import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { useApp } from '../../context/AppContext';
import { COLORS, RADIUS } from '../../constants/theme';

const DEMO_DEVICES = [
  { ip: '192.168.1.100', name: 'PGSS-ESP32-A1', sig: '▂▄▆ Strong' },
  { ip: '192.168.1.105', name: 'PGSS-ESP32-B2', sig: '▂▄ Medium' },
];

export default function ConnectScreen() {
  const app = useApp();
  const [ipInput, setIpInput] = useState('');

  function connectByIP() {
    if (!ipInput.trim()) { Alert.alert('Error', 'Enter an IP address'); return; }
    app.connectDevice(ipInput.trim(), 'PGSS-ESP32 (Manual)');
  }

  function openFallHistory() {
    if (!app.deviceIP) { Alert.alert('Not connected', 'Connect a device first'); return; }
    Linking.openURL(`http://${app.deviceIP}/history`);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 12 }}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>📡</Text>
        <Text style={styles.heroTitle}>Connect Device</Text>
        <Text style={styles.heroSub}>Connect to your ESP32 PGSS device over WiFi. Both must be on the same network.</Text>
      </View>

      {/* Connected box */}
      {app.connected && (
        <View style={styles.connectedBox}>
          <Text style={styles.connectedTitle}>✅ Device Connected</Text>
          <Text style={styles.connectedName}>{app.deviceIP}</Text>
          <TouchableOpacity style={styles.discBtn} onPress={app.disconnectDevice}>
            <Text style={{ color: COLORS.accent2, fontSize: 12 }}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Manual IP entry */}
      <View style={{ paddingHorizontal: 22, paddingBottom: 12 }}>
        <Text style={{ fontSize: 12, color: COLORS.text2, marginBottom: 5 }}>ESP32 IP Address</Text>
        <TextInput
          style={styles.input}
          value={ipInput}
          onChangeText={setIpInput}
          placeholder="192.168.1.100"
          placeholderTextColor={COLORS.text3}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.btnPrimary} onPress={connectByIP}>
          <Text style={styles.btnPrimaryTxt}>Connect to Device</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, marginBottom: 10 }}>
        <View style={{ flex: 1, height: 0.5, backgroundColor: COLORS.border2 }} />
        <Text style={{ fontSize: 11, color: COLORS.text3, marginHorizontal: 10 }}>or scan nearby</Text>
        <View style={{ flex: 1, height: 0.5, backgroundColor: COLORS.border2 }} />
      </View>

      {/* Nearby devices */}
      <View style={{ paddingHorizontal: 14, paddingBottom: 12 }}>
        {DEMO_DEVICES.map((d) => (
          <TouchableOpacity key={d.ip} style={styles.devItem} onPress={() => app.connectDevice(d.ip, d.name)}>
            <Text style={{ fontSize: 28 }}>🔌</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text }}>{d.name}</Text>
              <Text style={{ fontSize: 11, color: COLORS.text2 }}>{d.ip} · ESP32 DevKit v1</Text>
            </View>
            <Text style={{ fontSize: 11, color: COLORS.teall }}>{d.sig}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fall History link */}
      {app.connected && (
        <View style={styles.histBox}>
          <Text style={styles.histTitle}>📂 Fall History Web Page</Text>
          <Text style={styles.histSub}>SPIFFS-stored alert log served as HTML table from ESP32.</Text>
          <TouchableOpacity style={styles.histBtn} onPress={openFallHistory}>
            <Text style={{ fontSize: 12, color: COLORS.bluel }}>↗ Open /history page</Text>
          </TouchableOpacity>
        </View>
      )}


      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 36, paddingHorizontal: 22, paddingBottom: 20, alignItems: 'center' },
  heroIcon: { fontSize: 64, marginBottom: 14 },
  heroTitle: { fontSize: 21, fontWeight: '700', color: COLORS.text, marginBottom: 7 },
  heroSub: { fontSize: 13, color: COLORS.text2, lineHeight: 20, textAlign: 'center' },
  connectedBox: { marginHorizontal: 14, marginBottom: 14, backgroundColor: 'rgba(29,158,117,0.08)', borderWidth: 0.5, borderColor: 'rgba(29,158,117,0.3)', borderRadius: RADIUS.card, padding: 14 },
  connectedTitle: { fontSize: 13, color: COLORS.teall, fontWeight: '600', marginBottom: 4 },
  connectedName: { fontSize: 12, color: COLORS.text2 },
  discBtn: { marginTop: 10, paddingVertical: 7, paddingHorizontal: 14, borderWidth: 0.5, borderColor: 'rgba(239,83,80,0.4)', borderRadius: RADIUS.small, alignSelf: 'flex-start' },
  input: { backgroundColor: COLORS.bg3, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: RADIUS.small, color: COLORS.text, fontSize: 17, padding: 11, paddingHorizontal: 13, textAlign: 'center', letterSpacing: 1, marginBottom: 8 },
  btnPrimary: { backgroundColor: COLORS.accent, borderRadius: RADIUS.card, padding: 14, alignItems: 'center' },
  btnPrimaryTxt: { color: '#fff', fontSize: 15, fontWeight: '600' },
  devItem: { backgroundColor: COLORS.bg2, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: RADIUS.card, padding: 14, marginBottom: 9, flexDirection: 'row', alignItems: 'center' },
  histBox: { marginHorizontal: 14, marginBottom: 14, backgroundColor: 'rgba(55,138,221,0.08)', borderWidth: 0.5, borderColor: 'rgba(55,138,221,0.3)', borderRadius: RADIUS.card, padding: 14 },
  histTitle: { fontSize: 13, color: COLORS.bluel, fontWeight: '600', marginBottom: 4 },
  histSub: { fontSize: 12, color: COLORS.text2, marginBottom: 8 },
  histBtn: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: 'rgba(55,138,221,0.15)', borderWidth: 0.5, borderColor: 'rgba(55,138,221,0.4)', borderRadius: RADIUS.small, alignSelf: 'flex-start' },
});
