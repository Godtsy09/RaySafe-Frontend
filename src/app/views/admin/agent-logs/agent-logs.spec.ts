import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentLogs } from './agent-logs';

describe('AgentLogs', () => {
  let component: AgentLogs;
  let fixture: ComponentFixture<AgentLogs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentLogs],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentLogs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
