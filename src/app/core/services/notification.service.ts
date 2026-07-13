import { Injectable, Inject, forwardRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Notification } from '../models/notification.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:8080/api/notifications';
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private ws: WebSocket | null = null;

  constructor(
    private http: HttpClient,
    @Inject(forwardRef(() => AuthService)) private authService: AuthService
  ) {
    this.refreshNotifications();
    this.setupAuthSubscription();
  }

  private setupAuthSubscription(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.connectWebSocket(user.id);
      } else {
        this.disconnectWebSocket();
      }
    });
  }

  private connectWebSocket(userId: string): void {
    if (this.ws) {
      this.ws.close();
    }
    // Connect directly to SockJS websocket endpoint (raw protocol)
    this.ws = new WebSocket('ws://localhost:8080/ws/websocket');

    this.ws.onopen = () => {
      const connectFrame = 'CONNECT\naccept-version:1.1,1.0\nheart-beat:10000,10000\n\n\u0000';
      this.ws?.send(connectFrame);
    };

    this.ws.onmessage = (event) => {
      const msg = event.data;
      if (msg.startsWith('CONNECTED')) {
        const subFrame = `SUBSCRIBE\nid:sub-0\ndestination:/topic/notifications/${userId}\n\n\u0000`;
        this.ws?.send(subFrame);
      } else if (msg.startsWith('MESSAGE')) {
        const parts = msg.split('\n\n');
        if (parts.length > 1) {
          const bodyStr = parts[1].replace(/\u0000$/, '').trim();
          try {
            const notifDTO = JSON.parse(bodyStr);
            const mapped = this.mapNotification(notifDTO);
            const current = this.notificationsSubject.value;
            // Only prepend if not already present
            if (!current.some(n => n.id === mapped.id)) {
              this.notificationsSubject.next([mapped, ...current]);
              this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
            }
          } catch (e) {
            console.error('Failed to parse WS notification payload', e);
          }
        }
      }
    };

    this.ws.onclose = () => {
      const user = this.authService.getCurrentUser();
      if (user) {
        setTimeout(() => this.connectWebSocket(user.id), 5000);
      }
    };
  }

  private disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private mapNotification(n: any): Notification {
    let type: any = 'ANNONCE';
    const t = (n.title || '').toLowerCase();
    if (t.includes('paiement') || t.includes('facture')) {
      type = 'PAIEMENT_CONFIRME';
    } else if (t.includes('séance') || t.includes('cours')) {
      type = 'SEANCE_PLANIFIEE';
    } else if (t.includes('certificat') || t.includes('blockchain')) {
      type = 'CERTIFICAT_GENERE';
    } else if (t.includes('phase') || t.includes('débloqu')) {
      type = 'PHASE_DEBLOQUEE';
    } else if (t.includes('note') || t.includes('évaluation')) {
      type = 'EVALUATION_PUBLIEE';
    }

    return {
      id: n.id.toString(),
      type: type,
      title: n.title,
      body: n.message,
      timestamp: new Date(n.createdAt),
      read: n.readStatus,
      actionUrl: '/dashboard'
    };
  }

  refreshNotifications(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.http.get<any[]>(`${this.apiUrl}/me`).subscribe({
      next: (list) => {
        const mapped = list.map(n => this.mapNotification(n));
        this.notificationsSubject.next(mapped);
        this.unreadCountSubject.next(mapped.filter(n => !n.read).length);
      },
      error: () => {}
    });
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<any[]>(`${this.apiUrl}/me`).pipe(
      map(list => list.map(n => this.mapNotification(n))),
      tap(mapped => {
        this.notificationsSubject.next(mapped);
        this.unreadCountSubject.next(mapped.filter(n => !n.read).length);
      })
    );
  }

  markAsRead(id: string): void {
    this.http.put(`${this.apiUrl}/${id}/read`, {}).subscribe({
      next: () => {
        const current = this.notificationsSubject.value;
        const found = current.find(n => n.id === id);
        if (found) {
          found.read = true;
          this.notificationsSubject.next([...current]);
          this.unreadCountSubject.next(current.filter(n => !n.read).length);
        }
      }
    });
  }

  markAllAsRead(): void {
    this.http.put(`${this.apiUrl}/read-all`, {}).subscribe({
      next: () => {
        const current = this.notificationsSubject.value;
        current.forEach(n => n.read = true);
        this.notificationsSubject.next([...current]);
        this.unreadCountSubject.next(0);
      }
    });
  }
}
