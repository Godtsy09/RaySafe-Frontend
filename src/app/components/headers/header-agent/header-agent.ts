import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header-agent',
  imports: [RouterLink],
  styleUrl: './header-agent.css',
  templateUrl: './header-agent.html',
})
export class HeaderAgentComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly usuario = this.authService.user;
  protected readonly iniciales = this.authService.iniciales;

  protected cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}