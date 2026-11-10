import { z } from "zod";

export const busSchema = z.object({
  busNumber: z.string().trim().min(1, "Bus number is required."),
  busClass: z.enum(["ORDINARY", "FIRST_CLASS", "BUSINESS"]),
  size: z.enum(["LARGE", "MEDIUM"]),
});

export const busUpdateSchema = z.object({
  busNumber: z.string().trim().min(1, "Bus number is required."),
});
