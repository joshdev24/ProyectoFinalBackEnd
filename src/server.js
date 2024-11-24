import ENVIROMENT from "./config/enviroment.config.js";
import express from "express";
import mongoose from './db/config.js'
import cors from 'cors'
import productRouter from "./router/products.router.js";
import authRouter from "./router/auth.router.js";
import statusRouter from "./router/status.router.js";
import { verifyApikeyMiddleware } from "./middleware/auth.middleware.js";
import database_pool from "./db/config_msql.js";
import ProductRepository from "./repositories/product.repository.js";


const app = express();
const PORT = ENVIROMENT.PORT

app.use(cors({
    origin: 'https://proyecto-final-front-end-opal.vercel.app/register', // Replace with your frontend's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    credentials: true // If you need to send cookies or authentication headers
  }));
app.use(verifyApikeyMiddleware)


app.use('/api/status', statusRouter)
app.use('/api/auth', authRouter)
app.use('/api/products', productRouter)




app.listen(PORT, () => {
    console.log(`El servidor se esta escuchando en http://localhost:${PORT}`)
})