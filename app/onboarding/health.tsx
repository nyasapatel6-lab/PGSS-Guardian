import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import type { UserData } from '../../context/AppContext';

export default function OnboardHealth() {
  const router = useRouter();
  const { setUser } = useApp();
  const [cond, setCond] = useState('');
  const [rhr, setRhr] = useState('');
  const [bp, setBp] = useState('');
  const [meds, setMeds] = useState('');
  const [allergy, setAllergy] = useState('');

  async function finish() {
    const ob1Raw = await AsyncStorage.getItem('pgss_ob1');
    const ob2Raw = await AsyncStorage.getItem('pgss_ob2');
    if (!ob1Raw || !ob2Raw) { router.replace('/onboarding'); return; }
    const ob1 = JSON.parse(ob1Raw);
    const ob2 = JSON.parse(ob2Raw);
    const userData: UserData = {
      name: ob1.name,
      age: ob1.age,
      gender: ob1.gender || 'Not specified',
      height: ob1.height,
      weight: ob1.weight,
      blood: ob1.blood || 'Unknown',
      guardian: {
        name: ob2.gName,
        rel: ob2.gRel,
        phone: ob2.gPhone,
        tele: ob2.gTele,
        email: ob2.gEmail,
      },
      health: {
        cond: cond.trim() || 'None reported',
        rhr: rhr || '72',
        bp: bp || '120',
        meds: meds.trim() || 'None',
        allergy: allergy.trim() || 'None known',
      },
    };
    await setUser(userData);
    await AsyncStorage.multiRemove(['pgss_ob1', 'pgss_ob2']);
    router.replace('/(tabs)/dashboard');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🏥</Text>
          <Text style={styles.heroTitle}>Health <Text style={{ color: COLORS.accent2 }}>History</Text></Text>
          <Text style={styles.heroSub}>Helps calibrate your fall detection thresholds and monitor deviations from your baseline.</Text>
        </View>

        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotDone]} />
          <View style={[styles.dot, styles.dotDone]} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionLabel}>Health Records</Text>

          <Field label="Existing Conditions">
            <TextInput style={[styles.input, { minHeight: 72, textAlignVertical: 'top' }]} value={cond} onChangeText={setCond}
              placeholder="e.g. Hypertension, Diabetes Type 2, Parkinson's..." placeholderTextColor={COLORS.text3} multiline />
          </Field>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <Field label="Resting Heart Rate">
                <TextInput style={styles.input} value={rhr} onChangeText={setRhr} keyboardType="numeric" placeholder="72" placeholderTextColor={COLORS.text3} />
              </Field>
            </View>
            <View style={{ width: 11 }} />
            <View style={{ flex: 1 }}>
              <Field label="Normal BP (sys)">
                <TextInput style={styles.input} value={bp} onChangeText={setBp} keyboardType="numeric" placeholder="120" placeholderTextColor={COLORS.text3} />
              </Field>
            </View>
          </View>

          <Field label="Current Medications">
            <TextInput style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]} value={meds} onChangeText={setMeds}
              placeholder="e.g. Metformin 500mg..." placeholderTextColor={COLORS.text3} multiline />
          </Field>

          <Field label="Known Allergies">
            <TextInput style={styles.input} value={allergy} onChangeText={setAllergy} placeholder="e.g. Penicillin, Aspirin" placeholderTextColor={COLORS.text3} />
          </Field>

          <TouchableOpacity style={styles.btnPrimary} onPress={finish}>
            <Text style={styles.btnPrimaryTxt}>Start Monitoring 🛡️</Text>
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
  hero: { padding: 44, paddingBottom: 28, alignItems: 'center', backgroundColor: '#0A150F' },
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
  btnPrimary: { backgroundColor: COLORS.accent, borderRadius: RADIUS.card, padding: 14, alignItems: 'center', marginTop: 6 },
  btnPrimaryTxt: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnSecondary: { borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: RADIUS.card, padding: 13, alignItems: 'center', marginTop: 8 },
  btnSecondaryTxt: { color: COLORS.text2, fontSize: 14 },
});
