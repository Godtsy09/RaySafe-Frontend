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

  protected readonly evidenciaAbierta = signal(false);
  protected readonly archivos = signal<ArchivoEvidencia[]>([]);
  protected readonly arrastrando = signal(false);
  private dragContador = 0;

  protected readonly enviando = signal(false);
  protected readonly denunciaEnviada = signal(false);
  protected readonly errorDenuncia = signal(false);
  protected readonly mensajeError = signal('');

  protected readonly denunciaCreada = signal<CreatedReport | null>(null);
  protected readonly archivosFallidos = signal(0);
  protected readonly campoCopiado = signal<'public_id' | 'token' | null>(null);
  protected readonly archivoActual = signal(0);

  /**
   * Notifica a la vista de un cambio en un archivo ya existente. La app es zoneless,
   * asi que mutar un objeto dentro del array no dispara change detection por si solo:
   * se conserva la identidad del objeto (para no romper [(ngModel)] ni el foco) y se
   * renueva la referencia del array, que si dispara el signal.
   */
  private refrescarArchivo(index: number, cambios: Partial<ArchivoEvidencia>): void {
    this.archivos.update((lista) =>
      lista.map((archivo, i) => (i === index ? Object.assign(archivo, cambios) : archivo))
    );
  }

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
    this.evidenciaAbierta.set(true);
  }

  cerrarEvidencia(): void {
    this.evidenciaAbierta.set(false);
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
    this.arrastrando.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragContador--;
    if (this.dragContador <= 0) {
      this.dragContador = 0;
      this.arrastrando.set(false);
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
    this.arrastrando.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.agregarArchivos(Array.from(files));
    }
  }

  private agregarArchivos(files: File[]): void {
    const nuevos: ArchivoEvidencia[] = files.map((file) => ({
      nombre: file.name,
      tamano: file.size,
      tipo: file.type || 'archivo',
      file,
      estado: 'pendiente',
      descripcion: '',
      preview: this.crearPreview(file) ?? null,
    }));
    this.archivos.update((lista) => [...lista, ...nuevos]);
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
    for (const archivo of this.archivos()) {
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
    this.liberarPreview(this.archivos()[index]);
    this.archivos.update((lista) => lista.filter((_, i) => i !== index));
  }

  async enviarDenuncia(event: Event): Promise<void> {
    event.preventDefault();

    if (this.enviando()) {
      return;
    }

    if (!this.categoria || !this.tipoAbuso || !this.descripcion.trim()) {
      this.errorDenuncia.set(true);
      this.mensajeError.set(
        'Completa la categoría, el tipo de abuso y la descripción para enviar la denuncia.'
      );
      return;
    }

    this.enviando.set(true);
    this.errorDenuncia.set(false);
    this.archivosFallidos.set(0);

    try {
      const creada = await lastValueFrom(
        this.reportService.createReport({
          abuse_type_id: Number(this.tipoAbuso),
          description: this.descripcion.trim(),
          specific_address: this.direccion.trim() || undefined,
          location_id: this.locationId,
        })
      );

      this.denunciaCreada.set(creada);
      await this.subirEvidencias(creada);
      this.denunciaEnviada.set(true);
    } catch (error) {
      this.errorDenuncia.set(true);
      this.mensajeError.set(extraerMensajeError(error));
    } finally {
      this.enviando.set(false);
    }
  }

  private async subirEvidencias(denuncia: CreatedReport): Promise<void> {
    const total = this.archivos().length;
    for (let i = 0; i < total; i++) {
      const archivo = this.archivos()[i];
      this.refrescarArchivo(i, { estado: 'subiendo' });
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
        this.refrescarArchivo(i, { estado: 'exito' });
      } catch {
        this.refrescarArchivo(i, { estado: 'fallo' });
        this.archivosFallidos.update((n) => n + 1);
      }
    }
    this.archivoActual.set(0);
  }

  async copiarCampo(campo: 'public_id' | 'token'): Promise<void> {
    const valor = this.denunciaCreada()?.[campo];
    if (!valor) {
      return;
    }
    try {
      await navigator.clipboard.writeText(valor);
      this.campoCopiado.set(campo);
    } catch {
      this.campoCopiado.set(null);
    }
  }

  cerrarError(): void {
    this.errorDenuncia.set(false);
  }

  cerrarDenunciaEnviada(): void {
    this.denunciaEnviada.set(false);
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
    this.municipios.set([]);
    this.archivos.set([]);
    this.denunciaCreada.set(null);
    this.archivosFallidos.set(0);
    this.archivoActual.set(0);
    this.campoCopiado.set(null);
  }

  formatearTamano(bytes: number): string {
    return formatearTamano(bytes);
  }

  tituloCampo(campo: 'public_id' | 'token'): string {
    return campo === 'public_id' ? 'ID público' : 'Token de seguimiento';
  }
}