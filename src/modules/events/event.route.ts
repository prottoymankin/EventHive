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

export const eventRoutes = router;