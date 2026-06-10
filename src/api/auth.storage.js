const USER_KEY = "buildforu-auth-user";

function getStoredValue(key) {
  return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
}

function setStoredValue(key, value, remember = true) {
  const primary = remember ? window.localStorage : window.sessionStorage;
  const secondary = remember ? window.sessionStorage : window.localStorage;
  secondary.removeItem(key);
  primary.setItem(key, value);
}

function removeStoredValue(key) {
  window.localStorage.removeItem(key);
  window.sessionStorage.removeItem(key);
}

export function shouldRememberSession() {
  // Kept for compatibility — cookies handle remember-me on the backend now
  return true;
}

export function getToken() {
  // Tokens live in httpOnly cookies — not accessible from JS
  return null;
}

export function getStoredUser() {
  const rawUser = getStoredValue(USER_KEY);
  if (!rawUser) return null;
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
  removeStoredValue(USER_KEY);
  // Tokens are cleared by the backend /api/auth/logout endpoint
}
