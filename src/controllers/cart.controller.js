import {Cart} from "../models/cart.models.js"
import {Product} from "../models/product.models.js"
import {ApiErrors} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getUserCart=asyncHandler(async (req,res)=>{
    try {
        let cart=await Cart.findOne({user:req.user._id}).populate('items.product','name price imageUrl')
        if(!cart){
            cart = await Cart.create({
                user:req.user._id,
                items:[]
            })
        }
        res.status(201).json(new ApiResponse(200,cart,"Cart fetched successfully"))
    } catch (error) {
        console.log('Get Cart Error:',error)
        throw new ApiErrors(500,"Server Error fetching Cart");

    }
})

const addItemToCart=asyncHandler(async (req,res)=>{
    const {productId,quantity}=req.body
    if (!productId) {
    throw new ApiErrors(400, "Product ID is required");}
    try {
        const product=await Product.findById(productId)
        if(!product){
            throw new ApiErrors(404,"Product not found");
        }
        let cart=await Cart.findOne({user:req.user?._id})
        if(!cart){
            cart=new Cart({
                user:req.user?._id,
                items:[]
            })
        }
        const existItemIndex=cart.items.findIndex(item=>item.product.toString()===productId)
        if (existItemIndex>-1) {
            cart.items[existItemIndex].quantity+=1
            if(cart.items[existItemIndex].quantity > product.countInStock){
                cart.items[existItemIndex].quantity=product.countInStock
            }
        }else{
            cart.items.push({
                product:productId,
                name:product.name,
                quantity,
                price:product.price,
                image:product.imageUrl
            })
        }
        cart.product=productId
        cart.updateAt=Date.now()
        const updateCart=await cart.save()
        await updateCart.populate('items.product','name price imageUrl')
        res.status(200).json(new ApiResponse(200,updateCart,"Added items to Cart Succesfully"))
    
    } catch (error) {
        console.log("Add to cart Error:",error)
        if (error.kind==='ObjectId') {
            return res.status(400).json(new ApiErrors('Invalid Product ID format'))
        }
        throw new ApiErrors(500,"Error adding item to cart ")
    }
})


const removeItemFromCart=asyncHandler(async (req,res)=>{
    const {productId}=req.params
    try {
        let cart=await Cart.findOne({user:req.user?._id})
        if (!cart) {
            throw new ApiErrors(404,"Cart not found");
        }
        const initialLength=cart.items.length
        cart.items=cart.items.filter(item => item.product.toString()===productId)
        if(initialLength===cart.items.length){
            throw new ApiErrors(404,"Item not found");
        }
        cart.updateAt=Date.now()
        const updatedCart=await cart.save()
        await updatedCart.populate("items.product","name price imageUrl")
        res.status(200).json(new ApiResponse(200,updatedCart,"Deleted items to Cart Succesfully"))
    } catch (error) {
        console.log("Remove from cart Error:",error)
        if (error.kind==='ObjectId') {
            return res.status(400).json(new ApiErrors('Invalid Product ID format'))
        }
        throw new ApiErrors(500,"Error removing item to cart ")
    }

})

const updateItemToCart=asyncHandler(async (req,res)=>{
    const {productId}=req.params
    const {quantity}=req.body
    if(quantity===undefined || quantity<=0){
        throw new ApiErrors(404,"Quantity must be a positive quantity");
    }
    try {
        let cart=await Cart.findOne({user:req.user?._id})
        if (!cart) {
            throw new ApiErrors(404,"Cart not found");
        }
        const itemIndex=cart.items.findIndex(item => item.product.toString()===productId)
        if(itemIndex===-1){
            throw new ApiErrors(404,"Item not found");
        }
        const product= await Product.findById(productId)
        if(!product){
            throw new ApiErrors(404,"Product associated with this cart item not found");
        }
        if(quantity>product.countInStock){
            throw new ApiErrors(404,`Quantity exceeds available stock (${product.countInStock})`);
        }
        cart.items[itemIndex].quantity=quantity
        cart.updateAt=Date.now()
        const updatedCart=await cart.save()
        await updatedCart.populate("items.product","name price imageUrl")
        res.status(200).json(new ApiResponse(200,updatedCart,"Updated items to Cart Succesfully"))
    } catch (error) {
        console.log("Updating to cart Error:",error)
        if (error.kind==='ObjectId') {
            return res.status(400).json(new ApiErrors('Invalid Product ID format'))
        }
        throw new ApiErrors(500,"Error updating item to cart ")
    }
})
export {getUserCart,addItemToCart,removeItemFromCart,updateItemToCart}