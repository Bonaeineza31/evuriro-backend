// Server.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './Routes/AuthRoute.js';
import userRoutes from './Routes/UserRoute.js';
import appointmentRoutes from './Routes/AppointmentRoute.js';
import healthDataRoutes from './Routes/DataRoute.js';

// Load environment variables
dotenv.config();

const db_user = process.env.DB_USER;
const db_name = process.env.DB_NAME;
const db_pass = process.env.DB_PASS;

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const dbUri = `mongodb+srv://${db_user}:${encodeURIComponent(db_pass)}@cluster0.qfmve.mongodb.net/${db_name}?retryWrites=true&w=majority&appName=Cluster0`;

// Connect to MongoDB
mongoose.connect(dbUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/health', healthDataRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Evuriro API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});