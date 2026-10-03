import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

export type AbuseCategory = 'human' | 'animal';

export interface AbuseType {
  id: number;
  category: AbuseCategory;
  name: string;
  description: string | null;
}

export interface Municipality {
  id: number;
  city: string;
  department: string;
}

export interface CreateReportPayload {
  abuse_type_id: number;
  description: string;
  specific_address?: string;
  location_id?: number;
}

export interface CreatedReport {
  id: number;
  public_id: string;
  token: string;
  abuse_type_id: number;
  report_status_id: number;
  institution_id: number;
  description: string;
  specific_address: string | null;
  location_id: number | null;
  risk_level: string | null;
  notification_email: string | null;
  created_at: string;
}

export interface TrackReportInfo {
  public_id: string;
  report_status_id: number;
  status_name: string;
  abuse_type_name: string;
  abuse_type_category: AbuseCategory;
  created_at: string;
  updated_at: string;
}

export interface TrackReportFull extends TrackReportInfo {
  abuse_type_id: number;
  institution_id: number | null;
  institution_name: string | null;
  description: string;
  specific_address: string | null;
  location_id: number | null;
  city: string | null;
  department: string | null;
  notification_email: string | null;
}

export interface EvidenceItem {
  id: number;
  fileType: string | null;
  fileUrl: string;
  description: string | null;
  uploadedAt: string;
}

export interface ReportStatus {
  id: number;
  name: string;
  sort_order: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);

  getAbuseTypes(): Observable<AbuseType[]> {
    return this.http.get<AbuseType[]>('/api/abuse-types');
  }

  getReportStatuses(): Observable<ReportStatus[]> {
    return this.http.get<ReportStatus[]>('/api/report-statuses');
  }

  getDepartments(): Observable<string[]> {
    return this.http.get<string[]>('/api/locations/departments');
  }

  getMunicipalities(department: string): Observable<Municipality[]> {
    return this.http.get<Municipality[]>('/api/locations/municipalities', {
      params: { department },
    });
  }

  createReport(data: CreateReportPayload): Observable<CreatedReport> {
    return this.http
      .post<CreatedReport>('/api/reports', data)
      .pipe(timeout(30_000));
  }

  trackReport(
    publicId: string,
    token?: string
  ): Observable<TrackReportInfo | TrackReportFull> {
    return this.http.get<TrackReportInfo | TrackReportFull>(
      `/api/reports/track/${publicId}`,
      { params: token ? { token } : {} }
    );
  }

  getEvidence(publicId: string, token: string): Observable<EvidenceItem[]> {
    return this.http.get<EvidenceItem[]>(`/api/reports/${publicId}/evidence`, {
      params: { token },
    });
  }

  uploadEvidence(
    publicId: string,
    token: string,
    file: File,
    description?: string
  ): Observable<EvidenceItem> {
    const form = new FormData();
    form.append('file', file);
    form.append('token', token);
    if (description) {
      form.append('description', description);
    }
    return this.http
      .post<EvidenceItem>(`/api/reports/${publicId}/evidence`, form)
      .pipe(timeout(120_000));
  }

  updateEvidenceDescription(
    publicId: string,
    token: string,
    evidenceId: number,
    description: string | null
  ): Observable<EvidenceItem> {
    return this.http
      .patch<EvidenceItem>(`/api/reports/${publicId}/evidence/${evidenceId}`, {
        token,
        description,
      })
      .pipe(timeout(30_000));
  }
}