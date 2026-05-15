import { prisma } from "../config/prisma";
import { AppError } from "../utils/errors";

const threadInclude = {
  participants: {
    select: {
      userId: true,
      user: { select: { id: true, name: true, role: true } }
    }
  },
  messages: {
    orderBy: { createdAt: "asc" as const },
    select: {
      id: true,
      senderId: true,
      text: true,
      createdAt: true,
      sender: { select: { id: true, name: true } }
    }
  }
} as const;

export async function getThreads(userId: string, companyId: string) {
  return prisma.chatThread.findMany({
    where: { companyId, participants: { some: { userId } } },
    include: threadInclude,
    orderBy: { updatedAt: "desc" }
  });
}

export async function getOrCreateThread(userId: string, otherUserId: string, companyId: string) {
  const existing = await prisma.chatThread.findFirst({
    where: {
      companyId,
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: otherUserId } } }
      ]
    },
    include: threadInclude
  });

  if (existing) return existing;

  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { id: true, companyId: true }
  });

  if (!otherUser || otherUser.companyId !== companyId) {
    throw new AppError(404, "User not found.", "NOT_FOUND");
  }

  return prisma.chatThread.create({
    data: {
      companyId,
      participants: { create: [{ userId }, { userId: otherUserId }] }
    },
    include: threadInclude
  });
}

export async function sendMessage(threadId: string, senderId: string, companyId: string, text: string) {
  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, companyId, participants: { some: { userId: senderId } } },
    select: { id: true }
  });

  if (!thread) {
    throw new AppError(403, "You are not a participant in this thread.", "FORBIDDEN");
  }

  const [message] = await prisma.$transaction([
    prisma.chatMessage.create({
      data: { threadId, senderId, text },
      include: { sender: { select: { id: true, name: true } } }
    }),
    prisma.chatThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } })
  ]);

  return message;
}

export async function getCompanyUsers(userId: string, companyId: string) {
  return prisma.user.findMany({
    where: { companyId, id: { not: userId } },
    select: { id: true, name: true, role: true }
  });
}
