import database_pool from "../db/config_msql.js";
import Product from "../models/product.model.js";

class ProductRepository {
    static async getProducts() {
        try {
            const query = 'SELECT * FROM products WHERE active = true';
            const [registros] = await database_pool.execute(query);
    
            if (!registros || registros.length === 0) {
                throw new Error('No active products found.');
            }
    
            return registros;
        } catch (error) {
            console.error('Error fetching products:', error.message, error.stack);
            throw new Error('Failed to fetch products. Please try again later.');
        }
    }
    

    //Si queremos devolver null cuando no se encuentre
    static async getProductById (product_id){
        const query = `SELECT * FROM products WHERE id = ?`
        //Execute espera como segundo parametro un array con los valores que quieras reemplazar en la query
        const [registros] = await database_pool.execute(query, [product_id])
        return registros.length > 0 ? registros[0] : null
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
    const fields = [];
    const values = [];

    const { title, stock, price, description, image_base_64 } = product_data;

    if (title !== undefined) {
        fields.push("title = ?");
        values.push(title);
    }
    if (stock !== undefined) {
        fields.push("stock = ?");
        values.push(stock);
    }
    if (price !== undefined) {
        fields.push("price = ?");
        values.push(price);
    }
    if (description !== undefined) {
        fields.push("description = ?");
        values.push(description);
    }
    if (image_base_64 !== undefined) {
        fields.push("image_base_64 = ?");
        values.push(image_base_64);
    }

    if (fields.length === 0) {
        throw new Error("No fields provided to update.");
    }

    const query = `
        UPDATE products
        SET ${fields.join(", ")}
        WHERE id = ?
    `;

    values.push(product_id);

    const [resultado] = await database_pool.execute(query, values);

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
