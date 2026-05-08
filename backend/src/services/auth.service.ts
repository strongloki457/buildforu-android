import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { LoginInput, RegisterCompanyInput } from "../validators/auth.validators";
import { AppError, assertFound } from "../utils/errors";
import { signAccessToken } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/password";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  companyId: true,
  workerId: true,
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

function buildAuthResponse(user: PublicUserRecord) {
  const token = signAccessToken({
    userId: user.id,
    role: user.role,
    companyId: user.companyId,
    workerId: user.workerId
  });

  return {
    token,
    user
  };
}

export async function registerCompany(input: RegisterCompanyInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
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
        email: input.email,
        passwordHash,
        role: Role.ADMIN,
        companyId: company.id
      },
      select: publicUserSelect
    });
  });

  return buildAuthResponse(user);
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
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
    throw new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
  }

  const passwordMatches = await verifyPassword(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
  }

  const { passwordHash: _passwordHash, ...publicUser } = user;
  return buildAuthResponse(publicUser);
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect
  });

  return assertFound(user, "Current user was not found.");
}
