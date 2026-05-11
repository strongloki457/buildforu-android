import { getToken, removeToken } from "./auth.storage";

const DEFAULT_API_URL = "http://localhost:5000";

export const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status || 0;
    this.code = options.code || "API_ERROR";
    this.details = options.details || null;
  }
}

function notifyAuthExpired() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("buildforu:auth-expired"));
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData = hasBody && options.body instanceof FormData;

  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = options.auth === false ? null : getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || "GET",
      headers,
      body: hasBody ? (isFormData ? options.body : JSON.stringify(options.body)) : undefined,
    });
  } catch (error) {
    console.warn("BuildForU API request failed before receiving a response.", {
      apiBaseUrl: API_BASE_URL,
      path,
      message: error instanceof Error ? error.message : String(error),
    });
    throw new ApiError("Unable to reach the BuildForU backend.", { code: "NETWORK_ERROR" });
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      notifyAuthExpired();
    }

    const apiError = payload?.error;

    throw new ApiError(apiError?.message || "The request could not be completed.", {
      status: response.status,
      code: apiError?.code || `HTTP_${response.status}`,
      details: apiError?.details || null,
    });
  }

  return payload;
}
