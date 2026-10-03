const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const isProduction =
  process.env.NODE_ENV === "production";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // Render PostgreSQL requires SSL for external/managed connections.
  ...(isProduction
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {}),
});

pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

pool.on("error", (error) => {
  console.error(
    "PostgreSQL pool error:",
    error
  );
});

module.exports = pool;