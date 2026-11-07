import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../features/home/screens/HomeScreen';
import TripsScreen from '../features/trips/screens/TripsScreen';
import TripDetailsScreen from '../features/trips/screens/TripDetailsScreen';
import SeatSelectionScreen from '../features/seats/screens/SeatSelectionScreen';
import PassengerInfoScreen from '../features/reservations/screens/PassengerInfoScreen';
import PaymentScreen from '../features/payment/screens/PaymentScreen';
import TicketScreen from '../features/tickets/screens/TicketScreen';
import { RootStackParamList, RootTabParamList } from './types';
import { colors } from '../core/theme/colors';
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<RootTabParamList>();
function MainTabs() {
  return <Tabs.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarStyle: { height: 62, paddingTop: 7, paddingBottom: 7 } }}>
    <Tabs.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⌂</Text> }}/>
    <Tabs.Screen name="TripsTab" component={TripsScreen} options={{ title: 'Trips', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>▤</Text> }}/>
  </Tabs.Navigator>;
}
export default function AppNavigator() {
  return <NavigationContainer><Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.primary, headerTitleStyle: { fontWeight: '800' }, contentStyle: { backgroundColor: colors.background } }}>
    <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }}/>
    <Stack.Screen name="TripDetails" component={TripDetailsScreen} options={{ title: 'Trip details' }}/>
    <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} options={{ title: 'Select seat' }}/>
    <Stack.Screen name="PassengerInfo" component={PassengerInfoScreen} options={{ title: 'Passenger details' }}/>
    <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }}/>
    <Stack.Screen name="Ticket" component={TicketScreen} options={{ title: 'Your ticket', headerBackVisible: false }}/>
  </Stack.Navigator></NavigationContainer>;
}
