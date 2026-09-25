import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { AuthService, LoginResult, Role } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  const result: LoginResult = {
    token: 'un-token-de-prueba',
    user: {
      id: 1,
      name: 'Ana Pérez',
      email: 'ana@raysafe.gt',
      role: 'agente',
      institutionId: 3,
      institutionName: 'Institución de Prueba',
    },
  };

  const configurarTestBed = () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
  };

  beforeEach(() => {
    localStorage.clear();
    configurarTestBed();
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('se crea con sesión vacía', () => {
    expect(service.estaAutenticado()).toBe(false);
    expect(service.rol()).toBeNull();
    expect(service.obtenerToken()).toBeNull();
  });

  it('login guarda token y usuario en localStorage y signals', () => {
    service.login('ana@raysafe.gt', 'secreto').subscribe({
      next: (res) => {
        expect(res).toEqual(result);
        expect(service.estaAutenticado()).toBe(true);
        expect(service.rol()).toBe('agente');
        expect(service.obtenerToken()).toBe('un-token-de-prueba');
        expect(service.iniciales()).toBe('AP');
        expect(localStorage.getItem('raysafe_token')).toBe('un-token-de-prueba');
        expect(JSON.parse(localStorage.getItem('raysafe_user')!)).toEqual(result.user);
      },
    });

    const req = http.expectOne({ method: 'POST', url: '/api/auth/login' });
    expect(req.request.body).toEqual({ email: 'ana@raysafe.gt', password: 'secreto' });
    req.flush(result);
  });

  it('restaura la sesión desde localStorage al instanciarse', () => {
    localStorage.setItem('raysafe_token', result.token);
    localStorage.setItem('raysafe_user', JSON.stringify(result.user));

    TestBed.resetTestingModule();
    configurarTestBed();

    const restaurado = TestBed.inject(AuthService);
    expect(restaurado.estaAutenticado()).toBe(true);
    expect(restaurado.rol()).toBe('agente');
    expect(restaurado.user()?.name).toBe('Ana Pérez');
  });

  it('me() envía el token en el header Authorization', () => {
    service.guardarSesion(result);

    service.me().subscribe();
    const req = http.expectOne({ method: 'GET', url: '/api/auth/me' });
    expect(req.request.headers.get('Authorization')).toBe('Bearer un-token-de-prueba');
    req.flush(result.user);
  });

  it('logout limpia signals y localStorage', () => {
    service.guardarSesion(result);
    expect(service.estaAutenticado()).toBe(true);

    service.logout();
    expect(service.estaAutenticado()).toBe(false);
    expect(service.rol()).toBeNull();
    expect(localStorage.getItem('raysafe_token')).toBeNull();
    expect(localStorage.getItem('raysafe_user')).toBeNull();
  });

  it('refrescarUsuario actualiza los datos del usuario', () => {
    service.guardarSesion(result);
    service.refrescarUsuario({
      id: 1,
      name: 'Nuevo Nombre',
      email: 'ana@raysafe.gt',
      role: 'admin' as Role,
      institutionId: 3,
      institutionName: 'Institución de Prueba',
    });

    expect(service.user()?.name).toBe('Nuevo Nombre');
    expect(service.rol()).toBe('admin');
  });
});