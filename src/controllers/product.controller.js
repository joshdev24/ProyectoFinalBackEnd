import ProductRepository from "../repositories/product.repository.js"
import ResponseBuilder from "../utils/builders/responseBuilder.js"


export const getAllProductController = async (req, res) => {
    try{

        const products_from_db = await ProductRepository.getProducts()
        console.log(products_from_db)

        const response = new ResponseBuilder()
        .setOk(true)
        .setStatus(200)
        .setMessage('Productos obtenidos')
        .setPayload({
            products: products_from_db
        })
        .build()
        return res.json(response)
    }
    catch(error){
        console.error(error)
    }
}


//recibo
/* 
params: id (el id del product)
*/

//Respondo
/* 
product (el producto encontrado)
*/

export const getProductByIdController = async (req, res) => {
    try{
        const {product_id} = req.params
        const product_found = await ProductRepository.getProductById(product_id)
        if(!product_found){
            const repsonse = new ResponseBuilder()
            .setOk(false)
            .setStatus(404)
            .setMessage('Product not found')
            .setPayload({
                detail:`El producto con id ${product_id} no existe`
            })
            .build()
            return res.status(404).json(repsonse)
        }
        const response = new ResponseBuilder()
        .setOk(true)
        .setStatus(200)
        .setMessage('Productos obtenidos')
        .setPayload({
            product: product_found
        })
        .build()
        return res.json(response)
    }
    catch(error){
        console.error(error.message)
    }
}



export const createProductController = async (req, res) => {
    try {

        const { title, price, stock, description, category, image } = req.body
        console.log(req.body)
        //ESTO ES CLAVE, el seller_id NO debe venir del body, debe venir en el req.user (que a su vez viene del token de login con los datos de la sesion del usuario)
        const seller_id = req.user.id
        if (!title) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Error de titulo')
                .setPayload({
                    detail: 'Titulo invalido o campo esta vacio'
                })
                .build()
            return res.status(400).json(response)
        }
        if (!price && price < 1) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Error de precio')
                .setPayload({
                    detail: 'Precio invalido o campo vacio, solo valor numerico permitido mayor a 0'
                })
                .build()
            return res.status(400).json(response)
        }
        if (!stock && isNaN(stock)) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Error de stock')
                .setPayload({
                    detail: 'stock invalido o campo vacio, solo valor numerico permitido'
                })
                .build()
            return res.status(400).json(response)
        }
        if (!description) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Error de descripcion')
                .setPayload({
                    detail: 'campo vacio, debe ingresar una descripcion'
                })
                .build()
            return res.status(400).json(response)
        }
        if (!category) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Error de categoria')
                .setPayload({
                    detail: 'cateogria invalida o campo vacio'
                })
                .build()
            return res.status(400).json(response)
        }


        if(image && Buffer.byteLength(image, 'base64') > 2 * 1024 * 1024){
            console.error('Imagen muy grande')
            return res.sendStatus(400)
        }
        const newProduct = {
            title,
            price,
            stock,
            descripcion: description,
            category,
            image_base_64: image,
            seller_id
        }
        const newProductSaved = await ProductRepository.createProduct(newProduct)
        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Producto Creado')
            .setPayload(
                {
                    data: {
                        title: newProductSaved.title,
                        price: newProductSaved.price,
                        stock: newProductSaved.stock,
                        descripcion: newProductSaved.descripcion,
                        category: newProductSaved.category,
                        id: newProductSaved._id
                    }
                }
            )
            .build()
        res.json(response)
    }
    catch (error) {
        console.log(error)
        const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(500)
            .setMessage('Internal Server Error')
            .setPayload({
                detail: error.message
            })
            .build()
        res.status(500).json(response)
    }
}
export const updateProductController = async (req, res) => {
    try {
        const { product_id } = req.params
        const { title, price, stock, descripcion, category } = req.body
        const seller_id = req.user.id
        if (!title) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Error de titulo')
                .setPayload({
                    detail: 'Titulo invalido o campo esta vacio'
                })
                .build()
            return res.status(400).json(response)
        }
        if (!price && price < 1) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Error de precio')
                .setPayload({
                    detail: 'Precio invalido o campo vacio, solo valor numerico permitido mayor a 0'
                })
                .build()
            return res.status(400).json(response)
        }
        if (!stock && isNaN(stock)) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Error de stock')
                .setPayload({
                    detail: 'stock invalido o campo vacio, solo valor numerico permitido'
                })
                .build()
            return res.status(400).json(response)
        }
        if (!descripcion) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Error de descripcion')
                .setPayload({
                    detail: 'campo vacio, debe ingresar una descripcion'
                })
                .build()
            return res.status(400).json(response)
        }
        if (!category) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Error de categoria')
                .setPayload({
                    detail: 'cateogria invalida o campo vacio'
                })
                .build()
            return res.status(400).json(response)
        }

        const product_found = await ProductRepository.getProductById(product_id)
        const newProduct = {
            title,
            price,
            stock,
            descripcion,
            category
        }

        if(seller_id !== product_found.seller_id.toString()){
            //Error de status 403
            return res.sendStatus(403)
        }
        const productoActualizado = await ProductRepository.updateProduct(product_id, newProduct)
        if (!productoActualizado) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(404)
                .setMessage('Error al actualizar producto')
                .setPayload({
                    detail: 'Producto no encontrado'
                })
                .build()
            return res.status(404).json(response)
        }
        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Producto actualizado con exito!')
            .setPayload(
                {
                    data: {
                        title: newProduct.title,
                        price: newProduct.price,
                        stock: newProduct.stock,
                        descripcion: newProduct.descripcion,
                        category: newProduct.category
                    }
                }
            )
            .build()
        res.json(response)
    }
    catch (error) {
        const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(500)
            .setMessage('Internal Server Error')
            .setPayload({
                detail: error.message
            })
            .build()
        res.status(500).json(response)
    }
}

export const deleteProductController = async (req, res) => {
    try {
        const { product_id } = req.params

        const product_found = await ProductRepository.getProductById(product_id)

        if(!product_found){
            return res.sendStatus(404)
        }

        //Si no sos el admin y tampoco sos el dueño entonces NO podes estar aca
        if(req.user.role !== 'admin' && req.user.id !== product_found.seller_id.toString()){
            return res.sendStatus(403)
        }
        const productoEliminado = await ProductRepository.deleteProduct(product_id)
        if (!productoEliminado) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(404)
                .setMessage('La solicitud fallo')
                .setPayload({
                    detail: 'No se pudo eliminar el producto, no se encontro el producto'
                })
                .build()
            return res.status(404).json(response)
        }
        const response = new ResponseBuilder()
        .setOk(true)
        .setStatus(200)
        .setMessage('Producto eliminado con exito!')
        .setPayload(
            {
                data: {
                    title: productoEliminado.title,
                }
            }
        )
        .build()
    res.json(response)
    }
    catch (error) {
        const response = new ResponseBuilder()
        .setOk(false)
        .setStatus(500)
        .setMessage('Internal Server Error')
        .setPayload({
            detail: error.message
        })
        .build()
    res.status(500).json(response)
    }
}

