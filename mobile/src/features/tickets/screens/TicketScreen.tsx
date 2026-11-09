
import React from 'react';
import {
  Alert,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '../../../components/Screen';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { InfoRow } from '../../../components/InfoRow';
import { colors } from '../../../core/theme/colors';
import { useBooking } from '../../../context/BookingContext';
import { formatDate, formatMoney } from '../../../utils/format';
import { ScreenProps } from '../../../navigation/types';

export default function TicketScreen({
  navigation,
}: ScreenProps<'Ticket'>) {
  const { ticket, reset } = useBooking();

  if (!ticket) {
    return (
      <Screen>
        <Text>Ticket not found.</Text>
        <PrimaryButton
          title="Back to trips"
          onPress={() => navigation.navigate('MainTabs')}
        />
      </Screen>
    );
  }

  const share = async () => {
    try {
      const passengerDetails = ticket.passengers
        .map(
          (passenger, index) =>
            `Passenger ${index + 1}: ${passenger.fullName}\n` +
            `Phone: ${passenger.phone}\n` +
            `National ID: ${passenger.nationalId}\n` +
            `Seat: ${passenger.seatNumber}`,
        )
        .join('\n\n');

      await Share.share({
        message:
          `BUS TICKET\n` +
          `Reference: ${ticket.bookingReference}\n\n` +
          `${ticket.trip.from} to ${ticket.trip.to}\n` +
          `${formatDate(ticket.trip.departureDate)} at ${ticket.trip.departureTime}\n\n` +
          `${passengerDetails}\n\n` +
          `Total paid: ${formatMoney(ticket.totalAmount)}\n` +
          `Status: CONFIRMED · PAID`,
      });
    } catch {
      Alert.alert('Unable to share ticket');
    }
  };

  const newBooking = () => {
    reset();

    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <Screen>
      <View style={styles.success}>
        <Text style={styles.tick}>✓</Text>
        <Text style={styles.successTitle}>
          Payment successful!
        </Text>
        <Text style={styles.successSub}>
          Your reservation is confirmed.
        </Text>
      </View>

      <View style={styles.ticket}>
        <Text style={styles.brand}>BUS RESERVATION</Text>

        <Text style={styles.refLabel}>BOOKING REFERENCE</Text>

        <Text style={styles.reference}>
          {ticket.bookingReference}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.route}>
          {ticket.trip.from} → {ticket.trip.to}
        </Text>

        <Text style={styles.date}>
          {formatDate(ticket.trip.departureDate)} ·{' '}
          {ticket.trip.departureTime}
        </Text>

        <InfoRow
          label="Bus"
          value={ticket.trip.busNumber || '—'}
        />

        <InfoRow
          label="Number of passengers"
          value={String(ticket.passengers.length)}
        />

        {ticket.passengers.map((passenger, index) => (
          <View key={passenger.seatId} style={styles.passenger}>
            <Text style={styles.passengerTitle}>
              Passenger {index + 1} · Seat {passenger.seatNumber}
            </Text>

            <InfoRow
              label="Name"
              value={passenger.fullName}
            />

            <InfoRow
              label="Phone"
              value={passenger.phone}
            />

            <InfoRow
              label="National ID"
              value={passenger.nationalId}
            />
          </View>
        ))}

        <View style={styles.divider} />

        <InfoRow
          label="Total paid"
          value={formatMoney(ticket.totalAmount)}
        />

        <InfoRow
          label="Reservation"
          value="CONFIRMED"
        />

        <InfoRow
          label="Payment"
          value="PAID"
        />

        <Text style={styles.notice}>
          Please keep your booking reference. Every passenger
          must present their national ID when boarding.
        </Text>
      </View>

      <PrimaryButton
        title="Share ticket"
        onPress={share}
      />

      <PrimaryButton
        title="Book another trip"
        onPress={newBooking}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  success: {
    alignItems: 'center',
    marginBottom: 18,
  },
  tick: {
    backgroundColor: '#DDF4E8',
    color: colors.success,
    fontSize: 30,
    fontWeight: '900',
    width: 58,
    height: 58,
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: 29,
    overflow: 'hidden',
  },
  successTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '800',
    marginTop: 12,
  },
  successSub: {
    color: colors.success,
    marginTop: 4,
  },
  ticket: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 17,
    marginBottom: 16,
  },
  brand: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  refLabel: {
    color: colors.muted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 18,
    letterSpacing: 1,
  },
  reference: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    marginVertical: 17,
  },
  route: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  date: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 12,
  },
  passenger: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 12,
  },
  passengerTitle: {
    color: colors.primary,
    fontWeight: '800',
    marginBottom: 8,
  },
  notice: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 14,
    textAlign: 'center',
  },
});
