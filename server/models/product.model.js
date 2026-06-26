import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required: [true, "Provide product name"]
    },
    image : {
        type : Array,
        default : []
    },
    category : {
        type : mongoose.Schema.ObjectId,
        ref : 'category',
        required: [true, "Provide category"]
    },
    subCategory : {
        type : mongoose.Schema.ObjectId,
        ref : 'subCategory',
        default: null
    },
    unit : {
        type : String,
        default : ""
    },
    stock : {
        type : Number,
        default : 0
    },
    price : {
        type : Number,
        required: [true, "Provide price"]
    },
    discount : {
        type : Number,
        default : 0
    },
    description : {
        type : String,
        default : ""
    },
    farmer_id : {
        type : mongoose.Schema.ObjectId,
        ref : 'User', // Reference the User schema, who has role = 'FARMER'
        required: [true, "Provide farmer details"]
    },
    status : {
        type : String,
        enum : ['active', 'draft', 'out_of_stock'],
        default : 'active'
    },
    harvestDate : {
        type : String,
        default : ""
    },
    packagingDate : {
        type : String,
        default : ""
    },
    milkingTime : {
        type : String,
        default : ""
    },
    farmDistance : {
        type : Number,
        default : 0
    },
    freshnessScore : {
        type : Number,
        default : 100
    }
},{
    timestamps : true
})

// text index for search
productSchema.index({
    name  : "text",
    description : 'text'
},{
    weights: {
        name : 10,
        description : 5
    }
})

const ProductModel = mongoose.model('product',productSchema)

export default ProductModel