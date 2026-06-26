import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";

export const createProductController = async(request,response)=>{
    try {
        const { 
            name ,
            image ,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            farmer_id
        } = request.body 

        if(!name || !image || !image[0] || !category || !unit || !price || !description ){
            return response.status(400).json({
                message: "Enter required fields (name, image, category, unit, price, description)",
                error: true,
                success: false
            })
        }

        // Set farmer_id to logged in user if not provided (applicable for Farmers adding their own products)
        const finalFarmerId = farmer_id || request.userId;

        const product = new ProductModel({
            name ,
            image ,
            category,
            subCategory: subCategory || null,
            unit,
            stock: stock || 0,
            price,
            discount: discount || 0,
            description,
            farmer_id: finalFarmerId,
            status: stock > 0 ? 'active' : 'out_of_stock'
        })
        const saveProduct = await product.save()

        return response.json({
            message : "Product Created Successfully",
            data : saveProduct,
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductController = async(request,response)=>{
    try {
        let { page, limit, search, farmerId } = request.body 

        if(!page){ page = 1 }
        if(!limit){ limit = 10 }

        let query = {};
        if (search) {
            query.$text = { $search : search };
        }
        if (farmerId) {
            query.farmer_id = farmerId;
        }

        const skip = (page - 1) * limit

        const [data,totalCount] = await Promise.all([
            ProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limit).populate('category subCategory farmer_id', 'name email mobile farm_name'),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product data retrieved",
            error : false,
            success : true,
            totalCount : totalCount,
            totalNoPage : Math.ceil( totalCount / limit),
            data : data
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductByCategory = async(request,response)=>{
    try {
        const { id } = request.body 

        if(!id){
            return response.status(400).json({
                message : "Provide category ID",
                error : true,
                success : false
            })
        }

        const data = await ProductModel.find({ category: id }).populate('category subCategory farmer_id', 'name farm_name');

        return response.json({
            message : "Category wise product list",
            data : data,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductByCategoryAndSubCategory = async(request,response)=>{
    try {
        const { categoryId, subCategoryId } = request.body 

        if(!categoryId){
            return response.status(400).json({
                message : "Provide category ID",
                error : true,
                success : false
            })
        }

        let query = { category: categoryId };
        if (subCategoryId) {
            query.subCategory = subCategoryId;
        }

        const data = await ProductModel.find(query).populate('category subCategory farmer_id', 'name farm_name');

        return response.json({
            message : "Subcategory wise product list",
            data : data,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductDetails = async(request,response)=>{
    try {
        const { productId } = request.body 

        if(!productId){
            return response.status(400).json({
                message : "Provide product ID",
                error : true,
                success : false
            })
        }

        const product = await ProductModel.findById(productId).populate('category subCategory farmer_id', 'name email mobile farm_name farm_address')

        return response.json({
            message : "Product details retrieved",
            data : product,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const updateProductDetails = async(request,response)=>{
    try {
        const { _id, name, image, category, subCategory, unit, stock, price, discount, description } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "Provide product ID (_id)",
                error : true,
                success : false
            })
        }

        const updateData = {
            ...(name && { name }),
            ...(image && { image }),
            ...(category && { category }),
            ...(subCategory && { subCategory }),
            ...(unit && { unit }),
            ...(stock !== undefined && { stock }),
            ...(price && { price }),
            ...(discount !== undefined && { discount }),
            ...(description && { description }),
            status: stock > 0 ? 'active' : 'out_of_stock'
        }

        const update = await ProductModel.findByIdAndUpdate(_id, updateData, { new : true })

        return response.json({
            message : "Product updated successfully",
            data : update,
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const deleteProduct = async(request,response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "Provide product ID (_id)",
                error : true,
                success : false
            })
        }

        const deleteProduct = await ProductModel.findByIdAndDelete(_id)

        return response.json({
            message : "Product deleted successfully",
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// search product
export const searchProduct = async(request,response)=>{
    try {
        let { search, page, limit } = request.body 

        if(!page){ page = 1 }
        if(!limit){ limit = 10 }

        const skip = (page - 1) * limit

        let query = {}
        if(search){
            query = {
                $text : {
                    $search : search
                }
            }
        }

        const [data,dataCount] = await Promise.all([
            ProductModel.find(query).skip(skip).limit(limit).populate('category subCategory farmer_id', 'name farm_name'),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Search results",
            data : data,
            totalCount : dataCount,
            totalPage : Math.ceil(dataCount/limit),
            success : true,
            error : false
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}