// src/modules/auth/hooks/useAuth.ts

import { useState, useEffect } from 'react';
import { authService } from '../service/auth.service';

interface User {
  id: number;
  username: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = authService.getToken();
    const userData = authService.getUser();
    
    setIsAuthenticated(!!token);
    setUser(userData);
    setLoading(false);
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password });
      setIsAuthenticated(true);
      setUser(response.user);
      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await authService.register({ username, password });
      setIsAuthenticated(true);
      setUser(response.user);
      return response;
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
  };
};