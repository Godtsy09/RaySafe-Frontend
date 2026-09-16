import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdjuntarEvidencia } from './adjuntar-evidencia';

describe('AdjuntarEvidencia', () => {
  let component: AdjuntarEvidencia;
  let fixture: ComponentFixture<AdjuntarEvidencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdjuntarEvidencia],
    }).compileComponents();

    fixture = TestBed.createComponent(AdjuntarEvidencia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
