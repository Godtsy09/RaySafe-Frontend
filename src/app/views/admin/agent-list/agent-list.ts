import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HeaderAdminComponent } from '../../../components/headers/header-admin/header-admin';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService, AgentListItem, AgentDetail, AgentListResult } from '../../../services/agent.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  imports: [HeaderAdminComponent, CommonModule, FormsModule],
  selector: 'app-agent-list',
  styleUrl: './agent-list.scss',
  templateUrl: './agent-list.html',
})
export class AgentList implements OnInit {
  private readonly agentService = inject(AgentService);
  protected readonly auth = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly agents = signal<AgentListItem[]>([]);
  protected readonly selectedAgent = signal<AgentDetail | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly page = signal(1);
  protected readonly limit = 5;
  protected readonly totalPages = signal(0);
  protected readonly isModalOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly roleSelect = signal('2');
  protected readonly activeSelect = signal('true');

  protected readonly institutionInitials = computed(() => {
    const name = this.auth.institutionName();
    return name.substring(0, 3).toUpperCase();
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadAgents();
  }

  loadAgents(): void {
    this.loading.set(true);
    this.error.set(null);

    this.agentService.getAgents(this.page()).subscribe({
      next: (result: AgentListResult) => {
        this.agents.set(result.data);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Error al cargar agentes');
        this.loading.set(false);
      },
    });
  }

  onPageChange(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages()) return;
    this.page.set(newPage);
    this.loadAgents();
  }

  openModal(agent: AgentListItem): void {
    this.loading.set(true);
    this.agentService.getAgentDetail(agent.id).subscribe({
      next: (detail: AgentDetail) => {
        this.selectedAgent.set(detail);
        this.roleSelect.set(String(detail.roleId));
        this.activeSelect.set(String(detail.active));
        this.isModalOpen.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Error al cargar detalle del agente');
        this.loading.set(false);
      },
    });
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedAgent.set(null);
    this.roleSelect.set('2');
    this.activeSelect.set('true');
  }

  saveChanges(): void {
    const agent = this.selectedAgent();
    if (!agent) return;

    this.saving.set(true);
    const data: { roleId?: number; active?: boolean } = {};

    const roleId = Number(this.roleSelect());
    if (roleId !== agent.roleId) {
      data.roleId = roleId;
    }

    const active = this.activeSelect() === 'true';
    if (active !== agent.active) {
      data.active = active;
    }

    if (Object.keys(data).length === 0) {
      this.saving.set(false);
      return;
    }

    this.agentService.updateAgent(agent.id, data).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadAgents();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.error ?? 'Error al actualizar agente');
      },
    });
  }

  getAvatarInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }

  getAgentDisplayId(agent: AgentListItem): string {
    return `${this.institutionInitials()}-${agent.id}`;
  }

  getAgentPureId(agent: AgentDetail): number {
    return agent.id;
  }

  protected readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const pages: (number | '...')[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('...');
    pages.push(total);

    return pages;
  });
}