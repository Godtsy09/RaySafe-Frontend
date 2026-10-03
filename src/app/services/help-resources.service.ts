import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type HelpResourceType = 'emergency_line' | 'support_center' | 'shelter';

export interface HelpResource {
  id: number;
  name: string;
  type: HelpResourceType;
  address: string | null;
  phone: string | null;
  schedule: string | null;
  city: string | null;
  department: string | null;
}

export interface EducationalGuide {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  pdf_file_url: string;
}

@Injectable({ providedIn: 'root' })
export class HelpResourcesService {
  private readonly http = inject(HttpClient);

  getHelpResources(): Observable<HelpResource[]> {
    return this.http.get<HelpResource[]>('/api/help-resources');
  }

  getEducationalGuides(): Observable<EducationalGuide[]> {
    return this.http.get<EducationalGuide[]>('/api/educational-guides');
  }
}