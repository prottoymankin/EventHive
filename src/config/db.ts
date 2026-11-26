import { Pool } from "pg";
import { config } from "./env";

const pool = new Pool({
  connectionString: config.database_url
});

export const connectDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(30) NOT NULL 
        DEFAULT 'attendee' 
        CHECK (role IN ('attendee', 'organizer')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL
        CHECK (category IN ('tech', 'music', 'workshop', 'others')),
        date TIMESTAMP NOT NULL,
        location VARCHAR(255) NOT NULL,
        total_seats INT NOT NULL
        CHECK (total_seats > 0),
        available_seats INT NOT NULL
        CHECK (available_seats >= 0 AND available_seats <= total_seats),
        price NUMERIC(10, 2) NOT NULL
        CHECK (price >= 0),
        organizer_id INT NOT NULL
        REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        event_id INT NOT NULL
        REFERENCES events(id),
        attendee_id INT NOT NULL
        REFERENCES users(id),
        tickets_booked INT NOT NULL
        CHECK (tickets_booked > 0),
        total_price NUMERIC(10, 2) DEFAULT 0,
        status VARCHAR(50)
        DEFAULT 'confirmed'
        CHECK (status IN ('confirmed', 'cancelled')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Database connected successfully");
  } catch (error) {
    console.log(`Database connection error: ${error}`);
  }
};