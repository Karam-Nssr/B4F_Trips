import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { Screen } from '../../../components/Screen';
import { Field } from '../../../components/Field';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors } from '../../../core/theme/colors';
import { useBooking } from '../../../context/BookingContext';
import { ScreenProps } from '../../../navigation/types';
export default function PassengerInfoScreen({ navigation }: ScreenProps<'PassengerInfo'>) {
  const { trip, seat, setPassenger } = useBooking(); const [fullName, setFullName] = useState(''); const [phone, setPhone] = useState(''); const [nationalId, setNationalId] = useState('');
  const submit = () => { if (!trip || !seat) { Alert.alert('Missing selection', 'Please select a trip and seat first.'); return; } if (!fullName.trim() || !phone.trim() || !nationalId.trim()) { Alert.alert('Required fields', 'Full name, phone number, and national ID are all required.'); return; } if (!/^\+?[0-9\s()-]{7,20}$/.test(phone.trim())) { Alert.alert('Invalid phone', 'Enter a valid phone number.'); return; } if (nationalId.trim().length < 5) { Alert.alert('Invalid national ID', 'Please check the national ID number.'); return; } setPassenger({ fullName: fullName.trim(), phone: phone.trim(), nationalId: nationalId.trim() }); navigation.navigate('Payment'); };
  return <Screen><Text style={styles.title}>Passenger information</Text><Text style={styles.sub}>All fields are required. Enter the passenger's details exactly as they should appear on the ticket.</Text><Field label="Full name *" value={fullName} onChangeText={setFullName} placeholder="Passenger full name" autoCapitalize="words"/><Field label="Phone number *" value={phone} onChangeText={setPhone} placeholder="e.g. 09xxxxxxxx" keyboardType="phone-pad"/><Field label="National ID *" value={nationalId} onChangeText={setNationalId} placeholder="National identification number" keyboardType="number-pad"/><Text style={styles.privacy}>Your national ID is used for reservation identification. Use test data during development.</Text><PrimaryButton title="Continue to payment" onPress={submit}/></Screen>;
}
const styles = StyleSheet.create({ title: { fontSize: 24, fontWeight: '800', color: colors.text }, sub: { color: colors.muted, lineHeight: 21, marginTop: 6, marginBottom: 22 }, privacy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 2 } });
