// routes/appointmentRoutes.js
import express from 'express';

const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');

const { protect } = require('../middleware/authMiddleware');

const Appointment = express.Router();

Appointment
  .route('/')
  .get(protect, getAppointments)
  .post(protect, createAppointment);

router
  .route('/:id')
  .get(protect, getAppointment)
  .put(protect, updateAppointment)
  .delete(protect, deleteAppointment);

// module.exports = router;

export default Appointment;