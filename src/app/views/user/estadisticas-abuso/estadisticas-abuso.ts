import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderUserComponent } from '../../../components/headers/header-user/header-user';

interface Departamento {
  nombre: string;
  total: number;
}

interface DesgloseItem {
  tipo: string;
  cantidad: number;
  ancho: number;
}

@Component({
  selector: 'app-estadisticas-de-abuso',
  imports: [CommonModule, HeaderUserComponent],
  templateUrl: './estadisticas-abuso.html',
  styleUrl: './estadisticas-abuso.css',
})
export class EstadisticasDeAbuso {
  //Datos como ejemplo, ya con el ednpoint de las estadisticas,
  //este arreglo se reemplaza por la respuesta
  protected readonly departamentos: Departamento[] = [
    { nombre: 'Petén', total: 44 },
    { nombre: 'Huehuetenango', total: 67 },
    { nombre: 'Alta Verapaz', total: 89 },
    { nombre: 'Quiché', total: 33 },
    { nombre: 'Izabal', total: 34 },
    { nombre: 'San Marcos', total: 72 },
    { nombre: 'Totonicapán', total: 41 },
    { nombre: 'Baja Verapaz', total: 18 },
    { nombre: 'Zacapa', total: 22 },
    { nombre: 'Quetzaltenango', total: 95 },
    { nombre: 'Sololá', total: 23 },
    { nombre: 'Chiquimula', total: 16 },
    { nombre: 'El Progreso', total: 39 },
    { nombre: 'Retalhuleu', total: 44 },
    { nombre: 'Chimaltenango', total: 61 },
    { nombre: 'Jalapa', total: 12 },
    { nombre: 'Suchitepéquez', total: 52 },
    { nombre: 'Sacatepéquez', total: 29 },
    { nombre: 'Jutiapa', total: 58 },
    { nombre: 'Escuintla', total: 76 },
    { nombre: 'Guatemala', total: 145 },
    { nombre: 'Santa Rosa', total: 43 },
  ];

  protected readonly totalNacional = 1156;
  protected readonly totalDepartamentos = 22;

  private readonly maxTotal = Math.max(...this.departamentos.map((d) => d.total));

  private readonly tiposAbuso = [
    { tipo: 'Abuso animal', porcentaje: 0.36 },
    { tipo: 'Abuso infantil', porcentaje: 0.4 },
    { tipo: 'Violencia de género', porcentaje: 0.19 },
    { tipo: 'Abuso sexual', porcentaje: 0.05 },
  ];

  protected readonly departamentoSeleccionado = signal<Departamento | null>(null);

  protected seleccionar(depto: Departamento): void {
    this.departamentoSeleccionado.set(depto);
  }

  protected cerrarDetalle(): void {
    this.departamentoSeleccionado.set(null);
  }

  protected claseColor(total: number): string {
    const ratio = total / this.maxTotal;

    if (ratio >= 0.75) return 'depto-nivel-4';
    if (ratio >= 0.5) return 'depto-nivel-3';
    if (ratio >= 0.25) return 'depto-nivel-2';
    return 'depto-nivel-1';
  }

  protected desglose(depto: Departamento): DesgloseItem[] {
    const cantidades = this.tiposAbuso.map((t) => ({
      tipo: t.tipo,
      cantidad: Math.round(depto.total * t.porcentaje),
    }));

    const maxCantidad = Math.max(...cantidades.map((c) => c.cantidad), 1);

    return cantidades.map((c) => ({
      ...c,
      ancho: (c.cantidad / maxCantidad) * 100,
    }));
  }
}