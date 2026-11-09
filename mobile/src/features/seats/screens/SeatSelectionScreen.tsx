
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '../../../components/Screen';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors } from '../../../core/theme/colors';
import { useBooking } from '../../../context/BookingContext';
import { seatService } from '../../../services/seatService';
import { Seat } from '../../../types/seat';
import { ScreenProps } from '../../../navigation/types';
import { formatMoney } from '../../../utils/format';

export default function SeatSelectionScreen({
  navigation,
}: ScreenProps<'SeatSelection'>) {
  const {
    trip,
    seats: selectedSeats,
    setSeats,
    setPassengers,
  } = useBooking();

  // All seats returned by the backend.
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadSeats = async () => {
      if (!trip) {
        setError('Select a trip first.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      // Start a fresh selection when opening this screen for a trip.
      setSeats([]);
      setPassengers({});

      try {
        const result = await seatService.getSeats(trip._id);

        if (mounted) {
          setAvailableSeats(result.seats);
        }
      } catch (e) {
        if (mounted) {
          setError(
            e instanceof Error ? e.message : 'Could not load seats.',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSeats();

    return () => {
      mounted = false;
    };
  }, [trip?._id]);

  const rows = useMemo(
    () =>
      [...new Set(availableSeats.map(seat => seat.row))].sort(
        (a, b) => a - b,
      ),
    [availableSeats],
  );

  const maxColumns = Math.max(
    0,
    ...availableSeats.map(seat => seat.column ?? 0),
  );

  const aisleAfter = maxColumns >= 4 ? 2 : 1;

  const toggleSeat = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE' || seat.isActive === false) {
      return;
    }

    const alreadySelected = selectedSeats.some(
      item => item._id === seat._id,
    );

    if (alreadySelected) {
      setSeats(
        selectedSeats.filter(item => item._id !== seat._id),
      );

      setPassengers(previous =>{ 
        const updated = { ...previous };
        delete updated[seat._id];
        return updated;
      });
    } else {
      setSeats([...selectedSeats, seat]);
    }
  };

  const rowSeats = (row: number) =>
    availableSeats
      .filter(
        seat => seat.row === row && seat.isActive !== false,
      )
      .sort(
        (a, b) => (a.column ?? 0) - (b.column ?? 0),
      );

  const totalPrice = (trip?.price ?? 0) * selectedSeats.length;

  if (!trip) {
    return (
      <Screen>
        <Text>Select a trip before choosing seats.</Text>
      </Screen>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Choose your seats</Text>

      <Text style={styles.sub}>
        {trip.from} → {trip.to}
      </Text>

      <View style={styles.legend}>
        <Legend color={colors.available} label="Available" />
        <Legend color={colors.reserved} label="Reserved" />
        <Legend color={colors.primary} label="Selected" />
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <View style={styles.bus}>
          <View style={styles.driver}>
            <Text style={styles.driverText}>
              FRONT / DRIVER
            </Text>
          </View>

          {rows.map(row => {
            const rowItems = rowSeats(row);

            return (
              <View key={row} style={styles.row}>
                {rowItems.map((item, index) => {
                  const reserved = item.status === 'RESERVED';

                  const selected = selectedSeats.some(
                    seat => seat._id === item._id,
                  );

                  const col = item.column ?? index + 1;

                  return (
                    <React.Fragment key={item._id}>
                      {col === aisleAfter + 1 && (
                        <View style={styles.aisle} />
                      )}

                      <Pressable
                        disabled={reserved}
                        onPress={() => toggleSeat(item)}
                        style={[
                          styles.seat,
                          reserved && styles.reserved,
                          selected && styles.selected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.seatText,
                            selected && { color: '#fff' },
                            reserved && { color: colors.danger },
                          ]}
                        >
                          {item.seatNumber}
                        </Text>
                      </Pressable>
                    </React.Fragment>
                  );
                })}
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.summary}>
        <Text style={styles.selectedLabel}>
          {selectedSeats.length > 0
            ? `Selected seats: ${selectedSeats
                .map(seat => seat.seatNumber)
                .join(', ')}`
            : 'Tap available seats to select them.'}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            {selectedSeats.length} seat(s)
          </Text>

          <Text style={styles.price}>
            {formatMoney(totalPrice)}
          </Text>
        </View>
      </View>

      <PrimaryButton
        title="Continue"
        disabled={selectedSeats.length === 0 || !!error}
        onPress={() => navigation.navigate('PassengerInfo')}
      />
    </Screen>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[styles.dot, { backgroundColor: color }]}
      />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  sub: {
    color: colors.muted,
    marginTop: 5,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 13,
    height: 13,
    borderRadius: 4,
  },
  legendText: {
    color: colors.muted,
    fontSize: 12,
  },
  bus: {
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 330,
  },
  driver: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 13,
    marginBottom: 10,
    alignItems: 'center',
  },
  driverText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    gap: 6,
  },
  aisle: {
    width: 17,
    height: 42,
  },
  seat: {
    width: 52,
    height: 42,
    borderRadius: 9,
    backgroundColor: colors.available,
    borderWidth: 1,
    borderColor: '#B8DCC9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reserved: {
    backgroundColor: colors.reserved,
    borderColor: '#F0C3C3',
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  seatText: {
    color: colors.success,
    fontWeight: '800',
  },
  selectedLabel: {
    textAlign: 'center',
    color: colors.text,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    marginTop: 12,
    textAlign: 'center',
  },
  summary: {
    marginVertical: 18,
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: colors.muted,
    fontWeight: '600',
  },
  price: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
});
