import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultarDenuncia } from './consultar-denuncia';

describe('ConsultarDenuncia', () => {
  let component: ConsultarDenuncia;
  let fixture: ComponentFixture<ConsultarDenuncia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarDenuncia],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultarDenuncia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
