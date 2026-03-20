import mongoose from "mongoose";

const productSchema=new mongoose.Schema(
    {
    
        name:{
            type:String,
            required:[true,'Please provide a product name'],
            trim:true
        },
        description:{
            type:String,
            required:[true,'Please provide a product description'],
            trim:true
        },
        price:{
            type:Number,
            required:[true,'Please provide a product price'],
            min:0,
            validate:{validator:function(v) {
                return v>=0;
            },
            message:'Price cannot be Negative!'
        }},brand:{
            type:String,required:[true,'Please product brand'],
            trim:true,index:true
        },
        imageUrl:{
            type:String,
            required:true,
            trim:true,
            match:[/^(http|https):\/\//,'Please enter a valid Image URL!']
        },
        category:{
            type:String,
            required:[true,'Please provide a product category'],
            trim:true,
            index:true
        },
        countInStock:{
            type:Number,
            required:true,
            min:0,
            default:0
        }
    },
    {timestamps:true})

export const Product=mongoose.model('Product',productSchema)