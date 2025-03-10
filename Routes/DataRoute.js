// routes/healthDataRoutes.js
import express from 'express';

const { updateHealthData, getHealthData } = require('../controllers/healthDataController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getHealthData);
router.route('/update').put(protect, updateHealthData);

module.exports = router;