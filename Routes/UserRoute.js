import express from "express";
import { register, login, getProfile } from "../Controllers/UserController.js"
import { protect } from "../Middlewares/auth.js";

const userRouter = express();

// Auth routes
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/profile", protect, getProfile);

export default userRouter;