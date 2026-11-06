const validateRegister = (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters.");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("A valid email is required.");
  }
  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters.");
  }
  if (!phone || phone.trim().length < 7) {
    errors.push("A valid phone number is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("A valid email is required.");
  }
  if (!password) {
    errors.push("Password is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }
  next();
};

export { validateRegister, validateLogin };
