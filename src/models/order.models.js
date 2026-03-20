import mongoose from "mongoose";
const orderItemSchema=new mongoose.Schema({
    product:{
        type:Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    quantity:{
        type:Number,required:true,
        min:1
    },
    priceAtPurchase:{
        type:Number,
        required:true,
        min:0
    }
},{_id:false})

const orderSchema=new mongoose.Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    orderDate:{
        type:Date,
        default:Date.now
    },
    totalAmount:{
        type:Number,
        required:true,
        min:0
    },
    status:{
        type:String,
        required:true,
        enum:['Pending','Processing','Shipped','Delivered','Cancelled'],
        default:'Pending'
    },
    shippingAddress:{
        street:String,
        city:String,
        state:String,
        zipCode:String,
        country:String,
        required:true
    },
    items:[orderItemSchema]
},
    {timestamps:true})

export const Order=mongoose.model('Order',orderSchema)