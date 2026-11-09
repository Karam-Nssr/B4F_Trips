
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '../../../components/Screen';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { InfoRow } from '../../../components/InfoRow';
import { colors } from '../../../core/theme/colors';
import { USE_MOCK_DATA } from '../../../core/config/api';
import { useBooking } from '../../../context/BookingContext';
import { reservationService } from '../../../services/reservationService';
import { formatDate, formatMoney } from '../../../utils/format';
import { ScreenProps } from '../../../navigation/types';

export default function PaymentScreen({
  navigation,
}: ScreenProps<'Payment'>) {
  const {
    trip,
    seats,
    passengers,
    setTicket,
  } = useBooking();

  const [loading, setLoading] = useState(false);

  const totalPrice = (trip?.price ?? 0) * seats.length;

  const pay = async () => {
    if (!trip || seats.length === 0) {
      Alert.alert(
        'Booking incomplete',
        'Please select a trip and at least one seat.',
      );
      return;
    }

    const missingPassenger = seats.find(
      seat => !passengers[seat._id],
    );

    if (missingPassenger) {
      Alert.alert(
        'Passenger information missing',
        `Complete the passenger details for seat ${missingPassenger.seatNumber}.`,
      );
      return;
    }

    setLoading(true);

    try {
      const ticket = await reservationService.checkout({
        tripId: trip._id,
        passengers: seats.map(seat => ({
          seatId: seat._id,
          seatNumber: seat.seatNumber,
          passenger: passengers[seat._id]!,
        })),
        paymentMethod: 'SIMULATED_ONLINE',
      });

      if (
        ticket.status !== 'CONFIRMED' ||
        ticket.paymentStatus !== 'PAID'
      ) {
        throw new Error(
          'The server did not return a confirmed, paid ticket.',
        );
      }

      setTicket(ticket);
      navigation.replace('Ticket');
    } catch (e) {
      Alert.alert(
        'Payment unsuccessful',
        e instanceof Error
          ? e.message
          : 'Payment could not be completed. No reservation was created. You can try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (!trip || seats.length === 0) {
    return (
      <Screen>
        <Text>Booking details are missing. Go back and complete your reservation.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Online payment</Text>

      <Text style={styles.sub}>
        Training demonstration — no real card or money is processed.
      </Text>

      <View style={styles.card}>
        <Text style={styles.section}>Booking summary</Text>

        <InfoRow
          label="Route"
          value={`${trip.from} → ${trip.to}`}
        />

        <InfoRow
          label="Departure"
          value={`${formatDate(trip.departureDate)} · ${trip.departureTime}`}
        />

        <InfoRow
          label="Number of seats"
          value={String(seats.length)}
        />

        {seats.map((seat, index) => (
          <View key={seat._id} style={styles.passenger}>
            <Text style={styles.passengerTitle}>
              Passenger {index + 1} · Seat {seat.seatNumber}
            </Text>

            <InfoRow
              label="Name"
              value={passengers[seat._id]?.fullName ?? ''}
            />

            <InfoRow
              label="National ID"
              value={passengers[seat._id]?.nationalId ?? ''}
            />

            <InfoRow
              label="Seat price"
              value={formatMoney(trip.price)}
            />
          </View>
        ))}

        <View style={styles.total}>
          <Text style={styles.totalLabel}>Total amount</Text>
          <Text style={styles.totalValue}>
            {formatMoney(totalPrice)}
          </Text>
        </View>
      </View>

      <View style={styles.method}>
        <Text style={styles.methodIcon}>▣</Text>

        <View style={{ flex: 1 }}>
          <Text style={styles.methodTitle}>
            Simulated online payment
          </Text>

          <Text style={styles.methodSub}>
            {USE_MOCK_DATA
              ? 'Demo payment handled locally on this device'
              : 'Demo payment processed by the project backend'}
          </Text>
        </View>

        <Text style={styles.check}>✓</Text>
      </View>

      <PrimaryButton
        title={`Pay ${formatMoney(totalPrice)} & confirm`}
        onPress={pay}
        loading={loading}
      />

      <Text style={styles.foot}>
        {USE_MOCK_DATA
          ? 'Demo mode: payment is simulated locally. No real payment is processed.'
          : 'The backend simulates payment and confirms all selected reservations only if payment succeeds.'}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  sub: {
    color: colors.muted,
    marginTop: 5,
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  section: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 6,
  },
  passenger: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 10,
  },
  passengerTitle: {
    color: colors.primary,
    fontWeight: '800',
    marginBottom: 6,
  },
  total: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 14,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  totalValue: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 21,
  },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
    marginBottom: 18,
  },
  methodIcon: {
    fontSize: 23,
    color: colors.primary,
    marginRight: 12,
  },
  methodTitle: {
    color: colors.text,
    fontWeight: '800',
  },
  methodSub: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  check: {
    color: colors.success,
    fontSize: 20,
    fontWeight: '900',
  },
  foot: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 14,
  },
});
