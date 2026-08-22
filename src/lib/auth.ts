import {
  api,
  clearAccessToken,
  endpoints,
  getAccessToken,
  setAccessToken,
} from '@/lib/api';
import type { AuthResult, User, UserUpdate } from '@/types';

export const auth = {
  hasToken(): boolean {
    return Boolean(getAccessToken());
  },

  async login(email: string, password: string): Promise<User> {
    const result = await api.post<AuthResult>(endpoints.auth.login, { email, password });
    setAccessToken(result.token);
    return result.user;
  },

  async register(username: string, email: string, password: string): Promise<User> {
    const result = await api.post<AuthResult>(endpoints.auth.register, {
      username,
      email,
      password,
    });
    setAccessToken(result.token);
    return result.user;
  },

  logout(): void {
    clearAccessToken();
  },

  getCurrentUser(): Promise<User> {
    return api.get<User>(endpoints.users.me);
  },

  updateProfile(update: UserUpdate): Promise<User> {
    return api.patch<User>(endpoints.users.me, update);
  },

  async deleteAccount(): Promise<void> {
    await api.delete(endpoints.users.me);
    clearAccessToken();
  },
};
