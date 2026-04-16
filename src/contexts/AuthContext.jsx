import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
  createEmployeeDirectoryUser,
  createProvisionedCompanyAccount,
  findAccountByEmail,
  findUserByWorkerId,
  getPublicCompanies,
  getPublicUsers,
  getUsersForCompany,
  mergeCompanyDirectory,
  resolveSessionUser
} from "../data/mockCompanyDirectory";

export const AuthContext = createContext(null);

const LOCAL_STORAGE_KEY = "buildforu-auth";
const SESSION_STORAGE_KEY = "buildforu-auth-session";
const DIRECTORY_STORAGE_KEY = "buildforu-company-directory";

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function createSlug(value, fallback = "workspace") {
  const slug = normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

function clearAuthSession() {
  window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

function persistAuthSession(user, rememberMe) {
  clearAuthSession();
  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  const storageKey = rememberMe ? LOCAL_STORAGE_KEY : SESSION_STORAGE_KEY;
  storage.setItem(storageKey, JSON.stringify(user));
}

function readStoredSession() {
  const persistentSession = window.localStorage.getItem(LOCAL_STORAGE_KEY);

  if (persistentSession) {
    return {
      rememberMe: true,
      value: persistentSession
    };
  }

  const sessionValue = window.sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (sessionValue) {
    return {
      rememberMe: false,
      value: sessionValue
    };
  }

  return null;
}

function createEmptyDirectory() {
  return {
    companies: [],
    users: [],
    removedUserIds: []
  };
}

function loadStoredDirectory() {
  if (typeof window === "undefined") {
    return createEmptyDirectory();
  }

  try {
    const rawValue = window.localStorage.getItem(DIRECTORY_STORAGE_KEY);

    if (!rawValue) {
      return createEmptyDirectory();
    }

    const parsedValue = JSON.parse(rawValue);

    return {
      companies: Array.isArray(parsedValue?.companies) ? parsedValue.companies : [],
      users: Array.isArray(parsedValue?.users) ? parsedValue.users : [],
      removedUserIds: Array.isArray(parsedValue?.removedUserIds) ? parsedValue.removedUserIds : []
    };
  } catch {
    return createEmptyDirectory();
  }
}

function persistStoredDirectory(directory) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DIRECTORY_STORAGE_KEY, JSON.stringify(directory));
}

