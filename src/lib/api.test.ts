// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api, clearAccessToken, setAccessToken } from '@/lib/api';

describe('api client', () => {
  beforeEach(() => {
    clearAccessToken();
    vi.restoreAllMocks();
  });

  it('unwraps data envelopes and adds the bearer token', async () => {
    setAccessToken('test-token');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: { id: '12' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(api.get<{ id: string }>('/products/12')).resolves.toEqual({ id: '12' });

    const [, request] = fetchMock.mock.calls[0];
    expect(new Headers(request?.headers).get('Authorization')).toBe('Bearer test-token');
  });

  it('returns undefined without parsing a 204 response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));

    await expect(api.delete('/cart/items/12')).resolves.toBeUndefined();
  });

  it('returns successful responses that do not use a data envelope', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(api.get<{ status: string }>('/health')).resolves.toEqual({ status: 'ok' });
  });

  it('lets the browser set the multipart boundary for image uploads', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: { id: '12' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const formData = new FormData();
    formData.append('image', new Blob(['image'], { type: 'image/webp' }), 'product.webp');

    await api.post('/products/12/image', formData);

    const [, request] = fetchMock.mock.calls[0];
    expect(new Headers(request?.headers).has('Content-Type')).toBe(false);
    expect(request?.body).toBe(formData);
  });

  it('clears an expired token after an unauthorized response', async () => {
    setAccessToken('expired-token');
    const listener = vi.fn();
    window.addEventListener('store:auth-expired', listener, { once: true });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Token expired' } }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await expect(api.get('/users/me')).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(localStorage.getItem('store_access_token')).toBeNull();
    expect(listener).toHaveBeenCalledOnce();
  });

  it('preserves the API error code and validation details', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_INPUT',
            message: 'Request validation failed',
            details: [{ field: 'body.email', message: 'Invalid email address' }],
          },
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const request = api.post('/auth/register', {});
    await expect(request).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_INPUT',
      details: [{ field: 'body.email', message: 'Invalid email address' }],
    });
  });
});
