const TOKEN_KEY = "buildforu-auth-token";
const REFRESH_TOKEN_KEY = "buildforu-refresh-token";
const USER_KEY = "buildforu-auth-user";

function getStorage(preferSession = false) {
  return preferSession ? window.sessionStorage : window.localStorage;
}

function getStoredValue(key) {
  return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
}

function setStoredValue(key, value, remember = true) {
  const primaryStorage = getStorage(!remember);
  const secondaryStorage = getStorage(remember);

  secondaryStorage.removeItem(key);
  primaryStorage.setItem(key, value);
}

function removeStoredValue(key) {
  window.localStorage.removeItem(key);
  window.sessionStorage.removeItem(key);
}

export function getToken() {
  return getStoredValue(TOKEN_KEY);
}

export function shouldRememberSession() {
  return Boolean(window.localStorage.getItem(TOKEN_KEY));
}

export function setToken(token, remember = true) {
  if (!token) {
    removeToken();
    return;
  }

  setStoredValue(TOKEN_KEY, token, remember);
}

export function removeToken() {
  removeStoredValue(TOKEN_KEY);
}

export function getRefreshToken() {
  return getStoredValue(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token, remember = true) {
  if (!token) {
    removeStoredValue(REFRESH_TOKEN_KEY);
    return;
  }
  setStoredValue(REFRESH_TOKEN_KEY, token, remember);
}

export function removeRefreshToken() {
  removeStoredValue(REFRESH_TOKEN_KEY);
}

export function getStoredUser() {
  const rawUser = getStoredValue(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    removeStoredValue(USER_KEY);
    return null;
  }
}

export function setStoredUser(user, remember = true) {
  if (!user) {
    removeStoredValue(USER_KEY);
    return;
  }

  setStoredValue(USER_KEY, JSON.stringify(user), remember);
}

export function clearStoredAuth() {
  removeToken();
  removeRefreshToken();
  removeStoredValue(USER_KEY);
}
