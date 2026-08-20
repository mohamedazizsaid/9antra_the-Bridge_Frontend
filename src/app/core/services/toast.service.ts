import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  show(
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
    title?: string,
    duration = 4000,
  ): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message, duration };
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next([...current, toast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
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

  remove(id: string): void {
    const current = this.toastsSubject.getValue().filter((t) => t.id !== id);
    this.toastsSubject.next(current);
  }
}
