import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RealizarDenunciaComponent } from './realizar-denuncia';

describe('RealizarDenunciaComponent', () => {
  let component: RealizarDenunciaComponent;
  let fixture: ComponentFixture<RealizarDenunciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealizarDenunciaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RealizarDenunciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});