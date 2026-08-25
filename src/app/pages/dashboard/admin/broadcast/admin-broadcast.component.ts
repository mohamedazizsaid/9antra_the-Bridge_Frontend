import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-admin-broadcast',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[var(--bridge-gold)]/30 flex items-center justify-center text-[var(--bridge-gold)]"
        >
          <svg
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m3 11 18-5v12L3 14v-3z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </svg>
        </div>
        <div>
          <h1 class="font-syne font-bold text-2xl text-white">Centre de Diffusion</h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-0.5">
            Envoyer des notifications ciblées aux utilisateurs et synchroniser en temps réel
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Compose Form -->
        <div class="bridge-card p-6">
          <div class="flex items-center gap-2 mb-5">
            <svg
              class="w-4 h-4 text-[var(--bridge-gold)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <h3 class="font-semibold text-white text-base">Composer la notification</h3>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Titre *</label>
              <input
                [(ngModel)]="form.title"
                placeholder="Ex: Maintenance prévue ce soir à 22h"
                class="bridge-input w-full text-sm"
              />
            </div>
            <div>
              <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Message *</label>
              <textarea
                [(ngModel)]="form.message"
                rows="4"
                placeholder="Entrez le contenu de votre notification..."
                class="bridge-input w-full resize-none text-sm"
              ></textarea>
            </div>
            <div>
              <label class="block text-xs text-[var(--bridge-text-muted)] mb-2"
                >Destinataires *</label
              >
              <div class="space-y-2">
                <label
                  *ngFor="let role of roles"
                  class="flex items-center gap-3.5 p-3 rounded-xl border border-[var(--bridge-border)] hover:border-[var(--bridge-crimson)]/30 cursor-pointer transition-all bg-white/[0.01] hover:bg-white/[0.03]"
                  [class]="
                    form.roles.includes(role.key)
                      ? 'border-[var(--bridge-crimson)]/50 bg-[var(--bridge-crimson)]/5'
                      : ''
                  "
                >
                  <input
                    type="checkbox"
                    [checked]="form.roles.includes(role.key)"
                    (change)="toggleRole(role.key)"
                    class="w-4 h-4 accent-[var(--bridge-crimson)]"
                  />
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    [class]="role.iconBg"
                  >
                    <ng-container [ngSwitch]="role.key">
                      <!-- Stagiaires -->
                      <svg
                        *ngSwitchCase="'STAGIAIRE'"
                        class="w-4 h-4 text-purple-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <circle cx="12" cy="8" r="7" />
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                      </svg>
                      <!-- Formateurs -->
                      <svg
                        *ngSwitchCase="'FORMATEUR'"
                        class="w-4 h-4 text-[#F5A623]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                      <!-- Admin -->
                      <svg
                        *ngSwitchCase="'ADMIN'"
                        class="w-4 h-4 text-[#C62761]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </ng-container>
                  </div>
                  <div>
                    <p class="text-sm text-white font-medium">{{ role.label }}</p>
                    <p class="text-xs text-[var(--bridge-text-muted)]">{{ role.desc }}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <button
            (click)="send()"
            [disabled]="sending || !form.title || !form.message || form.roles.length === 0"
            class="bridge-btn-primary w-full py-3 mt-6 text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <svg
              *ngIf="sending"
              class="animate-spin w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <svg
              *ngIf="!sending"
              class="w-4 h-4 transition-transform group-hover:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span>{{ sending ? 'Envoi en cours...' : 'Diffuser la notification' }}</span>
          </button>
          <div
            *ngIf="successMsg"
            class="mt-3.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn"
          >
            <svg
              class="w-4 h-4 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{{ successMsg }}</span>
          </div>
          <div
            *ngIf="errorMsg"
            class="mt-3.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
          >
            <svg
              class="w-4 h-4 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{{ errorMsg }}</span>
          </div>
        </div>

        <!-- Preview + History -->
        <div class="space-y-4">
          <!-- Live preview -->
          <div class="bridge-card p-5">
            <h3 class="font-semibold text-white text-sm mb-4">Aperçu de la notification</h3>
            <div class="bg-[#08081A] rounded-xl p-4 border border-[var(--bridge-border)]">
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="m3 11 18-5v12L3 14v-3z" />
                    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-white truncate">
                    {{ form.title || 'Titre de la notification...' }}
                  </p>
                  <p
                    class="text-xs text-[var(--bridge-text-muted)] mt-1 line-clamp-2 leading-relaxed"
                  >
                    {{ form.message || 'Contenu du message qui sera affiché aux destinataires...' }}
                  </p>
                  <p class="text-[10px] text-white/30 mt-2">À l'instant</p>
                </div>
                <div class="w-2 h-2 rounded-full bg-[var(--bridge-crimson)] flex-shrink-0"></div>
              </div>
            </div>
          </div>

          <!-- Recent broadcasts -->
          <div class="bridge-card p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-white text-sm">
                Historique des diffusions (Base de données)
              </h3>
              <button
                (click)="loadHistory()"
                class="text-xs text-[var(--bridge-text-muted)] hover:text-white transition-colors cursor-pointer"
                title="Actualiser l'historique"
              >
                <svg
                  class="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
              </button>
            </div>
            <div class="space-y-3">
              <div
                *ngFor="let h of historyExpanded ? history : history.slice(0, 3)"
                class="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl"
              >
                <div class="flex items-center justify-between">
                  <p class="text-sm font-semibold text-white truncate">{{ h.title }}</p>
                  <span
                    class="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                  >
                    {{ h.sent }} destinataire(s)
                  </span>
                </div>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-1 line-clamp-2">
                  {{ h.message }}
                </p>
                <div class="flex items-center gap-2 mt-2.5">
                  <span
                    *ngFor="let r of h.roles"
                    class="text-[9px] font-bold bg-white/10 text-white/70 px-2 py-0.5 rounded-md uppercase"
                    >{{ r }}</span
                  >
                  <span class="text-[10px] text-white/40 ml-auto">{{
                    h.createdAt ? (h.createdAt | date: 'dd/MM/yyyy HH:mm') : h.time
                  }}</span>
                </div>
              </div>
              <div
                *ngIf="history.length === 0"
                class="text-center text-[var(--bridge-text-muted)] text-xs py-6"
              >
                Aucune diffusion enregistrée dans la base de données
              </div>
            </div>

            <!-- Compact Voir plus / Réduire button -->
            <div
              *ngIf="history.length > 3"
              class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between"
            >
              <p class="text-xs text-[var(--bridge-text-muted)]">
                {{ history.length }} diffusion(s) au total
              </p>
              <button
                (click)="historyExpanded = !historyExpanded"
                class="text-xs font-semibold text-[var(--bridge-crimson)] hover:text-white transition-colors flex items-center gap-1 cursor-pointer py-1 px-2 rounded hover:bg-white/5"
              >
                <svg
                  class="w-3.5 h-3.5 transition-transform duration-300"
                  [class.rotate-180]="historyExpanded"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <span>{{
                  historyExpanded ? 'Réduire' : 'Voir plus (' + history.length + ')'
                }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminBroadcastComponent implements OnInit {
  form = { title: '', message: '', roles: [] as string[] };
  sending = false;
  successMsg = '';
  errorMsg = '';
  history: any[] = [];
  historyExpanded = false;

  roles = [
    {
      key: 'STAGIAIRE',
      label: 'Stagiaires',
      iconBg: 'bg-purple-500/10',
      desc: 'Tous les stagiaires actifs',
    },
    {
      key: 'FORMATEUR',
      label: 'Formateurs',
      iconBg: 'bg-amber-500/10',
      desc: 'Tous les formateurs actifs',
    },
    {
      key: 'ADMIN',
      label: 'Administrateurs',
      iconBg: 'bg-rose-500/10',
      desc: 'Tous les administrateurs',
    },
  ];

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.adminService.getBroadcastHistory().subscribe({
      next: (list) => {
        this.history = list || [];
      },
      error: () => {},
    });
  }

  toggleRole(key: string): void {
    if (this.form.roles.includes(key)) {
      this.form.roles = this.form.roles.filter((r) => r !== key);
    } else {
      this.form.roles = [...this.form.roles, key];
    }
  }

  send(): void {
    this.sending = true;
    this.errorMsg = '';
    this.adminService
      .broadcastNotification(this.form.title, this.form.message, this.form.roles)
      .subscribe({
        next: (result) => {
          this.sending = false;
          this.successMsg = `Notification enregistrée en base et diffusée à ${result.sent} utilisateur(s) !`;
          this.toastService.success(
            `Notification diffusée à ${result.sent} utilisateur(s) !`,
            'Diffusion Réussie',
          );
          this.notificationService.refreshNotifications();
          this.loadHistory();
          this.form = { title: '', message: '', roles: [] };
          setTimeout(() => (this.successMsg = ''), 4000);
        },
        error: () => {
          this.sending = false;
          this.errorMsg = "Erreur lors de l'envoi de la notification";
          this.toastService.error("Erreur lors de l'envoi de la notification", 'Erreur');
        },
      });
  }
}
