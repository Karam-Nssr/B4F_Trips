import * as authService from "../services/auth.service.js";

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const { user, token } = await authService.register({
      name,
      email,
      password,
      phone,
    });
    res
      .status(201)
      .json({
        success: true,
        message: "Registration successful.",
        data: { user, token },
      });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });
    res
      .status(200)
      .json({
        success: true,
        message: "Login successful.",
        data: { user, token },
      });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    res
      .status(200)
      .json({
        success: true,
        message: "Profile retrieved successfully.",
        data: { user },
      });
  } catch (error) {
    next(error);
  }
};

export { register, login, getMe };
