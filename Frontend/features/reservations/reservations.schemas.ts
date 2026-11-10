import { z } from "zod";

export const reservationPassengerSchema = z.object({
  passengerName: z.string().trim().min(2, "Passenger name must be at least 2 characters."),
  passengerPhone: z.string().trim().min(7, "Passenger phone must be at least 7 characters."),
});
