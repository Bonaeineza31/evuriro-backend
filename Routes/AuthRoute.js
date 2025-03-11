import express from 'express';
import { register, login, getMe } from '../Controllers/UserController.js';  // Note the .js extension
import { protect } from '../Middlewares/Authorization.js';  // Note the .js extension

const Authorization = express();

Authorization.post('/register', register);
Authorization.post('/login', login);
Authorization.get('/me', protect, getMe);

export default Authorization;