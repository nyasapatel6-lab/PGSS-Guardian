import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS } from '../../constants/theme';

const RELATIONS = ['Parent', 'Spouse', 'Sibling', 'Child', 'Friend', 'Caregiver', 'Other'];

export default function OnboardGuardian() {
  const router = useRouter();
  const [gName, setGName] = useState('');
  const [gRel, setGRel] = useState('');
  const [gPhone, setGPhone] = useState('');
  const [gTele, setGTele] = useState('');
  const [gEmail, setGEmail] = useState('');

  function proceed() {
    if (!gName.trim()) { Alert.alert('Required', 'Enter guardian name'); return; }
    if (!gRel) { Alert.alert('Required', 'Select relation'); return; }
    if (!gPhone.trim()) { Alert.alert('Required', 'Enter phone number'); return; }
    if (!gTele.trim()) { Alert.alert('Required', 'Enter Telegram ID for alerts'); return; }
    AsyncStorage.setItem('pgss_ob2', JSON.stringify({ gName, gRel, gPhone, gTele, gEmail }));
    router.push('/onboarding/health');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: 12 }}>
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>👥</Text>
          <Text style={styles.heroTitle}>Emergency <Text style={{ color: COLORS.accent2 }}>Contact</Text></Text>
          <Text style={styles.heroSub}>Your guardian receives Telegram alerts with your GPS location and RTC timestamp on every incident.</Text>
        </View>

        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotDone]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionLabel}>Guardian Details</Text>

          <Field label="Guardian Name *">
            <TextInput style={styles.input} value={gName} onChangeText={setGName} placeholder="Priya Sharma" placeholderTextColor={COLORS.text3} />
          </Field>

          <Field label="Relation *">
            <View style={styles.chipRow}>
              {RELATIONS.map((r) => (
                <TouchableOpacity key={r} style={[styles.chip, gRel === r && styles.chipActive]} onPress={() => setGRel(r)}>
                  <Text style={[styles.chipTxt, gRel === r && styles.chipActiveTxt]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label="Phone Number *">
            <TextInput style={styles.input} value={gPhone} onChangeText={setGPhone} keyboardType="phone-pad" placeholder="+91 98765 43210" placeholderTextColor={COLORS.text3} />
          </Field>

          <Field label="Telegram ID (for auto-alerts) *">
            <TextInput style={styles.input} value={gTele} onChangeText={setGTele} placeholder="@username" placeholderTextColor={COLORS.text3} autoCapitalize="none" />
          </Field>

          <Field label="Gmail Address">
            <TextInput style={styles.input} value={gEmail} onChangeText={setGEmail} keyboardType="email-address" placeholder="guardian@gmail.com" placeholderTextColor={COLORS.text3} autoCapitalize="none" />
          </Field>

          <TouchableOpacity style={styles.btnPrimary} onPress={proceed}>
            <Text style={styles.btnPrimaryTxt}>Continue →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => router.back()}>
            <Text style={styles.btnSecondaryTxt}>← Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 13 }}>
      <Text style={{ fontSize: 12, color: COLORS.text2, marginBottom: 5 }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 44, paddingBottom: 28, alignItems: 'center', backgroundColor: '#0A0F1A' },
  heroIcon: { fontSize: 60, marginBottom: 14 },
  heroTitle: { fontSize: 26, fontWeight: '700', marginBottom: 8, color: COLORS.text },
  heroSub: { fontSize: 13, color: COLORS.text2, lineHeight: 21, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 18 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.bg4 },
  dotActive: { width: 20, borderRadius: 3, backgroundColor: COLORS.accent2 },
  dotDone: { backgroundColor: COLORS.teal },
  form: { padding: 22 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: COLORS.text3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 },
  input: { backgroundColor: COLORS.bg3, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: RADIUS.small, color: COLORS.text, fontSize: 15, padding: 11, paddingHorizontal: 13 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { paddingVertical: 6, paddingHorizontal: 11, backgroundColor: COLORS.bg3, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: 20 },
  chipActive: { backgroundColor: 'rgba(198,40,40,0.15)', borderColor: COLORS.accent2 },
  chipTxt: { fontSize: 11, color: COLORS.text2 },
  chipActiveTxt: { color: COLORS.accent2, fontWeight: '600' },
  btnPrimary: { backgroundColor: COLORS.accent, borderRadius: RADIUS.card, padding: 14, alignItems: 'center', marginTop: 6 },
  btnPrimaryTxt: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnSecondary: { borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: RADIUS.card, padding: 13, alignItems: 'center', marginTop: 8 },
  btnSecondaryTxt: { color: COLORS.text2, fontSize: 14 },
});
