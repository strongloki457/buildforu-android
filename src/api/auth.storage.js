const TOKEN_KEY = "buildforu-auth-token";
const USER_KEY = "buildforu-auth-user";

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (!token) {
    removeToken();
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser() {
  const rawUser = window.localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setStoredUser(user) {
  if (!user) {
    window.localStorage.removeItem(USER_KEY);
    return;
  }

  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  removeToken();
  window.localStorage.removeItem(USER_KEY);
}
