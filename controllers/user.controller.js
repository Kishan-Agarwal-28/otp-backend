import asyncHandler from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { apiResponse } from '../utils/apiResponse.js';
import { sendEmail } from '../helpers/sendEmail.js';
import { nanoid } from 'nanoid';
import { APPURL, VERIFICATIONTOKENEXPIRYTIME } from '../constants.js';
import bcrypt from 'bcrypt';
const cookieOptions={
    httpOnly:true,
    secure:true,
}
const generateAccessTokenAndRefreshToken =async(user) => {
    const accessToken=await user.generateAccessToken();
    const refreshToken=await user.generateRefreshToken();
    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false});
    return {accessToken,refreshToken};
}
const loginUser=asyncHandler(async(req,res)=>{
 const{username,email,password}=req.body;
if([username,email,password].some((field)=>field?.trim()===""))
{
    throw new apiError(400,"All fields are required")
}
 if(password===email||password===username){
    throw new apiError(400,"Password should not be same as username or email")
}
else{
    const existingUser=await User.findOne({$or:[{email},{username}]});
    if(existingUser){
        if(existingUser.username===username && existingUser.isVerified==true){
            throw new apiError(409,"User Username already taken")
        }
        if(existingUser.requestCount>=3 && Date.now()-existingUser.lastRequestedAt>=60*60*1000){
        existingUser.requestCount=0;
        }
        else if(existingUser.requestCount>=3 && Date.now()-existingUser.lastRequestedAt<60*60*1000){
        throw new apiError(400,"You have exceeded the maximum number of requests. Please try again after an hour")
        }
        else if(existingUser.requestCount<3 && existingUser.verificationTokenExpiryDate>Date.now()){
        throw new apiError(400,"You have been already sent a verification token.Please check you email or try after 5 mins");
        }
        else{
            const verificationToken=nanoid(10);
            const verificationTokenExpiryDate=Date.now()+VERIFICATIONTOKENEXPIRYTIME*1000;
            existingUser.requestCount++;
            existingUser.lastRequestedAt=Date.now();
            existingUser.verificationToken=verificationToken;   
            existingUser.verificationTokenExpiryDate=verificationTokenExpiryDate;
            // await sendEmail(existingUser.email, "verify", {
            //     username: existingUser.username,
            //     token: existingUser.verificationToken
            // });
            await existingUser.save({validateBeforeSave:false});
            const logginedUser=await User.findById(existingUser._id).select("-password -refreshToken");
        if(!logginedUser){
            throw new apiError(500,"Failed to save in the database")
        }
        return res.status(200)
        .json(new apiResponse(200,{},"verification email sent successfully"))
        }
    }
        const verificationToken=nanoid(10);
        const verificationTokenExpiryDate=Date.now()+VERIFICATIONTOKENEXPIRYTIME*1000;
        const requestCount=1;
        const lastRequestedAt=Date.now();
        const user=await User.create({
            username,
            email,
            password,
            verificationToken,
            verificationTokenExpiryDate,
            requestCount,
            lastRequestedAt,
        });
       
        const createdUser=await User.findById(user._id).select(
            "-password -refreshToken "
        );
        if(!createdUser){
            throw new apiError(500,"User not created something went wrong while registering the user")
        }
        await sendEmail(createdUser.email, "verify", {
            username: createdUser.username,
            token: verificationToken
        });
       return res.status(200)
       .json(new apiResponse(200,createdUser,"User registered successfully"))
    }
}
)

const logoutUser = asyncHandler(async(req, res) => {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1 
                }
            },
            {
                new: true
            }
        )
    
      
        return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new apiResponse(200, {}, "User logged Out"))
})
const resendVerificationToken=asyncHandler(async(req,res)=>{
    const{username,email}=req.body;
    if(!(username&&email))
    {
        throw new apiError(400,"any one of username or email field is required")
    }
    else{
        const existingUser=await User.findOne({$or:[{email},{username}]});
        if(existingUser){
            if(existingUser.requestCount>=3 && Date.now()-existingUser.lastRequestedAt>=60*60*1000){
                existingUser.requestCount=0;
                }
                else if(existingUser.requestCount>=3 && Date.now()-existingUser.lastRequestedAt<60*60*1000){
                throw new apiError(400,"You have exceeded the maximum number of requests. Please try again after an hour")
                }
                else if(existingUser.requestCount<3 && existingUser.verificationTokenExpiryDate<Date.now()){
                throw new apiError(400,"You have been already sent a verification token.Please check you email or try after 5 mins");
                }
                else{
                    const verificationToken=nanoid(10);
                    const verificationTokenExpiryDate=Date.now()+VERIFICATIONTOKENEXPIRYTIME*1000;
                    existingUser.requestCount++;
                    existingUser.lastRequestedAt=Date.now();
                    existingUser.verificationToken=verificationToken;   
                    existingUser.verificationTokenExpiryDate=verificationTokenExpiryDate;
                    await sendEmail(existingUser.email, "verify", {
                        username: existingUser.username,
                        token: existingUser.verificationToken
                    });
                    await existingUser.save({validateBeforeSave:false});
                    const logginedUser=await User.findById(existingUser._id).select("-password -refreshToken");
                if(!logginedUser){
                    throw new apiError(500,"Failed to save in the database")
                }
                return res.status(200)
                .json(new apiResponse(200,{},"verification email sent successfully"))
                } 
        }
        else{
            throw new apiError(404,"User not found")
        }
    }
});
const verifyUser=asyncHandler(async(req,res)=>{
    const{verificationToken ,username,email}=req.body;
    if(!verificationToken){
        throw new apiError(400,"verification token is required")
    }
    if(!(username&&email))
    {
        throw new apiError(400,"any one of username or email field is required")
    }
    else{
        const existingUser=await User.findOne({$or:[{email},{username}]});
        if(!existingUser){
            throw new apiError(400,"User not found")
        }
            if(existingUser.verificationTokenExpiryDate<Date.now()){
                throw new apiError(400,"Verification token expired")
            }
            else{
                if(!bcrypt.compare(existingUser.verificationToken,verificationToken)){
                    throw new apiError(400,"verification token is invalid")
                }
                existingUser.isVerified=true;
                existingUser.verificationToken=undefined;
                existingUser.verificationTokenExpiryDate=undefined;
                await existingUser.save({validateBeforeSave:false});
                const user=await User.findById(existingUser._id).select(
                    "-password -refreshToken"
                );    
                if(!user){
                    throw new apiError(500,"User not verified");
                }
                     const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(user);
       return res.status(200)
       .cookie("accessToken",accessToken,cookieOptions)
       .cookie("refreshToken",refreshToken,cookieOptions)
       .json(new apiResponse(200,user,"User registered successfully"))
            }
        
        
    }
})
const generateNewTokens = asyncHandler(async (req, res) => {
    const oldRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!oldRefreshToken) {
      throw new apiError(401, "Unauthorized request")
    }
    const user = await User.findOne({ refreshToken: oldRefreshToken })
    if (!user) {
      throw new apiError(401, "Unauthorized request user not found")
    }
    const {
      accessToken,
      refreshToken
    } = await generateAccessTokenAndRefreshToken(user)
  
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken },
          "Tokens generated successfully"
        )
      )
  })
export {
    loginUser,
    logoutUser,
    verifyUser,
    resendVerificationToken,
    generateNewTokens,
}