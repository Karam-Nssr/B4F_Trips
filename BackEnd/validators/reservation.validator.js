const validateCreateReservation = (req, res, next) => {
  const { trip, seat, passengerName, passengerPhone } = req.body;
  const errors = [];

  if (!trip) errors.push("Trip ID is required.");
  if (!seat) errors.push("Seat ID is required.");
  if (!passengerName || passengerName.trim().length < 2)
    errors.push("Passenger name must be at least 2 characters.");
  if (!passengerPhone || passengerPhone.trim().length < 7)
    errors.push("A valid passenger phone number is required.");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }
  next();
};

const validateCheckout = (req, res, next) => {
  const { tripId, passengers, paymentMethod } = req.body;
  const errors = [];

  if (!tripId) errors.push("Trip ID is required.");
  if (!Array.isArray(passengers) || passengers.length === 0) {
    errors.push("At least one passenger and seat are required.");
  } else {
    const seatIds = new Set();

    passengers.forEach((item, index) => {
      const prefix = `Passenger ${index + 1}`;

      if (!item || !item.seatId) {
        errors.push(`${prefix}: seat ID is required.`);
      } else if (seatIds.has(String(item.seatId))) {
        errors.push(`${prefix}: the same seat was selected more than once.`);
      } else {
        seatIds.add(String(item.seatId));
      }

      const passenger = item?.passenger;
      if (!passenger?.fullName || passenger.fullName.trim().length < 2) {
        errors.push(`${prefix}: full name must be at least 2 characters.`);
      }
      if (
        !passenger?.phone ||
        !/^\+?[0-9\s()-]{7,20}$/.test(passenger.phone.trim())
      ) {
        errors.push(`${prefix}: a valid phone number is required.`);
      }
      if (!passenger?.nationalId || passenger.nationalId.trim().length < 5) {
        errors.push(`${prefix}: a valid national ID is required.`);
      }
    });
  }

  if (paymentMethod !== "SIMULATED_ONLINE") {
    errors.push("Payment method must be SIMULATED_ONLINE.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }
  next();
};

export { validateCreateReservation, validateCheckout };
