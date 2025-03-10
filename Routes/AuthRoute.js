// routes/authRoutes.js
import express from 'express';
const { register, login, getMe } = require('../Controllers/AuthController');
const { protect } = require('../Middleware/Authorization');

const Authorization = express.Router();

Authorization.post('/register', register);
Authorization.post('/login', login);
Authorization.get('/me', protect, getMe);

export default Authorization;