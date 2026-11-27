import dotenv from "dotenv";
import path from "path";
import jwt from "jsonwebtoken";

dotenv.config({
  path: path.join(process.cwd(), ".env")
});

export const config = {
  port: process.env.PORT as string,
  database_url: process.env.DATABASE_URL as string,
  jwt_secret: process.env.JWT_SECRET as string,
};