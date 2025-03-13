// routes/healthDataRoutes.js
import express from 'express';
import { updateHealthData, getHealthData } from '../Controllers/DataController.js';
import { protect } from '../Middlewares/Authorization.js';

const Data = express();

Data.route('/').get(protect, getHealthData);
Data.route('/update').put(protect, updateHealthData);

export default Data;