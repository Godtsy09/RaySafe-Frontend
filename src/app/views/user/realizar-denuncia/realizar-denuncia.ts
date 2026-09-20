import { Component } from '@angular/core';
import { HeaderUserComponent } from '../../../components/headers/header-user/header-user';

interface ArchivoEvidencia {
  nombre: string;
  tamano: number;
  tipo: string;
}

function formatearTamano(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

@Component({
  imports: [HeaderUserComponent],
  selector: 'app-realizar-denuncia',
  templateUrl: './realizar-denuncia.html',
  styleUrl: './realizar-denuncia.css',
})

export class RealizarDenunciaComponent {
  protected evidenciaAbierta = false;
  protected archivos: ArchivoEvidencia[] = [];

  abrirEvidencia(): void {
    this.evidenciaAbierta = true;
  }

  cerrarEvidencia(): void {
    this.evidenciaAbierta = false;
  }

  onArchivosSeleccionados(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files) {
      return;
    }

    for (const file of Array.from(files)) {
      this.archivos.push({
        nombre: file.name,
        tamano: file.size,
        tipo: file.type || 'archivo',
      });
    }

    input.value = '';
  }

  eliminarArchivo(index: number): void {
    this.archivos.splice(index, 1);
  }

  formatearTamano(bytes: number): string {
    return formatearTamano(bytes);
  }
}