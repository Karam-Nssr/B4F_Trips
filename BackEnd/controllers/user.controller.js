import * as userService from "../services/user.service.js";

const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, role, isActive } = req.query;
    const result = await userService.getAllUsers({
      page,
      limit,
      role,
      isActive,
    });
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully.",
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    if (
      req.user.role !== "ADMIN" &&
      req.user._id.toString() !== req.params.id
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
      success: true,
      message: "User retrieved successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const user = await userService.createUser({
      name,
      email,
      password,
      phone,
      role,
    });
    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export { getAllUsers, getUserById, createUser, updateUser, deleteUser };
