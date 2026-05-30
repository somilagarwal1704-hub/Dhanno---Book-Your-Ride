import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import BlacklistedToken from "../models/blacklistToken.model.js";
import captainModel from "../models/captain.model.js";

export const authUser = async(req,res,next)=>{
     const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

     if(!token){
          return res.status(401).json({
               message:"Access Denied. No token provided."
          })
     }

     const isBlackListed = await BlacklistedToken.findOne({token:token});

     if(isBlackListed){
          return res.status(401).json({
               message:"Invalid token. Please login again."
          })
     }
     try{
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await userModel.findById(decoded._id);

          if(!user){
               return res.status(401).json({
                    message:"Access Denied. User not found."
               })
          }
          req.user = user;
           return next();
     }catch(err){
          console.log(err.message);
          res.status(401).json({
               message:"Invalid token."
          })
     }
}

export const authCaptain = async(req,res,next)=>{
     const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
     
     if(!token){
          return res.status(401).json({
               message:"Access Denied. No token founf"
          })
     }

     const BlackListedToken = await BlacklistedToken.findOne({token:token})
     if(BlackListedToken){
          return res.status(401).json({
               message:"Invalid token. Please login again."
          })
     }

     try{
     const decoded = jwt.verify(token, process.env.JWT_SECRET);

     const captain = await captainModel.findById(decoded._id);

     if(!captain){
          return res.status(401).json({
               message:"Access Denied. Captain not found."
          })
     }

    req.captain = captain;
     return next();
}catch(err){
     console.log(err.message);
     res.status(401).json({
          message:"Invalid token."
     })

}
}