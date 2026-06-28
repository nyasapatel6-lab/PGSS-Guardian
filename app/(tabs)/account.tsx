import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useApp, UserData } from '../../context/AppContext';
import { COLORS, RADIUS } from '../../constants/theme';

const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RELATIONS = ['Parent', 'Spouse', 'Sibling', 'Child', 'Friend', 'Caregiver', 'Other'];

export default function AccountScreen() {
  const { user, setUser } = useApp();
  const [editVisible, setEditVisible] = useState(false);

  if (!user) return null;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar hero */}
        <View style={styles.hero}>
          <View style={styles.avatar}><Text style={{ fontSize: 30 }}>👤</Text></View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.sub}>Age {user.age} · {user.blood}</Text>
        </View>

        <InfoCard title="Personal" rows={[
          ['Age', `${user.age} years`],
          ['Gender', user.gender],
          ['Height', `${user.height} cm`],
          ['Weight', `${user.weight} kg`],
          ['Blood Group', user.blood],
        ]} />

        <InfoCard title="Emergency Contact" rows={[
          ['Name', user.guardian.name],
          ['Relation', user.guardian.rel],
          ['Phone', user.guardian.phone],
          ['Telegram', user.guardian.tele || '—'],
          ['Gmail', user.guardian.email || '—'],
        ]} />

        <InfoCard title="Health Records" rows={[
          ['Resting HR', `${user.health.rhr} bpm`],
          ['Baseline BP', `${user.health.bp} mmHg`],
          ['Allergies', user.health.allergy],
          ['Medications', user.health.meds],
          ['Conditions', user.health.cond],
        ]} />

        <TouchableOpacity style={styles.editBtn} onPress={() => setEditVisible(true)}>
          <Text style={{ color: COLORS.text2, fontSize: 13 }}>✏️ Edit Profile</Text>
        </TouchableOpacity>

        <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
          <Text style={{ fontSize: 11, color: COLORS.text3 }}>PGSS Guardian v1.1.0 · Elite Lab</Text>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <EditModal visible={editVisible} onClose={() => setEditVisible(false)} user={user} onSave={async (updated) => { await setUser(updated); setEditVisible(false); }} />
    </View>
  );
}

