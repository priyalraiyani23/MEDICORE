import express from "express";
import { authUser } from "../middleware/authMiddleware.js";
import {
  createNewChat,
  addMessageToChat,
  streamMessageToChat,
  getChatHistory,
  getChatDetails,
  renameChat,
  deleteChat,
} from "../controllers/chatController.js";

const router = express.Router();

// All chat routes are protected with JWT user authentication
router.post("/new", authUser, createNewChat);
router.post("/message", authUser, addMessageToChat);
router.post("/stream", authUser, streamMessageToChat);   // Streaming SSE endpoint
router.get("/history", authUser, getChatHistory);
router.patch("/rename", authUser, renameChat);
router.delete("/:conversationId", authUser, deleteChat);
router.get("/:conversationId", authUser, getChatDetails);

export default router;
