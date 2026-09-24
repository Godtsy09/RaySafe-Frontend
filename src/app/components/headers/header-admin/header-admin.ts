import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header-admin',
  imports: [RouterLink],
  styleUrl: './header-admin.css',
  templateUrl: './header-admin.html',
})
export class HeaderAdminComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly usuario = this.authService.user;
  protected readonly iniciales = this.authService.iniciales;

  protected cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}