import bcrypt from "bcrypt";
import crypto from "crypto";

const BCRYPT_ROUNDS = 12;

export function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function generateTemporaryPassword() {
  return crypto.randomBytes(12).toString("base64url");
}
