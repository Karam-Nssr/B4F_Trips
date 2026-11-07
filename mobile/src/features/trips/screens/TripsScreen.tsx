import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { TabScreenProps } from '../../../navigation/types';
import { Screen } from '../../../components/Screen';
import { TripSearchFields } from '../../../components/TripSearchFields';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors } from '../../../core/theme/colors';
import { tripService } from '../../../services/tripService';
import { Trip } from '../../../types/trip';
import { formatDate, formatMoney } from '../../../utils/format';
import { USE_MOCK_DATA } from '../../../core/config/api';

export default function TripsScreen({ navigation, route }: TabScreenProps<'TripsTab'>) {
  const params = route.params || {};
  const [from, setFrom] = useState(params.from || '');
  const [to, setTo] = useState(params.to || '');
  const [date, setDate] = useState(params.date || '');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (filters = { from, to, date }) => {
    if (filters.from && filters.to && filters.from === filters.to) {
      Alert.alert('Choose different cities', 'Departure and destination cities must be different.');
      return;
    }
    setLoading(true); setError('');
    try { setTrips(await tripService.getTrips(filters)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load trips'); }
    finally { setLoading(false); }
  }, [from, to, date]);

  useEffect(() => {
    const q = route.params;
    if (q) {
      const next = { from: q.from || '', to: q.to || '', date: q.date || '' };
      setFrom(next.from); setTo(next.to); setDate(next.date);
      load(next);
    } else load({ from: '', to: '', date: '' });
  }, [route.params]);

  return <Screen>
    <Text style={styles.heading}>Find your trip</Text>
    <Text style={styles.sub}>Choose your departure, destination and travel date.</Text>
    <View style={styles.search}>
      <TripSearchFields from={from} to={to} date={date} onFromChange={setFrom} onToChange={setTo} onDateChange={setDate}/>
      <PrimaryButton title="Search trips" onPress={() => load()}/>
    </View>
    <View style={styles.resultsHeader}><Text style={styles.resultsTitle}>Available trips</Text><Text style={styles.count}>{trips.length} found</Text></View>
    {USE_MOCK_DATA ? <Text style={styles.demo}>Showing sample trips for demonstration</Text> : null}
    {loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }}/> : error ? <Text style={styles.error}>{error}</Text> : trips.length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyIcon}>⌕</Text><Text style={styles.emptyTitle}>No trips found</Text><Text style={styles.empty}>Try another city or travel date.</Text></View> : trips.map(trip => {
      const bus = typeof trip.bus === 'string' ? null : trip.bus;
      return <Pressable key={trip._id} style={styles.trip} onPress={() => navigation.navigate('TripDetails' as never, { tripId: trip._id } as never)}>
        <View style={styles.route}><Text style={styles.city}>{trip.from}</Text><Text style={styles.arrow}>→</Text><Text style={styles.city}>{trip.to}</Text></View>
        <View style={styles.line}/>
        <View style={styles.detailsRow}><View><Text style={styles.metaLabel}>DEPARTURE</Text><Text style={styles.meta}>{formatDate(trip.departureDate)}</Text><Text style={styles.time}>{trip.departureTime}</Text></View><View style={styles.right}><Text style={styles.metaLabel}>BUS CLASS</Text><Text style={styles.meta}>{bus?.busClass?.replace('_', ' ') || 'Bus'}</Text><Text style={styles.seats}>{trip.availableSeats ?? '—'} seats available</Text></View></View>
        <View style={styles.bottom}><Text style={styles.price}>{formatMoney(trip.price)}</Text><Text style={styles.view}>View trip  ›</Text></View>
      </Pressable>;
    })}
  </Screen>;
}

const styles = StyleSheet.create({
  heading: { fontSize: 25, fontWeight: '800', color: colors.text }, sub: { color: colors.muted, marginTop: 5, marginBottom: 17, lineHeight: 20 },
  search: { backgroundColor: '#fff', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: colors.border, marginBottom: 22 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, resultsTitle: { color: colors.text, fontWeight: '800', fontSize: 18 }, count: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  demo: { color: colors.warning, fontSize: 11, marginBottom: 10, fontWeight: '700' },
  trip: { backgroundColor: '#fff', borderRadius: 17, padding: 16, marginBottom: 13, borderWidth: 1, borderColor: colors.border },
  route: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, city: { color: colors.text, fontSize: 18, fontWeight: '800', flex: 1 }, arrow: { color: colors.accent, fontSize: 21, paddingHorizontal: 12 }, line: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between' }, right: { alignItems: 'flex-end' }, metaLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 }, meta: { color: colors.text, fontSize: 12, marginTop: 5, fontWeight: '600' }, time: { color: colors.primary, fontSize: 14, fontWeight: '800', marginTop: 3 }, seats: { color: colors.success, fontSize: 11, fontWeight: '700', marginTop: 3 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }, price: { color: colors.primary, fontSize: 18, fontWeight: '900' }, view: { color: colors.accent, fontWeight: '800', fontSize: 12 },
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: colors.border }, emptyIcon: { fontSize: 32, color: colors.muted }, emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 8 }, empty: { color: colors.muted, textAlign: 'center', marginTop: 5 }, error: { color: colors.danger, marginTop: 20 },
});
