import userModel from "../models/user.model.js";
import { createUser } from "../services/user.service.js";
import { validationResult } from "express-validator";
import BlacklistedToken from "../models/blacklistToken.model.js";

export const registerUser = async(req,res,next)=>{
     const error = validationResult(req);

     if(!error.isEmpty()){
          return res.status(400).json({errors:error.array()})
     }

     const {fullname ,email, password} =req.body;

     const userAlreadyExist = await userModel.findOne({email});
     
          if(userAlreadyExist){
               return res.status(400).json({
                    message:"User with this email already exists"
               })
          }
     const hashedPassword = await userModel.hashPassword(password);
     
     try{
          const user = await createUser({
               firstname: fullname.firstname,
               lastname: fullname.lastname,
               email,
               password:hashedPassword
          })

          const token = user.generateAuthToken();

          res.status(201).json({
               message:"User Created successfully",
               token:token,
               user:user
          })
     }catch(err){
          console.log(err);
          res.status(500).json({
               message:"Internal Server Error"
          })
     }

}

export const loginUser = async(req,res,next)=>{
     const error = validationResult(req);

     if(!error.isEmpty()){
          return res.status(400).json({
               errors:error.array()
          })
     }

     const {email, password} = req.body;

     try{
          const user = await userModel.findOne({email}).select('+password');

          if(!user){
               return res.status(400).json({
                    message:"Invalid email or password"
               })
          }

          const isMatch = await user.comparePassword(password);

          if(!isMatch){
               return res.status(400).json({
                    message:"Invalid email or password"
               })
          }

          const token = user.generateAuthToken()

          res.cookie("token",token).status(200).json({
               message:"Login successful",
               token:token,
               user:user
          })
     }catch(err){
          console.log(err.message)
          res.status(500).json({
               message:"Internal Server Error"
          })
     }
}

export const getUserProfile = async(req,res,next)=>{
     res.status(200).json(req.user)
}

export const logoutUser = async (req,res,next)=>{
     try{
          res.clearCookie("token");
          const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

          await BlacklistedToken.create({token});

          res.status(200).json({
               message:"Logout successful"
          })
     }catch(err){
          console.log(err.message);
          return res.status(500).json({

               message:"Internal Server Error"
          })
     }
}