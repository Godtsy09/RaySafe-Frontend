import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});