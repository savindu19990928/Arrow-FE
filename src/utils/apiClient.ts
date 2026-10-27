import type { Paginated } from '../types/api';

export const API_BASE_URL = 'https://arrowapi-813344430767.asia-southeast1.run.app';
export const SESSION_EXPIRED_EVENT = 'av:session-expired';

const ACCESS_KEY = 'av.access';
const REFRESH_KEY = 'av.refresh';
const GUEST_KEY = 'av.guestToken';

type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  formData?: FormData;
  query?: Record<string, QueryValue>;
  auth?: boolean;
}

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
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
  getGuestToken(): string {
    let token = localStorage.getItem(GUEST_KEY);
    if (!token) {
      token = generateToken();
      localStorage.setItem(GUEST_KEY, token);
    }
    return token;
  },
  peekGuestToken: (): string | null => localStorage.getItem(GUEST_KEY),
  setGuestToken(token: string) {
    localStorage.setItem(GUEST_KEY, token);
  },
  clearGuestToken() {
    localStorage.removeItem(GUEST_KEY);
  }
};

export function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(path, API_BASE_URL);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

let refreshPromise: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return Promise.resolve(null);
  if (!refreshPromise) {
    refreshPromise = fetch(buildUrl('/api/auth/refresh/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refresh })
    }).
    then(async (res) => {
      if (!res.ok) return null;
      const data = (await res.json()) as {access?: string;refresh?: string;};
      if (!data.access) return null;
      tokenStore.setTokens(data.access, data.refresh);
      return data.access;
    }).
    catch(() => null).
    finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function buildHeaders(opts: RequestOptions, token: string | null): Headers {
  const headers = new Headers({ Accept: 'application/json' });
  if (opts.body !== undefined && !opts.formData) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);else
  headers.set('X-Guest-Token', tokenStore.getGuestToken());
  return headers;
}

async function rawFetch(path: string, opts: RequestOptions): Promise<Response> {
  const token = opts.auth === false ? null : tokenStore.getAccess();
  const run = (tok: string | null) =>
  fetch(buildUrl(path, opts.query), {
    method: opts.method ?? 'GET',
    headers: buildHeaders(opts, tok),
    body: opts.formData ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined)
  });

  let res: Response;
  try {
    res = await run(token);
    if (res.status === 401 && token) {
      const fresh = await refreshAccessToken();
      if (fresh) {
        res = await run(fresh);
      } else {
        tokenStore.clearTokens();
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
    }
  } catch {
    throw new ApiError(
      'We couldn’t reach the Arrow Ventures servers. Check your connection and try again.',
      0
    );
  }
  return res;
}

function toApiError(status: number, data: unknown): ApiError {
  const fallback =
  status >= 500 ?
  'Something went wrong on our side. Please try again shortly.' :
  status === 404 ?
  'We couldn’t find what you were looking for.' :
  `Request failed (${status}).`;

  if (!data || typeof data !== 'object') {
    const text = typeof data === 'string' && data.length < 200 && !data.startsWith('<') ? data : '';
    return new ApiError(text || fallback, status);
  }

  const record = data as Record<string, unknown>;
  const source =
  record.errors && typeof record.errors === 'object' ?
  record.errors as Record<string, unknown> :
  record;
  const fieldErrors: Record<string, string[]> = {};
  Object.entries(source).forEach(([key, value]) => {
    if (['success', 'code', 'detail', 'message'].includes(key)) return;
    if (Array.isArray(value)) fieldErrors[key] = value.map(String);else
    if (typeof value === 'string' && source !== record) fieldErrors[key] = [value];
  });

  const firstField = Object.values(fieldErrors)[0]?.[0];
  const message =
  typeof record.detail === 'string' && record.detail ||
  typeof record.message === 'string' && record.message ||
  firstField ||
  fallback;
  return new ApiError(message, status, fieldErrors);
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const res = await rawFetch(path, opts);
  const data = await parseBody(res);
  if (!res.ok) throw toApiError(res.status, data);
  return data as T;
}

export async function apiBlob(path: string, opts: RequestOptions = {}): Promise<Blob> {
  const res = await rawFetch(path, opts);
  if (!res.ok) throw toApiError(res.status, await parseBody(res));
  return res.blob();
}

export function toList<T>(data: T[] | Paginated<T> | null | undefined): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : data.results ?? [];
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function generateToken(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}