import { Router } from "express";
import * as pushController from "../controllers/push.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { registerPushTokenSchema, unregisterPushTokenSchema } from "../validators/push.validators";

const router = Router();

router.use(authenticate);

router.post("/register", validate({ body: registerPushTokenSchema }), pushController.registerToken);
router.delete("/register", validate({ body: unregisterPushTokenSchema }), pushController.unregisterToken);

export default router;
