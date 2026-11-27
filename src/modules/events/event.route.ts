import { Router } from "express";
import { eventController } from "./event.controller";
import { authenticateMiddleware } from "../../middlewares/authenticate.middleware";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware";

const router = Router();

router.post(
  "/", 
  authenticateMiddleware,
  authorizationMiddleware("organizer"), 
  eventController.createEvent
);

router.get(
  "/",
  authenticateMiddleware,
  authorizationMiddleware("organizer"),
  eventController.getAllEvents
);

export const eventRoutes = router;