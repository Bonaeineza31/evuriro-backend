// controllers/appointmentController.js
import Appointment from '../Models/AppointmentModel.js';
import User from '../Models/UserModel.js';

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  try {
    // Add user to req.body
    req.body.patient = req.user.id;
    
    const appointment = await Appointment.create(req.body);
    
    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all appointments for logged in user
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    let query;
    
    // If role is patient, get only their appointments
    if (req.user.role === 'patient') {
      query = Appointment.find({ patient: req.user.id });
    } 
    // If role is doctor, get appointments where they are the doctor
    else if (req.user.role === 'doctor') {
      query = Appointment.find({ doctor: req.user.id });
    } 
    // If admin, get all appointments
    else {
      query = Appointment.find({});
    }
    
    // Execute query
    const appointments = await query.populate({
      path: 'doctor',
      select: 'name'
    }).populate({
      path: 'patient',
      select: 'name'
    });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctor',
        select: 'name'
      })
      .populate({
        path: 'patient',
        select: 'name'
      });
    
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    
    // Make sure user is the appointment owner or a doctor/admin
    if (
      appointment.patient._id.toString() !== req.user.id && 
      appointment.doctor._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ success: false, error: 'Not authorized to view this appointment' });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    
    // Make sure user is the appointment owner or a doctor/admin
    if (
      appointment.patient.toString() !== req.user.id && 
      appointment.doctor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this appointment' });
    }
    
    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    
    // Make sure user is the appointment owner or an admin
    if (
      appointment.patient.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this appointment' });
    }
    
    await appointment.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};