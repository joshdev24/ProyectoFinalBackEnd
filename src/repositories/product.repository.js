import mongoose from 'mongoose';
import Product from '../models/product.model.js';
class ProductRepository {
    // Obtener todos los productos activos
    static async getProducts(filters = {}) {
        try {
            const query = { active: true, ...filters };
            return await Product.find(query);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw new Error('No se pudieron obtener los productos.');
        }
    }

    // Obtener un producto por ID
    static async getProductById(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('ID no válido.');
            }

            const product = await Product.findById(id);

            if (!product) {
                throw new Error('Producto no encontrado.');
            }

            return product;
        } catch (error) {
            console.error(`Error al obtener producto con ID ${id}:`, error);
            console.log(id)
            throw new Error('No se pudo obtener el producto.');
        }
    }

    // Crear un nuevo producto
    static async createProduct(product_data) {
        try {
            const new_product = new Product(product_data);
            return await new_product.save();
        } catch (error) {
            console.error('Error al crear producto:', error);
            throw new Error('No se pudo crear el producto.');
        }
    }

    // Actualizar un producto existente
    static async updateProduct(id, new_product_data) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('ID no válido.');
            }

            const updated_product = await Product.findByIdAndUpdate(id, new_product_data, { new: true });

            if (!updated_product) {
                throw new Error('Producto no encontrado para actualizar.');
            }

            return updated_product;
        } catch (error) {
            console.error(`Error al actualizar producto con ID ${id}:`, error);
            throw new Error('No se pudo actualizar el producto.');
        }
    }

    // Eliminar (marcar como inactivo) un producto
    static async deleteProduct(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('ID no válido.');
            }

            const deleted_product = await Product.findByIdAndUpdate(id, { active: false }, { new: true });

            if (!deleted_product) {
                throw new Error('Producto no encontrado para eliminar.');
            }

            return deleted_product;
        } catch (error) {
            console.error(`Error al eliminar producto con ID ${id}:`, error);
            throw new Error('No se pudo eliminar el producto.');
        }
    }
}

export default ProductRepository;