import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';
import { TimeagoPipe } from '../../pipes/timeago.pipe';

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [CommonModule, TimeagoPipe],
  template: `
    <div class="glass-card w-80 md:w-96 max-h-[500px] overflow-hidden flex flex-col shadow-2xl border border-[var(--bridge-border)]">
      <!-- Header -->
      <div class="p-4 border-b border-[var(--bridge-border)] flex items-center justify-between bg-white/5">
        <h4 class="font-bold text-white tracking-wide">Notifications</h4>
        <div class="flex items-center gap-3">
          <button (click)="markAllAsRead()" class="text-xs text-[var(--bridge-gold)] hover:underline">
            Tout marquer lu
          </button>
          <button (click)="close.emit()" class="text-white/60 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="flex-1 overflow-y-auto divide-y divide-[var(--bridge-border)] max-h-[400px]">
        <div *ngIf="notifications.length === 0" class="p-8 text-center text-[var(--bridge-text-muted)] text-sm">
          Aucune notification
        </div>
        
        <div *ngFor="let notification of notifications"
             [ngClass]="{'bg-white/[0.02]': !notification.read}"
             class="p-4 hover:bg-white/[0.04] transition-colors relative group flex gap-3">
          
          <!-- Indicator Dot -->
          <span *ngIf="!notification.read" class="absolute left-2 top-[22px] w-2 h-2 bg-[var(--bridge-crimson)] rounded-full"></span>
          
          <!-- Icon based on type -->
          <div class="flex-shrink-0 mt-0.5">
            <div [ngClass]="getTypeClass(notification.type)" class="w-8 h-8 rounded-full flex items-center justify-center bg-opacity-10 text-xs">
              <span [ngSwitch]="notification.type">
                <span *ngSwitchCase="'PAIEMENT_CONFIRME'">💰</span>
                <span *ngSwitchCase="'SEANCE_PLANIFIEE'">📅</span>
                <span *ngSwitchCase="'CERTIFICAT_GENERE'">🎓</span>
                <span *ngSwitchCase="'PHASE_DEBLOQUEE'">🔓</span>
                <span *ngSwitchCase="'EVALUATION_PUBLIEE'">📝</span>
                <span *ngSwitchDefault>🔔</span>
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-baseline gap-2">
              <p class="text-sm font-semibold text-white truncate">{{ notification.title }}</p>
              <span class="text-[10px] text-[var(--bridge-text-muted)] whitespace-nowrap">{{ notification.timestamp | timeago }}</span>
            </div>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-1 leading-relaxed">{{ notification.body }}</p>
            
            <div class="flex justify-between items-center mt-2" *ngIf="!notification.read">
              <button (click)="markAsRead(notification.id, $event)" class="text-[10px] text-[var(--bridge-gold)] hover:underline">
                Marquer comme lu
              </button>
              <button *ngIf="notification.actionUrl" (click)="navigate(notification.actionUrl, $event)" class="text-[10px] text-white/80 hover:text-white flex items-center gap-0.5">
                Voir <span class="text-xs">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationsPanelComponent implements OnInit {
  notifications: Notification[] = [];
  @Output() close = new EventEmitter<void>();

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
    });
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'PAIEMENT_CONFIRME':
        return 'bg-emerald-500 text-emerald-400';
      case 'SEANCE_PLANIFIEE':
        return 'bg-blue-500 text-blue-400';
      case 'CERTIFICAT_GENERE':
        return 'bg-indigo-500 text-indigo-400';
      case 'PHASE_DEBLOQUEE':
        return 'bg-amber-500 text-amber-400';
      case 'EVALUATION_PUBLIEE':
        return 'bg-pink-500 text-pink-400';
      default:
        return 'bg-purple-500 text-purple-400';
    }
  }

  markAsRead(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.notificationService.markAsRead(id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  navigate(url: string, event: MouseEvent): void {
    event.stopPropagation();
    this.router.navigateByUrl(url);
    this.close.emit();
  }
}
