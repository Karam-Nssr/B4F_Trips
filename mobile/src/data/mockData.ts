import { CheckoutRequest, Ticket } from '../types/booking';
import { Seat, SeatLayoutResponse } from '../types/seat';
import { Trip } from '../types/trip';

const dateOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};


const reservedSeatNumbers: Record<string, number[]> = {
  'mock-trip-1-1': [2, 5, 9, 14, 21, 33],
  'mock-trip-2-1': [1, 4, 11, 20],
  'mock-trip-3-1': [3, 8, 13],
};

const routes = [
  { from: 'Damascus', to: 'Aleppo', time: '07:00', price: 85000, busClass: 'ORDINARY', size: 'LARGE', capacity: 45, busNumber: 'SY-101' },
  { from: 'Damascus', to: 'Homs', time: '08:30', price: 45000, busClass: 'FIRST_CLASS', size: 'LARGE', capacity: 33, busNumber: 'SY-205' },
  { from: 'Damascus', to: 'Latakia', time: '09:00', price: 95000, busClass: 'BUSINESS', size: 'LARGE', capacity: 22, busNumber: 'SY-301' },
  { from: 'Aleppo', to: 'Damascus', time: '10:00', price: 85000, busClass: 'ORDINARY', size: 'MEDIUM', capacity: 37, busNumber: 'SY-108' },
  { from: 'Homs', to: 'Tartus', time: '11:30', price: 40000, busClass: 'FIRST_CLASS', size: 'MEDIUM', capacity: 27, busNumber: 'SY-212' },
  { from: 'Damascus', to: 'Hama', time: '13:00', price: 60000, busClass: 'ORDINARY', size: 'LARGE', capacity: 45, busNumber: 'SY-115' },
  { from: 'Latakia', to: 'Damascus', time: '15:00', price: 95000, busClass: 'BUSINESS', size: 'MEDIUM', capacity: 18, busNumber: 'SY-305' },
  { from: 'Damascus', to: 'Daraa', time: '17:30', price: 35000, busClass: 'ORDINARY', size: 'MEDIUM', capacity: 37, busNumber: 'SY-119' },
];

export const MOCK_TRIPS: Trip[] = routes.flatMap((route, routeIndex) => [0, 1, 2].map(day => ({
  _id: `mock-trip-${routeIndex + 1}-${day + 1}`,
  from: route.from,
  to: route.to,
  departureDate: dateOffset(day),
  departureTime: route.time,
  price: route.price,
  status: 'SCHEDULED' as const,
  bus: {
    _id: `mock-bus-${routeIndex + 1}`,
    busNumber: route.busNumber,
    busClass: route.busClass,
    size: route.size,
    capacity: route.capacity,
  },
  totalSeats: route.capacity,
  availableSeats: route.capacity - (reservedSeatNumbers[`mock-trip-${routeIndex + 1}-${day + 1}`]?.length || 0),
})));

const mockBookedSeatIds = new Set<string>();

export function getMockSeats(trip: Trip): SeatLayoutResponse {
  const bus = typeof trip.bus === 'string' ? null : trip.bus;
  const busClass = bus?.busClass || 'ORDINARY';
  const size = bus?.size || 'LARGE';
  const rows = size === 'MEDIUM' ? 9 : 11;
  const columns = busClass === 'ORDINARY' ? 4 : busClass === 'FIRST_CLASS' ? 3 : 2;
  const count = bus?.capacity || (rows * columns);
  const seats: Seat[] = [];
  let seatNumber = 1;

  for (let row = 1; row <= rows && seatNumber <= count; row++) {
    const rowCapacity = busClass === 'ORDINARY' && row === rows ? Math.min(5, count - seatNumber + 1) : columns;
    for (let col = 1; col <= rowCapacity && seatNumber <= count; col++) {
      const number = seatNumber++;
      const seatId = `${trip._id}-seat-${number}`;
      const reserved = (reservedSeatNumbers[trip._id] || []).includes(number) || mockBookedSeatIds.has(seatId);
      seats.push({
        _id: seatId,
        seatNumber: String(number).padStart(2, '0'),
        row,
        position: busClass === 'BUSINESS' ? (col === 1 ? 'LEFT' : 'RIGHT') : busClass === 'FIRST_CLASS' ? (col === 1 ? 'LEFT' : 'RIGHT') : col <= 2 ? 'LEFT' : 'RIGHT',
        column: col,
        status: reserved ? 'RESERVED' : 'AVAILABLE',
        isActive: true,
      });
    }
  }
  return { tripId: trip._id, seats, totalSeats: seats.length, availableSeats: seats.filter(seat => seat.status === 'AVAILABLE').length, reservedSeats: seats.filter(seat => seat.status === 'RESERVED').length };
}

export async function createMockTicket(payload: CheckoutRequest, trip: Trip, seat: Seat): Promise<Ticket> {
  // A short delay makes the demo payment interaction feel like a real checkout.
  await new Promise(resolve => setTimeout(resolve, 900));
  mockBookedSeatIds.add(seat._id);
  const reference = `DEMO-${Date.now().toString().slice(-8)}`;
  const bus = typeof trip.bus === 'string' ? undefined : trip.bus;
  return {
    bookingReference: reference,
    reservationId: `demo-reservation-${Date.now()}`,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    passengerName: payload.fullName,
    passengerPhone: payload.phone,
    nationalId: payload.nationalId,
    seatNumber: seat.seatNumber,
    trip: {
      from: trip.from,
      to: trip.to,
      departureDate: trip.departureDate,
      departureTime: trip.departureTime,
      price: trip.price,
      busNumber: bus?.busNumber,
    },
    paidAt: new Date().toISOString(),
  };
}
