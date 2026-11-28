import { pool } from "../../config/db";
import { config } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { LoginPayload, SignupPayload } from "./auth.schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const signup = async (payload: SignupPayload) => {
  const { name, email, password, role } = payload;

  const existingUser = await pool.query(`
    SELECT * FROM users
    WHERE email = $1
  `, [email]);

  if (existingUser.rowCount !== 0) {
    throw new AppError(409, "User is already exists with this email");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const queryResult = await pool.query(`
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,[name, email, hashPassword, role ?? "attendee"]);

  const user = queryResult.rows[0];

  if (!user) {
    throw new AppError (500, "Failed to create user");
  }

  const { password: _, ...safeUser } = user;
  
  return safeUser;
};

const login = async (payload: LoginPayload) => {
  const { email, password } = payload;

  const queryResult = await pool.query(`
    SELECT * FROM users
    WHERE email = $1
  `, [email]);

  const user = queryResult.rows[0];

  if (!user) {
    throw new AppError (401, "Invalid email or password");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError (401, "Invalid email or password");
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    config.jwt_secret,
    { expiresIn: "7d" }
  );

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  return { token, safeUser };
};

export const authService = {
  signup,
  login
};