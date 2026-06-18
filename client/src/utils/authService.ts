import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    uid: string;
    points: number;
  };
}

export interface User {
  _id: string;
  id: string;
  username: string;
  uid: string;
  points: number;
  role?: string;
}

class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
  }

  // Set token in localStorage and axios headers
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Get token from localStorage
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Clear token
  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    delete this.api.defaults.headers.common['Authorization'];
  }

  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>(
      '/api/auth/login',
      credentials
    );
    this.setToken(response.data.token);
    return response.data;
  }

  // Register a new user
  async register(credentials: LoginCredentials & { uid: string }): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>(
      '/api/auth/register',
      credentials
    );
    this.setToken(response.data.token);
    return response.data;
  }

  // Get current user
  async getMe(): Promise<User> {
    const response = await this.api.get<{ user: User }>('/api/auth/me');
    return response.data.user;
  }

  // Logout
  logout(): void {
    this.clearToken();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export default new AuthService();
