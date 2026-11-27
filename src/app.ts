import express, { Request, Response } from "express";
import { authRoutes } from "./modules/auth/auth.route";
import { eventRoutes } from "./modules/events/event.route";

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events", eventRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is successfully running"
  });
});

export default app;