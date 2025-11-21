import express from 'express';
import {
  createVideoRoom,
  getVideoRoom,
  getVideoRoomByAppointment,
  updateRoomStatus,
  deleteVideoRoom,
  getDoctorRooms,
  getPatientRooms,
  joinRoomWithCode
} from '../controllers/videocontroller.js';

const router = express.Router();

// CREATE a new video consultation room
// POST /api/video/rooms
// Body: { appointmentId, doctorId, patientId, scheduledTime, duration }
router.post('/rooms', createVideoRoom);

// GET video room by room ID
// GET /api/video/rooms/:roomId
router.get('/rooms/:roomId', getVideoRoom);

// GET video room by appointment ID
// GET /api/video/appointment/:appointmentId
router.get('/appointment/:appointmentId', getVideoRoomByAppointment);

// JOIN room with code (for patients)
// GET /api/video/join/:roomCode
router.get('/join/:roomCode', joinRoomWithCode);

// UPDATE room status
// PUT /api/video/rooms/:roomId/status
// Body: { status, actualStartTime?, actualEndTime? }
router.put('/rooms/:roomId/status', updateRoomStatus);

// DELETE video room
// DELETE /api/video/rooms/:roomId
router.delete('/rooms/:roomId', deleteVideoRoom);

// GET all rooms for a doctor
// GET /api/video/doctor/:doctorId/rooms?status=scheduled
router.get('/doctor/:doctorId/rooms', getDoctorRooms);

// GET all rooms for a patient
// GET /api/video/patient/:patientId/rooms?status=scheduled
router.get('/patient/:patientId/rooms', getPatientRooms);

export default router;