import database_pool from "../db/config_msql.js";
import Product from "../models/product.model.js";

class ProductRepository {
    static async getProducts() {
        try {
            const [products] = await database_pool.execute('SELECT * FROM products');
            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error('Failed to fetch products. Please try again later.');
        }
    }
    

    //Si queremos devolver null cuando no se encuentre
    static async getProductById(product_id) {
        if (!product_id) {
            throw new Error("El ID del producto es requerido");
        }
    
        const query = `SELECT * FROM products WHERE id = ?`;
    
        try {
            const [registros] = await database_pool.execute(query, [product_id]);
    
            if (registros.length === 0) {
                return null; // No se encontró el producto
            }
    
            return registros[0]; // Devuelve el producto encontrado
        } catch (error) {
            console.error(`Error al obtener el producto con ID ${product_id}:`, error);
            throw new Error("Error al obtener el producto. Por favor, inténtelo de nuevo más tarde.");
        }
    }

    static async createProduct(product_data){
        const {title, stock, price, description, seller_id, image_base_64} = product_data
        const query = `
        INSERT INTO products 
        (title, stock, price, description, seller_id,  image_base_64, active) 
        VALUES 
        ( ?, ?, ?, ?, ?, ?, true )`
        const [resultado] = await database_pool.execute(query, [
            title, stock, price, description, seller_id, image_base_64
        ])
        return {
            id: resultado.insertId,
            title, 
            stock, 
            price, 
            description,
            seller_id, 
            image_base_64,
            active: true
        }
    }

    static async updateProduct(product_id, product_data) {
        const { title, stock, price, description, image_base_64 } = product_data;
    
        const updatedTitle = title !== undefined ? title : null;
        const updatedStock = stock !== undefined ? stock : null;
        const updatedPrice = price !== undefined ? price : null;
        const updatedDescription = description !== undefined ? description : null;
        const updatedImageBase64 = image_base_64 !== undefined ? image_base_64 : null;
    
        const query = `
        UPDATE products 
        SET title = ?, stock = ?, price = ?, description = ?, image_base_64 = ?
        WHERE id = ?
        `;
    
        const [resultado] = await database_pool.execute(query, [
            updatedTitle,
            updatedStock,
            updatedPrice,
            updatedDescription,
            updatedImageBase64,
            product_id
        ]);
    
        // Optionally, check if the update was successful
        if (resultado.affectedRows === 0) {
            throw new Error("Product not found or no changes made.");
        }
    
        return ProductRepository.getProductById(product_id);
    }
    
    static async deleteProduct(product_id) {
        const query = `
            UPDATE products 
            SET active = false
            WHERE id = ?`;

        const [resultado] = await database_pool.execute(query, [product_id]);
        if (!product_id) {
            throw new Error('El ID del producto es inválido o no se ha proporcionado.');
        }

        if (resultado.affectedRows > 0) {
            return { message: 'Producto desactivado correctamente', id: product_id };
        } else {
            return { message: 'Producto no encontrado', id: product_id };
        }
        
    }
}

export default ProductRepository
