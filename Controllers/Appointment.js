import Appointment from '../Models/AppointmentModel.js';


export const createAppointment = async (req, res) => {
  try {
    const appointmentData = {
      ...req.body,
      patient: req.user._id
    };
    
    const appointment = await Appointment.create(appointmentData);
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    let query;
    
    if (req.user.role === 'patient') {
      query = Appointment.find({ patient: req.user.id });
    } 
    else if (req.user.role === 'doctor') {
      query = Appointment.find({ doctor: req.user.id });
    } 
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