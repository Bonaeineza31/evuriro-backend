import express from "express";
import Appointment from "./AppointmentRoute.js";
import userRouter from "./UserRoute.js"


const mainRouter=express.Router();
mainRouter.use("/user", userRouter);
mainRouter.use('/Appointment', Appointment);


export default mainRouter;