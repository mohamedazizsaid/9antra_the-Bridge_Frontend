import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-syne font-bold text-2xl text-white">📈 Statistiques</h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">Supervision détaillée de la plateforme</p>
        </div>
        <button (click)="load()" class="bridge-btn-secondary px-4 py-2 text-sm">🔄 Actualiser</button>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bridge-card p-5 group hover:border-[var(--bridge-crimson)]/30 transition-all">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl">👥</div>
            <span class="text-xs text-emerald-400 font-semibold">↑ actifs</span>
          </div>
          <p class="text-3xl font-bold text-white">{{ stats?.totalUsers || 0 }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Utilisateurs total</p>
          <div class="h-1 rounded-full bg-blue-500/20 mt-3">
            <div class="h-full rounded-full bg-blue-500 transition-all" [style.width]="'100%'"></div>
          </div>
        </div>
        <div class="bridge-card p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-xl">🎓</div>
          </div>
          <p class="text-3xl font-bold text-white">{{ stats?.stagiaires || 0 }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Stagiaires</p>
          <div class="h-1 rounded-full bg-purple-500/20 mt-3">
            <div class="h-full rounded-full bg-purple-500" [style.width]="getPercent(stats?.stagiaires, stats?.totalUsers)"></div>
          </div>
        </div>
        <div class="bridge-card p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl">👨‍🏫</div>
          </div>
          <p class="text-3xl font-bold text-white">{{ stats?.formateurs || 0 }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Formateurs</p>
          <div class="h-1 rounded-full bg-orange-500/20 mt-3">
            <div class="h-full rounded-full bg-orange-500" [style.width]="getPercent(stats?.formateurs, stats?.totalUsers)"></div>
          </div>
        </div>
        <div class="bridge-card p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl">✅</div>
          </div>
          <p class="text-3xl font-bold text-white">{{ stats?.activeUsers || 0 }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Comptes actifs</p>
          <div class="h-1 rounded-full bg-emerald-500/20 mt-3">
            <div class="h-full rounded-full bg-emerald-500" [style.width]="getPercent(stats?.activeUsers, stats?.totalUsers)"></div>
          </div>
        </div>
      </div>

      <!-- Platform stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bridge-card p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-xl">📋</div>
          </div>
          <p class="text-3xl font-bold text-white">{{ baseStats?.formations || 0 }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Formations</p>
        </div>
        <div class="bridge-card p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-xl">📝</div>
          </div>
          <p class="text-3xl font-bold text-white">{{ baseStats?.evaluations || 0 }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Évaluations</p>
        </div>
        <div class="bridge-card p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-xl">🏅</div>
          </div>
          <p class="text-3xl font-bold text-white">{{ baseStats?.certificates || 0 }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Certificats</p>
        </div>
      </div>

      <!-- Audit logs counter -->
      <div class="bridge-card p-5">
        <h3 class="font-semibold text-white mb-4">Activité Système</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-white/5 rounded-xl">
            <p class="text-2xl font-bold text-white">{{ stats?.totalLogs || 0 }}</p>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Requêtes API loggées</p>
          </div>
          <div class="text-center p-4 bg-white/5 rounded-xl">
            <p class="text-2xl font-bold text-emerald-400">{{ stats?.activeUsers || 0 }}</p>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Comptes actifs</p>
          </div>
          <div class="text-center p-4 bg-white/5 rounded-xl">
            <p class="text-2xl font-bold text-yellow-400">{{ (stats?.totalUsers || 0) - (stats?.activeUsers || 0) }}</p>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Comptes inactifs</p>
          </div>
        </div>
      </div>

      <!-- Users by month -->
      <div *ngIf="usersByMonth.length > 0" class="bridge-card p-5">
        <h3 class="font-semibold text-white mb-4">Inscriptions par mois (6 derniers mois)</h3>
        <div class="space-y-3">
          <div *ngFor="let item of usersByMonth" class="flex items-center gap-4">
            <span class="text-xs text-[var(--bridge-text-muted)] w-20 text-right flex-shrink-0">{{ item.month }}</span>
            <div class="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden">
              <div class="h-full bg-gradient-to-r from-[#C62761] to-[#F5A623] rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                   [style.width]="getBarWidth(item.count)">
                <span class="text-[10px] font-bold text-white">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminStatsComponent implements OnInit {
  stats: any = null;
  baseStats: any = null;
  usersByMonth: { month: string; count: number }[] = [];
  maxCount = 1;

  constructor(private adminService: AdminService, private userService: UserService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.adminService.getExtendedStats().subscribe({
      next: (data) => {
        this.stats = data;
        if (data.usersByMonth) {
          this.usersByMonth = Object.entries(data.usersByMonth).map(([month, count]) => ({
            month, count: count as number
          }));
          this.maxCount = Math.max(...this.usersByMonth.map(i => i.count), 1);
        }
      }
    });
    this.userService.getAdminStats().subscribe({
      next: (data) => { this.baseStats = data; }
    });
  }

  getPercent(val: number, total: number): string {
    if (!total) return '0%';
    return Math.round((val / total) * 100) + '%';
  }

  getBarWidth(count: number): string {
    return Math.round((count / this.maxCount) * 100) + '%';
  }
}
