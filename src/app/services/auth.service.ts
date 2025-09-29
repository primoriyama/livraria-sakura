import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse, RegisterRequest } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';
  private readonly TOKEN_KEY = 'sakura_token';
  private readonly USER_KEY = 'sakura_user';

  private _currentUser = signal<User | null>(null);
  private _isAuthenticated = signal<boolean>(false);
  private _isLoading = signal<boolean>(false);

  public currentUser = this._currentUser.asReadonly();
  public isAuthenticated = this._isAuthenticated.asReadonly();
  public isLoading = this._isLoading.asReadonly();

  public isAdmin = computed(() => {
    const user = this._currentUser();
    return user?.role === 'admin' || false;
  });

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    effect(() => {
      const user = this._currentUser();
      const isAuth = this._isAuthenticated();

      if (user && isAuth) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
      }
    });

    this.initializeFromStorage();
  }


  private initializeFromStorage(): void {
    try {
      const savedUser = localStorage.getItem(this.USER_KEY);
      const savedToken = localStorage.getItem(this.TOKEN_KEY);

      if (savedUser && savedToken) {
        const user = JSON.parse(savedUser);
        this._currentUser.set(user);
        this._isAuthenticated.set(true);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      this.logout();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this._isLoading.set(true);

    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this._currentUser.set(response.user);
          this._isAuthenticated.set(true);
          this._isLoading.set(false);
        }),
        catchError(error => {
          this._isLoading.set(false);
          throw error;
        })
      );
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    this._isLoading.set(true);

    return this.http.post<LoginResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this._currentUser.set(response.user);
          this._isAuthenticated.set(true);
          this._isLoading.set(false);
        }),
        catchError(error => {
          this._isLoading.set(false);
          throw error;
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  refreshUserData(): Observable<User> {
    return this.http.get<{user: User}>(`${this.API_URL}/me`)
      .pipe(
        map(response => response.user),
        tap(user => {
          this._currentUser.set(user);
        })
      );
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<{user: User, message: string}>(`${this.API_URL}/profile`, userData)
      .pipe(
        map(response => response.user),
        tap(user => {
          this._currentUser.set(user);
        })
      );
  }

  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    return this.refreshUserData()
      .pipe(
        map(() => true),
        catchError(() => {
          this.logout();
          return of(false);
        })
      );
  }
}
