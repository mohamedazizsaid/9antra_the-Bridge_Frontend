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
  styles: [
    `
      :host {
        display: block;
      }

      @keyframes fadeSlideIn {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fadein {
        animation: fadeSlideIn 0.35s ease both;
      }

      @keyframes expandSlideDown {
        0% {
          opacity: 0;
          transform: translateY(-8px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .expand-slide-down {
        animation: expandSlideDown 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .bg-selected {
        background-color: rgba(255, 255, 255, 0.05) !important;
      }

      :host-context([data-theme='light']) .glass-card {
        background-color: #ffffff !important;
        border-color: #e2d9c8 !important;
        color: #1d2433 !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
      }

      :host-context([data-theme='light']) .detail-panel-bg {
        background: linear-gradient(180deg, #faf7f2 0%, #ffffff 100%) !important;
        border-color: #e2d9c8 !important;
        color: #1d2433 !important;
      }

      :host-context([data-theme='light']) .card-sub-bg {
        background-color: #ffffff !important;
        border-color: #e2d9c8 !important;
        color: #1d2433 !important;
      }

      :host-context([data-theme='light']) .input-themed {
        background-color: #ffffff !important;
        border-color: #d1c7b7 !important;
        color: #1d2433 !important;
      }

      :host-context([data-theme='light']) .input-themed::placeholder {
        color: #8a94a6 !important;
      }

      :host-context([data-theme='light']) .table-header-bg {
        background-color: #f7f3eb !important;
        border-bottom-color: #e2d9c8 !important;
        color: #5f6878 !important;
      }

      :host-context([data-theme='light']) .table-row-hover:hover {
        background-color: #faf7f2 !important;
      }
    `,
  ],
  template: `
    <div class="space-y-6 animate-fadein pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            class="font-syne font-bold text-2xl md:text-3xl text-[var(--bridge-text)] flex items-center gap-3"
          >
            <span
              class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center text-white shadow-md"
            >
              <svg
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </span>
            <span
              >Historique des
              <span
                class="bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text text-transparent"
                >Évaluations</span
              ></span
            >
          </h1>
          <p class="text-[var(--bridge-text-muted)] text-xs md:text-sm mt-1">
            Retrouvez et analysez toutes les évaluations enregistrées pour vos apprenants et
            stagiaires.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="router.navigate(['/dashboard/formateur/stagiaires'])"
            class="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl text-xs md:text-sm hover:opacity-95 hover:scale-[1.02] transition-all shadow-md cursor-pointer"
          >
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              />
            </svg>
            <span>Nouvelle évaluation</span>
          </button>
          <div
            class="text-xs text-[var(--bridge-text-muted)] font-mono bg-[var(--bridge-card)] border border-[var(--bridge-border)] px-3.5 py-2 rounded-xl shadow-sm hidden sm:block"
          >
            {{ today }}
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
        <div
          class="w-10 h-10 rounded-full border-2 border-[#C62761]/30 border-t-[#C62761] animate-spin"
        ></div>
        <p class="text-[var(--bridge-text-muted)] text-xs">Chargement des évaluations…</p>
      </div>

      <!-- Content -->
      <div *ngIf="!loading" class="space-y-6">
        <!-- KPI Stats Row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            class="glass-card p-5 border border-[var(--bridge-border)] rounded-2xl bg-[var(--bridge-card)] relative overflow-hidden group hover:border-[rgba(198,39,97,0.3)] transition-all shadow-sm"
          >
            <div class="flex items-center justify-between mb-2">
              <p
                class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
              >
                Total
              </p>
              <div
                class="w-8 h-8 rounded-xl bg-[#C62761]/10 flex items-center justify-center text-[#C62761]"
              >
                <svg
                  class="w-4 h-4"
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
            <p class="text-3xl font-mono font-bold text-[var(--bridge-text)] mt-2">
              {{ evaluations.length }}
            </p>
            <p class="text-[10px] text-[var(--bridge-text-muted)] mt-1">Évaluations saisies</p>
          </div>

          <div
            class="glass-card p-5 border border-[var(--bridge-border)] rounded-2xl bg-[var(--bridge-card)] relative overflow-hidden group hover:border-[rgba(245,166,35,0.3)] transition-all shadow-sm"
          >
            <div class="flex items-center justify-between mb-2">
              <p
                class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
              >
                Moyenne
              </p>
              <div
                class="w-8 h-8 rounded-xl bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623]"
              >
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
            </div>
            <p class="text-3xl font-mono font-bold text-[#F5A623] mt-2">{{ avgGradeFormatted }}</p>
            <p class="text-[10px] text-[var(--bridge-text-muted)] mt-1">Note moyenne /20</p>
          </div>

          <div
            class="glass-card p-5 border border-[var(--bridge-border)] rounded-2xl bg-[var(--bridge-card)] relative overflow-hidden group hover:border-emerald-500/30 transition-all shadow-sm"
          >
            <div class="flex items-center justify-between mb-2">
              <p
                class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
              >
                Réussite
              </p>
              <div
                class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"
              >
                <svg
                  class="w-4 h-4"
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
            <p class="text-3xl font-mono font-bold text-emerald-500 mt-2">{{ successRate }}%</p>
            <p class="text-[10px] text-[var(--bridge-text-muted)] mt-1">Notes ≥ 10/20</p>
          </div>

          <div
            class="glass-card p-5 border border-[var(--bridge-border)] rounded-2xl bg-[var(--bridge-card)] relative overflow-hidden group hover:border-purple-500/30 transition-all shadow-sm"
          >
            <div class="flex items-center justify-between mb-2">
              <p
                class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
              >
                Certifiés
              </p>
              <div
                class="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400"
              >
                <svg
                  class="w-4 h-4"
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
            <p class="text-3xl font-mono font-bold text-purple-400 mt-2">{{ certifiedCount }}</p>
            <p class="text-[10px] text-[var(--bridge-text-muted)] mt-1">Excellence ≥ 14/20</p>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid md:grid-cols-2 gap-6" *ngIf="evaluations.length > 0">
          <!-- Distribution des notes -->
          <div
            class="glass-card border border-[var(--bridge-border)] p-5 rounded-2xl bg-[var(--bridge-card)] shadow-sm"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-syne font-bold text-sm text-[var(--bridge-text)]">
                  Distribution des notes
                </h3>
                <p class="text-[10px] text-[var(--bridge-text-muted)] mt-0.5">
                  Répartition par tranche
                </p>
              </div>
              <div
                class="w-8 h-8 rounded-xl bg-[#C62761]/10 flex items-center justify-center text-[#C62761]"
              >
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
            </div>
            <div class="relative h-48 w-full flex items-center justify-center">
              <canvas #gradeDistChart></canvas>
            </div>
            <div class="flex flex-wrap gap-3 mt-3 justify-center">
              <span *ngFor="let b of gradeBands" class="flex items-center gap-1.5 text-[11px]">
                <span
                  class="w-2.5 h-2.5 rounded-full inline-block"
                  [style.background]="b.color"
                ></span>
                <span class="text-[var(--bridge-text-muted)]">{{ b.label }}</span>
              </span>
            </div>
          </div>

          <!-- Évolution temporelle -->
          <div
            class="glass-card border border-[var(--bridge-border)] p-5 rounded-2xl bg-[var(--bridge-card)] shadow-sm"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-syne font-bold text-sm text-[var(--bridge-text)]">
                  Évolution des notes
                </h3>
                <p class="text-[10px] text-[var(--bridge-text-muted)] mt-0.5">
                  Tendance chronologique
                </p>
              </div>
              <div
                class="w-8 h-8 rounded-xl bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623]"
              >
                <svg
                  class="w-4 h-4"
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
          <div
            class="glass-card border border-[var(--bridge-border)] p-5 rounded-2xl bg-[var(--bridge-card)] shadow-sm"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-syne font-bold text-sm text-[var(--bridge-text)]">
                  Notes par formation
                </h3>
                <p class="text-[10px] text-[var(--bridge-text-muted)] mt-0.5">Moyenne par cours</p>
              </div>
              <div
                class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"
              >
                <svg
                  class="w-4 h-4"
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
          <div
            class="glass-card border border-[var(--bridge-border)] p-5 rounded-2xl bg-[var(--bridge-card)] shadow-sm"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-syne font-bold text-sm text-[var(--bridge-text)]">
                  Top Stagiaires
                </h3>
                <p class="text-[10px] text-[var(--bridge-text-muted)] mt-0.5">
                  Meilleures moyennes
                </p>
              </div>
              <div
                class="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400"
              >
                <svg
                  class="w-4 h-4"
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
              <div *ngFor="let s of topStudentsList; let i = index" class="flex items-center gap-3">
                <span
                  class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 font-mono"
                  [class]="
                    i === 0
                      ? 'bg-[#F5A623]/20 text-[#F5A623]'
                      : i === 1
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-white/10 text-[var(--bridge-text-muted)]'
                  "
                >
                  {{ i + 1 }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-[var(--bridge-text)] truncate">
                    {{ s.name }}
                  </p>
                  <div
                    class="h-1.5 w-full bg-white/5 rounded-full mt-1 overflow-hidden border border-[var(--bridge-border)]"
                  >
                    <div
                      class="h-full rounded-full transition-all duration-700"
                      [style.width]="(s.avg / 20) * 100 + '%'"
                      [style.background]="
                        i === 0 ? 'linear-gradient(90deg,#C62761,#F5A623)' : 'var(--bridge-gold)'
                      "
                    ></div>
                  </div>
                </div>
                <span
                  class="text-xs font-mono font-bold flex-shrink-0"
                  [class]="getGradeColorClass(s.avg)"
                >
                  {{ s.avg.toFixed(1) }}/20
                </span>
              </div>
              <div
                *ngIf="topStudentsList.length === 0"
                class="text-center text-[var(--bridge-text-muted)] text-xs py-4"
              >
                Aucune donnée
              </div>
            </div>
          </div>
        </div>

        <!-- Search + Filters -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <span
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--bridge-text-muted)]"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              [(ngModel)]="searchQuery"
              (ngModelChange)="applyFilters()"
              type="text"
              placeholder="Rechercher par stagiaire, phase, formation ou compétence…"
              class="input-themed w-full bg-[var(--bridge-card)] border border-[var(--bridge-border)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[#C62761] transition-colors"
            />
          </div>
          <select
            [(ngModel)]="filterFormation"
            (ngModelChange)="applyFilters()"
            class="input-themed bg-[var(--bridge-card)] border border-[var(--bridge-border)] rounded-xl px-4 py-2.5 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[#C62761] transition-colors cursor-pointer"
          >
            <option value="">Toutes les formations</option>
            <option *ngFor="let f of uniqueFormationsList" [value]="f">
              {{ f }}
            </option>
          </select>
          <select
            [(ngModel)]="sortBy"
            (ngModelChange)="applyFilters()"
            class="input-themed bg-[var(--bridge-card)] border border-[var(--bridge-border)] rounded-xl px-4 py-2.5 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[#C62761] transition-colors cursor-pointer"
          >
            <option value="date_desc">Plus récentes</option>
            <option value="date_asc">Plus anciennes</option>
            <option value="grade_desc">Meilleure note</option>
            <option value="grade_asc">Note la plus basse</option>
          </select>
        </div>

        <!-- Evaluations Table (with IN-LINE Expandable Pro Details - NO MODAL) -->
        <div
          class="glass-card border border-[var(--bridge-border)] rounded-2xl bg-[var(--bridge-card)] overflow-hidden shadow-sm"
        >
          <div
            class="table-header-bg grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-3.5 border-b border-[var(--bridge-border)] bg-white/[0.02]"
          >
            <span
              class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold"
              >Stagiaire</span
            >
            <span
              class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold"
              >Formation / Phase</span
            >
            <span
              class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold text-center"
              >Note</span
            >
            <span
              class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold text-right"
              >Date</span
            >
            <span class="w-5"></span>
          </div>

          <div
            *ngIf="paginatedEvaluations.length > 0"
            class="divide-y divide-[var(--bridge-border)]"
          >
            <ng-container *ngFor="let ev of paginatedEvaluations">
              <div
                (click)="toggleSelectedEval(ev)"
                class="table-row-hover grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-all items-center cursor-pointer group"
                [class.bg-selected]="selectedEval?.id === ev.id"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="w-8 h-8 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0 shadow-sm"
                  >
                    <img
                      *ngIf="ev.studentAvatar"
                      [src]="ev.studentAvatar"
                      class="w-full h-full object-cover"
                      alt=""
                    />
                    <span *ngIf="!ev.studentAvatar"
                      >{{ (ev.studentFirstName || 'S')[0]
                      }}{{ (ev.studentLastName || '')[0] }}</span
                    >
                  </div>
                  <div class="min-w-0">
                    <p
                      class="text-xs font-semibold text-[var(--bridge-text)] group-hover:text-[#F5A623] transition-colors truncate"
                    >
                      {{ ev.studentFirstName }} {{ ev.studentLastName }}
                    </p>
                    <p class="text-[10px] text-[var(--bridge-text-muted)] truncate">
                      {{ ev.skills || 'Général' }}
                    </p>
                  </div>
                </div>

                <div class="min-w-0">
                  <p class="text-xs text-[var(--bridge-text)] font-medium truncate">
                    {{ ev.phaseTitle || "Phase d'évaluation" }}
                  </p>
                  <p class="text-[10px] text-[var(--bridge-text-muted)] truncate">
                    {{ ev.formationTitle }}
                  </p>
                </div>

                <div class="flex justify-center">
                  <span
                    class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg"
                    [class]="getGradeBadgeClass(ev.grade)"
                  >
                    {{ ev.grade }}/20
                  </span>
                </div>

                <div class="text-right">
                  <p class="text-xs font-mono text-[var(--bridge-text-muted)]">
                    {{ ev.evaluationDate | date: 'dd/MM/yyyy' }}
                  </p>
                </div>

                <!-- Chevron Indicator -->
                <div class="flex items-center justify-end">
                  <div
                    class="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[var(--bridge-text-muted)] group-hover:text-[var(--bridge-text)] transition-transform duration-300"
                    [class.rotate-180]="selectedEval?.id === ev.id"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- ═══════════════════════════════════════════════════════════════ -->
              <!-- IN-LINE EXPANDABLE DETAILS (NO MODAL) — PROFESSIONAL UX/UI      -->
              <!-- ═══════════════════════════════════════════════════════════════ -->
              <div
                *ngIf="selectedEval?.id === ev.id"
                class="detail-panel-bg expand-slide-down border-t border-b border-[var(--bridge-border)] p-6 md:p-8 bg-[#0D0D24] shadow-inner space-y-6"
              >
                <!-- Top Header Row inside expanded card -->
                <div
                  class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--bridge-border)]"
                >
                  <div class="flex items-center gap-4">
                    <div
                      class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden flex-shrink-0"
                    >
                      <img
                        *ngIf="ev.studentAvatar"
                        [src]="ev.studentAvatar"
                        class="w-full h-full object-cover"
                        alt=""
                      />
                      <span *ngIf="!ev.studentAvatar"
                        >{{ (ev.studentFirstName || 'S')[0]
                        }}{{ (ev.studentLastName || '')[0] }}</span
                      >
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h3
                          class="font-syne font-bold text-base md:text-lg text-[var(--bridge-text)]"
                        >
                          {{ ev.studentFirstName }} {{ ev.studentLastName }}
                        </h3>
                        <span
                          class="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        >
                          Apprenant
                        </span>
                      </div>
                      <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                        {{ ev.formationTitle }}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    (click)="selectedEval = null"
                    class="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] transition-all cursor-pointer border border-[var(--bridge-border)] flex items-center gap-1.5"
                  >
                    <span>Masquer les détails</span>
                    <svg
                      class="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                </div>

                <!-- Score Hero & Star Rating -->
                <div
                  class="card-sub-bg p-5 rounded-2xl bg-white/[0.02] border border-[var(--bridge-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div class="space-y-1">
                    <span
                      class="text-[10px] uppercase tracking-wider font-semibold text-[var(--bridge-text-muted)]"
                    >
                      Résultat de l'Évaluation
                    </span>
                    <div class="flex items-center gap-3">
                      <span
                        class="text-3xl font-mono font-bold"
                        [class]="getGradeColorClass(ev.grade)"
                      >
                        {{ ev.grade.toFixed(1) }}/20
                      </span>
                      <span
                        class="px-2.5 py-1 rounded-xl text-xs font-bold"
                        [class]="getGradeBadgeClass(ev.grade)"
                      >
                        {{ getGradeLabel(ev.grade) }}
                      </span>
                    </div>
                  </div>

                  <div class="sm:text-right">
                    <span
                      class="text-[10px] uppercase tracking-wider font-semibold text-[var(--bridge-text-muted)] block mb-1"
                    >
                      Appréciation globale
                    </span>
                    <div class="flex items-center gap-0.5 sm:justify-end">
                      <span
                        *ngFor="let s of [1, 2, 3, 4, 5]"
                        class="text-xl leading-none"
                        [class]="
                          getStarRating(ev.grade) >= s
                            ? 'text-[#F5A623]'
                            : 'text-gray-400 opacity-25'
                        "
                      >
                        ★
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 4 Context Detail Cards Grid -->
                <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div
                    class="card-sub-bg p-4 rounded-xl bg-white/[0.02] border border-[var(--bridge-border)] space-y-1"
                  >
                    <span
                      class="text-[10px] uppercase tracking-wider font-semibold text-[var(--bridge-text-muted)] flex items-center gap-1.5"
                    >
                      <svg
                        class="w-3.5 h-3.5 text-[#C62761]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                      <span>Formation</span>
                    </span>
                    <p class="text-xs font-semibold text-[var(--bridge-text)] leading-snug">
                      {{ ev.formationTitle }}
                    </p>
                  </div>

                  <div
                    class="card-sub-bg p-4 rounded-xl bg-white/[0.02] border border-[var(--bridge-border)] space-y-1"
                  >
                    <span
                      class="text-[10px] uppercase tracking-wider font-semibold text-[var(--bridge-text-muted)] flex items-center gap-1.5"
                    >
                      <svg
                        class="w-3.5 h-3.5 text-[#F5A623]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <polygon points="12 2 2 7 12 12 22 7 12 2" />
                        <polyline points="2 17 12 22 22 17" />
                        <polyline points="2 12 12 17 22 12" />
                      </svg>
                      <span>Étape / Phase</span>
                    </span>
                    <p class="text-xs font-semibold text-[var(--bridge-text)] leading-snug">
                      {{ ev.phaseTitle || 'Phase générale' }}
                    </p>
                  </div>

                  <div
                    class="card-sub-bg p-4 rounded-xl bg-white/[0.02] border border-[var(--bridge-border)] space-y-1"
                  >
                    <span
                      class="text-[10px] uppercase tracking-wider font-semibold text-[var(--bridge-text-muted)] flex items-center gap-1.5"
                    >
                      <svg
                        class="w-3.5 h-3.5 text-blue-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>Date d'évaluation</span>
                    </span>
                    <p class="text-xs font-mono font-semibold text-[var(--bridge-text)]">
                      {{ ev.evaluationDate | date: 'EEEE d MMMM yyyy' }}
                    </p>
                  </div>

                  <div
                    class="card-sub-bg p-4 rounded-xl bg-white/[0.02] border border-[var(--bridge-border)] space-y-1"
                  >
                    <span
                      class="text-[10px] uppercase tracking-wider font-semibold text-[var(--bridge-text-muted)] flex items-center gap-1.5"
                    >
                      <svg
                        class="w-3.5 h-3.5 text-emerald-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>Formateur évaluateur</span>
                    </span>
                    <p class="text-xs font-semibold text-[var(--bridge-text)]">
                      {{ ev.trainerFirstName }} {{ ev.trainerLastName }}
                    </p>
                  </div>
                </div>

                <!-- Validated Skills Tag Cloud -->
                <div class="space-y-2">
                  <span
                    class="text-[10px] uppercase tracking-wider font-semibold text-[var(--bridge-text-muted)] flex items-center gap-1.5"
                  >
                    <svg
                      class="w-3.5 h-3.5 text-purple-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      />
                    </svg>
                    <span>Compétences clés validées</span>
                  </span>
                  <div class="flex flex-wrap gap-2">
                    <ng-container *ngIf="ev.skills; else noSkills">
                      <span
                        *ngFor="let skill of getSkillList(ev.skills)"
                        class="text-xs px-3 py-1 rounded-lg bg-white/5 border border-[var(--bridge-border)] text-[var(--bridge-text)] font-mono font-medium"
                      >
                        {{ skill }}
                      </span>
                    </ng-container>
                    <ng-template #noSkills>
                      <span class="text-xs text-[var(--bridge-text-muted)] italic"
                        >Compétences générales du programme</span
                      >
                    </ng-template>
                  </div>
                </div>

                <!-- Formateur Comments Box -->
                <div
                  class="card-sub-bg p-4 rounded-2xl bg-white/[0.02] border border-[var(--bridge-border)] space-y-2"
                >
                  <span
                    class="text-[10px] uppercase tracking-wider font-semibold text-[var(--bridge-text-muted)] flex items-center gap-1.5"
                  >
                    <svg
                      class="w-3.5 h-3.5 text-[#F5A623]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>Remarques pédagogiques & Recommandations</span>
                  </span>
                  <p class="text-xs text-[var(--bridge-text)] leading-relaxed italic">
                    «
                    {{
                      ev.comment ||
                        "L'apprenant a complété cette étape du programme avec sérieux et régularité."
                    }}
                    »
                  </p>
                </div>

                <!-- Blockchain Certification Banner (if >= 14) -->
                <div
                  *ngIf="ev.grade >= 14"
                  class="p-4 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/25 flex items-center gap-3.5"
                >
                  <div
                    class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0"
                  >
                    <svg
                      class="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-emerald-500">Certificat Blockchain Éligible</p>
                    <p class="text-[11px] text-[var(--bridge-text-muted)] mt-0.5">
                      La note attribuée atteint le seuil d'excellence (≥ 14/20), garantissant
                      l'émission du certificat infalsifiable sur Polygon.
                    </p>
                  </div>
                </div>
              </div>
            </ng-container>
          </div>

          <!-- Empty table state -->
          <div *ngIf="paginatedEvaluations.length === 0" class="p-12 text-center">
            <div
              class="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--bridge-text-muted)]"
            >
              <svg
                class="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-[var(--bridge-text)]">Aucune évaluation trouvée</p>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-1">
              Modifiez vos critères de recherche.
            </p>
          </div>

          <!-- Pagination footer -->
          <div
            *ngIf="totalPages > 1"
            class="flex items-center justify-between px-6 py-3 border-t border-[var(--bridge-border)] bg-white/[0.01]"
          >
            <p class="text-xs text-[var(--bridge-text-muted)] font-mono">
              Page {{ currentPage }} sur {{ totalPages }} ({{
                filteredEvaluations.length
              }}
              résultats)
            </p>
            <div class="flex items-center gap-1">
              <button
                type="button"
                (click)="goToPage(currentPage - 1)"
                [disabled]="currentPage === 1"
                class="w-7 h-7 rounded-lg border border-[var(--bridge-border)] flex items-center justify-center text-xs text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                ‹
              </button>
              <button
                *ngFor="let p of pageNumbers"
                type="button"
                (click)="goToPage(p)"
                class="w-7 h-7 rounded-lg text-xs font-mono transition-all cursor-pointer"
                [class]="
                  p === currentPage
                    ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold'
                    : 'border border-[var(--bridge-border)] text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)]'
                "
              >
                {{ p }}
              </button>
              <button
                type="button"
                (click)="goToPage(currentPage + 1)"
                [disabled]="currentPage === totalPages"
                class="w-7 h-7 rounded-lg border border-[var(--bridge-border)] flex items-center justify-center text-xs text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                ›
              </button>
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
  today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  currentPage = 1;
  pageSize = 8;
  protected Math = Math;

  gradeBands = [
    { label: '≥ 16 (Excellent)', color: '#10B981' },
    { label: '14-16 (Certifié)', color: '#F5A623' },
    { label: '10-14 (Réussi)', color: '#3B82F6' },
    { label: '< 10 (À renforcer)', color: '#EF4444' },
  ];

  private sub = new Subscription();

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

  toggleSelectedEval(ev: Evaluation): void {
    if (this.selectedEval?.id === ev.id) {
      this.selectedEval = null;
    } else {
      this.selectedEval = ev;
    }
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

  getGradeBadgeClass(grade: number | undefined): string {
    const g = grade || 0;
    if (g >= 16) return 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30';
    if (g >= 14) return 'bg-amber-500/15 text-amber-500 border border-amber-500/30';
    if (g >= 10) return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    return 'bg-rose-500/15 text-rose-500 border border-rose-500/30';
  }

  getGradeColorClass(grade: number): string {
    if (grade >= 16) return 'text-emerald-500 font-bold';
    if (grade >= 14) return 'text-[#F5A623] font-bold';
    if (grade >= 10) return 'text-blue-400 font-semibold';
    return 'text-rose-500 font-semibold';
  }

  getGradeLabel(grade: number): string {
    if (grade >= 16) return 'Excellence';
    if (grade >= 14) return 'Certifié';
    if (grade >= 10) return 'Réussi';
    return 'Non validé';
  }

  getStarRating(grade: number): number {
    if (grade >= 18) return 5;
    if (grade >= 15) return 4;
    if (grade >= 12) return 3;
    if (grade >= 10) return 2;
    return 1;
  }

  getSkillList(skills?: string): string[] {
    if (!skills) return [];
    return skills
      .split(/[,;•|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
}
