export interface PassengerInfo {
  fullName: string;
  phone: string;
  nationalId: string;
}
export interface CheckoutRequest extends PassengerInfo {
  tripId: string;
  seatId: string;
  paymentMethod: 'SIMULATED_ONLINE';
}
export interface Ticket {
  bookingReference: string;
  reservationId: string;
  status: 'CONFIRMED';
  paymentStatus: 'PAID';
  passengerName: string;
  passengerPhone: string;
  nationalId?: string;
  seatNumber: string;
  trip: {
    from: string;
    to: string;
    departureDate: string;
    departureTime: string;
    price: number;
    busNumber?: string;
  };
  paidAt?: string;
}
