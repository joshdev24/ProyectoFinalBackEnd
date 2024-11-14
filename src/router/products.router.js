import express from 'express'

import { createProductController, deleteProductController, getAllProductController, getProductByIdController, updateProductController } from '../controllers/product.controller.js'
import { verifyApikeyMiddleware, verifyTokenMiddleware } from '../middleware/auth.middleware.js'

const productRouter = express.Router()


productRouter.get('/', verifyTokenMiddleware(), getAllProductController)
productRouter.get("/:product_id", verifyTokenMiddleware(), getProductByIdController)
productRouter.post('/', verifyTokenMiddleware(['seller', 'admin', 'user']), createProductController)
productRouter.put('/:product_id', verifyTokenMiddleware(['seller', 'admin', 'user']), updateProductController)
productRouter.delete('/:product_id', verifyTokenMiddleware(['seller', 'admin', 'user']), deleteProductController)

export default productRouter