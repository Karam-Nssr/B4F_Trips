import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/Screen';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors } from '../../../core/theme/colors';
import { useBooking } from '../../../context/BookingContext';
import { seatService } from '../../../services/seatService';
import { Seat } from '../../../types/seat';
import { ScreenProps } from '../../../navigation/types';
export default function SeatSelectionScreen({ navigation }: ScreenProps<'SeatSelection'>) {
  const { trip, seat, setSeat } = useBooking(); const [seats, setSeats] = useState<Seat[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { if (!trip) { setError('Select a trip first.'); setLoading(false); return; } seatService.getSeats(trip._id).then(r => setSeats(r.seats)).catch(e => setError(e.message || 'Could not load seats')).finally(() => setLoading(false)); }, [trip?._id]);
  const rows = useMemo(() => [...new Set(seats.map(s => s.row))].sort((a,b) => a-b), [seats]);
  if (!trip) return <Screen><Text>Select a trip before choosing a seat.</Text></Screen>;
  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary}/></View>;
  const rowSeats = (row: number) => seats.filter(s => s.row === row && s.isActive !== false).sort((a, b) => (a.column ?? 0) - (b.column ?? 0));
  const maxColumns = Math.max(0, ...seats.map(s => s.column ?? 0));
  const aisleAfter = maxColumns >= 4 ? 2 : 1;
  return <Screen><Text style={styles.title}>Choose your seat</Text><Text style={styles.sub}>{trip.from} → {trip.to}</Text>
    <View style={styles.legend}><Legend color={colors.available} label="Available"/><Legend color={colors.reserved} label="Reserved"/><Legend color={colors.primary} label="Selected"/></View>
    <View style={styles.bus}><View style={styles.driver}><Text style={styles.driverText}>FRONT / DRIVER</Text></View>{rows.map(row => { const rowItems = rowSeats(row); return <View key={row} style={styles.row}>{rowItems.map((item, index) => { const reserved = item.status === 'RESERVED'; const selected = seat?._id === item._id; const col = item.column ?? index + 1; return <React.Fragment key={item._id}>{col === aisleAfter + 1 && <View style={styles.aisle}/>}<Pressable disabled={reserved} onPress={() => setSeat(item)} style={[styles.seat, reserved && styles.reserved, selected && styles.selected]}><Text style={[styles.seatText, selected && {color:'#fff'}, reserved && {color:colors.danger}]}>{item.seatNumber}</Text></Pressable></React.Fragment>; })}</View>; })}</View>
    {error ? <Text style={styles.error}>{error}</Text> : null}<Text style={styles.selectedLabel}>{seat ? `Selected seat: ${seat.seatNumber}` : 'Tap an available seat to select it.'}</Text><PrimaryButton title="Continue" disabled={!seat} onPress={() => navigation.navigate('PassengerInfo')}/>
  </Screen>;
}
function Legend({ color, label }: { color: string; label: string }) { return <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor: color}]}/><Text style={styles.legendText}>{label}</Text></View>; }
const styles = StyleSheet.create({ center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, title: { fontSize: 24, fontWeight: '800', color: colors.text }, sub: { color: colors.muted, marginTop: 5 }, legend: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 }, legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 }, dot: { width: 13, height: 13, borderRadius: 4 }, legendText: { color: colors.muted, fontSize: 12 }, bus: { backgroundColor: '#fff', borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 16, alignSelf: 'center', width: '100%', maxWidth: 330 }, driver: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 13, marginBottom: 10, alignItems: 'center' }, driverText: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1 }, row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 5, gap: 6 }, aisle: { width: 17, height: 42 }, seat: { width: 52, height: 42, borderRadius: 9, backgroundColor: colors.available, borderWidth: 1, borderColor: '#B8DCC9', alignItems: 'center', justifyContent: 'center' }, reserved: { backgroundColor: colors.reserved, borderColor: '#F0C3C3' }, selected: { backgroundColor: colors.primary, borderColor: colors.primary }, seatText: { color: colors.success, fontWeight: '800' }, selectedLabel: { textAlign: 'center', color: colors.text, marginTop: 18, fontWeight: '600' }, error: { color: colors.danger, marginTop: 12 } });
