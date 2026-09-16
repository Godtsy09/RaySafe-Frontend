import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderUserComponent } from '../../../components/headers/header-user/header-user';

type EstadoDenuncia = 'recibida' | 'en_investigacion' | 'resuelta';

interface Paso {
  nombre: string;
  completado: boolean;
  actual: boolean;
}

interface ResultadoDenuncia {
  idPublico: string;
  estadoActual: EstadoDenuncia;
  pasos: Paso[];
}

@Component({
  selector: 'app-consultar-denuncia',
  imports: [CommonModule, FormsModule, HeaderUserComponent],
  templateUrl: './consultar-denuncia.html',
  styleUrl: './consultar-denuncia.css',
})
export class ConsultarDenuncia {
  protected idPublico = '';
  protected tokenSecreto = '';

  protected readonly resultado = signal<ResultadoDenuncia | null>(null);

  protected consultarDenuncia(): void {
    if (!this.idPublico.trim()) {
      return;
    }

    //Datos de ejemplo para la vista, cuando exista esto este conectado al backend, se reemplaza
    //por la respuesta real del endpoint de consulta de denuncias
    this.resultado.set({
      idPublico: this.idPublico.trim(),
      estadoActual: 'en_investigacion',
      pasos: [
        { nombre: 'Recibida', completado: true, actual: false },
        { nombre: 'Asignada a agente', completado: true, actual: false },
        { nombre: 'En investigación', completado: false, actual: true },
        { nombre: 'Resuelta', completado: false, actual: false },
      ],
    });
  }

  protected etiquetaEstado(estado: EstadoDenuncia): string {
    switch (estado) {
      case 'recibida':
        return 'Recibida';
      case 'en_investigacion':
        return 'En investigación';
      case 'resuelta':
        return 'Resuelta';
    }
  }
}