import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AbuseStats } from './abuse-stats';
import { Dashboard, StatsService } from '../../../services/stats.service';

describe('AbuseStats', () => {
  let component: AbuseStats;
  let fixture: ComponentFixture<AbuseStats>;

  const dashboardMock: Dashboard = {
    total_denuncias_nacional: 121,
    total_departamentos: 22,
    departamentos: [
      {
        departamento_id: 'Alta Verapaz',
        nombre_departamento: 'Alta Verapaz',
        total_denuncias: 4,
        desglose_por_categoria: [{ categoria: 'ABUSO ANIMAL', cantidad: 3, porcentaje: 75 }],
      },
      {
        departamento_id: 'Petén',
        nombre_departamento: 'Petén',
        total_denuncias: 2,
        desglose_por_categoria: [{ categoria: 'ABUSO INFANTIL', cantidad: 2, porcentaje: 100 }],
      },
    ],
  };

  const asAny = (value: unknown): any => value;

  async function setup(statsService: Partial<StatsService>): Promise<void> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AbuseStats],
      providers: [
        provideRouter([]),
        { provide: StatsService, useValue: statsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AbuseStats);
    component = fixture.componentInstance;
  }

  beforeEach(() => setup({ getDashboard: () => of(dashboardMock) }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the dashboard data on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const vm = asAny(component);
    expect(vm.departamentos().length).toBe(2);
    expect(vm.departamentos()[0].nombre).toBe('Alta Verapaz');
    expect(vm.totalNacional()).toBe(121);
    expect(vm.totalDepartamentos()).toBe(22);
    expect(vm.cargando()).toBe(false);
    expect(vm.error()).toBe(false);
  });

  it('should show the real breakdown for a selected department', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const vm = asAny(component);
    vm.seleccionar(vm.departamentos()[0]);
    fixture.detectChanges();

    const desglose = vm.desglose(vm.departamentos()[0]);
    expect(desglose).toEqual([{ tipo: 'ABUSO ANIMAL', cantidad: 3, ancho: 100 }]);
  });

  it('should set the error state when the request fails', async () => {
    await setup({ getDashboard: () => throwError(() => new Error('boom')) });
    fixture.detectChanges();
    await fixture.whenStable();

    const vm = asAny(component);
    expect(vm.error()).toBe(true);
    expect(vm.cargando()).toBe(false);
  });
});