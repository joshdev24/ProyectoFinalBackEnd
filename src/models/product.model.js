import mongoose from "mongoose";


const productSchema = new mongoose.Schema(
    {
    title: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    stock: {
        type: Number,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    category: {
        type: String,
        require: true
    },
    active: {
        type: Boolean,
        require: true,
        default:true
    },
    image_base_64: {
        type: String
    },
seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
},
fecha_creacion : {
    type: Date,
    default: Date.now
}
}
)

const Product = mongoose.model("Product", productSchema)

export default Product