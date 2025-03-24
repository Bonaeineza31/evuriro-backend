import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import mainRouter from './Routes/indexRouting.js';

// Load environment variables
dotenv.config();

const db_user = process.env.DB_USER;
const db_name = process.env.DB_NAME;
const db_pass = process.env.DB_PASS;

// Create Express app
const app = express();

// Define allowed origins - be sure to include your frontend URLs
const allowedOrigins = [
  // Production origins
  'https://evuriro-platform.vercel.app',
  process.env.FRONTEND_URL,
  'https://3.93.231.111',
  'https://54.197.202.33',
  // Development origins
  'http://localhost:5137',
  'http://localhost:3000',
  'http://3.93.231.111',
  'http://54.197.202.33'
].filter(Boolean); // Filter out undefined values

// CORS configuration - more permissive for troubleshooting
// Update your CORS configuration in server.js
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    console.log("Request origin:", origin); // Log all origins for debugging
    
    // Allow all origins temporarily to debug
    callback(null, true);
    
    // Once working, switch back to this:
    // if (allowedOrigins.includes(origin)) {
    //   callback(null, true);
    // } else {
    //   console.log('CORS blocked origin:', origin);
    //   callback(new Error('Not allowed by CORS'));
    // }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));

// Pre-flight OPTIONS handler
// Add this before your routes
app.options('*', (req, res) => {
  console.log("Received preflight request from:", req.headers.origin);
  
  // Set headers explicitly
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Respond with 200
  res.status(200).send();
});
app.use(express.static('public'));

app.use(express.json());

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} from origin: ${req.headers.origin}`);
  next();
});

// Apply routes
app.use('/', mainRouter);

// Improved MongoDB connection for serverless environments
const dbUri = `mongodb+srv://${db_user}:${encodeURIComponent(db_pass)}@cluster0.qfmve.mongodb.net/${db_name}?retryWrites=true&w=majority&appName=Cluster0`;

const connectDB = async () => {
  try {
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Could not connect to MongoDB', err);
    // Don't exit in production as this might terminate the container
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};
connectDB();

// Simple health check route
app.get('/', (req, res) => {
  res.send('Evuriro API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Always listen for connections, regardless of environment
const PORT = process.env.PORT || 5006;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;