import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { User, Role, LoginRequest, RegisterRequest, AuthResponse, VerifyEmailRequest, OAuthLoginRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    // Restore session from localStorage or sessionStorage
    const storedUser = localStorage.getItem('bridge_user') || sessionStorage.getItem('bridge_user');
    const storedToken = localStorage.getItem('bridge_token') || sessionStorage.getItem('bridge_token');
    
    if (storedUser && storedToken) {
      this.currentUserSubject.next(JSON.parse(storedUser));
      this.tokenSubject.next(storedToken);
      this.isAuthenticated$.next(true);
    }
  }

  mapAuthResponseToUser(res: AuthResponse): User {
    return {
      id: res.id.toString(),
      prenom: res.firstName,
      nom: res.lastName,
      email: res.email,
      telephone: res.phone,
      role: res.role,
      avatar: res.avatar,
      dateInscription: new Date(res.createdAt),
      age: res.age,
      status: res.status,
      authProvider: res.authProvider
    };
  }

  login(credentials: LoginRequest, rememberMe: boolean = false): Observable<AuthResponse> {
    const payload = {
      email: credentials.email,
      password: credentials.password || credentials.motDePasse
    };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap(res => {
        if (res.token) {
          const user = this.mapAuthResponseToUser(res);
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('bridge_user', JSON.stringify(user));
          storage.setItem('bridge_token', res.token);
          this.currentUserSubject.next(user);
          this.tokenSubject.next(res.token);
          this.isAuthenticated$.next(true);
        }
      })
    );
  }

  register(data: RegisterRequest, avatarFile?: File): Observable<AuthResponse> {
    const formData = new FormData();
    const registerPayload = {
      firstName: data.prenom,
      lastName: data.nom,
      email: data.email,
      password: data.password || data.motDePasse,
      phone: data.telephone,
      age: data.age
    };
    formData.append('data', new Blob([JSON.stringify(registerPayload)], { type: 'application/json' }));
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, formData);
  }

  verifyEmail(email: string, code: string): Observable<any> {
    const request: VerifyEmailRequest = { email, code };
    return this.http.post(`${this.apiUrl}/verify-email`, request);
  }

  resendCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-code`, { email });
  }

  oauthLogin(provider: string, accessToken: string): Observable<AuthResponse> {
    const request: OAuthLoginRequest = { provider, accessToken };
    return this.http.post<AuthResponse>(`${this.apiUrl}/oauth/login`, request).pipe(
      tap(res => {
        if (res.token) {
          const user = this.mapAuthResponseToUser(res);
          // OAuth usually keeps user logged in via localStorage
          localStorage.setItem('bridge_user', JSON.stringify(user));
          localStorage.setItem('bridge_token', res.token);
          this.currentUserSubject.next(user);
          this.tokenSubject.next(res.token);
          this.isAuthenticated$.next(true);
        }
      })
    );
  }

  logout(): void {
    // Call server logout just in case, but always clean up locally
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => {},
      error: () => {}
    });
    
    localStorage.removeItem('bridge_user');
    localStorage.removeItem('bridge_token');
    sessionStorage.removeItem('bridge_user');
    sessionStorage.removeItem('bridge_token');
    
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    this.isAuthenticated$.next(false);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getRedirectUrl(role: Role): string {
    switch (role) {
      case 'ADMIN': return '/dashboard/admin';
      case 'FORMATEUR': return '/dashboard/formateur';
      case 'STAGIAIRE': return '/dashboard/stagiaire';
    }
  }
}

