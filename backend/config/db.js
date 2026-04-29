const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT) || 3306,
  user: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ DB Connection Failed:', err.message);
  } else {
    console.log('✅ DB Connected Successfully');
    connection.release();
  }
});

module.exports = pool.promise();