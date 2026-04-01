const mysql = require('mysql2/promise');
require('dotenv').config();

// Standard connection URI format for Railway/Cloud DBs:
// mysql://USER:PASSWORD@HOST:PORT/DATABASE
const dbUrl = process.env.DATABASE_URL;

let pool;

if (dbUrl) {
  console.log('Using DATABASE_URL for MySQL connection.');
  pool = mysql.createPool(dbUrl);
} else {
  // Fallback to local config if no URL is provided
  console.log('No DATABASE_URL found. Falling back to local configuration.');
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'amrutha_sarees',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

module.exports = pool;