function resolveUniqueAdminEmail(directory, requestedEmail, companyName) {
  const normalizedEmail = normalizeEmail(requestedEmail);

  if (normalizedEmail && !findAccountByEmail(directory, normalizedEmail)) {
    return normalizedEmail;
  }

  const slug = createSlug(companyName, "workspace");
  let attempt = 0;

  while (attempt < 100) {
    const suffix = attempt === 0 ? "" : `${attempt + 1}`;
    const candidate = `admin+${slug}${suffix}@buildforu.com`;

    if (!findAccountByEmail(directory, candidate)) {
      return candidate;
    }

    attempt += 1;
  }

  return `admin+${slug}-${Date.now().toString(36)}@buildforu.com`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBooting, setIsBooting] = useState(true);
  const [storedDirectory, setStoredDirectory] = useState(loadStoredDirectory);
  const directory = useMemo(() => mergeCompanyDirectory(storedDirectory), [storedDirectory]);
  const companies = useMemo(() => getPublicCompanies(directory), [directory]);
  const users = useMemo(() => getPublicUsers(directory), [directory]);
  const company = useMemo(
    () => companies.find((item) => item.id === user?.companyId) ?? null,
    [companies, user?.companyId]
  );
  const companyUsers = useMemo(
    () => (user?.companyId ? getUsersForCompany(directory, user.companyId) : []),
    [directory, user?.companyId]
  );

  useEffect(() => {
    persistStoredDirectory(storedDirectory);
  }, [storedDirectory]);

  useEffect(() => {
    const storedSession = readStoredSession();

    if (!storedSession) {
      setIsBooting(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedSession.value);
      const resolvedUser = resolveSessionUser(directory, parsedUser);

      if (resolvedUser) {
        setUser(resolvedUser);
        persistAuthSession(resolvedUser, storedSession.rememberMe);
      } else {
        setUser(null);
        clearAuthSession();
      }
    } catch {
      setUser(null);
      clearAuthSession();
    } finally {
      setIsBooting(false);
    }
  }, [directory]);

  const login = useCallback(
    async (credentialsOrEmail, maybePassword, maybeRememberMe = true) => {
      const credentials =
        credentialsOrEmail && typeof credentialsOrEmail === "object"
          ? credentialsOrEmail
          : {
              email: credentialsOrEmail,
              password: maybePassword,
              rememberMe: maybeRememberMe
            };
      const { email, password, rememberMe = true } = credentials;

      if (!email || !password) {
        throw new Error("login.requiredError");
      }

      const matchedAccount = findAccountByEmail(directory, email);

      await new Promise((resolve) => window.setTimeout(resolve, 500));

      if (!matchedAccount || matchedAccount.user.credentials.password !== normalizeText(password)) {
        throw new Error("login.invalidCredentials");
      }

      setUser(matchedAccount.publicUser);
      persistAuthSession(matchedAccount.publicUser, rememberMe);

      return matchedAccount.publicUser;
    },
    [directory]
  );

  const registerCompany = useCallback(
    async ({ companyName, ownerName, email, password, plan }) => {
      const uniqueAdminEmail = resolveUniqueAdminEmail(directory, email, companyName);
      const provisionedAccess = createProvisionedCompanyAccount({
        companyName,
        ownerName,
        email: uniqueAdminEmail,
        password,
        plan
      });

      await new Promise((resolve) => window.setTimeout(resolve, 500));

      let nextStoredDirectory = null;
      setStoredDirectory((current) => {
        nextStoredDirectory = {
          ...current,
          companies: [...current.companies, provisionedAccess.company],
          users: [...current.users, provisionedAccess.user]
        };

        return nextStoredDirectory;
      });

      const mergedDirectory = mergeCompanyDirectory(nextStoredDirectory);
      const registeredCompany =
        getPublicCompanies(mergedDirectory).find((item) => item.id === provisionedAccess.company.id) ??
        provisionedAccess.company;
      const registeredUser = resolveSessionUser(mergedDirectory, {
        id: provisionedAccess.user.id,
        email: provisionedAccess.user.credentials.email
      });

      if (registeredUser) {
        setUser(registeredUser);
        persistAuthSession(registeredUser, true);
      }

      return {
        company: registeredCompany,
        credentials: provisionedAccess.user.credentials,
        user: registeredUser
      };
    },
    [directory]
  );

  const previewAccount = useCallback(
    (email) => {
      const account = findAccountByEmail(directory, email);
      return account?.publicUser ?? null;
    },
    [directory]
  );

  const syncWorkerUser = useCallback(
    ({ companyId, email, name, workerId, workspaceId }) => {
      const normalizedWorkerId = normalizeText(workerId);
      const normalizedEmail = normalizeEmail(email);
      const normalizedName = normalizeText(name);

      if (!normalizedWorkerId || !normalizedEmail || !normalizedName) {
        return null;
      }

      let nextStoredDirectory = null;
      let nextUserRecord = null;
      let temporaryPassword = "";
      let created = false;

      setStoredDirectory((current) => {
        const mergedCurrentDirectory = mergeCompanyDirectory(current);
        const existingWorkerAccount = findUserByWorkerId(mergedCurrentDirectory, normalizedWorkerId)?.user ?? null;

        if (existingWorkerAccount) {
          nextUserRecord = {
            ...existingWorkerAccount,
            companyId: normalizeText(companyId) || existingWorkerAccount.companyId,
            workspaceId: normalizeText(workspaceId) || existingWorkerAccount.workspaceId,
            name: normalizedName,
            avatar: existingWorkerAccount.avatar,
            credentials: {
              ...existingWorkerAccount.credentials,
              email: normalizedEmail
            }
          };
        } else {
          const createdUser = createEmployeeDirectoryUser({
            companyId,
            email: normalizedEmail,
            name: normalizedName,
            workerId: normalizedWorkerId,
            workspaceId
          });

          nextUserRecord = createdUser;
          temporaryPassword = createdUser.credentials.password;
          created = true;
        }

        const nextUsers = current.users.some((item) => item.id === nextUserRecord.id)
          ? current.users.map((item) => (item.id === nextUserRecord.id ? nextUserRecord : item))
          : [...current.users, nextUserRecord];

        nextStoredDirectory = {
          ...current,
          users: nextUsers,
          removedUserIds: (current.removedUserIds ?? []).filter((item) => item !== nextUserRecord.id)
        };

        return nextStoredDirectory;
      });

      const mergedDirectory = mergeCompanyDirectory(nextStoredDirectory ?? storedDirectory);
      const publicUser = resolveSessionUser(mergedDirectory, {
        id: nextUserRecord?.id,
        email: nextUserRecord?.credentials?.email
      });

      return {
        created,
        publicUser,
        temporaryPassword
      };
    },
    [storedDirectory]
  );

  const removeWorkerUser = useCallback(
    (workerId) => {
      const normalizedWorkerId = normalizeText(workerId);

      if (!normalizedWorkerId) {
        return false;
      }

      let wasRemoved = false;

      setStoredDirectory((current) => {
        const mergedCurrentDirectory = mergeCompanyDirectory(current);
        const linkedUser = findUserByWorkerId(mergedCurrentDirectory, normalizedWorkerId)?.user ?? null;

        if (!linkedUser) {
          return current;
        }

        wasRemoved = true;

        return {
          ...current,
          users: current.users.filter((item) => item.id !== linkedUser.id),
          removedUserIds: Array.from(new Set([...(current.removedUserIds ?? []), linkedUser.id]))
        };
      });

      if (user?.workerId === normalizedWorkerId) {
        setUser(null);
        clearAuthSession();
      }

      return wasRemoved;
    },
    [user?.workerId]
  );

  const logout = useCallback(() => {
    setUser(null);
    clearAuthSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      currentUser: user,
      role: user?.role ?? null,
      workerId: user?.workerId ?? "",
      users,
      company,
      companyUsers,
      companies,
      isBooting,
      login,
      logout,
      previewAccount,
      registerCompany,
      syncWorkerUser,
      removeWorkerUser
    }),
    [
      companies,
      company,
      companyUsers,
      isBooting,
      login,
      logout,
      previewAccount,
      registerCompany,
      removeWorkerUser,
      syncWorkerUser,
      user,
      users
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
