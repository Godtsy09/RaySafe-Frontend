import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderAdminComponent } from '../../../components/headers/header-admin/header-admin';

@Component({
  imports: [HeaderAdminComponent],
  selector: 'app-register-agent',
  styleUrl: './register-agent.scss',
  templateUrl: './register-agent.html',
})
export class RegisterAgent {
  private readonly router = inject(Router);

  registrar(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/agent-list']);
  }
}
