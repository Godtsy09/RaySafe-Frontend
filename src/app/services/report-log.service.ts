import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportLogItem {
  id: number;
  publicId: string;
  abuseType: string;
  agentName: string | null;
  createdAt: string;
  city: string | null;
  department: string | null;
  status: string;
  riskLevel: string | null;
}

export interface ReportLogResult {
  total: number;
  page: number;
  totalPages: number;
  data: ReportLogItem[];
}

export interface EvidenceItem {
  id: number;
  fileType: string | null;
  fileUrl: string;
  description: string | null;
  uploadedAt: string;
}

export interface NoteItem {
  id: number;
  content: string;
  agentName: string;
  createdAt: string;
}

export interface StatusHistoryItem {
  id: number;
  previousStatusName: string | null;
  newStatusName: string;
  agentName: string | null;
  comment: string | null;
  date: string;
}

export interface ReportDetail {
  id: number;
  publicId: string;
  description: string;
  specificAddress: string | null;
  riskLevel: string | null;
  createdAt: string;
  abuseType: { id: number; name: string; category: string };
  status: { id: number; name: string };
  location: { city: string; department: string } | null;
  agent: { id: number; name: string; email: string; active: boolean } | null;
  evidence: EvidenceItem[];
  notes: NoteItem[];
  statusHistory: StatusHistoryItem[];
}

@Injectable({ providedIn: 'root' })
export class ReportLogService {
  private readonly http = inject(HttpClient);
  private readonly limit = 5;

  getReportLogs(page: number, search?: string): Observable<ReportLogResult> {
    let url = `/api/admin/reports?page=${page}&limit=${this.limit}`;
    if (search && search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this.http.get<ReportLogResult>(url);
  }

  getReportDetail(id: number): Observable<ReportDetail> {
    return this.http.get<ReportDetail>(`/api/admin/reports/${id}`);
  }
}