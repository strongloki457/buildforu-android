import { createContext, useEffect, useMemo, useState } from "react";
import { mockUsers } from "../data/mockData";

export const AuthContext = createContext(null);

const LOCAL_STORAGE_KEY = "buildforu-auth";
const SESSION_STORAGE_KEY = "buildforu-auth-session";

function resolveUser(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const exactMatch = mockUsers.find((user) => user.email === normalizedEmail);

  if (exactMatch) {
    return exactMatch;
  }

  if (normalizedEmail.includes("boss") || normalizedEmail.includes("admin")) {
    return mockUsers.find((user) => user.role === "admin");
  }

  return mockUsers.find((user) => user.role === "employee");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const savedUser =
      window.localStorage.getItem(LOCAL_STORAGE_KEY) ||
      window.sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    setIsBooting(false);
  }, []);

  const login = async ({ email, password, rememberMe = true }) => {
    if (!email || !password) {
      throw new Error("login.requiredError");
    }

    const matchedUser = resolveUser(email);

    await new Promise((resolve) => window.setTimeout(resolve, 900));
    setUser(matchedUser);
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);

    const storage = rememberMe ? window.localStorage : window.sessionStorage;
    const storageKey = rememberMe ? LOCAL_STORAGE_KEY : SESSION_STORAGE_KEY;
    storage.setItem(storageKey, JSON.stringify(matchedUser));

    return matchedUser;
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      isBooting,
      login,
      logout
    }),
    [user, isBooting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
