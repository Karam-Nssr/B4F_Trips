import Bus, { BUS_CAPACITY_MAP } from "../models/Bus.model.js";
import Seat from "../models/Seat.model.js";
import Trip from "../models/Trip.model.js";
import Reservation from "../models/Reservation.model.js";
import { generateSeatsForBus } from "./seat.service.js";

const getAllBuses = async ({
  page = 1,
  limit = 10,
  busClass,
  size,
  isActive,
}) => {
  const query = {};
  if (busClass) query.busClass = busClass;
  if (size) query.size = size;
  if (isActive !== undefined) query.isActive = isActive === "true";

  const skip = (page - 1) * limit;
  const total = await Bus.countDocuments(query);
  const buses = await Bus.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return {
    buses,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      perPage: Number(limit),
    },
  };
};

const getBusById = async (id) => {
  const bus = await Bus.findById(id);
  if (!bus) {
    const error = new Error("Bus not found.");
    error.statusCode = 404;
    throw error;
  }
  return bus;
};

const createBus = async ({ busNumber, busClass, size, capacity, price }) => {
  const expectedCapacity = BUS_CAPACITY_MAP[busClass]?.[size];
  if (expectedCapacity === undefined) {
    const error = new Error("Invalid bus class or size combination.");
    error.statusCode = 400;
    throw error;
  }
  if (Number(capacity) !== expectedCapacity) {
    const error = new Error(
      `Capacity for ${busClass} ${size} bus must be ${expectedCapacity}.`,
    );
    error.statusCode = 400;
    throw error;
  }

  const bus = await Bus.create({
    busNumber,
    busClass,
    size,
    capacity: expectedCapacity,
    price,
  });
  await generateSeatsForBus(bus._id);
  return bus;
};

const updateBus = async (id, updates) => {
  const bus = await Bus.findById(id);
  if (!bus) {
    const error = new Error("Bus not found.");
    error.statusCode = 404;
    throw error;
  }

  if (updates.busClass || updates.size) {
    const newClass = updates.busClass || bus.busClass;
    const newSize = updates.size || bus.size;
    if (newClass !== bus.busClass || newSize !== bus.size) {
      const trips = await Trip.find({ bus: id, status: "SCHEDULED" });
      if (trips.length > 0) {
        const tripIds = trips.map((t) => t._id);
        const hasReservations = await Reservation.exists({
          trip: { $in: tripIds },
          status: "CONFIRMED",
        });
        if (hasReservations) {
          const error = new Error(
            "Cannot change bus class or size while it has active reservations on scheduled trips.",
          );
          error.statusCode = 409;
          throw error;
        }
        const expectedCapacity = BUS_CAPACITY_MAP[newClass]?.[newSize];
        if (!expectedCapacity) {
          const error = new Error("Invalid bus class or size combination.");
          error.statusCode = 400;
          throw error;
        }
        updates.capacity = expectedCapacity;
        await Seat.deleteMany({ bus: id });
        await Bus.findByIdAndUpdate(id, updates);
        await generateSeatsForBus(id);
        return await Bus.findById(id);
      }
    }
  }

  const updated = await Bus.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  return updated;
};

const deleteBus = async (id) => {
  const bus = await Bus.findById(id);
  if (!bus) {
    const error = new Error("Bus not found.");
    error.statusCode = 404;
    throw error;
  }

  const tripExists = await Trip.exists({ bus: id });
  if (tripExists) {
    const error = new Error(
      "Cannot delete bus. It has existing trips. Remove all trips first.",
    );
    error.statusCode = 409;
    throw error;
  }

  await Seat.deleteMany({ bus: id });
  await Bus.findByIdAndDelete(id);
  return bus;
};

const deactivateBus = async (id) => {
  const bus = await Bus.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );
  if (!bus) {
    const error = new Error("Bus not found.");
    error.statusCode = 404;
    throw error;
  }
  return bus;
};

export {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  deactivateBus,
};
