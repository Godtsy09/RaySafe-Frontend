import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, Role } from '../../../services/auth.service';
import { HeaderUserComponent } from '../../../components/headers/header-user/header-user';

@Component({
  imports: [FormsModule, HeaderUserComponent],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);

  protected email = '';
  protected password = '';
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly mensaje = signal(this.route.snapshot.queryParamMap.get('mensaje') ?? '');

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.redirigirSiHaySesion();
  }

  protected iniciarSesion(): void {
    if (this.cargando()) return;

    this.error.set('');
    this.cargando.set(true);

    this.authService.login(this.email, this.password).subscribe({
      next: (result) => {
        this.cargando.set(false);
        this.router.navigate(this.rutaInicial(result.user.role));
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(err?.error?.error ?? 'No se pudo iniciar sesión. Inténtalo de nuevo.');
      },
    });
  }

  private redirigirSiHaySesion(): void {
    const rol = this.authService.rol();
    if (rol) {
      this.router.navigate(this.rutaInicial(rol));
    }
  }

  private rutaInicial(rol: Role): string[] {
    return rol === 'admin' ? ['/agent-list'] : ['/assigned-reports'];
  }
}