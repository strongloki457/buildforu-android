const seedCompanies = [
  {
    id: "company-1",
    workspaceId: "workspace-1",
    name: "BuildForU Demo Construction",
    legalName: "BuildForU Demo Construction GmbH",
    plan: "enterprise",
    subscriptionStatus: "active",
    country: "Germany"
  }
];

const seedUsers = [
  {
    id: "u-admin-1",
    companyId: "company-1",
    workspaceId: "workspace-1",
    role: "admin",
    name: "Sophie Carter",
    title: "Operations Director",
    titleKey: "seed.users.u-admin-1.title",
    avatar: "SC",
    credentials: {
      email: "admin@buildforu.com",
      password: "admin123"
    }
  },
  {
    id: "u-employee-1",
    companyId: "company-1",
    workspaceId: "workspace-1",
    role: "employee",
    workerId: "u-employee-1",
    name: "Alex Novak",
    title: "Site Supervisor",
    titleKey: "seed.users.u-employee-1.title",
    avatar: "AN",
    credentials: {
      email: "worker@buildforu.com",
      password: "worker123"
    }
  }
];

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

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

function createInitials(name) {
  const letters = normalizeText(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return letters || "BF";
}

function normalizePlan(value) {
  const normalizedValue = normalizeText(value).toLowerCase();
  return ["starter", "pro", "enterprise"].includes(normalizedValue) ? normalizedValue : "pro";
}

function normalizeIdList(values) {
  return Array.isArray(values) ? Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean))) : [];
}

function createTemporaryPassword() {
  return Math.random().toString(36).slice(2, 8).padEnd(6, "0");
}

function buildCompanyMembership(directory, companyId) {
  const companyUsers = directory.users.filter((user) => user.companyId === companyId);

  return {
    adminCount: companyUsers.filter((user) => user.role === "admin").length,
    employeeCount: companyUsers.filter((user) => user.role === "employee").length
  };
}

function buildPublicCompany(directory, company) {
  return {
    ...company,
    ...buildCompanyMembership(directory, company.id)
  };
}

export function buildPublicUser(directory, user) {
  const company = directory.companies.find((item) => item.id === user.companyId) ?? null;
  const { credentials, ...publicUser } = user;

  return {
    ...publicUser,
    email: credentials.email,
    companyName: company?.name ?? "",
    workspaceId: company?.workspaceId ?? user.workspaceId ?? "",
    workspaceName: company?.name ?? "",
    plan: company?.plan ?? "pro"
  };
}

function normalizeStoredCompany(company) {
  const name = normalizeText(company?.name);

  if (!name) {
    return null;
  }

  return {
    id: normalizeText(company.id) || `company-${createSlug(name)}`,
    workspaceId:
      normalizeText(company.workspaceId) || `workspace-${createSlug(company.workspaceId || company.id || name)}`,
    name,
    legalName: normalizeText(company.legalName) || name,
    plan: normalizePlan(company.plan),
    subscriptionStatus: normalizeText(company.subscriptionStatus) || "active",
    country: normalizeText(company.country) || ""
  };
}

function normalizeStoredUser(user) {
  const email = normalizeEmail(user?.credentials?.email ?? user?.email);
  const password = normalizeText(user?.credentials?.password ?? user?.password);
  const role = normalizeText(user?.role).toLowerCase() === "admin" ? "admin" : "employee";

  if (!email || !password || !normalizeText(user?.companyId) || !normalizeText(user?.name)) {
    return null;
  }

  return {
    id: normalizeText(user.id) || `user-${role}-${createSlug(user.name)}`,
    companyId: normalizeText(user.companyId),
    workspaceId: normalizeText(user.workspaceId),
    role,
    workerId: role === "employee" ? normalizeText(user.workerId || user.id) : "",
    name: normalizeText(user.name),
    title: normalizeText(user.title) || (role === "admin" ? "Company Admin" : "Employee"),
    titleKey: null,
    avatar: normalizeText(user.avatar) || createInitials(user.name),
    credentials: {
      email,
      password
    }
  };
}

function createMap(items) {
  return new Map(items.map((item) => [item.id, item]));
}

export function getSeedCompanyDirectory() {
  return {
    companies: cloneValue(seedCompanies),
    users: cloneValue(seedUsers),
    removedUserIds: []
  };
}

export function mergeCompanyDirectory(storedDirectory = {}) {
  const normalizedCompanies = Array.isArray(storedDirectory.companies)
    ? storedDirectory.companies.map((company) => normalizeStoredCompany(company)).filter(Boolean)
    : [];
  const normalizedUsers = Array.isArray(storedDirectory.users)
    ? storedDirectory.users.map((user) => normalizeStoredUser(user)).filter(Boolean)
    : [];
  const removedUserIds = normalizeIdList(storedDirectory.removedUserIds);
  const removedUserIdSet = new Set(removedUserIds);
  const seedDirectory = getSeedCompanyDirectory();
  const companyMap = createMap(seedDirectory.companies);

  normalizedCompanies.forEach((company) => {
    companyMap.set(company.id, company);
  });

  const validCompanyIds = new Set(companyMap.keys());
  const userMap = createMap(seedDirectory.users.filter((user) => !removedUserIdSet.has(user.id)));

  normalizedUsers.forEach((user) => {
    if (validCompanyIds.has(user.companyId) && !removedUserIdSet.has(user.id)) {
      userMap.set(user.id, user);
    }
  });

  return {
    companies: [...companyMap.values()],
    users: [...userMap.values()],
    removedUserIds
  };
}

