// routes/authRoutes.js
const express = require('express');
const { register, login, getMe } = require('../Controllers/AuthController');
const { protect } = require('../Middleware/Authorization');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;