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
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { FormationService } from '../../../../core/services/formation.service';
import { EvaluationService, Evaluation } from '../../../../core/services/evaluation.service';
import { User } from '../../../../core/models/user.model';
import { Formation, Phase, Seance } from '../../../../core/models/formation.model';
import { Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface CalendarDay {
  date: Date;
  label: string;
  num: number;
  isToday: boolean;
  seances: (Seance & { userPresence?: 'PRESENT' | 'ABSENT' | 'EN_ATTENTE' })[];
}

@Component({
  selector: 'app-stagiaire-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <ng-container>
      <div class="space-y-8 animate-fadein pb-12">
        <!-- ═════════════════════════ HEADER ═════════════════════════ -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div
              class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[var(--bridge-gold)]/30 flex items-center justify-center text-[var(--bridge-gold)] shadow-lg"
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
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                <path d="M6 6h10" />
                <path d="M6 10h10" />
              </svg>
            </div>
            <div>
              <h1 class="font-syne font-bold text-2xl md:text-3xl text-white">
                Mon Agenda &
                <span
                  class="bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text text-transparent"
                >
                  Planning
                </span>
              </h1>
              <p class="text-[var(--bridge-text-muted)] text-sm mt-0.5">
                {{ todayLabel }} — Espace Stagiaire The Bridge
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div
              class="text-sm text-[var(--bridge-text-muted)] font-mono bg-white/5 border border-white/10 px-4 py-2 rounded-xl"
            >
              {{ todayLabel }}
            </div>
          </div>
        </div>

        <!-- Loading Spinner -->
        <div *ngIf="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
          <div
            class="w-12 h-12 rounded-full border-2 border-[#C62761]/30 border-t-[#C62761] animate-spin"
          ></div>
          <p class="text-white/40 text-sm">Chargement de votre planning…</p>
        </div>

        <div *ngIf="!loading" class="space-y-8">
          <!-- ═════════════════════════ 4 KPI CARDS — STYLE OVERVIEW ═════════════════════════ -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- KPI 1 : Séances Totales -->
            <div class="bridge-card p-5 relative overflow-hidden group">
              <div
                class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[var(--bridge-crimson)] to-[var(--bridge-gold)]"
              ></div>

              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    Séances Totales
                  </p>
                  <p class="text-2xl font-mono font-bold text-white mt-1.5">
                    {{ totalSeancesCount }}
                  </p>
                </div>

                <div
                  class="w-12 h-12 rounded-2xl bg-[var(--bridge-crimson)]/10 border border-[var(--bridge-crimson)]/20 text-[var(--bridge-crimson)] flex items-center justify-center flex-shrink-0"
                >
                  <span class="text-xl">
                    <svg
                      class="w-5 h-5 inline-block"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                  </span>
                </div>
              </div>

              <p
                class="text-[11px] text-[var(--bridge-gold)] mt-3 flex items-center gap-1 font-semibold"
              >
                <span>{{ pastSeancesCount }} terminées · {{ upcomingSeancesCount }} à venir</span>
              </p>
            </div>

            <!-- KPI 2 : Assiduité Globale -->
            <div class="bridge-card p-5 relative overflow-hidden group">
              <div
                class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[var(--bridge-gold)] to-amber-400"
              ></div>

              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    Assiduité Globale
                  </p>
                  <p
                    class="text-2xl font-mono font-bold mt-1.5"
                    [class]="attendanceRate >= 75 ? 'text-[var(--bridge-gold)]' : 'text-rose-400'"
                  >
                    {{ attendanceRate }}%
                  </p>
                </div>

                <div
                  class="w-12 h-12 rounded-2xl bg-[var(--bridge-gold)]/10 border border-[var(--bridge-gold)]/20 text-[var(--bridge-gold)] flex items-center justify-center flex-shrink-0"
                >
                  <span class="text-xl">
                    <svg
                      class="w-5 h-5 inline-block"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="4" y1="19" x2="4" y2="10" />
                      <line x1="10" y1="19" x2="10" y2="4" />
                      <line x1="16" y1="19" x2="16" y2="13" />
                      <line x1="22" y1="19" x2="22" y2="7" />
                    </svg>
                  </span>
                </div>
              </div>

              <p
                class="text-[11px] mt-3 flex items-center gap-1 font-semibold"
                [class]="attendanceRate >= 75 ? 'text-[var(--bridge-gold)]' : 'text-rose-400'"
              >
                <span>{{ presentCount }} présences sur {{ evaluatedPresenceCount }} appels</span>
              </p>
            </div>

            <!-- KPI 3 : Volume Horaire -->
            <div class="bridge-card p-5 relative overflow-hidden group">
              <div
                class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-400"
              ></div>

              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    Volume Horaire
                  </p>
                  <p class="text-2xl font-mono font-bold text-emerald-400 mt-1.5">
                    {{ totalHours }}h
                  </p>
                </div>

                <div
                  class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0"
                >
                  <span class="text-xl">
                    <svg
                      class="w-5 h-5 inline-block"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                </div>
              </div>

              <p class="text-[11px] text-emerald-400 mt-3 flex items-center gap-1 font-semibold">
                <span>Programme global inscrit ✓</span>
              </p>
            </div>

            <!-- KPI 4 : Mes Formations & Phases -->
            <div class="bridge-card p-5 relative overflow-hidden group">
              <div
                class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[var(--bridge-crimson)] to-purple-500"
              ></div>

              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    Formations & Phases
                  </p>
                  <p class="text-2xl font-mono font-bold text-[var(--bridge-gold)] mt-1.5">
                    {{ formations.length }}
                    <span class="text-xs font-sans text-white/50"
                      >({{ totalPhasesCount }} phases)</span
                    >
                  </p>
                </div>

                <div
                  class="w-12 h-12 rounded-2xl bg-[var(--bridge-crimson)]/10 border border-[var(--bridge-crimson)]/20 text-[var(--bridge-crimson)] flex items-center justify-center flex-shrink-0"
                >
                  <span class="text-xl">
                    <svg
                      class="w-5 h-5 inline-block"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </span>
                </div>
              </div>

              <p
                class="text-[11px] text-[var(--bridge-gold)] mt-3 flex items-center gap-1 font-semibold"
              >
                <span>{{ totalPhasesCount }} module(s) pédagogique(s)</span>
              </p>
            </div>
          </div>

          <!-- ═════════════════════════ CALENDRIER HEBDOMADAIRE ═════════════════════════ -->
          <div class="glass-card border border-[var(--bridge-border)] p-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[rgba(198,39,97,0.3)] flex items-center justify-center text-base"
                >
                  📆
                </div>
                <div>
                  <h3 class="font-syne font-bold text-base text-white">Semaine de Formation</h3>
                  <p class="text-xs text-white/40">Vos cours et séances planifiés cette semaine</p>
                </div>
              </div>

              <!-- Week Controls + Formation Filter -->
              <div class="flex items-center gap-3 flex-wrap">
                <select
                  [(ngModel)]="selectedFormationFilter"
                  (change)="buildWeekDays()"
                  class="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C62761] transition-colors"
                >
                  <option value="" class="bg-[#10102A]">Toutes mes formations</option>
                  <option *ngFor="let f of formations" [value]="f.id" class="bg-[#10102A]">
                    {{ f.nom }}
                  </option>
                </select>

                <div
                  class="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1"
                >
                  <button
                    (click)="prevWeek()"
                    class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all text-xs"
                  >
                    ‹
                  </button>
                  <span class="text-xs font-mono text-white/70 px-2 min-w-[130px] text-center">{{
                    weekRangeLabel
                  }}</span>
                  <button
                    (click)="nextWeek()"
                    class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all text-xs"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            <!-- Week Days Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
              <div
                *ngFor="let day of weekDays"
                class="glass-card p-3 border rounded-xl flex flex-col transition-all min-h-[140px]"
                [class]="
                  day.isToday
                    ? 'border-[#C62761]/40 bg-[#C62761]/[0.03]'
                    : 'border-white/5 bg-white/[0.01]'
                "
              >
                <!-- Day Header -->
                <div class="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                  <span
                    class="text-[10px] uppercase font-bold tracking-wider"
                    [class]="day.isToday ? 'text-[#F5A623]' : 'text-white/40'"
                  >
                    {{ day.label }}
                  </span>
                  <span
                    class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold"
                    [class]="
                      day.isToday
                        ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-[0_0_10px_rgba(198,39,97,0.4)]'
                        : 'text-white/60 bg-white/5'
                    "
                  >
                    {{ day.num }}
                  </span>
                </div>

                <!-- Sessions List for this day -->
                <div class="flex-1 space-y-2">
                  <div
                    *ngFor="let s of day.seances"
                    (click)="openSessionDetail(s)"
                    class="p-2 rounded-lg text-left cursor-pointer transition-all hover:scale-[1.03] group border"
                    [ngClass]="getSessionCardClass(s)"
                  >
                    <div class="flex items-center justify-between text-[9px] font-mono mb-1">
                      <span class="font-bold text-white/90">{{ s.heureDebut }}</span>
                      <span
                        class="text-[8px] px-1.5 py-0.2 rounded"
                        [ngClass]="getPresenceBadgeClass(s.userPresence)"
                      >
                        {{ getPresenceLabel(s.userPresence) }}
                      </span>
                    </div>
                    <p
                      class="text-[10px] font-semibold text-white truncate group-hover:text-[#F5A623] transition-colors"
                    >
                      {{ s.formationNom }}
                    </p>
                    <div class="flex items-center gap-1 text-[8px] text-white/40 mt-1 truncate">
                      <span>{{
                        s.type === 'EN_LIGNE' ? '🌐 En ligne' : '📍 ' + (s.salle || 'Salle')
                      }}</span>
                    </div>
                  </div>

                  <div
                    *ngIf="day.seances.length === 0"
                    class="h-full flex items-center justify-center py-4"
                  >
                    <span class="text-[10px] text-white/20">Aucun cours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ═════════════════════════ CHARTS ANALYTICS ═════════════════════════ -->
          <div class="grid md:grid-cols-2 gap-6" *ngIf="formations.length > 0">
            <!-- Chart 1: Répartition des présences -->
            <div class="glass-card border border-[var(--bridge-border)] p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="font-syne font-bold text-base text-white">Assiduité & Présences</h3>
                  <p class="text-xs text-white/40 mt-0.5">Statut de vos participations aux cours</p>
                </div>
                <div class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <svg
                    class="w-4 h-4 text-emerald-400"
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
              <div class="relative h-48 w-full">
                <canvas #attendanceChart></canvas>
              </div>
              <div class="grid grid-cols-3 gap-2 mt-4 text-center">
                <div class="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <p class="text-[10px] text-emerald-400 uppercase font-semibold">Présent</p>
                  <p class="text-lg font-mono font-bold text-white mt-0.5">{{ presentCount }}</p>
                </div>
                <div class="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p class="text-[10px] text-red-400 uppercase font-semibold">Absent</p>
                  <p class="text-lg font-mono font-bold text-white mt-0.5">{{ absentCount }}</p>
                </div>
                <div class="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p class="text-[10px] text-blue-400 uppercase font-semibold">À venir</p>
                  <p class="text-lg font-mono font-bold text-white mt-0.5">
                    {{ upcomingSeancesCount }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Chart 2: Progression par Phase -->
            <div class="glass-card border border-[var(--bridge-border)] p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="font-syne font-bold text-base text-white">Progression des Phases</h3>
                  <p class="text-xs text-white/40 mt-0.5">Avancement pédagogique par module</p>
                </div>
                <div class="w-8 h-8 rounded-xl bg-[#F5A623]/10 flex items-center justify-center">
                  <svg
                    class="w-4 h-4 text-[#F5A623]"
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
              <div class="relative h-48 w-full">
                <canvas #phaseProgressChart></canvas>
              </div>
              <p class="text-[10px] text-white/30 text-center mt-3">
                Calculé sur la présence et la validation de chaque phase
              </p>
            </div>
          </div>

          <!-- ═════════════════════════ PHASES & SEANCES DETAILLES ═════════════════════════ -->
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="font-syne font-bold text-xl text-white">
                  📚 Mes Formations & Parcours de Phases
                </h2>
                <p class="text-xs text-white/40 mt-0.5">Suivi modulaire de votre avancement</p>
              </div>
              <span class="text-xs text-white/40 font-mono"
                >{{ formations.length }} formation{{ formations.length > 1 ? 's' : '' }}</span
              >
            </div>

            <!-- Formations Accordion -->
            <div
              *ngFor="let formation of formations"
              class="glass-card border border-[var(--bridge-border)] overflow-hidden"
            >
              <!-- Formation Header (Clickable to collapse/expand) -->
              <div
                (click)="toggleFormationCollapse(formation.id)"
                class="p-5 bg-white/[0.02] border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.04] transition-colors"
              >
                <div class="flex items-center gap-4 min-w-0">
                  <div
                    class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-lg font-bold text-white shadow-lg flex-shrink-0"
                  >
                    {{ formation.nom[0] }}
                  </div>
                  <div class="min-w-0">
                    <h3 class="font-syne font-bold text-base text-white truncate">
                      {{ formation.nom }}
                    </h3>
                    <div class="flex items-center gap-2.5 text-xs text-white/40 mt-0.5 flex-wrap">
                      <span>👨‍🏫 {{ formation.formateurNom }}</span>
                      <span>·</span>
                      <span>📂 {{ formation.category || 'Formation' }}</span>
                      <span>·</span>
                      <span
                        >📊 {{ formation.phases.length }} Phase{{
                          formation.phases.length > 1 ? 's' : ''
                        }}</span
                      >
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3 flex-shrink-0">
                  <span
                    class="text-xs font-semibold px-3 py-1 rounded-full border"
                    [ngClass]="
                      formation.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    "
                  >
                    {{ formation.status === 'ACTIVE' ? 'En cours' : formation.status }}
                  </span>
                  <span
                    class="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 text-xs transition-transform duration-300"
                    [class.rotate-180]="!isFormationCollapsed(formation.id)"
                  >
                    ▼
                  </span>
                </div>
              </div>

              <!-- Phases List inside Formation -->
              <div *ngIf="!isFormationCollapsed(formation.id)" class="p-5 space-y-4 animate-fadein">
                <div
                  *ngFor="let phase of getVisiblePhases(formation); let pi = index"
                  class="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 transition-all hover:border-white/10"
                >
                  <!-- Phase Header -->
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div class="flex items-center gap-3">
                      <span
                        class="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-mono font-bold text-white/70"
                      >
                        P{{ phase.numero }}
                      </span>
                      <div>
                        <h4 class="text-sm font-semibold text-white">{{ phase.nom }}</h4>
                        <p class="text-[11px] text-white/40" *ngIf="phase.description">
                          {{ phase.description }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <span
                        class="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md"
                        [ngClass]="getPhaseStatusBadgeClass(phase.status)"
                      >
                        {{ phase.status }}
                      </span>
                      <span class="text-xs font-mono text-white/50"
                        >{{ (phase.seances || []).length }} séance{{
                          (phase.seances || []).length > 1 ? 's' : ''
                        }}</span
                      >
                    </div>
                  </div>

                  <!-- Progress Bar -->
                  <div class="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      [style.width]="(phase.progression || 0) + '%'"
                      [style.background]="'linear-gradient(90deg, #C62761, #F5A623)'"
                    ></div>
                  </div>

                  <!-- Sessions of this Phase -->
                  <div
                    *ngIf="phase.seances && phase.seances.length > 0"
                    class="pt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-2"
                  >
                    <div
                      *ngFor="let s of phase.seances"
                      (click)="openSessionDetail(s)"
                      class="p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-[#C62761]/30 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-mono font-bold text-white">{{
                            s.date | date: 'dd/MM'
                          }}</span>
                          <span class="text-[10px] text-white/40 font-mono">{{
                            s.heureDebut
                          }}</span>
                        </div>
                        <p class="text-[10px] text-white/50 mt-0.5">
                          {{
                            s.type === 'EN_LIGNE'
                              ? '🌐 Visioconférence'
                              : '📍 ' + (s.salle || 'Salle de cours')
                          }}
                        </p>
                      </div>
                      <div class="text-right">
                        <span
                          class="text-[9px] font-semibold px-2 py-0.5 rounded"
                          [ngClass]="getPresenceBadgeClass(getUserPresence(s))"
                        >
                          {{ getPresenceLabel(getUserPresence(s)) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    *ngIf="!phase.seances || phase.seances.length === 0"
                    class="text-xs text-white/30 italic py-1"
                  >
                    Aucune séance programmée pour cette phase pour l'instant.
                  </div>
                </div>

                <!-- Voir Plus / Voir Moins Button for Phases -->
                <div *ngIf="formation.phases.length > 2" class="pt-1 text-center">
                  <button
                    (click)="togglePhasesExpansion(formation.id)"
                    class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70 hover:text-white transition-all border border-white/5 inline-flex items-center gap-2"
                  >
                    <span *ngIf="!isPhasesExpanded(formation.id)">
                      👁️ Voir plus (+{{ formation.phases.length - 2 }} phase{{
                        formation.phases.length - 2 > 1 ? 's' : ''
                      }})
                    </span>
                    <span *ngIf="isPhasesExpanded(formation.id)"> ▲ Voir moins </span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div
              *ngIf="formations.length === 0"
              class="glass-card border border-[var(--bridge-border)] p-12 text-center"
            >
              <div
                class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 text-3xl"
              >
                🎓
              </div>
              <h3 class="font-syne font-bold text-lg text-white mb-1">Aucune inscription active</h3>
              <p class="text-xs text-white/40 max-w-md mx-auto mb-5">
                Vous n'êtes inscrit à aucune formation pour le moment. Explorez le catalogue pour
                commencer votre apprentissage.
              </p>
              <a
                routerLink="/dashboard/stagiaire/formations"
                class="px-6 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl text-xs hover:opacity-90 inline-block transition-all shadow-lg"
              >
                Découvrir les formations →
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <!-- DRAWER MODAL — Détails de la Séance (slide depuis droite)     -->
      <!-- ═══════════════════════════════════════════════════════════════ -->
      <div
        *ngIf="selectedSession"
        class="fixed inset-0 z-[9999] flex items-stretch justify-end"
        (click)="closeSessionDetail()"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <!-- Drawer Panel -->
        <div
          class="bridge-drawer-panel relative z-10 w-full max-w-lg h-screen flex flex-col drawer-slide-in overflow-hidden shadow-2xl"
          style="background: linear-gradient(135deg, #0e0e24 0%, #12122e 100%); border-left: 1px solid rgba(198,39,97,0.25);"
          (click)="$event.stopPropagation()"
        >
          <!-- Top accent bar -->
          <div
            class="h-1 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623] flex-shrink-0"
          ></div>

          <!-- Header -->
          <div
            class="bridge-drawer-header flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0 bg-white/[0.01]"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 flex items-center justify-center text-lg shadow-md"
              >
                📖
              </div>
              <div>
                <h3 class="font-syne font-bold text-base text-white leading-tight">
                  Détails de la Séance
                </h3>
                <p class="text-xs text-white/40 mt-0.5 truncate max-w-[260px]">
                  {{ selectedSession.formationNom }}
                </p>
              </div>
            </div>
            <button
              (click)="closeSessionDetail()"
              class="bridge-drawer-close w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/5 text-sm"
            >
              ✕
            </button>
          </div>

          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-5 custom-scroll">
            <!-- Date & Salle Cards -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bridge-drawer-card p-4 bg-white/[0.03] rounded-xl border border-white/5">
                <span class="text-[10px] text-white/40 uppercase tracking-wider block font-semibold"
                  >Date & Horaires</span
                >
                <p class="text-white font-mono font-bold mt-1 text-sm">
                  {{ selectedSession.date | date: 'EEEE d MMMM yyyy' }}
                </p>
                <p class="text-xs text-[#F5A623] font-mono mt-1 font-semibold">
                  ⏱ {{ selectedSession.heureDebut }} - {{ selectedSession.heureFin || 'Fin' }}
                </p>
              </div>
              <div class="bridge-drawer-card p-4 bg-white/[0.03] rounded-xl border border-white/5">
                <span class="text-[10px] text-white/40 uppercase tracking-wider block font-semibold"
                  >Modalité & Salle</span
                >
                <p class="text-white font-bold mt-1 text-sm">
                  {{ selectedSession.type === 'EN_LIGNE' ? '🌐 Distanciel' : '📍 Présentiel' }}
                </p>
                <p class="text-xs text-white/50 mt-1">
                  {{ selectedSession.salle || 'Salle non assignée' }}
                </p>
              </div>
            </div>

            <!-- Formateur info -->
            <div class="bridge-drawer-card p-4 bg-white/[0.03] rounded-xl border border-white/5">
              <span class="text-[10px] text-white/40 uppercase tracking-wider block font-semibold"
                >Formateur Responsable</span
              >
              <div class="flex items-center gap-3 mt-2">
                <div
                  class="w-8 h-8 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xs font-bold text-white"
                >
                  {{ selectedSession.formateurNom ? selectedSession.formateurNom[0] : 'F' }}
                </div>
                <p class="text-sm font-semibold text-white">
                  {{ selectedSession.formateurNom || 'Formateur assigné' }}
                </p>
              </div>
            </div>

            <!-- Statut Présence du stagiaire -->
            <div
              class="bridge-presence-status p-5 rounded-xl border flex items-center justify-between shadow-lg"
              [ngClass]="getPresenceBoxClass(getUserPresence(selectedSession))"
            >
              <div>
                <span class="text-[10px] uppercase font-bold tracking-wider text-white/60"
                  >Votre Statut de Présence</span
                >
                <p class="text-base font-bold mt-1 text-white">
                  {{ getPresenceFullLabel(getUserPresence(selectedSession)) }}
                </p>
              </div>
              <span class="text-3xl">{{ getPresenceEmoji(getUserPresence(selectedSession)) }}</span>
            </div>

            <!-- Note / Star rating if present -->
            <div
              *ngIf="getSessionRating(selectedSession)"
              class="bridge-rating-card p-4 bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-xl flex items-center justify-between"
            >
              <div>
                <span class="text-[10px] text-[#F5A623] uppercase font-bold"
                  >Appréciation de séance</span
                >
                <p class="text-xs text-white/90 mt-1">
                  {{
                    getSessionRating(selectedSession)?.note ||
                      'Participation validée par le formateur'
                  }}
                </p>
              </div>
              <div class="text-[#F5A623] font-bold text-base bg-[#F5A623]/20 px-3 py-1 rounded-lg">
                ★ {{ getSessionRating(selectedSession)?.stars }}/5
              </div>
            </div>

            <!-- Formation Overview -->
            <div
              class="bridge-drawer-card p-4 bg-white/[0.02] rounded-xl border border-white/5 space-y-2"
            >
              <span class="text-[10px] text-white/40 uppercase tracking-wider block font-semibold"
                >Formation</span
              >
              <p class="text-xs text-white/80 font-medium">{{ selectedSession.formationNom }}</p>
            </div>
          </div>

          <!-- Actions Footer -->
          <div
            class="bridge-drawer-footer p-5 border-t border-[var(--bridge-border)] flex-shrink-0 bg-white/[0.01]"
          >
            <button
              (click)="closeSessionDetail()"
              class="bridge-close-btn w-full py-3 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-xl border border-white/5 transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </ng-container>

    <style>
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
        animation: drawerSlideIn 0.35s cubic-bezier(0.34, 1.15, 0.64, 1) both;
      }
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
      .custom-scroll::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scroll::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
      }
      .custom-scroll::-webkit-scrollbar-thumb {
        background: rgba(198, 39, 97, 0.3);
        border-radius: 4px;
      }
    </style>
  `,
})
export class StagiaireAgendaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('attendanceChart') attendanceCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('phaseProgressChart') phaseProgressCanvas?: ElementRef<HTMLCanvasElement>;

  private chartAttendance?: Chart;
  private chartPhase?: Chart;

  user: User | null = null;
  formations: Formation[] = [];
  evaluations: Evaluation[] = [];
  loading = true;

  todayLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  currentWeekStart: Date = this.getStartOfWeek(new Date());
  weekDays: CalendarDay[] = [];
  selectedFormationFilter = '';

  selectedSession: Seance | null = null;

  // Collapse / Expand states
  collapsedFormations: { [formationId: string]: boolean } = {};
  expandedPhases: { [formationId: string]: boolean } = {};

  private sub = new Subscription();

  constructor(
    private authService: AuthService,
    private formationService: FormationService,
    private evaluationService: EvaluationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) return;

    this.loading = true;
    this.sub.add(
      this.formationService.getFormationsByStagiaire(this.user.id).subscribe({
        next: (formations) => {
          this.formations = formations || [];
          this.buildWeekDays();
          this.fetchEvaluations();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      }),
    );
  }

  private fetchEvaluations(): void {
    if (!this.user) return;
    this.sub.add(
      this.evaluationService.getEvaluationsByStudent(this.user.id).subscribe({
        next: (evals) => {
          this.evaluations = evals || [];
          this.loading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.renderCharts(), 200);
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.renderCharts(), 200);
        },
      }),
    );
  }

  ngAfterViewInit(): void {
    if (!this.loading) {
      setTimeout(() => this.renderCharts(), 200);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.destroyCharts();
  }

  private destroyCharts(): void {
    if (this.chartAttendance) {
      this.chartAttendance.destroy();
      this.chartAttendance = undefined;
    }
    if (this.chartPhase) {
      this.chartPhase.destroy();
      this.chartPhase = undefined;
    }
  }

  // ══════════════ Collapsible Phases & Formations ══════════════
  toggleFormationCollapse(formationId: string): void {
    this.collapsedFormations[formationId] = !this.collapsedFormations[formationId];
  }

  isFormationCollapsed(formationId: string): boolean {
    return !!this.collapsedFormations[formationId];
  }

  togglePhasesExpansion(formationId: string): void {
    this.expandedPhases[formationId] = !this.expandedPhases[formationId];
  }

  isPhasesExpanded(formationId: string): boolean {
    return !!this.expandedPhases[formationId];
  }

  getVisiblePhases(formation: Formation): Phase[] {
    const phases = formation.phases || [];
    if (phases.length <= 2 || this.isPhasesExpanded(formation.id)) {
      return phases;
    }
    return phases.slice(0, 2);
  }

  // ══════════════ Week Navigation ══════════════
  getStartOfWeek(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  prevWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.buildWeekDays();
  }

  nextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.buildWeekDays();
  }

  get weekRangeLabel(): string {
    const end = new Date(this.currentWeekStart);
    end.setDate(end.getDate() + 6);
    return `${this.currentWeekStart.getDate()} ${this.currentWeekStart.toLocaleDateString('fr-FR', { month: 'short' })} - ${end.getDate()} ${end.toLocaleDateString('fr-FR', { month: 'short' })}`;
  }

  buildWeekDays(): void {
    const days: CalendarDay[] = [];
    const allSeances = this.getAllSeances();
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(this.currentWeekStart);
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);

      const isToday = d.getTime() === today.getTime();

      const matching = allSeances.filter((s) => {
        if (this.selectedFormationFilter && s.formationId !== this.selectedFormationFilter) {
          return false;
        }
        const sDate = new Date(s.date);
        sDate.setHours(0, 0, 0, 0);
        return sDate.getTime() === d.getTime();
      });

      days.push({
        date: d,
        label: dayNames[i],
        num: d.getDate(),
        isToday,
        seances: matching.map((s) => ({
          ...s,
          userPresence: this.getUserPresence(s),
        })),
      });
    }

    this.weekDays = days;
  }

  // ══════════════ Seances & Presence Calculations ══════════════
  getAllSeances(): Seance[] {
    const list: Seance[] = [];
    this.formations.forEach((f) => {
      (f.phases || []).forEach((p) => {
        (p.seances || []).forEach((s) => {
          list.push({
            ...s,
            formationNom: s.formationNom || f.nom,
          });
        });
      });
    });
    return list;
  }

  get totalSeancesCount(): number {
    return this.getAllSeances().length;
  }

  get pastSeancesCount(): number {
    const now = new Date();
    return this.getAllSeances().filter((s) => new Date(s.date) < now || s.status === 'CLOTUREE')
      .length;
  }

  get upcomingSeancesCount(): number {
    const now = new Date();
    return this.getAllSeances().filter((s) => new Date(s.date) >= now && s.status !== 'CLOTUREE')
      .length;
  }

  get totalPhasesCount(): number {
    return this.formations.reduce((acc, f) => acc + (f.phases?.length || 0), 0);
  }

  get totalHours(): number {
    return this.getAllSeances().reduce((acc, s) => {
      const h = parseInt(s.duree || '3') || 3;
      return acc + h;
    }, 0);
  }

  getUserPresence(s: Seance): 'PRESENT' | 'ABSENT' | 'EN_ATTENTE' {
    if (!this.user) return 'EN_ATTENTE';
    const uid = this.user.id.toString();
    const p = (s.presences || []).find((pr) => pr.stagiaireId?.toString() === uid);
    if (!p) {
      return s.status === 'CLOTUREE' ? 'ABSENT' : 'EN_ATTENTE';
    }
    return p.present ? 'PRESENT' : 'ABSENT';
  }

  get presentCount(): number {
    return this.getAllSeances().filter((s) => this.getUserPresence(s) === 'PRESENT').length;
  }

  get absentCount(): number {
    return this.getAllSeances().filter((s) => this.getUserPresence(s) === 'ABSENT').length;
  }

  get evaluatedPresenceCount(): number {
    return this.presentCount + this.absentCount;
  }

  get attendanceRate(): number {
    if (this.evaluatedPresenceCount === 0) return 100;
    return Math.round((this.presentCount / this.evaluatedPresenceCount) * 100);
  }

  // ══════════════ Charts Rendering ══════════════
  private renderCharts(): void {
    this.renderAttendanceChart();
    this.renderPhaseProgressChart();
  }

  private renderAttendanceChart(): void {
    if (!this.attendanceCanvas?.nativeElement) return;
    if (this.chartAttendance) {
      this.chartAttendance.destroy();
      this.chartAttendance = undefined;
    }
    const ctx = this.attendanceCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chartAttendance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Présent', 'Absent', 'À venir'],
        datasets: [
          {
            data: [this.presentCount, this.absentCount, this.upcomingSeancesCount],
            backgroundColor: ['#10B981', '#EF4444', '#3B82F6'],
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        resizeDelay: 100,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => ` ${c.label}: ${c.parsed} séance${c.parsed > 1 ? 's' : ''}`,
            },
          },
        },
      },
    });
  }

  private renderPhaseProgressChart(): void {
    if (!this.phaseProgressCanvas?.nativeElement) return;
    if (this.chartPhase) {
      this.chartPhase.destroy();
      this.chartPhase = undefined;
    }
    const ctx = this.phaseProgressCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const allPhases: { label: string; prog: number }[] = [];
    this.formations.forEach((f) => {
      (f.phases || []).forEach((p) => {
        allPhases.push({
          label: `P${p.numero} - ${p.nom.length > 12 ? p.nom.substring(0, 10) + '…' : p.nom}`,
          prog:
            p.progression || (p.status === 'COMPLETEE' ? 100 : p.status === 'EN_COURS' ? 50 : 0),
        });
      });
    });

    const labels = allPhases.map((p) => p.label);
    const data = allPhases.map((p) => p.prog);

    this.chartPhase = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Progression %',
            data,
            backgroundColor: data.map((v) =>
              v === 100
                ? 'rgba(16,185,129,0.7)'
                : v > 0
                  ? 'rgba(245,166,35,0.7)'
                  : 'rgba(255,255,255,0.1)',
            ),
            borderRadius: 6,
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
            grid: { display: false },
            ticks: { color: '#6B7280', font: { size: 10 } },
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#6B7280', font: { size: 10 }, callback: (v) => `${v}%` },
          },
        },
      },
    });
  }

  // ══════════════ Helpers UI ══════════════
  getSessionCardClass(s: Seance & { userPresence?: string }): string {
    if (s.userPresence === 'PRESENT') {
      return 'bg-emerald-500/10 border-emerald-500/30';
    }
    if (s.userPresence === 'ABSENT') {
      return 'bg-red-500/10 border-red-500/30';
    }
    return 'bg-white/5 border-white/10 hover:border-[#F5A623]/30';
  }

  getPresenceBadgeClass(presence?: string): string {
    switch (presence) {
      case 'PRESENT':
        return 'bg-emerald-500/20 text-emerald-400 font-bold';
      case 'ABSENT':
        return 'bg-red-500/20 text-red-400 font-bold';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  }

  getPresenceLabel(presence?: string): string {
    switch (presence) {
      case 'PRESENT':
        return 'Présent';
      case 'ABSENT':
        return 'Absent';
      default:
        return 'À venir';
    }
  }

  getPresenceFullLabel(presence?: string): string {
    switch (presence) {
      case 'PRESENT':
        return 'Présence Enregistrée & Validée';
      case 'ABSENT':
        return 'Absence Enregistrée';
      default:
        return 'Séance à venir / Non Clôturée';
    }
  }

  getPresenceEmoji(presence?: string): string {
    switch (presence) {
      case 'PRESENT':
        return '✅';
      case 'ABSENT':
        return '❌';
      default:
        return '⏳';
    }
  }

  getPresenceBoxClass(presence?: string): string {
    switch (presence) {
      case 'PRESENT':
        return 'bg-emerald-500/10 border-emerald-500/30';
      case 'ABSENT':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  }

  getPhaseStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'COMPLETEE':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'EN_COURS':
        return 'bg-[rgba(245,166,35,0.1)] text-[#F5A623] border border-[rgba(245,166,35,0.2)]';
      default:
        return 'bg-white/5 text-white/30 border border-white/5';
    }
  }

  getSessionRating(s: Seance): { stars: number; note: string } | null {
    if (!this.user) return null;
    const uid = this.user.id.toString();
    const p = (s.presences || []).find((pr) => pr.stagiaireId?.toString() === uid);
    if (p && p.starRating) {
      return { stars: p.starRating, note: p.sessionNote || '' };
    }
    return null;
  }

  openSessionDetail(s: Seance): void {
    this.selectedSession = s;
  }

  closeSessionDetail(): void {
    this.selectedSession = null;
  }
}