function InfoCard({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.cardHdr}><Text style={styles.cardHdrTxt}>{title}</Text></View>
      {rows.map(([k, v]) => (
        <View key={k} style={styles.row}>
          <Text style={styles.rowKey}>{k}</Text>
          <Text style={styles.rowVal} numberOfLines={2}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

function EditModal({ visible, onClose, user, onSave }: {
  visible: boolean; onClose: () => void; user: UserData; onSave: (u: UserData) => void;
}) {
  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(user.age);
  const [gender, setGender] = useState(user.gender);
  const [height, setHeight] = useState(user.height);
  const [weight, setWeight] = useState(user.weight);
  const [blood, setBlood] = useState(user.blood);
  const [gName, setGName] = useState(user.guardian.name);
  const [gRel, setGRel] = useState(user.guardian.rel);
  const [gPhone, setGPhone] = useState(user.guardian.phone);
  const [gTele, setGTele] = useState(user.guardian.tele);
  const [gEmail, setGEmail] = useState(user.guardian.email);
  const [cond, setCond] = useState(user.health.cond === 'None reported' ? '' : user.health.cond);
  const [rhr, setRhr] = useState(user.health.rhr);
  const [bp, setBp] = useState(user.health.bp);
  const [meds, setMeds] = useState(user.health.meds === 'None' ? '' : user.health.meds);
  const [allergy, setAllergy] = useState(user.health.allergy === 'None known' ? '' : user.health.allergy);

  function save() {
    if (!name.trim()) { Alert.alert('Required', 'Name cannot be empty'); return; }
    if (!age) { Alert.alert('Required', 'Age cannot be empty'); return; }
    if (!height || !weight) { Alert.alert('Required', 'Height and weight required'); return; }
    if (!gName || !gRel || !gPhone) { Alert.alert('Required', 'Guardian name, relation and phone required'); return; }
    onSave({
      name: name.trim(), age, gender: gender || 'Not specified', height, weight, blood: blood || 'Unknown',
      guardian: { name: gName.trim(), rel: gRel, phone: gPhone.trim(), tele: gTele.trim(), email: gEmail.trim() },
      health: { cond: cond.trim() || 'None reported', rhr: rhr || '72', bp: bp || '120', meds: meds.trim() || 'None', allergy: allergy.trim() || 'None known' },
    });
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.modalHdr}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}><Text style={{ color: COLORS.text2, fontSize: 13 }}>← Back</Text></TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '700', flex: 1, color: COLORS.text }}>Edit Profile</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={save}><Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Save</Text></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 22 }}>
          <SectionLbl>Personal</SectionLbl>
          <EField label="Full Name"><TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={COLORS.text3} /></EField>
          <View style={{ flexDirection: 'row', gap: 11 }}>
            <View style={{ flex: 1 }}><EField label="Age"><TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholderTextColor={COLORS.text3} /></EField></View>
            <View style={{ flex: 1 }}>
              <EField label="Gender">
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  {GENDERS.map((g) => (
                    <TouchableOpacity key={g} style={[styles.smallChip, gender === g && styles.smallChipActive]} onPress={() => setGender(g)}>
                      <Text style={{ fontSize: 10, color: gender === g ? COLORS.accent2 : COLORS.text2 }}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </EField>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 11 }}>
            <View style={{ flex: 1 }}><EField label="Height (cm)"><TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" placeholderTextColor={COLORS.text3} /></EField></View>
            <View style={{ flex: 1 }}><EField label="Weight (kg)"><TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholderTextColor={COLORS.text3} /></EField></View>
          </View>
          <EField label="Blood Group">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {BLOOD_GROUPS.map((b) => (
                <TouchableOpacity key={b} style={[styles.smallChip, blood === b && styles.smallChipActive]} onPress={() => setBlood(b)}>
                  <Text style={{ fontSize: 11, color: blood === b ? COLORS.accent2 : COLORS.text2 }}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </EField>

          <SectionLbl>Emergency Contact</SectionLbl>
          <EField label="Guardian Name"><TextInput style={styles.input} value={gName} onChangeText={setGName} placeholderTextColor={COLORS.text3} /></EField>
          <EField label="Relation">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {RELATIONS.map((r) => (
                <TouchableOpacity key={r} style={[styles.smallChip, gRel === r && styles.smallChipActive]} onPress={() => setGRel(r)}>
                  <Text style={{ fontSize: 10, color: gRel === r ? COLORS.accent2 : COLORS.text2 }}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </EField>
          <EField label="Phone Number"><TextInput style={styles.input} value={gPhone} onChangeText={setGPhone} keyboardType="phone-pad" placeholderTextColor={COLORS.text3} /></EField>
          <EField label="Telegram ID"><TextInput style={styles.input} value={gTele} onChangeText={setGTele} placeholder="@username" placeholderTextColor={COLORS.text3} autoCapitalize="none" /></EField>
          <EField label="Gmail Address"><TextInput style={styles.input} value={gEmail} onChangeText={setGEmail} keyboardType="email-address" placeholderTextColor={COLORS.text3} autoCapitalize="none" /></EField>

          <SectionLbl>Health Records</SectionLbl>
          <EField label="Existing Conditions">
            <TextInput style={[styles.input, { minHeight: 72, textAlignVertical: 'top' }]} value={cond} onChangeText={setCond} multiline placeholderTextColor={COLORS.text3} />
          </EField>
          <View style={{ flexDirection: 'row', gap: 11 }}>
            <View style={{ flex: 1 }}><EField label="Resting HR (bpm)"><TextInput style={styles.input} value={rhr} onChangeText={setRhr} keyboardType="numeric" placeholderTextColor={COLORS.text3} /></EField></View>
            <View style={{ flex: 1 }}><EField label="Baseline BP (sys)"><TextInput style={styles.input} value={bp} onChangeText={setBp} keyboardType="numeric" placeholderTextColor={COLORS.text3} /></EField></View>
          </View>
          <EField label="Current Medications">
            <TextInput style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]} value={meds} onChangeText={setMeds} multiline placeholderTextColor={COLORS.text3} />
          </EField>
          <EField label="Known Allergies"><TextInput style={styles.input} value={allergy} onChangeText={setAllergy} placeholderTextColor={COLORS.text3} /></EField>

          <TouchableOpacity style={styles.saveBig} onPress={save}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Save Changes</Text>
          </TouchableOpacity>
          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function SectionLbl({ children }: { children: string }) {
  return <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.text3, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14, marginTop: 18 }}>{children}</Text>;
}

function EField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 13 }}>
      <Text style={{ fontSize: 12, color: COLORS.text2, marginBottom: 5 }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 28, paddingBottom: 20, alignItems: 'center' },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.bg3, borderWidth: 2, borderColor: 'rgba(239,83,80,0.35)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  name: { fontSize: 21, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  sub: { fontSize: 12, color: COLORS.text2 },
  infoCard: { marginHorizontal: 14, marginBottom: 10, backgroundColor: COLORS.bg2, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: RADIUS.card, overflow: 'hidden' },
  cardHdr: { padding: 12, paddingHorizontal: 14, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  cardHdrTxt: { fontSize: 11, color: COLORS.text3, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: '600' },
  row: { padding: 11, paddingHorizontal: 14, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowKey: { fontSize: 12, color: COLORS.text2 },
  rowVal: { fontSize: 12, fontWeight: '500', color: COLORS.text, textAlign: 'right', maxWidth: '55%' },
  editBtn: { marginHorizontal: 14, marginBottom: 14, marginTop: 4, padding: 12, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: RADIUS.card, alignItems: 'center' },
  modalHdr: { padding: 18, paddingTop: 56, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border2, backgroundColor: COLORS.bg },
  backBtn: { backgroundColor: COLORS.bg3, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 13 },
  saveBtn: { backgroundColor: COLORS.accent, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 16 },
  input: { backgroundColor: COLORS.bg3, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: RADIUS.small, color: COLORS.text, fontSize: 15, padding: 11, paddingHorizontal: 13 },
  smallChip: { paddingVertical: 5, paddingHorizontal: 9, backgroundColor: COLORS.bg3, borderWidth: 0.5, borderColor: COLORS.border2, borderRadius: 6 },
  smallChipActive: { backgroundColor: 'rgba(198,40,40,0.15)', borderColor: COLORS.accent2 },
  saveBig: { backgroundColor: COLORS.accent, borderRadius: RADIUS.card, padding: 14, alignItems: 'center', marginTop: 6 },
});
