import express from "express";
import Appointment from "./AppointmentRoute.js";
import userRouter from "./UserRoute.js"
import videoRouter from "./videoRoute.js";

const mainRouter=express.Router();
mainRouter.use("/user", userRouter);
mainRouter.use('/Appointment', Appointment);
mainRouter.use('/api/video', videoRouter);

export default mainRouter;