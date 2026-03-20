import {ApiErrors} from "../utils/ApiErrors.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.models.js"
import jwt from "jsonwebtoken"
const protect = asyncHandler(async (req,res,next)=>{
    // const token=req.cookies?.acessToken || req.header("Authorization").replace("Bearer ","")
    try {
            const token=req.cookies?.acessToken || req.header("Authorization").replace("Bearer ","")//req?.cookies?.accessToken||(authHeader && authHeader.startWith("Bearer "))?authHeader.replace("Bearer ",""):null
    if(!token){
        throw new ApiErrors(401,"UnAuthorized request")
    }
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user){
        throw new ApiErrors(401,"Invalid access token")
    }
    req.user=user
    next()
    } catch (error) {
        throw new ApiErrors(402,error?.message,"Invalid Access Token");
        
    }

})

const admin=asyncHandler(async (req,res,next)=>{
    if(req.user && req.user.role==='admin'){
        next()
    }else{
        return res.status(403).json(new ApiErrors("Access denied.ADMINS ONLY!!!"))
    }
})

export { protect,admin }