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

// Define allowed origins
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://evuriro-platform.vercel.app', process.env.FRONTEND_URL].filter(Boolean)
  : ['http://localhost:5137', 'http://3.93.231.111', 'http://54.197.202.33'];

// Enable preflight requests for all routes
app.options('*', cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Preflight blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Regular CORS for all routes
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Request blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Manual CORS headers for extra assurance
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
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

app.get('/', (req, res) => {
  res.send('Evuriro API is running');
});

// Always listen for connections, regardless of environment
const PORT = process.env.PORT || 5006;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;