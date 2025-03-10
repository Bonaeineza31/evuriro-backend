import express from 'express';
import { register, login, getMe } from '../Controllers/AuthController.js';  // Note the .js extension
import { protect } from '../Middlewares/Authorization.js';  // Note the .js extension

const Authorization = express.Router();

Authorization.post('/register', register);
Authorization.post('/login', login);
Authorization.get('/me', protect, getMe);

export default Authorization;