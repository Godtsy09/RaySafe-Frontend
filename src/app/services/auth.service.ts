import { inject, Injectable, PLATFORM_ID, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';

export type Role = 'agente' | 'admin';

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResult {
  token: string;
  user: PublicUser;
}

const TOKEN_KEY = 'raysafe_token';
const USER_KEY = 'raysafe_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly tokenSignal = signal<string | null>(this.leerToken());
  private readonly userSignal = signal<PublicUser | null>(this.leerUsuario());

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly rol = computed(() => this.userSignal()?.role ?? null);
  readonly estaAutenticado = computed(
    () => this.tokenSignal() !== null && this.userSignal() !== null,
  );
  readonly iniciales = computed(() => {
    const name = this.userSignal()?.name ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  });

  login(email: string, password: string): Observable<LoginResult> {
    return this.http
      .post<LoginResult>('/api/auth/login', { email, password })
      .pipe(tap((result) => this.guardarSesion(result)));
  }

  me(): Observable<PublicUser> {
    return this.http.get<PublicUser>('/api/auth/me');
  }

  obtenerToken(): string | null {
    return this.tokenSignal();
  }

  guardarSesion(result: LoginResult): void {
    this.tokenSignal.set(result.token);
    this.userSignal.set(result.user);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    }
  }

  refrescarUsuario(user: PublicUser): void {
    this.userSignal.set(user);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  private leerToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private leerUsuario(): PublicUser | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as PublicUser;
    } catch {
      return null;
    }
  }
}