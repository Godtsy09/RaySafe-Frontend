import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TrackReport } from './track-report';
import { ReportService } from '../../../services/report.service';

describe('TrackReport', () => {
  let component: TrackReport;
  let fixture: ComponentFixture<TrackReport>;

  const infoBasica = {
    public_id: 'RS-2026-0123',
    report_status_id: 2,
    status_name: 'En Investigación',
    abuse_type_name: 'Maltrato animal',
    abuse_type_category: 'animal',
    created_at: '2026-09-20T10:00:00.000Z',
    updated_at: '2026-09-24T10:00:00.000Z',
  };

  const infoCompleta = {
    ...infoBasica,
    abuse_type_id: 2,
    institution_id: 2,
    institution_name: 'Refugio San Francisco',
    description: 'Descripción completa de la denuncia',
    specific_address: 'Zona 1, Calle 2',
    location_id: 1,
    city: 'Guatemala',
    department: 'Guatemala',
    notification_email: 'test@example.com',
  };

  const evidencias = [
    {
      id: 1,
      fileType: 'image',
      fileUrl: '/uploads/evidence/foto-evidencia.png',
      description: null,
      uploadedAt: '2026-09-24T12:00:00.000Z',
    },
  ];

const estados = [
    { id: 1, name: 'Recibida', sort_order: 1 },
    { id: 2, name: 'En Investigación', sort_order: 2 },
    { id: 3, name: 'Resuelta', sort_order: 3 },
    { id: 4, name: 'Desestimada', sort_order: 4 },
  ];

  const mockReportService = {
    trackReport: vi.fn(),
    getEvidence: vi.fn(() => of(evidencias)),
    getReportStatuses: vi.fn(() => of(estados)),
    uploadEvidence: vi.fn(() =>
      of({
        id: 2,
        fileType: 'document',
        fileUrl: '/uploads/evidence/nuevo.txt',
        description: null,
        uploadedAt: '2026-09-24T13:00:00.000Z',
      })
    ),
    updateEvidenceDescription: vi.fn(() =>
      of({
        id: 1,
        fileType: 'image',
        fileUrl: '/uploads/evidence/foto-evidencia.png',
        description: 'Descripción corregida',
        uploadedAt: '2026-09-24T12:00:00.000Z',
      })
    ),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [TrackReport],
      providers: [
        provideRouter([]),
        { provide: ReportService, useValue: mockReportService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function consultar(): Promise<void> {
    return (component as never as { consultarDenuncia: () => Promise<void> }).consultarDenuncia();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show limited info when consulting without token', async () => {
    (component as any).idPublico = 'RS-2026-0123';
    mockReportService.trackReport.mockReturnValueOnce(of(infoBasica));

    await consultar();
    fixture.detectChanges();

expect(mockReportService.trackReport).toHaveBeenCalledWith('RS-2026-0123', undefined);
    expect(mockReportService.getEvidence).not.toHaveBeenCalled();
    expect(mockReportService.getReportStatuses).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('RS-2026-0123');
    expect(fixture.nativeElement.textContent).toContain('En Investigación');
    expect(fixture.nativeElement.textContent).toContain('Recibida');
    expect(fixture.nativeElement.textContent).toContain('Resuelta');
    expect(fixture.nativeElement.textContent).toContain('Desestimada');
    expect(fixture.nativeElement.textContent).not.toContain('Detalles completos');
  });

it('should show complete info and evidence when consulting with token', async () => {
    (component as any).idPublico = 'RS-2026-0123';
    (component as any).tokenSecreto = 'TOKEN-DEMO-1234';
    mockReportService.trackReport.mockReturnValueOnce(of(infoCompleta));

    await consultar();
    fixture.detectChanges();

    expect(mockReportService.trackReport).toHaveBeenCalledWith('RS-2026-0123', 'TOKEN-DEMO-1234');
    expect(mockReportService.getEvidence).toHaveBeenCalledWith('RS-2026-0123', 'TOKEN-DEMO-1234');
    expect(fixture.nativeElement.textContent).toContain('Detalles completos');
    expect(fixture.nativeElement.textContent).toContain('Descripción completa de la denuncia');
    expect(fixture.nativeElement.textContent).toContain('Refugio San Francisco');
    expect(fixture.nativeElement.textContent).toContain('test@example.com');
    expect(fixture.nativeElement.textContent).toContain('Evidencia');
    expect(fixture.nativeElement.textContent).toContain('(1)');

    const header = fixture.nativeElement.querySelector('.evidencia-header') as HTMLButtonElement;
    expect(header).toBeTruthy();
    header.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('foto-evidencia.png');
  });

  it('should keep evidence collapsed by default', async () => {
    (component as any).idPublico = 'RS-2026-0123';
    (component as any).tokenSecreto = 'TOKEN-DEMO-1234';
    mockReportService.trackReport.mockReturnValueOnce(of(infoCompleta));

    await consultar();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Evidencia');
    expect(fixture.nativeElement.textContent).toContain('(1)');
    expect(fixture.nativeElement.textContent).not.toContain('foto-evidencia.png');
  });

  it('should show the error message when the token is invalid', async () => {
    (component as any).idPublico = 'RS-2026-0123';
    (component as any).tokenSecreto = 'TOKEN-INVALIDO';
    mockReportService.trackReport.mockReturnValueOnce(
      throwError(() => ({ error: { error: 'Token inválido' } }))
    );

    await consultar();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No se pudo consultar la denuncia');
    expect(fixture.nativeElement.textContent).toContain('Token inválido');
    expect(fixture.nativeElement.textContent).not.toContain('Detalles completos');
  });

  it('should not consult when the public id is empty', async () => {
    await consultar();

    expect(mockReportService.trackReport).not.toHaveBeenCalled();
  });

it('should upload new evidence with its description and refresh the list', async () => {
    (component as any).idPublico = 'RS-2026-0123';
    (component as any).tokenSecreto = 'TOKEN-DEMO-1234';
    (component as any).descripcionEvidencia = 'Fotografía del estado del animal';
    mockReportService.trackReport.mockReturnValueOnce(of(infoCompleta));

    await consultar();
    fixture.detectChanges();

    const file = new File(['x'], 'nuevo.txt', { type: 'text/plain' });
    const input = {
      target: { files: [file], value: '' },
    } as unknown as Event;

    await (component as never as {
      onEvidenciasNuevas: (event: Event) => Promise<void>;
    }).onEvidenciasNuevas(input);
    fixture.detectChanges();

    expect(mockReportService.uploadEvidence).toHaveBeenCalledWith(
      'RS-2026-0123',
      'TOKEN-DEMO-1234',
      file,
      'Fotografía del estado del animal'
    );

    (fixture.nativeElement.querySelector('.evidencia-header') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('foto-evidencia.png');
  });

  it('should add dropped files as evidence', async () => {
    (component as any).idPublico = 'RS-2026-0123';
    (component as any).tokenSecreto = 'TOKEN-DEMO-1234';
    mockReportService.trackReport.mockReturnValueOnce(of(infoCompleta));

    await consultar();
    fixture.detectChanges();

    const file = new File(['x'], 'arrastrado.png', { type: 'image/png' });
    const drop = {
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
      dataTransfer: { files: [file] },
    } as unknown as DragEvent;

    await (component as never as {
      onDropArchivos: (event: DragEvent) => Promise<void>;
    }).onDropArchivos(drop);

    expect(mockReportService.uploadEvidence).toHaveBeenCalledWith(
      'RS-2026-0123',
      'TOKEN-DEMO-1234',
      file,
      undefined
    );
  });

  it('should update the description of an existing evidence', async () => {
    (component as any).idPublico = 'RS-2026-0123';
    (component as any).tokenSecreto = 'TOKEN-DEMO-1234';
    mockReportService.trackReport.mockReturnValueOnce(of(infoCompleta));

    await consultar();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.evidencia-header') as HTMLButtonElement).click();
    fixture.detectChanges();

    (component as never as {
      empezarEdicion: (item: (typeof evidencias)[number]) => void;
    }).empezarEdicion(evidencias[0]);
    (component as any).edicionBorrador = 'Descripción corregida';
    await (component as never as {
      guardarEdicion: () => Promise<void>;
    }).guardarEdicion();
    fixture.detectChanges();

    expect(mockReportService.updateEvidenceDescription).toHaveBeenCalledWith(
      'RS-2026-0123',
      'TOKEN-DEMO-1234',
      1,
      'Descripción corregida'
    );
    expect(fixture.nativeElement.textContent).toContain('Descripción corregida');
  });
});
