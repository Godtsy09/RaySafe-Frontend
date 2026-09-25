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
  protected successMessage = '';

  private buildErrorMessage(err: unknown): string {
    const body = (err as { error?: { error?: string; details?: Record<string, string[] | string> } })?.error;

    const details = body?.details;
    const emailDetails = details?.['email'];
    if (emailDetails) {
      return `El email no es válido. Debe tener el formato nombre@dominio.com, sin espacios. (${Array.isArray(emailDetails) ? emailDetails.join(' ') : String(emailDetails)})`;
    }

    if (details) {
      const detailText = Object.values(details)
        .map((messages) => (Array.isArray(messages) ? messages.join(' ') : String(messages)))
        .filter((message) => message.trim().length > 0)
        .join(' ');

      if (detailText) {
        return body?.error ? `${body.error}: ${detailText}` : detailText;
      }
    }

    return body?.error ?? 'Error al crear el agente. Inténtalo de nuevo.';
  }

  registrar(event: Event): void {
    event.preventDefault();

    if (this.submitting) return;

    this.error = '';
    this.success = false;
    this.successMessage = '';

    const name = this.formData.name.trim();
    const email = this.formData.email.trim();
    const password = this.formData.password;

    if (!name || !email || !password.trim()) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    if (password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.submitting = true;

    this.agentService.createAgent({ ...this.formData, name, email }).subscribe({
      next: (created) => {
        this.submitting = false;
        this.success = true;
        this.successMessage = `${created.roleName === 'admin' ? 'Administrador' : 'Agente'} creado correctamente.`;
        this.formData = { name: '', email: '', password: '', role: 'agent' };

        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => {
            this.router.navigate(['/agent-list']);
          }, 3000);
        }
      },
      error: (err) => {
        this.submitting = false;
        this.error = this.buildErrorMessage(err);
      },
    });
  }
}