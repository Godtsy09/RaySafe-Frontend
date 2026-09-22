import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderAgentComponent } from '../../../components/headers/header-agent/header-agent';

@Component({
  imports: [HeaderAgentComponent],
  selector: 'app-unassigned-reports',
  styleUrl: './unassigned-reports.scss',
  templateUrl: './unassigned-reports.html',
})
export class UnassignedReports {
  private readonly router = inject(Router);

  // Estados para controlar la visibilidad de los modales
  isDetailModalOpen: boolean = false;
  isClaimModalOpen: boolean = false;

  // Métodos para el modal "Ver Detalle"
  openDetailModal(): void {
    this.isDetailModalOpen = true;
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
  }

  // Métodos para el modal "Tomar Denuncia"
  openClaimModal(): void {
    this.isClaimModalOpen = true;
  }

  closeClaimModal(): void {
    this.isClaimModalOpen = false;
  }

  // Transición directa del detalle al modal de tomar denuncia
  confirmClaimFromDetail(): void {
    this.closeDetailModal();
    this.openClaimModal();
  }

  // Acción del botón confirmar
  assignReport(): void {
    this.closeClaimModal();
    this.router.navigate(['/assigned-reports']);
  }
}