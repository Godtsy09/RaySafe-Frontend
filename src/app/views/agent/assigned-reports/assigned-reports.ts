import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-assigned-reports',
  styleUrl: './assigned-reports.scss',
  templateUrl: './assigned-reports.html',
})
export class AssignedReports  {
  // Estado para controlar la visibilidad del modal
  isModalOpen: boolean = false;

  // Método para abrir el modal
  openModal(): void {
    this.isModalOpen = true;
  }

  // Método para cerrar el modal
  closeModal(): void {
    this.isModalOpen = false;
  }
}