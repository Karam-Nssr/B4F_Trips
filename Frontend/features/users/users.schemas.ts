import { z } from "zod";

const phone = z.string().trim().min(7, "Enter a valid phone number.");

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  phone,
  role: z.enum(["ADMIN", "EMPLOYEE"]),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  phone,
  role: z.enum(["ADMIN", "EMPLOYEE"]),
  isActive: z.boolean(),
  password: z.union([z.string().min(6, "Password must be at least 6 characters."), z.literal("")]),
});
