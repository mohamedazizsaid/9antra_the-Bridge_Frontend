import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { EvaluationService, Evaluation } from '../../../../core/services/evaluation.service';
import { User } from '../../../../core/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-evaluation-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fadein">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="font-syne font-bold text-2xl md:text-3xl text-white">
            📝 Historique des <span class="bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text text-transparent">Évaluations</span>
          </h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">
            Retrouvez toutes les évaluations que vous avez saisies pour vos stagiaires.
          </p>
        </div>
        <div class="text-sm text-[var(--bridge-text-muted)] font-mono bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          {{ today }}
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
        <div class="w-12 h-12 rounded-full border-2 border-[#C62761]/30 border-t-[#C62761] animate-spin"></div>
        <p class="text-white/40 text-sm">Chargement des évaluations...</p>
      </div>

      <ng-container *ngIf="!loading">

        <!-- Stats Row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-card p-5 border border-[var(--bridge-border)] relative overflow-hidden group hover:border-[rgba(198,39,97,0.3)] transition-all">
            <div class="absolute inset-0 bg-gradient-to-br from-[rgba(198,39,97,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p class="text-xs text-white/40 uppercase tracking-wider">Total</p>
            <p class="text-3xl font-mono font-bold text-white mt-2">{{ evaluations.length }}</p>
            <p class="text-xs text-white/30 mt-1">évaluations saisies</p>
          </div>
          <div class="glass-card p-5 border border-[var(--bridge-border)] relative overflow-hidden group hover:border-[rgba(245,166,35,0.3)] transition-all">
            <div class="absolute inset-0 bg-gradient-to-br from-[rgba(245,166,35,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p class="text-xs text-white/40 uppercase tracking-wider">Moyenne</p>
            <p class="text-3xl font-mono font-bold text-[#F5A623] mt-2">{{ getAverage() }}</p>
            <p class="text-xs text-white/30 mt-1">note /20</p>
          </div>
          <div class="glass-card p-5 border border-[var(--bridge-border)] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p class="text-xs text-white/40 uppercase tracking-wider">Certifiés</p>
            <p class="text-3xl font-mono font-bold text-emerald-400 mt-2">{{ getCertifiedCount() }}</p>
            <p class="text-xs text-white/30 mt-1">≥ 14/20</p>
          </div>
          <div class="glass-card p-5 border border-[var(--bridge-border)] relative overflow-hidden group hover:border-purple-500/30 transition-all">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p class="text-xs text-white/40 uppercase tracking-wider">Stagiaires</p>
            <p class="text-3xl font-mono font-bold text-purple-400 mt-2">{{ getUniqueStudents() }}</p>
            <p class="text-xs text-white/30 mt-1">évalués</p>
          </div>
        </div>

        <!-- Grade Distribution -->
        <div class="glass-card border border-[var(--bridge-border)] p-6" *ngIf="evaluations.length > 0">
          <h3 class="font-syne font-bold text-base mb-5">📊 Distribution des Notes</h3>
          <div class="space-y-3">
            <div *ngFor="let band of gradeBands" class="flex items-center gap-4">
              <span class="text-xs font-semibold w-24 flex-shrink-0" [class]="band.color">{{ band.label }}</span>
              <div class="flex-1 h-5 bg-white/5 rounded-full overflow-hidden relative">
                <div class="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                     [style.width]="getBandPercentage(band.min, band.max) + '%'"
                     [class]="band.bg">
                </div>
              </div>
              <span class="text-xs font-mono text-white/50 w-12 text-right">
                {{ getBandCount(band.min, band.max) }} ({{ getBandPercentage(band.min, band.max) }}%)
              </span>
            </div>
          </div>
        </div>

        <!-- Filters & Search -->
        <div class="flex flex-col sm:flex-row gap-3" *ngIf="evaluations.length > 0">
          <div class="relative flex-1">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
            <input [(ngModel)]="searchQuery" type="text"
                   placeholder="Rechercher un stagiaire, une phase, une formation..."
                   class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors" />
          </div>
          <select [(ngModel)]="filterFormation"
                  class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors">
            <option value="" class="bg-[#10102A]">Toutes les formations</option>
            <option *ngFor="let f of uniqueFormations" [value]="f" class="bg-[#10102A]">{{ f }}</option>
          </select>
          <select [(ngModel)]="sortBy"
                  class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors">
            <option value="date_desc" class="bg-[#10102A]">Plus récents</option>
            <option value="date_asc" class="bg-[#10102A]">Plus anciens</option>
            <option value="grade_desc" class="bg-[#10102A]">Meilleure note</option>
            <option value="grade_asc" class="bg-[#10102A]">Note la plus basse</option>
          </select>
        </div>

        <!-- Evaluations Table -->
        <div *ngIf="filteredEvaluations.length > 0" class="glass-card border border-[var(--bridge-border)] overflow-hidden">
          <!-- Table Header -->
          <div class="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
            <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Stagiaire</span>
            <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold hidden sm:block">Phase / Formation</span>
            <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-center">Note</span>
            <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-right">Date</span>
          </div>

          <!-- Table Rows -->
          <div class="divide-y divide-white/[0.03]">
            <div *ngFor="let ev of filteredEvaluations; let i = index"
                 class="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                 [style.animation-delay]="(i * 40) + 'ms'"
                 style="animation: fadeSlideIn 0.35s ease both"
                 (click)="toggleDetail(ev)">

              <!-- Student -->
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                  <img *ngIf="ev.studentAvatar" [src]="ev.studentAvatar" class="w-full h-full object-cover" />
                  <span *ngIf="!ev.studentAvatar">{{ ev.studentFirstName?.[0] }}{{ ev.studentLastName?.[0] }}</span>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-white truncate group-hover:text-[#F5A623] transition-colors">
                    {{ ev.studentFirstName }} {{ ev.studentLastName }}
                  </p>
                  <p class="text-[10px] text-white/40 truncate sm:hidden">{{ ev.phaseTitle }}</p>
                </div>
              </div>

              <!-- Phase / Formation -->
              <div class="hidden sm:flex flex-col justify-center min-w-0">
                <p class="text-sm text-white/80 truncate">{{ ev.phaseTitle }}</p>
                <p class="text-[10px] text-white/40 truncate mt-0.5">{{ ev.formationTitle }}</p>
              </div>

              <!-- Grade Badge -->
              <div class="flex items-center justify-center">
                <span class="text-sm font-mono font-bold px-3 py-1.5 rounded-xl border"
                      [class]="getGradeBadgeClass(ev.grade)">
                  {{ ev.grade }}/20
                </span>
              </div>

              <!-- Date -->
              <div class="flex items-center justify-end">
                <span class="text-xs text-white/40 font-mono">
                  {{ ev.evaluationDate | date:'dd/MM/yy' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Expanded Detail Card (selected evaluation) -->
        <div *ngIf="selectedEval" class="glass-card border border-[rgba(198,39,97,0.3)] p-6 space-y-4 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-[rgba(198,39,97,0.05)] to-transparent pointer-events-none"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-syne font-bold text-white">Détail de l'évaluation</h3>
              <button (click)="selectedEval = null" class="text-white/40 hover:text-white transition-colors text-sm">✕ Fermer</button>
            </div>
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-3">
                <div>
                  <p class="text-[10px] text-white/40 uppercase tracking-widest">Stagiaire</p>
                  <p class="text-white font-semibold mt-1">{{ selectedEval.studentFirstName }} {{ selectedEval.studentLastName }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-white/40 uppercase tracking-widest">Phase</p>
                  <p class="text-white mt-1">{{ selectedEval.phaseTitle }}</p>
                  <p class="text-white/40 text-xs">{{ selectedEval.formationTitle }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-white/40 uppercase tracking-widest">Date d'évaluation</p>
                  <p class="text-white mt-1 font-mono">{{ selectedEval.evaluationDate | date:'EEEE d MMMM y' }}</p>
                </div>
              </div>
              <div class="space-y-3">
                <div>
                  <p class="text-[10px] text-white/40 uppercase tracking-widest">Note</p>
                  <div class="flex items-center gap-3 mt-2">
                    <span class="text-4xl font-mono font-bold" [class]="getGradeClass(selectedEval.grade)">
                      {{ selectedEval.grade }}
                    </span>
                    <div>
                      <p class="text-white/50 text-sm">/20</p>
                      <p class="text-sm font-semibold" [class]="getGradeClass(selectedEval.grade)">
                        {{ getGradeLabel(selectedEval.grade) }}
                      </p>
                    </div>
                  </div>
                  <!-- Grade Progress Bar -->
                  <div class="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700"
                         [class]="getGradeBarClass(selectedEval.grade)"
                         [style.width]="((selectedEval.grade || 0) / 20 * 100) + '%'"></div>
                  </div>
                </div>
                <div *ngIf="selectedEval.skills">
                  <p class="text-[10px] text-white/40 uppercase tracking-widest">Compétences</p>
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <span *ngFor="let s of selectedEval.skills.split(',')"
                          class="text-[10px] px-2 py-0.5 bg-[rgba(245,166,35,0.1)] text-[#F5A623] border border-[rgba(245,166,35,0.2)] rounded-full">
                      {{ s.trim() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="selectedEval.comment" class="mt-4 pt-4 border-t border-white/5">
              <p class="text-[10px] text-white/40 uppercase tracking-widest mb-2">Commentaire</p>
              <p class="text-sm text-white/70 leading-relaxed italic">"{{ selectedEval.comment }}"</p>
            </div>
            <!-- Certificate Status -->
            <div *ngIf="(selectedEval.grade || 0) >= 14"
                 class="mt-4 flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <span class="text-2xl">🏅</span>
              <div>
                <p class="text-emerald-400 font-semibold text-sm">Certificat Blockchain généré</p>
                <p class="text-emerald-400/60 text-xs mt-0.5">Le certificat a été envoyé par email au stagiaire</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="evaluations.length === 0"
             class="glass-card border border-[var(--bridge-border)] p-16 text-center">
          <div class="w-20 h-20 rounded-full bg-gradient-to-br from-[rgba(198,39,97,0.1)] to-[rgba(245,166,35,0.05)] flex items-center justify-center text-4xl mx-auto mb-6">
            📝
          </div>
          <p class="font-syne font-bold text-xl text-white">Aucune évaluation saisie</p>
          <p class="text-white/40 text-sm mt-3 max-w-md mx-auto leading-relaxed">
            Vous n'avez pas encore évalué de stagiaires. Rendez-vous dans vos formations pour évaluer vos stagiaires à la fin de chaque phase.
          </p>
        </div>

        <!-- No Results After Filter -->
        <div *ngIf="evaluations.length > 0 && filteredEvaluations.length === 0"
             class="glass-card border border-[var(--bridge-border)] p-12 text-center">
          <div class="text-3xl mb-3">🔍</div>
          <p class="font-semibold text-white">Aucun résultat</p>
          <p class="text-white/40 text-sm mt-1">Essayez de modifier vos filtres ou votre recherche.</p>
        </div>

      </ng-container>

    </div>

    <style>
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadein { animation: fadeSlideIn 0.4s ease both; }
    </style>
  `
})
export class EvaluationHistoryComponent implements OnInit, OnDestroy {
  user: User | null = null;
  evaluations: Evaluation[] = [];
  loading = true;
  searchQuery = '';
  filterFormation = '';
  sortBy = 'date_desc';
  selectedEval: Evaluation | null = null;
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  private sub = new Subscription();

  gradeBands = [
    { label: '🏆 Excellent', min: 16, max: 20, color: 'text-emerald-400', bg: 'bg-emerald-500/60' },
    { label: '⭐ Très bien', min: 14, max: 15.99, color: 'text-[#F5A623]', bg: 'bg-[#F5A623]/60' },
    { label: '✓ Bien', min: 12, max: 13.99, color: 'text-blue-400', bg: 'bg-blue-500/60' },
    { label: '○ Satisfaisant', min: 10, max: 11.99, color: 'text-purple-400', bg: 'bg-purple-500/60' },
    { label: '✕ Insuffisant', min: 0, max: 9.99, color: 'text-red-400', bg: 'bg-red-500/60' },
  ];

  constructor(
    private authService: AuthService,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) return;
    this.loading = true;
    this.sub.add(
      this.evaluationService.getEvaluationsByTrainer(this.user.id).subscribe({
        next: (data) => {
          this.evaluations = data || [];
          this.loading = false;
        },
        error: () => { this.loading = false; }
      })
    );
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  get uniqueFormations(): string[] {
    const set = new Set(this.evaluations.map(e => e.formationTitle).filter(Boolean) as string[]);
    return Array.from(set);
  }

  get filteredEvaluations(): Evaluation[] {
    let list = [...this.evaluations];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(e =>
        `${e.studentFirstName} ${e.studentLastName}`.toLowerCase().includes(q) ||
        (e.phaseTitle || '').toLowerCase().includes(q) ||
        (e.formationTitle || '').toLowerCase().includes(q) ||
        (e.skills || '').toLowerCase().includes(q)
      );
    }

    if (this.filterFormation) {
      list = list.filter(e => e.formationTitle === this.filterFormation);
    }

    switch (this.sortBy) {
      case 'date_desc': list.sort((a, b) => new Date(b.evaluationDate!).getTime() - new Date(a.evaluationDate!).getTime()); break;
      case 'date_asc': list.sort((a, b) => new Date(a.evaluationDate!).getTime() - new Date(b.evaluationDate!).getTime()); break;
      case 'grade_desc': list.sort((a, b) => (b.grade || 0) - (a.grade || 0)); break;
      case 'grade_asc': list.sort((a, b) => (a.grade || 0) - (b.grade || 0)); break;
    }
    return list;
  }

  getAverage(): string {
    if (this.evaluations.length === 0) return '—';
    const avg = this.evaluations.reduce((sum, e) => sum + (e.grade || 0), 0) / this.evaluations.length;
    return avg.toFixed(1);
  }

  getCertifiedCount(): number {
    return this.evaluations.filter(e => (e.grade || 0) >= 14).length;
  }

  getUniqueStudents(): number {
    return new Set(this.evaluations.map(e => e.studentId)).size;
  }

  getBandCount(min: number, max: number): number {
    return this.evaluations.filter(e => (e.grade || 0) >= min && (e.grade || 0) <= max).length;
  }

  getBandPercentage(min: number, max: number): number {
    if (this.evaluations.length === 0) return 0;
    return Math.round(this.getBandCount(min, max) / this.evaluations.length * 100);
  }

  toggleDetail(ev: Evaluation): void {
    this.selectedEval = this.selectedEval?.id === ev.id ? null : ev;
  }

  getGradeBadgeClass(grade: number | undefined): string {
    const g = grade || 0;
    if (g >= 16) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (g >= 14) return 'bg-[rgba(245,166,35,0.1)] text-[#F5A623] border-[rgba(245,166,35,0.2)]';
    if (g >= 12) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (g >= 10) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  }

  getGradeClass(grade: number | undefined): string {
    const g = grade || 0;
    if (g >= 16) return 'text-emerald-400';
    if (g >= 14) return 'text-[#F5A623]';
    if (g >= 12) return 'text-blue-400';
    if (g >= 10) return 'text-purple-400';
    return 'text-red-400';
  }

  getGradeLabel(grade: number | undefined): string {
    const g = grade || 0;
    if (g >= 16) return '🏆 Excellent';
    if (g >= 14) return '⭐ Très bien';
    if (g >= 12) return '✓ Bien';
    if (g >= 10) return '○ Satisfaisant';
    return '✕ Insuffisant';
  }

  getGradeBarClass(grade: number | undefined): string {
    const g = grade || 0;
    if (g >= 16) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    if (g >= 14) return 'bg-gradient-to-r from-[#C62761] to-[#F5A623]';
    if (g >= 12) return 'bg-gradient-to-r from-blue-600 to-blue-400';
    if (g >= 10) return 'bg-gradient-to-r from-purple-600 to-purple-400';
    return 'bg-gradient-to-r from-red-600 to-red-400';
  }
}
