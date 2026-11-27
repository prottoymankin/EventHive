import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/env";
import { pool } from "../config/db";
import { User } from "../modules/users/user.interface";

export const authenticateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  let token = req.headers.authorization;

  if (!token) {
    return sendResponse(res, 401, "Unauthorized", false);
  }

  if (token.startsWith("Bearer")) {
    token = token.split(" ")[1]
  }

  try {
    const decode = jwt.verify(token as string, config.jwt_secret) as JwtPayload

    const queryResult = await pool.query<User>(`
      SELECT * FROM users
      WHERE id = $1
    `, [decode.id]);

    const user = queryResult.rows[0];

    if (!user) {
      return sendResponse(res, 401, "Unauthorized", false);
    }

    req.user = {
      id: user.id,
      role: user.role
    };
  } catch (error: unknown) {
    if (error instanceof jwt.JsonWebTokenError) {
      return sendResponse(res, 401, error.message, false);
    }

    return sendResponse(res, 401, "Invalid or expired token", false);
  }

  next();
};