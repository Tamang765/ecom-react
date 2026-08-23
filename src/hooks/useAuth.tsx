import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/lib/auth';
import { AUTH_EXPIRED_EVENT } from '@/lib/api';
import type { AuthContextType, User, UserUpdate } from '@/types';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const clearUser = () => {
      setUser(null);
      navigate('/login');
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, clearUser);

    async function restoreUser() {
      if (!auth.hasToken()) {
        setIsLoading(false);
        return;
      }

      try {
        setUser(await auth.getCurrentUser());
      } catch {
        auth.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    void restoreUser();
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, clearUser);
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setUser(await auth.login(email, password));
  };

  const register = async (username: string, email: string, password: string) => {
    setUser(await auth.register(username, email, password));
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  const updateProfile = async (update: UserUpdate) => {
    const updatedUser = await auth.updateProfile(update);
    setUser(updatedUser);
    return updatedUser;
  };

  const deleteAccount = async () => {
    await auth.deleteAccount();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
