import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderAgentComponent } from './header-agent';

describe('HeaderAgentComponent', () => {
  let component: HeaderAgentComponent;
  let fixture: ComponentFixture<HeaderAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderAgentComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});