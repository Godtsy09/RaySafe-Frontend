import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HeaderUserComponent } from '../../../components/headers/header-user/header-user';
import {
  EvidenceItem,
  ReportService,
  ReportStatus,
  TrackReportFull,
  TrackReportInfo,
} from '../../../services/report.service';

interface Paso {
  nombre: string;
  completado: boolean;
  actual: boolean;
}

function extraerMensajeError(error: unknown): string {
  const err = error as { error?: { error?: string } };
  if (err?.error?.error) {
    return err.error.error;
  }
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

@Component({
  imports: [FormsModule, HeaderUserComponent],
  selector: 'app-track-report',
  templateUrl: './track-report.html',
  styleUrl: './track-report.scss',
})
export class TrackReport {
  private readonly reportService = inject(ReportService);

  protected idPublico = '';
  protected tokenSecreto = '';

  protected readonly cargando = signal(false);
  protected readonly errorConsulta = signal(false);
  protected readonly mensajeError = signal('');

  protected readonly resultado = signal<TrackReportInfo | TrackReportFull | null>(
    null
  );

  protected readonly estados = signal<ReportStatus[]>([]);
  protected readonly evidenciaDesplegada = signal(false);

  protected readonly evidencias = signal<EvidenceItem[]>([]);
  protected readonly subiendoEvidencia = signal(false);
  protected readonly errorEvidencia = signal(false);

  protected readonly editandoId = signal<number | null>(null);
  protected edicionBorrador = '';
  protected readonly errorEdicion = signal(false);

  protected arrastrando = false;
  private dragContador = 0;
  protected descripcionEvidencia = '';

  protected esCompleta(info: TrackReportInfo | TrackReportFull): info is TrackReportFull {
    return 'description' in info;
  }

  protected alternarEvidencia(): void {
    this.evidenciaDesplegada.update((abierta) => !abierta);
  }

  protected ubicacion(info: TrackReportFull): string {
    return [info.city, info.department].filter(Boolean).join(', ');
  }

  protected pasos(info: TrackReportInfo): Paso[] {
    const secuencia = this.estados().map((e) => e.name);
    const posicion = this.estados().findIndex((e) => e.id === info.report_status_id);

    if (secuencia.length === 0 || posicion === -1) {
      return [{ nombre: info.status_name, completado: false, actual: true }];
    }

    return secuencia.map((nombre, i) => ({
      nombre,
      completado: i < posicion,
      actual: i === posicion,
    }));
  }

  async consultarDenuncia(): Promise<void> {
    const id = this.idPublico.trim();
    if (!id || this.cargando()) {
      return;
    }

    const token = this.tokenSecreto.trim();

    this.cargando.set(true);
    this.errorConsulta.set(false);
    this.resultado.set(null);
    this.evidencias.set([]);

    try {
      if (this.estados().length === 0) {
        lastValueFrom(this.reportService.getReportStatuses())
          .then((estados) => this.estados.set(estados))
          .catch(() => {});
      }

      const info = await lastValueFrom(
        this.reportService.trackReport(id, token || undefined)
      );
      this.resultado.set(info);

      if (token) {
        this.evidencias.set(
          await lastValueFrom(this.reportService.getEvidence(id, token))
        );
      }
    } catch (error) {
      this.errorConsulta.set(true);
      this.mensajeError.set(extraerMensajeError(error));
    } finally {
      this.cargando.set(false);
    }
  }

  async onEvidenciasNuevas(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (files.length > 0) {
      await this.subirEvidencias(files);
    }
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragContador++;
    this.arrastrando = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragContador--;
    if (this.dragContador <= 0) {
      this.dragContador = 0;
      this.arrastrando = false;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  async onDropArchivos(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.dragContador = 0;
    this.arrastrando = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      await this.subirEvidencias(Array.from(files));
    }
  }

  private subirEvidencias(files: File[]): Promise<void> {
    const info = this.resultado();
    const token = this.tokenSecreto.trim();
    if (!info || !token || this.subiendoEvidencia()) {
      return Promise.resolve();
    }

    const id = info.public_id;
    const descripcion = this.descripcionEvidencia.trim() || undefined;
    this.subiendoEvidencia.set(true);
    this.errorEvidencia.set(false);

    return (async () => {
      try {
        for (const file of files) {
          try {
            await lastValueFrom(
              this.reportService.uploadEvidence(id, token, file, descripcion)
            );
          } catch {
            this.errorEvidencia.set(true);
          }
        }
        this.evidencias.set(
          await lastValueFrom(this.reportService.getEvidence(id, token))
        );
      } catch {
        this.errorEvidencia.set(true);
      } finally {
        this.subiendoEvidencia.set(false);
      }
    })();
  }

  protected empezarEdicion(evidencia: EvidenceItem): void {
    this.editandoId.set(evidencia.id);
    this.edicionBorrador = evidencia.description ?? '';
    this.errorEdicion.set(false);
  }

  protected cancelarEdicion(): void {
    this.editandoId.set(null);
    this.edicionBorrador = '';
    this.errorEdicion.set(false);
  }

  async guardarEdicion(): Promise<void> {
    const info = this.resultado();
    const token = this.tokenSecreto.trim();
    const id = this.editandoId();
    if (!info || !token || id === null) {
      return;
    }

    this.errorEdicion.set(false);
    try {
      const actualizada = await lastValueFrom(
        this.reportService.updateEvidenceDescription(
          info.public_id,
          token,
          id,
          this.edicionBorrador.trim() || null
        )
      );
      this.evidencias.set(
        this.evidencias().map((e) => (e.id === id ? actualizada : e))
      );
      this.cancelarEdicion();
    } catch {
      this.errorEdicion.set(true);
    }
  }

  protected formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) {
      return fecha;
    }
    return date.toLocaleDateString('es-GT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  protected nombreEvidencia(item: EvidenceItem): string {
    const url = item.fileUrl.split('?')[0];
    const ultimo = url.split('/').pop() ?? item.fileUrl;
    return decodeURIComponent(ultimo);
  }

  protected iconoEvidencia(item: EvidenceItem): string {
    switch (item.fileType) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎬';
      case 'audio':
        return '🎙️';
      default:
        return '📄';
    }
  }

  protected etiquetaTipo(item: EvidenceItem): string {
    switch (item.fileType) {
      case 'image':
        return 'Imagen';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Audio';
      default:
        return 'Documento';
    }
  }
}