import express from "express";
import { createMessage, getMessages, deleteMessage } from "../controllers/messageController.js";
import { authAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route to send message
router.post("/", createMessage);

// Admin authenticated routes to manage messages
router.get("/admin", authAdmin, getMessages);
router.delete("/admin/:id", authAdmin, deleteMessage);

export default router;
