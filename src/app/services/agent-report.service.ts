import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UnassignedReportItem {
  id: number;
  public_id: string;
  abuse_type: string;
  ubicacion: string | null;
  estado: string;
  created_at: string;
}

export interface UnassignedResult {
  total: number;
  page: number;
  totalPages: number;
  data: UnassignedReportItem[];
}

export interface AssignedReportItem {
  id: number;
  publicId: string;
  abuseType: string;
  createdAt: string;
  city: string | null;
  department: string | null;
  status: string;
  riskLevel: string | null;
}

export interface AssignedResult {
  total: number;
  page: number;
  totalPages: number;
  data: AssignedReportItem[];
}

export interface EvidenceItem {
  id: number;
  fileType: string | null;
  fileUrl: string;
  description: string | null;
  uploadedAt: string;
}

export interface UnassignedReportDetail {
  id: number;
  public_id: string;
  nivel_riesgo: string | null;
  tipo_abuso: string;
  fecha_creacion: string;
  ubicacion: string | null;
  direccion_especifica: string | null;
  descripcion: string;
  evidencia: EvidenceItem[];
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
  riskLevel: string | null;
  description: string;
  specificAddress: string | null;
  createdAt: string;
  abuseType: { id: number; name: string; category: string };
  status: { id: number; name: string };
  location: { city: string; department: string } | null;
  agent: { id: number; name: string; email: string; active: boolean } | null;
  evidence: EvidenceItem[];
  notes: NoteItem[];
  statusHistory: StatusHistoryItem[];
}

export interface TakenReportDetail {
  id: number;
  public_id: string;
  nivel_riesgo: string;
  tipo_abuso: string;
  estado: string;
  agente_asignado: { id: number; name: string };
  fecha_asignacion: string;
}

// El backend envuelve la denuncia asignada en { message, report }.
export interface TakeReportResponse {
  message: string;
  report: TakenReportDetail;
}

// Coincide con el ENUM risk_level y con takeReportSchema del backend.
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface CreateNoteResponse {
  id: number;
  report_id: number;
  content: string;
  created_at: string;
  agent: { id: number; name: string };
}

export interface CreateNotePayload {
  content: string;
}

export interface UpdateStatusPayload {
  status_id: number;
  comment?: string;
}

export interface ReportStatus {
  id: number;
  name: string;
  sort_order: number;
}

@Injectable({ providedIn: 'root' })
export class AgentReportService {
  private readonly http = inject(HttpClient);

  // Report statuses
  getReportStatuses(): Observable<ReportStatus[]> {
    return this.http.get<ReportStatus[]>('/api/report-statuses');
  }

  // Unassigned reports (pool institucional)
  getUnassigned(page: number, limit = 5): Observable<UnassignedResult> {
    return this.http.get<UnassignedResult>('/api/agent/reports/unassigned', {
      params: new HttpParams().set('page', page).set('limit', limit),
    });
  }

  getUnassignedDetail(id: number): Observable<UnassignedReportDetail> {
    return this.http.get<UnassignedReportDetail>(`/api/agent/reports/unassigned/${id}`);
  }

  takeReport(id: number, riskLevel: RiskLevel): Observable<TakeReportResponse> {
    return this.http.post<TakeReportResponse>(
      `/api/agent/reports/unassigned/${id}/take`,
      { risk_level: riskLevel },
    );
  }

  // Assigned reports (mis reportes)
  getMyReports(page: number, limit = 5): Observable<AssignedResult> {
    return this.http.get<AssignedResult>('/api/agent/reports', {
      params: new HttpParams().set('page', page).set('limit', limit),
    });
  }

  getMyReportDetail(id: number): Observable<ReportDetail> {
    return this.http.get<ReportDetail>(`/api/agent/reports/${id}`);
  }

  addNote(id: number, content: string): Observable<CreateNoteResponse> {
    const payload: CreateNotePayload = { content };
    return this.http.post<CreateNoteResponse>(`/api/agent/reports/${id}/notes`, payload);
  }

  updateStatus(id: number, statusId: number, comment?: string): Observable<ReportDetail> {
    const payload: UpdateStatusPayload = { status_id: statusId, comment };
    return this.http.patch<ReportDetail>(`/api/agent/reports/${id}/status`, payload);
  }
}