import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",       // change if needed
  password: "",       // change if needed
  database: "fundeases_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
