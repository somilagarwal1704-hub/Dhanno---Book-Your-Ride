import { validationResult } from "express-validator";
import captainModel from "../models/captain.model.js";
import { createCaptain } from "../services/captain.service.js";
import BlacklistedToken from "../models/blacklistToken.model.js";

export const registerCaptain = async(req, res, next) => {

     const error = validationResult(req);

     if(!error.isEmpty()){
          return res.status(400).json({errors:error.array()})
     }

     const {fullname, email, password, vehicle} = req.body;
     
     const captainAlreadyExist = await captainModel.findOne({email});

     if(captainAlreadyExist){
          return res.status(400).json({
               message:"Captain with this email already exists"
          })
     }
     const hashedPassword = await captainModel.hashPassword(password);

     try{
          const captain = await createCaptain({
               firstname : fullname.firstname,
               lastname: fullname.lastname,
               email,
               password:hashedPassword,
               color: vehicle.color,
               plate: vehicle.plate,
               capacity: vehicle.capacity,
               vehicleType: vehicle.vehicleType
          })

          const token = captain.generateAuthToken();

          res.status(201).cookie('token',token).json({
               message:"Captain registered successfully",
               captain:captain,
               token:token

          })
     }catch(err){
          res.status(500).json({
               message:err.message || "Internal Server Error"
          })
     }

}

export const loginCaptain = async(req,res,next)=>{
     const error = validationResult(req);
     console.log(error)
     if(!error.isEmpty()){
          return res.status(400).json({
               errors:error.array()
          })
     }

     const {email,password} = req.body;

     try{
          const captain = await captainModel.findOne({email}).select('+password');

          if(!captain){
               return res.status(400).json({
                    message:"Invalid email or password"
               })
          }

          const isMatch = await captain.comparePassword(password);

          if(!isMatch){
               return res.status(400).json({
                    message:"Invalid email or password"
               })
          }

          const token = captain.generateAuthToken();

          return res.cookie("token",token).status(200).json({
               message:"Login successful",
               token:token,
               captain:captain
          })
     }catch(err){
          res.status(500).json({
               message:err.message || "Internal Server Error"
          })
     }
}

export const captainProfile = async (req,res,next)=>{
     try{
          const captain = req.captain;

          res.status(200).json({
               captain:captain
          })
     }catch(err){
          res.status(500).json({
               message:err.message || "Internal Server Error"
          })
     }
}

export const logoutCaptain = async (req,res,next)=>{
     try{

          const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
          
          await BlacklistedToken.create({token});
          res.clearCookie("token")

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