import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthContext } from "../types/api";

export type AccessTokenPayload = {
  userId: string;
  role: AuthContext["role"];
  companyId: string;
  workerId: string | null;
};

export function signAccessToken(payload: AccessTokenPayload) {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}
