import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CategoriaStat {
  categoria: string;
  cantidad: number;
  porcentaje: number;
}

export interface DepartamentoStat {
  departamento_id: string;
  nombre_departamento: string;
  total_denuncias: number;
  desglose_por_categoria: CategoriaStat[];
}

export interface Dashboard {
  total_denuncias_nacional: number;
  total_departamentos: number;
  departamentos: DepartamentoStat[];
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>('/api/stats/dashboard');
  }
}