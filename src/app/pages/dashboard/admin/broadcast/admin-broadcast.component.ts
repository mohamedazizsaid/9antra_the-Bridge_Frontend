import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-admin-broadcast',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <div>
        <h1 class="font-syne font-bold text-2xl text-white">📢 Centre de Diffusion</h1>
        <p class="text-[var(--bridge-text-muted)] text-sm mt-1">Envoyer des notifications ciblées aux utilisateurs</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Compose Form -->
        <div class="bridge-card p-6">
          <h3 class="font-semibold text-white text-base mb-5">Composer la notification</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Titre *</label>
              <input [(ngModel)]="form.title" placeholder="Ex: 🔔 Maintenance prévue ce soir" class="bridge-input w-full">
            </div>
            <div>
              <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Message *</label>
              <textarea [(ngModel)]="form.message" rows="4" placeholder="Entrez le contenu de votre notification..." 
                        class="bridge-input w-full resize-none"></textarea>
            </div>
            <div>
              <label class="block text-xs text-[var(--bridge-text-muted)] mb-2">Destinataires *</label>
              <div class="space-y-2">
                <label *ngFor="let role of roles" 
                       class="flex items-center gap-3 p-3 rounded-xl border border-[var(--bridge-border)] hover:border-[var(--bridge-crimson)]/30 cursor-pointer transition-all"
                       [class]="form.roles.includes(role.key) ? 'border-[var(--bridge-crimson)]/50 bg-[var(--bridge-crimson)]/5' : ''">
                  <input type="checkbox" [checked]="form.roles.includes(role.key)" 
                         (change)="toggleRole(role.key)"
                         class="w-4 h-4 accent-[var(--bridge-crimson)]">
                  <span class="text-xl">{{ role.icon }}</span>
                  <div>
                    <p class="text-sm text-white font-medium">{{ role.label }}</p>
                    <p class="text-xs text-[var(--bridge-text-muted)]">{{ role.desc }}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <button (click)="send()" [disabled]="sending || !form.title || !form.message || form.roles.length === 0"
                  class="bridge-btn-primary w-full py-3 mt-6 text-sm disabled:opacity-50">
            {{ sending ? '⏳ Envoi en cours...' : '🚀 Diffuser la notification' }}
          </button>
          <div *ngIf="successMsg" class="mt-3 text-center text-emerald-400 text-sm animate-fadeIn">{{ successMsg }}</div>
          <div *ngIf="errorMsg" class="mt-3 text-center text-red-400 text-sm">{{ errorMsg }}</div>
        </div>

        <!-- Preview + History -->
        <div class="space-y-4">
          <!-- Live preview -->
          <div class="bridge-card p-5">
            <h3 class="font-semibold text-white text-sm mb-4">Aperçu de la notification</h3>
            <div class="bg-[#08081A] rounded-xl p-4 border border-[var(--bridge-border)]">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-xl flex-shrink-0">📢</div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-white">{{ form.title || 'Titre de la notification...' }}</p>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-1">{{ form.message || 'Contenu du message...' }}</p>
                  <p class="text-[10px] text-white/30 mt-2">À l\'instant</p>
                </div>
                <div class="w-2 h-2 rounded-full bg-[var(--bridge-crimson)] flex-shrink-0"></div>
              </div>
            </div>
          </div>

          <!-- Recent broadcasts -->
          <div class="bridge-card p-5">
            <h3 class="font-semibold text-white text-sm mb-4">Historique des diffusions</h3>
            <div class="space-y-3">
              <div *ngFor="let h of history" class="p-3 bg-white/5 rounded-xl">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-white truncate">{{ h.title }}</p>
                  <span class="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                    {{ h.sent }} envoyés
                  </span>
                </div>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-1 line-clamp-1">{{ h.message }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span *ngFor="let r of h.roles" class="text-[9px] font-bold bg-white/10 text-white/60 px-1.5 py-0.5 rounded">{{ r }}</span>
                  <span class="text-[10px] text-white/30 ml-auto">{{ h.time }}</span>
                </div>
              </div>
              <div *ngIf="history.length === 0" class="text-center text-[var(--bridge-text-muted)] text-xs py-4">
                Aucune diffusion récente
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminBroadcastComponent {
  form = { title: '', message: '', roles: [] as string[] };
  sending = false;
  successMsg = '';
  errorMsg = '';
  history: any[] = [];

  roles = [
    { key: 'STAGIAIRE', label: 'Stagiaires', icon: '🎓', desc: 'Tous les stagiaires actifs' },
    { key: 'FORMATEUR', label: 'Formateurs', icon: '👨‍🏫', desc: 'Tous les formateurs actifs' },
    { key: 'ADMIN', label: 'Administrateurs', icon: '🛡️', desc: 'Tous les admins' },
  ];

  constructor(private adminService: AdminService) {}

  toggleRole(key: string): void {
    if (this.form.roles.includes(key)) {
      this.form.roles = this.form.roles.filter(r => r !== key);
    } else {
      this.form.roles = [...this.form.roles, key];
    }
  }

  send(): void {
    this.sending = true;
    this.errorMsg = '';
    this.adminService.broadcastNotification(this.form.title, this.form.message, this.form.roles).subscribe({
      next: (result) => {
        this.sending = false;
        this.successMsg = `✅ Notification envoyée à ${result.sent} utilisateur(s) !`;
        this.history.unshift({
          title: this.form.title,
          message: this.form.message,
          roles: [...this.form.roles],
          sent: result.sent,
          time: 'À l\'instant'
        });
        this.form = { title: '', message: '', roles: [] };
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: () => {
        this.sending = false;
        this.errorMsg = 'Erreur lors de l\'envoi';
      }
    });
  }
}
