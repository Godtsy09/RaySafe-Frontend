import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RegisterAgent } from './register-agent';
import { AgentService } from '../../../services/agent.service';

describe('RegisterAgent', () => {
  let component: RegisterAgent;
  let fixture: ComponentFixture<RegisterAgent>;

  const agenteCreado = {
    id: 7,
    name: 'Ana Pérez',
    email: 'ana@raysafe.gt',
    roleId: 1,
    roleName: 'agente',
    active: true,
  };

  const mockAgentService = {
    createAgent: vi.fn(() => of(agenteCreado)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RegisterAgent],
      providers: [provideRouter([]), { provide: AgentService, useValue: mockAgentService }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterAgent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function llenarCampos(): void {
    (component as any).formData = {
      name: 'Ana Pérez',
      email: 'ana@raysafe.gt',
      password: 'secreto123',
      role: 'agent',
    };
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate the required fields before calling the service', () => {
    (component as any).formData = { name: '', email: '', password: '', role: 'agent' };

    (component as any).registrar(new Event('submit'));

    expect((component as any).error()).toBe('Todos los campos son obligatorios');
    expect(mockAgentService.createAgent).not.toHaveBeenCalled();
  });

  it('should publish the success state through signals', () => {
    llenarCampos();

    (component as any).registrar(new Event('submit'));

    // Sin detectChanges manual: en zoneless la vista solo se actualiza si el estado
    // que la activa es un signal. Antes el boton se quedaba en "Creando...".
    expect((component as any).submitting()).toBe(false);
    expect((component as any).success()).toBe(true);
    expect((component as any).successMessage()).toContain('Agente creado correctamente');

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('creado correctamente');
    expect(fixture.nativeElement.textContent).toContain('Redirigiendo');
  });

  it('should publish the error state through signals', () => {
    llenarCampos();
    mockAgentService.createAgent.mockReturnValueOnce(
      throwError(() => ({ error: { error: 'El email ya está registrado' } }))
    );

    (component as any).registrar(new Event('submit'));

    expect((component as any).submitting()).toBe(false);
    expect((component as any).error()).toBe('El email ya está registrado');

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('El email ya está registrado');
  });
});
