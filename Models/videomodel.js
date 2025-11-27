import mongoose from 'mongoose';

const videoRoomSchema = new mongoose.Schema({
  // Reference to appointment (optional - can be created without appointment)
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false
  },

  // Participants
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Patient joins later with room code
  },

  // Whereby API data
  meetingId: {
    type: String,
    required: true,
    unique: true
  },

  roomUrl: {
    type: String,
    required: true
  },

  hostRoomUrl: {
    type: String,
    required: true
  },

  // Scheduling
  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  },

  duration: {
    type: Number, // in minutes
    default: 30
  },

  // Actual timing
  actualStartTime: {
    type: Date
  },

  actualEndTime: {
    type: Date
  },

  // Room status
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },

  // Recording (if enabled)
  recordingEnabled: {
    type: Boolean,
    default: false
  },

  recordingUrl: {
    type: String
  },

  // Consultation notes (can be added during/after call)
  consultationNotes: {
    type: String
  },

  // Diagnosis and treatment
  diagnosis: {
    type: String
  },

  treatmentPlan: {
    type: String
  },

  // Prescription issued during call
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true
});

// Create compound index instead of single field index
// This allows multiple null appointmentIds
videoRoomSchema.index({ appointmentId: 1 }, { unique: true, sparse: true });
videoRoomSchema.index({ doctorId: 1, status: 1 });
videoRoomSchema.index({ patientId: 1, status: 1 });
videoRoomSchema.index({ startDate: 1 });
videoRoomSchema.index({ meetingId: 1 }, { unique: true }); // meetingId should be unique

// Virtual field for room duration calculation
videoRoomSchema.virtual('actualDuration').get(function() {
  if (this.actualStartTime && this.actualEndTime) {
    return Math.round((this.actualEndTime - this.actualStartTime) / 60000); // in minutes
  }
  return null;
});

// Method to check if room is currently active
videoRoomSchema.methods.isActive = function() {
  const now = new Date();
  return now >= new Date(this.startDate) && now <= new Date(this.endDate);
};

// Method to check if room has expired
videoRoomSchema.methods.isExpired = function() {
  return new Date() > new Date(this.endDate);
};

const VideoRoom = mongoose.model('VideoRoom', videoRoomSchema);

export default VideoRoom;