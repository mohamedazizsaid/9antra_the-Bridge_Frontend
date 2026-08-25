import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <!-- Header Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div>
            <h1 class="font-syne font-bold text-2xl text-white">Logs & Audit Système</h1>
            <p class="text-[var(--bridge-text-muted)] text-sm mt-0.5">
              Historique de toutes les requêtes API et traçabilité
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Purge Logs Button -->
          <button
            (click)="openPurgeModal()"
            [disabled]="totalElements === 0"
            class="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <svg
              class="w-3.5 h-3.5 transition-transform group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            <span>Purger les requêtes</span>
          </button>

          <!-- Refresh Button -->
          <button
            (click)="loadLogs()"
            class="bridge-btn-secondary px-4 py-2 text-xs flex items-center gap-2 cursor-pointer"
          >
            <svg
              class="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      <!-- ─── Inline Purge Confirmation Card (No Background Overlay) ─── -->
      <div
        *ngIf="showPurgeModal"
        class="bridge-card p-6 border border-rose-500/30 bg-rose-500/[0.03] shadow-xl relative overflow-hidden animate-fadeIn"
      >
        <div
          class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-rose-500 via-[#E0452F] to-[#F5A623]"
        ></div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3 class="font-syne font-bold text-lg text-white">
                Confirmation de Purge des Requêtes
              </h3>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                Sélectionnez le volume de requêtes d'audit à supprimer définitivement.
              </p>
            </div>
          </div>

          <button
            (click)="showPurgeModal = false"
            class="self-end sm:self-auto w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <!-- Option 1: Delete All -->
          <label
            (click)="purgeMode = 'all'"
            class="flex items-center gap-3.5 p-4 rounded-xl border cursor-pointer transition-all"
            [class]="
              purgeMode === 'all'
                ? 'border-rose-500/60 bg-rose-500/10'
                : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
            "
          >
            <input
              type="radio"
              name="purgeMode"
              [checked]="purgeMode === 'all'"
              (change)="purgeMode = 'all'"
              class="accent-rose-500 w-4 h-4 cursor-pointer"
            />
            <div class="flex-1">
              <p class="text-sm font-semibold text-white">Supprimer toutes les requêtes</p>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                Purger l'intégralité de la base ({{ totalElements }} logs au total)
              </p>
            </div>
          </label>

          <!-- Option 2: Delete specific count -->
          <label
            (click)="purgeMode = 'custom'"
            class="flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all"
            [class]="
              purgeMode === 'custom'
                ? 'border-rose-500/60 bg-rose-500/10'
                : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
            "
          >
            <input
              type="radio"
              name="purgeMode"
              [checked]="purgeMode === 'custom'"
              (change)="purgeMode = 'custom'"
              class="accent-rose-500 w-4 h-4 mt-1 cursor-pointer"
            />
            <div class="flex-1 space-y-2">
              <div>
                <p class="text-sm font-semibold text-white">Supprimer un nombre précis</p>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                  Supprimer les N requêtes les plus anciennes
                </p>
              </div>
              <div *ngIf="purgeMode === 'custom'" class="pt-1 flex items-center gap-2">
                <input
                  type="number"
                  [(ngModel)]="customCount"
                  min="1"
                  [max]="totalElements || 1000"
                  (click)="$event.stopPropagation()"
                  class="bridge-input w-28 text-sm text-center font-mono font-bold"
                />
                <span class="text-xs text-[var(--bridge-text-muted)]">requête(s)</span>
              </div>
            </div>
          </label>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            (click)="showPurgeModal = false"
            [disabled]="isPurging"
            class="bridge-btn-secondary px-4 py-2 text-xs cursor-pointer"
          >
            Annuler
          </button>
          <button
            (click)="confirmPurge()"
            [disabled]="isPurging || (purgeMode === 'custom' && (!customCount || customCount <= 0))"
            class="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30 disabled:opacity-50"
          >
            <svg
              *ngIf="isPurging"
              class="animate-spin w-3.5 h-3.5 text-white"
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
              *ngIf="!isPurging"
              class="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            </svg>
            <span>{{ isPurging ? 'Suppression en cours...' : 'Confirmer la suppression' }}</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bridge-card p-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5 font-semibold"
              >Méthode HTTP</label
            >
            <select [(ngModel)]="filters.method" class="bridge-input w-full text-sm">
              <option value="">Toutes</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5 font-semibold"
              >Adresse IP</label
            >
            <input
              [(ngModel)]="filters.ip"
              placeholder="ex: 127.0.0.1"
              class="bridge-input w-full text-sm"
            />
          </div>
          <div>
            <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5 font-semibold"
              >De</label
            >
            <input
              [(ngModel)]="filters.from"
              type="datetime-local"
              class="bridge-input w-full text-sm"
            />
          </div>
          <div>
            <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5 font-semibold"
              >À</label
            >
            <input
              [(ngModel)]="filters.to"
              type="datetime-local"
              class="bridge-input w-full text-sm"
            />
          </div>
        </div>
        <div class="flex gap-3 mt-4">
          <button
            (click)="applyFilters()"
            class="bridge-btn-primary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg
              class="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Appliquer les filtres</span>
          </button>
          <button
            (click)="clearFilters()"
            class="bridge-btn-secondary px-4 py-2 text-xs cursor-pointer"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bridge-card p-4 text-center">
          <p class="text-2xl font-bold font-mono text-white">{{ totalElements }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Total requêtes</p>
        </div>
        <div class="bridge-card p-4 text-center">
          <p class="text-2xl font-bold font-mono text-emerald-400">
            {{ getCount('200') + getCount('201') }}
          </p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Succès (2xx)</p>
        </div>
        <div class="bridge-card p-4 text-center">
          <p class="text-2xl font-bold font-mono text-yellow-400">
            {{ getCount('401') + getCount('403') }}
          </p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Auth échouée (4xx)</p>
        </div>
        <div class="bridge-card p-4 text-center">
          <p class="text-2xl font-bold font-mono text-red-400">{{ getCount('500') }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Erreurs serveur (5xx)</p>
        </div>
      </div>

      <!-- Logs table -->
      <div class="bridge-card overflow-hidden">
        <div class="overflow-x-auto">
          <div [class]="expanded ? '' : 'max-h-[500px] overflow-y-auto'">
            <table class="w-full text-sm">
              <thead class="border-b border-[var(--bridge-border)] sticky top-0 bg-[#10102A]">
                <tr>
                  <th
                    class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    Horodatage
                  </th>
                  <th
                    class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    Requête
                  </th>
                  <th
                    class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    IP
                  </th>
                  <th
                    class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    Utilisateur
                  </th>
                  <th
                    class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr *ngFor="let log of logs" class="hover:bg-white/[0.02] transition-colors">
                  <td class="py-3 px-4 text-[var(--bridge-text-muted)] text-xs whitespace-nowrap">
                    {{ formatDate(log.createdAt) }}
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <span
                        [class]="getMethodClass(log.action)"
                        class="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono"
                      >
                        {{ getMethod(log.action) }}
                      </span>
                      <span class="text-white text-xs font-mono truncate max-w-xs">{{
                        getPath(log.action)
                      }}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 font-mono text-xs text-[var(--bridge-text-muted)]">
                    {{ log.ipAddress }}
                  </td>
                  <td class="py-3 px-4 text-xs text-[var(--bridge-text-muted)]">
                    {{ log.userName }}
                  </td>
                  <td class="py-3 px-4">
                    <span
                      [class]="getStatusClass(log.action)"
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    >
                      {{ getStatus(log.action) }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="logs.length === 0">
                  <td colspan="5" class="text-center py-12 text-[var(--bridge-text-muted)]">
                    Aucun log trouvé
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div
          class="px-4 py-3 border-t border-[var(--bridge-border)] flex items-center justify-between"
        >
          <span class="text-xs text-[var(--bridge-text-muted)]"
            >{{ logs.length }} / {{ totalElements }} entrées</span
          >
          <div class="flex items-center gap-2">
            <button
              (click)="expanded = !expanded"
              class="text-xs text-[var(--bridge-crimson)] hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-white/5 cursor-pointer"
            >
              {{ expanded ? '▲ Réduire' : '▼ Tout afficher' }}
            </button>
            <button
              *ngIf="currentPage < totalPages - 1"
              (click)="loadMore()"
              class="bridge-btn-secondary text-xs px-3 py-1.5 cursor-pointer"
            >
              Charger plus
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminLogsComponent implements OnInit {
  logs: any[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  expanded = false;
  filters = { method: '', ip: '', from: '', to: '' };

  // Purge Modal State
  showPurgeModal = false;
  purgeMode: 'all' | 'custom' = 'all';
  customCount = 50;
  isPurging = false;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.adminService
      .getLogs(
        0,
        100,
        this.filters.method || undefined,
        this.filters.ip || undefined,
        this.filters.from || undefined,
        this.filters.to || undefined,
      )
      .subscribe({
        next: (data) => {
          this.logs = data.logs || [];
          this.totalElements = data.totalElements || 0;
          this.totalPages = data.totalPages || 0;
          this.currentPage = 0;
        },
        error: () => {},
      });
  }

  openPurgeModal(): void {
    this.showPurgeModal = true;
    this.purgeMode = 'all';
    this.customCount = Math.min(50, this.totalElements || 50);
  }

  confirmPurge(): void {
    this.isPurging = true;
    const countToDelete = this.purgeMode === 'all' ? undefined : this.customCount;

    this.adminService.purgeLogs(countToDelete).subscribe({
      next: (res) => {
        this.isPurging = false;
        this.showPurgeModal = false;
        const deleted = res?.deleted || countToDelete || this.totalElements;
        this.toastService.success(
          `${deleted} log(s) d'audit supprimé(s) avec succès.`,
          'Purge des Logs',
        );
        this.loadLogs();
      },
      error: () => {
        this.isPurging = false;
        this.toastService.error("Erreur lors de la purge des logs d'audit.", 'Échec Purge');
      },
    });
  }

  applyFilters(): void {
    this.loadLogs();
  }

  clearFilters(): void {
    this.filters = { method: '', ip: '', from: '', to: '' };
    this.loadLogs();
  }

  loadMore(): void {
    this.currentPage++;
    this.adminService.getLogs(this.currentPage, 100).subscribe({
      next: (data) => {
        this.logs = [...this.logs, ...(data.logs || [])];
      },
    });
  }

  getCount(statusCode: string): number {
    return this.logs.filter((l) => l.action && l.action.includes('[' + statusCode + ']')).length;
  }

  getMethod(action: string): string {
    if (!action) return '?';
    return action.split(' ')[0] || '?';
  }

  getPath(action: string): string {
    if (!action) return '';
    const parts = action.split(' ');
    return parts[1] || '';
  }

  getStatus(action: string): string {
    if (!action) return '?';
    const match = action.match(/\[(\d+)\]/);
    return match ? match[1] : '?';
  }

  getMethodClass(action: string): string {
    const m = this.getMethod(action);
    const classes: Record<string, string> = {
      GET: 'bg-blue-500/10 text-blue-400',
      POST: 'bg-emerald-500/10 text-emerald-400',
      PUT: 'bg-yellow-500/10 text-yellow-400',
      DELETE: 'bg-red-500/10 text-red-400',
    };
    return classes[m] || 'bg-white/10 text-white';
  }

  getStatusClass(action: string): string {
    const s = parseInt(this.getStatus(action), 10);
    if (s >= 200 && s < 300) return 'bg-emerald-500/10 text-emerald-400';
    if (s >= 400 && s < 500) return 'bg-yellow-500/10 text-yellow-400';
    if (s >= 500) return 'bg-red-500/10 text-red-400';
    return 'bg-white/10 text-white';
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' });
  }
}
