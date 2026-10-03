import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { HeaderAdminComponent } from './header-admin';

describe('HeaderAdminComponent', () => {
  let component: HeaderAdminComponent;
  let fixture: ComponentFixture<HeaderAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderAdminComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderAdminComponent);
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
});