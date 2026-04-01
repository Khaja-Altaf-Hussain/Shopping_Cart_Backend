import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:[true,'Please provide your name'],
        trim:true,
        min:3,
        lowercase:true
    },email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true
    },password:{
        type:String,
        required:[true,'Please provide a password'],
        minlength:6
    },role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },refreshToken:{
        type:String
    }
},{timestamps:true})

userSchema.pre("save",async function () {
    // console.log("next:")
    if (!this.isModified("password")) return;
    // console.log("OLD PASSWORD FROM MODEL: ",this.password)
    this.password=await bcrypt.hash(this.password,10)
    
})
userSchema.methods.isPasswordCorrect=async function (password) {
    // console.log("from model pass:",password)
    // console.log("form model this pass",this.password)
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken=function () {
    return jwt.sign(
        {
            _id:this._id,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    
}

userSchema.methods.generateRefreshsToken=function () {
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
    
}


export const User=mongoose.model('User',userSchema)