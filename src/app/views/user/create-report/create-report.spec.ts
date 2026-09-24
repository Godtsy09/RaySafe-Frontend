import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CreateReport } from './create-report';

describe('CreateReport', () => {
  let component: CreateReport;
  let fixture: ComponentFixture<CreateReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateReport],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function setValue(selector: string, value: string): void {
    const el = fixture.debugElement.query(By.css(selector)).nativeElement as
      | HTMLInputElement
      | HTMLSelectElement;
    el.value = value;
    el.dispatchEvent(new Event('input'));
    el.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  function submit(): void {
    const form = fixture.debugElement.query(By.css('form')).nativeElement as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function fieldsLlenos(): void {
    setValue('select[name="tipoAbuso"]', 'abuso_infantil');
    setValue('select[name="nivelRiesgo"]', 'alto');
    setValue('textarea[name="descripcion"]', 'Descripción de prueba');
    setValue('input[name="direccion"]', 'Zona 1, Calle 2');
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the error modal when required fields are missing', () => {
    submit();

    expect(fixture.nativeElement.textContent).toContain('Error al enviar denuncia');
    expect(fixture.nativeElement.textContent).not.toContain('Denuncia realizada');
  });

  it('should show the success modal when required fields are filled', () => {
    fieldsLlenos();
    submit();

    expect(fixture.nativeElement.textContent).toContain('Denuncia realizada');
    expect(fixture.nativeElement.textContent).not.toContain('Error al enviar denuncia');
  });

  it('should reset the form when closing the success modal', () => {
    fieldsLlenos();
    submit();

    const accept = fixture.debugElement
      .query(By.css('.modal-box--feedback .btn-confirm'))
      .nativeElement as HTMLButtonElement;
    accept.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Denuncia realizada');

    submit();
    expect(fixture.nativeElement.textContent).toContain('Error al enviar denuncia');
  });
});