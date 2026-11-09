
import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '../../../components/Screen';
import { Field } from '../../../components/Field';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { InfoRow } from '../../../components/InfoRow';
import { colors } from '../../../core/theme/colors';
import { useBooking } from '../../../context/BookingContext';
import { PassengerInfo } from '../../../types/booking';
import { ScreenProps } from '../../../navigation/types';

export default function PassengerInfoScreen({
  navigation,
}: ScreenProps<'PassengerInfo'>) {
  const {
    trip,
    seats,
    passengers,
    setPassengers,
  } = useBooking();

  const [formData, setFormData] = useState<
    Record<string, PassengerInfo>
  >({});

  useEffect(() => {
    const initialData: Record<string, PassengerInfo> = {};

    seats.forEach(seat => {
      initialData[seat._id] = passengers[seat._id] ?? {
        fullName: '',
        phone: '',
        nationalId: '',
      };
    });

    setFormData(initialData);
  }, [seats, passengers]);

  const updateField = (
    seatId: string,
    field: keyof PassengerInfo,
    value: string,
  ) => {
    setFormData(previous => ({
      ...previous,
      [seatId]: {
        ...(previous[seatId] ?? {
          fullName: '',
          phone: '',
          nationalId: '',
        }),
        [field]: value,
      },
    }));
  };

  const submit = () => {
    if (!trip || seats.length === 0) {
      Alert.alert(
        'Missing selection',
        'Please select a trip and at least one seat first.',
      );
      return;
    }

    for (const seat of seats) {
      const passenger = formData[seat._id];

      if (
        !passenger ||
        !passenger.fullName.trim() ||
        !passenger.phone.trim() ||
        !passenger.nationalId.trim()
      ) {
        Alert.alert(
          'Required fields',
          `Please complete all information for seat ${seat.seatNumber}.`,
        );
        return;
      }

      if (!/^\+?[0-9\s()-]{7,20}$/.test(passenger.phone.trim())) {
        Alert.alert(
          'Invalid phone',
          `Enter a valid phone number for seat ${seat.seatNumber}.`,
        );
        return;
      }

      if (passenger.nationalId.trim().length < 5) {
        Alert.alert(
          'Invalid national ID',
          `Check the national ID for seat ${seat.seatNumber}.`,
        );
        return;
      }
    }

    const cleanedData: Record<string, PassengerInfo> = {};

    seats.forEach(seat => {
      const passenger = formData[seat._id];

      cleanedData[seat._id] = {
        fullName: passenger.fullName.trim(),
        phone: passenger.phone.trim(),
        nationalId: passenger.nationalId.trim(),
      };
    });

    setPassengers(cleanedData);
    navigation.navigate('Payment');
  };

  if (!trip || seats.length === 0) {
    return (
      <Screen>
        <Text>No selected seats found. Please go back and select seats.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Passenger information</Text>

      <Text style={styles.sub}>
        Enter the information for every passenger. Each passenger
        must have their own name, phone number, and national ID.
      </Text>

      <View style={styles.summary}>
        <InfoRow label="Route" value={`${trip.from} → ${trip.to}`} />
        <InfoRow label="Selected seats" value={String(seats.length)} />
      </View>

      {seats.map((seat, index) => {
        const passenger = formData[seat._id] ?? {
          fullName: '',
          phone: '',
          nationalId: '',
        };

        return (
          <View key={seat._id} style={styles.passengerCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                Passenger {index + 1}
              </Text>

              <Text style={styles.seatBadge}>
                Seat {seat.seatNumber}
              </Text>
            </View>

            <Field
              label="Full name *"
              value={passenger.fullName}
              onChangeText={value =>
                updateField(seat._id, 'fullName', value)
              }
              placeholder="Passenger full name"
              autoCapitalize="words"
            />

            <Field
              label="Phone number *"
              value={passenger.phone}
              onChangeText={value =>
                updateField(seat._id, 'phone', value)
              }
              placeholder="e.g. 09xxxxxxxx"
              keyboardType="phone-pad"
            />

            <Field
              label="National ID *"
              value={passenger.nationalId}
              onChangeText={value =>
                updateField(seat._id, 'nationalId', value)
              }
              placeholder="National identification number"
              keyboardType="number-pad"
            />
          </View>
        );
      })}

      <Text style={styles.privacy}>
        Passenger information is used for reservation identification.
        Use test data during development.
      </Text>

      <PrimaryButton
        title="Continue to payment"
        onPress={submit}
      />
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
    lineHeight: 21,
    marginTop: 6,
    marginBottom: 18,
  },
  summary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  passengerCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 15,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  seatBadge: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  privacy: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
});
