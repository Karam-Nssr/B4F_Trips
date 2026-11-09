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
import { TripSearchFields } from '../../../components/TripSearchFields';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { TripCard } from '../../../components/TripCard';

import { colors } from '../../../core/theme/colors';
import { tripService } from '../../../services/tripService';
import {
  PaginationMeta,
  Trip,
  TripQuery,
} from '../../../types/trip';

const PAGE_SIZE = 10;

export default function TripsScreen({
  navigation,
  route,
}: TabScreenProps<'TripsTab'>) {
  const [from, setFrom] = useState(route.params?.from || '');
  const [to, setTo] = useState(route.params?.to || '');
  const [date, setDate] = useState(route.params?.date || '');

  const [trips, setTrips] = useState<Trip[]>([]);
  const [pagination, setPagination] =
    useState<PaginationMeta | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const loadTrips = useCallback(
    async (
      filters: TripQuery,
      page: number,
      append: boolean,
    ) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError('');
      }

      try {
        const result = await tripService.getTrips({
          ...filters,
          page,
          limit: PAGE_SIZE,
        });

        setTrips(previous =>
          append
            ? [...previous, ...result.trips]
            : result.trips,
        );

        setPagination(result.pagination);
      } catch (e) {
        const message =
          e instanceof Error
            ? e.message
            : 'Could not load trips.';

        if (!append) {
          setError(message);
          setTrips([]);
          setPagination(null);
        } else {
          Alert.alert('Unable to load more trips', message);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  // Load trips when the screen opens or receives new search parameters.
  useEffect(() => {
    const filters: TripQuery = {
      from: route.params?.from || '',
      to: route.params?.to || '',
      date: route.params?.date || '',
    };

    setFrom(filters.from || '');
    setTo(filters.to || '');
    setDate(filters.date || '');

    loadTrips(filters, 1, false);
  }, [route.params, loadTrips]);

  const search = () => {
    const cleanFrom = from.trim();
    const cleanTo = to.trim();

    if (
      cleanFrom &&
      cleanTo &&
      cleanFrom.toLowerCase() === cleanTo.toLowerCase()
    ) {
      Alert.alert(
        'Choose different cities',
        'Departure and destination cities must be different.',
      );
      return;
    }

    loadTrips(
      {
        from: cleanFrom,
        to: cleanTo,
        date,
      },
      1,
      false,
    );
  };

  const loadMore = () => {
    if (
      !pagination ||
      pagination.currentPage >= pagination.totalPages ||
      loadingMore
    ) {
      return;
    }

    loadTrips(
      {
        from,
        to,
        date,
      },
      pagination.currentPage + 1,
      true,
    );
  };

  return (
    <Screen>
      <Text style={styles.heading}>
        Find your trip
      </Text>

      <Text style={styles.sub}>
        Choose your departure, destination and travel date.
      </Text>

      <View style={styles.search}>
        <TripSearchFields
          from={from}
          to={to}
          date={date}
          onFromChange={setFrom}
          onToChange={setTo}
          onDateChange={setDate}
        />

        <PrimaryButton
          title="Search trips"
          onPress={search}
        />
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          Available trips
        </Text>

        {pagination ? (
          <Text style={styles.count}>
            {pagination.totalRecords} found
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
          <Text style={styles.error}>
            {error}
          </Text>

          <PrimaryButton
            title="Try again"
            onPress={search}
          />
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            No scheduled trips found
          </Text>

          <Text style={styles.empty}>
            Try another city or travel date.
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 25,
    fontWeight: '800',
    color: colors.text,
  },
  sub: {
    color: colors.muted,
    marginTop: 5,
    marginBottom: 17,
    lineHeight: 20,
  },
  search: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 22,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
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
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 5,
  },
  error: {
    color: colors.danger,
    marginBottom: 15,
    textAlign: 'center',
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
});