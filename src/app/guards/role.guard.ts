import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { AuthService, Role } from '../services/auth.service';

export const roleGuard = (roles: Role[]): CanActivateFn => () => {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  const rol = authService.rol();

  if (!authService.estaAutenticado() || !rol) {
    return router.createUrlTree(['/login']);
  }

  if (!roles.includes(rol)) {
    return router.createUrlTree(['/login'], {
      queryParams: {
        mensaje: 'No tienes permisos para acceder a esta vista con tu rol actual.',
      },
    });
  }

  return true;
};