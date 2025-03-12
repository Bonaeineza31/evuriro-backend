import express from 'express';
import { register, login, getMe } from '../Controllers/AuthController.js';
import { protect } from '../Middlewares/Authorization.js';

const Authorization = express.Router(); // Use Router() instead of express()

Authorization.post('/register', register);
Authorization.post('/login', login);
Authorization.get('/me', protect, getMe);

export default Authorization;