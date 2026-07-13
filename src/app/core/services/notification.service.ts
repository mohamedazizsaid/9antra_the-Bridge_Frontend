import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:8080/api/notifications';
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.refreshNotifications();
  }

  private mapNotification(n: any): Notification {
    // Attempt to guess or parse category/type
    let type: any = 'ANNONCE';
    if (n.title.toLowerCase().includes('paiement') || n.title.toLowerCase().includes('facture')) {
      type = 'PAIEMENT_CONFIRME';
    } else if (n.title.toLowerCase().includes('séance') || n.title.toLowerCase().includes('cours')) {
      type = 'SEANCE_PLANIFIEE';
    } else if (n.title.toLowerCase().includes('certificat') || n.title.toLowerCase().includes('blockchain')) {
      type = 'CERTIFICAT_GENERE';
    } else if (n.title.toLowerCase().includes('phase') || n.title.toLowerCase().includes('débloqu')) {
      type = 'PHASE_DEBLOQUEE';
    } else if (n.title.toLowerCase().includes('note') || n.title.toLowerCase().includes('évaluation')) {
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
