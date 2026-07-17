import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS } from '../../constants/theme';

const GENDERS = ['', 'Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function OnboardStep1() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [blood, setBlood] = useState('');

  function proceed() {
    if (!name.trim()) { Alert.alert('Required', 'Enter your name'); return; }
    if (!age) { Alert.alert('Required', 'Enter your age'); return; }
    if (!height) { Alert.alert('Required', 'Enter your height'); return; }
    if (!weight) { Alert.alert('Required', 'Enter your weight'); return; }
    AsyncStorage.setItem('pgss_ob1', JSON.stringify({ name, age, gender, height, weight, blood }));
    router.push('/onboarding/guardian');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: 12 }]}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🛡️</Text>
          <Text style={styles.heroTitle}>PGSS <Text style={{ color: COLORS.accent2 }}>Guardian</Text></Text>
          <Text style={styles.heroSub}>Personal Guardian Safety System — real-time fall detection, vital monitoring & emergency alerts.</Text>
        </View>

        {/* Step dots */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.sectionLabel}>Personal Information</Text>

          <Field label="Full Name *">
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Arjun Sharma" placeholderTextColor={COLORS.text3} />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Age *">
                <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="25" placeholderTextColor={COLORS.text3} />
              </Field>
            </View>
            <View style={{ width: 11 }} />
            <View style={{ flex: 1 }}>
              <Field label="Gender">
                <View style={styles.segRow}>
                  {GENDERS.filter(Boolean).map((g) => (
                    <TouchableOpacity key={g} style={[styles.seg, gender === g && styles.segActive]} onPress={() => setGender(g)}>
                      <Text style={[styles.segTxt, gender === g && styles.segActiveTxt]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Field>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Height (cm) *">
                <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="170" placeholderTextColor={COLORS.text3} />
              </Field>
            </View>
            <View style={{ width: 11 }} />
            <View style={{ flex: 1 }}>
              <Field label="Weight (kg) *">
                <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="65" placeholderTextColor={COLORS.text3} />
              </Field>
            </View>
          </View>

          <Field label="Blood Group">
            <View style={styles.chipRow}>
              {BLOOD_GROUPS.filter(Boolean).map((b) => (
                <TouchableOpacity key={b} style={[styles.chip, blood === b && styles.chipActive]} onPress={() => setBlood(b === blood ? '' : b)}>
                  <Text style={[styles.chipTxt, blood === b && styles.chipActiveTxt]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <TouchableOpacity style={styles.btnPrimary} onPress={proceed}>
            <Text style={styles.btnPrimaryTxt}>Continue →</Text>
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
  scroll: { flexGrow: 1 },
  hero: { padding: 44, paddingBottom: 28, alignItems: 'center', backgroundColor: '#1A0A0A' },
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
  row: { flexDirection: 'row' },
  segRow: { flexDirection: 'row', gap: 6 },
  seg: { flex: 1, padding: 10, backgroundColor: COLORS.bg3, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: RADIUS.small, alignItems: 'center' },
  segActive: { backgroundColor: 'rgba(198,40,40,0.15)', borderColor: COLORS.accent2 },
  segTxt: { fontSize: 11, color: COLORS.text2 },
  segActiveTxt: { color: COLORS.accent2, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { paddingVertical: 6, paddingHorizontal: 11, backgroundColor: COLORS.bg3, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: 20 },
  chipActive: { backgroundColor: 'rgba(198,40,40,0.15)', borderColor: COLORS.accent2 },
  chipTxt: { fontSize: 11, color: COLORS.text2 },
  chipActiveTxt: { color: COLORS.accent2, fontWeight: '600' },
  btnPrimary: { backgroundColor: COLORS.accent, borderRadius: RADIUS.card, padding: 14, alignItems: 'center', marginTop: 6 },
  btnPrimaryTxt: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
});
