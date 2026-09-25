import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HeaderAgentComponent } from '../../../components/headers/header-agent/header-agent';
import { AgentReportService, AssignedReportItem, AssignedResult, ReportDetail } from '../../../services/agent-report.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  imports: [HeaderAgentComponent, CommonModule, FormsModule],
  selector: 'app-assigned-reports',
  styleUrl: './assigned-reports.scss',
  templateUrl: './assigned-reports.html',
})
export class AssignedReports implements OnInit {
  private readonly reportService = inject(AgentReportService);
  protected readonly auth = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly reports = signal<AssignedReportItem[]>([]);
  protected readonly selectedReport = signal<ReportDetail | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(0);
  protected readonly isModalOpen = signal(false);
  protected readonly statusSelect = signal('');
  protected readonly newNoteContent = signal('');
  protected readonly availableStatuses = signal<{ id: number; name: string }[]>([]);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadReports();
    this.loadStatuses();
  }

  loadStatuses(): void {
    this.reportService.getReportStatuses().subscribe({
      next: (statuses) => this.availableStatuses.set(statuses),
      error: () => this.availableStatuses.set([]),
    });
  }

  loadReports(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loading.set(true);
    this.error.set(null);

    this.reportService.getMyReports(this.page()).subscribe({
      next: (result) => {
        this.reports.set(result.data);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Error al cargar denuncias');
        this.loading.set(false);
      },
    });
  }

  onPageChange(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages()) return;
    this.page.set(newPage);
    this.loadReports();
  }

  openDetail(report: AssignedReportItem): void {
    this.loading.set(true);
    this.reportService.getMyReportDetail(report.id).subscribe({
      next: (detail) => {
        this.selectedReport.set(detail);
        this.statusSelect.set(String(detail.status.id));
        this.isModalOpen.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Error al cargar detalle');
        this.loading.set(false);
      },
    });
  }

  hasChanges(): boolean {
    const report = this.selectedReport();
    if (!report) return false;

    const statusChanged = this.statusSelect() && Number(this.statusSelect()) !== report.status.id;
    const hasNote = this.newNoteContent().trim().length > 0;

    return statusChanged || hasNote;
  }

  getValidTransitions(): { id: number; name: string }[] {
    const report = this.selectedReport();
    if (!report) return [];

    const current = report.status.name.toLowerCase();
    const all = this.availableStatuses();

    return all.filter(s => {
      const target = s.name.toLowerCase();
      if (target === report.status.name.toLowerCase()) return false;

      // Estados finales sin salidas
      if (['resuelta', 'desestimada'].includes(current)) return false;

      // No volver atrás ni saltar a final
      const invalid: Record<string, string[]> = {
        'recibida': ['resuelta'],
        'en revisión': ['recibida', 'resuelta'],
        'en investigación': ['recibida', 'en revisión'],
      };

      return !invalid[current]?.includes(target);
    });
  }

  saveChanges(): void {
    const report = this.selectedReport();
    if (!report || !this.hasChanges()) return;

    this.loading.set(true);
    this.error.set(null);

    const statusChanged = this.statusSelect() && Number(this.statusSelect()) !== report.status.id;
    const hasNote = this.newNoteContent().trim().length > 0;
    const noteContent = this.newNoteContent().trim();

    const requests: Promise<any>[] = [];

    if (statusChanged) {
      requests.push(
        lastValueFrom(this.reportService.updateStatus(report.id, Number(this.statusSelect())))
          .catch((err) => { throw { type: 'status', error: err }; })
      );
    }

    if (hasNote) {
      requests.push(
        lastValueFrom(this.reportService.addNote(report.id, noteContent))
          .catch((err) => { throw { type: 'note', error: err }; })
      );
    }

    Promise.allSettled(requests).then((results) => {
      const errors = results
        .filter((r) => r.status === 'rejected')
        .map((r) => (r as PromiseRejectedResult).reason);

      this.loading.set(false);

      if (errors.length === 0) {
        // Éxito total
        this.newNoteContent.set('');
        this.loadReports();
        this.reportService.getMyReportDetail(report.id).subscribe({
          next: (detail) => {
            this.selectedReport.set(detail);
            this.statusSelect.set(String(detail.status.id));
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      } else {
        // Error parcial o total
        const errorMessages = errors.map((e) => {
          if (e?.type === 'note') return 'Error en la nota';
          if (e?.type === 'status') return 'Error en el estado';
          return e?.error?.error?.error ?? 'Error desconocido';
        });
        this.error.set(errorMessages.join(' | '));
        this.loading.set(false);
      }
    });
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedReport.set(null);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-GT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // "Cobán, Alta Verapaz ・ Zona 5" | "Cobán" | "" — misma salida que la
  // interpolación encadenada que reemplazó, sin optional-chains redundantes.
  formatLocation(
    location: ReportDetail['location'],
    specificAddress: string | null,
  ): string {
    const city = location?.city ?? '';
    const department = location?.department ?? '';
    const place = city && department ? `${city}, ${department}` : city || department;

    return specificAddress ? `${place} ・ ${specificAddress}` : place;
  }

  getStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('investig')) return 'warning';
    if (s.includes('resuelt') || s.includes('cerrad')) return 'success';
    if (s.includes('desestim') || s.includes('rechaz')) return 'danger';
    return '';
  }

  getRiskClass(risk: string | null): string {
    if (!risk) return '';
    switch (risk) {
      case 'low': return 'risk-low';
      case 'medium': return 'risk-medium';
      case 'high': return 'risk-high';
      case 'critical': return 'risk-critical';
      default: return '';
    }
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