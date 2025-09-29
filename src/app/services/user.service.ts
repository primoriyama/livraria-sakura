import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  newUsersThisMonth: number;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    sort?: string;
    order?: string;
  }): Observable<UserListResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<UserListResponse>(`${this.API_URL}/users`, { params: httpParams });
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<{stats: any}>(`${this.API_URL}/users/stats`).pipe(
      map(response => ({
        totalUsers: response.stats.totalUsers,
        activeUsers: response.stats.activeUsers,
        adminUsers: response.stats.adminUsers,
        newUsersThisMonth: response.stats.recentUsers
      }))
    );
  }

  createUser(userData: CreateUserRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/register`, userData);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/users/${userId}`);
  }

  toggleUserStatus(userId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${userId}/toggle-status`, {});
  }

  toggleUserRole(userId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${userId}/toggle-role`, {});
  }
}