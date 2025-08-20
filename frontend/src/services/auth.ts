import axios from 'axios';

const API_URL = '/api/auth';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    username: string;
    email: string;
    full_name?: string;
    is_active: boolean;
  };
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

class AuthService {
  async login(username: string, password: string): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axios.post(`${API_URL}/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return response.data;
  }

  async register(data: RegisterData) {
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
  }

  async getCurrentUser(token: string) {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await axios.post(`${API_URL}/refresh`, { 
      refresh_token: refreshToken 
    });
    return response.data;
  }
}

export const authService = new AuthService();