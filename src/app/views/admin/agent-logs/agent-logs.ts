import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-agent-logs',
  styleUrl: './agent-logs.scss',
  templateUrl: './agent-logs.html',
})
export class AgentLogs {
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