// routes/healthDataRoutes.js
import express from 'express';
import { updateHealthData, getHealthData } from '../controllers/healthDataController.js';
import { protect } from '../middleware/authMiddleware.js';

const Data = express.Router();

Data.route('/').get(protect, getHealthData);
Data.route('/update').put(protect, updateHealthData);

export default Data;