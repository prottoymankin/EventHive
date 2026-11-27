import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  category: z.enum(['tech', 'music', 'workshop', 'others']),
  date: z.coerce.date(),
  location: z.string().min(1, "Location is required"),
  total_seats: z.number().gt(0, "Total seats must be grater than 0"),
  price: z.number().gte(0, "Price must be or grater than or equal 0")
});

export type CreateEventPayload = z.infer<typeof createEventSchema>;