export function getSeedPublicCompanies() {
  const directory = getSeedCompanyDirectory();
  return directory.companies.map((company) => buildPublicCompany(directory, company));
}

export function getSeedPublicUsers() {
  const directory = getSeedCompanyDirectory();
  return directory.users.map((user) => buildPublicUser(directory, user));
}

export function getPublicCompanies(directory) {
  return directory.companies.map((company) => buildPublicCompany(directory, company));
}

export function getPublicUsers(directory) {
  return directory.users.map((user) => buildPublicUser(directory, user));
}

export function findAccountByEmail(directory, email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  const user = directory.users.find((item) => normalizeEmail(item.credentials.email) === normalizedEmail);

  if (!user) {
    return null;
  }

  const company = directory.companies.find((item) => item.id === user.companyId) ?? null;

  return {
    company,
    publicCompany: company ? buildPublicCompany(directory, company) : null,
    publicUser: buildPublicUser(directory, user),
    user
  };
}

export function findUserByWorkerId(directory, workerId) {
  const normalizedWorkerId = normalizeText(workerId);

  if (!normalizedWorkerId) {
    return null;
  }

  const user = directory.users.find((item) => item.role === "employee" && normalizeText(item.workerId) === normalizedWorkerId);

  if (!user) {
    return null;
  }

  return {
    publicUser: buildPublicUser(directory, user),
    user
  };
}

export function resolveSessionUser(directory, sessionUser) {
  const userId = normalizeText(sessionUser?.id);

  if (userId) {
    const matchedUser = directory.users.find((item) => item.id === userId);

    if (matchedUser) {
      return buildPublicUser(directory, matchedUser);
    }
  }

  const account = findAccountByEmail(directory, sessionUser?.email);
  return account?.publicUser ?? null;
}

export function getUsersForCompany(directory, companyId) {
  return getPublicUsers(directory).filter((user) => user.companyId === companyId);
}

export function createProvisionedCompanyAccount({ companyName, ownerName, email, password, plan }) {
  const normalizedCompanyName = normalizeText(companyName) || "New Company";
  const slug = createSlug(normalizedCompanyName, "company");
  const uniqueSuffix = Date.now().toString(36);
  const adminName = normalizeText(ownerName) || `${normalizedCompanyName} Admin`;
  const companyId = `company-${slug}-${uniqueSuffix}`;
  const workspaceId = `workspace-${slug}-${uniqueSuffix}`;
  const adminEmail = normalizeEmail(email) || `admin+${slug}@buildforu.com`;
  const adminPassword = normalizeText(password) || `setup-${slug}`;
  const company = {
    id: companyId,
    workspaceId,
    name: normalizedCompanyName,
    legalName: normalizedCompanyName,
    plan: normalizePlan(plan),
    subscriptionStatus: "trial",
    country: ""
  };
  const user = {
    id: `u-admin-${uniqueSuffix}`,
    companyId,
    workspaceId,
    role: "admin",
    workerId: "",
    name: adminName,
    title: "Company Admin",
    titleKey: null,
    avatar: createInitials(adminName),
    credentials: {
      email: adminEmail,
      password: adminPassword
    }
  };

  return {
    company,
    user
  };
}

export function createEmployeeDirectoryUser({ companyId, email, name, password, workerId, workspaceId }) {
  const normalizedName = normalizeText(name) || "Employee";
  const normalizedWorkerId = normalizeText(workerId);

  return {
    id: normalizedWorkerId || `u-employee-${Date.now().toString(36)}`,
    companyId: normalizeText(companyId) || "company-1",
    workspaceId: normalizeText(workspaceId) || "workspace-1",
    role: "employee",
    workerId: normalizedWorkerId,
    name: normalizedName,
    title: "Employee",
    titleKey: null,
    avatar: createInitials(normalizedName),
    credentials: {
      email: normalizeEmail(email),
      password: normalizeText(password) || createTemporaryPassword()
    }
  };
}

export const mockCompanyDirectory = getSeedCompanyDirectory();
export const mockCompanies = getSeedPublicCompanies();
export const mockUsers = getSeedPublicUsers();
export const mockDemoAccounts = seedUsers.map((user) => {
  const company = seedCompanies.find((item) => item.id === user.companyId);

  return {
    email: user.credentials.email,
    password: user.credentials.password,
    role: user.role,
    name: user.name,
    companyName: company?.name ?? ""
  };
});
