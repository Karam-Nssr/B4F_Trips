# Bus Reservation Mobile App

React Native + Expo + TypeScript guest mobile app for browsing bus trips, selecting seats, entering passenger information, completing a simulated online payment, and receiving a digital ticket.

## Requirements implemented

- No customer account, login, registration, or token.
- Full name, phone number, and national ID are mandatory.
- Online payment only; payment is simulated by the backend.
- Reservation statuses are only `CONFIRMED` and `CANCELLED`.
- A reservation is created as `CONFIRMED` only after simulated payment succeeds. A failed payment creates no reservation.
- Seat availability must be rechecked and reserved atomically by the backend during checkout to prevent double booking.

## Setup

```bash
npm install
npx expo install --fix
npm run start
```

For Android emulator, `API_BASE_URL` is set to `http://10.0.2.2:5000/api`. Change `src/core/config/api.ts` to your backend's LAN address when using a physical device, e.g. `http://192.168.1.20:5000/api`.

## Backend API contract expected by this app

All endpoints are prefixed with `/api`. The app sends no authorization header and no token.

### `GET /trips?from=&to=&date=`
Returns an array of trips, or `{ "trips": [...] }`.

```json
{
  "_id": "tripId",
  "from": "Damascus",
  "to": "Homs",
  "departureDate": "2026-12-01T00:00:00.000Z",
  "departureTime": "08:00",
  "price": 50000,
  "status": "SCHEDULED",
  "bus": { "_id": "busId", "busNumber": "1234", "busClass": "ORDINARY", "capacity": 45 },
  "availableSeats": 20,
  "totalSeats": 45
}
```

### `GET /trips/:tripId`
Returns one trip in the same shape.

### `GET /trips/:tripId/seats`
Returns `{ "tripId": "...", "seats": [...] }`. Every seat has `_id`, `seatNumber`, `row`, `position` (`LEFT`, `MIDDLE`, or `RIGHT`), and `status` (`AVAILABLE` or `RESERVED`). Optional `isActive` can hide inactive seats.

### `POST /reservations/checkout`
This is one atomic backend operation. It simulates online payment first. If payment succeeds, it creates a `CONFIRMED` reservation, stores the payment as `PAID`, and returns the ticket. It must not create a pending reservation. If payment fails or the seat is no longer available, return an error and do not create a confirmed reservation.

Request:

```json
{
  "tripId": "tripId",
  "seatId": "seatId",
  "fullName": "Test Passenger",
  "phone": "0990000000",
  "nationalId": "0123456789",
  "paymentMethod": "SIMULATED_ONLINE"
}
```

Success response (the API client also accepts this wrapped in `{ "data": ... }`):

```json
{
  "bookingReference": "BR-2026-000123",
  "reservationId": "reservationId",
  "status": "CONFIRMED",
  "paymentStatus": "PAID",
  "passengerName": "Test Passenger",
  "passengerPhone": "0990000000",
  "nationalId": "0123456789",
  "seatNumber": "A1",
  "trip": {
    "from": "Damascus",
    "to": "Homs",
    "departureDate": "2026-12-01T00:00:00.000Z",
    "departureTime": "08:00",
    "price": 50000,
    "busNumber": "1234"
  },
  "paidAt": "2026-11-07T10:00:00.000Z"
}
```

Recommended error status codes: `400` invalid passenger/payment data, `404` trip or seat not found, `409` seat already reserved or trip unavailable, `402` simulated payment failed, `500` unexpected server error. Return a JSON `{ "message": "..." }` on errors.

## Important backend rule

Do not trust the app to confirm payment. The `/reservations/checkout` endpoint must perform the simulated payment and reservation creation on the server. Recheck seat availability inside the same transaction/atomic operation. Use a unique active reservation constraint for `(trip, seat)` so two simultaneous customers cannot reserve the same seat.

## Notes

- The seat layout renders the three possible seat positions per row. A missing position is shown as an aisle/empty space; inactive seats are hidden.
- The UI currently displays prices in SYP. Change `src/utils/format.ts` if your backend uses another currency.
- This is a training payment simulation. Do not collect or transmit real card numbers or CVVs.
- The app expects `from`, `to`, `departureDate`, `departureTime`, and `price` trip fields. If your backend uses different names or route paths, update the service/type mapping to match it.
