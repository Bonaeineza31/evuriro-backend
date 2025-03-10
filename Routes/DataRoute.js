// routes/healthDataRoutes.js
import express from 'express';

const { updateHealthData, getHealthData } = require('../controllers/healthDataController');
const { protect } = require('../middleware/authMiddleware');

const Data = express.Router();

Data.route('/').get(protect, getHealthData);
Data.route('/update').put(protect, updateHealthData);

export default Data;