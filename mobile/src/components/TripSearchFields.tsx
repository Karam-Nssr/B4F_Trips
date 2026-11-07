import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../core/theme/colors';
import { CityPicker } from './CityPicker';
import { CalendarPicker } from './CalendarPicker';

type Props = {
  from: string; to: string; date: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onDateChange: (value: string) => void;
};

export function TripSearchFields({ from, to, date, onFromChange, onToChange, onDateChange }: Props) {
  const swap = () => { onFromChange(to); onToChange(from); };
  return <View>
    <View style={styles.cityHeader}><Text style={styles.groupTitle}>Your route</Text><Pressable onPress={swap} disabled={!from && !to}><Text style={[styles.swap, !from && !to && styles.disabled]}>⇅ Swap</Text></Pressable></View>
    <CityPicker label="From" value={from} placeholder="Select departure city" onSelect={onFromChange}/>
    <CityPicker label="To" value={to} placeholder="Select destination city" onSelect={onToChange}/>
    <View style={styles.divider}/>
    <CalendarPicker label="Travel date" value={date} onSelect={onDateChange}/>
  </View>;
}

const styles = StyleSheet.create({
  cityHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 },
  groupTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  swap: { color: colors.primary, fontWeight: '800', fontSize: 13 }, disabled: { opacity: 0.35 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 3 },
});
