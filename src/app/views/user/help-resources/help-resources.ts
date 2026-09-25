import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { forkJoin } from 'rxjs';
import { HeaderUserComponent } from '../../../components/headers/header-user/header-user';
import {
  EducationalGuide,
  HelpResource,
  HelpResourcesService,
} from '../../../services/help-resources.service';

interface Pdf {
  nombre: string;
  descripcion: string;
  tag: string;
  claseIcono: string;
  url: string;
}

interface Institucion {
  tipo: string;
  claseTag: string;
  nombre: string;
  ubicacion: string;
  telefono: string;
  horario: string;
}

interface Hotline {
  nombre: string;
  numero: string;
  horario: string;
}

const clasesIconoPdf = [
  'pdf-icon--blue',
  'pdf-icon--red',
  'pdf-icon--green',
  'pdf-icon--purple',
  'pdf-icon--tan',
  'pdf-icon--gray',
];

@Component({
  imports: [HeaderUserComponent],
  selector: 'app-help-resources',
  styleUrl: './help-resources.scss',
  templateUrl: './help-resources.html',
})
export class HelpResources implements OnInit {
  private readonly helpResourcesService = inject(HelpResourcesService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly pdfs = signal<Pdf[]>([]);
  protected readonly hotlines = signal<Hotline[]>([]);
  protected readonly instituciones = signal<Institucion[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal(false);

  protected institucionSeleccionada: Institucion | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.cargar();
  }

  protected reintentar(): void {
    this.cargar();
  }

  private cargar(): void {
    this.error.set(false);
    this.cargando.set(true);

    forkJoin({
      recursos: this.helpResourcesService.getHelpResources(),
      guias: this.helpResourcesService.getEducationalGuides(),
    }).subscribe({
      next: ({ recursos, guias }) => {
        this.pdfs.set(HelpResources.guiasAPdfs(guias));
        this.hotlines.set(
          recursos.filter((r) => r.type === 'emergency_line').map(HelpResources.aHotline),
        );
        this.instituciones.set(
          recursos.filter((r) => r.type !== 'emergency_line').map(HelpResources.aInstitucion),
        );
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set(true);
      },
    });
  }

  protected abrirDetalle(institucion: Institucion): void {
    this.institucionSeleccionada = institucion;
  }

  protected cerrarModal(): void {
    this.institucionSeleccionada = null;
  }

  private static guiasAPdfs(guias: EducationalGuide[]): Pdf[] {
    return guias.map((guia, index) => ({
      nombre: guia.title,
      descripcion: guia.description ?? '',
      tag: guia.category ? HelpResources.tituloCategoria(guia.category) : 'General',
      claseIcono: clasesIconoPdf[index % clasesIconoPdf.length],
      url: guia.pdf_file_url,
    }));
  }

  private static tituloCategoria(categoria: string): string {
    return categoria
      .split(' - ')
      .map((palabra) => palabra.trim().charAt(0).toUpperCase() + palabra.trim().slice(1))
      .join(' - ');
  }

  private static aHotline(recurso: HelpResource): Hotline {
    const soloDigitos = (recurso.phone ?? '').replace(/\D/g, '');
    return {
      nombre: recurso.name,
      numero: HelpResources.formatearTelefono(soloDigitos.replace(/^502(?=\d{8})/, '')),
      horario: recurso.schedule ?? '24 horas',
    };
  }

  private static aInstitucion(recurso: HelpResource): Institucion {
    const esRefugio = recurso.type === 'shelter';
    return {
      tipo: esRefugio ? 'Refugio' : 'Centro de apoyo',
      claseTag: esRefugio ? 'institucion-tag--shelter' : 'institucion-tag--support',
      nombre: recurso.name,
      ubicacion: recurso.address ?? [recurso.city, recurso.department].filter(Boolean).join(', '),
      telefono: HelpResources.formatearTelefono(recurso.phone),
      horario: recurso.schedule ?? 'Sin horario',
    };
  }

  private static formatearTelefono(telefono: string | null): string {
    if (!telefono) return '';
    const soloDigitos = telefono.replace(/\D/g, '');
    return soloDigitos.length === 8
      ? `${soloDigitos.slice(0, 4)}-${soloDigitos.slice(4)}`
      : telefono;
  }
}