"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { apiFetch } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import {
  clearSession,
  requireRole,
  requireSession,
} from "@/lib/auth/session";
import { z } from "zod";
import { busSchema, busUpdateSchema } from "@/features/buses/buses.schemas";
import { reservationPassengerSchema } from "@/features/reservations/reservations.schemas";
import {
  createTripSchema,
  scheduleSchema,
  tripSchema,
} from "@/features/trips/trips.schemas";
import { createUserSchema, updateUserSchema } from "@/features/users/users.schemas";
import { BUS_CONFIGS } from "@/features/buses/buses.constants";
import type { Trip } from "@/lib/domain/types";
import { getDateKey, isBeforeBusinessDate } from "@/lib/domain/dates";

const value = (formData: FormData, key: string): string => {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
};

class FormValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormValidationError";
  }
}

const required = (formData: FormData, key: string): string => {
  const entry = value(formData, key);
  if (!entry) throw new FormValidationError(`${key} is required.`);
  return entry;
};

const idFrom = (formData: FormData, key: string): string => {
  const id = required(formData, key);
  if (!/^[a-f\d]{24}$/i.test(id)) throw new FormValidationError("Invalid resource ID.");
  return id;
};

const numeric = (formData: FormData, key: string, minimum = 0): number => {
  const result = Number(required(formData, key));
  if (!Number.isFinite(result) || result < minimum) {
    throw new FormValidationError(`${key} must be a valid number.`);
  }
  return result;
};

const parseWithSchema = <T>(schema: z.ZodType<T>, input: unknown): T => {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new FormValidationError(
      parsed.error.issues[0]?.message || "Please check the submitted information.",
    );
  }
  return parsed.data;
};

const revalidateTripArchives = (): void => {
  revalidatePath("/trips");
  revalidatePath("/trips/archive/[date]", "page");
};

const revalidateReservationArchives = (): void => {
  revalidatePath("/reservations");
  revalidatePath("/reservations/archive/[date]", "page");
};

export type ResourceAction =
  | "create-trip"
  | "update-trip"
  | "cancel-trip"
  | "delete-trip"
  | "create-bus"
  | "update-bus"
  | "deactivate-bus"
  | "delete-bus"
  | "create-schedule"
  | "update-schedule"
  | "delete-schedule"
  | "create-reservation"
  | "cancel-reservation"
  | "create-user"
  | "update-user"
  | "delete-user";

export type ResourceActionState = { error?: string };

const requireDepartureTrip = async (id: string): Promise<Trip> => {
  const trip = await apiFetch<Trip>(apiEndpoints.trips.item(id));
  if (trip.schedule?.isRecurring) {
    throw new FormValidationError("Recurring schedule templates cannot be edited as departures.");
  }
  return trip;
};

const scheduleInput = (formData: FormData) => {
  const frequency = value(formData, "frequency");
  return parseWithSchema(scheduleSchema, {
    from: value(formData, "from"),
    to: value(formData, "to"),
    bus: value(formData, "bus"),
    departureTime: value(formData, "departureTime"),
    price: numeric(formData, "price"),
    frequency,
    startDate: value(formData, "startDate"),
    endDate: value(formData, "endDate"),
    daysOfWeek: formData
      .getAll("daysOfWeek")
      .filter((day): day is string => typeof day === "string")
      .map(Number),
    dayOfMonth:
      frequency === "MONTHLY" ? numeric(formData, "dayOfMonth", 1) : undefined,
  });
};

export const createTripAction = async (formData: FormData): Promise<void> => {
  await requireRole(["ADMIN"]);
  const trip = parseWithSchema(createTripSchema, {
    from: value(formData, "from"),
    to: value(formData, "to"),
    bus: value(formData, "bus"),
    departureDate: value(formData, "departureDate"),
    departureTime: value(formData, "departureTime"),
    price: numeric(formData, "price", 1),
  });
  if (isBeforeBusinessDate(trip.departureDate)) {
    throw new FormValidationError("Departure date cannot be before today.");
  }
  await apiFetch(apiEndpoints.trips.collection, { method: "POST", body: trip });
  revalidateTripArchives();
  redirect("/trips");
};

export const updateTripAction = async (formData: FormData): Promise<void> => {
  await requireRole(["ADMIN"]);
  const id = idFrom(formData, "id");
  const existingTrip = await requireDepartureTrip(id);
  const trip = parseWithSchema(tripSchema, {
    from: value(formData, "from"),
    to: value(formData, "to"),
    bus: value(formData, "bus"),
    departureDate: value(formData, "departureDate"),
    departureTime: value(formData, "departureTime"),
    price: numeric(formData, "price"),
  });
  if (
    isBeforeBusinessDate(trip.departureDate) &&
    getDateKey(existingTrip.departureDate) !== trip.departureDate
  ) {
    throw new FormValidationError("Departure date cannot be before today.");
  }
  await apiFetch(apiEndpoints.trips.item(id), { method: "PUT", body: trip });
  revalidateTripArchives();
  revalidateReservationArchives();
  revalidatePath(`/trips/${id}`);
  redirect(`/trips/${id}`);
};

