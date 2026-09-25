import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HeaderUserComponent } from '../../../components/headers/header-user/header-user';
import { StatsService } from '../../../services/stats.service';

interface Departamento {
  nombre: string;
  total: number;
  desglose: { categoria: string; cantidad: number; porcentaje: number }[];
}

interface DesgloseItem {
  tipo: string;
  cantidad: number;
  ancho: number;
}

@Component({
  selector: 'app-abuse-stats',
  imports: [CommonModule, HeaderUserComponent],
  templateUrl: './abuse-stats.html',
  styleUrl: './abuse-stats.scss',
})
export class AbuseStats implements OnInit {
  private readonly statsService = inject(StatsService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly departamentos = signal<Departamento[]>([]);
  protected readonly totalNacional = signal(0);
  protected readonly totalDepartamentos = signal(0);
  protected readonly cargando = signal(true);
  protected readonly error = signal(false);

  protected readonly departamentoSeleccionado = signal<Departamento | null>(null);

  private readonly maxTotal = computed(() =>
    Math.max(...this.departamentos().map((d) => d.total), 0),
  );

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.cargarDashboard();
  }

  protected reintentar(): void {
    this.cargarDashboard();
  }

  private cargarDashboard(): void {
    this.error.set(false);
    this.cargando.set(true);

    this.statsService.getDashboard().subscribe({
      next: (data) => {
        this.departamentos.set(
          data.departamentos.map((d) => ({
            nombre: d.nombre_departamento,
            total: d.total_denuncias,
            desglose: d.desglose_por_categoria,
          })),
        );
        this.totalNacional.set(data.total_denuncias_nacional);
        this.totalDepartamentos.set(data.total_departamentos);
        this.departamentoSeleccionado.set(null);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set(true);
      },
    });
  }

  protected seleccionar(depto: Departamento): void {
    this.departamentoSeleccionado.set(depto);
  }

  protected cerrarDetalle(): void {
    this.departamentoSeleccionado.set(null);
  }

  protected claseColor(total: number): string {
    const maxTotal = this.maxTotal();

    if (maxTotal === 0) return 'depto-nivel-1';

    const ratio = total / maxTotal;

    if (ratio >= 0.75) return 'depto-nivel-4';
    if (ratio >= 0.5) return 'depto-nivel-3';
    if (ratio >= 0.25) return 'depto-nivel-2';
    return 'depto-nivel-1';
  }

  protected desglose(depto: Departamento): DesgloseItem[] {
    const maxCantidad = Math.max(...depto.desglose.map((c) => c.cantidad), 1);

    return depto.desglose.map((c) => ({
      tipo: c.categoria,
      cantidad: c.cantidad,
      ancho: (c.cantidad / maxCantidad) * 100,
    }));
  }
}