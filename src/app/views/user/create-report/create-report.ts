import { Component, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, lastValueFrom } from 'rxjs';
import { HeaderUserComponent } from '../../../components/headers/header-user/header-user';
import {
  AbuseCategory,
  AbuseType,
  CreatedReport,
  Municipality,
  ReportService,
} from '../../../services/report.service';

type EstadoArchivo = 'pendiente' | 'subiendo' | 'exito' | 'fallo';

interface ArchivoEvidencia {
  nombre: string;
  tamano: number;
  tipo: string;
  file: File;
  estado: EstadoArchivo;
  descripcion: string;
  preview: string | null;
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

function extraerMensajeError(error: unknown): string {
  const err = error as { error?: { error?: string } };
  if (err?.error?.error) {
    return err.error.error;
  }
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

@Component({
  imports: [HeaderUserComponent, RouterLink, FormsModule],
  selector: 'app-create-report',
  templateUrl: './create-report.html',
  styleUrl: './create-report.scss',
})

export class CreateReport implements OnInit, OnDestroy {
  private readonly reportService = inject(ReportService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly categorias: { valor: AbuseCategory; etiqueta: string }[] = [
    { valor: 'human', etiqueta: 'Personas' },
    { valor: 'animal', etiqueta: 'Animales' },
  ];

  protected readonly tiposAbuso = signal<AbuseType[]>([]);
  protected readonly departamentos = signal<string[]>([]);
  protected readonly municipios = signal<Municipality[]>([]);
  protected readonly cargandoCatalogos = signal(true);
  protected readonly errorCatalogos = signal(false);

  protected categoria = '' as AbuseCategory | '';
  protected tipoAbuso = '';
  protected descripcion = '';
  protected departamento = '';
  protected municipio = '';
  protected direccion = '';
  protected email = '';

  protected evidenciaAbierta = false;
  protected archivos: ArchivoEvidencia[] = [];
  protected arrastrando = false;
  private dragContador = 0;

  protected enviando = false;
  protected denunciaEnviada = false;
  protected errorDenuncia = false;
  protected mensajeError = '';

  protected denunciaCreada: CreatedReport | null = null;
  protected archivosFallidos = 0;
  protected campoCopiado: 'public_id' | 'token' | null = null;
  protected readonly archivoActual = signal(0);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.cargarCatalogos();
  }

  private cargarCatalogos(): void {
    this.cargandoCatalogos.set(true);
    this.errorCatalogos.set(false);
    forkJoin({
      tipos: this.reportService.getAbuseTypes(),
      deptos: this.reportService.getDepartments(),
    }).subscribe({
      next: ({ tipos, deptos }) => {
        this.tiposAbuso.set(tipos);
        this.departamentos.set(deptos);
        this.cargandoCatalogos.set(false);
      },
      error: () => {
        this.cargandoCatalogos.set(false);
        this.errorCatalogos.set(true);
      },
    });
  }

  protected tiposFiltrados(): AbuseType[] {
    return this.tiposAbuso().filter((t) => t.category === this.categoria);
  }

  protected onCategoriaChange(): void {
    this.tipoAbuso = '';
  }

  protected onDepartamentoChange(): void {
    this.municipio = '';
    this.municipios.set([]);
    if (!this.departamento) {
      return;
    }
    this.reportService.getMunicipalities(this.departamento).subscribe({
      next: (municipios) => this.municipios.set(municipios),
      error: () => this.municipios.set([]),
    });
  }

  private get locationId(): number | undefined {
    return this.municipios().find((m) => m.city === this.municipio)?.id;
  }

  abrirEvidencia(): void {
    this.evidenciaAbierta = true;
  }

  cerrarEvidencia(): void {
    this.evidenciaAbierta = false;
  }

  onArchivosSeleccionados(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      this.agregarArchivos(Array.from(files));
    }
    input.value = '';
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

  onDropArchivos(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragContador = 0;
    this.arrastrando = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.agregarArchivos(Array.from(files));
    }
  }

  private agregarArchivos(files: File[]): void {
    for (const file of files) {
      this.archivos.push({
        nombre: file.name,
        tamano: file.size,
        tipo: file.type || 'archivo',
        file,
        estado: 'pendiente',
        descripcion: '',
        preview: this.crearPreview(file) ?? null,
      });
    }
  }

  private crearPreview(file: File): string | undefined {
    if (!isPlatformBrowser(this.platformId)) {
      return undefined;
    }
    const tipo = file.type || '';
    if (!tipo.startsWith('image') && !tipo.startsWith('video') && !tipo.startsWith('audio')) {
      return undefined;
    }
    return URL.createObjectURL(file);
  }

  private liberarPreview(archivo: ArchivoEvidencia): void {
    if (archivo.preview) {
      URL.revokeObjectURL(archivo.preview);
      archivo.preview = null;
    }
  }

  private liberarPreviews(): void {
    for (const archivo of this.archivos) {
      this.liberarPreview(archivo);
    }
  }

  ngOnDestroy(): void {
    this.liberarPreviews();
  }

  protected esTipo(archivo: ArchivoEvidencia, prefijo: string): boolean {
    return (archivo.tipo || '').toLowerCase().startsWith(prefijo);
  }

  protected etiquetaEstado(archivo: ArchivoEvidencia): string {
    switch (archivo.estado) {
      case 'subiendo':
        return 'Subiendo…';
      case 'exito':
        return '✓ Subido';
      case 'fallo':
        return '✕ Falló';
      default:
        return 'Pendiente';
    }
  }

  eliminarArchivo(index: number): void {
    this.liberarPreview(this.archivos[index]);
    this.archivos.splice(index, 1);
  }

  async enviarDenuncia(event: Event): Promise<void> {
    event.preventDefault();

    if (this.enviando) {
      return;
    }

    if (!this.categoria || !this.tipoAbuso || !this.descripcion.trim()) {
      this.errorDenuncia = true;
      this.mensajeError =
        'Completa la categoría, el tipo de abuso y la descripción para enviar la denuncia.';
      return;
    }

    this.enviando = true;
    this.errorDenuncia = false;
    this.archivosFallidos = 0;

    try {
      const creada = await lastValueFrom(
        this.reportService.createReport({
          abuse_type_id: Number(this.tipoAbuso),
          description: this.descripcion.trim(),
          specific_address: this.direccion.trim() || undefined,
          location_id: this.locationId,
          notification_email: this.email.trim() || undefined,
        })
      );

      this.denunciaCreada = creada;
      await this.subirEvidencias(creada);
      this.denunciaEnviada = true;
    } catch (error) {
      this.errorDenuncia = true;
      this.mensajeError = extraerMensajeError(error);
    } finally {
      this.enviando = false;
    }
  }

  private async subirEvidencias(denuncia: CreatedReport): Promise<void> {
    const total = this.archivos.length;
    for (let i = 0; i < total; i++) {
      const archivo = this.archivos[i];
      archivo.estado = 'subiendo';
      this.archivoActual.set(i + 1);
      try {
        await lastValueFrom(
          this.reportService.uploadEvidence(
            denuncia.public_id,
            denuncia.token,
            archivo.file,
            archivo.descripcion.trim() || undefined
          )
        );
        archivo.estado = 'exito';
      } catch {
        archivo.estado = 'fallo';
        this.archivosFallidos++;
      }
    }
    this.archivoActual.set(0);
  }

  async copiarCampo(campo: 'public_id' | 'token'): Promise<void> {
    const valor = this.denunciaCreada?.[campo];
    if (!valor) {
      return;
    }
    try {
      await navigator.clipboard.writeText(valor);
      this.campoCopiado = campo;
    } catch {
      this.campoCopiado = null;
    }
  }

  cerrarError(): void {
    this.errorDenuncia = false;
  }

  cerrarDenunciaEnviada(): void {
    this.denunciaEnviada = false;
    this.reiniciarFormulario();
  }

  private reiniciarFormulario(): void {
    this.liberarPreviews();
    this.categoria = '';
    this.tipoAbuso = '';
    this.descripcion = '';
    this.departamento = '';
    this.municipio = '';
    this.direccion = '';
    this.email = '';
    this.municipios.set([]);
    this.archivos = [];
    this.denunciaCreada = null;
    this.archivosFallidos = 0;
    this.archivoActual.set(0);
    this.campoCopiado = null;
  }

  formatearTamano(bytes: number): string {
    return formatearTamano(bytes);
  }

  tituloCampo(campo: 'public_id' | 'token'): string {
    return campo === 'public_id' ? 'ID público' : 'Token de seguimiento';
  }
}