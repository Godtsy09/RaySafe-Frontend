import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);

  // Durante el prerender (SSR) no hay sesión en el servidor: se permite renderizar
  // y el guard vuelve a ejecutarse en el navegador, donde sí aplica la protección.
  if (isPlatformServer(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.estaAutenticado()) {
    return router.createUrlTree(['/login']);
  }

  return true;
};