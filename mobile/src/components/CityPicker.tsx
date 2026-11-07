import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../core/theme/colors';
import { SYRIAN_CITIES } from '../data/syrianCities';

type Props = { label: string; value: string; placeholder: string; onSelect: (city: string) => void };

export function CityPicker({ label, value, placeholder, onSelect }: Props) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => SYRIAN_CITIES.filter(city => city.toLowerCase().includes(search.trim().toLowerCase())), [search]);

  const choose = (city: string) => {
    onSelect(city);
    setVisible(false);
    setSearch('');
  };

  return <>
    <Text style={styles.label}>{label}</Text>
    <Pressable style={styles.trigger} onPress={() => setVisible(true)}>
      <Text style={[styles.value, !value && styles.placeholder]}>{value || placeholder}</Text>
      <Text style={styles.chevron}>⌄</Text>
    </Pressable>
    <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Choose a city</Text>
            <Pressable onPress={() => { setVisible(false); setSearch(''); }}><Text style={styles.close}>✕</Text></Pressable>
          </View>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search Syrian cities" placeholderTextColor={colors.muted} style={styles.search} autoCorrect={false}/>
          <ScrollView keyboardShouldPersistTaps="handled">
            {filtered.map(city => <Pressable key={city} onPress={() => choose(city)} style={styles.cityRow}>
              <Text style={styles.cityText}>{city}</Text>
              {value === city ? <Text style={styles.check}>✓</Text> : null}
            </Pressable>)}
            {filtered.length === 0 ? <Text style={styles.noResults}>No matching city found.</Text> : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  label: { color: colors.text, fontWeight: '700', fontSize: 13, marginBottom: 7, marginTop: 4 },
  trigger: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 11, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', marginBottom: 13 },
  value: { color: colors.text, fontSize: 15 }, placeholder: { color: colors.muted }, chevron: { color: colors.muted, fontSize: 20 },
  overlay: { flex: 1, backgroundColor: 'rgba(10,20,35,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, height: '78%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sheetTitle: { fontSize: 19, fontWeight: '800', color: colors.text }, close: { fontSize: 20, color: colors.muted, padding: 5 },
  search: { borderWidth: 1, borderColor: colors.border, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 11, color: colors.text, marginBottom: 10, fontSize: 15 },
  cityRow: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEF1F5', flexDirection: 'row', justifyContent: 'space-between' },
  cityText: { color: colors.text, fontSize: 15 }, check: { color: colors.success, fontWeight: '900' }, noResults: { color: colors.muted, textAlign: 'center', padding: 24 },
});
