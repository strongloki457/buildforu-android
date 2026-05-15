import { Router } from "express";
import * as chatController from "../controllers/chat.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createThreadSchema, sendMessageSchema } from "../validators/chat.validators";

const router = Router();

router.use(authenticate);

router.get("/threads", chatController.listThreads);
router.post("/threads", validate({ body: createThreadSchema }), chatController.createThread);
router.post("/threads/:threadId/messages", validate({ body: sendMessageSchema }), chatController.postMessage);
router.get("/users", chatController.listCompanyUsers);

export default router;