export const cancelTripAction = async (formData: FormData): Promise<void> => {
  await requireRole(["ADMIN"]);
  const id = idFrom(formData, "id");
  await requireDepartureTrip(id);
  await apiFetch(apiEndpoints.trips.cancel(id), { method: "PATCH" });
  revalidateTripArchives();
  revalidatePath(`/trips/${id}`);
  redirect(`/trips/${id}`);
};

export const deleteTripAction = async (formData: FormData): Promise<void> => {
  await requireRole(["ADMIN"]);
  const id = idFrom(formData, "id");
  await requireDepartureTrip(id);
  await apiFetch(apiEndpoints.trips.item(id), { method: "DELETE" });
  revalidateTripArchives();
  revalidateReservationArchives();
  redirect("/trips");
};

export const createBusAction = async (formData: FormData): Promise<void> => {
  await requireRole(["ADMIN"]);
  const bus = parseWithSchema(busSchema, {
    busNumber: value(formData, "busNumber"),
    busClass: value(formData, "busClass"),
    size: value(formData, "size"),
  });
  const capacity = BUS_CONFIGS.find(
    (config) => config.busClass === bus.busClass && config.size === bus.size,
  )?.capacity;
  if (!capacity) throw new FormValidationError("Select a valid bus class and size.");
  await apiFetch(apiEndpoints.buses.collection, {
    method: "POST",
    // The existing backend requires this legacy field; fares are configured per trip.
    body: { ...bus, capacity, price: 0 },
  });
  revalidatePath("/buses");
  redirect("/buses");
};

export const updateBusAction = async (formData: FormData): Promise<void> => {
  await requireRole(["ADMIN"]);
  const id = idFrom(formData, "id");
  const bus = parseWithSchema(busUpdateSchema, {
    busNumber: value(formData, "busNumber"),
  });
  await apiFetch(apiEndpoints.buses.item(id), {
    method: "PUT",
    body: bus,
  });
  revalidatePath("/buses");
  revalidatePath(`/buses/${id}`);
  redirect(`/buses/${id}`);
};

export const deactivateBusAction = async (
  formData: FormData,
): Promise<void> => {
  await requireRole(["ADMIN"]);
  const id = idFrom(formData, "id");
  await apiFetch(apiEndpoints.buses.deactivate(id), { method: "PATCH" });
  revalidatePath("/buses");
  revalidatePath(`/buses/${id}`);
  redirect(`/buses/${id}`);
};

export const deleteBusAction = async (formData: FormData): Promise<void> => {
  await requireRole(["ADMIN"]);
  const id = idFrom(formData, "id");
  await apiFetch(apiEndpoints.buses.item(id), { method: "DELETE" });
  revalidatePath("/buses");
  redirect("/buses");
};

export const createScheduleAction = async (
  formData: FormData,
): Promise<void> => {
  await requireRole(["ADMIN"]);
  const schedule = scheduleInput(formData);
  const { endDate, ...scheduleBody } = schedule;
  await apiFetch(apiEndpoints.schedules.collection, {
    method: "POST",
    body: {
      ...scheduleBody,
      ...(endDate ? { endDate } : {}),
    },
  });
  revalidatePath("/schedules");
  revalidateTripArchives();
  redirect("/schedules");
};

export const updateScheduleAction = async (
  formData: FormData,
): Promise<void> => {
  await requireRole(["ADMIN"]);
  const id = idFrom(formData, "id");
  const schedule = scheduleInput(formData);
  const { endDate, ...scheduleBody } = schedule;
  await apiFetch(apiEndpoints.schedules.item(id), {
    method: "PUT",
    body: {
      ...scheduleBody,
      ...(endDate ? { endDate } : {}),
    },
  });
  revalidatePath("/schedules");
  revalidateTripArchives();
  revalidatePath(`/schedules/${id}`);
  redirect(`/schedules/${id}`);
};

export const deleteScheduleAction = async (
  formData: FormData,
): Promise<void> => {
  await requireRole(["ADMIN"]);
  const id = idFrom(formData, "id");
  await apiFetch(apiEndpoints.schedules.item(id), { method: "DELETE" });
  revalidatePath("/schedules");
  revalidateTripArchives();
  redirect("/schedules");
};

