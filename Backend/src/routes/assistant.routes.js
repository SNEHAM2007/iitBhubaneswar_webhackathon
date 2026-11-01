import express from "express";
import { chatWithAssistant } from "../controllers/assistant.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/chat", chatWithAssistant);

export default router;
