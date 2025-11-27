import fetch from 'node-fetch';
import VideoRoom from '../Models/videomodel.js';
import User from '../Models/UserModel.js'; // Add this import

const WHEREBY_API_KEY = process.env.WHEREBY_API_KEY;
const WHEREBY_API_URL = 'https://api.whereby.dev/v1/meetings';

// Create a new video consultation room
export const createVideoRoom = async (req, res) => {
  try {
    const { 
      appointmentId, 
      doctorId, 
      patientId, 
      scheduledTime,
      duration = 30
    } = req.body;

    if (!doctorId) {
      return res.status(400).json({ 
        message: 'Missing required field: doctorId' 
      });
    }

    const startDate = scheduledTime ? new Date(scheduledTime) : new Date();
    const endDate = new Date(startDate.getTime() + duration * 60000);

    const wherebyResponse = await fetch(WHEREBY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHEREBY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endDate: endDate.toISOString(),
        fields: ['hostRoomUrl'],
        roomNamePrefix: '/evuriro',
        roomMode: 'normal',
        isLocked: false
      }),
    });

    if (!wherebyResponse.ok) {
      const errorData = await wherebyResponse.json();
      console.error('Whereby API Error:', errorData);
      return res.status(wherebyResponse.status).json({ 
        message: 'Failed to create video room',
        error: errorData 
      });
    }

    const wherebyData = await wherebyResponse.json();

    const videoRoomData = {
      doctorId,
      meetingId: wherebyData.meetingId,
      roomUrl: wherebyData.roomUrl,
      hostRoomUrl: wherebyData.hostRoomUrl,
      startDate: wherebyData.startDate,
      endDate: wherebyData.endDate,
      status: 'scheduled',
      duration
    };

    // ONLY add appointmentId if it's provided and valid (to avoid null duplicates)
    if (appointmentId && /^[0-9a-fA-F]{24}$/.test(appointmentId)) {
      videoRoomData.appointmentId = appointmentId;
    }
    // DO NOT set appointmentId to null/undefined

    if (patientId && /^[0-9a-fA-F]{24}$/.test(patientId)) {
      videoRoomData.patientId = patientId;
    }

    const videoRoom = new VideoRoom(videoRoomData);
    await videoRoom.save();

    res.status(201).json({
      message: 'Video room created successfully',
      room: {
        roomId: videoRoom._id,
        meetingId: videoRoom.meetingId,
        patientRoomUrl: wherebyData.roomUrl,
        doctorRoomUrl: wherebyData.hostRoomUrl,
        startDate: videoRoom.startDate,
        endDate: videoRoom.endDate,
        duration: videoRoom.duration
      }
    });

  } catch (error) {
    console.error('Error creating video room:', error);
    res.status(500).json({ 
      message: 'Server error while creating video room',
      error: error.message 
    });
  }
};

// Get video room details
export const getVideoRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const videoRoom = await VideoRoom.findById(roomId)
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email');

    if (!videoRoom) {
      return res.status(404).json({ message: 'Video room not found' });
    }

    res.status(200).json({
      room: videoRoom
    });

  } catch (error) {
    console.error('Error fetching video room:', error);
    res.status(500).json({ 
      message: 'Server error while fetching video room',
      error: error.message 
    });
  }
};

// Get room by appointment ID
export const getVideoRoomByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const videoRoom = await VideoRoom.findOne({ appointmentId })
      .populate('doctorId', 'name email specialty')
      .populate('patientId', 'name email');

    if (!videoRoom) {
      return res.status(404).json({ 
        message: 'No video room found for this appointment' 
      });
    }

    if (new Date() > new Date(videoRoom.endDate)) {
      return res.status(410).json({ 
        message: 'Video room has expired',
        room: videoRoom 
      });
    }

    res.status(200).json({
      room: videoRoom
    });

  } catch (error) {
    console.error('Error fetching video room:', error);
    res.status(500).json({ 
      message: 'Server error while fetching video room',
      error: error.message 
    });
  }
};

// Update room status
export const updateRoomStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { status, actualStartTime, actualEndTime } = req.body;

    // Validate roomId
    if (!roomId || roomId === 'undefined' || roomId === 'null') {
      return res.status(400).json({ 
        message: 'Invalid room ID provided' 
      });
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(roomId)) {
      return res.status(400).json({ 
        message: 'Invalid room ID format' 
      });
    }

    const validStatuses = ['scheduled', 'active', 'completed', 'cancelled', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const updateData = { status };
    if (actualStartTime) updateData.actualStartTime = actualStartTime;
    if (actualEndTime) updateData.actualEndTime = actualEndTime;

    const videoRoom = await VideoRoom.findByIdAndUpdate(
      roomId,
      updateData,
      { new: true }
    );

    if (!videoRoom) {
      return res.status(404).json({ message: 'Video room not found' });
    }

    res.status(200).json({
      message: 'Room status updated successfully',
      room: videoRoom
    });

  } catch (error) {
    console.error('Error updating room status:', error);
    res.status(500).json({ 
      message: 'Server error while updating room status',
      error: error.message 
    });
  }
};

