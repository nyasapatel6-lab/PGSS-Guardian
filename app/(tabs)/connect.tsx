import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Linking, Modal, Animated, Easing } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useApp } from '../../context/AppContext';
import { COLORS, RADIUS } from '../../constants/theme';

const DEMO_DEVICES = [
  { ip: '192.168.1.100', name: 'PGSS-ESP32-A1', sig: '▂▄▆ Strong' },
  { ip: '192.168.1.105', name: 'PGSS-ESP32-B2', sig: '▂▄ Medium' },
];

export default function ConnectScreen() {
  const app = useApp();
  const [ipInput, setIpInput] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);
  const laserAnim = useRef(new Animated.Value(0)).current;

  // Animate scanning laser up and down
  useEffect(() => {
    if (scannerVisible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 240,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      laserAnim.setValue(0);
    }
  }, [scannerVisible]);

  function connectByIP() {
    if (!ipInput.trim()) { Alert.alert('Error', 'Enter an IP address'); return; }
    app.connectDevice(ipInput.trim(), 'PGSS-ESP32 (Manual)');
  }

  function openFallHistory() {
    if (!app.deviceIP) { Alert.alert('Not connected', 'Connect a device first'); return; }
    Linking.openURL(`http://${app.deviceIP}/history`);
  }

  function handleBarcodeScanned({ data }: { data: string }) {
    if (scannedRef.current) return;
    scannedRef.current = true;

    let ip = data.trim();
    // Parse IP from URL if scanned as a link (e.g. http://192.168.4.1/data)
    ip = ip.replace(/^https?:\/\//i, '');
    ip = ip.split('/')[0];
    ip = ip.split(':')[0]; // Remove port if any

    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    const localDomainRegex = /^[a-zA-Z0-9-]+\.local$/;

    if (ipRegex.test(ip) || localDomainRegex.test(ip)) {
      app.connectDevice(ip, 'PGSS-ESP32 (Scanned)');
      Alert.alert('✅ Connected', `Successfully connected to ESP32 at ${ip}`);
      setScannerVisible(false);
    } else {
      Alert.alert(
        'Invalid QR Code',
        `Scanned data: "${data}" is not a valid ESP32 IP address.`,
        [{ text: 'OK', onPress: () => { scannedRef.current = false; } }]
      );
    }
  }

  async function openScanner() {
    if (!permission) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to scan QR codes.');
        return;
      }
    } else if (!permission.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to scan QR codes.');
        return;
      }
    }
    scannedRef.current = false;
    setScannerVisible(true);
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

      {/* QR Code Scanner Button */}
      <View style={{ paddingHorizontal: 22, paddingBottom: 16 }}>
        <TouchableOpacity style={styles.btnSecondary} onPress={openScanner}>
          <Text style={styles.btnSecondaryTxt}>📷 Scan QR Code on ESP32</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, marginBottom: 16 }}>
        <View style={{ flex: 1, height: 0.5, backgroundColor: COLORS.border2 }} />
        <Text style={{ fontSize: 11, color: COLORS.text3, marginHorizontal: 10 }}>or enter manually</Text>
        <View style={{ flex: 1, height: 0.5, backgroundColor: COLORS.border2 }} />
      </View>

      {/* Manual IP entry */}
      <View style={{ paddingHorizontal: 22, paddingBottom: 22 }}>
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
        <Text style={{ fontSize: 11, color: COLORS.text3, marginHorizontal: 10 }}>demo devices</Text>
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

      {/* Scanner Modal */}
      <Modal
        visible={scannerVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setScannerVisible(false)}
      >
        <View style={styles.scannerContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          
          {/* Cyberpunk Scanner HUD Overlay */}
          <View style={styles.overlayContainer}>
            <View style={styles.unfocusedContainer} />
            
            <View style={styles.middleContainer}>
              <View style={styles.unfocusedContainer} />
              
              <View style={styles.focusedContainer}>
                {/* Scanner corners */}
                <View style={[styles.corner, styles.topLeftCorner]} />
                <View style={[styles.corner, styles.topRightCorner]} />
                <View style={[styles.corner, styles.bottomLeftCorner]} />
                <View style={[styles.corner, styles.bottomRightCorner]} />
                
                {/* Horizontal laser beam */}
                <Animated.View
                  style={[
                    styles.laser,
                    {
                      transform: [{ translateY: laserAnim }],
                    },
                  ]}
                />
              </View>
              
              <View style={styles.unfocusedContainer} />
            </View>
            
            <View style={[styles.unfocusedContainer, styles.bottomBarContainer]}>
              <Text style={styles.scannerInstructions}>
                Point camera at the QR code on your device screen
              </Text>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setScannerVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  btnSecondary: { backgroundColor: 'rgba(55,138,221,0.08)', borderWidth: 0.5, borderColor: COLORS.accent, borderRadius: RADIUS.card, padding: 14, alignItems: 'center' },
  btnSecondaryTxt: { color: COLORS.accent, fontSize: 15, fontWeight: '600' },
  devItem: { backgroundColor: COLORS.bg2, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: RADIUS.card, padding: 14, marginBottom: 9, flexDirection: 'row', alignItems: 'center' },
  histBox: { marginHorizontal: 14, marginBottom: 14, backgroundColor: 'rgba(55,138,221,0.08)', borderWidth: 0.5, borderColor: 'rgba(55,138,221,0.3)', borderRadius: RADIUS.card, padding: 14 },
  histTitle: { fontSize: 13, color: COLORS.bluel, fontWeight: '600', marginBottom: 4 },
  histSub: { fontSize: 12, color: COLORS.text2, marginBottom: 8 },
  histBtn: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: 'rgba(55,138,221,0.15)', borderWidth: 0.5, borderColor: 'rgba(55,138,221,0.4)', borderRadius: RADIUS.small, alignSelf: 'flex-start' },
  
  // Scanner Modal Styles
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleContainer: {
    height: 250,
    flexDirection: 'row',
  },
  focusedContainer: {
    width: 250,
    height: 250,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: COLORS.teall,
  },
  topLeftCorner: {
    top: 0,
    left: 0,
    borderLeftWidth: 3,
    borderTopWidth: 3,
  },
  topRightCorner: {
    top: 0,
    right: 0,
    borderRightWidth: 3,
    borderTopWidth: 3,
  },
  bottomLeftCorner: {
    bottom: 0,
    left: 0,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
  },
  bottomRightCorner: {
    bottom: 0,
    right: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  laser: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#ff3b30',
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  bottomBarContainer: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerInstructions: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: RADIUS.card,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
