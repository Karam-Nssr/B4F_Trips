import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { TabScreenProps } from '../../../navigation/types';
import { Screen } from '../../../components/Screen';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { TripSearchFields } from '../../../components/TripSearchFields';
import { colors } from '../../../core/theme/colors';
import { USE_MOCK_DATA } from '../../../core/config/api';

export default function HomeScreen({ navigation }: TabScreenProps<'HomeTab'>) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  const search = () => {
    if (from && to && from === to) {
      Alert.alert('Choose different cities', 'Departure and destination cities must be different.');
      return;
    }
    navigation.navigate('TripsTab', { from, to, date });
  };

  return <Screen>
    <View style={styles.hero}>
      <Text style={styles.eyebrow}>TRAVEL WITH CONFIDENCE</Text>
      <Text style={styles.title}>Your journey starts here.</Text>
      <Text style={styles.subtitle}>Find your route, choose your seat, and get your ticket in just a few steps.</Text>
      <View style={styles.routeBadge}><Text style={styles.routeBadgeText}>DAMASCUS  →  ALL SYRIA</Text></View>
    </View>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Find your bus</Text>
      <TripSearchFields from={from} to={to} date={date} onFromChange={setFrom} onToChange={setTo} onDateChange={setDate}/>
      <PrimaryButton title="Search available trips" onPress={search}/>
    </View>
    <View style={styles.features}>
      <View style={styles.feature}><Text style={styles.featureIcon}>▣</Text><Text style={styles.featureTitle}>Choose your seat</Text><Text style={styles.featureText}>See the actual bus layout.</Text></View>
      <View style={styles.feature}><Text style={styles.featureIcon}>✓</Text><Text style={styles.featureTitle}>Digital ticket</Text><Text style={styles.featureText}>Get your ticket after payment.</Text></View>
    </View>
    <Text style={styles.note}>No account required. Passenger information is collected only when making a reservation.</Text>
    {USE_MOCK_DATA ? <Text style={styles.demo}>DEMO MODE · Sample trips and simulated payment</Text> : null}
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.primary, borderRadius: 22, padding: 22, marginBottom: 18 },
  eyebrow: { color: '#A9DCCF', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 12, lineHeight: 35 },
  subtitle: { color: '#DCE7F3', marginTop: 9, lineHeight: 21 },
  routeBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginTop: 17 },
  routeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 17, borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 15 },
  features: { flexDirection: 'row', gap: 10, marginTop: 17 },
  feature: { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 13 },
  featureIcon: { color: colors.accent, fontSize: 19, fontWeight: '900' },
  featureTitle: { color: colors.text, fontSize: 12, fontWeight: '800', marginTop: 7 },
  featureText: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  note: { color: colors.muted, textAlign: 'center', lineHeight: 19, marginTop: 18, paddingHorizontal: 8, fontSize: 12 },
  demo: { color: colors.warning, textAlign: 'center', marginTop: 10, fontWeight: '800', fontSize: 10, letterSpacing: 0.8 },
});
