import { apiClient } from '../../../shared/api/api.client';

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
  };
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  async login(data: LoginData): Promise<AuthResponse> {
    console.log('Login request with data:', data);
    const response = await apiClient.post<any>('/auth/login', data);
    console.log('Login response:', response);
    
    if (response?.token) {
      this.setSession(response.token, response.user);
      return response;
    }
    
    throw new Error('Invalid response from server');
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('Register request with data:', data);
    const response = await apiClient.post<any>('/auth/register', data);
    console.log('Register response:', response);
    
    if (response?.token) {
      this.setSession(response.token, response.user);
      return response;
    }
    
    throw new Error('Invalid response from server');
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): { id: number; username: string } | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setSession(token: string, user: { id: number; username: string }): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
}

export const authService = new AuthService();