import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../components/Screen';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { InfoRow } from '../../../components/InfoRow';
import { colors } from '../../../core/theme/colors';
import { USE_MOCK_DATA } from '../../../core/config/api';
import { useBooking } from '../../../context/BookingContext';
import { reservationService } from '../../../services/reservationService';
import { formatDate, formatMoney } from '../../../utils/format';
import { ScreenProps } from '../../../navigation/types';
export default function PaymentScreen({ navigation }: ScreenProps<'Payment'>) {
  const { trip, seat, passenger, setTicket } = useBooking(); const [loading, setLoading] = useState(false);
  const pay = async () => {
    if (!trip || !seat || !passenger) { Alert.alert('Booking incomplete', 'Please go back and complete all reservation details.'); return; }
    setLoading(true);
    try {
      const ticket = await reservationService.checkout({ tripId: trip._id, seatId: seat._id, fullName: passenger.fullName, phone: passenger.phone, nationalId: passenger.nationalId, paymentMethod: 'SIMULATED_ONLINE' });
      if (ticket.status !== 'CONFIRMED' || ticket.paymentStatus !== 'PAID') throw new Error('The server did not return a confirmed, paid ticket.');
      setTicket(ticket); navigation.replace('Ticket');
    } catch (e) { Alert.alert('Payment unsuccessful', e instanceof Error ? e.message : 'Payment could not be completed. No reservation was created. You can try again.'); }
    finally { setLoading(false); }
  };
  if (!trip || !seat || !passenger) return <Screen><Text>Booking details are missing. Go back and complete your reservation.</Text></Screen>;
  return <Screen><Text style={styles.title}>Online payment</Text><Text style={styles.sub}>Training demonstration — no real card or money is processed.</Text><View style={styles.card}><Text style={styles.section}>Booking summary</Text><InfoRow label="Route" value={`${trip.from} → ${trip.to}`}/><InfoRow label="Departure" value={`${formatDate(trip.departureDate)} · ${trip.departureTime}`}/><InfoRow label="Passenger" value={passenger.fullName}/><InfoRow label="National ID" value={passenger.nationalId}/><InfoRow label="Seat" value={seat.seatNumber}/><InfoRow label="Amount" value={formatMoney(trip.price)}/></View><View style={styles.method}><Text style={styles.methodIcon}>▣</Text><View style={{flex:1}}><Text style={styles.methodTitle}>Simulated online payment</Text><Text style={styles.methodSub}>{USE_MOCK_DATA ? 'Demo payment handled locally on this device' : 'Demo payment processed by the project backend'}</Text></View><Text style={styles.check}>✓</Text></View><PrimaryButton title={`Pay ${formatMoney(trip.price)} & confirm`} onPress={pay} loading={loading}/><Text style={styles.foot}>{USE_MOCK_DATA ? 'Demo mode: payment is simulated locally. A confirmed ticket is generated; no real payment or backend request is made.' : 'The backend simulates payment and creates a CONFIRMED reservation only if payment succeeds. No pending reservation is created.'}</Text></Screen>;
}
const styles = StyleSheet.create({ title: { fontSize: 24, fontWeight: '800', color: colors.text }, sub: { color: colors.muted, marginTop: 5, marginBottom: 18 }, card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 12 }, section: { color: colors.text, fontWeight: '800', fontSize: 16, marginBottom: 6 }, method: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: colors.accent, borderRadius: 14, padding: 14, marginTop: 18 }, methodIcon: { fontSize: 23, color: colors.primary, marginRight: 12 }, methodTitle: { color: colors.text, fontWeight: '800' }, methodSub: { color: colors.muted, fontSize: 12, marginTop: 3 }, check: { color: colors.success, fontSize: 20, fontWeight: '900' }, foot: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 14 } });
