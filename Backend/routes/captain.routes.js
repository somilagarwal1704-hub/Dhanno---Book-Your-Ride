import express from "express";
import {body} from "express-validator";
import { registerCaptain, loginCaptain, captainProfile, logoutCaptain } from "../controllers/captain.controller.js";
import { authCaptain } from "../middlewares/auth.middleware.js";

const captainRouter= express.Router();

captainRouter.post('/register',[
     body('fullname.firstname').isLength({min:3}).withMessage('First name must be 3 characters long'),
     body('email').isEmail().withMessage('Please enter a valid email address'),
     body('password').isLength({min:6}).withMessage('Password must be atleast 6  characters long'),
     body('vehicle.color').isLength({min:3}).withMessage('Vehicle color must be 3 characters long'),
     body('vehicle.plate').isLength({min:3}).withMessage('Vehicle plate number must be 3 characters long'),
     body('vehicle.capacity').isInt({min:1}).withMessage('Vehicle capacity must be atleast 1'),
     body('vehicle.vehicleType').isIn(['car','bike','auto']).withMessage('Vehicle type must be either car, bike or auto'
     )
],registerCaptain)

captainRouter.post('/login',[
     body('email').isEmail().withMessage('Please enter a valid email address'),
     body('password').isLength({min:6}).withMessage('Password must be atleast 6  characters long')
],loginCaptain)

captainRouter.get('/profile',authCaptain,captainProfile)

captainRouter.post('/logout',authCaptain,logoutCaptain)

export default captainRouter;