import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderAdminComponent } from '../../../components/headers/header-admin/header-admin';
import { ReportLogService, ReportLogItem, ReportLogResult, ReportDetail } from '../../../services/report-log.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  imports: [HeaderAdminComponent, CommonModule, FormsModule],
  selector: 'app-agent-logs',
  styleUrl: './agent-logs.scss',
  templateUrl: './agent-logs.html',
})
export class AgentLogs implements OnInit {
  private readonly reportLogService = inject(ReportLogService);
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly auth = inject(AuthService);

  protected readonly reports = signal<ReportLogItem[]>([]);
  protected readonly selectedReport = signal<ReportDetail | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly page = signal(1);
  protected readonly limit = 5;
  protected readonly totalPages = signal(0);
  protected readonly totalItems = signal(0);
  protected readonly isModalOpen = signal(false);
  protected readonly searchTerm = signal('');
  protected readonly debouncedSearch = signal('');

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadReports();
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  loadReports(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reportLogService.getReportLogs(this.page(), this.debouncedSearch()).subscribe({
      next: (result: ReportLogResult) => {
        this.reports.set(result.data);
        this.totalPages.set(result.totalPages);
        this.totalItems.set(result.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Error al cargar registros');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.debouncedSearch.set(term.trim());
      this.page.set(1);
      this.loadReports();
    }, 300);
  }

  onPageChange(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages()) return;
    this.page.set(newPage);
    this.loadReports();
  }

  openModal(report: ReportLogItem): void {
    this.loading.set(true);
    this.reportLogService.getReportDetail(report.id).subscribe({
      next: (detail: ReportDetail) => {
        this.selectedReport.set(detail);
        this.isModalOpen.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error ?? 'Error al cargar detalle del registro');
        this.loading.set(false);
      },
    });
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedReport.set(null);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-GT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
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

  getStatusClass(status: string): string {
    const s = status.toLowerCase();
    if (s.includes('investig')) return 'warning';
    if (s.includes('resuelt') || s.includes('cerrad')) return 'success';
    if (s.includes('desestim') || s.includes('rechaz')) return 'danger';
    return '';
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

  getAvatarInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }

  getFileIcon(fileType: string | null): string {
    if (!fileType) return '📄';
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    return '📎';
  }

  getFileName(url: string): string {
    try {
      return url.split('/').pop()?.split('?')[0] ?? 'Archivo';
    } catch {
      return 'Archivo';
    }
  }
}