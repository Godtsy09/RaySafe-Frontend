import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadisticasDeAbuso } from './estadisticas-abuso';

describe('EstadisticasDeAbuso', () => {
  let component: EstadisticasDeAbuso;
  let fixture: ComponentFixture<EstadisticasDeAbuso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticasDeAbuso],
    }).compileComponents();

    fixture = TestBed.createComponent(EstadisticasDeAbuso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
