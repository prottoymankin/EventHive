import { pool } from "../../config/db";
import { AppError } from "../../utils/AppError";
import { BookEventPayload } from "./booking.schema";
import { Event } from '../events/event.interface';

const bookEvent = async (payload: BookEventPayload, user_id: number) => {
  const { event_id, tickets_booked } = payload;

  const event_query_result = await pool.query<Event>(`
    SELECT * FROM events
    WHERE id = $1
  `, [event_id]);

  const event = event_query_result.rows[0];

  if (!event) {
    throw new AppError(404, "Event not found");
  }

  const is_booking_closed = Date.now() > new Date(event.date).getTime();

  if (is_booking_closed) {
    throw new AppError(400, "Booking is closed. The booking deadline for this event has passed.");
  }

  if (event.organizer_id === user_id) {
    throw new AppError(403, "You cannot book your own event.")
  }

  if (event.available_seats < payload.tickets_booked) {
    throw new AppError(400, `Not enough tickets available to complete your booking.`);
  }

  const total_price = tickets_booked * Number(event.price);

  await pool.query<Event>(`
    UPDATE events
    SET available_seats = available_seats - $1
    WHERE id = $2
  `, [tickets_booked, payload.event_id]);

  const booking_query_result = await pool.query(`
    INSERT INTO bookings (event_id, attendee_id, tickets_booked, total_price)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [event_id, user_id, tickets_booked, total_price]);

  return booking_query_result.rows[0];
};

export const bookingService = {
  bookEvent
};