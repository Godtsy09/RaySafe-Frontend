import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AgentListItem {
  id: number;
  name: string;
  email: string;
  assignedCases: number;
  active: boolean;
}

export interface AgentDetail {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  active: boolean;
  createdAt: string;
  institutionId: number;
}

export interface AgentListResult {
  total: number;
  page: number;
  totalPages: number;
  data: AgentListItem[];
}

export interface CreateAgentPayload {
  name: string;
  email: string;
  password: string;
  role: 'agent' | 'admin';
}

export interface CreateAgentResponse {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  active: boolean;
  createdAt: string;
  institutionId: number;
}

@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly http = inject(HttpClient);
  private readonly limit = 5;

  getAgents(page: number): Observable<AgentListResult> {
    return this.http.get<AgentListResult>(`/api/admin/agents?page=${page}&limit=${this.limit}`);
  }

  getAgentDetail(id: number): Observable<AgentDetail> {
    return this.http.get<AgentDetail>(`/api/admin/agents/${id}`);
  }

  createAgent(data: CreateAgentPayload): Observable<CreateAgentResponse> {
    return this.http.post<CreateAgentResponse>('/api/admin/agents', data);
  }

  updateAgent(id: number, data: { roleId?: number; active?: boolean }): Observable<AgentDetail> {
    return this.http.patch<AgentDetail>(`/api/admin/agents/${id}`, data);
  }
}