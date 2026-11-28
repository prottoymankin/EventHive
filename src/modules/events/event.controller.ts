import { Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { sendResponse } from '../../utils/sendResponse';
import { createEventSchema, updateEventSchema } from './event.schema';
import { eventService } from './event.service';

const createEvent = async (req: Request, res: Response) => {
  try {
    const validationResult = createEventSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendResponse(
        res, 400,
        validationResult.error.issues[0]?.message || "Validation error",
        false
      );
    }

    const data = await eventService.createEvent(req, validationResult.data); 
    
    return sendResponse(res, 201, "Event created successfully", true, data);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return sendResponse(res, error.statusCode, error.message, false);
    }

    return sendResponse(res, 500, "Internal server error", false);
  }
};

const getAllEvents = async (req: Request, res: Response) => {
  try {
    const data = await eventService.getAllEvents();

    return sendResponse(res, 200, "Events retrieved successfully", true, data);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return sendResponse(res, error.statusCode, error.message, false);
    }

    return sendResponse(res, 500, "Internal server error", false);
  }
};

const getEventById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
  
    if (!Number.isInteger(id) || id <= 0) {
      return sendResponse(res, 400, "Invalid event id", false);
    }
  
    const data = await eventService.getEventById(id);

    return sendResponse(res, 200, "Event retrieved successfully", true, data);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return sendResponse(res, error.statusCode, error.message, false);
    }

    return sendResponse(res, 500, "Internal server error", false);
  }
};

const updateEvent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
  
    if (!Number.isInteger(id) || id <= 0) {
      return sendResponse(res, 400, "Invalid event id", false);
    }

    if(Object.keys(req.body).length === 0) {
      return sendResponse(res, 400, "At least one field is required", false);
    }

    const validationResult = updateEventSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendResponse(
        res, 400,
        validationResult.error.issues[0]?.message || "Validation error",
        false
      );
    }

    const data = await eventService.updateEvent(id, validationResult.data, req.user!.id);

    return sendResponse(res, 200, "Event updated successfully", true, data);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return sendResponse(res, error.statusCode, error.message, false);
    }

    return sendResponse(res, 500, "Internal server error", false);
  }
};

const deleteEvent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
  
    if (!Number.isInteger(id) || id <= 0) {
      return sendResponse(res, 400, "Invalid event id", false);
    }

    await eventService.deleteEvent(id, req.user!.id);

    return sendResponse(res, 200, "Event deleted successfully", true);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return sendResponse(res, error.statusCode, error.message, false);
    }

    return sendResponse(res, 500, "Internal server error", false);
  }
}

export const eventController = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
};