export const createReservationAction = async (
  formData: FormData,
): Promise<void> => {
  await requireSession();
  const tripId = idFrom(formData, "trip");
  const trip = await requireDepartureTrip(tripId);
  if (trip.status !== "SCHEDULED") {
    throw new FormValidationError("Reservations can only be made for scheduled trips.");
  }
  const submittedSeats = formData.getAll("seat");
  const seatIds = submittedSeats.filter(
    (seat): seat is string =>
      typeof seat === "string" && /^[a-f\d]{24}$/i.test(seat),
  );
  if (seatIds.length === 0 || seatIds.length !== submittedSeats.length) {
    throw new FormValidationError("Select at least one available seat.");
  }
  const reservations = seatIds.map((seatId) => {
    return {
      seatId,
      ...parseWithSchema(reservationPassengerSchema, {
        passengerName: value(formData, `passengerName-${seatId}`),
        passengerPhone: value(formData, `passengerPhone-${seatId}`),
      }),
    };
  });

  let booked = 0;
  let failed = 0;
  for (const { seatId, passengerName, passengerPhone } of reservations) {
    try {
      await apiFetch(apiEndpoints.reservations.collection, {
        method: "POST",
        body: { trip: tripId, seat: seatId, passengerName, passengerPhone },
      });
      booked++;
    } catch (error) {
      if (!(error instanceof ApiError) || error.status === 401) throw error;
      failed++;
    }
  }
  revalidateReservationArchives();
  revalidateTripArchives();
  revalidatePath(`/trips/${tripId}`);
  redirect(
    `/trips/${tripId}/book?booked=${booked}&failed=${failed}`,
  );
};

export const cancelReservationAction = async (
  formData: FormData,
): Promise<void> => {
  await requireSession();
  const id = idFrom(formData, "id");
  await apiFetch(apiEndpoints.reservations.cancel(id), { method: "PATCH" });
  revalidateReservationArchives();
  revalidatePath(`/reservations/${id}`);
  redirect(`/reservations/${id}`);
};

export const createUserAction = async (
  formData: FormData,
): Promise<void> => {
  await requireRole(["ADMIN"]);
  const user = parseWithSchema(createUserSchema, {
    name: value(formData, "name"),
    email: value(formData, "email"),
    password: value(formData, "password"),
    phone: value(formData, "phone"),
    role: value(formData, "role"),
  });
  await apiFetch(apiEndpoints.users.collection, {
    method: "POST",
    body: user,
  });
  revalidatePath("/users");
  redirect("/users");
};

export const updateUserAction = async (
  formData: FormData,
): Promise<void> => {
  await requireRole(["ADMIN"]);
  const id = idFrom(formData, "id");
  const password = value(formData, "password");
  const user = parseWithSchema(updateUserSchema, {
    name: value(formData, "name"),
    email: value(formData, "email"),
    phone: value(formData, "phone"),
    role: value(formData, "role"),
    isActive: value(formData, "isActive") === "true",
    password,
  });
  const { password: validatedPassword, ...userBody } = user;
  await apiFetch(apiEndpoints.users.item(id), {
    method: "PUT",
    body: {
      ...userBody,
      ...(validatedPassword ? { password: validatedPassword } : {}),
    },
  });
  revalidatePath("/users");
  revalidatePath(`/users/${id}`);
  redirect(`/users/${id}`);
};

export const deleteUserAction = async (
  formData: FormData,
): Promise<void> => {
  const currentUser = await requireRole(["ADMIN"]);
  const id = idFrom(formData, "id");
  if (currentUser._id === id) {
    throw new FormValidationError("You cannot delete your own account.");
  }
  await apiFetch(apiEndpoints.users.item(id), { method: "DELETE" });
  revalidatePath("/users");
  redirect("/users");
};

export const runResourceAction = async (
  action: ResourceAction,
  _previousState: ResourceActionState,
  formData: FormData,
): Promise<ResourceActionState> => {
  const actions: Record<ResourceAction, (data: FormData) => Promise<void>> = {
    "create-trip": createTripAction,
    "update-trip": updateTripAction,
    "cancel-trip": cancelTripAction,
    "delete-trip": deleteTripAction,
    "create-bus": createBusAction,
    "update-bus": updateBusAction,
    "deactivate-bus": deactivateBusAction,
    "delete-bus": deleteBusAction,
    "create-schedule": createScheduleAction,
    "update-schedule": updateScheduleAction,
    "delete-schedule": deleteScheduleAction,
    "create-reservation": createReservationAction,
    "cancel-reservation": cancelReservationAction,
    "create-user": createUserAction,
    "update-user": updateUserAction,
    "delete-user": deleteUserAction,
  };

  try {
    if (!Object.prototype.hasOwnProperty.call(actions, action)) {
      throw new FormValidationError("Unsupported form action.");
    }
    await actions[action](formData);
    return {};
  } catch (error) {
    if (error instanceof FormValidationError) {
      return { error: error.message };
    }
    if (error instanceof ApiError && error.status === 401) {
      await clearSession();
      redirect("/login?error=Your%20session%20has%20expired.%20Please%20sign%20in%20again.");
    }
    if (error instanceof ApiError && error.status < 500) {
      return { error: error.message };
    }
    throw error;
  }
};
