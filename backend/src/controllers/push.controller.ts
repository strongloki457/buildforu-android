import type { Request, Response } from "express";
import * as pushService from "../services/push.service";
import { asyncHandler } from "../utils/asyncHandler";
import type { RegisterPushTokenInput, UnregisterPushTokenInput } from "../validators/push.validators";

export const registerToken = asyncHandler(async (req: Request, res: Response) => {
  const { token, platform } = req.body as RegisterPushTokenInput;
  await pushService.registerPushToken(req.user!.userId, token, platform);
  res.status(204).send();
});

export const unregisterToken = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body as UnregisterPushTokenInput;
  await pushService.unregisterPushToken(token);
  res.status(204).send();
});
