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

app.use(cors({
  origin: 'https://proyecto-final-front-end-opal.vercel.app'
  ,
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization', "x-api-key"], // Specify allowed headers
  credentials: true // If you need to send cookies or authorization headers
}));

const app = express();
const PORT = ENVIROMENT.PORT || 3000

app.use(express.json({limit: '5mb'}))



app.use('/api/status', statusRouter)
app.use('/api/auth', authRouter)
app.use('/api/products', productRouter)
app.use(verifyApikeyMiddleware)


ProductRepository.getProducts()


app.listen(PORT, () => {
    console.log(`El servidor se esta escuchando en http://localhost:${PORT}`)
})