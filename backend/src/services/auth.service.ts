import crypto from "crypto";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import type { ChangePasswordInput, ForgotPasswordInput, LoginInput, RegisterCompanyInput, ResetPasswordInput } from "../validators/auth.validators";
import { AppError, assertFound } from "../utils/errors";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/password";
import { sendEmailVerificationEmail, sendPasswordChangedEmail, sendPasswordResetEmail } from "./email.service";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  role: true,
  companyId: true,
  workerId: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
  company: {
    select: {
      id: true,
      name: true,
      plan: true
    }
  }
} as const;

type PublicUserRecord = {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId: string;
  workerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  company?: {
    id: string;
    name: string;
    plan: string;
  };
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function logAuthFailure(details: {
  email: string;
  reason: "USER_NOT_FOUND" | "PASSWORD_HASH_MISSING" | "PASSWORD_MISMATCH";
  passwordHashExists?: boolean;
}) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  process.stdout.write(
    `Auth failure: ${JSON.stringify({
      email: details.email,
      reason: details.reason,
      passwordHashExists: details.passwordHashExists ?? null
    })}\n`
  );
}

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function buildAuthResponse(user: PublicUserRecord) {
  const token = signAccessToken({
    userId: user.id,
    role: user.role,
    companyId: user.companyId,
    workerId: user.workerId
  });

  const refreshToken = signRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
    }
  });

  return { token, refreshToken, user };
}

export async function refreshAccessToken(rawRefreshToken: string) {
  let payload: { userId: string };

  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError(401, "Refresh token is invalid or has expired.", "REFRESH_TOKEN_INVALID");
  }

  const user = await prisma.$transaction(async (tx) => {
    const stored = await tx.refreshToken.findUnique({
      where: { token: rawRefreshToken },
      select: { id: true, userId: true, expiresAt: true }
    });

    if (!stored || stored.userId !== payload.userId || stored.expiresAt < new Date()) {
      throw new AppError(401, "Refresh token is invalid or has expired.", "REFRESH_TOKEN_INVALID");
    }

    await tx.refreshToken.delete({ where: { id: stored.id } });

    const foundUser = await tx.user.findUnique({
      where: { id: stored.userId },
      select: publicUserSelect
    });

    if (!foundUser) {
      throw new AppError(401, "User not found.", "AUTH_INVALID");
    }

    return foundUser;
  }, { isolationLevel: "Serializable" });

  return buildAuthResponse(user);
}

export async function registerCompany(input: RegisterCompanyInput, lang?: string) {
  const email = normalizeEmail(input.email);
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });

  if (existingUser) {
    throw new AppError(409, "An account with this email already exists.", "EMAIL_IN_USE");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: input.companyName,
        plan: input.plan
      }
    });

    return tx.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
        role: Role.ADMIN,
        companyId: company.id
      },
      select: publicUserSelect
    });
  });

  const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
  const verifyToken = crypto.randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      token: verifyToken,
      expiresAt: new Date(Date.now() + EMAIL_VERIFY_TTL_MS)
    }
  });

  sendEmailVerificationEmail(email, input.name, verifyToken, lang).catch((error) => {
    process.stderr.write(`[auth] Failed to send verification email to ${email}: ${error}\n`);
  });

  return buildAuthResponse(user);
}

export async function verifyEmail(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    select: { id: true, userId: true, expiresAt: true }
  });

  if (!record || record.expiresAt < new Date()) {
    throw new AppError(400, "Verification link is invalid or has expired.", "TOKEN_INVALID");
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
    prisma.emailVerificationToken.delete({ where: { id: record.id } })
  ]);

  return { message: "Email verified successfully." };
}

export async function resendVerificationEmail(userId: string, lang?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, emailVerified: true }
  });

  if (!user) throw new AppError(404, "User not found.", "USER_NOT_FOUND");
  if (user.emailVerified) throw new AppError(409, "Email is already verified.", "ALREADY_VERIFIED");

  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.emailVerificationToken.create({
    data: { userId, token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
  });

  sendEmailVerificationEmail(user.email, user.name, token, lang).catch((error) => {
    process.stderr.write(`[auth] Failed to resend verification email: ${error}\n`);
  });

  return { message: "Verification email sent." };
}

export async function login(input: LoginInput) {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          plan: true
        }
      }
    }
  });

  if (!user) {
    logAuthFailure({ email, reason: "USER_NOT_FOUND", passwordHashExists: false });
    throw new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
    throw new AppError(
      429,
      `Account is temporarily locked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
      "ACCOUNT_LOCKED"
    );
  }

  if (!user.passwordHash) {
    logAuthFailure({ email, reason: "PASSWORD_HASH_MISSING", passwordHashExists: false });
    throw new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
  }

  const passwordMatches = await verifyPassword(input.password, user.passwordHash);

  if (!passwordMatches) {
    logAuthFailure({ email, reason: "PASSWORD_MISMATCH", passwordHashExists: true });

    const newAttempts = user.failedLoginAttempts + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: newAttempts,
        lockedUntil: newAttempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION_MS) : undefined
      }
    });

    throw new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null }
  });

  const { passwordHash: _pw, failedLoginAttempts: _fa, lockedUntil: _lu, ...publicUser } = user;
  return buildAuthResponse(publicUser);
}

export async function requestPasswordReset(input: ForgotPasswordInput, lang?: string) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true }
  });

  if (!user) {
    return { message: "If that email exists, a reset link has been sent." };
  }

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt }
  });

  sendPasswordResetEmail(input.email, token, lang).catch((error) => {
    process.stderr.write(`[auth] Failed to send reset email to ${input.email}: ${error}\n`);
  });

  return { message: "If that email exists, a reset link has been sent." };
}

export async function resetPassword(input: ResetPasswordInput, lang?: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: input.token },
    select: { id: true, userId: true, expiresAt: true }
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new AppError(400, "Reset token is invalid or has expired.", "TOKEN_INVALID");
  }

  const passwordHash = await hashPassword(input.password);

  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
      select: { email: true, name: true }
    }),
    prisma.passwordResetToken.delete({ where: { id: resetToken.id } }),
    prisma.refreshToken.deleteMany({ where: { userId: resetToken.userId } })
  ]);

  sendPasswordChangedEmail(updatedUser.email, updatedUser.name, lang).catch((error) => {
    process.stderr.write(`[auth] Failed to send password-changed email to ${updatedUser.email}: ${error}\n`);
  });

  return { message: "Password has been reset successfully." };
}

export async function changePassword(userId: string, input: ChangePasswordInput, lang?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, passwordHash: true }
  });

  if (!user?.passwordHash) {
    throw new AppError(400, "No password set on this account.", "NO_PASSWORD");
  }

  const isValid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!isValid) {
    throw new AppError(400, "Current password is incorrect.", "WRONG_PASSWORD");
  }

  const passwordHash = await hashPassword(input.newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  });

  sendPasswordChangedEmail(user.email, user.name, lang).catch((error) => {
    process.stderr.write(`[auth] Failed to send password-changed email to ${user.email}: ${error}\n`);
  });

  return { message: "Password changed successfully." };
}

export async function updateAvatar(userId: string, avatarUrl: string | null) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: publicUserSelect
  });

  return { user };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect
  });

  return assertFound(user, "Current user was not found.");
}

export async function deleteAccount(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
}
