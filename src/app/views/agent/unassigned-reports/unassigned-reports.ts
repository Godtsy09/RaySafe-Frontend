import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderAgentComponent } from '../../../components/headers/header-agent/header-agent';
import { AgentReportService, RiskLevel, UnassignedReportDetail, UnassignedReportItem } from '../../../services/agent-report.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  imports: [HeaderAgentComponent, CommonModule, FormsModule],
  selector: 'app-unassigned-reports',
  styleUrl: './unassigned-reports.scss',
  templateUrl: './unassigned-reports.html',
})
export class UnassignedReports implements OnInit {
  private readonly reportService = inject(AgentReportService);
  protected readonly auth = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly reports = signal<UnassignedReportItem[]>([]);
  protected readonly selectedReport = signal<UnassignedReportDetail | null>(null);

  // "loading" solo refleja la carga de la lista. Abrir un detalle o tomar la
  // denuncia ya no reemplaza la tabla por "Cargando...".
  protected readonly loading = signal(false);
  // Alimenta el [disabled] del botón "Tomar Denuncia" y evita el doble envío.
  protected readonly taking = signal(false);

  protected readonly error = signal<string | null>(null);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(0);
  protected readonly isDetailOpen = signal(false);
  protected readonly isClaimOpen = signal(false);
  protected readonly selectedRisk = signal<RiskLevel>('medium');

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadReports();
  }

  loadReports(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reportService.getUnassigned(this.page()).subscribe({
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

  openDetail(report: UnassignedReportItem): void {
    this.error.set(null);

    this.reportService.getUnassignedDetail(report.id).subscribe({
      next: (detail) => {
        this.selectedReport.set(detail);
        this.isDetailOpen.set(true);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Error al cargar detalle');
      },
    });
  }

  confirmClaim(): void {
    this.isDetailOpen.set(false);
    this.isClaimOpen.set(true);
  }

  takeReport(): void {
    const report = this.selectedReport();
    if (!report || this.taking()) return;

    this.taking.set(true);
    this.error.set(null);

    this.reportService.takeReport(report.id, this.selectedRisk()).subscribe({
      next: () => {
        this.taking.set(false);
        this.isClaimOpen.set(false);
        this.closeDetailModal();
        this.loadReports();
      },
      error: (err) => {
        this.taking.set(false);
        this.error.set(err?.error?.error ?? 'Error al tomar denuncia');
      },
    });
  }

  closeDetailModal(): void {
    this.isDetailOpen.set(false);
    this.selectedReport.set(null);
  }

  closeClaimModal(): void {
    this.isClaimOpen.set(false);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
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
