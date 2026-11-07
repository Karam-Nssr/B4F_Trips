import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ScreenProps } from '../../../navigation/types';
import { Screen } from '../../../components/Screen';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { InfoRow } from '../../../components/InfoRow';
import { colors } from '../../../core/theme/colors';
import { tripService } from '../../../services/tripService';
import { Trip } from '../../../types/trip';
import { useBooking } from '../../../context/BookingContext';
import { formatDate, formatMoney } from '../../../utils/format';
export default function TripDetailsScreen({ route, navigation }: ScreenProps<'TripDetails'>) {
  const [trip, setTrip] = useState<Trip | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const { setTrip: saveTrip, setSeat, setPassenger, setTicket } = useBooking();
  useEffect(() => { tripService.getTrip(route.params.tripId).then(setTrip).catch(e => setError(e.message || 'Unable to load trip')).finally(() => setLoading(false)); }, [route.params.tripId]);
  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary}/></View>;
  if (!trip) return <Screen><Text style={styles.error}>{error || 'Trip not found.'}</Text></Screen>;
  const bus = typeof trip.bus === 'string' ? null : trip.bus;
  return <Screen><Text style={styles.title}>{trip.from} → {trip.to}</Text><Text style={styles.sub}>Trip details</Text><View style={styles.card}>
    <InfoRow label="Departure date" value={formatDate(trip.departureDate)}/><InfoRow label="Departure time" value={trip.departureTime}/><InfoRow label="Bus number" value={bus?.busNumber || '—'}/><InfoRow label="Bus class" value={bus?.busClass || '—'}/><InfoRow label="Capacity" value={String(bus?.capacity ?? trip.totalSeats ?? '—')}/><InfoRow label="Available seats" value={String(trip.availableSeats ?? 'Check seat layout')}/><InfoRow label="Ticket price" value={formatMoney(trip.price)}/>
  </View><PrimaryButton title="Choose your seat" onPress={() => { saveTrip(trip); setSeat(null); setPassenger(null); setTicket(null); navigation.navigate('SeatSelection'); }}/></Screen>;
}
const styles = StyleSheet.create({ center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 25, fontWeight: '800', color: colors.text }, sub: { color: colors.muted, marginTop: 5, marginBottom: 18 }, card: { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 15, borderWidth: 1, borderColor: colors.border }, error: { color: colors.danger } });
