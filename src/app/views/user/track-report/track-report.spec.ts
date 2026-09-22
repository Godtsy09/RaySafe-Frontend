import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackReport } from './track-report';

describe('TrackReport', () => {
  let component: TrackReport;
  let fixture: ComponentFixture<TrackReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackReport],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
