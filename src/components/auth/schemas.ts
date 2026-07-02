import { z } from "zod";

/** Shared email rule — distinguishes an empty field from a malformed address. */
const email = z.string().min(1, "Email is required").pipe(z.email("Enter a valid email"));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email,
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type SignupValues = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email,
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
