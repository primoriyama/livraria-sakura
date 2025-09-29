import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse, RegisterRequest } from '../models/user.model';

/**
 * Serviço de autenticação responsável por gerenciar o estado de login/logout,
 * armazenamento de tokens e dados do usuário.
 * 
 * Utiliza Angular Signals para reatividade e localStorage para persistência.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URLs e chaves de configuração
  private readonly API_URL = 'http://localhost:3000/api/auth';
  private readonly TOKEN_KEY = 'sakura_token';
  private readonly USER_KEY = 'sakura_user';

  // Signals privados para controle interno
  private _currentUser = signal<User | null>(null);
  private _isAuthenticated = signal<boolean>(false);
  private _isLoading = signal<boolean>(false);

  // Signals públicos readonly para componentes
  public currentUser = this._currentUser.asReadonly();
  public isAuthenticated = this._isAuthenticated.asReadonly();
  public isLoading = this._isLoading.asReadonly();

  // Signal computado para verificar se o usuário é admin
  public isAdmin = computed(() => {
    const user = this._currentUser();
    // ===== CORREÇÃO APLICADA AQUI =====
    // Alterado de 'papel' para 'role' para corresponder ao que a API envia.
    return user?.role === 'admin' || false;
  });

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Effect para sincronizar automaticamente com localStorage
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

    // Inicializar estado a partir do localStorage
    this.initializeFromStorage();
  }

  /**
   * Inicializa o estado de autenticação a partir dos dados salvos no localStorage
   */
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

  /**
   * Realiza login do usuário
   * @param credentials Credenciais de login (email e senha)
   * @returns Observable com a resposta do login
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this._isLoading.set(true);

    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          // Salvar token e atualizar estado
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

  /**
   * Registra um novo usuário
   * @param userData Dados do usuário para registro
   * @returns Observable com a resposta do registro
   */
  register(userData: RegisterRequest): Observable<LoginResponse> {
    this._isLoading.set(true);

    return this.http.post<LoginResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => {
          // Salvar token e atualizar estado
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

  /**
   * Realiza logout do usuário, limpando todos os dados salvos
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
    this.router.navigate(['/']);
  }

  /**
   * Obtém o token de autenticação salvo
   * @returns Token JWT ou null se não existir
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Atualiza os dados do usuário a partir do servidor
   * @returns Observable com os dados atualizados do usuário
   */
  refreshUserData(): Observable<User> {
    return this.http.get<{user: User}>(`${this.API_URL}/me`)
      .pipe(
        map(response => response.user),
        tap(user => {
          this._currentUser.set(user);
        })
      );
  }

  /**
   * Atualiza o perfil do usuário
   * @param userData Dados parciais do usuário para atualização
   * @returns Observable com os dados atualizados do usuário
   */
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<{user: User, message: string}>(`${this.API_URL}/profile`, userData)
      .pipe(
        map(response => response.user),
        tap(user => {
          this._currentUser.set(user);
        })
      );
  }

  /**
   * Valida se o token atual ainda é válido
   * @returns Observable<boolean> indicando se o token é válido
   */
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