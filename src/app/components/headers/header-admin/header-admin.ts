import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header-admin',
  imports: [RouterLink, RouterLinkActive],
  styleUrl: './header-admin.scss',
  templateUrl: './header-admin.html',
})
export class HeaderAdminComponent {
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  protected menuAbierto = false;

  @HostListener('document:click', ['$event'])
  cerrarMenuFuera(event: Event): void {
    const target = event.target as HTMLElement;
    const avatarMenu = this.elementRef.nativeElement.querySelector('.avatar-menu');
    if (avatarMenu && !avatarMenu.contains(target)) {
      this.menuAbierto = false;
    }
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarSesion(): void {
    this.menuAbierto = false;
    this.router.navigate(['/login']);
  }
}