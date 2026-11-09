
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

import { PassengerInfo, Ticket } from '../types/booking';
import { Trip } from '../types/trip';
import { Seat } from '../types/seat';

type BookingState = {
  trip: Trip | null;
  seats: Seat[];
  passengers: Record<string, PassengerInfo>;
  ticket: Ticket | null;

  setTrip: (value: Trip | null) => void;
  setSeats: (value: Seat[]) => void;
  setPassengers: React.Dispatch<
    React.SetStateAction<Record<string, PassengerInfo>>
  >;

  updatePassenger: (
    seatId: string,
    passenger: PassengerInfo,
  ) => void;

  setTicket: (value: Ticket | null) => void;
  reset: () => void;
};

const BookingContext = createContext<BookingState | null>(null);

export function BookingProvider({
  children,
}: React.PropsWithChildren) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [passengers, setPassengers] = useState<
    Record<string, PassengerInfo>
  >({});
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const updatePassenger = (
    seatId: string,
    passenger: PassengerInfo,
  ) => {
    setPassengers(previous => ({
      ...previous,
      [seatId]: passenger,
    }));
  };

  const reset = () => {
    setTrip(null);
    setSeats([]);
    setPassengers({});
    setTicket(null);
  };

  const value = useMemo(
    () => ({
      trip,
      seats,
      passengers,
      ticket,
      setTrip,
      setSeats,
      setPassengers,
      updatePassenger,
      setTicket,
      reset,
    }),
    [trip, seats, passengers, ticket],
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const value = useContext(BookingContext);

  if (!value) {
    throw new Error(
      'useBooking must be used inside BookingProvider',
    );
  }

  return value;
}
