import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentList } from './agent-list';

describe('AgentList', () => {
  let component: AgentList;
  let fixture: ComponentFixture<AgentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentList],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
