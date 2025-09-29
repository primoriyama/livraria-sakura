export interface User {
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  phone?: string;
  birthDate?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  createdAt?: Date;
  lastLogin?: Date;
  isActive?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string; 
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}