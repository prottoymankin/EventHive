import { pool } from "../../config/db";
import { CreateEventPayload } from "./event.schema";
import { Request } from "express";
import { Event } from './event.interface';
import { AppError } from "../../utils/AppError";
import { User } from "../users/user.interface";
import { email } from "zod";

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

const getAllEvents = async (req: Request) => {
  const queryResult = await pool.query<Event>(`
    SELECT * FROM events
    ORDER BY created_at DESC
  `);

  return queryResult.rows;
};

const getEventById = async (id: number) => {
  const eventQueryResult = await pool.query<Event>(`
    SELECT * FROM events
    WHERE id = $1
  `, [id]);

  const event = eventQueryResult.rows[0];

  if (!event) {
    throw new AppError(404, "Event not found");
  }

  const userQueryResult = await pool.query<User>(`
    SELECT * FROM users
    WHERE id = $1
  `, [event.organizer_id]);

  const user = userQueryResult.rows[0] as User;

  return {
    ...event,
    organizer: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
}

export const eventService = {
  createEvent,
  getAllEvents,
  getEventById
};