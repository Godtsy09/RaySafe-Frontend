import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpResources } from './help-resources';

describe('HelpResources', () => {
  let component: HelpResources;
  let fixture: ComponentFixture<HelpResources>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpResources],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpResources);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
