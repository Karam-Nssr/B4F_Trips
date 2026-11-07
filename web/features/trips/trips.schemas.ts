import { z } from "zod";
import { isValidDateOnly } from "@/lib/domain/dates";

const resourceId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid resource ID.");
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
  .refine(isValidDateOnly, "Enter a valid date.");
const departureTime = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Enter a valid 24-hour time.");

export const tripSchema = z
  .object({
    from: z.string().trim().min(1, "Source city is required."),
    to: z.string().trim().min(1, "Destination city is required."),
    bus: resourceId,
    departureDate: date,
    departureTime,
    price: z.number().finite().min(0, "Fare per seat cannot be negative."),
  })
  .refine((trip) => trip.from.toLowerCase() !== trip.to.toLowerCase(), {
    message: "Source and destination cities must differ.",
    path: ["to"],
  });

export const createTripSchema = tripSchema.safeExtend({
  price: z
    .number()
    .finite()
    .positive("Fare per seat must be greater than zero."),
});

export const scheduleSchema = z
  .object({
    from: z.string().trim().min(1, "Source city is required."),
    to: z.string().trim().min(1, "Destination city is required."),
    bus: resourceId,
    departureTime,
    price: z.number().finite().min(0, "Fare per seat cannot be negative."),
    frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
    startDate: date,
    endDate: z.union([date, z.literal("")]),
    daysOfWeek: z.array(z.number().int().min(0).max(6)),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
  })
  .refine(
    (schedule) => schedule.from.toLowerCase() !== schedule.to.toLowerCase(),
    {
      message: "Source and destination cities must differ.",
      path: ["to"],
    },
  )
  .refine(
    (schedule) =>
      schedule.frequency !== "WEEKLY" || schedule.daysOfWeek.length > 0,
    {
      message: "Select at least one weekday for a weekly schedule.",
      path: ["daysOfWeek"],
    },
  )
  .refine(
    (schedule) =>
      schedule.frequency !== "MONTHLY" || schedule.dayOfMonth !== undefined,
    {
      message: "Select a day of the month.",
      path: ["dayOfMonth"],
    },
  );
