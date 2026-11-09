import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../core/theme/colors';
import { Trip } from '../types/trip';
import { formatDate, formatMoney } from '../utils/format';

interface Props {
  trip: Trip;
  onPress: () => void;
}

export function TripCard({ trip, onPress }: Props) {
  const bus =
    typeof trip.bus === 'string' ? null : trip.bus;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.route}>
        <Text style={styles.city} numberOfLines={1}>
          {trip.from}
        </Text>

        <Text style={styles.arrow}>→</Text>

        <Text
          style={[styles.city, styles.destination]}
          numberOfLines={1}
        >
          {trip.to}
        </Text>
      </View>

      <View style={styles.line} />

      <View style={styles.detailsRow}>
        <View>
          <Text style={styles.metaLabel}>DEPARTURE</Text>
          <Text style={styles.meta}>
            {formatDate(trip.departureDate)}
          </Text>
          <Text style={styles.time}>
            {trip.departureTime}
          </Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.metaLabel}>BUS CLASS</Text>
          <Text style={styles.meta}>
            {bus?.busClass?.replace(/_/g, ' ') || 'Bus'}
          </Text>

          {bus?.busNumber ? (
            <Text style={styles.busNumber}>
              Bus {bus.busNumber}
            </Text>
          ) : null}

          {trip.availableSeats !== undefined ? (
            <Text style={styles.seats}>
              {trip.availableSeats} seats available
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.price}>
          {formatMoney(trip.price)}
        </Text>

        <Text style={styles.view}>
          View trip ›
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 17,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.8,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  city: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
  },
  destination: {
    textAlign: 'right',
  },
  arrow: {
    color: colors.accent,
    fontSize: 21,
    paddingHorizontal: 12,
  },
  line: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  right: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  meta: {
    color: colors.text,
    fontSize: 12,
    marginTop: 5,
    fontWeight: '600',
  },
  time: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
  },
  busNumber: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
  seats: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  price: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  view: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: 12,
  },
});