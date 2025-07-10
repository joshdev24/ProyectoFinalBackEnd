import mysql from "mysql2/promise";
import ENVIROMENT from "../config/enviroment.config.js";

const database_pool = mysql.createPool({
  host: ENVIROMENT.MYSQL.HOST,
  user: ENVIROMENT.MYSQL.USERNAME,
  password: ENVIROMENT.MYSQL.PASSWORD,
  database: ENVIROMENT.MYSQL.DATABASE,
  connectionLimit: 200,
});

const checkConnection = async () => {
  try {
    const connection = await database_pool.getConnection();
    console.log("✅ Conexión exitosa con MySQL");
    connection.release(); // CORREGIDO: método ejecutado correctamente
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error.message);
  }
};

checkConnection();

export default database_pool;
