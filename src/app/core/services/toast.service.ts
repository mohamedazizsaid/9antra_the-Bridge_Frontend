import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
  isLeaving?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private timers = new Map<string, any>();

  show(
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
    title?: string,
    duration = 4000,
  ): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message, duration, isLeaving: false };
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next([...current, toast]);

    const animDuration = 380;
    const leaveDelay = Math.max(duration - animDuration, 500);

    const timer = setTimeout(() => {
      this.dismiss(id);
    }, leaveDelay);

    this.timers.set(id, timer);
  }

  success(message: string, title = 'Succès'): void {
    this.show('success', message, title);
  }

  error(message: string, title = 'Erreur'): void {
    this.show('error', message, title);
  }

  info(message: string, title = 'Information'): void {
    this.show('info', message, title);
  }

  warning(message: string, title = 'Attention'): void {
    this.show('warning', message, title);
  }

  dismiss(id: string): void {
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id));
      this.timers.delete(id);
    }

    const current = this.toastsSubject.getValue();
    const target = current.find((t) => t.id === id);
    if (!target) return;

    if (target.isLeaving) return; // Déjà en cours d'animation de sortie

    target.isLeaving = true;
    this.toastsSubject.next([...current]);

    setTimeout(() => {
      this.remove(id);
    }, 380);
  }

  remove(id: string): void {
    const current = this.toastsSubject.getValue().filter((t) => t.id !== id);
    this.toastsSubject.next(current);
  }
}
