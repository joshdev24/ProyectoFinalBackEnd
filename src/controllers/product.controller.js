import ProductRepository from "../repositories/product.repository.js"
import ResponseBuilder from "../utils/builders/responseBuilder.js"


export const getAllProductController = async (req, res) => {
    try{
        const products = await ProductRepository.getProducts()
        console.log(products)

        const response = new ResponseBuilder()
        .setOk(true)
        .setStatus(200)
        .setMessage('Productos obtenidos')
        .setPayload({
            products: products
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
            const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(404)
            .setMessage('Product not found')
            .setPayload({
                detail:`El producto con id ${product_id} no existe`
            })
            .build()
            return res.status(404).json(response)
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
            description,
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
                        description: newProductSaved.description,
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
        const { title, price, stock, description, category } = req.body
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

        const product_found = await ProductRepository.getProductById(product_id)
        const newProduct = {
            title,
            price,
            stock,
            description,
            category
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
                        descripcion: newProduct.description ,
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

        if (!product_found) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(404)
                .setMessage('No se encontro el producto')
                .setPayload({
                    detail: 'El producto no existe'
                })
                .build();
            return res.status(404).json(response);
        }

        if (req.user.role !== "admin" && req.user.id !== product_found.seller_id.toString()) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('No esta autorizado para eliminar el producto')
                .setPayload({
                    detail: 'Se requiere las credenciales necesarias'
                })
                .build();
            return res.status(400).json(response);
        }

        const deletedProduct = await ProductRepository.deleteProduct(product_id)


        if (!deletedProduct) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(404)
                .setMessage('No se pudo eliminar el producto')
                .setPayload({
                    detail: 'Producto no encontrado'
                })
                .build();
            return res.status(404).json(response);

        }

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Se elimino el producto')
            .setPayload({
                detail: "Poducto eliminado con exito"
            })
            .build();
        return res.status(200).json(response);

    }
    catch (error) {
        console.log(error);
        const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('Internal Server Error')
            .setPayload({
                detail: error.message
            })
            .build();
        return res.status(400).json(response);
    }
}

