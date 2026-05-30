import express from "express";
import { body } from "express-validator";
import { registerUser, loginUser, getUserProfile } from "../controllers/user.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";
import { logoutUser } from "../controllers/user.controller.js";


const userRouter = express.Router();

userRouter.post('/register',[
     body('fullname.firstname').isLength({min:3}).withMessage('First name must be atleast 3 characters long'),
     body('email').isEmail().withMessage('Please enter a valid email address'),
     body('password').isLength({min:6}).withMessage('Password must be atleast 6 characters long')
], registerUser)

userRouter.post('/login',[
     body('email').isEmail().withMessage('Please enter a valid email address'),
     body('password').isLength({min:6}).withMessage("Password must be atleast 6 characters long")
],loginUser)

userRouter.get('/profile',authUser, getUserProfile);

userRouter.post('/logout', authUser, logoutUser);
export default userRouter;