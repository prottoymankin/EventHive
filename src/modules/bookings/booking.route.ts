import { Router } from "express";
import { authenticateMiddleware } from "../../middlewares/authenticate.middleware";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware";
import { bookingController } from "./booking.controller";

const router = Router();

router.post(
  "/",
  authenticateMiddleware,
  authorizationMiddleware("attendee", "organizer"),
  bookingController.bookEvent
);

export const bookingRoutes = router;