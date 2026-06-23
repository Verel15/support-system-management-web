import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface DeviceSessionResponse {
  id: string;
  deviceName: string;
  ipAddress: string;
  lastActiveAt: string;
  createdAt: string;
  current: boolean;
}

@Injectable({ providedIn: 'root' })
export class DeviceSessionService {
  private api = inject(ApiService);

  getSessions(): Observable<DeviceSessionResponse[]> {
    return this.api.get<DeviceSessionResponse[]>('/auth/sessions');
  }

  deleteAllSessions(): Observable<void> {
    return this.api.delete<void>('/auth/sessions');
  }

  deleteSession(sessionId: string): Observable<void> {
    return this.api.delete<void>(`/auth/sessions/${sessionId}`);
  }
}
