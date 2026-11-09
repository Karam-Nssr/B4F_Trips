import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { TabScreenProps } from '../../../navigation/types';
import { Screen } from '../../../components/Screen';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { TripSearchFields } from '../../../components/TripSearchFields';
import { TripCard } from '../../../components/TripCard';

import { colors } from '../../../core/theme/colors';
import { tripService } from '../../../services/tripService';
import { Trip, PaginationMeta } from '../../../types/trip';

const PAGE_SIZE = 10;

export default function HomeScreen({
  navigation,
}: TabScreenProps<'HomeTab'>) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  const [trips, setTrips] = useState<Trip[]>([]);
  const [pagination, setPagination] =
    useState<PaginationMeta | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await tripService.getTrips({
        page: 1,
        limit: PAGE_SIZE,
      });

      setTrips(result.trips);
      setPagination(result.pagination);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not load trips.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const loadMore = async () => {
    if (
      !pagination ||
      pagination.currentPage >= pagination.totalPages ||
      loadingMore
    ) {
      return;
    }

    setLoadingMore(true);

    try {
      const nextPage = pagination.currentPage + 1;

      const result = await tripService.getTrips({
        page: nextPage,
        limit: PAGE_SIZE,
      });

      setTrips(previous => [
        ...previous,
        ...result.trips,
      ]);

      setPagination(result.pagination);
    } catch (e) {
      Alert.alert(
        'Unable to load more trips',
        e instanceof Error
          ? e.message
          : 'Please try again.',
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const search = () => {
    if (from.trim() && to.trim() &&
        from.trim().toLowerCase() === to.trim().toLowerCase()) {
      Alert.alert(
        'Choose different cities',
        'Departure and destination cities must be different.',
      );
      return;
    }

    navigation.navigate('TripsTab', {
      from: from.trim(),
      to: to.trim(),
      date,
    });
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>
          TRAVEL WITH CONFIDENCE
        </Text>

        <Text style={styles.title}>
          Your journey starts here.
        </Text>

        <Text style={styles.subtitle}>
          Find your route, choose your seat, and get your
          ticket in just a few steps.
        </Text>

        <View style={styles.routeBadge}>
          <Text style={styles.routeBadgeText}>
            DAMASCUS → ALL SYRIA
          </Text>
        </View>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.cardTitle}>
          Find your bus
        </Text>

        <TripSearchFields
          from={from}
          to={to}
          date={date}
          onFromChange={setFrom}
          onToChange={setTo}
          onDateChange={setDate}
        />

        <PrimaryButton
          title="Search available trips"
          onPress={search}
        />
      </View>

      <View style={styles.resultsHeader}>
        <View>
          <Text style={styles.resultsTitle}>
            Available trips
          </Text>

          <Text style={styles.resultsSubtitle}>
            Scheduled journeys across Syria
          </Text>
        </View>

        {pagination ? (
          <Text style={styles.count}>
            {pagination.totalRecords} trips
          </Text>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      ) : error ? (
        <View style={styles.emptyCard}>
          <Text style={styles.error}>{error}</Text>

          <PrimaryButton
            title="Try again"
            onPress={loadTrips}
          />
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            No scheduled trips
          </Text>

          <Text style={styles.emptyText}>
            There are currently no scheduled trips.
            Please check again later.
          </Text>
        </View>
      ) : (
        <>
          {trips.map(trip => (
            <TripCard
              key={trip._id}
              trip={trip}
              onPress={() =>
                navigation.navigate('TripDetails', {
                  tripId: trip._id,
                })
              }
            />
          ))}

          {pagination &&
          pagination.currentPage < pagination.totalPages ? (
            <View style={styles.loadMore}>
              {loadingMore ? (
                <ActivityIndicator
                  color={colors.primary}
                />
              ) : (
                <PrimaryButton
                  title="Load more trips"
                  onPress={loadMore}
                />
              )}
            </View>
          ) : (
            <Text style={styles.endText}>
              You've reached the end of the available trips.
            </Text>
          )}
        </>
      )}

      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>▣</Text>
          <Text style={styles.featureTitle}>
            Choose your seat
          </Text>
          <Text style={styles.featureText}>
            See the actual bus layout.
          </Text>
        </View>

        <View style={styles.feature}>
          <Text style={styles.featureIcon}>✓</Text>
          <Text style={styles.featureTitle}>
            Digital ticket
          </Text>
          <Text style={styles.featureText}>
            Get your ticket after payment.
          </Text>
        </View>
      </View>

      <Text style={styles.note}>
        No account required. Passenger information is
        collected only when making a reservation.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: 22,
    marginBottom: 18,
  },
  eyebrow: {
    color: '#A9DCCF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
    lineHeight: 35,
  },
  subtitle: {
    color: '#DCE7F3',
    marginTop: 9,
    lineHeight: 21,
  },
  routeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 17,
  },
  routeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  searchCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 15,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  resultsTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 20,
  },
  resultsSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  count: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  loader: {
    marginTop: 30,
    marginBottom: 30,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 15,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 20,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 15,
  },
  loadMore: {
    marginTop: 5,
    marginBottom: 15,
  },
  endText: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 12,
    marginVertical: 15,
  },
  features: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  feature: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
  },
  featureIcon: {
    color: colors.accent,
    fontSize: 19,
    fontWeight: '900',
  },
  featureTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 7,
  },
  featureText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  note: {
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 8,
    fontSize: 12,
  },
});