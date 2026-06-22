import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private mockNotifications: Notification[] = [
    {
      id: 'n1', type: 'PAIEMENT_CONFIRME', title: 'Paiement confirmé',
      body: 'Votre paiement de 300 TND pour la Phase 2 a été confirmé.',
      timestamp: new Date(Date.now() - 3600000 * 2), read: false, actionUrl: '/dashboard/stagiaire'
    },
    {
      id: 'n2', type: 'SEANCE_PLANIFIEE', title: 'Nouvelle séance planifiée',
      body: 'Séance "Backend & APIs" prévue le 23 juin à 09:00 en Salle 201.',
      timestamp: new Date(Date.now() - 3600000 * 5), read: false, actionUrl: '/dashboard/stagiaire'
    },
    {
      id: 'n3', type: 'CERTIFICAT_GENERE', title: 'Certificat disponible',
      body: 'Votre certificat "Fondamentaux Web" est prêt. Vérifiable sur la blockchain.',
      timestamp: new Date(Date.now() - 86400000), read: true
    },
    {
      id: 'n4', type: 'PHASE_DEBLOQUEE', title: 'Phase débloquée',
      body: 'La Phase 2 "Backend & APIs" est maintenant accessible.',
      timestamp: new Date(Date.now() - 86400000 * 3), read: true
    },
    {
      id: 'n5', type: 'EVALUATION_PUBLIEE', title: 'Évaluation publiée',
      body: 'Votre note pour la Phase 1 a été publiée: 16/20.',
      timestamp: new Date(Date.now() - 86400000 * 5), read: true
    },
    {
      id: 'n6', type: 'ANNONCE', title: 'Annonce générale',
      body: 'Les cours reprennent normalement lundi 23 juin. Bon courage à tous !',
      timestamp: new Date(Date.now() - 86400000 * 2), read: false
    }
  ];

  private notificationsSubject = new BehaviorSubject<Notification[]>(this.mockNotifications);
  notifications$ = this.notificationsSubject.asObservable();

  get unreadCount$(): Observable<number> {
    return new BehaviorSubject(this.mockNotifications.filter(n => !n.read).length).asObservable();
  }

  getNotifications(): Observable<Notification[]> {
    return of(this.mockNotifications).pipe(delay(200));
  }

  markAsRead(id: string): void {
    const notif = this.mockNotifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.notificationsSubject.next([...this.mockNotifications]);
    }
  }

  markAllAsRead(): void {
    this.mockNotifications.forEach(n => n.read = true);
    this.notificationsSubject.next([...this.mockNotifications]);
  }
}
