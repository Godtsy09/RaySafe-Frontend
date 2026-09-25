import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HelpResources } from './help-resources';
import {
  EducationalGuide,
  HelpResource,
  HelpResourcesService,
} from '../../../services/help-resources.service';

describe('HelpResources', () => {
  let component: HelpResources;
  let fixture: ComponentFixture<HelpResources>;

  const recursosMock: HelpResource[] = [
    {
      id: 1,
      name: 'PNC - Línea de emergencia',
      type: 'emergency_line',
      address: null,
      phone: '50273742112',
      schedule: '24 horas',
      city: null,
      department: null,
    },
    {
      id: 5,
      name: 'Centro de Apoyo Integral a la Mujer (CAIMU)',
      type: 'support_center',
      address: 'Zona 1, Ciudad de Guatemala',
      phone: '36307574',
      schedule: 'Lunes a viernes 8:00-16:00',
      city: 'Cobán',
      department: 'Alta Verapaz',
    },
    {
      id: 9,
      name: 'Refugio de la Niñez',
      type: 'shelter',
      address: 'Zona 7, Ciudad de Guatemala',
      phone: '87127390',
      schedule: '24 horas',
      city: 'Cobán',
      department: 'Alta Verapaz',
    },
  ];

  const guiasMock: EducationalGuide[] = [
    {
      id: 1,
      title: 'Ley para Prevenir la Violencia Intrafamiliar',
      description: 'Marco legal guatemalteco.',
      category: 'prevención - humano',
      pdf_file_url: 'https://example.com/decreto.pdf',
    },
    {
      id: 6,
      title: 'Marco regulatorio de la UBA',
      description: 'Acuerdo ministerial.',
      category: 'actuación - animal',
      pdf_file_url: 'https://example.com/uba.pdf',
    },
  ];

  const asAny = (value: unknown): any => value;

  async function setup(service: Partial<HelpResourcesService>): Promise<void> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [HelpResources],
      providers: [
        provideRouter([]),
        { provide: HelpResourcesService, useValue: service },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpResources);
    component = fixture.componentInstance;
  }

  beforeEach(() =>
    setup({
      getHelpResources: () => of(recursosMock),
      getEducationalGuides: () => of(guiasMock),
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and map the resources on init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const vm = asAny(component);
    expect(vm.cargando()).toBe(false);
    expect(vm.error()).toBe(false);

    expect(vm.pdfs().length).toBe(2);
    expect(vm.pdfs()[0].nombre).toBe('Ley para Prevenir la Violencia Intrafamiliar');
    expect(vm.pdfs()[0].tag).toBe('Prevención - Humano');
    expect(vm.pdfs()[0].url).toBe('https://example.com/decreto.pdf');
    expect(vm.pdfs()[1].claseIcono).toBe('pdf-icon--red');
    expect(vm.pdfs()[1].tag).toBe('Actuación - Animal');

    expect(vm.hotlines().length).toBe(1);
    expect(vm.hotlines()[0].nombre).toBe('PNC - Línea de emergencia');
    expect(vm.hotlines()[0].numero).toBe('7374-2112');
    expect(vm.hotlines()[0].horario).toBe('24 horas');

    expect(vm.instituciones().length).toBe(2);
    expect(vm.instituciones()[0].tipo).toBe('Centro de apoyo');
    expect(vm.instituciones()[0].claseTag).toBe('institucion-tag--support');
    expect(vm.instituciones()[0].telefono).toBe('3630-7574');
    expect(vm.instituciones()[1].tipo).toBe('Refugio');
    expect(vm.instituciones()[1].claseTag).toBe('institucion-tag--shelter');
    expect(vm.instituciones()[1].ubicacion).toBe('Zona 7, Ciudad de Guatemala');
  });

  it('should open and close the institution detail modal', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const vm = asAny(component);
    const institucion = vm.instituciones()[0];

    vm.abrirDetalle(institucion);
    expect(vm.institucionSeleccionada).toBe(institucion);

    vm.cerrarModal();
    expect(vm.institucionSeleccionada).toBeNull();
  });

  it('should set the error state when the requests fail', async () => {
    await setup({
      getHelpResources: () => throwError(() => new Error('boom')),
      getEducationalGuides: () => throwError(() => new Error('boom')),
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const vm = asAny(component);
    expect(vm.error()).toBe(true);
    expect(vm.cargando()).toBe(false);
    expect(vm.pdfs().length).toBe(0);
  });
});