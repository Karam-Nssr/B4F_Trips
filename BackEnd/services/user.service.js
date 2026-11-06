import User from "../models/User.model.js";

const getAllUsers = async ({ page = 1, limit = 10, role, isActive }) => {
  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === "true";

  const skip = (page - 1) * limit;
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return {
    users,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      perPage: Number(limit),
    },
  };
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const createUser = async ({ name, email, password, phone, role }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const error = new Error("Email already registered.");
    error.statusCode = 409;
    throw error;
  }

  const allowedRoles = ["ADMIN", "EMPLOYEE", "USER"];
  const assignedRole = allowedRoles.includes(role) ? role : "USER";

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: assignedRole,
  });
  return user;
};

const updateUser = async (id, updates) => {
  const allowed = ["name", "email", "phone", "isActive", "role", "password"];
  const filtered = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) filtered[key] = updates[key];
  }

  const user = await User.findByIdAndUpdate(id, filtered, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export { getAllUsers, getUserById, createUser, updateUser, deleteUser };
