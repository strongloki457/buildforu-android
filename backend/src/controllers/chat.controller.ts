import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as chatService from "../services/chat.service";
import { io } from "../server";

export const listThreads = asyncHandler(async (req: Request, res: Response) => {
  const { userId, companyId } = req.user!;
  const threads = await chatService.getThreads(userId, companyId);
  res.json({ threads });
});

export const createThread = asyncHandler(async (req: Request, res: Response) => {
  const { userId, companyId } = req.user!;
  const { otherUserId } = req.body;
  const thread = await chatService.getOrCreateThread(userId, otherUserId, companyId);
  res.status(201).json({ thread });
});

export const postMessage = asyncHandler(async (req: Request, res: Response) => {
  const { userId, companyId } = req.user!;
  const { threadId } = req.params;
  const { text } = req.body;
  const message = await chatService.sendMessage(threadId, userId, companyId, text);

  io?.to(`company:${companyId}`).emit("chat:message", {
    threadId,
    message: {
      id: message.id,
      senderId: message.senderId,
      text: message.text,
      createdAt: message.createdAt
    }
  });

  res.status(201).json({ message });
});

export const listCompanyUsers = asyncHandler(async (req: Request, res: Response) => {
  const { userId, companyId } = req.user!;
  const users = await chatService.getCompanyUsers(userId, companyId);
  res.json({ users });
});
