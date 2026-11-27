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

router.get("/", eventController.getAllEvents);

router.get("/:id",
  eventController.getEventById
);

export const eventRoutes = router;