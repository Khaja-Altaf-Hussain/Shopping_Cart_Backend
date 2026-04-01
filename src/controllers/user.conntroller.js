import {User} from "../models/user.models.js"
import {ApiErrors} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { protect,admin } from "../middlewares/auth.middleware.js"
import jwt from "jsonwebtoken"
const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshsToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiErrors(500,"Something went wrong while generating access and refresh token")
    }
}

const registerUser=asyncHandler(async (req,res)=>{
    const {username,email,password,role}=req.body
    console.log("username:",username)
    console.log("role",role)
    if ([username,email,password,role].some((field)=>{
        field?.trim()===""
    })) {
        throw new ApiErrors(400,"All fields required")
    }
    const existUser=await User.findOne({
        $or:[
            {username},{email}
        ]
    })
    console.log("existUser:",existUser)
    if (existUser) {
        throw new ApiErrors(409,"User with email or username already exists")
    }
    const user=await User.create({
        username:username.toLowerCase(),
        email,
        password,
        role
    })
    const createdUser=await User.findById(user._id).select("-password -refreshToken")
    console.log("Usercreate",createdUser)
    if (!createdUser){
        throw new ApiErrors(500,"Something went wrong while registering the user")
    }
    return res.status(201).json(new ApiResponse(201,createdUser,"User registered successfully"))
})

const loginUser=asyncHandler(async (req,res)=>{
    const {email,password}=req.body
    if (!(email)) {
        throw new ApiErrors(400,"All fields required")
    }
    const user=await User.findOne({email})
    console.log("USER:",user)
    const isPasswordValid=await user.isPasswordCorrect(password)
    console.log("passwordvalid",isPasswordValid)
    if (!isPasswordValid) {
        throw new ApiErrors(401,"Invalid User Credentials")
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")
    const options={
        httpOnly:true,
        secure:true,
        sameSite:"None"
    }
    return res.status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(new ApiResponse(200,{user:loggedInUser.username,accessToken},"User Logged In Successfully"))
})

const logoutUser=asyncHandler(async (req,res)=>{
    // console.log("LOGOUT SUCCESSFULLY")
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    ).select("-password")
    const options={
        httpOnly:true,
        secure:true,
        sameSite:"None"
    }
    // console.log("LOGOUT SUCCESSFULLY")
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User LOGGED OUT successfully"))
})

const refreshAccessToken=asyncHandler(async (req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken  || req.body.refreshToken 
    // console.log("incomeRefresh:",incomingRefreshToken)
    if (!incomingRefreshToken) {
        throw new ApiErrors(401,"Unauthorized request")
    }
    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiErrors(401,"Invalid Refresh Token")
        }
        if((incomingRefreshToken!==user?.refreshToken)){
            throw new ApiErrors(401,"Refresh token is expired or used")
        }
        const {accessToken,refreshToken:newRefreshToken}=await generateAccessAndRefreshToken(user?._id)
        // console.log("accessToken:",accessToken)
        // console.log("new refresh :",newRefreshToken)
        const options={
            httpOnly:true,
            secure:true,
            sameSite:"None"
        }
        return res.status(200)
        .cookie("refreshToken",newRefreshToken,options)
        .cookie("accessToken",accessToken,options)
        .json(new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Access Token Refreshed"))
    } catch (error) {
        throw new ApiErrors(401,error.message||"Invalid Refresh Token")
    }
})

const changeCurrentPasword=asyncHandler(async (req,res)=>{

    const {oldPassword,newPassword,confirmPassword}=req.body
    if(!(newPassword===confirmPassword)){
        throw new ApiErrors(401,"Invalid Refresh Token")
    }
    const user=await User.findById(req.user?._id)
    // console.log(oldPassword)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    // console.log("hash pass:",isPasswordCorrect)
    if(!isPasswordCorrect){
        throw new ApiErrors(401,"Invalid old Password")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})
    return res.status(200).json(new ApiResponse(200,{},"Password Changed Successfully"))
})

const getCurrentUser=asyncHandler(async (req,res)=>{
    // console.log("hi")
    return res.status(200).json(new ApiResponse(200,req.user,"Current User fetched Successfully"))

})

const updateAccountDetails=asyncHandler(async (req,res)=>{
    const {username,email}=req.body
    if(!username||!email){
        throw new ApiErrors(401,"All Fields are required")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                username:username.toLowerCase(),
                email
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")
    // console.log("updated:",user)
    return res.status(200).json(new ApiResponse(200,user,"User Account Details Updated  Successfully"))

})
export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPasword,getCurrentUser,updateAccountDetails}