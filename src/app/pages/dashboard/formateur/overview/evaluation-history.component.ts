import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { EvaluationService, Evaluation } from '../../../../core/services/evaluation.service';
import { User } from '../../../../core/models/user.model';
import { Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-evaluation-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fadein pb-12">
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
          class="flex w-[200%] transition-transform duration-500"
          [style.transform]="showEvalModal ? 'translateX(-50%)' : 'translateX(0)'"
        >
          <!-- ════════════ PANEL 1: HISTORIQUE DES ÉVALUATIONS ════════════ -->
          <div class="w-1/2 pr-0 sm:pr-2 space-y-8 flex-shrink-0">
            <!-- KPI Stats Row -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                class="glass-card p-5 border border-[var(--bridge-border)] relative overflow-hidden group hover:border-[rgba(198,39,97,0.3)] transition-all hover:scale-[1.02]"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-br from-[rgba(198,39,97,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
                <div class="flex items-center justify-between mb-2">
                  <p class="text-xs text-white/40 uppercase tracking-wider">Total</p>
                  <div class="w-7 h-7 rounded-lg bg-[#C62761]/10 flex items-center justify-center">
                    <svg
                      class="w-3.5 h-3.5 text-[#C62761]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                      />
                      <rect x="8" y="2" width="8" height="4" rx="1" />
                    </svg>
                  </div>
                </div>
                <p class="text-3xl font-mono font-bold text-white mt-2">{{ evaluations.length }}</p>
                <p class="text-xs text-white/30 mt-1">évaluations saisies</p>
              </div>
              <div
                class="glass-card p-5 border border-[var(--bridge-border)] relative overflow-hidden group hover:border-[rgba(245,166,35,0.3)] transition-all hover:scale-[1.02]"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-br from-[rgba(245,166,35,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
                <div class="flex items-center justify-between mb-2">
                  <p class="text-xs text-white/40 uppercase tracking-wider">Moyenne</p>
                  <div class="w-7 h-7 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
                    <svg
                      class="w-3.5 h-3.5 text-[#F5A623]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <line x1="18" x2="18" y1="20" y2="10" />
                      <line x1="12" x2="12" y1="20" y2="4" />
                      <line x1="6" x2="6" y1="20" y2="14" />
                    </svg>
                  </div>
                </div>
                <p class="text-3xl font-mono font-bold text-[#F5A623] mt-2">
                  {{ avgGradeFormatted }}
                </p>
                <p class="text-xs text-white/30 mt-1">note /20</p>
              </div>
              <div
                class="glass-card p-5 border border-[var(--bridge-border)] relative overflow-hidden group hover:border-emerald-500/30 transition-all hover:scale-[1.02]"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-br from-[#10B981]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
                <div class="flex items-center justify-between mb-2">
                  <p class="text-xs text-white/40 uppercase tracking-wider">Réussite</p>
                  <div
                    class="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center"
                  >
                    <svg
                      class="w-3.5 h-3.5 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                </div>
                <p class="text-3xl font-mono font-bold text-emerald-400 mt-2">{{ successRate }}%</p>
                <p class="text-xs text-white/30 mt-1">≥ 10/20</p>
              </div>
              <div
                class="glass-card p-5 border border-[var(--bridge-border)] relative overflow-hidden group hover:border-purple-500/30 transition-all hover:scale-[1.02]"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
                <div class="flex items-center justify-between mb-2">
                  <p class="text-xs text-white/40 uppercase tracking-wider">Certifiés</p>
                  <div class="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <svg
                      class="w-3.5 h-3.5 text-purple-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                  </div>
                </div>
                <p class="text-3xl font-mono font-bold text-purple-400 mt-2">
                  {{ certifiedCount }}
                </p>
                <p class="text-xs text-white/30 mt-1">≥ 14/20</p>
              </div>
            </div>

            <!-- ─── Charts Row ─── -->
            <div class="grid md:grid-cols-2 gap-6" *ngIf="evaluations.length > 0">
              <!-- Distribution des notes -->
              <div class="glass-card border border-[var(--bridge-border)] p-5">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="font-syne font-bold text-sm text-white">Distribution des notes</h3>
                    <p class="text-[10px] text-white/40 mt-0.5">Répartition par tranche</p>
                  </div>
                  <div class="w-8 h-8 rounded-xl bg-[#C62761]/10 flex items-center justify-center">
                    <svg
                      class="w-4 h-4 text-[#C62761]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <line x1="18" x2="18" y1="20" y2="10" />
                      <line x1="12" x2="12" y1="20" y2="4" />
                      <line x1="6" x2="6" y1="20" y2="14" />
                    </svg>
                  </div>
                </div>
                <div class="relative h-48 w-full flex items-center justify-center">
                  <canvas #gradeDistChart></canvas>
                </div>
                <div class="flex flex-wrap gap-2 mt-3 justify-center">
                  <span *ngFor="let b of gradeBands" class="flex items-center gap-1 text-[10px]">
                    <span
                      class="w-2 h-2 rounded-full inline-block"
                      [style.background]="b.color"
                    ></span>
                    <span class="text-white/50">{{ b.label }}</span>
                  </span>
                </div>
              </div>

              <!-- Évolution temporelle -->
              <div class="glass-card border border-[var(--bridge-border)] p-5">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="font-syne font-bold text-sm text-white">Évolution des notes</h3>
                    <p class="text-[10px] text-white/40 mt-0.5">Tendance chronologique</p>
                  </div>
                  <div class="w-8 h-8 rounded-xl bg-[#F5A623]/10 flex items-center justify-center">
                    <svg
                      class="w-4 h-4 text-[#F5A623]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                </div>
                <div class="relative h-48 w-full">
                  <canvas #gradeEvolutionChart></canvas>
                </div>
              </div>

              <!-- Taux par formation -->
              <div class="glass-card border border-[var(--bridge-border)] p-5">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="font-syne font-bold text-sm text-white">Notes par formation</h3>
                    <p class="text-[10px] text-white/40 mt-0.5">Moyenne par formation</p>
                  </div>
                  <div
                    class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center"
                  >
                    <svg
                      class="w-4 h-4 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                </div>
                <div class="relative h-48 w-full">
                  <canvas #formationAvgChart></canvas>
                </div>
              </div>

              <!-- Top stagiaires -->
              <div class="glass-card border border-[var(--bridge-border)] p-5">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="font-syne font-bold text-sm text-white">Top Stagiaires</h3>
                    <p class="text-[10px] text-white/40 mt-0.5">Meilleures moyennes</p>
                  </div>
                  <div class="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <svg
                      class="w-4 h-4 text-purple-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      />
                    </svg>
                  </div>
                </div>
                <div class="space-y-2.5 mt-1">
                  <div
                    *ngFor="let s of topStudentsList; let i = index"
                    class="flex items-center gap-3"
                  >
                    <span
                      class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      [class]="
                        i === 0
                          ? 'bg-[#F5A623]/20 text-[#F5A623]'
                          : i === 1
                            ? 'bg-white/10 text-white/60'
                            : 'bg-white/5 text-white/40'
                      "
                      >{{ i + 1 }}</span
                    >
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-semibold text-white truncate">{{ s.name }}</p>
                      <div class="h-1.5 w-full bg-white/5 rounded-full mt-1 overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-700"
                          [style.width]="(s.avg / 20) * 100 + '%'"
                          [style.background]="
                            i === 0
                              ? 'linear-gradient(90deg,#C62761,#F5A623)'
                              : 'rgba(255,255,255,0.2)'
                          "
                        ></div>
                      </div>
                    </div>
                    <span
                      class="text-xs font-mono font-bold flex-shrink-0"
                      [class]="getGradeColorClass(s.avg)"
                      >{{ s.avg.toFixed(1) }}</span
                    >
                  </div>
                  <div
                    *ngIf="topStudentsList.length === 0"
                    class="text-center text-white/30 text-xs py-4"
                  >
                    Aucune donnée
                  </div>
                </div>
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
                  (ngModelChange)="applyFilters()"
                  type="text"
                  placeholder="Rechercher par stagiaire, phase, formation ou compétence…"
                  class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors"
                />
              </div>
              <select
                [(ngModel)]="filterFormation"
                (ngModelChange)="applyFilters()"
                class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors"
              >
                <option value="" class="bg-[#10102A]">Toutes les formations</option>
                <option *ngFor="let f of uniqueFormationsList" [value]="f" class="bg-[#10102A]">
                  {{ f }}
                </option>
              </select>
              <select
                [(ngModel)]="sortBy"
                (ngModelChange)="applyFilters()"
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

            <!-- Pagination -->
            <div *ngIf="totalPages > 1" class="flex items-center justify-between">
              <p class="text-xs text-white/40 font-mono">
                {{ (currentPage - 1) * pageSize + 1 }}–{{
                  Math.min(currentPage * pageSize, filteredEvaluations.length)
                }}
                sur {{ filteredEvaluations.length }}
              </p>
              <div class="flex items-center gap-1">
                <button
                  (click)="goToPage(currentPage - 1)"
                  [disabled]="currentPage === 1"
                  class="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ‹
                </button>
                <button
                  *ngFor="let p of pageNumbers"
                  (click)="goToPage(p)"
                  class="w-9 h-9 rounded-lg text-sm font-mono transition-all"
                  [class]="
                    p === currentPage
                      ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold'
                      : 'border border-white/10 text-white/50 hover:text-white'
                  "
                >
                  {{ p }}
                </button>
                <button
                  (click)="goToPage(currentPage + 1)"
                  [disabled]="currentPage === totalPages"
                  class="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ›
                </button>
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
                    directement au tableau
                    <strong class="text-white">Mes Stagiaires</strong>.
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
  `,
})
export class EvaluationHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gradeDistChart') gradeDistCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('gradeEvolutionChart') gradeEvolutionCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('formationAvgChart') formationAvgCanvas?: ElementRef<HTMLCanvasElement>;

  private chartDist?: Chart;
  private chartEvol?: Chart;
  private chartFormation?: Chart;

  user: User | null = null;
  evaluations: Evaluation[] = [];
  filteredEvaluations: Evaluation[] = [];
  paginatedEvaluations: Evaluation[] = [];
  topStudentsList: { name: string; avg: number }[] = [];
  uniqueFormationsList: string[] = [];

  avgGradeFormatted = '—';
  certifiedCount = 0;
  successRate = 0;

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

  currentPage = 1;
  pageSize = 8;
  protected Math = Math;

  private sub = new Subscription();

  gradeBands = [
    { label: '≥ 16', color: '#10B981' },
    { label: '14-16', color: '#F5A623' },
    { label: '10-14', color: '#3B82F6' },
    { label: '< 10', color: '#EF4444' },
  ];

  constructor(
    private authService: AuthService,
    private evaluationService: EvaluationService,
    public router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) return;
    this.loading = true;
    this.sub.add(
      this.evaluationService.getEvaluationsByTrainer(this.user.id).subscribe({
        next: (data) => {
          this.evaluations = data || [];
          this.computeStats();
          this.applyFilters();
          this.loading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.renderCharts(), 200);
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      }),
    );
  }

  ngAfterViewInit(): void {
    if (!this.loading && this.evaluations.length > 0) {
      setTimeout(() => this.renderCharts(), 200);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.destroyCharts();
  }

  private destroyCharts(): void {
    if (this.chartDist) {
      this.chartDist.destroy();
      this.chartDist = undefined;
    }
    if (this.chartEvol) {
      this.chartEvol.destroy();
      this.chartEvol = undefined;
    }
    if (this.chartFormation) {
      this.chartFormation.destroy();
      this.chartFormation = undefined;
    }
  }

  private computeStats(): void {
    if (this.evaluations.length === 0) {
      this.avgGradeFormatted = '—';
      this.certifiedCount = 0;
      this.successRate = 0;
      this.topStudentsList = [];
      this.uniqueFormationsList = [];
      return;
    }

    const avg =
      this.evaluations.reduce((sum, e) => sum + (e.grade || 0), 0) / this.evaluations.length;
    this.avgGradeFormatted = avg.toFixed(1);

    this.certifiedCount = this.evaluations.filter((e) => (e.grade || 0) >= 14).length;
    const countPassed = this.evaluations.filter((e) => (e.grade || 0) >= 10).length;
    this.successRate = Math.round((countPassed / this.evaluations.length) * 100);

    // Top students
    const map = new Map<string, { sum: number; count: number; name: string }>();
    this.evaluations.forEach((e) => {
      const key = e.studentId?.toString() || '';
      const name = `${e.studentFirstName || ''} ${e.studentLastName || ''}`.trim() || 'Stagiaire';
      const entry = map.get(key) || { sum: 0, count: 0, name };
      entry.sum += e.grade || 0;
      entry.count++;
      map.set(key, entry);
    });
    this.topStudentsList = Array.from(map.values())
      .map((v) => ({ name: v.name, avg: v.count > 0 ? v.sum / v.count : 0 }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);

    // Formations
    const set = new Set(this.evaluations.map((e) => e.formationTitle).filter(Boolean) as string[]);
    this.uniqueFormationsList = Array.from(set);
  }

  applyFilters(): void {
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
    this.filteredEvaluations = list;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedEvaluations = this.filteredEvaluations.slice(start, start + this.pageSize);
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
      this.updatePagination();
    }
  }

  private renderCharts(): void {
    if (this.evaluations.length === 0) return;
    this.renderGradeDistribution();
    this.renderGradeEvolution();
    this.renderFormationAvg();
  }

  private renderGradeDistribution(): void {
    if (!this.gradeDistCanvas?.nativeElement) return;
    if (this.chartDist) {
      this.chartDist.destroy();
      this.chartDist = undefined;
    }
    const ctx = this.gradeDistCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    const bands = [
      this.evaluations.filter((e) => (e.grade || 0) >= 16).length,
      this.evaluations.filter((e) => (e.grade || 0) >= 14 && (e.grade || 0) < 16).length,
      this.evaluations.filter((e) => (e.grade || 0) >= 10 && (e.grade || 0) < 14).length,
      this.evaluations.filter((e) => (e.grade || 0) < 10).length,
    ];
    this.chartDist = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['≥ 16 (Excellent)', '14-16 (Certifié)', '10-14 (Réussi)', '< 10 (Échec)'],
        datasets: [
          {
            data: bands,
            backgroundColor: ['#10B981', '#F5A623', '#3B82F6', '#EF4444'],
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        resizeDelay: 100,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => ` ${c.label}: ${c.parsed} éval${c.parsed > 1 ? 's' : ''}`,
            },
          },
        },
      },
    });
  }

  private renderGradeEvolution(): void {
    if (!this.gradeEvolutionCanvas?.nativeElement) return;
    if (this.chartEvol) {
      this.chartEvol.destroy();
      this.chartEvol = undefined;
    }
    const ctx = this.gradeEvolutionCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    const sorted = [...this.evaluations]
      .filter((e) => e.evaluationDate)
      .sort((a, b) => new Date(a.evaluationDate!).getTime() - new Date(b.evaluationDate!).getTime())
      .slice(-15);

    this.chartEvol = new Chart(ctx, {
      type: 'line',
      data: {
        labels: sorted.map((e) =>
          new Date(e.evaluationDate!).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
          }),
        ),
        datasets: [
          {
            label: 'Note',
            data: sorted.map((e) => e.grade || 0),
            borderColor: '#C62761',
            backgroundColor: 'rgba(198,39,97,0.12)',
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointBackgroundColor: '#F5A623',
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 100,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#6B7280', font: { size: 10 } },
          },
          y: {
            min: 0,
            max: 20,
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#6B7280', font: { size: 10 } },
          },
        },
      },
    });
  }

  private renderFormationAvg(): void {
    if (!this.formationAvgCanvas?.nativeElement) return;
    if (this.chartFormation) {
      this.chartFormation.destroy();
      this.chartFormation = undefined;
    }
    const ctx = this.formationAvgCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    const map = new Map<string, { sum: number; count: number }>();
    this.evaluations.forEach((e) => {
      const key = e.formationTitle || 'Sans formation';
      const entry = map.get(key) || { sum: 0, count: 0 };
      entry.sum += e.grade || 0;
      entry.count++;
      map.set(key, entry);
    });
    const labels = Array.from(map.keys()).map((k) =>
      k.length > 18 ? k.substring(0, 15) + '…' : k,
    );
    const data = Array.from(map.values()).map((v) => +(v.sum / v.count).toFixed(1));
    this.chartFormation = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Moyenne',
            data,
            backgroundColor: data.map((v) =>
              v >= 16
                ? 'rgba(16,185,129,0.7)'
                : v >= 14
                  ? 'rgba(245,166,35,0.7)'
                  : v >= 10
                    ? 'rgba(59,130,246,0.7)'
                    : 'rgba(239,68,68,0.7)',
            ),
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 100,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6B7280', font: { size: 10 } } },
          y: {
            min: 0,
            max: 20,
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#6B7280', font: { size: 10 } },
          },
        },
      },
    });
  }

  openEvalModal(): void {
    this.showEvalModal = true;
  }
  closeEvalModal(): void {
    this.showEvalModal = false;
  }

  getGradeBadgeClass(grade: number | undefined): string {
    const g = grade || 0;
    if (g >= 16) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (g >= 14)
      return 'bg-[rgba(245,166,35,0.1)] text-[#F5A623] border border-[rgba(245,166,35,0.2)]';
    if (g >= 10) return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    return 'bg-red-500/10 text-red-400 border border-red-500/20';
  }

  getGradeColorClass(grade: number): string {
    if (grade >= 16) return 'text-emerald-400';
    if (grade >= 14) return 'text-[#F5A623]';
    if (grade >= 10) return 'text-blue-400';
    return 'text-red-400';
  }
}
