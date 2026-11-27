import { pool } from "../../config/db";
import { AppError } from "../../utils/AppError";
import { SignupPayload } from "./auth.schema";
import bcrypt from "bcryptjs";

const signup = async (payload: SignupPayload) => {
  const { name, email, password, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10);

  const queryResult = await pool.query(`
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,[name, email, hashPassword, role]);

  const user = queryResult.rows[0];

  if (!user) {
    throw new AppError (500, "Failed to create user");
  }

  const { password: _, ...safeUser } = user;
  
  return safeUser;
};

export const authService = {
  signup
};