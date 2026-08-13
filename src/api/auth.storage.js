import { Capacitor } from "@capacitor/core";

const USER_KEY = "buildforu-auth-user";
const TOKEN_KEY = "buildforu-auth-token";
const REFRESH_KEY = "buildforu-auth-refresh";

// On web, the frontend and api.buildforu.eu share the same registrable domain, so the
// SameSite=Lax httpOnly refresh cookie is sent automatically — the refresh token never
// needs to touch JS there, which keeps it out of reach of XSS.
// The native Capacitor build serves the app from a different origin (https://localhost),
// which is cross-site relative to api.buildforu.eu, so SameSite=Lax silently drops that
// cookie on refresh requests. Only on native do we fall back to storing the refresh token
// ourselves and sending it in the request body (see src/api/client.js).
const isNativeApp = Capacitor.isNativePlatform();

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
  return window.localStorage.getItem(TOKEN_KEY) !== null;
}

export function getStoredToken() {
  return getStoredValue(TOKEN_KEY);
}

export function setStoredToken(token, remember = true) {
  if (!token) { removeStoredValue(TOKEN_KEY); return; }
  setStoredValue(TOKEN_KEY, token, remember);
}

export function getStoredRefreshToken() {
  if (!isNativeApp) return null;
  return getStoredValue(REFRESH_KEY);
}

export function setStoredRefreshToken(token, remember = true) {
  if (!isNativeApp) return;
  if (!token) { removeStoredValue(REFRESH_KEY); return; }
  setStoredValue(REFRESH_KEY, token, remember);
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
  removeStoredValue(TOKEN_KEY);
  removeStoredValue(REFRESH_KEY);
}
