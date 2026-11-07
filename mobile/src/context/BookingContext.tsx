import React, { createContext, useContext, useMemo, useState } from 'react';
import { PassengerInfo, Ticket } from '../types/booking';
import { Trip } from '../types/trip';
import { Seat } from '../types/seat';

type BookingState = {
  trip: Trip | null; seat: Seat | null; passenger: PassengerInfo | null; ticket: Ticket | null;
  setTrip: (v: Trip | null) => void; setSeat: (v: Seat | null) => void;
  setPassenger: (v: PassengerInfo | null) => void; setTicket: (v: Ticket | null) => void;
  reset: () => void;
};
const BookingContext = createContext<BookingState | null>(null);
export function BookingProvider({ children }: React.PropsWithChildren) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [seat, setSeat] = useState<Seat | null>(null);
  const [passenger, setPassenger] = useState<PassengerInfo | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const reset = () => { setTrip(null); setSeat(null); setPassenger(null); setTicket(null); };
  const value = useMemo(() => ({ trip, seat, passenger, ticket, setTrip, setSeat, setPassenger, setTicket, reset }), [trip, seat, passenger, ticket]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
export function useBooking() {
  const value = useContext(BookingContext);
  if (!value) throw new Error('useBooking must be used inside BookingProvider');
  return value;
}
