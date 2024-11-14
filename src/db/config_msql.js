
import mysql from "mysql2/promise"
import ENVIROMENT from "../config/enviroment.config.js"


const database_pool = mysql.createPool({
    host: ENVIROMENT.MYSQL.HOST,
    user:ENVIROMENT.MYSQL.USERNAME,
    password:ENVIROMENT.MYSQL.PASSWORD,
    database:ENVIROMENT.MYSQL.DATABASE,
    connectionLimit: 10,

})

const checkConnection = async () =>{
    try{
        const connection = await database_pool.getConnection()
       
        
        console.log("Conexion Exitosa con MYSQL")
        connection.release
    }
    
    catch (error){
    console.log("Error al conectar con la base de datos")
}
}


checkConnection()




export default database_pool