// Delete video room
export const deleteVideoRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const videoRoom = await VideoRoom.findById(roomId);
    
    if (!videoRoom) {
      return res.status(404).json({ message: 'Video room not found' });
    }

    const wherebyDeleteUrl = `${WHEREBY_API_URL}/${videoRoom.meetingId}`;
    const wherebyResponse = await fetch(wherebyDeleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${WHEREBY_API_KEY}`,
      },
    });

    if (!wherebyResponse.ok && wherebyResponse.status !== 404) {
      console.error('Whereby deletion failed:', await wherebyResponse.text());
    }

    await VideoRoom.findByIdAndDelete(roomId);

    res.status(200).json({
      message: 'Video room deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting video room:', error);
    res.status(500).json({ 
      message: 'Server error while deleting video room',
      error: error.message 
    });
  }
};

// Get all rooms for a doctor
export const getDoctorRooms = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.query;

    const query = { doctorId };
    if (status) query.status = status;

    const rooms = await VideoRoom.find(query)
      .populate('patientId', 'name email')
      .sort({ startDate: -1 });

    res.status(200).json({
      count: rooms.length,
      rooms
    });

  } catch (error) {
    console.error('Error fetching doctor rooms:', error);
    res.status(500).json({ 
      message: 'Server error while fetching rooms',
      error: error.message 
    });
  }
};

// Get all rooms for a patient
export const getPatientRooms = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.query;

    const query = { patientId };
    if (status) query.status = status;

    const rooms = await VideoRoom.find(query)
      .populate('doctorId', 'name email specialty')
      .sort({ startDate: -1 });

    res.status(200).json({
      count: rooms.length,
      rooms
    });

  } catch (error) {
    console.error('Error fetching patient rooms:', error);
    res.status(500).json({ 
      message: 'Server error while fetching rooms',
      error: error.message 
    });
  }
};

// Join room with code (for patients)
export const joinRoomWithCode = async (req, res) => {
  try {
    const { roomCode } = req.params;

    if (!roomCode) {
      return res.status(400).json({ message: 'Room code is required' });
    }

    console.log('🔍 Searching for room with code:', roomCode);

    const rooms = await VideoRoom.find({ status: { $in: ['scheduled', 'active'] } })
      .populate('doctorId', 'name email specialty')
      .lean();

    console.log('📋 Active/Scheduled rooms in database:', rooms.length);
    
    if (rooms.length === 0) {
      return res.status(404).json({ 
        message: 'No active rooms available. Please ask your doctor to generate a new room code.' 
      });
    }
    
    // Log all room codes for debugging
    rooms.forEach(room => {
      const lastSix = room.meetingId ? room.meetingId.slice(-6).toUpperCase() : 'NO MEETING ID';
      console.log(`Room ${room._id}: Code=${lastSix} | Status=${room.status} | Expired=${new Date() > new Date(room.endDate)}`);
    });

    // Find matching room
    const room = rooms.find(r => {
      if (!r.meetingId) return false;
      const lastSix = r.meetingId.slice(-6).toUpperCase();
      return lastSix === roomCode.toUpperCase();
    });

    if (!room) {
      console.log('❌ No matching room found for code:', roomCode);
      return res.status(404).json({ 
        message: 'Invalid room code. Please check the code and try again.' 
      });
    }

    // Check if room has expired
    if (new Date() > new Date(room.endDate)) {
      console.log(' Room has expired:', room.endDate);
      return res.status(410).json({ 
        message: 'This room has expired. Please ask the doctor to generate a new room code.',
        expired: true 
      });
    }

    console.log(' Room found successfully:', room._id);

    res.status(200).json({
      message: 'Room found successfully',
      room: {
        roomId: room._id,
        meetingId: room.meetingId,
        patientRoomUrl: room.roomUrl,
        doctorRoomUrl: room.hostRoomUrl,
        doctorId: room.doctorId,
        startDate: room.startDate,
        endDate: room.endDate,
        duration: room.duration,
        status: room.status
      }
    });

  } catch (error) {
    console.error(' Error joining room with code:', error);
    res.status(500).json({ 
      message: 'Server error while joining room',
      error: error.message 
    });
  }
};