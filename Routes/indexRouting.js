import express from "express";
import Appointment from "./AppointmentRoute.js";


const mainRouter=express.Router();

mainRouter.use('/Appointment', Appointment);


export default mainRouter;