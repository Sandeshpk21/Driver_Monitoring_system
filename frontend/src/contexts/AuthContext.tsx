import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/auth';

interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load auth data from localStorage on mount
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = localStorage.getItem('access_token');
        const storedRefreshToken = localStorage.getItem('refresh_token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          try {
            const userData = await authService.getCurrentUser(storedToken);
            setUser(userData);
          } catch (error) {
            // Token expired, try to refresh
            if (storedRefreshToken) {
              await handleRefreshToken(storedRefreshToken);
            } else {
              handleLogout();
            }
          }
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const handleRefreshToken = async (refreshTkn: string) => {
    try {
      const response = await authService.refreshToken(refreshTkn);
      setToken(response.access_token);
      setUser(response.user);
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleLogout();
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password);
      
      setToken(response.access_token);
      setRefreshToken(response.refresh_token);
      setUser(response.user);
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed');
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    handleLogout();
    toast.info('Logged out successfully');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    navigate('/login');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken: () => handleRefreshToken(refreshToken!),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};