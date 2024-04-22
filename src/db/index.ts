import { Pool } from "pg";

const pool = new Pool({
  user: process.env.PSQL_USER,
  password: process.env.PSQL_PASSWORD,
  host: process.env.PSQL_HOST,
  port: parseInt(process.env.PSQL_PORT || "5432"),
  database: process.env.PSQL_DB,
});

export default pool;
