import { prisma } from "../config/prisma";
import { AppError } from "../utils/errors";

const threadInclude = {
  participants: {
    select: {
      userId: true,
      user: { select: { id: true, name: true } }
    }
  },
  messages: {
    orderBy: { createdAt: "asc" as const },
    select: {
      id: true,
      senderId: true,
      text: true,
      attachments: true,
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

  const otherMembership = await prisma.userCompany.findUnique({
    where: {
      userId_companyId: { userId: otherUserId, companyId }
    },
    select: { id: true }
  });

  if (!otherMembership) {
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

export async function sendMessage(
  threadId: string,
  senderId: string,
  companyId: string,
  text: string,
  attachments: { id: string; name: string; type: string; data: string }[] = []
) {
  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, companyId, participants: { some: { userId: senderId } } },
    select: { id: true }
  });

  if (!thread) {
    throw new AppError(403, "You are not a participant in this thread.", "FORBIDDEN");
  }

  const [message] = await prisma.$transaction([
    prisma.chatMessage.create({
      data: {
        threadId,
        senderId,
        text,
        attachments: attachments.length ? attachments : undefined
      },
      select: {
        id: true,
        senderId: true,
        text: true,
        attachments: true,
        createdAt: true,
        sender: { select: { id: true, name: true } }
      }
    }),
    prisma.chatThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } })
  ]);

  return message;
}

export async function deleteMessage(messageId: string, senderId: string, companyId: string) {
  const message = await prisma.chatMessage.findFirst({
    where: { id: messageId, senderId },
    select: { id: true, threadId: true, thread: { select: { companyId: true } } }
  });

  if (!message || message.thread.companyId !== companyId) {
    throw new AppError(403, "Message not found or you are not the sender.", "FORBIDDEN");
  }

  await prisma.chatMessage.delete({ where: { id: messageId } });
  return { messageId, threadId: message.threadId };
}

export async function getCompanyUsers(userId: string, companyId: string) {
  const memberships = await prisma.userCompany.findMany({
    where: { companyId, userId: { not: userId } },
    select: {
      role: true,
      user: { select: { id: true, name: true } }
    }
  });

  return memberships.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    role: m.role
  }));
}
