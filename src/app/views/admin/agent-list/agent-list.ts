import { Component } from '@angular/core';
import { HeaderAdminComponent } from '../../../components/headers/header-admin/header-admin';

@Component({
  imports: [HeaderAdminComponent],
  selector: 'app-agent-list',
  styleUrl: './agent-list.scss',
  templateUrl: './agent-list.html',
})
export class AgentList {
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