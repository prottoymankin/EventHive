import { pool } from "../../config/db";
import { CreateEventPayload, UpdateEventPayload } from "./event.schema";
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

const getAllEvents = async () => {
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
};

const updateEvent = async (id: number, payload: UpdateEventPayload, user_id: number) => {
  const eventQueryResult = await pool.query<Event>(`
    SELECT * FROM events
    WHERE id = $1
  `, [id]);

  const event = eventQueryResult.rows[0];

  if (!event) {
    throw new AppError(404, "Event not found");
  }

  if (event.organizer_id !== user_id) {
    throw new AppError(403, "Forbidden");
  }

  const { title, description, category, date, location, price, total_seats } = payload;

  let new_available_seats: number | undefined;

  if (total_seats !== undefined) {
    const booked_seats = event.total_seats - event.available_seats;

    if (booked_seats > total_seats) {
      throw new AppError(400, `You cannot set total seats to ${total_seats}. Already ${booked_seats} seats have been booked.`)
    }

    new_available_seats = total_seats - booked_seats;
  }

  const updateEventQueryResult = await pool.query<Event>(`
    UPDATE events
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      category = COALESCE($3, category),
      date = COALESCE($4, date),
      location = COALESCE($5, location),
      total_seats = COALESCE($6, total_seats),
      price = COALESCE($7, price),
      available_seats = COALESCE($8, available_seats),
      updated_at = NOW()
    WHERE id = $9
    RETURNING *
  `, [title ?? null, description ?? null, category ?? null, date ?? null, location ?? null, total_seats ?? null, price ?? null, new_available_seats ?? null, id]);

  const updatedEvent = updateEventQueryResult.rows[0];

  return updatedEvent;
};

const deleteEvent = async (id: number, user_id: number) => {
  const eventQueryResult = await pool.query<Event>(`
    SELECT * FROM events
    WHERE id = $1
  `, [id]);

  const event = eventQueryResult.rows[0];

  if (!event) {
    throw new AppError(404, "Event not found");
  }

  if (event.organizer_id !== user_id) {
    throw new AppError(403, "Forbidden");
  }

  if (event.available_seats < event.total_seats) {
    throw new AppError(400, "Cannot delete this event because seats have already been booked.");
  }

  const deleteEventQueryResult = await pool.query(`
    DELETE FROM events
    WHERE id = $1
  `, [id]);

  if (deleteEventQueryResult.rowCount === 0) {
    throw new AppError(400, "Failed to delete event");
  }
};

export const eventService = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
};