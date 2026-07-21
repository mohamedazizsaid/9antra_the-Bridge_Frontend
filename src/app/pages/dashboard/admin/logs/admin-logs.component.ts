import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-syne font-bold text-2xl text-white">🔍 Logs & Audit</h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">Historique de toutes les requêtes API</p>
        </div>
        <button (click)="loadLogs()" class="bridge-btn-secondary px-4 py-2 text-sm">🔄 Actualiser</button>
      </div>

      <!-- Filters -->
      <div class="bridge-card p-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Méthode HTTP</label>
            <select [(ngModel)]="filters.method" class="bridge-input w-full text-sm">
              <option value="">Toutes</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Adresse IP</label>
            <input [(ngModel)]="filters.ip" placeholder="ex: 127.0.0.1" class="bridge-input w-full text-sm">
          </div>
          <div>
            <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">De</label>
            <input [(ngModel)]="filters.from" type="datetime-local" class="bridge-input w-full text-sm">
          </div>
          <div>
            <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">À</label>
            <input [(ngModel)]="filters.to" type="datetime-local" class="bridge-input w-full text-sm">
          </div>
        </div>
        <div class="flex gap-3 mt-4">
          <button (click)="applyFilters()" class="bridge-btn-primary px-4 py-2 text-sm">Appliquer les filtres</button>
          <button (click)="clearFilters()" class="bridge-btn-secondary px-4 py-2 text-sm">Réinitialiser</button>
        </div>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bridge-card p-4 text-center">
          <p class="text-2xl font-bold text-white">{{ totalElements }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Total requêtes</p>
        </div>
        <div class="bridge-card p-4 text-center">
          <p class="text-2xl font-bold text-emerald-400">{{ getCount('200') + getCount('201') }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Succès (2xx)</p>
        </div>
        <div class="bridge-card p-4 text-center">
          <p class="text-2xl font-bold text-yellow-400">{{ getCount('401') + getCount('403') }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Auth échouée</p>
        </div>
        <div class="bridge-card p-4 text-center">
          <p class="text-2xl font-bold text-red-400">{{ getCount('500') }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Erreurs serveur</p>
        </div>
      </div>

      <!-- Logs table -->
      <div class="bridge-card overflow-hidden">
        <div class="overflow-x-auto">
          <div [class]="expanded ? '' : 'max-h-[500px] overflow-y-auto'">
            <table class="w-full text-sm">
              <thead class="border-b border-[var(--bridge-border)] sticky top-0 bg-[#10102A]">
                <tr>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Horodatage</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Requête</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">IP</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Utilisateur</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr *ngFor="let log of logs" class="hover:bg-white/[0.02] transition-colors">
                  <td class="py-3 px-4 text-[var(--bridge-text-muted)] text-xs whitespace-nowrap">{{ formatDate(log.createdAt) }}</td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <span [class]="getMethodClass(log.action)" class="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                        {{ getMethod(log.action) }}
                      </span>
                      <span class="text-white text-xs font-mono truncate max-w-xs">{{ getPath(log.action) }}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 font-mono text-xs text-[var(--bridge-text-muted)]">{{ log.ipAddress }}</td>
                  <td class="py-3 px-4 text-xs text-[var(--bridge-text-muted)]">{{ log.userName }}</td>
                  <td class="py-3 px-4">
                    <span [class]="getStatusClass(log.action)" class="text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {{ getStatus(log.action) }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="logs.length === 0">
                  <td colspan="5" class="text-center py-12 text-[var(--bridge-text-muted)]">Aucun log trouvé</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="px-4 py-3 border-t border-[var(--bridge-border)] flex items-center justify-between">
          <span class="text-xs text-[var(--bridge-text-muted)]">{{ logs.length }} / {{ totalElements }} entrées</span>
          <div class="flex items-center gap-2">
            <button (click)="expanded = !expanded" class="text-xs text-[var(--bridge-crimson)] hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-white/5">
              {{ expanded ? '▲ Réduire' : '▼ Tout afficher' }}
            </button>
            <button *ngIf="currentPage < totalPages - 1" (click)="loadMore()" class="bridge-btn-secondary text-xs px-3 py-1.5">
              Charger plus
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminLogsComponent implements OnInit {
  logs: any[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  expanded = false;
  filters = { method: '', ip: '', from: '', to: '' };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void { this.loadLogs(); }

  loadLogs(): void {
    this.adminService.getLogs(0, 100, this.filters.method || undefined, this.filters.ip || undefined,
      this.filters.from || undefined, this.filters.to || undefined).subscribe({
      next: (data) => {
        this.logs = data.logs || [];
        this.totalElements = data.totalElements || 0;
        this.totalPages = data.totalPages || 0;
        this.currentPage = 0;
      },
      error: () => {}
    });
  }

  applyFilters(): void { this.loadLogs(); }

  clearFilters(): void {
    this.filters = { method: '', ip: '', from: '', to: '' };
    this.loadLogs();
  }

  loadMore(): void {
    this.currentPage++;
    this.adminService.getLogs(this.currentPage, 100).subscribe({
      next: (data) => { this.logs = [...this.logs, ...(data.logs || [])]; }
    });
  }

  getCount(statusCode: string): number {
    return this.logs.filter(l => l.action && l.action.includes('[' + statusCode + ']')).length;
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
      'GET': 'bg-blue-500/10 text-blue-400',
      'POST': 'bg-emerald-500/10 text-emerald-400',
      'PUT': 'bg-yellow-500/10 text-yellow-400',
      'DELETE': 'bg-red-500/10 text-red-400',
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
