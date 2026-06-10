import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth.api";
import { ApiError, apiRequest } from "../api/client";
import {
  clearStoredAuth,
  getStoredUser,
  setStoredUser,
  shouldRememberSession,
} from "../api/auth.storage";

export const AuthContext = createContext(null);

function normalizeRole(role) {
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (normalizedRole === "admin") {
    return "admin";
  }

  if (normalizedRole === "employee") {
    return "employee";
  }

  return null;
}

function createInitials(name = "") {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "BU";
}

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function normalizeApiUser(apiUser) {
  if (!apiUser) {
    return null;
  }

  const role = normalizeRole(apiUser.role);
  const company = apiUser.company || null;
  const apiCompanyId = apiUser.companyId || company?.id || null;
  const apiWorkerId = apiUser.workerId || null;

  if (!apiUser.id || !apiUser.email || !role || !apiCompanyId) {
    return null;
  }

  return {
    ...apiUser,
    role,
    company,
    companyId: apiCompanyId,
    apiCompanyId,
    workerId: apiWorkerId,
    apiWorkerId,
    workspaceId: apiUser.workspaceId || apiCompanyId || "",
    workspaceName: apiUser.workspaceName || company?.name || apiUser.companyName || "BuildForU",
    companyName: apiUser.companyName || company?.name || "BuildForU",
    plan: apiUser.plan || company?.plan || "pro",
    avatarUrl: apiUser.avatarUrl || null,
    avatar: apiUser.avatar || createInitials(apiUser.name),
    title: apiUser.title || (role === "admin" ? "Company Admin" : "Employee"),
    isApiBacked: true,
    mockCompanyId: null,
    mockWorkspaceId: null,
  };
}

function authErrorKey(error, context = "login") {
  if (error instanceof ApiError) {
    if (error.code === "NETWORK_ERROR") {
      return context === "register" ? "register.networkError" : "login.networkError";
    }

    if (error.status === 503 || error.code === "DATABASE_UNAVAILABLE") {
      return context === "register" ? "register.databaseUnavailable" : "login.databaseUnavailable";
    }

    if (error.status === 401) {
      return "login.invalidCredentials";
    }

    if (error.status === 429 || error.code === "RATE_LIMITED") {
      return context === "register" ? "register.rateLimited" : "login.rateLimited";
    }

    if (context === "register") {
      if (error.status === 409 || error.code === "EMAIL_IN_USE" || error.code === "UNIQUE_CONSTRAINT") {
        return "register.emailInUse";
      }

      if (error.status === 400 || error.code === "VALIDATION_ERROR") {
        if (error.details?.fieldErrors?.password?.length) {
          return "register.passwordInvalid";
        }

        if (error.details?.fieldErrors?.email?.length) {
          return "register.validation.emailInvalid";
        }

        return "register.validationError";
      }

      return "register.serverError";
    }

    if (error.status === 400 || error.code === "VALIDATION_ERROR") {
      return "login.validationError";
    }

    return "login.serverError";
  }

  return error?.message || "login.serverError";
}

function mergeCompanyUser(list, nextUser) {
  if (!nextUser) {
    return list;
  }

  const exists = list.some((member) => member.id === nextUser.id || member.email === nextUser.email);

  if (exists) {
    return list.map((member) => (member.id === nextUser.id || member.email === nextUser.email ? { ...member, ...nextUser } : member));
  }

  return [...list, nextUser];
}

export function AuthProvider({ children }) {
  const initialStoredUser = getStoredUser();
  const [user, setUser] = useState(() => initialStoredUser);
  const [isLoading, setIsLoading] = useState(true);
  const [companyUsers, setCompanyUsers] = useState(() => (initialStoredUser ? [initialStoredUser] : []));

  const persistSession = useCallback((apiUser, options = {}) => {
    const normalizedUser = normalizeApiUser(apiUser);
    const remember = options.remember !== false;

    if (!normalizedUser) {
      clearStoredAuth();
      setUser(null);
      setCompanyUsers([]);
      return null;
    }

    setStoredUser(normalizedUser, remember);
    setUser(normalizedUser);
    setCompanyUsers((members) => mergeCompanyUser(members, normalizedUser));

    return normalizedUser;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      try {
        const response = await authApi.me();
        const normalizedUser = normalizeApiUser(response.user);

        if (!normalizedUser) {
          throw new Error("login.sessionExpired");
        }

        setStoredUser(normalizedUser, shouldRememberSession());

        if (isMounted) {
          setUser(normalizedUser);
          setCompanyUsers((members) => mergeCompanyUser(members, normalizedUser));
        }
      } catch (error) {
        const isNetworkError = error instanceof ApiError && error.code === "NETWORK_ERROR";

        if (!isNetworkError && isMounted) {
          // Only clear if login hasn't already set a user while this bootstrap was in-flight
          setUser((current) => {
            if (current !== null) return current;
            clearStoredAuth();
            return null;
          });
          setCompanyUsers((current) => (current.length > 0 ? current : []));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [persistSession]);

  useEffect(() => {
    const handleAuthExpired = () => {
      clearStoredAuth();
      setUser(null);
      setCompanyUsers([]);
    };

    window.addEventListener("buildforu:auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("buildforu:auth-expired", handleAuthExpired);
    };
  }, []);

  const login = useCallback(
    async ({ email, password, rememberMe = true }) => {
      try {
        const response = await authApi.login({ email: normalizeEmail(email), password, rememberMe });
        return persistSession(response.user, { remember: rememberMe });
      } catch (error) {
        throw new Error(authErrorKey(error, "login"));
      }
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore — clear local state regardless
    }
    clearStoredAuth();
    setUser(null);
    setCompanyUsers([]);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((current) => {
      if (!current) return current;
      const updated = normalizeApiUser({ ...current, ...patch });
      if (updated) setStoredUser(updated, shouldRememberSession());
      return updated;
    });
  }, []);

  const registerCompany = useCallback(
    async ({ companyName, ownerName, email, password, plan }) => {
      try {
        const response = await authApi.registerCompany({
          companyName,
          name: ownerName || `${companyName} Admin`,
          email: normalizeEmail(email),
          password,
          plan,
        });
        const registeredUser = persistSession(response.user, { remember: true });

        return {
          company: registeredUser?.company,
          credentials: { email },
          user: registeredUser,
        };
      } catch (error) {
        throw new Error(authErrorKey(error, "register"));
      }
    },
    [persistSession],
  );

  const company = useMemo(() => {
    if (!user) {
      return null;
    }

    return {
      id: user.companyId,
      apiCompanyId: user.apiCompanyId,
      workspaceId: user.workspaceId,
      name: user.companyName,
      plan: user.plan,
    };
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      currentUser: user,
      role: user?.role || null,
      workerId: user?.workerId || null,
      apiWorkerId: user?.apiWorkerId || null,
      users: companyUsers,
      companyUsers,
      companies: company ? [company] : [],
      company,
      isAuthenticated: Boolean(user),
      isLoading,
      isBooting: isLoading,
      login,
      logout,
      registerCompany,
      updateUser,
    }),
    [
      company,
      companyUsers,
      isLoading,
      login,
      logout,
      registerCompany,
      updateUser,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
