import express from "express";
import {registerUser, loginUser, logoutUser, googleLogin, loginStaff} from "../controllers/authController.js"
import { authUser } from "../middleware/authMiddleware.js"

const router = express.Router();
router.post("/register",registerUser)
router.post("/login",loginUser) 
router.post("/staff-login", loginStaff)
router.post("/logout", authUser, logoutUser)
router.post("/google-login", googleLogin)
export default router;