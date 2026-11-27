import { Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { sendResponse } from '../../utils/sendResponse';
import { createEventSchema } from './event.schema';
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
    
    sendResponse(res, 201, "Event created successfully", true, data);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return sendResponse(res, error.statusCode, error.message, false);
    }

    return sendResponse(res, 500, "Internal server error", false);
  }
};

export const eventController = {
  createEvent
};