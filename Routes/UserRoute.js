import express from "express";
import { register, login, getProfile } from "../controllers/UserController.js";
import { protect } from "../Middlewares/auth.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);

export default router;