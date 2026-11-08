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

export { validateCreateReservation };

const validateCheckout = (req, res, next) => {
  const { tripId, seatId, fullName, phone, nationalId, paymentMethod } =
    req.body;
  const errors = [];

  if (!tripId) errors.push("Trip ID is required.");
  if (!seatId) errors.push("Seat ID is required.");
  if (!fullName || fullName.trim().length < 2)
    errors.push("Passenger name must be at least 2 characters.");
  if (!phone || !/^\+?[0-9\s()-]{7,20}$/.test(phone.trim()))
    errors.push("A valid passenger phone number is required.");
  if (!nationalId || nationalId.trim().length < 5)
    errors.push("A valid national ID is required.");
  if (paymentMethod !== "SIMULATED_ONLINE")
    errors.push("Payment method must be SIMULATED_ONLINE.");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }
  next();
};

export { validateCheckout };
