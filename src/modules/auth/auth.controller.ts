import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import { AppError } from "../../utils/AppError";
import { loginSchema, signupSchema } from "./auth.schema";

const signup = async (req: Request, res: Response) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
  
    if (!validationResult.success) {
      return sendResponse(
        res, 400,
        validationResult.error.issues[0]?.message || "Validation error",
        false
      );
    }
  
    const data = await authService.signup(validationResult.data);

    return sendResponse(
      res, 201, "User registered successfully", true, data
    );
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return sendResponse(res, error.statusCode, error.message, false);
    }

    return sendResponse(res, 500, "Internal server error", false);
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      return sendResponse(
        res, 400,
        validationResult.error.issues[0]?.message || "Validation error",
        false
      );
    }

    const { token, safeUser } = await authService.login(validationResult.data);

    return sendResponse(
      res, 200, "Login successful", true, 
      { token, user: safeUser }
    );
    
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return sendResponse(res, error.statusCode, error.message, false);
    }

    return sendResponse(res, 500, "Internal server error", false);
  }
}

export const authController = {
  signup,
  login
};