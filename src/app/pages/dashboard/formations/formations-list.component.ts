import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormationService } from '../../../core/services/formation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Formation } from '../../../core/models/formation.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-formations-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fadein">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="font-syne font-bold text-2xl md:text-3xl text-white">
            🎓 Gestion des <span class="bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text text-transparent">Formations</span>
          </h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">
            Gérez le catalogue des programmes. Cliquez sur une formation pour voir les phases, séances et stagiaires.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button *ngIf="canCreate"
                  routerLink="/dashboard/formations/new"
                  class="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02] shadow-[0_0_20px_rgba(198,39,97,0.3)]">
            ➕ Nouvelle Formation
          </button>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div *ngIf="loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let i of [1,2,3]"
             class="glass-card border border-[var(--bridge-border)] p-6 space-y-4 animate-pulse">
          <div class="flex justify-between">
            <div class="h-5 w-20 bg-white/5 rounded-full"></div>
            <div class="h-5 w-16 bg-white/5 rounded-full"></div>
          </div>
          <div class="h-6 w-3/4 bg-white/5 rounded-lg"></div>
          <div class="space-y-2">
            <div class="h-3 bg-white/5 rounded"></div>
            <div class="h-3 w-5/6 bg-white/5 rounded"></div>
          </div>
          <div class="h-px bg-white/5"></div>
          <div class="space-y-2">
            <div class="flex justify-between"><div class="h-3 w-16 bg-white/5 rounded"></div><div class="h-3 w-8 bg-white/5 rounded"></div></div>
            <div class="flex justify-between"><div class="h-3 w-20 bg-white/5 rounded"></div><div class="h-3 w-24 bg-white/5 rounded"></div></div>
          </div>
        </div>
      </div>

      <!-- Search + Filter Bar -->
      <div *ngIf="!loading && formations.length > 0" class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
          <input [(ngModel)]="searchQuery" type="text" placeholder="Rechercher une formation..."
                 class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors" />
        </div>
        <select [(ngModel)]="filterCategory"
                class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors">
          <option value="" class="bg-[#10102A]">Toutes les catégories</option>
          <option *ngFor="let cat of categories" [value]="cat" class="bg-[#10102A]">{{ cat }}</option>
        </select>
        <div class="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          <button (click)="viewMode = 'grid'"
                  class="px-3 py-2 rounded-lg text-sm transition-all"
                  [class]="viewMode === 'grid' ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white' : 'text-white/40 hover:text-white'">
            ⊞
          </button>
          <button (click)="viewMode = 'list'"
                  class="px-3 py-2 rounded-lg text-sm transition-all"
                  [class]="viewMode === 'list' ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white' : 'text-white/40 hover:text-white'">
            ☰
          </button>
        </div>
      </div>

      <!-- Grid View -->
      <div *ngIf="!loading && viewMode === 'grid'" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let f of filteredFormations; let i = index"
             (click)="openFormation(f)"
             class="glass-card border border-[var(--bridge-border)] p-6 flex flex-col justify-between cursor-pointer group hover:border-[#C62761]/40 hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(198,39,97,0.12)] transition-all duration-300"
             [style.animation-delay]="(i * 70) + 'ms'"
             style="animation: fadeSlideIn 0.4s ease both">

          <!-- Top Row -->
          <div>
            <div class="flex justify-between items-start mb-4">
              <span class="text-[10px] px-2.5 py-1 bg-white/5 rounded-full text-white/60 uppercase font-mono tracking-wider font-semibold border border-white/10">
                {{ f.category || 'Général' }}
              </span>
              <div class="flex items-center gap-2">
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border"
                      [class]="getStatusClass(f.status)">
                  {{ getStatusLabel(f.status) }}
                </span>
                <span class="text-xs font-mono font-bold text-[#F5A623]">{{ f.totalPrice | number }} TND</span>
              </div>
            </div>

            <h3 class="font-syne font-bold text-lg text-white mb-2 group-hover:text-[#F5A623] transition-colors leading-snug">
              {{ f.nom }}
            </h3>
            <p class="text-xs text-[var(--bridge-text-muted)] line-clamp-3 mb-5 leading-relaxed">
              {{ f.description }}
            </p>
          </div>

          <!-- Progress -->
          <div>
            <div class="mb-4 space-y-1.5">
              <div class="flex justify-between text-[10px] text-white/40">
                <span>Progression globale</span>
                <span class="font-mono">{{ getOverallProgress(f) }}%</span>
              </div>
              <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-[#C62761] to-[#F5A623] transition-all duration-700"
                     [style.width]="getOverallProgress(f) + '%'"></div>
              </div>
            </div>

            <!-- Meta Info -->
            <div class="border-t border-white/5 pt-4 space-y-2.5">
              <div class="flex justify-between text-xs text-[var(--bridge-text-muted)]">
                <span>Phases :</span>
                <div class="flex gap-1">
                  <span *ngFor="let p of f.phases; let pi = index"
                        class="w-4 h-4 rounded-sm text-[8px] font-bold flex items-center justify-center"
                        [class]="getPhaseChipClass(p.status)">
                    {{ pi + 1 }}
                  </span>
                </div>
              </div>
              <div class="flex justify-between text-xs text-[var(--bridge-text-muted)]">
                <span>Formateur :</span>
                <span class="font-semibold text-[#C62761] truncate max-w-[140px]">{{ f.formateurNom || 'Non assigné' }}</span>
              </div>
            </div>

            <!-- CTA -->
            <div class="mt-4 flex items-center justify-between">
              <button class="text-xs text-[#C62761] font-semibold group-hover:text-[#F5A623] transition-colors">
                Voir les détails →
              </button>
              <div class="flex -space-x-1">
                <div *ngFor="let _ of getStarsArray(f); let si = index"
                     class="w-6 h-6 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] border-2 border-[#08081A] flex items-center justify-center text-[8px] font-bold text-white"
                     [style.z-index]="10 - si">
                  {{ si + 1 }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div *ngIf="!loading && viewMode === 'list'" class="glass-card border border-[var(--bridge-border)] overflow-hidden">
        <div class="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-white/[0.02] border-b border-white/5">
          <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Formation</span>
          <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-center">Phases</span>
          <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-center">Statut</span>
          <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-right">Prix</span>
        </div>
        <div class="divide-y divide-white/[0.03]">
          <div *ngFor="let f of filteredFormations; let i = index"
               (click)="openFormation(f)"
               class="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-4 hover:bg-white/[0.02] cursor-pointer transition-colors group"
               [style.animation-delay]="(i * 40) + 'ms'"
               style="animation: fadeSlideIn 0.3s ease both">
            <div class="min-w-0">
              <p class="font-semibold text-white text-sm group-hover:text-[#F5A623] transition-colors truncate">{{ f.nom }}</p>
              <p class="text-xs text-white/40 mt-0.5">{{ f.formateurNom }} · {{ f.category }}</p>
            </div>
            <div class="flex items-center justify-center gap-1">
              <span *ngFor="let p of f.phases; let pi = index"
                    class="w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center"
                    [class]="getPhaseChipClass(p.status)">
                {{ pi + 1 }}
              </span>
            </div>
            <div class="flex items-center justify-center">
              <span class="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border"
                    [class]="getStatusClass(f.status)">
                {{ getStatusLabel(f.status) }}
              </span>
            </div>
            <div class="flex items-center justify-end">
              <span class="text-sm font-mono font-bold text-[#F5A623]">{{ f.totalPrice | number }} TND</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && formations.length === 0"
           class="glass-card border border-[var(--bridge-border)] p-16 text-center">
        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-[rgba(198,39,97,0.1)] to-[rgba(245,166,35,0.05)] flex items-center justify-center text-4xl mx-auto mb-6">📚</div>
        <p class="font-syne font-bold text-xl text-white">Aucune formation disponible</p>
        <p class="text-[var(--bridge-text-muted)] text-sm mt-3 mb-8 max-w-md mx-auto leading-relaxed">
          Créez le tout premier programme d'enseignement en utilisant le wizard de création.
        </p>
        <button *ngIf="canCreate"
                routerLink="/dashboard/formations/new"
                class="px-6 py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white rounded-xl text-sm font-bold transition-all hover:opacity-90 shadow-[0_0_20px_rgba(198,39,97,0.3)]">
          ➕ Créer un programme
        </button>
      </div>

      <!-- No Results -->
      <div *ngIf="!loading && formations.length > 0 && filteredFormations.length === 0"
           class="glass-card border border-[var(--bridge-border)] p-12 text-center">
        <div class="text-3xl mb-3">🔍</div>
        <p class="font-semibold text-white">Aucune formation correspondante</p>
        <p class="text-white/40 text-sm mt-1">Modifiez vos critères de recherche.</p>
        <button (click)="searchQuery = ''; filterCategory = ''"
                class="mt-4 text-xs text-[#C62761] hover:text-[#F5A623] transition-colors font-semibold">
          ✕ Effacer les filtres
        </button>
      </div>

    </div>

    <style>
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadein { animation: fadeSlideIn 0.4s ease both; }
    </style>
  `
})
export class FormationsListComponent implements OnInit {
  formations: Formation[] = [];
  user: User | null = null;
  loading = true;
  searchQuery = '';
  filterCategory = '';
  viewMode: 'grid' | 'list' = 'grid';

  get canCreate(): boolean {
    return this.user?.role === 'ADMIN' || this.user?.role === 'FORMATEUR';
  }

  get categories(): string[] {
    const set = new Set(this.formations.map(f => f.category).filter(Boolean) as string[]);
    return Array.from(set);
  }

  get filteredFormations(): Formation[] {
    return this.formations.filter(f => {
      const matchSearch = !this.searchQuery.trim() ||
        f.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (f.description || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (f.formateurNom || '').toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchCat = !this.filterCategory || f.category === this.filterCategory;
      return matchSearch && matchCat;
    });
  }

  constructor(
    private formationService: FormationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadFormations();
  }

  loadFormations(): void {
    this.loading = true;
    const obs = this.user?.role === 'FORMATEUR'
      ? this.formationService.getFormationsByFormateur(this.user!.id)
      : this.formationService.getFormations();
    obs.subscribe({
      next: (data) => { this.formations = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openFormation(f: Formation): void {
    const base = this.user?.role === 'FORMATEUR' ? '/dashboard/formateur' : '/dashboard';
    this.router.navigate([`${base}/formations/${f.id}`]);
  }

  getOverallProgress(f: Formation): number {
    if (!f.phases || f.phases.length === 0) return 0;
    const sum = f.phases.reduce((s, p) => s + (p.progression || 0), 0);
    return Math.round(sum / f.phases.length);
  }

  getPhaseChipClass(status: string): string {
    switch (status) {
      case 'COMPLETEE': return 'bg-emerald-500/20 text-emerald-400';
      case 'EN_COURS': return 'bg-[rgba(198,39,97,0.2)] text-[#C62761]';
      case 'VERROUILLEE': return 'bg-white/5 text-white/30';
      default: return 'bg-white/5 text-white/30';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'TERMINEE': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'PLANIFIEE': return 'bg-[rgba(245,166,35,0.1)] text-[#F5A623] border-[rgba(245,166,35,0.2)]';
      default: return 'bg-white/5 text-white/50 border-white/10';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return '● En cours';
      case 'TERMINEE': return '✓ Terminée';
      case 'PLANIFIEE': return '○ Planifiée';
      default: return status;
    }
  }

  getStarsArray(f: Formation): any[] {
    return Array(Math.min(f.phases?.length || 0, 3)).fill(0);
  }
}
