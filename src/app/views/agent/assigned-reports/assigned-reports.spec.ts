import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { AssignedReports } from './assigned-reports';
import { AssignedReportItem, ReportDetail } from '../../../services/agent-report.service';

const unReporte: AssignedReportItem = {
  id: 3,
  publicId: 'RS-0003',
  abuseType: 'Abuso sexual',
  createdAt: '2026-02-01T08:00:00.000Z',
  city: 'Cobán',
  department: 'Alta Verapaz',
  status: 'En Investigación',
  riskLevel: 'high',
};

const detalleBase: ReportDetail = {
  id: 3,
  publicId: 'RS-0003',
  riskLevel: 'high',
  description: 'Relato de prueba',
  specificAddress: 'Zona 5',
  createdAt: '2026-02-01T08:00:00.000Z',
  abuseType: { id: 1, name: 'Abuso sexual', category: 'human' },
  status: { id: 2, name: 'En Investigación' },
  location: { city: 'Cobán', department: 'Alta Verapaz' },
  agent: { id: 1, name: 'Ana Pérez', email: 'ana@raysafe.gt', active: true },
  evidence: [
    {
      id: 5,
      fileType: 'image/png',
      fileUrl: 'http://localhost:3000/uploads/prueba.png',
      description: 'Foto',
      uploadedAt: '2026-02-01T08:05:00.000Z',
    },
  ],
  notes: [
    { id: 2, content: 'Se llamó a la institución', agentName: 'Ana Pérez', createdAt: '2026-02-02T09:00:00.000Z' },
  ],
  statusHistory: [
    {
      id: 1,
      previousStatusName: 'Recibida',
      newStatusName: 'En Investigación',
      agentName: 'Ana Pérez',
      comment: 'Agente tomó la denuncia',
      date: '2026-02-01T09:00:00.000Z',
    },
  ],
};

describe('AssignedReports', () => {
  let component: AssignedReports;
  let fixture: ComponentFixture<AssignedReports>;
  let httpMock: HttpTestingController;

  const crear = (): void => {
    fixture = TestBed.createComponent(AssignedReports);
    component = fixture.componentInstance;
  };

  /** ngOnInit dispara dos peticiones: la lista y el catálogo de estados. */
  const flushIniciales = (data: AssignedReportItem[]): void => {
    fixture.detectChanges();

    httpMock
      .expectOne((r) => r.url === '/api/agent/reports')
      .flush({ total: data.length, page: 1, totalPages: 1, data });
    httpMock
      .expectOne((r) => r.url === '/api/report-statuses')
      .flush([{ id: 1, name: 'Recibida' }, { id: 2, name: 'En Investigación' }]);

    fixture.detectChanges();
  };

  const abrirDetalle = (detalle: ReportDetail): HTMLElement => {
    (fixture.nativeElement.querySelector('.btn-info') as HTMLButtonElement).click();
    fixture.detectChanges();

    httpMock
      .expectOne((r) => r.url === '/api/agent/reports/3')
      .flush(detalle);
    fixture.detectChanges();

    return fixture.nativeElement.querySelector('.modal-large') as HTMLElement;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignedReports],
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

  it('renderiza tipo de abuso y ubicación con el helper, sin optional chains', () => {
    crear();
    flushIniciales([unReporte]);

    const modal = abrirDetalle(detalleBase);

    expect(modal.textContent).toContain('Abuso sexual (Humano)');
    expect(modal.textContent).toContain('Cobán, Alta Verapaz ・ Zona 5');
  });

  it('renderiza evidencia, notas e historial cuando vienen poblados', () => {
    crear();
    flushIniciales([unReporte]);

    const modal = abrirDetalle(detalleBase);

    expect(modal.textContent).toContain('1 adjuntos');
    expect(modal.textContent).toContain('prueba.png');
    expect(modal.textContent).toContain('Se llamó a la institución');
    expect(modal.textContent).toContain('En Investigación');
  });

  it('soporta las tres colecciones vacías: el backend siempre manda arrays', () => {
    crear();
    flushIniciales([unReporte]);

    // Este es el test que fija el contrato: si el backend empezara a mandar
    // null en vez de [], la vista reventaría aquí en lugar de en producción.
    const modal = abrirDetalle({
      ...detalleBase,
      evidence: [],
      notes: [],
      statusHistory: [],
    });

    expect(modal.textContent).toContain('0 adjuntos');
    expect(modal.textContent).toContain('Sin evidencia adjunta');
    expect(modal.textContent).toContain('Sin notas registradas');
    expect(modal.textContent).toContain('Sin cambios de estado registrados');
  });
});
