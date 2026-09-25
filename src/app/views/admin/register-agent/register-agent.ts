import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderAdminComponent } from '../../../components/headers/header-admin/header-admin';
import { AgentService, CreateAgentPayload } from '../../../services/agent.service';

@Component({
  imports: [HeaderAdminComponent, FormsModule],
  selector: 'app-register-agent',
  styleUrl: './register-agent.scss',
  templateUrl: './register-agent.html',
})
export class RegisterAgent {
  private readonly router = inject(Router);
  private readonly agentService = inject(AgentService);
  private readonly platformId = inject(PLATFORM_ID);

  protected formData: CreateAgentPayload = {
    name: '',
    email: '',
    password: '',
    role: 'agent',
  };

  protected submitting = false;
  protected error = '';
  protected success = false;

  registrar(event: Event): void {
    event.preventDefault();

    if (this.submitting) return;

    this.error = '';
    this.success = false;

    if (!this.formData.name.trim() || !this.formData.email.trim() || !this.formData.password.trim()) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    if (this.formData.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.submitting = true;

    this.agentService.createAgent(this.formData).subscribe({
      next: () => {
        this.submitting = false;
        this.success = true;
        this.formData = { name: '', email: '', password: '', role: 'agent' };

        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            this.router.navigate(['/agent-list']);
          }, 1500);
        }
      },
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.error ?? 'Error al crear el agente. Inténtalo de nuevo.';
      },
    });
  }
}