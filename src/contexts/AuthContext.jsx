import { createContext, useEffect, useMemo, useState } from "react";
import { mockUsers } from "../data/mockData";

export const AuthContext = createContext(null);

const STORAGE_KEY = "buildforu-auth";

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
    const savedUser = window.localStorage.getItem(STORAGE_KEY);

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    setIsBooting(false);
  }, []);

  const login = async ({ email, password }) => {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const matchedUser = resolveUser(email);

    await new Promise((resolve) => window.setTimeout(resolve, 900));
    setUser(matchedUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(matchedUser));

    return matchedUser;
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
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
