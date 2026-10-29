import type { Paginated } from '../types/api';

export const API_BASE = 'https://arrowapi-813344430767.asia-southeast1.run.app';
export const SESSION_EXPIRED_EVENT = 'av:session-expired';

const ACCESS_KEY = 'av_access';
const REFRESH_KEY = 'av_refresh';
const GUEST_KEY = 'av_guest_token';

function createGuestToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export const tokenStore = {
  getAccess: (): string | null => localStorage.getItem(ACCESS_KEY),
  getRefresh: (): string | null => localStorage.getItem(REFRESH_KEY),
  setTokens(access: string, refresh?: string) {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clearTokens() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
  getGuest(): string {
    let token = localStorage.getItem(GUEST_KEY);
    if (!token) {
      token = createGuestToken();
      localStorage.setItem(GUEST_KEY, token);
    }
    return token;
  },
  setGuest(token: string) {
    localStorage.setItem(GUEST_KEY, token);
  },
  resetGuest() {
    localStorage.setItem(GUEST_KEY, createGuestToken());
  }
};

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  form?: FormData;
  query?: Record<string, QueryValue>;
  auth?: boolean;
  guest?: boolean;
}

const NETWORK_MESSAGE = 'Unable to reach the Arrow Ventures server. Check your connection and try again.';

let refreshing: Promise<boolean> | null = null;

function refreshAccess(): Promise<boolean> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return Promise.resolve(false);
  if (!refreshing) {
    refreshing = fetch(`${API_BASE}/api/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refresh })
    }).
    then(async (res) => {
      if (!res.ok) return false;
      const data = (await res.json()) as {access?: string;refresh?: string;};
      if (!data.access) return false;
      tokenStore.setTokens(data.access, data.refresh);
      return true;
    }).
    catch(() => false).
    finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${API_BASE}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

function prettyField(key: string): string {
  return key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

function extractError(payload: unknown, status: number): {message: string;fieldErrors: Record<string, string[]>;} {
  const fieldErrors: Record<string, string[]> = {};
  if (payload && typeof payload === 'object') {
    const p = payload as Record<string, unknown>;
    const source = p.errors && typeof p.errors === 'object' ? p.errors as Record<string, unknown> : p;
    Object.entries(source).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length && value.every((v) => typeof v === 'string')) {
        fieldErrors[key] = value as string[];
      } else if (typeof value === 'string' && key !== 'detail' && key !== 'message' && key !== 'code') {
        if (source !== p) fieldErrors[key] = [value];
      }
    });
    if (typeof p.detail === 'string') return { message: p.detail, fieldErrors };
    if (typeof p.message === 'string') return { message: p.message, fieldErrors };
    const first = Object.entries(fieldErrors)[0];
    if (first) {
      const [key, messages] = first;
      const message = key === 'non_field_errors' ? messages[0] : `${prettyField(key)}: ${messages[0]}`;
      return { message, fieldErrors };
    }
  }
  if (typeof payload === 'string' && payload.length < 200 && !payload.trim().startsWith('<')) {
    return { message: payload, fieldErrors };
  }
  if (status === 404) return { message: 'We could not find what you were looking for.', fieldErrors };
  if (status >= 500) return { message: 'The server ran into a problem. Please try again shortly.', fieldErrors };
  return { message: `Request failed (${status}).`, fieldErrors };
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { method = 'GET', body, form, query, auth = false, guest = false } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  const access = tokenStore.getAccess();
  if (auth && access) headers.Authorization = `Bearer ${access}`;
  if (guest && !access) headers['X-Guest-Token'] = tokenStore.getGuest();
  if (body !== undefined && !form) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined)
    });
  } catch {
    throw new ApiError(NETWORK_MESSAGE, 0);
  }

  if (res.status === 401 && auth && access && !isRetry) {
    const refreshed = await refreshAccess();
    if (refreshed) return apiRequest<T>(path, options, true);
    tokenStore.clearTokens();
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const { message, fieldErrors } = extractError(payload, res.status);
    throw new ApiError(message, res.status, fieldErrors);
  }
  return payload as T;
}

export async function downloadFile(path: string, filename: string, query?: Record<string, QueryValue>): Promise<void> {
  const headers: Record<string, string> = {};
  const access = tokenStore.getAccess();
  if (access) headers.Authorization = `Bearer ${access}`;
  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), { headers });
  } catch {
    throw new ApiError(NETWORK_MESSAGE, 0);
  }
  if (!res.ok) {
    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
    const { message } = extractError(payload, res.status);
    throw new ApiError(message, res.status);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function toList<T>(data: T[] | Paginated<T> | null | undefined): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : data.results ?? [];
}

export function toPage<T>(data: T[] | Paginated<T>): Paginated<T> {
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  return Object.fromEntries(Object.entries(error.fieldErrors).map(([k, v]) => [k, v[0]]));
}