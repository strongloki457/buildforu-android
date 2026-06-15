import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthContext } from "../types/api";

export type AccessTokenPayload = {
  userId: string;
  role: AuthContext["role"];
  companyId: string;
  workerId: string | null;
};

export type RefreshTokenPayload = {
  userId: string;
  companyId?: string;
  role?: string;
};

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}

export function signRefreshToken(payload: RefreshTokenPayload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]
  });
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
