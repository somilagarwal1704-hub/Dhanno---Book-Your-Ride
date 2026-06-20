import 'dotenv/config';
import express from "express"
import cors from 'cors'
import connectToDb from './db/db.js';
import userRouter from './routes/user.routes.js';
import cookieParser from 'cookie-parser';
import captainRouter from './routes/captain.routes.js';
import rideRouter from './routes/ride.routes.js';

const app = express()

connectToDb()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use("/users",userRouter);
app.use("/captains", captainRouter);
app.use("/rides", rideRouter);
app.get('/',(req,res)=>{
     res.send("hello world")
});

export default app