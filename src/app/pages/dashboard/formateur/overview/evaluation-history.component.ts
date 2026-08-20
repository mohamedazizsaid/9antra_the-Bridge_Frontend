import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
            📝 Historique des
            <span class="bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text text-transparent"
              >Évaluations</span
            >
          </h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">
            Retrouvez toutes les évaluations que vous avez saisies pour vos stagiaires.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            *ngIf="!showEvalModal"
            (click)="openEvalModal()"
            class="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl text-sm hover:opacity-90 hover:scale-105 transition-all shadow-[0_0_15px_rgba(198,39,97,0.3)]"
          >
            ⭐ Nouvelle évaluation
          </button>
          <div
            class="text-sm text-[var(--bridge-text-muted)] font-mono bg-white/5 border border-white/10 px-4 py-2 rounded-xl"
          >
            {{ today }}
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
        <div
          class="w-12 h-12 rounded-full border-2 border-[#C62761]/30 border-t-[#C62761] animate-spin"
        ></div>
        <p class="text-white/40 text-sm">Chargement des évaluations…</p>
      </div>

      <!-- Sliding Container -->
      <div *ngIf="!loading" class="relative overflow-hidden">
        <div
          class="flex w-[200%] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)"
          [style.transform]="showEvalModal ? 'translateX(-50%)' : 'translateX(0)'"
        >
          <!-- ════════════ PANEL 1: HISTORIQUE DES ÉVALUATIONS ════════════ -->
          <div class="w-1/2 pr-0 sm:pr-2 space-y-8 flex-shrink-0">
            <!-- Stats Row -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                class="glass-card p-5 border border-[var(--bridge-border)] relative overflow-hidden group hover:border-[rgba(198,39,97,0.3)] transition-all hover:scale-[1.02]"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-br from-[rgba(198,39,97,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
                <p class="text-xs text-white/40 uppercase tracking-wider">Total</p>
                <p class="text-3xl font-mono font-bold text-white mt-2">{{ evaluations.length }}</p>
                <p class="text-xs text-white/30 mt-1">évaluations saisies</p>
              </div>
              <div
                class="glass-card p-5 border border-[var(--bridge-border)] relative overflow-hidden group hover:border-[rgba(245,166,35,0.3)] transition-all hover:scale-[1.02]"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-br from-[rgba(245,166,35,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
                <p class="text-xs text-white/40 uppercase tracking-wider">Moyenne</p>
                <p class="text-3xl font-mono font-bold text-[#F5A623] mt-2">{{ getAverage() }}</p>
                <p class="text-xs text-white/30 mt-1">note /20</p>
              </div>
              <div
                class="glass-card p-5 border border-[var(--bridge-border)] relative overflow-hidden group hover:border-emerald-500/30 transition-all hover:scale-[1.02]"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-br from-[#10B981]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
                <p class="text-xs text-white/40 uppercase tracking-wider">Réussite</p>
                <p class="text-3xl font-mono font-bold text-emerald-400 mt-2">
                  {{ getSuccessRate() }}%
                </p>
                <p class="text-xs text-white/30 mt-1">≥ 10/20</p>
              </div>
              <div
                class="glass-card p-5 border border-[var(--bridge-border)] relative overflow-hidden group hover:border-purple-500/30 transition-all hover:scale-[1.02]"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
                <p class="text-xs text-white/40 uppercase tracking-wider">Certifiés</p>
                <p class="text-3xl font-mono font-bold text-purple-400 mt-2">
                  {{ getCertifiedCount() }}
                </p>
                <p class="text-xs text-white/30 mt-1">≥ 14/20</p>
              </div>
            </div>

            <!-- Search + Filters -->
            <div class="flex flex-col sm:flex-row gap-3">
              <div class="relative flex-1">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm"
                  >🔍</span
                >
                <input
                  [(ngModel)]="searchQuery"
                  type="text"
                  placeholder="Rechercher par stagiaire, phase, formation ou compétence…"
                  class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors"
                />
              </div>
              <select
                [(ngModel)]="filterFormation"
                class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors"
              >
                <option value="" class="bg-[#10102A]">Toutes les formations</option>
                <option *ngFor="let f of uniqueFormations" [value]="f" class="bg-[#10102A]">
                  {{ f }}
                </option>
              </select>
              <select
                [(ngModel)]="sortBy"
                class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors"
              >
                <option value="date_desc" class="bg-[#10102A]">Plus récentes</option>
                <option value="date_asc" class="bg-[#10102A]">Plus anciennes</option>
                <option value="grade_desc" class="bg-[#10102A]">Meilleure note</option>
                <option value="grade_asc" class="bg-[#10102A]">Note la plus basse</option>
              </select>
            </div>

            <!-- Evaluations Table / Cards -->
            <div class="glass-card border border-[var(--bridge-border)] overflow-hidden">
              <div
                class="grid grid-cols-[2fr_1.5fr_1fr_1fr] gap-4 px-6 py-3 border-b border-white/5 bg-white/[0.02]"
              >
                <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold"
                  >Stagiaire</span
                >
                <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold"
                  >Formation / Phase</span
                >
                <span
                  class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-center"
                  >Note</span
                >
                <span
                  class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-right"
                  >Date</span
                >
              </div>

              <div *ngIf="paginatedEvaluations.length > 0" class="divide-y divide-white/[0.03]">
                <div
                  *ngFor="let ev of paginatedEvaluations; let i = index"
                  (click)="selectedEval = ev"
                  class="grid grid-cols-[2fr_1.5fr_1fr_1fr] gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors items-center cursor-pointer group"
                  [style.animation-delay]="i * 30 + 'ms'"
                  style="animation: fadeSlideIn 0.3s ease both"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div
                      class="w-9 h-9 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0"
                    >
                      <img
                        *ngIf="ev.studentAvatar"
                        [src]="ev.studentAvatar"
                        class="w-full h-full object-cover"
                      />
                      <span *ngIf="!ev.studentAvatar"
                        >{{ (ev.studentFirstName || 'S')[0]
                        }}{{ (ev.studentLastName || '')[0] }}</span
                      >
                    </div>
                    <div class="min-w-0">
                      <p
                        class="text-sm font-semibold text-white group-hover:text-[#F5A623] transition-colors truncate"
                      >
                        {{ ev.studentFirstName }} {{ ev.studentLastName }}
                      </p>
                      <p class="text-[11px] text-white/40 truncate">
                        {{ ev.skills || 'Aucune compétence spécifiée' }}
                      </p>
                    </div>
                  </div>

                  <div class="min-w-0">
                    <p class="text-xs text-white/70 font-medium truncate">
                      {{ ev.phaseTitle || 'Phase' }}
                    </p>
                    <p class="text-[10px] text-white/30 truncate">{{ ev.formationTitle }}</p>
                  </div>

                  <div class="flex justify-center">
                    <span
                      class="text-xs font-mono font-bold px-3 py-1 rounded-xl"
                      [class]="getGradeBadgeClass(ev.grade)"
                    >
                      {{ ev.grade }}/20
                    </span>
                  </div>

                  <div class="text-right">
                    <p class="text-xs font-mono text-white/50">
                      {{ ev.evaluationDate | date: 'dd/MM/yyyy' }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                *ngIf="paginatedEvaluations.length === 0"
                class="text-center py-16 text-white/30"
              >
                <span class="text-4xl mb-3 block">📝</span>
                <p class="text-sm font-medium text-white/40">Aucune évaluation trouvée</p>
              </div>
            </div>
          </div>

          <!-- ════════════ PANEL 2: REDIRECTION VERS SAISIE ════════════ -->
          <div class="w-1/2 pl-0 sm:pl-2 flex-shrink-0">
            <div class="glass-card border border-[var(--bridge-border)] overflow-hidden shadow-2xl">
              <div class="h-1.5 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623]"></div>
              <div
                class="flex items-center justify-between p-6 border-b border-[var(--bridge-border)] bg-white/[0.01]"
              >
                <div class="flex items-center gap-4">
                  <button
                    (click)="closeEvalModal()"
                    class="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                  >
                    ← Retour à l'historique
                  </button>
                  <div class="h-6 w-px bg-white/10 hidden sm:block"></div>
                  <div>
                    <h3 class="font-syne font-bold text-lg text-white">⭐ Saisir une Évaluation</h3>
                    <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                      Accédez au module de notation des stagiaires.
                    </p>
                  </div>
                </div>
              </div>
              <div class="p-8 text-center space-y-6">
                <div
                  class="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[rgba(198,39,97,0.3)] flex items-center justify-center text-4xl mx-auto"
                >
                  👥
                </div>
                <div>
                  <h4 class="text-white font-syne font-bold text-xl mb-2">
                    Module d'évaluation apprenants
                  </h4>
                  <p
                    class="text-[var(--bridge-text-muted)] text-sm max-w-md mx-auto leading-relaxed"
                  >
                    Afin d'évaluer un stagiaire avec sa note, ses étoiles et compétences, accédez
                    directement au tableau <strong class="text-white">Mes Stagiaires</strong>.
                  </p>
                </div>
                <div class="flex items-center justify-center gap-4 pt-4">
                  <button
                    (click)="closeEvalModal()"
                    class="py-3 px-6 bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-sm rounded-xl border border-white/10 transition-all"
                  >
                    ← Revenir à l'historique
                  </button>
                  <button
                    (click)="closeEvalModal(); router.navigate(['/dashboard/formateur/stagiaires'])"
                    class="px-8 py-3.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl text-sm hover:opacity-90 hover:scale-105 transition-all inline-flex items-center gap-2 shadow-[0_0_20px_rgba(198,39,97,0.3)]"
                  >
                    👥 Accéder aux Stagiaires →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style>
      @keyframes fadeSlideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fadein {
        animation: fadeSlideIn 0.4s ease both;
      }
    </style>
  `,
})
export class EvaluationHistoryComponent implements OnInit, OnDestroy {
  user: User | null = null;
  evaluations: Evaluation[] = [];
  loading = true;
  searchQuery = '';
  filterFormation = '';
  sortBy = 'date_desc';
  selectedEval: Evaluation | null = null;
  showEvalModal = false;
  today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Pagination
  currentPage = 1;
  pageSize = 8;
  protected Math = Math;

  private sub = new Subscription();

  constructor(
    private authService: AuthService,
    private evaluationService: EvaluationService,
    public router: Router,
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
        error: () => {
          this.loading = false;
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  openEvalModal(): void {
    this.showEvalModal = true;
  }
  closeEvalModal(): void {
    this.showEvalModal = false;
  }

  get uniqueFormations(): string[] {
    const set = new Set(this.evaluations.map((e) => e.formationTitle).filter(Boolean) as string[]);
    return Array.from(set);
  }

  get filteredEvaluations(): Evaluation[] {
    let list = [...this.evaluations];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          `${e.studentFirstName} ${e.studentLastName}`.toLowerCase().includes(q) ||
          (e.phaseTitle || '').toLowerCase().includes(q) ||
          (e.formationTitle || '').toLowerCase().includes(q) ||
          (e.skills || '').toLowerCase().includes(q),
      );
    }
    if (this.filterFormation) {
      list = list.filter((e) => e.formationTitle === this.filterFormation);
    }
    switch (this.sortBy) {
      case 'date_desc':
        list.sort(
          (a, b) => new Date(b.evaluationDate!).getTime() - new Date(a.evaluationDate!).getTime(),
        );
        break;
      case 'date_asc':
        list.sort(
          (a, b) => new Date(a.evaluationDate!).getTime() - new Date(b.evaluationDate!).getTime(),
        );
        break;
      case 'grade_desc':
        list.sort((a, b) => (b.grade || 0) - (a.grade || 0));
        break;
      case 'grade_asc':
        list.sort((a, b) => (a.grade || 0) - (b.grade || 0));
        break;
    }
    return list;
  }

  get paginatedEvaluations(): Evaluation[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredEvaluations.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEvaluations.length / this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getAverage(): string {
    if (this.evaluations.length === 0) return '—';
    const avg =
      this.evaluations.reduce((sum, e) => sum + (e.grade || 0), 0) / this.evaluations.length;
    return avg.toFixed(1);
  }

  getCertifiedCount(): number {
    return this.evaluations.filter((e) => (e.grade || 0) >= 14).length;
  }

  getSuccessRate(): number {
    if (this.evaluations.length === 0) return 0;
    const count = this.evaluations.filter((e) => (e.grade || 0) >= 10).length;
    return Math.round((count / this.evaluations.length) * 100);
  }

  getGradeBadgeClass(grade: number | undefined): string {
    const g = grade || 0;
    if (g >= 16) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (g >= 14)
      return 'bg-[rgba(245,166,35,0.1)] text-[#F5A623] border border-[rgba(245,166,35,0.2)]';
    if (g >= 10) return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    return 'bg-red-500/10 text-red-400 border border-red-500/20';
  }
}
