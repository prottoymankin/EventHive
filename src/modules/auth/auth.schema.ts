import z from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(3, "Name must be 3 characters long"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be 6 characters long"),
  role: z.enum(["attendee", "organizer"], "Role must be either attendee or organizer")
});

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be 6 characters long")
});

export type SignupPayload = z.infer<typeof signupSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;