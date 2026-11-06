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
