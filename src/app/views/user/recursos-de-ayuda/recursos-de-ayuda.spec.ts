import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecursosDeAyuda } from './recursos-de-ayuda';

describe('RecursosDeAyuda', () => {
  let component: RecursosDeAyuda;
  let fixture: ComponentFixture<RecursosDeAyuda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecursosDeAyuda],
    }).compileComponents();

    fixture = TestBed.createComponent(RecursosDeAyuda);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
