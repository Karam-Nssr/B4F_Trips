export interface PassengerInfo {
  fullName: string;
  phone: string;
  nationalId: string;
}

export interface SeatPassenger {
  seatId: string;
  seatNumber: string;
  passenger: PassengerInfo;
}

export interface CheckoutRequest {
  tripId: string;
  passengers: SeatPassenger[];
  paymentMethod: 'SIMULATED_ONLINE';
}

export interface TicketPassenger extends PassengerInfo {
  seatId: string;
  seatNumber: string;
}

export interface Ticket {
  bookingReference: string;
  reservationId: string;
  status: 'CONFIRMED';
  paymentStatus: 'PAID';
  passengers: TicketPassenger[];
  totalAmount: number;
  paidAt?: string;
  trip: {
    from: string;
    to: string;
    departureDate: string;
    departureTime: string;
    price: number;
    busNumber?: string;
  };
}
