import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { HeaderAgentComponent } from './header-agent';

@Component({ template: '' })
class StubComponent {}

describe('HeaderAgentComponent', () => {
  let component: HeaderAgentComponent;
  let fixture: ComponentFixture<HeaderAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderAgentComponent],
      providers: [
        provideRouter([
          { path: 'assigned-reports', component: StubComponent },
          { path: 'unassigned-reports', component: StubComponent },
        ]),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the logout option when clicking the avatar', () => {
    const avatar = fixture.debugElement.query(By.css('.avatar')).nativeElement;
    avatar.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Cerrar sesión');
  });

  it('should navigate to /login when clicking "Cerrar sesión" in the avatar menu', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const avatar = fixture.debugElement.query(By.css('.avatar')).nativeElement;
    avatar.click();
    fixture.detectChanges();

    const logoutItem = fixture.debugElement.query(By.css('.avatar-dropdown-item')).nativeElement;
    logoutItem.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should highlight "Denuncias" when on /assigned-reports', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/assigned-reports');
    await fixture.whenStable();
    fixture.detectChanges();

    const denuncias = fixture.debugElement.query(By.css('.center .nav-link')).nativeElement;
    const sinAtender = fixture.debugElement.query(By.css('.btn-sin-atender')).nativeElement;

    expect(denuncias.classList.contains('active')).toBe(true);
    expect(sinAtender.classList.contains('active')).toBe(false);
  });

  it('should highlight "Sin atender" when on /unassigned-reports', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/unassigned-reports');
    await fixture.whenStable();
    fixture.detectChanges();

    const denuncias = fixture.debugElement.query(By.css('.center .nav-link')).nativeElement;
    const sinAtender = fixture.debugElement.query(By.css('.btn-sin-atender')).nativeElement;

    expect(sinAtender.classList.contains('active')).toBe(true);
    expect(denuncias.classList.contains('active')).toBe(false);
  });
});