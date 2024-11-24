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
const PORT = 3000

app.use(cors({ origin: 'https://proyecto-final-front-end-opal.vercel.app' }));
app.use(express.json({limit: '5mb'}))
app.use(verifyApikeyMiddleware)


app.use('/api/status', statusRouter)
app.use('/api/auth', authRouter)
app.use('/api/products', productRouter)





app.listen(PORT, () => {
    console.log(`El servidor se esta escuchando en http://localhost:${PORT}`)
})