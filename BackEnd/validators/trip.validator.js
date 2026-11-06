const validateCreateBus = (req, res, next) => {
  const { busNumber, busClass, size, capacity, price } = req.body;
  const errors = [];

  if (!busNumber || busNumber.trim().length < 1)
    errors.push("Bus number is required.");
  if (!["ORDINARY", "FIRST_CLASS", "BUSINESS"].includes(busClass))
    errors.push("Bus class must be ORDINARY, FIRST_CLASS, or BUSINESS.");
  if (!["LARGE", "MEDIUM"].includes(size))
    errors.push("Bus size must be LARGE or MEDIUM.");
  if (capacity === undefined || isNaN(capacity) || capacity < 1)
    errors.push("Valid capacity is required.");
  if (price === undefined || isNaN(price) || price < 0)
    errors.push("Valid bus price is required.");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }
  next();
};

const validateCreateTrip = (req, res, next) => {
  const { from, to, bus, departureDate, departureTime, price } = req.body;
  const errors = [];

  if (!from || from.trim().length < 1)
    errors.push("Source city (from) is required.");
  if (!to || to.trim().length < 1)
    errors.push("Destination city (to) is required.");
  if (from && to && from.trim().toLowerCase() === to.trim().toLowerCase())
    errors.push("Source and destination cities must be different.");
  if (!bus) errors.push("Bus ID is required.");
  if (!departureDate || isNaN(Date.parse(departureDate)))
    errors.push("Valid departure date is required.");
  if (!departureTime || !/^\d{2}:\d{2}$/.test(departureTime))
    errors.push("Departure time must be in HH:MM format.");
  if (price === undefined || isNaN(price) || price < 0)
    errors.push("Valid ticket price is required.");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }
  next();
};

const validateCreateSchedule = (req, res, next) => {
  const { from, to, bus, departureTime, price, frequency, startDate } =
    req.body;
  const errors = [];

  if (!from || from.trim().length < 1)
    errors.push("Source city (from) is required.");
  if (!to || to.trim().length < 1)
    errors.push("Destination city (to) is required.");
  if (from && to && from.trim().toLowerCase() === to.trim().toLowerCase())
    errors.push("Source and destination cities must be different.");
  if (!bus) errors.push("Bus ID is required.");
  if (!departureTime || !/^\d{2}:\d{2}$/.test(departureTime))
    errors.push("Departure time must be in HH:MM format.");
  if (price === undefined || isNaN(price) || price < 0)
    errors.push("Valid ticket price is required.");
  if (!["DAILY", "WEEKLY", "MONTHLY"].includes(frequency))
    errors.push("Frequency must be DAILY, WEEKLY, or MONTHLY.");
  if (!startDate || isNaN(Date.parse(startDate)))
    errors.push("Valid start date is required.");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }
  next();
};

export { validateCreateBus, validateCreateTrip, validateCreateSchedule };
