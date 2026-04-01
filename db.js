const mysql = require('mysql2/promise');
require('dotenv').config();

// 1. Prioritize connection URLs (Vercel/Railway default)
const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

let pool;

if (dbUrl) {
  console.log('Using connection URL for MySQL.');
  pool = mysql.createPool(dbUrl);
} else {
  // 2. Fallback to individual fields
  console.log('Falling back to individual configuration fields.');
  pool = mysql.createPool({
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

module.exports = pool;
