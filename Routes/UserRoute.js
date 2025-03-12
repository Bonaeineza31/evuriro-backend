// import express from 'express';
// import User from '../Models/UserModel.js';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';

// const router = express();

// // @desc    Register user
// // @route   POST /api/users/register
// // @access  Public
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // Check if user already exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ success: false, message: 'User already exists' });
//     }

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password,
//       role: role || 'patient',
//     });

//     // Generate JWT token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRE,
//     });

//     res.status(201).json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//       token,
      
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// // @desc    Login user
// // @route   POST /api/users/login
// // @access  Public
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if email and password are provided
//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: 'Please provide email and password' });
//     }

//     // Check if user exists
//     const user = await User.findOne({ email }).select('+password');
//     if (!user) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }

//     // Check if password matches
//     const isMatch = await user.matchPassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRE,
//     });

//     res.status(200).json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// // @desc    Get current logged in user
// // @route   GET /api/users/me
// // @access  Private
// router.get('/me', async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);

//     res.status(200).json({
//       success: true,
//       data: user,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// // @desc    Update health data
// // @route   PUT /api/users/health
// // @access  Private
// router.put('/health', async (req, res) => {
//   try {
//     const { heartRate, bloodPressure, temperature, oxygenLevel, weight } = req.body;

//     const user = await User.findById(req.user.id);
    
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     user.healthData = {
//       ...user.healthData,
//       ...(heartRate && { heartRate }),
//       ...(bloodPressure && { bloodPressure }),
//       ...(temperature && { temperature }),
//       ...(oxygenLevel && { oxygenLevel }),
//       ...(weight && { weight }),
//     };

//     await user.save();

//     res.status(200).json({
//       success: true,
//       data: user.healthData,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// // @desc    Get all users (admin only)
// // @route   GET /api/users
// // @access  Private/Admin
// router.get('/', async (req, res) => {
//   try {
//     const users = await User.find();
    
//     res.status(200).json({
//       success: true,
//       count: users.length,
//       data: users,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// export default router;