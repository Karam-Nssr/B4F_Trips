
import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootTabParamList = {
  HomeTab: undefined;
  TripsTab: {
    from?: string;
    to?: string;
    date?: string;
  } | undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList> | undefined;
  TripDetails: { tripId: string };
  SeatSelection: undefined;
  PassengerInfo: undefined;
  Payment: undefined;
  Ticket: undefined;
};

export type ScreenProps<
  T extends keyof RootStackParamList
> = NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<
  T extends keyof RootTabParamList
> = BottomTabScreenProps<RootTabParamList, T> & {
  navigation: BottomTabScreenProps<RootTabParamList, T>['navigation'] &
    NativeStackScreenProps<RootStackParamList>['navigation'];
};
