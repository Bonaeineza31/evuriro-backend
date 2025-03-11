import express from "express";
import Appointment from "./AppointmentRoute.js";
import Authorization from "./AuthRoute.js";

const mainRouter=express.Router();

mainRouter.use('/user', Authorization)
mainRouter.use('/Appointment', Appointment);


export default mainRouter;