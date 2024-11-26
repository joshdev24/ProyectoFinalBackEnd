import database_pool from "../db/config_msql.js";
import Product from "../models/product.model.js";

class ProductRepository{
    static async getProducts(){
        //Obtener lista productos activos
        return Product.find({active: true})
    }

    static async getProductById(id){
        try {
            const { id } = req.params;
    
            // Validar si el ID es un ObjectId válido
            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(400).json({ detail: 'ID no válido' });
            }
    
            // Buscar el producto en la base de datos
            const product = await Product.findById(id);
    
            if (!product) {
                return res.status(404).json({ detail: 'Producto no encontrado' });
            }
    
            res.status(200).json({ product });
        } catch (error) {
            console.error('Error al obtener el producto:', error);
            res.status(500).json({ detail: 'Error interno del servidor' });
        }
    };
        
    static async createProduct(product_data){
        const new_product = new Product(product_data)
        return new_product.save()
    }

    static async updateProduct(id, new_product_data){
        return Product.findByIdAndUpdate(id, new_product_data, {new: true})
    }

    static  async deleteProduct(id){
        return Product.findByIdAndUpdate(id, {active: false}, {new: true})
    }
}

export default ProductRepository
