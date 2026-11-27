import { pool } from "../../config/db";
import { CreateEventPayload } from "./event.schema";
import { Request } from "express";
import { Event } from './event.interface';
import { AppError } from "../../utils/AppError";

const createEvent = async (req: Request, payload: CreateEventPayload) => {
  const { title, description, category, date, location, total_seats, price } = payload;

  const queryResult = await pool.query<Event>(`
    INSERT INTO events (title, description, category, date, location, total_seats, available_seats, price, organizer_id)
    VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8)
    RETURNING *
  `, [title, description, category, date, location, total_seats, price, req.user?.id]);

  const event = queryResult.rows[0];

  if (!event) {
    throw new AppError (500, "Failed to create event");
  }

  return event;
};

export const eventService = {
  createEvent
};