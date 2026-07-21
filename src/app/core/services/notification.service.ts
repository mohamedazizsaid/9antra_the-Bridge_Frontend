import { Injectable, Inject, forwardRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Notification } from '../models/notification.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private apiUrl = 'http://localhost:8080/api/notifications';
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private pollSubscription: Subscription | null = null;

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
        this.startPolling();
      } else {
        this.stopPolling();
        this.notificationsSubject.next([]);
        this.unreadCountSubject.next(0);
      }
    });
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollSubscription = interval(30000).subscribe(() => {
      this.refreshNotifications();
    });
  }

  private stopPolling(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = null;
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private mapNotification(n: any): Notification {
    let type: any = 'ANNONCE';
    const t = (n.title || '').toLowerCase();
    if (t.includes('paiement') || t.includes('facture')) type = 'PAIEMENT_CONFIRME';
    else if (t.includes('aujourd') || t.includes('seance') || t.includes('séance') || t.includes('cours')) type = 'SEANCE_PLANIFIEE';
    else if (t.includes('certificat') || t.includes('blockchain') || t.includes('certification')) type = 'CERTIFICAT_GENERE';
    else if (t.includes('phase') || t.includes('débloquée') || t.includes('debloquee')) type = 'PHASE_DEBLOQUEE';
    else if (t.includes('évaluation') || t.includes('evaluation') || t.includes('note')) type = 'EVALUATION_PUBLIEE';
    else if (t.includes('inscription') || t.includes('inscrit') || t.includes('bienvenu')) type = 'NOUVELLE_INSCRIPTION';
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
        mapped.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        this.notificationsSubject.next(mapped);
        this.unreadCountSubject.next(mapped.filter(n => !n.read).length);
      },
      error: () => {}
    });
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<any[]>(`${this.apiUrl}/me`).pipe(
      map(list => {
        const mapped = list.map(n => this.mapNotification(n));
        mapped.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return mapped;
      }),
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
