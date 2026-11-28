import { z } from "zod";

export const bookEventSchema = z.object({

  event_id: z
    .number()
    .gt(0, "Invalid event ID. Please provide a valid positive ID"),
    
  tickets_booked: z
    .number()
    .gt(0, "Please book at least 1 ticket")

}).strict();

export type BookEventPayload = z.infer<typeof bookEventSchema>;