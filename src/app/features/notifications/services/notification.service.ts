import { Injectable, inject } from '@angular/core';
import { Observable, fromEvent, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  NotificationResponse,
  PageResponse,
  UnreadCountResponse,
} from '../interfaces/notification.interface';
import { environment } from '../../../../environments/environment';
import { getCookie } from '../../../core/utils/cookie.util';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiService);
  private readonly sseUrl = `${environment.apiUrl}/notifications/subscribe`;

  getFeed(page = 0, size = 50): Observable<PageResponse<NotificationResponse>> {
    return this.api.get<PageResponse<NotificationResponse>>('/notifications', { page, size });
  }

  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.api.get<UnreadCountResponse>('/notifications/unread-count');
  }

  markAsRead(id: string): Observable<void> {
    return this.api.patch<void>(`/notifications/${id}/read`, null);
  }

  markAllAsRead(): Observable<void> {
    return this.api.patch<void>('/notifications/read-all', null);
  }

  // Returns [EventSource, Observable<NotificationResponse>]
  // Caller must close() the EventSource on destroy
  subscribeToFeed(): [EventSource, Observable<NotificationResponse>] {
    const token = getCookie('access_token');
    const url = token ? `${this.sseUrl}?token=${encodeURIComponent(token)}` : this.sseUrl;
    const source = new EventSource(url);
    const events$ = fromEvent<MessageEvent>(source, 'notification').pipe(
      map((e) => JSON.parse(e.data) as NotificationResponse),
    );
    return [source, events$];
  }
}
