import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  imports: [HeaderUserComponent, RouterLink, FormsModule],
  selector: 'app-create-report',
  templateUrl: './create-report.html',
  styleUrl: './create-report.scss',
})

export class CreateReport {
  protected evidenciaAbierta = false;
  protected archivos: ArchivoEvidencia[] = [];

  protected denunciaEnviada = false;
  protected errorDenuncia = false;

  protected tipoAbuso = '';
  protected nivelRiesgo = '';
  protected descripcion = '';
  protected direccion = '';

  abrirEvidencia(): void {
    this.evidenciaAbierta = true;
  }

  cerrarEvidencia(): void {
    this.evidenciaAbierta = false;
  }

  enviarDenuncia(event: Event): void {
    event.preventDefault();

    if (
      !this.tipoAbuso.trim() ||
      !this.nivelRiesgo.trim() ||
      !this.descripcion.trim() ||
      !this.direccion.trim()
    ) {
      this.errorDenuncia = true;
      return;
    }

    this.denunciaEnviada = true;
  }

  cerrarError(): void {
    this.errorDenuncia = false;
  }

  cerrarDenunciaEnviada(): void {
    this.denunciaEnviada = false;
    this.reiniciarFormulario();
  }

  private reiniciarFormulario(): void {
    this.tipoAbuso = '';
    this.nivelRiesgo = '';
    this.descripcion = '';
    this.direccion = '';
    this.archivos = [];
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