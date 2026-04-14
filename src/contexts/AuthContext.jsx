import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
  createProvisionedCompanyAccount,
  findAccountByEmail,
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

function loadStoredDirectory() {
  if (typeof window === "undefined") {
    return {
      companies: [],
      users: []
    };
  }

  try {
    const rawValue = window.localStorage.getItem(DIRECTORY_STORAGE_KEY);

    if (!rawValue) {
      return {
        companies: [],
        users: []
      };
    }

    const parsedValue = JSON.parse(rawValue);

    return {
      companies: Array.isArray(parsedValue?.companies) ? parsedValue.companies : [],
      users: Array.isArray(parsedValue?.users) ? parsedValue.users : []
    };
  } catch {
    return {
      companies: [],
      users: []
    };
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
    async ({ email, password, rememberMe = true }) => {
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

  const logout = useCallback(() => {
    setUser(null);
    clearAuthSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      users,
      company,
      companyUsers,
      companies,
      isBooting,
      login,
      logout,
      previewAccount,
      registerCompany
    }),
    [companies, company, companyUsers, isBooting, login, logout, previewAccount, registerCompany, user, users]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
