const mysql = require("mysql2/promise");
const db = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  enableKeepAlive: true,
});

(async () => {
  try {
    const connection = await db.getConnection(); // Get a connection from the pool
    console.log("Database connected successfully!");
    // connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error("Error connecting to MySQL:", error.message);
  }
})();

module.exports = db;
