import type { ValidationErrorDetail } from '@/types';

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
).replace(/\/+$/, '');

const TOKEN_KEY = 'store_access_token';
export const AUTH_EXPIRED_EVENT = 'store:auth-expired';

interface ErrorEnvelope {
  error?: {
    code?: string;
    message?: string;
    details?: ValidationErrorDetail[];
  };
}

interface DataEnvelope<T> {
  data: T;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details: ValidationErrorDetail[];

  constructor(
    status: number,
    code: string,
    message: string,
    details: ValidationErrorDetail[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function validationErrorsByField(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || error.code !== 'INVALID_INPUT') return {};

  return Object.fromEntries(
    error.details.map(({ field, message }) => [
      field.replace(/^(body|params|query)\./, ''),
      message,
    ]),
  );
}

class ApiClient {
  constructor(private readonly baseUrl: string) {}

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    const isFormData = options.body instanceof FormData;
    const token = getAccessToken();

    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (options.body !== undefined && !isFormData) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 204) return undefined as T;

    const payload = (await response.json().catch(() => null)) as
      | DataEnvelope<T>
      | ErrorEnvelope
      | null;

    if (!response.ok) {
      const error = payload && 'error' in payload ? payload.error : undefined;
      const apiError = new ApiError(
        response.status,
        error?.code ?? 'UNKNOWN_ERROR',
        error?.message ?? `Request failed (${response.status})`,
        error?.details ?? [],
      );

      if (response.status === 401 && apiError.code === 'UNAUTHORIZED') {
        clearAccessToken();
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      }

      throw apiError;
    }

    if (payload && 'data' in payload) return payload.data;
    return payload as T;
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data === undefined
        ? undefined
        : data instanceof FormData
          ? data
          : JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  delete(endpoint: string): Promise<void> {
    return this.request<void>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);

export const endpoints = {
  health: '/health',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  users: {
    me: '/users/me',
  },
  products: {
    list: '/products',
    create: '/products',
    detail: (productId: string) => `/products/${productId}`,
    update: (productId: string) => `/products/${productId}`,
    image: (productId: string) => `/products/${productId}/image`,
    delete: (productId: string) => `/products/${productId}`,
  },
  cart: {
    get: '/cart',
    addItem: '/cart/items',
    updateItem: (productId: string) => `/cart/items/${productId}`,
    removeItem: (productId: string) => `/cart/items/${productId}`,
  },
  checkout: '/checkout',
  orders: {
    list: '/orders',
    detail: (orderId: string) => `/orders/${orderId}`,
  },
} as const;
