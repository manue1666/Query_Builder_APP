import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { AuthService } from '../services/authService';
import type { User, ApiResponse } from '../types/models';

/**
 * Interfaz que define el tipo del contexto de autenticación
 */
interface AuthContextType {
  user: User | null;
  token: string | null;
  login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>>;
  register(name: string, email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>>;
  logout(): void;
  isLoading: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authService = new AuthService();


  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);


  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data?.token && response.data?.user) {
        setToken(response.data.token);
        setUser(response.data.user);
      }
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.register(name, email, password);
      if (response.data?.token && response.data?.user) {
        setToken(response.data.token);
        setUser(response.data.user);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @throws Error si se usa fuera de AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe estar dentro de AuthProvider');
  }
  return context;
}
