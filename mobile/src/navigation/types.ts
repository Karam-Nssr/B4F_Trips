import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
export type RootStackParamList = {
  MainTabs: undefined; TripDetails: { tripId: string }; SeatSelection: undefined;
  PassengerInfo: undefined; Payment: undefined; Ticket: undefined;
};
export type RootTabParamList = {
  HomeTab: undefined;
  TripsTab: { from?: string; to?: string; date?: string } | undefined;
};
export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
export type TabScreenProps<T extends keyof RootTabParamList> = BottomTabScreenProps<RootTabParamList, T>;
