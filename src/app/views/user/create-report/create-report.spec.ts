import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CreateReport } from './create-report';
import { ReportService } from '../../../services/report.service';

describe('CreateReport', () => {
  let component: CreateReport;
  let fixture: ComponentFixture<CreateReport>;

  const tiposAbuso = [
    { id: 1, category: 'human', name: 'Abuso infantil', description: null },
    { id: 2, category: 'animal', name: 'Maltrato animal', description: null },
  ];

  const departamentos = ['Guatemala', 'Petén'];

  const municipios = [
    { id: 1, city: 'Guatemala', department: 'Guatemala' },
    { id: 2, city: 'Mixco', department: 'Guatemala' },
  ];

  const denunciaCreada = {
    id: 123,
    public_id: 'RS-2026-0123',
    token: 'TOKEN-DEMO-1234',
    abuse_type_id: 2,
    report_status_id: 1,
    institution_id: 2,
    description: 'Descripción de prueba',
    specific_address: null,
    location_id: null,
    risk_level: null,
    notification_email: null,
    created_at: '2026-09-24T12:00:00.000Z',
  };

  const mockReportService = {
    getAbuseTypes: vi.fn(() => of(tiposAbuso)),
    getDepartments: vi.fn(() => of(departamentos)),
    getMunicipalities: vi.fn(() => of(municipios)),
    createReport: vi.fn(() => of(denunciaCreada)),
    uploadEvidence: vi.fn(() =>
      of({
        id: 1,
        fileType: 'document',
        fileUrl: '/uploads/evidence/archivo.txt',
        description: null,
        uploadedAt: '2026-09-24T12:00:00.000Z',
      })
    ),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [CreateReport],
      providers: [
        provideRouter([]),
        { provide: ReportService, useValue: mockReportService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  function llenarCampos(): void {
    (component as any).categoria = 'animal';
    (component as any).tipoAbuso = '2';
    (component as any).descripcion = 'Descripción de prueba';
    (component as any).departamento = 'Guatemala';
    (component as never as { onDepartamentoChange: () => void }).onDepartamentoChange();
    (component as any).municipio = 'Mixco';
    (component as any).direccion = 'Zona 1, Calle 2';
    (component as any).email = 'test@example.com';
    fixture.detectChanges();
  }

async function enviar(): Promise<void> {
    await (component as any).enviarDenuncia(new Event('submit'));
    fixture.detectChanges();
  }

  it('should create and load catalogs', () => {
    expect(component).toBeTruthy();
    expect(mockReportService.getAbuseTypes).toHaveBeenCalled();
    expect(mockReportService.getDepartments).toHaveBeenCalled();
    expect((component as any).tiposAbuso().length).toBe(2);
    expect((component as any).departamentos().length).toBe(2);
  });

it('should not call the backend when required fields are missing', async () => {
    (component as any).categoria = '';
    (component as any).tipoAbuso = '';
    (component as any).descripcion = '';
    fixture.detectChanges();

    await enviar();

    expect((component as any).errorDenuncia).toBe(true);
    expect((component as any).mensajeError).toContain('Completa la categoría');
    expect(mockReportService.createReport).not.toHaveBeenCalled();
  });

  it('should create the report and show the success modal with id and token', async () => {
    llenarCampos();

    await enviar();

    expect(mockReportService.createReport).toHaveBeenCalledWith({
      abuse_type_id: 2,
      description: 'Descripción de prueba',
      specific_address: 'Zona 1, Calle 2',
      location_id: 2,
      notification_email: 'test@example.com',
    });
    expect(fixture.nativeElement.textContent).toContain('Denuncia realizada');
    expect(fixture.nativeElement.textContent).toContain('RS-2026-0123');
    expect(fixture.nativeElement.textContent).toContain('TOKEN-DEMO-1234');
    expect(fixture.nativeElement.textContent).toContain('Token de seguimiento');
  });

it('should upload selected evidence with its description after creating the report', async () => {
    llenarCampos();

    const file = new File(['contenido'], 'prueba.txt', { type: 'text/plain' });
    (component as any).archivos = [
      {
        nombre: 'prueba.txt',
        tamano: 9,
        tipo: 'text/plain',
        file,
        estado: 'pendiente',
        descripcion: 'Boleta del veterinario',
      },
    ];
    fixture.detectChanges();

    await enviar();

    expect(mockReportService.uploadEvidence).toHaveBeenCalledTimes(1);
    expect(mockReportService.uploadEvidence).toHaveBeenCalledWith(
      'RS-2026-0123',
      'TOKEN-DEMO-1234',
      file,
      'Boleta del veterinario'
    );
    expect(fixture.nativeElement.textContent).toContain('Denuncia realizada');
  });

  it('should show the error modal when the backend fails', async () => {
    llenarCampos();
    mockReportService.createReport.mockReturnValueOnce(
      throwError(() => ({ error: { error: 'Error interno del servidor' } }))
    );

    await enviar();

    expect(fixture.nativeElement.textContent).toContain('Error al enviar denuncia');
    expect(fixture.nativeElement.textContent).toContain('Error interno del servidor');
  });

  it('should reset the form when closing the success modal', async () => {
    llenarCampos();

    await enviar();

    const accept = fixture.debugElement.nativeElement.querySelector(
      '.modal-box--feedback .btn-confirm'
    ) as HTMLButtonElement;
    accept.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Denuncia realizada');
    expect((component as any).descripcion).toBe('');
    expect((component as any).archivos.length).toBe(0);

    await enviar();
    expect(fixture.nativeElement.textContent).toContain('Error al enviar denuncia');
  });
});
