import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse";

export const authorizationMiddleware = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user ) {
      return sendResponse(res, 403, "Forbidden", false);
    }

    if (!roles.includes(req.user.role)) {
      return sendResponse(res, 403, "Forbidden", false);
    }

    next();
  }
};