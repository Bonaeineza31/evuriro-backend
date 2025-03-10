// routes/appointmentRoutes.js
import express from 'express';

import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointmentController.js';

import { protect } from '../middleware/authMiddleware.js';

const Appointment = express.Router();

Appointment
  .route('/')
  .get(protect, getAppointments)
  .post(protect, createAppointment);

Appointment // This was 'router' which is undefined - changed to 'Appointment'
  .route('/:id')
  .get(protect, getAppointment)
  .put(protect, updateAppointment)
  .delete(protect, deleteAppointment);

export default Appointment;