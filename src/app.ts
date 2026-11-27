import express, { Request, Response } from "express";
import { authRoutes } from "./modules/auth/auth.route";

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is successfully running"
  });
});

export default app;