import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbuseStats } from './abuse-stats';

describe('AbuseStats', () => {
  let component: AbuseStats;
  let fixture: ComponentFixture<AbuseStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbuseStats],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AbuseStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
