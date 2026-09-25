import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { UnassignedReports } from './unassigned-reports';
import {
  EvidenceItem,
  TakenReportDetail,
  UnassignedReportDetail,
  UnassignedReportItem,
} from '../../../services/agent-report.service';

const unaDenuncia: UnassignedReportItem = {
  id: 7,
  public_id: 'RS-0007',
  abuse_type: 'Violencia psicológica',
  ubicacion: 'Guatemala, Guatemala',
  estado: 'Recibida',
  created_at: '2026-01-15T10:30:00.000Z',
};

const unDetalle: UnassignedReportDetail = {
  id: 7,
  public_id: 'RS-0007',
  nivel_riesgo: 'high',
  tipo_abuso: 'Violencia psicológica',
  fecha_creacion: '2026-01-15T10:30:00.000Z',
  ubicacion: 'Guatemala, Guatemala',
  direccion_especifica: 'Zona 5',
  descripcion: 'Relato de prueba',
  evidencia: [
    {
      id: 99,
      fileType: 'image/jpeg',
      fileUrl: 'http://localhost:3000/uploads/evidencia.jpg',
      description: 'Captura',
      uploadedAt: '2026-01-15T10:31:00.000Z',
    } satisfies EvidenceItem,
  ],
};

describe('UnassignedReports', () => {
  let component: UnassignedReports;
  let fixture: ComponentFixture<UnassignedReports>;
  let httpMock: HttpTestingController;

  const crear = (): void => {
    fixture = TestBed.createComponent(UnassignedReports);
    component = fixture.componentInstance;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnassignedReports],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    crear();
    expect(component).toBeTruthy();
  });

  it('carga la primera página y pinta la ubicación como texto', () => {
    crear();
    fixture.detectChanges();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/agent/reports/unassigned' && r.params.get('page') === '1',
    );
    expect(req.request.method).toBe('GET');

    req.flush({ total: 1, page: 1, totalPages: 1, data: [unaDenuncia] });
    fixture.detectChanges();

    const tabla = fixture.nativeElement.querySelector('.logs-table') as HTMLElement;
    expect(tabla.textContent).toContain('RS-0007');
    expect(tabla.textContent).toContain('Guatemala, Guatemala');
    expect(tabla.textContent).toContain('Recibida');
  });

  it('abrir el detalle no borra la tabla y muestra las evidencias', () => {
    crear();
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url === '/api/agent/reports/unassigned')
      .flush({ total: 1, page: 1, totalPages: 1, data: [unaDenuncia] });
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.action-buttons button') as HTMLButtonElement).click();
    fixture.detectChanges();

    // Durante la carga del detalle la tabla sigue mostrando la denuncia.
    expect((fixture.nativeElement.querySelector('.logs-table') as HTMLElement).textContent)
      .toContain('RS-0007');

    httpMock
      .expectOne((r) => r.url === '/api/agent/reports/unassigned/7')
      .flush(unDetalle);
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('.modal-large') as HTMLElement;
    expect(modal.textContent).toContain('Zona 5');
    expect(modal.textContent).toContain('evidencia.jpg');
  });

  it('envía el riesgo seleccionado, deshabilita el botón y recarga el pool', () => {
    crear();
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url === '/api/agent/reports/unassigned')
      .flush({ total: 1, page: 1, totalPages: 1, data: [unaDenuncia] });
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.action-buttons button') as HTMLButtonElement).click();
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url === '/api/agent/reports/unassigned/7')
      .flush(unDetalle);
    fixture.detectChanges();

    (fixture.nativeElement.querySelectorAll('.modal-footer-detail button')[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('.form-control') as HTMLSelectElement;
    select.value = 'critical';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const botones = fixture.nativeElement.querySelectorAll('.modal-footer-confirm button');
    (botones[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url === '/api/agent/reports/unassigned/7/take');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ risk_level: 'critical' });

    // Durante el envío el botón queda deshabilitado y la tabla no parpadea.
    expect((botones[1] as HTMLButtonElement).disabled).toBe(true);
    expect((fixture.nativeElement.querySelector('.logs-table') as HTMLElement).textContent)
      .toContain('RS-0007');

    req.flush({
      message: 'Denuncia asignada correctamente',
      report: {
        id: 7,
        public_id: 'RS-0007',
        nivel_riesgo: 'critical',
        tipo_abuso: 'Violencia psicológica',
        estado: 'En Investigación',
        agente_asignado: { id: 1, name: 'Agente Uno' },
        fecha_asignacion: '2026-01-15T10:40:00.000Z',
      } satisfies TakenReportDetail,
    });
    fixture.detectChanges();

    // Tras tomar la denuncia se recarga el pool.
    httpMock
      .expectOne((r) => r.url === '/api/agent/reports/unassigned')
      .flush({ total: 0, page: 1, totalPages: 0, data: [] });
    fixture.detectChanges();

    expect((fixture.nativeElement.querySelector('.logs-table') as HTMLElement).textContent)
      .toContain('No hay denuncias sin atender');
  });
});
