import mongoose from "mongoose";
import bcrypt from 'bcryptjs';  // Change to import
import { Timestamp } from "mongodb";

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
  },
  healthData: {
    heartRate: { type: Number },
    bloodPressure: { type: String },
    temperature: { type: Number },
    oxygenLevel: { type: Number },
    weight: { type: Number },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
},
{timestamps:true}

);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Change to ES module export
const User = mongoose.model('User', UserSchema);
export default User;