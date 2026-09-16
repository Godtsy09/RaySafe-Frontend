import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignedReports } from './assigned-reports';

describe('AssignedReports', () => {
  let component: AssignedReports;
  let fixture: ComponentFixture<AssignedReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignedReports],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignedReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
