import {Product} from "../models/product.models.js"
import {ApiErrors} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const fetchAllProduct=asyncHandler(async (req,res)=>{
    try {
        const products=await Product.find({})
        res.status(201).json(new ApiResponse(200,products,"Fetched all Product Successfully"))
    } catch (error) {
        console.log('Get Products Error:',error)
        throw new ApiErrors(400,"Server Error Fetching Products")
    }
})

const fetchSingleProductById=asyncHandler(async (req,res)=>{
    try {
        const product=await Product.findById(req.params.id)
        if (!product) {
        throw new ApiErrors(404,"Product not found!!!")
        }
        res.status(201).json(new ApiResponse(200,product,"Fetched Product Successfully through ID"))
    } catch (error) {
        console.log('Get Product by IDError:',error)
        if (error.kind==='ObjectId') {
            return res.status(400).json(new ApiErrors('Invalid Product ID format'))
        }
        throw new ApiErrors(400,"Server Error Fetching Products by ID")
    }
})

const createProduct=asyncHandler(async (req,res)=>{
    const {name,description,price,countInStock,category,brand}=req.body
    if(!name || !price || !category || !brand){
        throw new ApiErrors(400,"Please provide all required fields (name,price,category,brand)")
    }
    // console.log("req,file:",req.file)
    const imageLocalPath=req.file.path
    // if(req.file&&Array.isArray(req.file.imageLocalPath)&&req.file.coverImage.length>0){
    //     imageLocalPath=req.file.imageLocalPath.path
    // }
    
    if (!imageLocalPath) {
        throw new ApiErrors(400,"Image field required")
    }
    const img=await uploadOnCloudinary(imageLocalPath)
    // console.log("imagelocalpath:",imageLocalPath)
    // console.log("imguplodcloudui:",img)
    if (!img) {
        throw new ApiErrors(400,"Image field required")
    }
    try {
        const product=await Product.create({
            name,description,price,countInStock,imageUrl:img?.url||"",category,brand
        })
        res.status(201).json(new ApiResponse(200,product,"Product created successfully"))
    } catch (error) {
        console.log('Create Product Error',error)
        throw new ApiErrors(400,"Error creating Product");
        
    }
})

const updateProduct=asyncHandler(async (req,res)=>{//console.log("req.body:",req.body)
    const {name,description,price,countInStock,category,brand}=req.body
    // console.log("name:",name)
    if(!name || !price || !category || !brand){
        throw new ApiErrors(400,"Please provide all required fields (name,price,category,brand)")
    }
    try {
        const product=await Product.findById(req.params.id)
        if (!product) {
            throw new ApiErrors(404,"Product not found")
        }
        product.name=name || product.name
        product.description=description || product.description
        product.price=price !==undefined ? price : product.price
        product.countInStock=countInStock !==undefined ? countInStock : product.countInStock        
        // product.imageUrl=imageUrl || product.imageUrl
        product.category=category || product.category
        product.brand=brand || product.brand
        const updatedProduct= await product.save()
        res.status(201).json(new ApiResponse(200,updatedProduct,"Updated Product Successfully"))
    } catch (error) {
        console.log('Update Product ERROR...',error)
        if (error.kind==='ObjectId') {
            return res.status(400).json(new ApiErrors('Invalid Product ID format'))
        }
        throw new ApiErrors(500,"Error updating product")
    }
})

const updateProductImage=asyncHandler(async()=>{
    const {imageUrl}=req.file?.path
    // console.log("name:",name)
    if(!imageUrl){
        throw new ApiErrors(400,"Please provide imageUrl  field")
    }
    try {
        
        const updatedImageLocalPath=req.file.path
    // if(req.file&&Array.isArray(req.file.imageLocalPath)&&req.file.coverImage.length>0){
    //     imageLocalPath=req.file.imageLocalPath.path
    // }
    
    if (!updatedImageLocalPath) {
        throw new ApiErrors(400,"Image field required")
    }
    const updatedImg=await uploadOnCloudinary(updatedImageLocalPath)
    // console.log("imagelocalpath:",imageLocalPath)
    // console.log("imguplodcloudui:",img)
    if (!updatedImg) {
        throw new ApiErrors(400,"Image field required")
    }
    const product=await Product.findByIdAndUpdate(req.params.id,
        {$set:{
            imageUrl:updatedImg.path
        }},{
            new:true
        }
    ).select("-password -refreshToken")
        if (!product) {
            throw new ApiErrors(404,"Product not found")
        }
        
        res.status(201).json(new ApiResponse(200,product,"Updated Product Image  Successfully"))
    } catch (error) {
        console.log('Update Product ERROR...',error)
        if (error.kind==='ObjectId') {
            return res.status(400).json(new ApiErrors('Invalid Product ID format'))
        }
        throw new ApiErrors(500,"Error updating product Image")
    }
})


const deleteProduct=asyncHandler(async (req,res)=>{
    try {
        const product=await Product.findById(req.params.id)
        if (!product) {
            throw new ApiErrors(404,"Product not found")
        }
        await Product.deleteOne(product)
        res.status(201).json(new ApiResponse(200,"Deleted Product Successfully"))
        } catch (error) {
            console.log('Delete Product ERROR...',error)
            if (error.kind==='ObjectId') {
                return res.status(400).json(new ApiErrors('Invalid Product ID format'))
            }
            throw new ApiErrors(500,"Server Error Deleting product")
        }
})



export {
    fetchAllProduct,
    fetchSingleProductById,
    createProduct,
    updateProduct,
    deleteProduct,updateProductImage
}