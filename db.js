const { Pool } = require('pg');
require('dotenv').config();

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
    });

if (process.env.DATABASE_URL) {
  const { hostname, port } = new URL(process.env.DATABASE_URL);
  console.log(`DB: production mode — host=${hostname} port=${port}`);
} else {
  console.log(`DB: local mode — host=${process.env.DB_HOST} port=${process.env.DB_PORT}`);
}

pool.on('error', (err) => {
  console.error('Unexpected database error:', err.message, err.code);
});

module.exports = pool;