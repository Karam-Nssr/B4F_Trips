import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../core/theme/colors';

type Props = { label: string; value: string; placeholder?: string; onSelect: (date: string) => void };
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const toISO = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const fromISO = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export function CalendarPicker({ label, value, placeholder = 'Choose travel date', onSelect }: Props) {
  const [visible, setVisible] = useState(false);
  const [month, setMonth] = useState(() => value ? fromISO(value) : new Date());
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  }, [month]);
  const open = () => { setMonth(value ? fromISO(value) : new Date()); setVisible(true); };
  const moveMonth = (delta: number) => setMonth(current => new Date(current.getFullYear(), current.getMonth() + delta, 1));

  return <>
    <Text style={styles.label}>{label}</Text>
    <Pressable style={styles.trigger} onPress={open}>
      <Text style={[styles.value, !value && styles.placeholder]}>{value ? fromISO(value).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : placeholder}</Text>
      <Text style={styles.icon}>▦</Text>
    </Pressable>
    <Modal visible={visible} animationType="fade" transparent onRequestClose={() => setVisible(false)}>
      <View style={styles.overlay}>
        <View style={styles.calendar}>
          <Text style={styles.title}>Select travel date</Text>
          <View style={styles.monthRow}>
            <Pressable onPress={() => moveMonth(-1)} disabled={month.getFullYear() === today.getFullYear() && month.getMonth() <= today.getMonth()} style={styles.arrow}><Text style={styles.arrowText}>‹</Text></Pressable>
            <Text style={styles.monthTitle}>{MONTHS[month.getMonth()]} {month.getFullYear()}</Text>
            <Pressable onPress={() => moveMonth(1)} style={styles.arrow}><Text style={styles.arrowText}>›</Text></Pressable>
          </View>
          <View style={styles.grid}>
            {WEEKDAYS.map(day => <View key={day} style={styles.dayCell}><Text style={styles.weekday}>{day}</Text></View>)}
            {cells.map((day, index) => {
              if (!day) return <View key={`empty-${index}`} style={styles.dayCell}/>;
              const date = new Date(month.getFullYear(), month.getMonth(), day); date.setHours(0, 0, 0, 0);
              const disabled = date < today;
              const selected = value === toISO(date);
              return <Pressable key={toISO(date)} disabled={disabled} onPress={() => { onSelect(toISO(date)); setVisible(false); }} style={[styles.dayCell, styles.dayButton, selected && styles.selectedDay]}>
                <Text style={[styles.dayText, disabled && styles.disabledDay, selected && styles.selectedDayText]}>{day}</Text>
              </Pressable>;
            })}
          </View>
          <Pressable style={styles.cancel} onPress={() => setVisible(false)}><Text style={styles.cancelText}>Cancel</Text></Pressable>
        </View>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  label: { color: colors.text, fontWeight: '700', fontSize: 13, marginBottom: 7, marginTop: 4 },
  trigger: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 11, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', marginBottom: 13 },
  value: { color: colors.text, fontSize: 14 }, placeholder: { color: colors.muted }, icon: { color: colors.primary, fontSize: 18 },
  overlay: { flex: 1, backgroundColor: 'rgba(10,20,35,0.45)', justifyContent: 'center', padding: 22 },
  calendar: { backgroundColor: '#fff', borderRadius: 20, padding: 18 }, title: { fontSize: 18, color: colors.text, fontWeight: '800', textAlign: 'center', marginBottom: 18 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }, monthTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  arrow: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }, arrowText: { fontSize: 25, color: colors.primary, lineHeight: 29 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' }, dayCell: { width: '14.2857%', height: 42, alignItems: 'center', justifyContent: 'center' }, weekday: { color: colors.muted, fontWeight: '700', fontSize: 12 },
  dayButton: { borderRadius: 21 }, dayText: { color: colors.text, fontSize: 14 }, disabledDay: { color: '#C9CED7' }, selectedDay: { backgroundColor: colors.primary }, selectedDayText: { color: '#fff', fontWeight: '800' },
  cancel: { alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 11, marginTop: 12 }, cancelText: { color: colors.muted, fontWeight: '700' },
});
