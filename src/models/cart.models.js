import mongoose from "mongoose";

// const cartItemSchema=new mongoose.Schema({
//     product:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:'Product',
//         required:true
//     },
//     name:{
//         type:String,
//         required:true
//     },
//     quantity:{
//         type:Number,
//         required:true,
//         min:1,
//         default:1
//     },price:{
//         type:Number,
//         required:true
//     },image:{
//         type:String,
//         required:false
//     }

// })

const cartSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        unique:true,
        index:true
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    items:[{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
            },
        name: String,
        quantity: {
            type: Number,
            required: true,
            default: 1
            },
        price: Number,
        image: String
    }
],
    updateAt:{
        type:Date,
        default:Date.now()
    }
})

cartSchema.index({user:1,product:1},{unique:true})

cartSchema.pre("save",async function () {
    if(!this.isModified("items")) return 
    this.updateAt=Date.now()
    
})
cartSchema.pre("remove",async function () {
    await this.model("Product").deleteMany({_id:{$in:this.items.map(item => item.product)}})
    
})
export const Cart=mongoose.model('Cart',cartSchema)