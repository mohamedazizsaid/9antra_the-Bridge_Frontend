import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { FormationService } from '../../../../core/services/formation.service';
import { EvaluationService, Evaluation } from '../../../../core/services/evaluation.service';
import { UserService } from '../../../../core/services/user.service';
import { CertificatService } from '../../../../core/services/certificat.service';
import { OnboardingService } from '../../../../core/services/onboarding.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Certificat } from '../../../../core/models/certificat.model';
import { User } from '../../../../core/models/user.model';
import { Formation, Phase } from '../../../../core/models/formation.model';
import { StageInscription } from '../../../../core/models/stage-inscription.model';
import { Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface StagiaireCard {
  user: User;
  formations: { nom: string; id: string }[];
  avgGrade: number | null;
  evaluationCount: number;
  progression: number;
  certificats?: Certificat[];
}

@Component({
  selector: 'app-formateur-stagiaires',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      :host {
        display: block;
      }

      @keyframes drawerSlideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .drawer-slide-in {
        animation: drawerSlideIn 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
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

      .custom-scroll::-webkit-scrollbar {
        width: 5px;
      }
      .custom-scroll::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
      }
      .custom-scroll::-webkit-scrollbar-thumb {
        background: rgba(198, 39, 97, 0.3);
        border-radius: 4px;
      }

      :host-context([data-theme='light']) .glass-card {
        background-color: #ffffff !important;
        border-color: #e2d9c8 !important;
        color: #1d2433 !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
      }

      :host-context([data-theme='light']) .drawer-panel-bg {
        background: linear-gradient(180deg, #ffffff 0%, #faf7f2 100%) !important;
        border-left-color: #e2d9c8 !important;
        color: #1d2433 !important;
        box-shadow: -15px 0 40px rgba(0, 0, 0, 0.1) !important;
      }

      :host-context([data-theme='light']) .input-themed {
        background-color: #ffffff !important;
        border-color: #d1c7b7 !important;
        color: #1d2433 !important;
      }

      :host-context([data-theme='light']) .input-themed::placeholder {
        color: #8a94a6 !important;
      }

      :host-context([data-theme='light']) .card-sub-bg {
        background-color: #f9f6f0 !important;
        border-color: #e2d9c8 !important;
        color: #1d2433 !important;
      }

      :host-context([data-theme='light']) .text-theme-title {
        color: #1d2433 !important;
      }

      :host-context([data-theme='light']) .text-theme-muted {
        color: #5f6878 !important;
      }
    `,
  ],
  template: `
    <div class="space-y-6 animate-fadein pb-12">
      <!-- Top Header & Tabs -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <span
              >Espace
              <span
                class="bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text text-transparent"
                >Stagiaires</span
              ></span
            >
          </h1>
          <p class="text-[var(--bridge-text-muted)] text-xs md:text-sm mt-1">
            Suivi académique, gestion des conventions de stage facultatif et saisie des évaluations
          </p>
        </div>

        <!-- Action Button -->
        <div class="flex items-center gap-3">
          <button
            *ngIf="!showEvalForm"
            (click)="openEvalModal(null)"
            class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl text-xs md:text-sm hover:opacity-95 hover:scale-[1.02] transition-all shadow-[0_0_15px_rgba(198,39,97,0.3)] cursor-pointer"
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
            <span>Évaluer un stagiaire</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tab Switcher -->
      <div
        class="flex items-center p-1.5 bg-[var(--bridge-card)] border border-[var(--bridge-border)] rounded-2xl w-fit max-w-full overflow-x-auto shadow-sm"
      >
        <!-- Tab 1: Formations -->
        <button
          type="button"
          (click)="activeTab = 'FORMATIONS'; showEvalForm = false"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          [ngClass]="
            activeTab === 'FORMATIONS'
              ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-md'
              : 'text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] hover:bg-white/5'
          "
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
          <span>Stagiaires en Formations</span>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
            [ngClass]="
              activeTab === 'FORMATIONS'
                ? 'bg-black/20 text-white'
                : 'bg-white/10 text-[var(--bridge-text-muted)]'
            "
          >
            {{ stagiaireCards.length }}
          </span>
        </button>

        <!-- Tab 2: Stages Facultatifs -->
        <button
          type="button"
          (click)="activeTab = 'STAGES'; showEvalForm = false"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ml-1"
          [ngClass]="
            activeTab === 'STAGES'
              ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-md'
              : 'text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] hover:bg-white/5'
          "
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <span>Stages Facultatifs (Mon Encadrement)</span>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
            [ngClass]="
              activeTab === 'STAGES'
                ? 'bg-black/20 text-white'
                : 'bg-white/10 text-[var(--bridge-text-muted)]'
            "
          >
            {{ stageInscriptions.length }}
          </span>
        </button>
      </div>

      <!-- Main Layout with Smooth Horizontal Translation for Eval Form -->
      <div class="relative overflow-hidden">
        <div
          class="flex w-[200%] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)"
          [style.transform]="showEvalForm ? 'translateX(-50%)' : 'translateX(0)'"
        >
          <!-- ════════════════════════ PANEL 1: LISTE (FORMATIONS OU STAGES) ════════════════════════ -->
          <div class="w-1/2 pr-0 sm:pr-2 space-y-6 flex-shrink-0">
            <!-- ─── VUE 1 : STAGIAIRES EN FORMATION ─── -->
            <div *ngIf="activeTab === 'FORMATIONS'" class="space-y-6 animate-fadein">
              <!-- Stats Summary -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  class="glass-card p-5 border border-[var(--bridge-border)] rounded-2xl bg-[var(--bridge-card)] hover:border-[rgba(198,39,97,0.3)] transition-all"
                >
                  <p
                    class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                  >
                    Total Stagiaires
                  </p>
                  <p class="text-3xl font-mono font-bold text-[#C62761] mt-2">
                    {{ stagiaireCards.length }}
                  </p>
                  <p class="text-[10px] text-[var(--bridge-text-muted)] mt-1">
                    Inscrits dans vos cours
                  </p>
                </div>
                <div
                  class="glass-card p-5 border border-[var(--bridge-border)] rounded-2xl bg-[var(--bridge-card)] hover:border-[rgba(245,166,35,0.3)] transition-all"
                >
                  <p
                    class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                  >
                    Moyenne Globale
                  </p>
                  <p class="text-3xl font-mono font-bold text-[#F5A623] mt-2">
                    {{ getGlobalAvg() }}
                  </p>
                  <p class="text-[10px] text-[var(--bridge-text-muted)] mt-1">Note /20</p>
                </div>
                <div
                  class="glass-card p-5 border border-[var(--bridge-border)] rounded-2xl bg-[var(--bridge-card)] hover:border-emerald-500/30 transition-all"
                >
                  <p
                    class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                  >
                    Certifiés
                  </p>
                  <p class="text-3xl font-mono font-bold text-emerald-500 mt-2">
                    {{ getCertifiedCount() }}
                  </p>
                  <p class="text-[10px] text-[var(--bridge-text-muted)] mt-1">Moyenne ≥ 14/20</p>
                </div>
                <div
                  class="glass-card p-5 border border-[var(--bridge-border)] rounded-2xl bg-[var(--bridge-card)] hover:border-purple-500/30 transition-all"
                >
                  <p
                    class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                  >
                    Évaluations
                  </p>
                  <p class="text-3xl font-mono font-bold text-purple-400 mt-2">
                    {{ evaluations.length }}
                  </p>
                  <p class="text-[10px] text-[var(--bridge-text-muted)] mt-1">Saisies à ce jour</p>
                </div>
              </div>

              <!-- Search & Filters -->
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
                    type="text"
                    placeholder="Rechercher un stagiaire…"
                    class="input-themed w-full bg-[var(--bridge-card)] border border-[var(--bridge-border)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[#C62761] transition-colors"
                  />
                </div>
                <select
                  [(ngModel)]="filterFormation"
                  class="input-themed bg-[var(--bridge-card)] border border-[var(--bridge-border)] rounded-xl px-4 py-2.5 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[#C62761] transition-colors cursor-pointer"
                >
                  <option value="">Toutes les formations</option>
                  <option *ngFor="let f of formations" [value]="f.id">
                    {{ f.nom }}
                  </option>
                </select>
                <select
                  [(ngModel)]="sortBy"
                  class="input-themed bg-[var(--bridge-card)] border border-[var(--bridge-border)] rounded-xl px-4 py-2.5 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[#C62761] transition-colors cursor-pointer"
                >
                  <option value="name">Nom (A→Z)</option>
                  <option value="grade_desc">Meilleure note</option>
                  <option value="grade_asc">Note la plus basse</option>
                </select>
              </div>

              <!-- Loading -->
              <div
                *ngIf="loading"
                class="flex flex-col items-center justify-center py-20 space-y-4"
              >
                <div
                  class="w-10 h-10 rounded-full border-2 border-[#C62761]/30 border-t-[#C62761] animate-spin"
                ></div>
                <p class="text-[var(--bridge-text-muted)] text-xs">Chargement des stagiaires…</p>
              </div>

              <!-- Cards Grid with Fixed Bottom Alignments -->
              <div
                *ngIf="!loading"
                class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch"
              >
                <div
                  *ngFor="let card of paginatedCards; let i = index"
                  class="glass-card border border-[var(--bridge-border)] p-5 rounded-2xl bg-[var(--bridge-card)] hover:border-[rgba(198,39,97,0.3)] transition-all hover:scale-[1.01] cursor-pointer group relative overflow-hidden shadow-sm flex flex-col justify-between h-full"
                  (click)="openStudentDetail(card)"
                >
                  <!-- Top Content -->
                  <div class="flex-1 flex flex-col">
                    <!-- Top Row: Avatar + Name -->
                    <div class="flex items-center gap-3 mb-3">
                      <div
                        class="w-11 h-11 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0 shadow-sm"
                      >
                        <img
                          *ngIf="card.user.avatar"
                          [src]="card.user.avatar"
                          class="w-full h-full object-cover"
                          alt=""
                        />
                        <span *ngIf="!card.user.avatar">{{
                          (card.user.prenom ? card.user.prenom[0] : '') +
                            (card.user.nom ? card.user.nom[0] : '')
                        }}</span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <p
                          class="font-semibold text-[var(--bridge-text)] text-sm truncate group-hover:text-[#F5A623] transition-colors"
                        >
                          {{ card.user.prenom }} {{ card.user.nom }}
                        </p>
                        <p class="text-xs text-[var(--bridge-text-muted)] truncate">
                          {{ card.user.email }}
                        </p>
                      </div>
                    </div>

                    <!-- Formations Badges Container (Fixed Min Height for perfect row alignment) -->
                    <div class="flex flex-wrap gap-1 mb-4 min-h-[48px] content-start">
                      <span
                        *ngFor="let f of card.formations"
                        class="text-[9px] px-2 py-0.5 bg-white/5 rounded-md text-[var(--bridge-text-muted)] font-mono truncate max-w-[140px] border border-[var(--bridge-border)] h-fit"
                      >
                        {{ f.nom }}
                      </span>
                    </div>
                  </div>

                  <!-- Footer Stats - FIXED AT BOTTOM with mt-auto -->
                  <div
                    class="flex items-center justify-between pt-3 border-t border-[var(--bridge-border)] mt-auto flex-shrink-0"
                  >
                    <div>
                      <p
                        class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider"
                      >
                        Note moy.
                      </p>
                      <p
                        class="text-sm font-mono font-bold mt-0.5"
                        [class]="getGradeClass(card.avgGrade)"
                      >
                        {{ card.avgGrade !== null ? card.avgGrade.toFixed(1) + '/20' : 'Non noté' }}
                      </p>
                    </div>
                    <div class="text-center">
                      <p
                        class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider"
                      >
                        Évals
                      </p>
                      <p class="text-sm font-mono font-bold text-purple-400 mt-0.5">
                        {{ card.evaluationCount }}
                      </p>
                    </div>
                    <button
                      (click)="$event.stopPropagation(); openEvalModal(card)"
                      class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white transition-all hover:scale-105 flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <svg
                        class="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <polygon
                          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                        />
                      </svg>
                      <span>Évaluer</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Empty state Formations -->
              <div
                *ngIf="!loading && filteredCards.length === 0"
                class="glass-card border border-[var(--bridge-border)] p-12 text-center rounded-2xl bg-[var(--bridge-card)]"
              >
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
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <p class="font-semibold text-[var(--bridge-text)] text-sm">
                  Aucun stagiaire trouvé
                </p>
                <p class="text-[var(--bridge-text-muted)] text-xs mt-1">
                  Essayez de modifier vos critères de recherche.
                </p>
              </div>

              <!-- Pagination -->
              <div
                *ngIf="!loading && totalPages > 1"
                class="flex items-center justify-between pt-2"
              >
                <p class="text-xs text-[var(--bridge-text-muted)] font-mono">
                  {{ (currentPage - 1) * pageSize + 1 }}–{{
                    Math.min(currentPage * pageSize, filteredCards.length)
                  }}
                  sur {{ filteredCards.length }}
                </p>
                <div class="flex items-center gap-1">
                  <button
                    (click)="goToPage(currentPage - 1)"
                    [disabled]="currentPage === 1"
                    class="w-8 h-8 rounded-lg border border-[var(--bridge-border)] flex items-center justify-center text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    ‹
                  </button>
                  <button
                    *ngFor="let p of pageNumbers"
                    (click)="goToPage(p)"
                    class="w-8 h-8 rounded-lg text-xs font-mono transition-all cursor-pointer"
                    [class]="
                      p === currentPage
                        ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold'
                        : 'border border-[var(--bridge-border)] text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)]'
                    "
                  >
                    {{ p }}
                  </button>
                  <button
                    (click)="goToPage(currentPage + 1)"
                    [disabled]="currentPage === totalPages"
                    class="w-8 h-8 rounded-lg border border-[var(--bridge-border)] flex items-center justify-center text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            <!-- ─── VUE 2 : STAGIAIRES DE STAGE FACULTATIF (ENCADREMENT) ─── -->
            <div *ngIf="activeTab === 'STAGES'" class="space-y-6 animate-fadein">
              <!-- Stage Header Alert Banner -->
              <div
                class="glass-card p-5 border border-[var(--bridge-gold)]/30 rounded-2xl bg-[rgba(245,166,35,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-[var(--bridge-gold)]/20 text-[var(--bridge-gold)] flex items-center justify-center flex-shrink-0"
                  >
                    <svg
                      class="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-syne font-bold text-sm text-[var(--bridge-text)]">
                      Stagiaires sous votre encadrement pédagogique
                    </h3>
                    <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                      Vous avez été désigné par l'administration comme encadrant référent pour ces
                      conventions de stage facultatif.
                    </p>
                  </div>
                </div>
                <div
                  class="px-3 py-1 rounded-full bg-[var(--bridge-gold)]/20 border border-[var(--bridge-gold)]/30 text-[var(--bridge-gold)] font-mono font-bold text-xs self-start sm:self-auto"
                >
                  {{ stageInscriptions.length }} Stagiaire{{
                    stageInscriptions.length > 1 ? 's' : ''
                  }}
                </div>
              </div>

              <!-- Loading Stages -->
              <div
                *ngIf="loadingStages"
                class="flex flex-col items-center justify-center py-20 space-y-4"
              >
                <div
                  class="w-10 h-10 rounded-full border-2 border-[#F5A623]/30 border-t-[#F5A623] animate-spin"
                ></div>
                <p class="text-[var(--bridge-text-muted)] text-xs">
                  Chargement des stages sous encadrement…
                </p>
              </div>

              <!-- Stage Cards Grid with Fixed Bottom Button -->
              <div
                *ngIf="!loadingStages"
                class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch"
              >
                <div
                  *ngFor="let stage of stageInscriptions"
                  class="glass-card border border-[var(--bridge-border)] p-5 rounded-2xl bg-[var(--bridge-card)] hover:border-[var(--bridge-gold)]/40 transition-all shadow-sm flex flex-col justify-between h-full gap-4"
                >
                  <div class="flex-1 flex flex-col">
                    <!-- Top Student Info -->
                    <div class="flex items-center justify-between gap-3 mb-3">
                      <div class="flex items-center gap-3 min-w-0">
                        <div
                          class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0 shadow-sm"
                        >
                          <img
                            *ngIf="stage.studentAvatar"
                            [src]="stage.studentAvatar"
                            class="w-full h-full object-cover"
                            alt=""
                          />
                          <span *ngIf="!stage.studentAvatar">{{
                            (stage.studentFirstName?.[0] || '') + (stage.studentLastName?.[0] || '')
                          }}</span>
                        </div>
                        <div class="min-w-0">
                          <p class="font-bold text-[var(--bridge-text)] text-sm truncate">
                            {{ stage.studentFirstName }} {{ stage.studentLastName }}
                          </p>
                          <p class="text-[11px] text-[var(--bridge-text-muted)] truncate">
                            {{ stage.studentEmail }}
                          </p>
                        </div>
                      </div>

                      <span
                        class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider h-fit"
                        [ngClass]="getStageStatusClass(stage.status)"
                      >
                        {{ stage.status }}
                      </span>
                    </div>

                    <!-- Project Title & Details Box -->
                    <div
                      class="card-sub-bg p-3.5 rounded-xl border border-[var(--bridge-border)] bg-white/[0.02] space-y-2 flex-1"
                    >
                      <div class="flex items-center justify-between">
                        <span
                          class="text-[10px] uppercase tracking-wider font-semibold text-[var(--bridge-gold)]"
                          >Projet de Stage</span
                        >
                        <span
                          *ngIf="stage.studentCin"
                          class="text-[10px] font-mono text-[var(--bridge-text-muted)]"
                          >CIN: {{ stage.studentCin }}</span
                        >
                      </div>
                      <p class="text-xs font-bold text-[var(--bridge-text)] leading-snug">
                        {{ stage.stageProjectTitle || 'Projet de stage facultatif' }}
                      </p>
                      <div
                        class="flex items-center gap-2 text-[11px] text-[var(--bridge-text-muted)]"
                      >
                        <svg
                          class="w-3.5 h-3.5 text-[#F5A623]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span
                          >Durée :
                          <strong>{{ stage.stageDurationWeeks || 12 }} semaines</strong></span
                        >
                      </div>
                    </div>

                    <!-- Documents Provided -->
                    <div
                      class="flex items-center gap-2 mt-3"
                      *ngIf="stage.demandeStageUrl || stage.lettreAffectationUrl"
                    >
                      <a
                        *ngIf="stage.demandeStageUrl"
                        [href]="stage.demandeStageUrl"
                        target="_blank"
                        class="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 border border-[var(--bridge-border)] rounded-lg text-[10px] font-bold text-[var(--bridge-text)] flex items-center justify-center gap-1 transition-colors"
                      >
                        <svg
                          class="w-3 h-3 text-[#C62761]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span>Demande PDF</span>
                      </a>
                      <a
                        *ngIf="stage.lettreAffectationUrl"
                        [href]="stage.lettreAffectationUrl"
                        target="_blank"
                        class="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 border border-[var(--bridge-border)] rounded-lg text-[10px] font-bold text-[var(--bridge-text)] flex items-center justify-center gap-1 transition-colors"
                      >
                        <svg
                          class="w-3 h-3 text-[#F5A623]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span>Convention PDF</span>
                      </a>
                    </div>
                  </div>

                  <!-- Evaluate Stage Intern Action Button - FIXED AT BOTTOM -->
                  <button
                    type="button"
                    (click)="openEvalForStage(stage)"
                    class="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 hover:scale-[1.01] transition-all shadow-md cursor-pointer mt-auto flex-shrink-0"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      />
                    </svg>
                    <span>Évaluer ce stagiaire de stage</span>
                  </button>
                </div>
              </div>

              <!-- Empty state Stages -->
              <div
                *ngIf="!loadingStages && stageInscriptions.length === 0"
                class="glass-card border border-[var(--bridge-border)] p-12 text-center rounded-2xl bg-[var(--bridge-card)]"
              >
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
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <p class="font-semibold text-[var(--bridge-text)] text-sm">
                  Aucun stagiaire de stage assigné
                </p>
                <p class="text-[var(--bridge-text-muted)] text-xs mt-1">
                  L'administration vous assignera comme encadrant lors de la validation des demandes
                  de stage.
                </p>
              </div>
            </div>
          </div>

          <!-- ════════════════════════ PANEL 2: FORMULAIRE D'ÉVALUATION ════════════════════════ -->
          <div class="w-1/2 pl-0 sm:pl-2 flex-shrink-0">
            <div
              class="glass-card border border-[var(--bridge-border)] rounded-2xl bg-[var(--bridge-card)] overflow-hidden shadow-2xl"
            >
              <div class="h-1.5 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623]"></div>

              <!-- Header Formulaire -->
              <div
                class="flex items-center justify-between p-6 border-b border-[var(--bridge-border)] card-sub-bg bg-white/[0.01]"
              >
                <div class="flex items-center gap-4">
                  <button
                    type="button"
                    (click)="closeEvalModal()"
                    class="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-[var(--bridge-border)] rounded-xl text-xs font-bold text-[var(--bridge-text)] transition-all cursor-pointer"
                  >
                    <svg
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    <span>Retour à la liste</span>
                  </button>
                  <div class="h-6 w-px bg-[var(--bridge-border)] hidden sm:block"></div>
                  <div>
                    <h3
                      class="font-syne font-bold text-base md:text-lg text-[var(--bridge-text)] flex items-center gap-2"
                    >
                      <svg
                        class="w-4 h-4 text-[#F5A623]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <polygon
                          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                        />
                      </svg>
                      <span>Saisie d'une Évaluation</span>
                    </h3>
                    <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                      Attribuez une note (/20), appréciation et compétences clés
                    </p>
                  </div>
                </div>
              </div>

              <!-- Form Body -->
              <div class="p-6 md:p-8 space-y-6">
                <div class="grid md:grid-cols-2 gap-6">
                  <!-- Section Sélections -->
                  <div class="space-y-4">
                    <div>
                      <label
                        class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-2 font-semibold"
                      >
                        1. Formation / Programme
                      </label>
                      <select
                        [(ngModel)]="evalForm.formationId"
                        (change)="onEvalFormationChange()"
                        class="input-themed w-full bg-[var(--bridge-card)] border border-[var(--bridge-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[#C62761] transition-colors cursor-pointer"
                      >
                        <option *ngFor="let f of evalFormFormations" [value]="f.id">
                          {{ f.nom }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-2 font-semibold"
                      >
                        2. Stagiaire à Évaluer
                      </label>
                      <select
                        [(ngModel)]="evalForm.studentId"
                        class="input-themed w-full bg-[var(--bridge-card)] border border-[var(--bridge-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[#C62761] transition-colors cursor-pointer font-medium"
                      >
                        <option [value]="null">-- Choisir un stagiaire --</option>
                        <option *ngFor="let s of availableStudents" [value]="s.id">
                          {{ s.prenom }} {{ s.nom }} {{ s.email ? '(' + s.email + ')' : '' }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-2 font-semibold"
                      >
                        3. Phase du Programme / Étape de Stage
                      </label>
                      <select
                        [(ngModel)]="evalForm.phaseId"
                        class="input-themed w-full bg-[var(--bridge-card)] border border-[var(--bridge-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[#C62761] transition-colors cursor-pointer"
                      >
                        <option [value]="null">-- Sélectionner la phase --</option>
                        <option *ngFor="let p of availablePhases" [value]="p.id">
                          Phase {{ p.numero }} — {{ p.nom }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- Section Note & Étoiles -->
                  <div class="space-y-4">
                    <div>
                      <div class="flex justify-between items-center mb-2">
                        <label
                          class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                        >
                          Note attribuée (/20)
                        </label>
                        <span
                          class="text-xl font-mono font-bold"
                          [class]="getGradeClass(evalForm.grade)"
                        >
                          {{ evalForm.grade }}/20
                        </span>
                      </div>
                      <input
                        [(ngModel)]="evalForm.grade"
                        type="range"
                        min="0"
                        max="20"
                        step="0.5"
                        class="w-full accent-[#C62761] cursor-pointer"
                      />
                    </div>

                    <div>
                      <label
                        class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-2 font-semibold"
                      >
                        Appréciation globale (Étoiles)
                      </label>
                      <div class="flex items-center gap-2">
                        <button
                          *ngFor="let star of [1, 2, 3, 4, 5]"
                          type="button"
                          (click)="evalForm.starRating = star"
                          class="text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                          [class]="
                            (evalForm.starRating || 0) >= star
                              ? 'text-[#F5A623]'
                              : 'text-gray-400 opacity-40'
                          "
                        >
                          ★
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-2 font-semibold"
                      >
                        Compétences clés validées
                      </label>
                      <input
                        [(ngModel)]="evalForm.skills"
                        type="text"
                        class="input-themed w-full bg-[var(--bridge-card)] border border-[var(--bridge-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[#C62761] transition-colors"
                        placeholder="Ex: Angular, Spring Boot, Architecture, Autonomie..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-2 font-semibold"
                  >
                    Remarques & Commentaires détaillés
                  </label>
                  <textarea
                    [(ngModel)]="evalForm.comment"
                    rows="3"
                    class="input-themed w-full bg-[var(--bridge-card)] border border-[var(--bridge-border)] rounded-xl p-3 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[#C62761] transition-colors resize-none"
                    placeholder="Points forts du stagiaire, réalisations, recommandations..."
                  ></textarea>
                </div>

                <!-- Blockchain Certificate Notice -->
                <div
                  *ngIf="evalForm.grade >= 14"
                  class="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                >
                  <svg
                    class="w-5 h-5 text-emerald-400 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p class="text-emerald-500 text-xs font-semibold">
                    Note ≥ 14/20 : Cette évaluation permettra la génération du Certificat
                    d'Excellence Blockchain pour le stagiaire.
                  </p>
                </div>

                <!-- Footer Buttons -->
                <div
                  class="flex items-center justify-end gap-3 pt-4 border-t border-[var(--bridge-border)]"
                >
                  <button
                    type="button"
                    (click)="closeEvalModal()"
                    class="py-2.5 px-5 bg-white/5 hover:bg-white/10 text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] font-semibold text-xs rounded-xl border border-[var(--bridge-border)] transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    (click)="submitEvaluation()"
                    [disabled]="!evalForm.studentId || !evalForm.phaseId || evalSaving"
                    class="py-2.5 px-7 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl text-xs hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <span
                      *ngIf="evalSaving"
                      class="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"
                    ></span>
                    <span *ngIf="evalSuccess">✓ Évaluation enregistrée !</span>
                    <span *ngIf="!evalSuccess && !evalSaving">Valider l'évaluation</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- DRAWER MODAL — Détails Stagiaire                                -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div
        *ngIf="selectedStudent && !showEvalForm"
        class="fixed inset-0 z-[99999] flex items-stretch justify-end"
        (click)="selectedStudent = null; clearStudentChart()"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

        <!-- Drawer Panel -->
        <div
          class="drawer-panel-bg relative z-10 w-full max-w-xl h-screen flex flex-col drawer-slide-in overflow-hidden shadow-2xl bg-[#10102A] border-l border-[var(--bridge-border)]"
          (click)="$event.stopPropagation()"
        >
          <!-- Top accent bar -->
          <div
            class="h-1 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623] flex-shrink-0"
          ></div>

          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-5 border-b border-[var(--bridge-border)] flex-shrink-0 bg-white/[0.01]"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0 shadow-lg"
              >
                <img
                  *ngIf="selectedStudent.user.avatar"
                  [src]="selectedStudent.user.avatar"
                  class="w-full h-full object-cover"
                  alt=""
                />
                <span *ngIf="!selectedStudent.user.avatar">{{
                  (selectedStudent.user.prenom ? selectedStudent.user.prenom[0] : '') +
                    (selectedStudent.user.nom ? selectedStudent.user.nom[0] : '')
                }}</span>
              </div>
              <div>
                <h3 class="font-syne font-bold text-[var(--bridge-text)] text-base leading-tight">
                  {{ selectedStudent.user.prenom }} {{ selectedStudent.user.nom }}
                </h3>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                  {{ selectedStudent.user.email }}
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="selectedStudent = null; clearStudentChart()"
              class="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] transition-all border border-[var(--bridge-border)] text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll">
            <!-- Stats -->
            <div class="grid grid-cols-3 gap-3">
              <div
                class="text-center p-4 bg-white/[0.03] rounded-xl border border-[var(--bridge-border)]"
              >
                <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider">
                  Note moy.
                </p>
                <p
                  class="text-2xl font-mono font-bold mt-1"
                  [class]="getGradeClass(selectedStudent.avgGrade)"
                >
                  {{
                    selectedStudent.avgGrade !== null ? selectedStudent.avgGrade.toFixed(1) : '—'
                  }}
                </p>
                <p class="text-[10px] text-[var(--bridge-text-muted)]">/20</p>
              </div>
              <div
                class="text-center p-4 bg-white/[0.03] rounded-xl border border-[var(--bridge-border)]"
              >
                <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider">
                  Évaluations
                </p>
                <p class="text-2xl font-mono font-bold text-purple-400 mt-1">
                  {{ selectedStudent.evaluationCount }}
                </p>
              </div>
              <div
                class="text-center p-4 bg-white/[0.03] rounded-xl border border-[var(--bridge-border)]"
              >
                <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider">
                  Progression
                </p>
                <p class="text-2xl font-mono font-bold text-[#F5A623] mt-1">
                  {{ selectedStudent.progression }}%
                </p>
              </div>
            </div>

            <!-- Certifications Blockchain -->
            <div
              class="p-4 bg-white/[0.02] rounded-xl border border-[var(--bridge-border)] space-y-3"
            >
              <p
                class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold flex items-center gap-2"
              >
                <svg
                  class="w-4 h-4 text-emerald-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Certifications Blockchain Polygon</span>
              </p>
              <div
                *ngIf="loadingCerts"
                class="flex items-center gap-2 text-xs text-[var(--bridge-text-muted)] py-2"
              >
                <div
                  class="w-4 h-4 rounded-full border-2 border-[#C62761]/30 border-t-[#C62761] animate-spin"
                ></div>
                <span>Vérification des certificats…</span>
              </div>
              <div
                *ngIf="
                  !loadingCerts &&
                  selectedStudent.certificats &&
                  selectedStudent.certificats.length > 0
                "
                class="space-y-2"
              >
                <div
                  *ngFor="let cert of selectedStudent.certificats"
                  class="flex items-start gap-3 p-3.5 bg-emerald-500/[0.07] rounded-xl border border-emerald-500/20"
                >
                  <div
                    class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-emerald-400"
                  >
                    <svg
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-emerald-500 truncate">
                      {{ cert.formationNom }}
                    </p>
                    <p class="text-[11px] text-[var(--bridge-text-muted)] mt-0.5">
                      {{ cert.phaseNom }}
                    </p>
                    <span
                      class="text-[9px] font-mono text-emerald-500/80 bg-emerald-500/10 px-2 py-0.5 rounded mt-1 inline-block truncate max-w-[200px]"
                    >
                      {{ cert.certificateNumber }}
                    </span>
                  </div>
                </div>
              </div>
              <div
                *ngIf="
                  !loadingCerts &&
                  (!selectedStudent.certificats || selectedStudent.certificats.length === 0)
                "
                class="text-center text-[var(--bridge-text-muted)] text-xs py-3"
              >
                Aucun certificat blockchain émis pour le moment.
              </div>
            </div>

            <!-- Grade chart -->
            <div
              *ngIf="getStudentEvals(selectedStudent.user.id).length > 1"
              class="p-4 bg-white/[0.02] rounded-xl border border-[var(--bridge-border)] space-y-3"
            >
              <p
                class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold flex items-center gap-2"
              >
                <svg
                  class="w-4 h-4 text-[#F5A623]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <span>Évolution des Notes</span>
              </p>
              <div class="relative h-36 w-full">
                <canvas #studentChart></canvas>
              </div>
            </div>

            <!-- Formations inscrites -->
            <div class="space-y-3">
              <p
                class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold"
              >
                Formations inscrites
              </p>
              <div class="space-y-2">
                <div
                  *ngFor="let f of selectedStudent.formations"
                  class="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-[var(--bridge-border)]"
                >
                  <div
                    class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm"
                  >
                    {{ f.nom[0] }}
                  </div>
                  <span class="text-xs font-semibold text-[var(--bridge-text)]">{{ f.nom }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions Footer -->
          <div
            class="p-4 border-t border-[var(--bridge-border)] flex gap-3 flex-shrink-0 bg-white/[0.01]"
          >
            <button
              type="button"
              (click)="selectedStudent = null; clearStudentChart()"
              class="py-2.5 px-5 bg-white/5 hover:bg-white/10 text-[var(--bridge-text-muted)] font-semibold text-xs rounded-xl border border-[var(--bridge-border)] transition-all cursor-pointer"
            >
              Fermer
            </button>
            <button
              type="button"
              (click)="openEvalModal(selectedStudent)"
              class="flex-1 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl text-xs hover:opacity-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <svg
                class="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                />
              </svg>
              <span>Évaluer ce stagiaire</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FormateurStagiairesComponent implements OnInit, OnDestroy {
  user: User | null = null;
  formations: Formation[] = [];
  allStudents: User[] = [];
  evaluations: Evaluation[] = [];
  stagiaireCards: StagiaireCard[] = [];
  stageInscriptions: StageInscription[] = [];

  loading = true;
  loadingStages = true;
  activeTab: 'FORMATIONS' | 'STAGES' = 'FORMATIONS';
  protected Math = Math;

  @ViewChild('studentChart') studentCanvas?: ElementRef<HTMLCanvasElement>;
  studentChartInstance?: Chart;
  loadingCerts = false;

  searchQuery = '';
  filterFormation = '';
  sortBy = 'name';

  currentPage = 1;
  pageSize = 8;

  selectedStudent: StagiaireCard | null = null;

  showEvalForm = false;
  evalSaving = false;
  evalSuccess = false;
  evalForm = {
    formationId: '',
    studentId: null as any,
    phaseId: null as any,
    grade: 10,
    starRating: 5,
    skills: '',
    comment: '',
  };
  availableStudents: User[] = [];
  availablePhases: Phase[] = [];
  evalFormFormations: Formation[] = [];
  allSystemFormations: Formation[] = [];

  private sub = new Subscription();

  constructor(
    private authService: AuthService,
    private formationService: FormationService,
    private evaluationService: EvaluationService,
    private userService: UserService,
    private certificatService: CertificatService,
    private onboardingService: OnboardingService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) return;

    // 1. Load all users for student matching
    this.sub.add(
      this.userService.getAllUsers().subscribe((users) => {
        this.allStudents = users.filter((u) => u.role === 'STAGIAIRE');
        this.buildCards();
      }),
    );

    // 2. Load all system formations
    this.sub.add(
      this.formationService.getFormations().subscribe((all) => {
        this.allSystemFormations = all || [];
      }),
    );

    // 3. Load formations assigned to this formateur
    this.sub.add(
      this.formationService.getFormationsByFormateur(this.user.id).subscribe((data) => {
        this.formations = data;
        this.evalFormFormations = data;
        this.buildCards();
        if (data.length > 0 && !this.evalForm.formationId) {
          this.evalForm.formationId = data[0].id;
          this.onEvalFormationChange();
        }
      }),
    );

    // 3. Load evaluations by trainer
    this.sub.add(
      this.evaluationService.getEvaluationsByTrainer(this.user.id).subscribe((data) => {
        this.evaluations = data || [];
        this.buildCards();
        this.loading = false;
      }),
    );

    // 4. Load assigned stage internships for this formateur
    this.loadStageInscriptions();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.clearStudentChart();
  }

  loadStageInscriptions(): void {
    this.loadingStages = true;
    this.onboardingService.getFormateurStageInscriptions().subscribe({
      next: (stages) => {
        this.stageInscriptions = stages || [];
        this.loadingStages = false;
      },
      error: () => {
        this.stageInscriptions = [];
        this.loadingStages = false;
      },
    });
  }

  buildCards(): void {
    if (!this.formations.length) return;
    const studentMap = new Map<string, { nom: string; id: string }[]>();
    const allEnrolledIds = new Set<string>();

    this.formations.forEach((f) => {
      if (f.stagiaires && f.stagiaires.length > 0) {
        f.stagiaires.forEach((id) => {
          allEnrolledIds.add(id);
          const existing = studentMap.get(id) || [];
          existing.push({ nom: f.nom, id: f.id });
          studentMap.set(id, existing);
        });
      }
    });

    const usedStudents =
      allEnrolledIds.size > 0 ? this.allStudents.filter((s) => allEnrolledIds.has(s.id)) : [];

    const idsWithoutUserData = [...allEnrolledIds].filter(
      (id) => !usedStudents.find((s) => s.id === id),
    );
    const placeholders = idsWithoutUserData.map((id) => ({
      id,
      prenom: 'Stagiaire',
      nom: `#${id}`,
      email: '',
      role: 'STAGIAIRE' as any,
      avatar: undefined,
      telephone: '',
      dateInscription: new Date(),
      age: 0,
      status: 'ACTIVE',
      authProvider: 'LOCAL',
    }));

    const finalStudents = [...usedStudents, ...(placeholders as any)];

    this.stagiaireCards = finalStudents.map((student) => {
      const sid = student.id?.toString();
      const evals = this.evaluations.filter((e) => e.studentId?.toString() === sid);
      const avgGrade =
        evals.length > 0 ? evals.reduce((sum, e) => sum + (e.grade || 0), 0) / evals.length : null;
      const forms = studentMap.get(student.id) || [];
      const progression = this.computeProgression(student.id);
      return {
        user: student,
        formations: forms,
        avgGrade,
        evaluationCount: evals.length,
        progression,
      };
    });
  }

  computeProgression(studentId: string): number {
    const evals = this.evaluations.filter((e) => e.studentId?.toString() === studentId?.toString());
    if (!evals.length) return 0;
    const passCount = evals.filter((e) => (e.grade || 0) >= 10).length;
    return Math.round((passCount / evals.length) * 100);
  }

  get filteredCards(): StagiaireCard[] {
    let list = [...this.stagiaireCards];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          `${c.user.prenom} ${c.user.nom}`.toLowerCase().includes(q) ||
          c.user.email.toLowerCase().includes(q),
      );
    }
    if (this.filterFormation) {
      list = list.filter((c) => c.formations.some((f) => f.id === this.filterFormation));
    }
    switch (this.sortBy) {
      case 'name':
        list.sort((a, b) =>
          `${a.user.prenom} ${a.user.nom}`.localeCompare(`${b.user.prenom} ${b.user.nom}`),
        );
        break;
      case 'grade_desc':
        list.sort((a, b) => (b.avgGrade || 0) - (a.avgGrade || 0));
        break;
      case 'grade_asc':
        list.sort((a, b) => (a.avgGrade || 0) - (b.avgGrade || 0));
        break;
    }
    return list;
  }

  get paginatedCards(): StagiaireCard[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCards.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCards.length / this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  getGlobalAvg(): string {
    const withGrade = this.stagiaireCards.filter((c) => c.avgGrade !== null);
    if (!withGrade.length) return '—';
    const avg = withGrade.reduce((s, c) => s + c.avgGrade!, 0) / withGrade.length;
    return avg.toFixed(1);
  }

  getCertifiedCount(): number {
    return this.stagiaireCards.filter((c) => c.avgGrade !== null && c.avgGrade >= 14).length;
  }

  getStudentEvals(studentId: string): Evaluation[] {
    return this.evaluations.filter((e) => e.studentId?.toString() === studentId?.toString());
  }

  getGradeClass(grade: number | null): string {
    const g = grade || 0;
    if (g >= 16) return 'text-emerald-500 font-bold';
    if (g >= 14) return 'text-[#F5A623] font-bold';
    if (g >= 10) return 'text-blue-400 font-semibold';
    if (g > 0) return 'text-rose-500 font-semibold';
    return 'text-gray-400';
  }

  getStageStatusClass(status?: string): string {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30';
      case 'PENDING_REVIEW':
        return 'bg-amber-500/15 text-amber-500 border border-amber-500/30';
      case 'REJECTED':
        return 'bg-rose-500/15 text-rose-500 border border-rose-500/30';
      default:
        return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    }
  }

  clearStudentChart(): void {
    if (this.studentChartInstance) {
      this.studentChartInstance.destroy();
      this.studentChartInstance = undefined;
    }
  }

  renderStudentChart(): void {
    if (!this.selectedStudent) return;
    this.clearStudentChart();
    const evals = this.getStudentEvals(this.selectedStudent.user.id);
    if (evals.length <= 1) return;

    setTimeout(() => {
      if (!this.studentCanvas?.nativeElement) return;
      const ctx = this.studentCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      const sorted = [...evals]
        .filter((e) => e.evaluationDate)
        .sort(
          (a, b) => new Date(a.evaluationDate!).getTime() - new Date(b.evaluationDate!).getTime(),
        );

      this.studentChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sorted.map(
            (e) =>
              e.phaseTitle ||
              new Date(e.evaluationDate!).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
              }),
          ),
          datasets: [
            {
              label: 'Note',
              data: sorted.map((e) => e.grade || 0),
              borderColor: '#F5A623',
              backgroundColor: 'rgba(245, 166, 35, 0.15)',
              fill: true,
              tension: 0.35,
              borderWidth: 2,
              pointBackgroundColor: '#C62761',
              pointRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
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
    }, 150);
  }

  openStudentDetail(card: StagiaireCard): void {
    this.selectedStudent = card;
    this.loadingCerts = true;
    this.certificatService.getCertificatsByStagiaire(card.user.id).subscribe({
      next: (certs) => {
        card.certificats = certs || [];
        this.loadingCerts = false;
      },
      error: () => {
        card.certificats = [];
        this.loadingCerts = false;
      },
    });
    this.renderStudentChart();
  }

  openEvalModal(card: StagiaireCard | null): void {
    this.showEvalForm = true;
    this.evalSuccess = false;
    this.evalSaving = false;

    if (card && card.formations && card.formations.length > 0) {
      const studentForms = this.formations.filter((f) =>
        card.formations.some((cf) => cf.id === f.id),
      );
      this.evalFormFormations = studentForms.length > 0 ? studentForms : this.formations;
    } else {
      this.evalFormFormations = this.formations;
    }

    if (this.evalFormFormations.length > 0) {
      this.evalForm.formationId = this.evalFormFormations[0].id;
    }
    this.onEvalFormationChange();
    if (card) {
      this.evalForm.studentId = card.user.id?.toString();
    }
  }

  openEvalForStage(stage: StageInscription): void {
    this.showEvalForm = true;
    this.evalSuccess = false;
    this.evalSaving = false;

    // Combine all system formations and trainer formations
    const pool = [...this.allSystemFormations, ...this.formations];
    const chosenFormations: Formation[] = [];

    // 1. Check by IDs
    if (stage.selectedFormationIds && stage.selectedFormationIds.length > 0) {
      stage.selectedFormationIds.forEach((id, idx) => {
        const found = pool.find((f) => f.id.toString() === id.toString());
        if (found && !chosenFormations.some((cf) => cf.id.toString() === found.id.toString())) {
          chosenFormations.push(found);
        } else if (!found) {
          const title = stage.selectedFormationTitles?.[idx] || `Formation #${id}`;
          chosenFormations.push({
            id: id.toString(),
            nom: title,
            description: '',
            category: 'Stage Facultatif',
            totalPrice: 0,
            status: 'PLANIFIEE',
            archived: false,
            startDate: new Date(),
            endDate: new Date(),
            defaultDurationWeeks: stage.stageDurationWeeks || 12,
            phases: [
              {
                id: '1',
                numero: 1,
                nom: 'Phase Initiale & Cadrage',
                contenu: '',
                prix: 0,
                seuilPresence: 70,
                seuilNote: 10,
              },
              {
                id: '2',
                numero: 2,
                nom: 'Projet & Développement',
                contenu: '',
                prix: 0,
                seuilPresence: 70,
                seuilNote: 10,
              },
              {
                id: '3',
                numero: 3,
                nom: 'Validation & Bilan Final',
                contenu: '',
                prix: 0,
                seuilPresence: 70,
                seuilNote: 14,
              },
            ],
            formateurId: this.user?.id || '',
            formateurNom: `${this.user?.prenom || ''} ${this.user?.nom || ''}`.trim(),
            stagiaires: [stage.studentId?.toString() || ''],
          } as any as Formation);
        }
      });
    }

    // 2. Check by Titles
    if (stage.selectedFormationTitles && stage.selectedFormationTitles.length > 0) {
      stage.selectedFormationTitles.forEach((title, idx) => {
        if (!chosenFormations.some((cf) => cf.nom.toLowerCase() === title.toLowerCase())) {
          const found = pool.find((f) => f.nom.toLowerCase() === title.toLowerCase());
          if (found && !chosenFormations.some((cf) => cf.id.toString() === found.id.toString())) {
            chosenFormations.push(found);
          } else if (!found) {
            const fid = (stage.selectedFormationIds?.[idx] || idx + 100).toString();
            chosenFormations.push({
              id: fid,
              nom: title,
              description: '',
              category: 'Stage Facultatif',
              totalPrice: 0,
              status: 'PLANIFIEE',
              archived: false,
              startDate: new Date(),
              endDate: new Date(),
              defaultDurationWeeks: stage.stageDurationWeeks || 12,
              phases: [
                {
                  id: '1',
                  numero: 1,
                  nom: 'Phase Initiale & Cadrage',
                  contenu: '',
                  prix: 0,
                  seuilPresence: 70,
                  seuilNote: 10,
                },
                {
                  id: '2',
                  numero: 2,
                  nom: 'Projet & Développement',
                  contenu: '',
                  prix: 0,
                  seuilPresence: 70,
                  seuilNote: 10,
                },
                {
                  id: '3',
                  numero: 3,
                  nom: 'Validation & Bilan Final',
                  contenu: '',
                  prix: 0,
                  seuilPresence: 70,
                  seuilNote: 14,
                },
              ],
              formateurId: this.user?.id || '',
              formateurNom: `${this.user?.prenom || ''} ${this.user?.nom || ''}`.trim(),
              stagiaires: [stage.studentId?.toString() || ''],
            } as any as Formation);
          }
        }
      });
    }

    if (chosenFormations.length === 0) {
      this.evalFormFormations = this.formations;
    } else {
      this.evalFormFormations = chosenFormations;
    }

    this.evalForm.formationId = this.evalFormFormations[0]?.id || '';

    this.onEvalFormationChange();

    const targetStudentId = stage.studentId?.toString() || '';
    let studentUser = this.allStudents.find((s) => s.id?.toString() === targetStudentId);

    if (!studentUser && targetStudentId) {
      studentUser = {
        id: targetStudentId,
        prenom: stage.studentFirstName || 'Stagiaire',
        nom: stage.studentLastName || `#${targetStudentId}`,
        email: stage.studentEmail || '',
        role: 'STAGIAIRE' as any,
        telephone: '',
        dateInscription: new Date(),
        age: 0,
        status: 'ACTIVE',
        authProvider: 'LOCAL',
      };
      this.allStudents.push(studentUser);
    }

    if (studentUser && !this.availableStudents.some((s) => s.id?.toString() === targetStudentId)) {
      this.availableStudents = [studentUser, ...this.availableStudents];
    }

    this.evalForm.studentId = targetStudentId;
    this.evalForm.comment = `Évaluation du stage facultatif : « ${stage.stageProjectTitle || 'Projet de stage'} »`;
  }

  closeEvalModal(): void {
    this.showEvalForm = false;
  }

  onEvalFormationChange(): void {
    const f =
      this.evalFormFormations.find((f) => f.id === this.evalForm.formationId) ||
      this.formations.find((f) => f.id === this.evalForm.formationId);
    if (f) {
      this.availablePhases = f.phases || [];
      const enrolled =
        f.stagiaires && f.stagiaires.length > 0
          ? this.allStudents.filter((s) => f.stagiaires.includes(s.id?.toString()))
          : [];
      this.availableStudents = enrolled.length > 0 ? enrolled : [...this.allStudents];
    } else {
      this.availablePhases = [];
      this.availableStudents = [...this.allStudents];
    }

    // Auto-select first phase if none is chosen
    if (this.availablePhases.length > 0) {
      this.evalForm.phaseId = this.availablePhases[0].id;
    }
  }

  submitEvaluation(): void {
    if (!this.evalForm.studentId || !this.evalForm.phaseId || !this.user || this.evalSaving) return;
    this.evalSaving = true;
    const payload = {
      studentId: this.evalForm.studentId.toString(),
      trainerId: this.user.id,
      phaseId: this.evalForm.phaseId.toString(),
      grade: this.evalForm.grade,
      skills: this.evalForm.skills,
      comment: this.evalForm.comment,
    };
    this.evaluationService.saveEvaluation(payload as any).subscribe({
      next: () => {
        this.evalSuccess = true;
        this.evalSaving = false;
        this.toastService.success('Évaluation enregistrée avec succès !', 'Évaluation');

        // Reload evaluations
        this.evaluationService.getEvaluationsByTrainer(this.user!.id).subscribe((data) => {
          this.evaluations = data || [];
          this.buildCards();
          if (this.selectedStudent) {
            const refreshed = this.stagiaireCards.find(
              (c) => c.user.id === this.selectedStudent!.user.id,
            );
            if (refreshed) this.selectedStudent = refreshed;
          }
        });
        setTimeout(() => {
          this.closeEvalModal();
          this.evalForm = {
            formationId: this.evalForm.formationId,
            studentId: null,
            phaseId: this.availablePhases.length > 0 ? this.availablePhases[0].id : null,
            grade: 10,
            starRating: 5,
            skills: '',
            comment: '',
          };
        }, 1200);
      },
      error: () => {
        this.evalSaving = false;
        this.toastService.error("Erreur lors de l'enregistrement de l'évaluation.", 'Erreur');
      },
    });
  }
}
