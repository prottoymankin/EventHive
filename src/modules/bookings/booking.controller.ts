import { Request, Response } from 'express';
import { sendResponse } from '../../utils/sendResponse';
import { AppError } from '../../utils/AppError';
import { bookEventSchema } from './booking.schema';
import { bookingService } from './booking.service';

const bookEvent = async (req: Request, res: Response) => {
  try {
    const validationResult = bookEventSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendResponse(
        res, 400,
        validationResult.error.issues[0]?.message || "Validation error",
        false
      );
    }

    const data = await bookingService.bookEvent(validationResult.data, req.user!.id);

    sendResponse(res, 201, "Tickets booked successfully", true, data);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return sendResponse(res, error.statusCode, error.message, false);
    }

    return sendResponse(res, 500, "Internal server error", false);
  }
};

export const bookingController = {
  bookEvent
};