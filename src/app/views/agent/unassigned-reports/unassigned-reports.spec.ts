import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnassignedReports } from './unassigned-reports';

describe('UnassignedReports', () => {
  let component: UnassignedReports;
  let fixture: ComponentFixture<UnassignedReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnassignedReports],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(UnassignedReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
