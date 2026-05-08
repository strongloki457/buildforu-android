import type { AuthContext } from "./api";

declare global {
  namespace Express {
    interface Request {
      user?: AuthContext;
    }
  }
}

export {};
