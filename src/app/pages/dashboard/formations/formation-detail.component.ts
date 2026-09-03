import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormationService } from '../../../core/services/formation.service';
import { EvaluationService, Evaluation } from '../../../core/services/evaluation.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaiementService } from '../../../core/services/paiement.service';
import { ToastService } from '../../../core/services/toast.service';
import { Formation, Phase, Seance, Presence } from '../../../core/models/formation.model';
import { Paiement } from '../../../core/models/paiement.model';
import { User } from '../../../core/models/user.model';
import { Subscription, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

import { EnrollmentService, EnrollmentResponse } from '../../../core/services/enrollment.service';
import { ComboEnrollmentService } from '../../../core/services/combo-enrollment.service';
import { ComboEnrollment } from '../../../core/models/combo-enrollment.model';

export interface CustomPlanSession {
  titre: string;
  date: string;
  heureDebut: string;
  dureeMinutes: number;
  type: 'PRESENTIEL' | 'EN_LIGNE';
  salleOuLien: string;
  description?: string;
  present?: boolean | null;
  markedAt?: string;
}

export interface CustomPlanPhase {
  numero: number;
  nom: string;
  description: string;
  dureeSemaines: number;
  minimumAttendance: number;
  minimumGrade: number;
  seances: CustomPlanSession[];
}

export interface CustomPlanData {
  formationId: string;
  formationNom: string;
  studentId: number;
  studentNom: string;
  totalDurationWeeks: number;
  dateDebut: string;
  dateFinPrevue?: string;
  phases: CustomPlanPhase[];
  noteFormateur?: string;
  updatedAt: string;
}

interface EnrollmentInfo {
  id: string;
  studentId: number;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentAvatar?: string;
  enrollmentDate: string;
  status?: string;
  customDurationWeeks?: number | null;
  motivationMessage?: string | null;
  rejectionReason?: string | null;
  respondedAt?: string | null;
  customPlan?: string | null;
}

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fadein">
      <!-- Back Button -->
      <div class="flex items-center gap-3">
        <button
          (click)="goBack()"
          class="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/70 hover:text-white transition-all group"
        >
          <span class="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Retour aux formations</span>
        </button>
        <span class="text-white/20">|</span>
        <span class="text-xs text-white/40 font-mono">{{ formation?.category }}</span>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
        <div
          class="w-12 h-12 rounded-full border-2 border-[#C62761]/30 border-t-[#C62761] animate-spin"
        ></div>
        <p class="text-white/40 text-sm">Chargement de la formation...</p>
      </div>

      <ng-container *ngIf="!loading && formation">
        <!-- Formation Header -->
        <div class="glass-card border border-[var(--bridge-border)] p-8 relative overflow-hidden">
          <div
            class="absolute inset-0 bg-gradient-to-br from-[rgba(198,39,97,0.06)] to-[rgba(245,166,35,0.03)] pointer-events-none"
          ></div>
          <div class="relative z-10">
            <div class="flex flex-col lg:flex-row lg:items-start gap-6">
              <!-- Title Block -->
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <span
                    class="text-[10px] px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 uppercase font-mono tracking-widest"
                  >
                    {{ formation.category || 'Général' }}
                  </span>
                  <span
                    class="text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border"
                    [class]="getStatusClass(formation.status)"
                  >
                    {{ getStatusLabel(formation.status) }}
                  </span>
                </div>
                <h1 class="font-syne font-bold text-2xl md:text-3xl text-white mb-3 leading-tight">
                  {{ formation.nom }}
                </h1>
                <p class="text-[var(--bridge-text-muted)] text-sm leading-relaxed max-w-2xl">
                  {{ formation.description }}
                </p>
              </div>

              <!-- Stats Block -->
              <div class="grid grid-cols-3 gap-4 lg:min-w-[280px]">
                <div class="text-center p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <p class="text-2xl font-mono font-bold text-[#F5A623]">
                    {{ formation.phases.length }}
                  </p>
                  <p class="text-[10px] text-white/40 uppercase tracking-wider mt-1">Phases</p>
                </div>
                <div class="text-center p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <p class="text-2xl font-mono font-bold text-[#C62761]">
                    {{ enrollments.length }}
                  </p>
                  <p class="text-[10px] text-white/40 uppercase tracking-wider mt-1">Stagiaires</p>
                </div>
                <div class="text-center p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <p class="text-2xl font-mono font-bold text-emerald-400">
                    {{ getTotalSessions() }}
                  </p>
                  <p class="text-[10px] text-white/40 uppercase tracking-wider mt-1">Séances</p>
                </div>
              </div>
            </div>

            <!-- Formateur Info -->
            <div class="flex items-center gap-3 mt-6 pt-6 border-t border-white/5">
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-sm font-bold text-white overflow-hidden"
              >
                <img
                  *ngIf="formation.formateurAvatar"
                  [src]="formation.formateurAvatar"
                  class="w-full h-full object-cover"
                  [alt]="formation.formateurNom"
                />
                <span *ngIf="!formation.formateurAvatar">{{ formation.formateurNom[0] }}</span>
              </div>
              <div>
                <p class="text-sm font-semibold text-white">{{ formation.formateurNom }}</p>
                <p class="text-xs text-white/40">Formateur Principal</p>
              </div>
              <div class="ml-auto">
                <span class="text-lg font-mono font-bold text-[#F5A623]"
                  >{{ formation.totalPrice | number }} TND</span
                >
              </div>
            </div>

            <!-- Stagiaire Actions Toolbar -->
            <div
              *ngIf="isStagiaire && isMyEnrollmentActive"
              class="flex items-center justify-between gap-3 mt-6 pt-6 border-t border-white/10 flex-wrap"
            >
              <!-- Left: Combo status or Simple enrollment status -->
              <div class="flex items-center gap-2">
                <span
                  *ngIf="isComboFormation"
                  class="text-xs px-3 py-1.5 rounded-xl font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-2"
                >
                  <span>🎁</span>
                  <span
                    >Formation incluse dans un Parcours Combo ({{
                      comboStatus === 'ACTIVE' ? 'Payé & Actif' : 'En attente'
                    }})</span
                  >
                </span>

                <span
                  *ngIf="!isComboFormation"
                  class="text-xs px-3 py-1.5 rounded-xl font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-2"
                >
                  <span>✓</span>
                  <span>Inscription Simple Active</span>
                </span>
              </div>

              <!-- Right: Unenroll & Reimbursement buttons (only for simple formations) -->
              <div class="flex items-center gap-2" *ngIf="!isComboFormation">
                <!-- Demande de remboursement -->
                <button
                  type="button"
                  (click)="openRemboursementModal()"
                  class="px-4 py-2 rounded-xl text-xs font-bold border transition-all text-orange-400 bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <svg
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="9 14 4 9 9 4" />
                    <path d="M4 9h10a6 6 0 0 1 6 6v1" />
                  </svg>
                  <span>Demande de remboursement</span>
                </button>

                <!-- Se désinscrire -->
                <div *ngIf="!unenrollConfirm">
                  <button
                    type="button"
                    (click)="unenrollConfirm = true"
                    class="px-4 py-2 rounded-xl text-xs font-bold border transition-all text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 flex items-center gap-2 cursor-pointer"
                  >
                    <span>🚪</span>
                    <span>Se désinscrire</span>
                  </button>
                </div>

                <div
                  *ngIf="unenrollConfirm"
                  class="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-xl animate-fadein"
                >
                  <span class="text-xs text-red-300 font-semibold"
                    >Confirmer la désinscription ?</span
                  >
                  <button
                    type="button"
                    (click)="unenrollFormation()"
                    [disabled]="unenrolling"
                    class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {{ unenrolling ? '...' : 'Oui' }}
                  </button>
                  <button
                    type="button"
                    (click)="unenrollConfirm = false"
                    class="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    Non
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="flex gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-xl w-fit">
          <button
            *ngFor="let tab of tabs; trackBy: trackTab"
            (click)="setTab(tab.id)"
            class="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer"
            [class]="
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-[0_0_15px_rgba(198,39,97,0.3)]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            "
          >
            {{ tab.icon }} {{ tab.label }}
            <span
              *ngIf="tab.count !== undefined"
              class="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-mono"
              [class]="
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'
              "
            >
              {{ tab.count }}
            </span>
          </button>
        </div>

        <!-- ══ STAGIAIRE TABS ══ -->

        <!-- Tab: Ma Progression (Stagiaire) -->
        <div *ngIf="activeTab === 'my-progress'" class="space-y-5">
          <!-- Global progress card -->
          <div class="glass-card border border-[var(--bridge-border)] p-6 relative overflow-hidden">
            <div
              class="absolute inset-0 bg-gradient-to-br from-[rgba(198,39,97,0.05)] to-transparent pointer-events-none"
            ></div>
            <div class="relative z-10">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 class="font-syne font-bold text-xl text-white">Ma Progression Globale</h3>
                  <p class="text-[var(--bridge-text-muted)] text-sm mt-0.5">
                    {{ formation?.formateurNom }}
                  </p>
                </div>
                <div class="text-center">
                  <p
                    class="text-4xl font-mono font-black bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text text-transparent"
                  >
                    {{ getMyFormationProgress() }}%
                  </p>
                  <p
                    class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider mt-1"
                  >
                    Complété
                  </p>
                </div>
              </div>
              <div class="h-3 rounded-full bg-white/5 overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-[#C62761] to-[#F5A623] rounded-full transition-all duration-1000"
                  [style.width]="getMyFormationProgress() + '%'"
                ></div>
              </div>
            </div>
          </div>

          <!-- Custom Path Banner (Stagiaire) -->
          <div
            *ngIf="myCustomPlan"
            class="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#C62761]/10 to-transparent border border-amber-500/30 space-y-3 animate-fadein"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-2xl">⚡</span>
                <div>
                  <h4 class="font-syne font-bold text-white text-base">
                    Votre Parcours Personnalisé
                  </h4>
                  <p class="text-xs text-amber-300 font-mono">
                    Durée d'engagement : {{ myCustomPlan?.totalDurationWeeks }} semaines · Début :
                    {{ myCustomPlan?.dateDebut | date: 'dd/MM/yyyy' }}
                  </p>
                </div>
              </div>
              <span
                class="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
              >
                Programme Sur Mesure
              </span>
            </div>
            <p
              *ngIf="myCustomPlan?.noteFormateur"
              class="text-xs text-white/80 italic p-3 rounded-xl bg-white/[0.03] border border-white/5"
            >
              💬 Message du formateur : « {{ myCustomPlan?.noteFormateur }} »
            </p>
          </div>

          <!-- Phases Timeline -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-[var(--bridge-text-muted)] uppercase tracking-wider">
              Phases de formation
            </h4>
            <div
              *ngFor="let phase of formation?.phases; let i = index; let last = last"
              class="relative"
            >
              <!-- Connector -->
              <div
                *ngIf="!last"
                class="absolute left-[27px] top-[56px] w-0.5 h-[calc(100%+12px)] bg-gradient-to-b from-white/10 to-transparent z-0"
              ></div>

              <div
                class="glass-card border overflow-hidden transition-all duration-300 relative z-10"
                [class]="
                  phase.status === 'COMPLETEE'
                    ? 'border-emerald-500/20 hover:border-emerald-500/40'
                    : phase.status === 'EN_COURS'
                      ? 'border-[rgba(198,39,97,0.2)] hover:border-[rgba(198,39,97,0.4)]'
                      : 'border-[var(--bridge-border)]'
                "
              >
                <div class="p-5 flex items-center gap-4">
                  <!-- Status Circle -->
                  <div
                    class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 border-2 shadow-lg"
                    [class]="
                      phase.status === 'COMPLETEE'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10'
                        : phase.status === 'EN_COURS'
                          ? 'bg-[rgba(198,39,97,0.15)] border-[rgba(198,39,97,0.4)] text-[#C62761] shadow-[rgba(198,39,97,0.1)] animate-pulse'
                          : 'bg-white/5 border-white/10 text-white/20'
                    "
                  >
                    {{
                      phase.status === 'COMPLETEE' ? '✓' : phase.status === 'EN_COURS' ? '▶' : '🔒'
                    }}
                  </div>
                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <span class="text-[10px] text-[var(--bridge-text-muted)] font-mono"
                          >Phase {{ phase.numero }}</span
                        >
                        <h4
                          class="font-syne font-bold text-white"
                          [class]="phase.status === 'VERROUILLEE' ? 'text-white/30' : 'text-white'"
                        >
                          {{ phase.nom }}
                        </h4>
                      </div>
                      <div class="text-right flex-shrink-0">
                        <span
                          class="text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide"
                          [class]="
                            phase.status === 'COMPLETEE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : phase.status === 'EN_COURS'
                                ? 'bg-[rgba(198,39,97,0.1)] text-[#C62761] border-[rgba(198,39,97,0.2)]'
                                : 'bg-white/5 text-white/30 border-white/10'
                          "
                        >
                          {{
                            phase.status === 'COMPLETEE'
                              ? 'Complétée'
                              : phase.status === 'EN_COURS'
                                ? 'En cours'
                                : 'Verrouillée'
                          }}
                        </span>
                        <p
                          *ngIf="phase.status !== 'VERROUILLEE'"
                          class="font-mono text-xs font-bold mt-1"
                          [class]="
                            phase.status === 'COMPLETEE' ? 'text-emerald-400' : 'text-[#F5A623]'
                          "
                        >
                          {{ phase.progression }}%
                        </p>
                      </div>
                    </div>
                    <!-- Progress bar -->
                    <div
                      *ngIf="phase.status !== 'VERROUILLEE'"
                      class="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden"
                    >
                      <div
                        class="h-full rounded-full transition-all duration-1000"
                        [class]="
                          phase.status === 'COMPLETEE'
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-[#C62761] to-[#F5A623]'
                        "
                        [style.width]="phase.progression + '%'"
                      ></div>
                    </div>
                    <!-- Meta -->
                    <div
                      *ngIf="phase.status !== 'VERROUILLEE'"
                      class="flex items-center gap-4 mt-2 text-[10px] text-[var(--bridge-text-muted)]"
                    >
                      <span>📅 {{ phase.seances?.length || 0 }} séances</span>
                      <span
                        *ngIf="phase.status === 'COMPLETEE'"
                        class="text-emerald-400 font-semibold"
                        >✓ Phase complétée</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Mes Présences (Stagiaire) -->
        <div *ngIf="activeTab === 'my-presence'" class="space-y-5">
          <!-- Attendance Rate Card -->
          <div class="glass-card border border-[var(--bridge-border)] p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-syne font-bold text-lg text-white">Mon Assiduité</h3>
              <span
                class="font-mono text-2xl font-black"
                [class]="getMyAttendanceRate() >= 75 ? 'text-emerald-400' : 'text-red-400'"
                >{{ getMyAttendanceRate() }}%</span
              >
            </div>
            <div class="relative h-3 rounded-full bg-white/5 overflow-hidden mb-2">
              <div
                class="h-full rounded-full transition-all duration-1000"
                [class]="
                  getMyAttendanceRate() >= 75
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : 'bg-gradient-to-r from-red-500 to-orange-500'
                "
                [style.width]="getMyAttendanceRate() + '%'"
              ></div>
              <div class="absolute top-0 bottom-0 w-0.5 bg-white/30" style="left: 75%"></div>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-[var(--bridge-text-muted)]">Seuil requis: 75%</span>
              <span
                [class]="
                  getMyAttendanceRate() >= 75
                    ? 'text-emerald-400 font-semibold'
                    : 'text-red-400 font-semibold'
                "
              >
                {{
                  getMyAttendanceRate() >= 75 ? '✓ Éligible aux certificats' : '⚠ Seuil non atteint'
                }}
              </span>
            </div>
          </div>

          <!-- Presences per phase -->
          <!-- Custom Plan Presences per Phase (if custom plan exists) -->
          <ng-container *ngIf="myCustomPlan">
            <div
              *ngFor="let phase of myCustomPlan.phases"
              class="glass-card border border-[var(--bridge-border)] overflow-hidden rounded-2xl mb-4"
            >
              <div
                class="p-4 border-b border-[var(--bridge-border)] flex items-center justify-between flex-wrap gap-2"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-bold font-mono"
                  >
                    {{ phase.numero }}
                  </div>
                  <div>
                    <h4 class="font-syne font-bold text-white text-sm">{{ phase.nom }}</h4>
                    <p class="text-xs text-[var(--bridge-text-muted)]">
                      {{ phase.seances?.length || 0 }} séance(s) sur mesure
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-xs font-mono font-bold text-amber-400"
                    >Assiduité phase : {{ getCustomPhaseAttendance(phase) }}%</span
                  >
                </div>
              </div>

              <div class="divide-y divide-white/[0.03]">
                <div
                  *ngFor="let seance of phase.seances"
                  class="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-all"
                >
                  <div class="text-center w-12 flex-shrink-0">
                    <div class="text-[10px] font-bold uppercase text-[#F5A623]">
                      {{ formatDay(seance.date) }}
                    </div>
                    <div class="text-lg font-mono font-bold text-white">
                      {{ formatDayNum(seance.date) }}
                    </div>
                  </div>
                  <div class="w-px h-8 bg-white/10 flex-shrink-0"></div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-white">{{
                        seance.heureDebut || '—'
                      }}</span>
                      <span class="text-xs text-white/50 truncate">{{ seance.titre }}</span>
                      <span
                        class="text-[9px] px-2 py-0.5 rounded-full font-mono"
                        [class]="
                          seance.type === 'EN_LIGNE'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        "
                      >
                        {{ seance.type === 'EN_LIGNE' ? '🌐 EN LIGNE' : '🏫 PRÉSENTIEL' }}
                      </span>
                    </div>
                    <p class="text-xs text-white/40 mt-0.5">
                      📍 {{ seance.salleOuLien || 'Non définie' }} ({{ seance.dureeMinutes }} min)
                    </p>
                    <div class="flex items-center gap-3 mt-1.5">
                      <span
                        *ngIf="seance.present === true"
                        class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      >
                        ✓ Présent
                      </span>
                      <span
                        *ngIf="seance.present === false"
                        class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20"
                      >
                        ✗ Absent
                      </span>
                      <span
                        *ngIf="seance.present === undefined || seance.present === null"
                        class="text-xs text-white/30 italic"
                      >
                        {{
                          isToday(seance.date)
                            ? "⚠️ Séance aujourd'hui (En attente d'émargement formateur)"
                            : 'Non enregistrée'
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>

          <!-- Standard Presences per phase -->
          <ng-container *ngIf="!myCustomPlan">
            <div
              *ngFor="let phase of formation?.phases"
              class="glass-card border border-[var(--bridge-border)] overflow-hidden"
            >
              <div class="p-4 border-b border-[var(--bridge-border)] flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xs font-bold text-white"
                >
                  {{ phase.numero }}
                </div>
                <div>
                  <h4 class="font-syne font-bold text-white text-sm">{{ phase.nom }}</h4>
                  <p class="text-xs text-[var(--bridge-text-muted)]">
                    {{ phase.seances?.length || 0 }} séance(s)
                  </p>
                </div>
              </div>
              <div class="divide-y divide-white/[0.03]">
                <div
                  *ngFor="let seance of phase.seances"
                  class="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-all"
                >
                  <!-- Date -->
                  <div class="text-center w-12 flex-shrink-0">
                    <div class="text-[10px] font-bold uppercase text-[#F5A623]">
                      {{ formatDay(seance.date) }}
                    </div>
                    <div class="text-lg font-mono font-bold text-white">
                      {{ formatDayNum(seance.date) }}
                    </div>
                  </div>
                  <div class="w-px h-8 bg-white/10 flex-shrink-0"></div>
                  <!-- Session info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-white">{{
                        seance.heureDebut || '—'
                      }}</span>
                      <span
                        *ngIf="seance.type === 'EN_LIGNE'"
                        class="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full"
                        >🌐 EN LIGNE</span
                      >
                      <span
                        *ngIf="seance.type !== 'EN_LIGNE'"
                        class="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full"
                        >🏫 PRÉSENTIEL</span
                      >
                    </div>
                    <p class="text-xs text-white/40 mt-0.5">
                      📍 {{ seance.salle || 'Salle non définie' }}
                    </p>
                    <!-- My presence status -->
                    <div
                      *ngIf="getMyPresenceForSeance(seance) as pres"
                      class="flex items-center gap-3 mt-2"
                    >
                      <span
                        class="text-[11px] font-bold px-2.5 py-1 rounded-full border"
                        [class]="
                          pres.present
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        "
                      >
                        {{ pres.present ? '✓ Présent' : '✗ Absent' }}
                      </span>
                      <div *ngIf="pres.starRating" class="flex items-center gap-0.5">
                        <span
                          *ngFor="let s of [1, 2, 3, 4, 5]"
                          [class]="s <= pres.starRating ? 'text-[#F5A623]' : 'text-white/15'"
                          class="text-sm"
                          >★</span
                        >
                      </div>
                      <p
                        *ngIf="pres.sessionNote"
                        class="text-xs text-white/40 italic truncate max-w-xs"
                      >
                        "{{ pres.sessionNote }}"
                      </p>
                    </div>
                    <p
                      *ngIf="!getMyPresenceForSeance(seance)"
                      class="text-xs text-white/20 italic mt-1"
                    >
                      Non enregistrée
                    </p>
                  </div>
                </div>
              </div>
              <div
                *ngIf="!phase.seances || phase.seances.length === 0"
                class="p-6 text-center text-xs text-white/30 italic"
              >
                Aucune séance dans cette phase
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Tab: Mon Évaluation (Stagiaire) -->
        <div *ngIf="activeTab === 'my-eval'" class="space-y-4">
          <!-- Empty state -->
          <div
            *ngIf="getMyEvals().length === 0"
            class="glass-card border border-[var(--bridge-border)] p-16 text-center"
          >
            <div class="text-6xl mb-4">⭐</div>
            <p class="font-syne font-bold text-xl text-white">Aucune évaluation reçue</p>
            <p class="text-white/40 text-sm mt-2 max-w-sm mx-auto">
              Vos évaluations apparaîtront ici après la complétion de chaque phase. Une note ≥ 14/20
              génère un certificat blockchain.
            </p>
          </div>

          <!-- My evaluations -->
          <div
            *ngFor="let ev of getMyEvals(); let i = index"
            class="glass-card border border-[var(--bridge-border)] overflow-hidden transition-all hover:border-[rgba(198,39,97,0.3)]"
          >
            <div
              class="h-1"
              [class]="
                ev.grade >= 14
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-[#C62761] to-[#F5A623]'
              "
            ></div>
            <div class="p-6">
              <div class="flex items-start gap-5">
                <!-- Grade circle -->
                <div class="flex-shrink-0">
                  <div
                    class="w-16 h-16 rounded-2xl border-2 flex items-center justify-center"
                    [class]="
                      ev.grade >= 16
                        ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400'
                        : ev.grade >= 14
                          ? 'border-blue-500/60 bg-blue-500/10 text-blue-400'
                          : 'border-[rgba(198,39,97,0.4)] bg-[rgba(198,39,97,0.1)] text-[#C62761]'
                    "
                  >
                    <span class="font-mono font-black text-xl">{{ ev.grade }}</span>
                  </div>
                  <p class="text-[10px] text-center text-[var(--bridge-text-muted)] mt-1 font-mono">
                    /20
                  </p>
                </div>
                <!-- Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 class="font-syne font-bold text-white text-base">{{ ev.phaseTitle }}</h3>
                      <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                        Évalué par {{ ev.trainerName }}
                      </p>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <span
                        class="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                        [class]="
                          ev.grade >= 14
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-[rgba(198,39,97,0.1)] text-[#C62761] border-[rgba(198,39,97,0.2)]'
                        "
                      >
                        {{
                          ev.grade >= 16
                            ? 'Excellent'
                            : ev.grade >= 14
                              ? 'Très bien'
                              : ev.grade >= 12
                                ? 'Bien'
                                : ev.grade >= 10
                                  ? 'Passable'
                                  : 'Insuffisant'
                        }}
                      </span>
                      <p class="text-[10px] text-white/30 mt-1">
                        {{ ev.evaluationDate | date: 'dd/MM/yyyy' }}
                      </p>
                    </div>
                  </div>
                  <!-- Stars -->
                  <div class="flex items-center gap-1 mb-3">
                    <span
                      *ngFor="let s of [1, 2, 3, 4, 5]"
                      [class]="s <= gradeToStars(ev.grade) ? 'text-[#F5A623]' : 'text-white/15'"
                      class="text-lg"
                      >★</span
                    >
                    <span class="text-xs text-[var(--bridge-text-muted)] ml-1 font-mono"
                      >{{ gradeToStars(ev.grade) }}/5</span
                    >
                  </div>
                  <!-- Progress bar -->
                  <div class="h-1.5 rounded-full bg-white/5 overflow-hidden mb-3">
                    <div
                      class="h-full rounded-full transition-all duration-1000"
                      [class]="
                        ev.grade >= 14
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : 'bg-gradient-to-r from-[#C62761] to-[#F5A623]'
                      "
                      [style.width]="(ev.grade / 20) * 100 + '%'"
                    ></div>
                  </div>
                  <!-- Comment -->
                  <blockquote
                    *ngIf="ev.comment"
                    class="border-l-2 border-[rgba(198,39,97,0.4)] pl-3 text-sm text-[var(--bridge-text-muted)] italic leading-relaxed mb-3"
                  >
                    "{{ ev.comment }}"
                  </blockquote>
                  <!-- Skills -->
                  <div *ngIf="ev.skills" class="flex flex-wrap gap-1.5">
                    <span
                      *ngFor="let skill of ev.skills.split(',')"
                      class="text-[11px] bg-[rgba(245,166,35,0.08)] text-[#F5A623] px-2.5 py-1 rounded-full border border-[rgba(245,166,35,0.2)] font-medium"
                    >
                      ✦ {{ skill.trim() }}
                    </span>
                  </div>
                  <!-- Certificate notice -->
                  <div
                    *ngIf="ev.grade >= 14"
                    class="mt-4 flex items-center gap-3 p-3 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20"
                  >
                    <span class="text-emerald-400 text-lg">🏅</span>
                    <p class="text-emerald-400 text-xs font-semibold">
                      Certificat blockchain généré pour cette phase
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Paiement (Stagiaire) — Masqué si la formation fait partie d'un combo -->
        <div *ngIf="activeTab === 'paiement' && !isComboFormation" class="space-y-5">
          <!-- Loading skeleton -->
          <div *ngIf="loadingPaiements" class="space-y-3">
            <div
              *ngFor="let _ of [1, 2, 3]"
              class="glass-card border border-[var(--bridge-border)] p-5 animate-pulse"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-white/10 rounded-2xl flex-shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-white/10 rounded w-1/3"></div>
                  <div class="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
                <div class="h-8 bg-white/10 rounded-xl w-28"></div>
              </div>
            </div>
          </div>

          <ng-container *ngIf="!loadingPaiements">
            <!-- Summary bar -->
            <div class="grid grid-cols-3 gap-4">
              <div class="glass-card border border-emerald-500/20 p-4 text-center">
                <p
                  class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider mb-1"
                >
                  Payé
                </p>
                <p class="text-xl font-mono font-bold text-emerald-400">
                  {{ getTotalPaidFormation() }} TND
                </p>
              </div>
              <div class="glass-card border border-orange-500/20 p-4 text-center">
                <p
                  class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider mb-1"
                >
                  Restant
                </p>
                <p class="text-xl font-mono font-bold text-[#F5A623]">
                  {{ getTotalRemainingFormation() }} TND
                </p>
              </div>
              <div class="glass-card border border-[rgba(198,39,97,0.2)] p-4 text-center">
                <p
                  class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider mb-1"
                >
                  Total
                </p>
                <p class="text-xl font-mono font-bold text-white">
                  {{ formation?.totalPrice || 0 }} TND
                </p>
              </div>
            </div>

            <!-- No payments message -->
            <div
              *ngIf="formationPaiements.length === 0"
              class="glass-card border border-[var(--bridge-border)] p-16 text-center"
            >
              <div class="text-5xl mb-4">💳</div>
              <p class="font-syne font-bold text-lg text-white">Aucun paiement enregistré</p>
              <p class="text-[var(--bridge-text-muted)] text-sm mt-2 max-w-sm mx-auto">
                Vos échéances de paiement apparaîtront ici une fois générées par l'administration.
              </p>
            </div>

            <!-- Phase payment cards -->
            <div
              *ngIf="formationPaiements.length > 0"
              class="glass-card border border-[var(--bridge-border)] overflow-hidden"
            >
              <div
                class="p-5 border-b border-[var(--bridge-border)] flex items-center justify-between"
              >
                <h3 class="font-syne font-bold text-base text-white">💳 Paiements par phase</h3>
                <span class="text-xs text-[var(--bridge-text-muted)] font-mono"
                  >{{ formationPaiements.length }} phase(s)</span
                >
              </div>

              <div class="divide-y divide-white/[0.03]">
                <div
                  *ngFor="let p of formationPaiements"
                  class="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-all"
                  [class]="
                    p.status === 'EN_RETARD' ? 'border-l-2 border-red-500/50 bg-red-500/[0.02]' : ''
                  "
                >
                  <!-- Status icon -->
                  <div
                    class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl border"
                    [class]="
                      p.status === 'PAYE'
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : p.status === 'EN_RETARD'
                          ? 'bg-red-500/10 border-red-500/20 animate-pulse'
                          : 'bg-orange-500/10 border-orange-500/20'
                    "
                  >
                    {{ p.status === 'PAYE' ? '✅' : p.status === 'EN_RETARD' ? '⚠️' : '⏳' }}
                  </div>

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-0.5">
                      <p class="text-sm font-bold text-white">Phase {{ p.phaseNumero }}</p>
                      <span
                        class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                        [class]="
                          p.status === 'PAYE'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : p.status === 'EN_RETARD'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-orange-500/10 text-orange-400'
                        "
                      >
                        {{
                          p.status === 'PAYE'
                            ? 'Payé'
                            : p.status === 'EN_RETARD'
                              ? 'En retard'
                              : 'En attente'
                        }}
                      </span>
                    </div>
                    <p class="text-xs text-[var(--bridge-text-muted)] font-mono">
                      {{
                        p.status === 'PAYE'
                          ? 'Payé le ' + (p.datePaiement | date: 'dd/MM/yyyy')
                          : 'Échéance : ' + (p.dateEcheance | date: 'dd/MM/yyyy')
                      }}
                    </p>
                    <p
                      *ngIf="p.status !== 'PAYE'"
                      class="text-[10px] mt-0.5"
                      [class]="p.status === 'EN_RETARD' ? 'text-red-400' : 'text-orange-400'"
                    >
                      {{ p.methode || 'Méthode non définie' }}
                    </p>
                  </div>

                  <!-- Amount + action -->
                  <div class="flex-shrink-0 flex flex-col items-end gap-2">
                    <p class="font-mono font-bold text-white text-lg">
                      {{ p.montant }}
                      <span class="text-xs text-[var(--bridge-text-muted)]">TND</span>
                    </p>
                    <button
                      *ngIf="p.status !== 'PAYE'"
                      (click)="payPhaseWithStripe(p)"
                      [disabled]="payingPhaseId === p.id"
                      class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-[rgba(198,39,97,0.2)]"
                    >
                      <span
                        *ngIf="payingPhaseId === p.id"
                        class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
                      ></span>
                      {{ payingPhaseId === p.id ? 'Chargement...' : '💳 Payer Stripe' }}
                    </button>
                    <span
                      *ngIf="p.status === 'PAYE'"
                      class="text-[10px] px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-semibold"
                      >✓ Débloqué</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Phases without payment yet (from formation) -->
            <div *ngIf="formationPaiements.length === 0 && formation?.phases" class="space-y-3">
              <div
                *ngFor="let phase of formation?.phases"
                class="glass-card border border-[var(--bridge-border)] p-5 flex items-center gap-4"
              >
                <div
                  class="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold border-2 flex-shrink-0"
                  [class]="
                    phase.status === 'COMPLETEE'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : phase.status === 'EN_COURS'
                        ? 'bg-[rgba(198,39,97,0.15)] border-[rgba(198,39,97,0.4)] text-[#C62761]'
                        : 'bg-white/5 border-white/10 text-white/20'
                  "
                >
                  {{
                    phase.status === 'COMPLETEE' ? '✓' : phase.status === 'EN_COURS' ? '▶' : '🔒'
                  }}
                </div>
                <div class="flex-1">
                  <p
                    class="font-syne font-bold text-sm"
                    [class]="phase.status === 'VERROUILLEE' ? 'text-white/30' : 'text-white'"
                  >
                    Phase {{ phase.numero }} — {{ phase.nom }}
                  </p>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                    {{ phase.description }}
                  </p>
                </div>
                <span
                  class="text-[10px] px-3 py-1.5 bg-white/5 text-white/40 border border-white/10 rounded-xl font-mono"
                  >Prix à définir</span
                >
              </div>
            </div>
          </ng-container>
        </div>

        <!-- ══ FORMATEUR / ADMIN TABS ══ -->

        <!-- Tab: Phases & Séances -->
        <div *ngIf="activeTab === 'phases'" class="space-y-4">
          <div
            *ngFor="let phase of formation.phases; let pi = index"
            class="glass-card border border-[var(--bridge-border)] overflow-hidden transition-all duration-300 hover:border-[rgba(198,39,97,0.2)]"
            [style.animation-delay]="pi * 80 + 'ms'"
            style="animation: fadeSlideIn 0.4s ease both"
          >
            <!-- Phase Header -->
            <button
              (click)="togglePhase(phase.id)"
              class="w-full flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors text-left"
            >
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm flex-shrink-0"
                [class]="getPhaseStatusBg(phase.status)"
              >
                {{ phase.numero }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-syne font-bold text-white text-sm">{{ phase.nom }}</h3>
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border"
                    [class]="getPhaseStatusBadge(phase.status)"
                  >
                    {{ getPhaseStatusText(phase.status) }}
                  </span>
                </div>
                <p class="text-xs text-white/40 mt-0.5 line-clamp-1">{{ phase.description }}</p>
              </div>
              <div class="flex items-center gap-4 flex-shrink-0">
                <div class="text-right hidden sm:block">
                  <p class="text-xs text-white/40">
                    {{ phase.seances ? phase.seances.length : 0 }} séances
                  </p>
                  <div class="flex items-center gap-2 mt-1">
                    <div class="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full bg-gradient-to-r from-[#C62761] to-[#F5A623] transition-all duration-700"
                        [style.width]="(phase.progression || 0) + '%'"
                      ></div>
                    </div>
                    <span class="text-[10px] font-mono text-white/40"
                      >{{ phase.progression }}%</span
                    >
                  </div>
                </div>
                <!-- Unlock phase button for formateur/admin -->
                <button
                  *ngIf="canManage && phase.status === 'VERROUILLEE'"
                  (click)="$event.stopPropagation(); unlockPhase(phase.id)"
                  class="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs rounded-xl hover:opacity-90 transition-all shadow-md"
                >
                  🔓 Débloquer la Phase
                </button>
                <span class="text-white/30 text-lg">{{
                  expandedPhase === phase.id ? '▲' : '▼'
                }}</span>
              </div>
            </button>

            <!-- Phase Expanded: Sessions -->
            <div
              *ngIf="expandedPhase === phase.id"
              class="border-t border-white/5 p-5 space-y-3 bg-black/20"
            >
              <p class="text-xs text-white/50 leading-relaxed mb-4">{{ phase.description }}</p>
              <div *ngIf="phase.seances && phase.seances.length > 0" class="space-y-3">
                <h4 class="text-[11px] text-white/40 uppercase tracking-widest font-semibold">
                  Séances
                </h4>
                <div
                  *ngFor="let seance of phase.seances; let si = index"
                  class="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-[rgba(198,39,97,0.2)] transition-all group"
                >
                  <div class="flex-shrink-0 text-center w-14">
                    <div class="text-[10px] font-bold uppercase text-[#F5A623]">
                      {{ formatDay(seance.date) }}
                    </div>
                    <div class="text-lg font-mono font-bold text-white">
                      {{ formatDayNum(seance.date) }}
                    </div>
                  </div>
                  <div class="w-px h-8 bg-white/10 flex-shrink-0"></div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-mono font-bold text-[#F5A623]">{{
                        seance.heureDebut
                      }}</span>
                      <span class="text-white/20">·</span>
                      <span class="text-xs text-white/40">{{ seance.duree }}</span>
                      <span
                        *ngIf="seance.type === 'EN_LIGNE'"
                        class="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-bold"
                      >
                        🌐 EN LIGNE
                      </span>
                      <span
                        *ngIf="seance.status === 'CLOTUREE'"
                        class="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold"
                      >
                        ✓ CLÔTURÉE
                      </span>
                    </div>
                    <p class="text-xs text-white/50 mt-0.5">📍 {{ seance.salle }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-white/30 font-mono">
                      {{ getPresenceCount(seance) }}/{{ seance.presences?.length || 0 }} présents
                    </span>
                    <!-- Today check for attendance -->
                    <ng-container *ngIf="canManage">
                      <button
                        *ngIf="isToday(seance.date) && seance.status !== 'CLOTUREE'"
                        (click)="openAttendance(seance)"
                        class="px-3 py-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-[#C62761] to-[#F5A623] rounded-lg transition-all shadow-md"
                      >
                        📋 Faire l'Appel
                      </button>
                      <button
                        *ngIf="
                          isToday(seance.date) &&
                          seance.status !== 'CLOTUREE' &&
                          seance.presences &&
                          seance.presences.length > 0
                        "
                        (click)="closeSession(seance.id)"
                        class="px-3 py-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all shadow-md"
                      >
                        🔒 Clôturer séance
                      </button>
                      <span
                        *ngIf="!isToday(seance.date) && seance.status !== 'CLOTUREE'"
                        class="text-[10px] text-white/40 italic bg-white/5 px-2.5 py-1 rounded-lg border border-white/5"
                      >
                        Appel réservé le jour J
                      </span>
                    </ng-container>
                    <span
                      *ngIf="seance.status === 'CLOTUREE'"
                      class="text-[10px] px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-semibold"
                      >Clôturée</span
                    >
                  </div>
                </div>
              </div>
              <div
                *ngIf="!phase.seances || phase.seances.length === 0"
                class="text-center py-6 text-white/30 text-xs"
              >
                📅 Aucune séance dans cette phase
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Stagiaires Standards -->
        <div *ngIf="activeTab === 'stagiaires'" class="space-y-4">
          <div *ngIf="standardEnrollments.length > 0">
            <!-- Search Bar -->
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
              <input
                [(ngModel)]="searchQuery"
                type="text"
                placeholder="Rechercher un stagiaire standard..."
                class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors"
              />
            </div>
            <br />
            <!-- Student Cards -->
            <div class="grid md:grid-cols-2 gap-4">
              <div
                *ngFor="let e of filteredStandardEnrollments; let i = index"
                class="glass-card border border-[var(--bridge-border)] p-5 hover:border-[rgba(198,39,97,0.3)] transition-all group"
                [style.animation-delay]="i * 60 + 'ms'"
                style="animation: fadeSlideIn 0.4s ease both"
              >
                <div class="flex items-center gap-4">
                  <!-- Avatar -->
                  <div
                    class="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden ring-2 ring-white/10 group-hover:ring-[#C62761]/40 transition-all"
                  >
                    <img
                      *ngIf="e.studentAvatar"
                      [src]="e.studentAvatar"
                      class="w-full h-full object-cover"
                      [alt]="e.studentFirstName"
                    />
                    <div
                      *ngIf="!e.studentAvatar"
                      class="w-full h-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center font-bold text-white text-sm"
                    >
                      {{ e.studentFirstName[0] }}{{ e.studentLastName[0] }}
                    </div>
                  </div>
                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="font-semibold text-white text-sm">
                        {{ e.studentFirstName }} {{ e.studentLastName }}
                      </p>
                      <span
                        class="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase"
                      >
                        Standard
                      </span>
                    </div>
                    <p class="text-xs text-white/40 truncate">{{ e.studentEmail }}</p>
                    <p class="text-[10px] text-white/30 mt-1">
                      Inscrit le {{ e.enrollmentDate | date: 'd MMM y' }}
                    </p>
                  </div>
                  <!-- Actions -->
                  <div class="flex flex-col items-end gap-2">
                    <button
                      *ngIf="canManage && canEvaluate()"
                      (click)="openEvalForStudent(e)"
                      class="px-3 py-1.5 text-[11px] font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      ⭐ Évaluer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            *ngIf="standardEnrollments.length === 0"
            class="glass-card border border-[var(--bridge-border)] p-12 text-center"
          >
            <div class="text-5xl mb-4">👥</div>
            <p class="font-syne font-bold text-lg text-white">Aucun stagiaire standard inscrit</p>
            <p class="text-white/40 text-sm mt-2">
              Les inscriptions au parcours standard apparaîtront ici.
            </p>
          </div>
        </div>

        <!-- ══ TAB: PARCOURS SUR MESURE (INSCRIPTIONS PERSONNALISÉES) ══ -->
        <div *ngIf="activeTab === 'custom-enrollments'" class="space-y-6 animate-fadein">
          <!-- Header Banner -->
          <div
            class="glass-card border border-amber-500/20 p-6 rounded-2xl relative overflow-hidden bg-gradient-to-r from-amber-500/5 via-transparent to-[#C62761]/5"
          >
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="flex items-center gap-3.5">
                <div
                  class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-[#F5A623]/20 border border-amber-500/30 flex items-center justify-center text-xl flex-shrink-0 shadow-lg"
                >
                  ⚡
                </div>
                <div>
                  <h3 class="font-syne font-bold text-lg text-white flex items-center gap-2">
                    Parcours & Inscriptions Personnalisées
                    <span
                      class="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono"
                    >
                      {{ customEnrollments.length }} stagiaire(s)
                    </span>
                  </h3>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-1">
                    Gérez et concevez les phases et séances sur mesure selon la durée d'engagement
                    choisie par chaque stagiaire.
                  </p>
                </div>
              </div>

              <!-- Search & Filter Controls -->
              <div class="flex items-center gap-2 flex-wrap">
                <div class="relative min-w-[200px]">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs"
                    >🔍</span
                  >
                  <input
                    [(ngModel)]="customSearchQuery"
                    type="text"
                    placeholder="Chercher stagiaire..."
                    class="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <select
                  [(ngModel)]="customPlanStatusFilter"
                  class="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="APPROVED">Validés</option>
                  <option value="PENDING">En attente</option>
                  <option value="REJECTED">Refusés</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Custom Enrollments List -->
          <div *ngIf="filteredCustomEnrollments.length > 0" class="space-y-4">
            <div
              *ngFor="let e of filteredCustomEnrollments; let i = index"
              class="glass-card border border-[var(--bridge-border)] hover:border-amber-500/30 transition-all rounded-2xl overflow-hidden"
              [style.animation-delay]="i * 50 + 'ms'"
              style="animation: fadeSlideIn 0.35s ease both"
            >
              <!-- Card Header Bar -->
              <div class="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <!-- Stagiaire Info -->
                <div class="flex items-start gap-4">
                  <div
                    class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-[#C62761]/20 border border-white/10 flex items-center justify-center font-bold text-amber-400 text-sm overflow-hidden flex-shrink-0 shadow-md"
                  >
                    <img
                      *ngIf="e.studentAvatar"
                      [src]="e.studentAvatar"
                      class="w-full h-full object-cover"
                      [alt]="e.studentFirstName"
                    />
                    <span *ngIf="!e.studentAvatar"
                      >{{ e.studentFirstName[0] }}{{ e.studentLastName[0] }}</span
                    >
                  </div>
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <h4 class="font-syne font-bold text-white text-base">
                        {{ e.studentFirstName }} {{ e.studentLastName }}
                      </h4>
                      <!-- Status Badge -->
                      <span
                        class="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                        [class]="
                          e.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : e.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                        "
                      >
                        {{
                          e.status === 'APPROVED'
                            ? '✓ Validé'
                            : e.status === 'PENDING'
                              ? '⏳ En attente'
                              : '✕ Refusé'
                        }}
                      </span>
                      <!-- Plan Status Badge -->
                      <span
                        *ngIf="e.customPlan"
                        class="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1"
                      >
                        ✨ Planning configuré ({{ getPlanPhasesCount(e.customPlan) }} phases,
                        {{ getPlanSessionsCount(e.customPlan) }} séances)
                      </span>
                      <span
                        *ngIf="!e.customPlan && e.status === 'APPROVED'"
                        class="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"
                      >
                        ⚠️ À planifier
                      </span>
                    </div>
                    <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                      {{ e.studentEmail }} · Demande du {{ e.enrollmentDate | date: 'd MMM y' }}
                    </p>
                  </div>
                </div>

                <!-- Engagement Duration & Actions -->
                <div class="flex items-center gap-3 flex-wrap lg:justify-end">
                  <!-- Duration chip -->
                  <div
                    class="text-center px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <p class="text-[10px] text-white/40 uppercase tracking-wider">Durée choisie</p>
                    <p class="text-sm font-mono font-bold text-[#F5A623]">
                      {{ e.customDurationWeeks }} semaines
                    </p>
                  </div>

                  <!-- Actions buttons -->
                  <button
                    *ngIf="e.customPlan"
                    (click)="toggleCustomPlanPreview(e.id)"
                    class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{{
                      expandedCustomPlanEnrollmentId === e.id
                        ? '▲ Masquer plan'
                        : '👁️ Voir planning'
                    }}</span>
                  </button>

                  <button
                    *ngIf="canManage"
                    (click)="openCustomPlanWizard(e)"
                    class="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-[#C62761] text-white hover:opacity-90 transition-all shadow-md shadow-amber-500/10 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{{
                      e.customPlan ? '✏️ Modifier le parcours' : '✨ Configurer le parcours'
                    }}</span>
                  </button>
                </div>
              </div>

              <!-- Motivation message (if present) -->
              <div
                *ngIf="e.motivationMessage"
                class="mx-5 mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5"
              >
                <span class="text-amber-400 text-xs mt-0.5">💬</span>
                <div>
                  <p class="text-[10px] text-white/40 uppercase font-semibold">
                    Motivation / Contraintes du stagiaire :
                  </p>
                  <p class="text-xs text-white/70 italic mt-0.5">« {{ e.motivationMessage }} »</p>
                </div>
              </div>

              <!-- Interactive Accordion Preview: Custom Phases & Sessions Timeline -->
              <div
                *ngIf="expandedCustomPlanEnrollmentId === e.id && e.customPlan"
                class="border-t border-white/5 bg-black/25 p-5 space-y-4 animate-fadein"
              >
                <div class="flex items-center justify-between">
                  <h5 class="font-syne font-bold text-sm text-white flex items-center gap-2">
                    <span>📅 Programme sur mesure ({{ e.customDurationWeeks }} semaines)</span>
                    <span
                      *ngIf="getParsedPlan(e)?.dateDebut"
                      class="text-xs text-white/40 font-mono font-normal"
                    >
                      · Début le {{ getParsedPlan(e)?.dateDebut | date: 'dd/MM/yyyy' }}
                    </span>
                  </h5>
                  <span class="text-[10px] text-emerald-400 font-mono"
                    >Dernière mise à jour : {{ getParsedPlan(e)?.updatedAt | date: 'short' }}</span
                  >
                </div>

                <!-- Note from formateur -->
                <div
                  *ngIf="getParsedPlan(e)?.noteFormateur"
                  class="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200"
                >
                  <span class="font-bold text-purple-300">Note du formateur : </span>
                  {{ getParsedPlan(e)?.noteFormateur }}
                </div>

                <!-- Phases Timeline -->
                <div class="space-y-3">
                  <div
                    *ngFor="let p of getParsedPlan(e)?.phases; let pi = index"
                    class="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs flex items-center justify-center"
                        >
                          {{ p.numero }}
                        </div>
                        <div>
                          <p class="font-syne font-bold text-white text-xs">{{ p.nom }}</p>
                          <p class="text-[11px] text-white/50">{{ p.description }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Phase Metrics & Goals -->
                    <div
                      class="flex items-center justify-between flex-wrap gap-2 text-[10px] font-mono text-white/50 bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/5"
                    >
                      <span>⏱️ {{ p.dureeSemaines }} sem.</span>
                      <span
                        >📊 Assiduité actuelle :
                        <strong class="text-amber-400 font-bold"
                          >{{ getCustomPhaseAttendance(p) }}%</strong
                        >
                        (min: {{ p.minimumAttendance }}%)</span
                      >
                      <span
                        >📈 Progression phase :
                        <strong class="text-emerald-400 font-bold"
                          >{{ getCustomPhaseProgression(p) }}%</strong
                        ></span
                      >
                      <span>🎯 Note min : {{ p.minimumGrade }}/20</span>
                    </div>

                    <!-- Sessions list with attendance tracking -->
                    <div
                      *ngIf="p.seances && p.seances.length > 0"
                      class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-white/5"
                    >
                      <div
                        *ngFor="let s of p.seances; let si = index"
                        class="p-3.5 rounded-xl border transition-all space-y-2.5 relative"
                        [ngClass]="{
                          'bg-emerald-500/[0.04] border-emerald-500/30': s.present === true,
                          'bg-red-500/[0.04] border-red-500/30': s.present === false,
                          'bg-amber-500/[0.05] border-amber-500/40 shadow-[0_0_20px_rgba(245,166,35,0.1)] ring-1 ring-amber-500/30':
                            isToday(s.date) && s.present !== true && s.present !== false,
                          'bg-white/[0.02] border-white/5':
                            !isToday(s.date) && s.present !== true && s.present !== false,
                        }"
                      >
                        <!-- Header of session card -->
                        <div class="flex items-center justify-between">
                          <span
                            class="font-bold font-mono text-xs flex items-center gap-1.5"
                            [class]="isToday(s.date) ? 'text-[#F5A623]' : 'text-white/70'"
                          >
                            {{ s.date | date: 'dd/MM' }} · {{ s.heureDebut }}
                            <span
                              *ngIf="isToday(s.date)"
                              class="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-sans font-extrabold uppercase animate-pulse"
                            >
                              Aujourd'hui
                            </span>
                          </span>
                          <span
                            class="text-[9px] px-1.5 py-0.5 rounded font-mono"
                            [class]="
                              s.type === 'EN_LIGNE'
                                ? 'bg-blue-500/10 text-blue-400'
                                : 'bg-emerald-500/10 text-emerald-400'
                            "
                          >
                            {{ s.type === 'EN_LIGNE' ? '🌐 En ligne' : '📍 Présentiel' }}
                          </span>
                        </div>

                        <div>
                          <p class="font-semibold text-white text-xs truncate">{{ s.titre }}</p>
                          <p class="text-[10px] text-white/40 truncate">
                            {{ s.salleOuLien }} ({{ s.dureeMinutes }} min)
                          </p>
                        </div>

                        <!-- Attendance marking actions & status -->
                        <div
                          class="pt-2 border-t border-white/5 flex items-center justify-between gap-2"
                        >
                          <!-- Status Badge if marked or pending -->
                          <div>
                            <span
                              *ngIf="s.present === true"
                              class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1"
                            >
                              ✓ Présent
                            </span>
                            <span
                              *ngIf="s.present === false"
                              class="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30 flex items-center gap-1"
                            >
                              ✕ Absent
                            </span>
                            <span
                              *ngIf="s.present === undefined || s.present === null"
                              class="text-[10px] text-white/40 italic"
                            >
                              {{
                                isToday(s.date)
                                  ? '⚠️ À émarger'
                                  : isPast(s.date)
                                    ? 'Non émargé'
                                    : 'À venir'
                              }}
                            </span>
                          </div>

                          <!-- Action buttons for Trainer: displayed for today's and past sessions -->
                          <div
                            *ngIf="canManage && (isToday(s.date) || isPast(s.date))"
                            class="flex items-center gap-1.5 ml-auto"
                          >
                            <button
                              type="button"
                              (click)="
                                $event.stopPropagation();
                                markCustomSessionAttendance(e, pi, si, true)
                              "
                              [title]="'Marquer ' + e.studentFirstName + ' Présent'"
                              class="px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 border"
                              [ngClass]="{
                                'bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/30':
                                  s.present === true,
                                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25':
                                  s.present !== true,
                              }"
                            >
                              ✓ Présent
                            </button>
                            <button
                              type="button"
                              (click)="
                                $event.stopPropagation();
                                markCustomSessionAttendance(e, pi, si, false)
                              "
                              [title]="'Marquer ' + e.studentFirstName + ' Absent'"
                              class="px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 border"
                              [ngClass]="{
                                'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/30':
                                  s.present === false,
                                'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/25':
                                  s.present !== false,
                              }"
                            >
                              ✕ Absent
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            *ngIf="filteredCustomEnrollments.length === 0"
            class="glass-card border border-[var(--bridge-border)] p-12 text-center rounded-2xl"
          >
            <div class="text-5xl mb-4">⚡</div>
            <p class="font-syne font-bold text-lg text-white">Aucun parcours personnalisé trouvé</p>
            <p class="text-white/40 text-sm mt-2">
              Les stagiaires choisissant une durée de formation sur mesure apparaîtront dans cet
              espace.
            </p>
          </div>
        </div>

        <!-- Tab: Évaluations -->
        <div *ngIf="activeTab === 'evaluations'" class="space-y-4">
          <div *ngIf="phaseEvaluations.length > 0" class="space-y-3">
            <div
              *ngFor="let ev of phaseEvaluations; let i = index"
              class="glass-card border border-[var(--bridge-border)] p-5 hover:border-[rgba(198,39,97,0.2)] transition-all"
              [style.animation-delay]="i * 60 + 'ms'"
              style="animation: fadeSlideIn 0.4s ease both"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div
                    class="w-10 h-10 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-white text-sm font-bold overflow-hidden"
                  >
                    <img
                      *ngIf="ev.studentAvatar"
                      [src]="ev.studentAvatar"
                      class="w-full h-full object-cover"
                    />
                    <span *ngIf="!ev.studentAvatar"
                      >{{ ev.studentFirstName?.[0] }}{{ ev.studentLastName?.[0] }}</span
                    >
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-white">
                      {{ ev.studentFirstName }} {{ ev.studentLastName }}
                    </p>
                    <p class="text-xs text-white/40">
                      {{ ev.phaseTitle }} · {{ ev.evaluationDate | date: 'd MMM y' }}
                    </p>
                    <p class="text-xs text-white/30 mt-1 max-w-sm line-clamp-1">{{ ev.comment }}</p>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <span
                    class="text-lg font-mono font-bold px-4 py-2 rounded-xl"
                    [class]="getGradeClass(ev.grade)"
                  >
                    {{ ev.grade }}/20
                  </span>
                  <p class="text-[10px] text-white/30 mt-1">{{ getGradeLabel(ev.grade) }}</p>
                </div>
              </div>
              <div
                *ngIf="ev.skills"
                class="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-1.5"
              >
                <span
                  *ngFor="let skill of ev.skills.split(',')"
                  class="text-[10px] px-2 py-0.5 bg-[rgba(245,166,35,0.1)] text-[#F5A623] border border-[rgba(245,166,35,0.2)] rounded-full font-medium"
                >
                  {{ skill.trim() }}
                </span>
              </div>
            </div>
          </div>
          <div
            *ngIf="phaseEvaluations.length === 0"
            class="glass-card border border-[var(--bridge-border)] p-12 text-center"
          >
            <div class="text-5xl mb-4">📝</div>
            <p class="font-syne font-bold text-lg text-white">Aucune évaluation saisie</p>
            <p class="text-white/40 text-sm mt-2">
              Commencez à évaluer vos stagiaires pour chaque phase.
            </p>
          </div>
        </div>

        <!-- CTA Banner: Evaluate (if formation terminée) -->
        <div
          *ngIf="canEvaluate() && canManage && activeTab !== 'evaluations'"
          class="glass-card border border-purple-500/30 bg-purple-500/5 p-6 flex flex-col sm:flex-row items-center gap-4"
        >
          <div class="flex items-center gap-4 flex-1">
            <span class="text-3xl">🏅</span>
            <div>
              <p class="font-syne font-bold text-white">
                Formation terminée — Évaluations disponibles
              </p>
              <p class="text-sm text-white/50 mt-1">
                Toutes les phases sont complètes. Vous pouvez maintenant évaluer chaque stagiaire.
                Une note ≥ 14/20 génèrera automatiquement le certificat blockchain.
              </p>
            </div>
          </div>
          <button
            (click)="activeTab = 'evaluations'"
            class="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)]"
          >
            Voir les Évaluations →
          </button>
        </div>
      </ng-container>

      <!-- ─── Inline : Feuille de Présence (avec slide animation) ─── -->
      <div
        *ngIf="showAttendanceModal"
        class="bridge-card overflow-hidden inline-view-card presence-slide-panel shadow-2xl"
      >
        <div class="h-1 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623]"></div>
        <!-- Header -->
        <div
          class="flex items-center justify-between px-5 py-4 border-b border-[var(--bridge-border)]"
        >
          <div>
            <h3 class="font-syne font-bold text-sm text-white">📋 Feuille de Présence — Appel</h3>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
              {{ selectedSeance?.formationNom }} ·
              {{ selectedSeance?.date | date: 'EEEE d MMMM y' }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div
              class="flex items-center gap-2 px-3 py-1.5 rounded-2xl border bg-white/5 border-white/10"
            >
              <span class="text-xl font-mono font-bold text-emerald-400">{{
                getPresentInModal()
              }}</span>
              <span class="text-white/30">/</span>
              <span class="text-base font-mono text-white/50">{{ activePresences.length }}</span>
              <p class="text-[9px] text-white/40 uppercase tracking-wider ml-1">présents</p>
            </div>
            <button
              (click)="closeAttendance()"
              class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/5 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
        <!-- Presence list -->
        <div class="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          <div
            *ngFor="let p of activePresences; let i = index"
            class="p-4 rounded-xl border transition-all"
            [class]="getPresenceCardClass(p)"
            [style.animation-delay]="i * 40 + 'ms'"
            style="animation: fadeSlideIn 0.3s ease both"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                >
                  {{ p.stagiaireNom?.[0] || 'S' }}
                </div>
                <div>
                  <p class="font-semibold text-white text-sm">{{ p.stagiaireNom }}</p>
                  <div class="flex items-center gap-1 mt-1" *ngIf="p.present">
                    <button
                      *ngFor="let star of [1, 2, 3, 4, 5]"
                      (click)="p.starRating = star"
                      class="text-base transition-transform hover:scale-125 focus:outline-none"
                      [class]="(p.starRating || 0) >= star ? 'text-[#F5A623]' : 'text-white/15'"
                    >
                      ★
                    </button>
                  </div>
                </div>
              </div>
              <!-- 3 States Buttons -->
              <div class="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  (click)="setPresenceStatus(p, 'PRESENT')"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  [class]="
                    p.present && !isRetard(p)
                      ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                      : 'bg-white/5 text-white/50 hover:bg-emerald-500/20 hover:text-emerald-400'
                  "
                >
                  ✓ Présent
                </button>
                <button
                  (click)="setPresenceStatus(p, 'RETARD')"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  [class]="
                    p.present && isRetard(p)
                      ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,166,35,0.4)]'
                      : 'bg-white/5 text-white/50 hover:bg-amber-500/20 hover:text-amber-400'
                  "
                >
                  ⏰ Retard
                </button>
                <button
                  (click)="setPresenceStatus(p, 'ABSENT')"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  [class]="
                    !p.present
                      ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                      : 'bg-white/5 text-white/50 hover:bg-rose-500/20 hover:text-rose-400'
                  "
                >
                  ✗ Absent
                </button>
              </div>
            </div>
            <div class="mt-2.5 pt-2 border-t border-white/5" *ngIf="p.present">
              <input
                [(ngModel)]="p.sessionNote"
                type="text"
                class="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C62761]/50 transition-colors"
                placeholder="Remarque ou appréciation rapide..."
              />
            </div>
          </div>
        </div>
        <!-- Footer -->
        <div class="flex gap-3 px-5 py-4 border-t border-[var(--bridge-border)]">
          <button
            (click)="closeAttendance()"
            class="py-2.5 px-5 bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-sm rounded-xl border border-white/5 transition-all"
          >
            Annuler
          </button>
          <button
            (click)="saveAttendance()"
            [disabled]="savingAttendance"
            class="flex-1 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-40 transition-all"
          >
            {{
              savingAttendance
                ? 'Enregistrement...'
                : "Valider l'Appel (" + getPresentInModal() + '/' + activePresences.length + ')'
            }}
          </button>
        </div>
      </div>

      <!-- ─── Inline : Évaluation Stagiaire ─── -->
      <div
        *ngIf="showEvalModal && selectedEnrollment"
        class="bridge-card overflow-hidden inline-view-card"
      >
        <div class="h-1 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623]"></div>
        <!-- Header -->
        <div
          class="flex items-center justify-between px-5 py-4 border-b border-[var(--bridge-border)]"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-base"
            >
              ⭐
            </div>
            <div>
              <h3 class="font-syne font-bold text-sm text-white">Évaluation Stagiaire</h3>
              <p class="text-[10px] text-[var(--bridge-text-muted)] mt-0.5">
                Saisie des notes &amp; appréciation
              </p>
            </div>
          </div>
          <button
            (click)="closeEvalModal()"
            class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/5 text-sm"
          >
            ✕
          </button>
        </div>
        <!-- Body (2-col on md+) -->
        <div class="p-5 space-y-4">
          <!-- Student Info -->
          <div class="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div
              class="w-12 h-12 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0"
            >
              <img
                *ngIf="selectedEnrollment.studentAvatar"
                [src]="selectedEnrollment.studentAvatar"
                class="w-full h-full object-cover"
              />
              <span *ngIf="!selectedEnrollment.studentAvatar">{{
                selectedEnrollment.studentFirstName?.[0] || 'S'
              }}</span>
            </div>
            <div>
              <p class="font-semibold text-white">
                {{ selectedEnrollment.studentFirstName }} {{ selectedEnrollment.studentLastName }}
              </p>
              <p class="text-xs text-[var(--bridge-text-muted)]">
                {{ selectedEnrollment.studentEmail }}
              </p>
            </div>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-4">
              <!-- Phase -->
              <div>
                <label
                  class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold"
                  >Phase évaluée</label
                >
                <select
                  [(ngModel)]="evalForm.phaseId"
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors"
                >
                  <option value="" class="bg-[#10102A]">Sélectionner une phase par nom...</option>
                  <option
                    *ngFor="let phase of formation!.phases"
                    [value]="phase.id"
                    class="bg-[#10102A]"
                  >
                    Phase {{ phase.numero }} — {{ phase.nom }}
                  </option>
                </select>
              </div>
              <!-- Stars -->
              <div>
                <label
                  class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold font-syne"
                  >Étoiles</label
                >
                <div class="flex items-center gap-2">
                  <button
                    *ngFor="let star of [1, 2, 3, 4, 5]"
                    (click)="evalStarRating = star"
                    class="text-2xl transition-transform hover:scale-125 focus:outline-none"
                    [class]="(evalStarRating || 5) >= star ? 'text-[#F5A623]' : 'text-white/20'"
                  >
                    ★
                  </button>
                  <span class="text-xs text-white/40 font-mono ml-2">{{ evalStarRating }}/5</span>
                </div>
              </div>
              <!-- Grade -->
              <div>
                <label
                  class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold font-syne"
                  >Note (/20)</label
                >
                <div class="flex items-center gap-4">
                  <input
                    [(ngModel)]="evalForm.grade"
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    class="flex-1 accent-[#C62761]"
                  />
                  <span
                    class="text-2xl font-mono font-bold w-16 text-right"
                    [class]="getGradeClass(evalForm.grade)"
                    >{{ evalForm.grade }}</span
                  >
                </div>
                <div class="flex justify-between text-[10px] text-white/30 mt-1 px-1">
                  <span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <!-- Skills -->
              <div>
                <label
                  class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold"
                  >Compétences acquises</label
                >
                <input
                  [(ngModel)]="evalForm.skills"
                  type="text"
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors"
                  placeholder="Ex: Angular, TypeScript, RxJS"
                />
              </div>
              <!-- Comment -->
              <div>
                <label
                  class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold"
                  >Commentaire &amp; Appréciation</label
                >
                <textarea
                  [(ngModel)]="evalForm.comment"
                  rows="4"
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors resize-none"
                  placeholder="Appréciation générale sur la progression..."
                ></textarea>
              </div>
              <!-- Certificate Notice -->
              <div
                *ngIf="evalForm.grade >= 14"
                class="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
              >
                <span class="text-emerald-400 text-xl">🏅</span>
                <div>
                  <p class="text-emerald-400 text-sm font-semibold">
                    Certificat Blockchain sera généré
                  </p>
                  <p class="text-emerald-400/70 text-xs">
                    Note ≥ 14/20 — Certificat envoyé par email automatiquement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Footer -->
        <div class="flex gap-3 px-5 py-4 border-t border-[var(--bridge-border)]">
          <button
            (click)="closeEvalModal()"
            class="py-2.5 px-5 bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-sm rounded-xl border border-white/5 transition-all cursor-pointer"
          >
            Annuler
          </button>
          <button
            (click)="submitEvaluation()"
            [disabled]="!evalForm.phaseId || evalForm.grade === null || submittingEval"
            class="flex-1 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {{ submittingEval ? '✓ Enregistrement...' : 'Enregistrer l'évaluation' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════════════ -->
    <!-- ═══ MODAL ASSISTANT MULTI-ÉTAPES : PARCOURS SUR MESURE (WIZARD) ═════════════ -->
    <!-- ═══════════════════════════════════════════════════════════════════════════════ -->
    <div
      *ngIf="showCustomPlanWizard && selectedCustomEnrollment"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadein overflow-y-auto"
    >
      <div
        class="glass-card border border-amber-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(245,166,35,0.15)] bg-[var(--bridge-card-bg,#12121e)] my-auto"
      >
        <!-- Modal Header -->
        <div
          class="p-6 border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-transparent to-[#C62761]/10 flex items-center justify-between flex-shrink-0"
        >
          <div class="flex items-center gap-3.5">
            <div
              class="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-[#F5A623]/20 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400"
            >
              ⚡
            </div>
            <div>
              <h3 class="font-syne font-bold text-lg text-white">
                Programme Personnalisé — {{ selectedCustomEnrollment.studentFirstName }}
                {{ selectedCustomEnrollment.studentLastName }}
              </h3>
              <p class="text-xs text-[var(--bridge-text-muted)]">
                Engagement :
                <span class="text-amber-400 font-bold font-mono"
                  >{{ selectedCustomEnrollment.customDurationWeeks }} semaines</span
                >
                · Formation : {{ formation?.nom }}
              </p>
            </div>
          </div>
          <button
            (click)="closeCustomPlanWizard()"
            class="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center text-sm transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Stepper Navigation Bar -->
        <div class="px-6 py-3 border-b border-white/5 bg-white/[0.02] flex-shrink-0">
          <div class="grid grid-cols-4 gap-2">
            <div
              *ngFor="
                let step of [
                  { num: 1, label: 'Paramètres' },
                  { num: 2, label: 'Phases' },
                  { num: 3, label: 'Séances' },
                  { num: 4, label: 'Récap & Envoi' },
                ]
              "
              class="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition-all"
              [class]="
                wizardStep === step.num
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : wizardStep > step.num
                    ? 'text-emerald-400 bg-emerald-500/5'
                    : 'text-white/30'
              "
            >
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono"
                [class]="
                  wizardStep === step.num
                    ? 'bg-amber-500 text-black'
                    : wizardStep > step.num
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 text-white/40'
                "
              >
                {{ wizardStep > step.num ? '✓' : step.num }}
              </div>
              <span class="truncate hidden sm:inline">{{ step.label }}</span>
            </div>
          </div>
        </div>

        <!-- Validation Errors Banner -->
        <div
          *ngIf="wizardValidationErrors.length > 0"
          class="mx-6 mt-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-1 animate-fadein flex-shrink-0"
        >
          <p class="font-bold flex items-center gap-1.5 text-red-400">
            <span>⚠️</span> Veuillez corriger les éléments suivants :
          </p>
          <ul class="list-disc list-inside space-y-0.5 text-[11px] pl-1">
            <li *ngFor="let err of wizardValidationErrors">{{ err }}</li>
          </ul>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-6 overflow-y-auto flex-1 space-y-6 custom-scroll">
          <!-- ═════ ÉTAPE 1 : PARAMÈTRES & STRUCTURE ═════ -->
          <div *ngIf="wizardStep === 1" class="space-y-5 animate-fadein">
            <!-- Student Request Card -->
            <div class="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-amber-400 uppercase tracking-wider"
                  >Demande du Stagiaire</span
                >
                <span
                  class="text-xs font-mono font-bold text-white bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30"
                >
                  {{ selectedCustomEnrollment.customDurationWeeks }} semaines demandées
                </span>
              </div>
              <p
                *ngIf="selectedCustomEnrollment.motivationMessage"
                class="text-xs text-white/70 italic"
              >
                « {{ selectedCustomEnrollment.motivationMessage }} »
              </p>
            </div>

            <!-- Parameters Grid -->
            <div class="grid md:grid-cols-2 gap-4">
              <!-- Date de début -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-white/70"
                  >Date de début du parcours sur mesure *</label
                >
                <input
                  type="date"
                  [(ngModel)]="wizardStartDate"
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
                <p class="text-[11px] text-white/40">
                  Les séances seront planifiées à partir de cette date.
                </p>
              </div>

              <!-- Durée totale verrouillée -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-white/70"
                  >Durée contractuelle de l'engagement</label
                >
                <div
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-amber-400 font-mono font-bold flex items-center justify-between"
                >
                  <span>{{ wizardTargetWeeks }} semaines</span>
                  <span class="text-xs text-emerald-400 font-normal"
                    >Verrouillé selon la demande</span
                  >
                </div>
                <p class="text-[11px] text-white/40">
                  La somme des phases à l'étape suivante doit totaliser
                  {{ wizardTargetWeeks }} semaines.
                </p>
              </div>
            </div>

            <!-- Nombre de phases suggéré -->
            <div class="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white"
                  >Structure des phases ({{ wizardPhases.length }} phase(s))</span
                >
                <button
                  (click)="addWizardPhase()"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer flex items-center gap-1"
                >
                  + Ajouter une phase
                </button>
              </div>
              <p class="text-xs text-white/50">
                Vous pourrez détailler les objectifs et la durée de chaque phase à l'étape 2.
              </p>
            </div>
          </div>

          <!-- ═════ ÉTAPE 2 : DÉFINITION DES PHASES ═════ -->
          <div *ngIf="wizardStep === 2" class="space-y-5 animate-fadein">
            <!-- Weeks Check Banner -->
            <div
              class="p-4 rounded-2xl border flex items-center justify-between"
              [class]="
                wizardTotalWeeks === wizardTargetWeeks
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              "
            >
              <div class="flex items-center gap-2">
                <span class="text-base">{{
                  wizardTotalWeeks === wizardTargetWeeks ? '✓' : '⚖️'
                }}</span>
                <span class="text-xs font-semibold">
                  Total configuré :
                  <strong class="font-mono text-sm">{{ wizardTotalWeeks }} sem.</strong> / Cible :
                  <strong class="font-mono text-sm">{{ wizardTargetWeeks }} sem.</strong>
                </span>
              </div>
              <span class="text-xs font-bold" *ngIf="wizardTotalWeeks === wizardTargetWeeks">
                Parfaitement équilibré !
              </span>
              <span class="text-xs font-bold" *ngIf="wizardTotalWeeks !== wizardTargetWeeks">
                Différence : {{ wizardTargetWeeks - wizardTotalWeeks }} sem.
              </span>
            </div>

            <!-- Phases Forms -->
            <div class="space-y-4">
              <div
                *ngFor="let p of wizardPhases; let pi = index"
                class="glass-card border border-white/10 p-5 rounded-2xl space-y-4 bg-white/[0.01]"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <div
                      class="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs flex items-center justify-center"
                    >
                      {{ p.numero }}
                    </div>
                    <span class="font-syne font-bold text-white text-sm">Phase {{ p.numero }}</span>
                  </div>
                  <button
                    *ngIf="wizardPhases.length > 1"
                    (click)="removeWizardPhase(pi)"
                    class="text-red-400 hover:text-red-300 text-xs px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 transition-all cursor-pointer"
                  >
                    Supprimer
                  </button>
                </div>

                <div class="grid md:grid-cols-3 gap-3">
                  <!-- Titre de la phase -->
                  <div class="md:col-span-2 space-y-1">
                    <label class="text-[11px] font-semibold text-white/60"
                      >Titre de la phase *</label
                    >
                    <input
                      type="text"
                      [(ngModel)]="p.nom"
                      placeholder="Ex: Fondamentaux & Architecture Docker"
                      class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <!-- Durée en semaines -->
                  <div class="space-y-1">
                    <label class="text-[11px] font-semibold text-white/60"
                      >Durée (semaines) *</label
                    >
                    <input
                      type="number"
                      min="1"
                      [(ngModel)]="p.dureeSemaines"
                      class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <!-- Description -->
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-white/60"
                    >Description & Objectifs d'apprentissage</label
                  >
                  <textarea
                    [(ngModel)]="p.description"
                    rows="2"
                    placeholder="Objectifs clés abordés durant cette phase..."
                    class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  ></textarea>
                </div>

                <!-- Min Grade & Attendance -->
                <div class="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                  <div class="space-y-1">
                    <label class="text-[11px] text-white/50">Note minimale de passage (/20)</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      [(ngModel)]="p.minimumGrade"
                      class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[11px] text-white/50">Assiduité minimale requise (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      [(ngModel)]="p.minimumAttendance"
                      class="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              (click)="addWizardPhase()"
              class="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-xs font-semibold text-white/60 hover:text-white hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer"
            >
              + Ajouter une phase supplémentaire
            </button>
          </div>

          <!-- ═════ ÉTAPE 3 : PLANIFICATION DES SÉANCES ═════ -->
          <div *ngIf="wizardStep === 3" class="space-y-6 animate-fadein">
            <div
              class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/60 flex items-center justify-between"
            >
              <span
                >Programmez les séances pour chaque phase. Total planifié :
                <strong class="text-amber-400 font-mono"
                  >{{ wizardTotalSessions }} séance(s)</strong
                ></span
              >
            </div>

            <!-- Per Phase Sessions Manager -->
            <div
              *ngFor="let p of wizardPhases; let pi = index"
              class="space-y-3 p-5 rounded-2xl border border-white/10 bg-white/[0.01]"
            >
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <span
                    class="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold font-mono flex items-center justify-center"
                  >
                    {{ p.numero }}
                  </span>
                  <h4 class="font-syne font-bold text-white text-sm">{{ p.nom }}</h4>
                  <span class="text-xs text-white/40 font-mono"
                    >({{ p.dureeSemaines }} sem. · {{ p.seances.length }} séances)</span
                  >
                </div>
                <div class="flex items-center gap-2">
                  <button
                    (click)="autoGenerateSessions(pi)"
                    class="px-2.5 py-1 text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    ⚡ Auto-générer
                  </button>
                  <button
                    (click)="addWizardSession(pi)"
                    class="px-2.5 py-1 text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    + Séance
                  </button>
                </div>
              </div>

              <!-- Sessions List -->
              <div *ngIf="p.seances && p.seances.length > 0" class="space-y-2.5 pt-2">
                <div
                  *ngFor="let s of p.seances; let si = index"
                  class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all space-y-2.5"
                >
                  <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center">
                    <!-- Date -->
                    <div class="space-y-0.5">
                      <label class="text-[10px] text-white/40 font-semibold">Date *</label>
                      <input
                        type="date"
                        [(ngModel)]="s.date"
                        class="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <!-- Heure début -->
                    <div class="space-y-0.5">
                      <label class="text-[10px] text-white/40 font-semibold">Heure début</label>
                      <input
                        type="time"
                        [(ngModel)]="s.heureDebut"
                        class="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <!-- Durée en minutes -->
                    <div class="space-y-0.5">
                      <label class="text-[10px] text-white/40 font-semibold">Durée (min)</label>
                      <input
                        type="number"
                        [(ngModel)]="s.dureeMinutes"
                        class="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <!-- Type -->
                    <div class="space-y-0.5">
                      <label class="text-[10px] text-white/40 font-semibold">Format</label>
                      <select
                        [(ngModel)]="s.type"
                        class="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="EN_LIGNE">🌐 En ligne</option>
                        <option value="PRESENTIEL">📍 Présentiel</option>
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
                    <!-- Titre de la séance -->
                    <div class="sm:col-span-2 space-y-0.5">
                      <label class="text-[10px] text-white/40 font-semibold"
                        >Titre / Sujet de la séance</label
                      >
                      <input
                        type="text"
                        [(ngModel)]="s.titre"
                        placeholder="Ex: TP Conteneurisation & Dockerfiles"
                        class="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <!-- Salle / Lien Meet -->
                    <div class="space-y-0.5 relative">
                      <label class="text-[10px] text-white/40 font-semibold"
                        >Salle / Lien Meet</label
                      >
                      <div class="flex items-center gap-1">
                        <input
                          type="text"
                          [(ngModel)]="s.salleOuLien"
                          placeholder="Ex: Lab A1 ou Lien Meet"
                          class="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                        <button
                          (click)="removeWizardSession(pi, si)"
                          title="Supprimer la séance"
                          class="text-red-400 hover:text-red-300 px-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all text-xs cursor-pointer flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                *ngIf="!p.seances || p.seances.length === 0"
                class="text-center py-4 text-xs text-white/30 border border-dashed border-white/10 rounded-xl"
              >
                Aucune séance programmée pour cette phase. Cliquez sur « Auto-générer » ou « +
                Séance ».
              </div>
            </div>
          </div>

          <!-- ═════ ÉTAPE 4 : RÉCAPITULATIF & NOTIFICATION ═════ -->
          <div *ngIf="wizardStep === 4" class="space-y-5 animate-fadein">
            <!-- Full Recap Banner -->
            <div
              class="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-emerald-500/10 border border-amber-500/20 space-y-3"
            >
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 class="font-syne font-bold text-white text-base">
                    Récapitulatif du Parcours Sur Mesure
                  </h4>
                  <p class="text-xs text-[var(--bridge-text-muted)]">
                    Stagiaire :
                    <strong class="text-white"
                      >{{ selectedCustomEnrollment.studentFirstName }}
                      {{ selectedCustomEnrollment.studentLastName }}</strong
                    >
                    · Début :
                    <strong class="text-white">{{ wizardStartDate | date: 'dd/MM/yyyy' }}</strong>
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30"
                  >
                    ⏱️ {{ wizardTotalWeeks }} semaines
                  </span>
                  <span
                    class="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30"
                  >
                    📅 {{ wizardTotalSessions }} séances
                  </span>
                </div>
              </div>
            </div>

            <!-- Summary Timeline -->
            <div class="space-y-3">
              <div
                *ngFor="let p of wizardPhases"
                class="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <span
                      class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold font-mono flex items-center justify-center"
                    >
                      {{ p.numero }}
                    </span>
                    <span class="font-syne font-bold text-white text-sm">{{ p.nom }}</span>
                  </div>
                  <span class="text-xs text-amber-400 font-mono font-bold"
                    >{{ p.dureeSemaines }} sem. ({{ p.seances?.length || 0 }} séances)</span
                  >
                </div>
                <p class="text-xs text-white/50 pl-9">{{ p.description }}</p>
              </div>
            </div>

            <!-- Formateur Note for Notification -->
            <div class="space-y-2 pt-2 border-t border-white/10">
              <label class="text-xs font-semibold text-white/80"
                >Message personnalisé d'accompagnement (inclus dans la notification) :</label
              >
              <textarea
                [(ngModel)]="wizardNote"
                rows="2"
                placeholder="Ex: Bonjour, j'ai adapté votre calendrier pour concentrer les séances sur les technologies Docker et Kubernetes..."
                class="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-500 transition-colors resize-none"
              ></textarea>
              <p class="text-[11px] text-white/40">
                🔔 Dès que vous validez, une notification sera envoyée au stagiaire avec le détail
                de son planning.
              </p>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="p-6 border-t border-white/10 bg-white/[0.02] flex items-center justify-between flex-shrink-0"
        >
          <button
            *ngIf="wizardStep > 1"
            (click)="wizardPrevStep()"
            [disabled]="savingCustomPlan"
            class="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 font-semibold text-xs rounded-xl border border-white/10 transition-all cursor-pointer"
          >
            ← Étape précédente
          </button>
          <div *ngIf="wizardStep === 1"></div>

          <div class="flex items-center gap-3">
            <button
              (click)="closeCustomPlanWizard()"
              [disabled]="savingCustomPlan"
              class="px-5 py-2.5 text-white/50 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Annuler
            </button>

            <!-- Next Button (Steps 1 to 3) -->
            <button
              *ngIf="wizardStep < 4"
              (click)="wizardNextStep()"
              class="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-[#F5A623] text-black font-bold text-xs rounded-xl hover:opacity-90 transition-all shadow-md cursor-pointer"
            >
              Continuer →
            </button>

            <!-- Confirm & Save Button (Step 4) -->
            <button
              *ngIf="wizardStep === 4"
              (click)="saveCustomPlanSubmit()"
              [disabled]="savingCustomPlan || wizardTotalWeeks !== wizardTargetWeeks"
              class="px-7 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              <span
                *ngIf="savingCustomPlan"
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></span>
              <span>{{
                savingCustomPlan
                  ? 'Enregistrement & Envoi...'
                  : '🚀 Enregistrer & Notifier le Stagiaire'
              }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- MODAL : DEMANDE DE REMBOURSEMENT STAGIAIRE                  -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <div
      *ngIf="showRemboursementModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadein"
    >
      <div
        class="bg-[#10102A] border border-[var(--bridge-border)] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0"
      >
        <div class="h-2 bg-gradient-to-r from-orange-500 via-[#F5A623] to-[#C62761]"></div>

        <div class="p-6 space-y-4">
          <!-- Modal Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-lg font-bold text-orange-400"
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
                  <polyline points="9 14 4 9 9 4" />
                  <path d="M4 9h10a6 6 0 0 1 6 6v1" />
                </svg>
              </div>
              <div>
                <h3 class="font-syne font-bold text-white text-lg">Demande de remboursement</h3>
                <p class="text-xs text-[var(--bridge-text-muted)] truncate max-w-[280px]">
                  {{ formation?.nom }}
                </p>
              </div>
            </div>
            <button
              (click)="closeRemboursementModal()"
              class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center text-sm transition-all border border-white/5 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <!-- Success state -->
          <div
            *ngIf="remboursementSuccess"
            class="py-8 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2"
          >
            <div class="text-3xl">🎉</div>
            <p class="text-emerald-400 font-bold text-sm">Demande envoyée avec succès !</p>
            <p class="text-xs text-emerald-300/70">
              Un responsable pédagogique et financier étudiera votre dossier sous 48h.
            </p>
          </div>

          <!-- Form view -->
          <ng-container *ngIf="!remboursementSuccess">
            <!-- Motif input -->
            <div>
              <label
                class="block text-xs font-bold uppercase tracking-wider text-[var(--bridge-text-muted)] mb-2"
              >
                Motif de la demande <span class="text-red-400">*</span>
              </label>
              <textarea
                [(ngModel)]="remboursementMotif"
                rows="4"
                placeholder="Raison détaillée de votre demande (ex: indisponibilité professionnelle, changement d'orientation...)"
                class="w-full bg-white/5 border border-white/10 focus:border-[#F5A623] rounded-xl p-3 text-xs text-white placeholder-white/20 focus:outline-none transition-all resize-none"
              ></textarea>
            </div>

            <!-- Notice alert -->
            <div
              class="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-2.5"
            >
              <span class="text-orange-400 text-sm mt-0.5">⚠️</span>
              <p class="text-xs text-orange-200/80 leading-relaxed">
                Sous réserve des conditions générales d'annulation. Le remboursement n'est possible
                que si le cycle n'a pas été intégralement suivi.
              </p>
            </div>

            <!-- Confirm checkbox -->
            <label class="flex items-start gap-2.5 cursor-pointer group pt-1">
              <input
                type="checkbox"
                [(ngModel)]="remboursementConfirm"
                class="mt-0.5 accent-[#F5A623]"
              />
              <span
                class="text-xs text-[var(--bridge-text-muted)] group-hover:text-white transition-colors leading-snug"
              >
                Je confirme vouloir initier cette demande de remboursement pour cette formation.
              </span>
            </label>

            <!-- Buttons -->
            <div class="flex items-center gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                (click)="closeRemboursementModal()"
                class="flex-1 py-2.5 text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                (click)="submitRemboursement()"
                [disabled]="
                  !remboursementMotif.trim() || !remboursementConfirm || remboursementSubmitting
                "
                class="flex-1 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[rgba(198,39,97,0.25)] cursor-pointer"
              >
                <span
                  *ngIf="remboursementSubmitting"
                  class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></span>
                {{ remboursementSubmitting ? 'Transmission...' : 'Envoyer la demande' }}
              </button>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes inlineCardIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes presenceSlideIn {
        from {
          opacity: 0;
          transform: translateY(-24px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .presence-slide-panel {
        animation: presenceSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      .inline-view-card {
        animation: presenceSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      @keyframes fadeSlideIn {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fadein {
        animation: fadeSlideIn 0.4s ease both;
      }
    `,
  ],
})
export class FormationDetailComponent implements OnInit, OnDestroy {
  formation: Formation | null = null;
  enrollments: EnrollmentInfo[] = [];
  phaseEvaluations: Evaluation[] = [];
  loading = true;
  activeTab = 'phases';
  expandedPhase: string | null = null;
  searchQuery = '';
  user: User | null = null;

  // Payment tab state
  formationPaiements: Paiement[] = [];
  loadingPaiements = false;
  payingPhaseId: string | null = null;

  showAttendanceModal = false;
  selectedSeance: Seance | null = null;
  activePresences: Presence[] = [];
  savingAttendance = false;

  showEvalModal = false;
  selectedEnrollment: EnrollmentInfo | null = null;
  submittingEval = false;
  evalForm = { phaseId: '', grade: 10, skills: '', comment: '' };

  private sub = new Subscription();
  private formationId = '';

  get isStagiaire(): boolean {
    return this.user?.role === 'STAGIAIRE';
  }

  get tabs() {
    // Toujours retourner un tableau stable basé sur le rôle courant
    if (this.isStagiaire) {
      return this._stagiaireTabsDef;
    }
    return this._formateurTabsDef;
  }

  // Custom enrollment filters & wizard state
  customSearchQuery = '';
  customPlanStatusFilter: 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED' = 'ALL';
  expandedCustomPlanEnrollmentId: string | null = null;
  showCustomPlanWizard = false;
  selectedCustomEnrollment: EnrollmentInfo | null = null;
  wizardStep = 1;
  wizardStartDate = '';
  wizardNote = '';
  wizardPhases: CustomPlanPhase[] = [];
  savingCustomPlan = false;
  wizardValidationErrors: string[] = [];

  // Cache des plans parsés (évite le re-parsing JSON à chaque cycle de détection)
  private parsedCustomPlans: Map<string, CustomPlanData> = new Map();

  private get _stagiaireTabsDef() {
    const tabs = [
      { id: 'my-progress', label: 'Ma Progression', icon: '📈', count: undefined },
      { id: 'my-presence', label: 'Mes Présences', icon: '📅', count: this.getMyPresenceCount() },
      { id: 'my-eval', label: 'Mon Évaluation', icon: '⭐', count: this.getMyEvalCount() },
    ];
    // Masquer l'onglet Paiement si la formation fait partie d'un combo
    if (!this.isComboFormation) {
      tabs.push({ id: 'paiement', label: 'Paiement', icon: '💳', count: undefined });
    }
    return tabs;
  }

  private get _formateurTabsDef() {
    return [
      {
        id: 'phases',
        label: 'Phases & Séances',
        icon: '🗂️',
        count: this.formation?.phases?.length,
      },
      {
        id: 'stagiaires',
        label: 'Stagiaires Standards',
        icon: '👥',
        count: this.standardEnrollments.length,
      },
      {
        id: 'custom-enrollments',
        label: 'Parcours Sur Mesure',
        icon: '⚡',
        count: this.customEnrollments.length,
      },
      { id: 'evaluations', label: 'Évaluations', icon: '📝', count: this.phaseEvaluations.length },
    ];
  }

  get canManage(): boolean {
    return this.user?.role === 'FORMATEUR' || this.user?.role === 'ADMIN';
  }

  getMyPresenceCount(): number {
    if (this.myCustomPlan) {
      let count = 0;
      this.myCustomPlan.phases?.forEach((p) => {
        p.seances?.forEach((s) => {
          if (s.present === true) count++;
        });
      });
      return count;
    }
    if (!this.formation || !this.user) return 0;
    let count = 0;
    this.formation.phases.forEach((p) => {
      p.seances?.forEach((s) => {
        const pres = s.presences?.find((pr) => pr.stagiaireId === this.user!.id);
        if (pres && pres.present) count++;
      });
    });
    return count;
  }

  getMyEvalCount(): number {
    return this.phaseEvaluations.filter(
      (e) => e.studentId?.toString() === this.user?.id?.toString(),
    ).length;
  }

  getMyPresenceForSeance(seance: any): any {
    if (!seance.presences || !this.user) return null;
    return seance.presences.find((p: any) => p.stagiaireId === this.user!.id) || null;
  }

  getMyAttendanceRate(): number {
    if (this.myCustomPlan) {
      return this.getCustomPlanAttendance(this.myCustomPlan);
    }
    if (!this.formation || !this.user) return 0;
    let total = 0,
      present = 0;
    this.formation.phases.forEach((p) => {
      p.seances?.forEach((s) => {
        const pres = s.presences?.find((pr) => pr.stagiaireId === this.user!.id);
        if (pres) {
          total++;
          if (pres.present) present++;
        }
      });
    });
    return total > 0 ? Math.round((present / total) * 100) : 0;
  }

  getMyEvals(): any[] {
    return this.phaseEvaluations.filter(
      (e) => e.studentId?.toString() === this.user?.id?.toString(),
    );
  }

  getMyFormationProgress(): number {
    if (this.myCustomPlan) {
      return this.getCustomPlanProgression(this.myCustomPlan);
    }
    if (!this.formation) return 0;
    const phases = this.formation.phases || [];
    if (phases.length === 0) return 0;
    return Math.round(phases.reduce((s, p) => s + (p.progression || 0), 0) / phases.length);
  }

  get standardEnrollments(): EnrollmentInfo[] {
    return this.enrollments.filter((e) => !e.customDurationWeeks || e.customDurationWeeks <= 0);
  }

  get customEnrollments(): EnrollmentInfo[] {
    return this.enrollments.filter((e) => !!(e.customDurationWeeks && e.customDurationWeeks > 0));
  }

  get filteredStandardEnrollments(): EnrollmentInfo[] {
    if (!this.searchQuery.trim()) return this.standardEnrollments;
    const q = this.searchQuery.toLowerCase();
    return this.standardEnrollments.filter(
      (e) =>
        (e.studentFirstName || '').toLowerCase().includes(q) ||
        (e.studentLastName || '').toLowerCase().includes(q) ||
        (e.studentEmail || '').toLowerCase().includes(q),
    );
  }

  get filteredCustomEnrollments(): EnrollmentInfo[] {
    let list = this.customEnrollments;
    if (this.customPlanStatusFilter !== 'ALL') {
      list = list.filter((e) => e.status === this.customPlanStatusFilter);
    }
    if (!this.customSearchQuery.trim()) return list;
    const q = this.customSearchQuery.toLowerCase();
    return list.filter(
      (e) =>
        (e.studentFirstName || '').toLowerCase().includes(q) ||
        (e.studentLastName || '').toLowerCase().includes(q) ||
        (e.studentEmail || '').toLowerCase().includes(q),
    );
  }

  get wizardTotalWeeks(): number {
    return this.wizardPhases.reduce((sum, p) => sum + (Number(p.dureeSemaines) || 0), 0);
  }

  get wizardTargetWeeks(): number {
    return this.selectedCustomEnrollment?.customDurationWeeks || 0;
  }

  get wizardTotalSessions(): number {
    return this.wizardPhases.reduce((sum, p) => sum + (p.seances ? p.seances.length : 0), 0);
  }

  // Combo & Enrollment state for Stagiaire
  isComboFormation = false;
  comboStatus: string | null = null;

  // Unenroll & Reimbursement state
  unenrollConfirm = false;
  unenrolling = false;
  showRemboursementModal = false;
  remboursementMotif = '';
  remboursementConfirm = false;
  remboursementSubmitting = false;
  remboursementSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formationService: FormationService,
    private evaluationService: EvaluationService,
    private authService: AuthService,
    private http: HttpClient,
    private paiementService: PaiementService,
    private enrollmentService: EnrollmentService,
    private comboService: ComboEnrollmentService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.formationId = this.route.snapshot.paramMap.get('id') || '';
    this.loadFormationDetails();
    // Set default tab for stagiaire
    if (this.user?.role === 'STAGIAIRE') {
      this.activeTab = 'my-progress';
      this.loadPaiements();
      this.loadStudentCombos();
    }
  }

  loadStudentCombos(): void {
    if (!this.user?.id || !this.formationId) return;
    this.sub.add(
      this.comboService.getCombosByStudent(parseInt(this.user.id)).subscribe({
        next: (combos: ComboEnrollment[]) => {
          const found = (combos || []).find((c) =>
            c.formations?.some((f) => f.id?.toString() === this.formationId.toString()),
          );
          if (found) {
            this.isComboFormation = true;
            this.comboStatus = found.status;
            if (this.activeTab === 'paiement') {
              this.activeTab = 'my-progress';
            }
          } else {
            this.isComboFormation = false;
            this.comboStatus = null;
          }
          this.cdr.detectChanges();
        },
        error: () => {},
      }),
    );
  }

  get isMyEnrollmentActive(): boolean {
    if (!this.user) return false;
    return this.enrollments.some(
      (e) => e.studentId?.toString() === this.user?.id?.toString() && e.status === 'APPROVED',
    );
  }

  unenrollFormation(): void {
    if (!this.user || !this.formation) return;
    this.unenrolling = true;
    this.sub.add(
      this.enrollmentService
        .unenrollStudent(parseInt(this.user.id), parseInt(this.formation.id))
        .subscribe({
          next: () => {
            this.unenrolling = false;
            this.unenrollConfirm = false;
            this.toastService.success(
              'Vous avez été désinscrit avec succès de cette formation.',
              'Désinscription',
            );
            this.router.navigate(['/dashboard/stagiaire']);
          },
          error: (err: any) => {
            this.unenrolling = false;
            this.unenrollConfirm = false;
            this.toastService.error(
              err?.error?.message || 'Erreur lors de la désinscription.',
              'Erreur',
            );
          },
        }),
    );
  }

  openRemboursementModal(): void {
    this.showRemboursementModal = true;
    this.remboursementMotif = '';
    this.remboursementConfirm = false;
    this.remboursementSuccess = false;
    this.remboursementSubmitting = false;
  }

  closeRemboursementModal(): void {
    this.showRemboursementModal = false;
  }

  submitRemboursement(): void {
    if (!this.remboursementMotif.trim() || !this.remboursementConfirm) return;
    this.remboursementSubmitting = true;
    setTimeout(() => {
      this.remboursementSubmitting = false;
      this.remboursementSuccess = true;
      this.toastService.success(
        'Votre demande de remboursement a bien été transmise.',
        'Demande envoyée',
      );
      setTimeout(() => {
        this.showRemboursementModal = false;
      }, 3500);
    }, 1200);
  }

  /** Change l'onglet actif et force la détection de changements */
  setTab(id: string): void {
    if (this.activeTab === id) return;
    this.activeTab = id;
    this.cdr.detectChanges();
  }

  /** trackBy pour le *ngFor des tabs — évite le re-render complet des boutons */
  trackTab(index: number, tab: { id: string }): string {
    return tab.id;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  loadFormationDetails(): void {
    this.loading = true;
    this.sub.add(
      this.formationService.getFormationById(this.formationId).subscribe({
        next: (f) => {
          this.formation = f || null;
          if (this.formation) {
            this.loadEnrollments();
            this.loadAllEvaluations();
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      }),
    );
  }

  loadEnrollments(): void {
    this.sub.add(
      this.http
        .get<EnrollmentInfo[]>(`${environment.apiUrl}/enrollments/formation/${this.formationId}`)
        .subscribe({
          next: (data) => {
            this.enrollments = data || [];
            // Invalider le cache des plans parsés pour forcer le re-parsing avec les données fraîches
            this.parsedCustomPlans.clear();
          },
          error: () => {},
        }),
    );
  }

  loadAllEvaluations(): void {
    if (!this.formation) return;
    const evalRequests = this.formation.phases.map((p) =>
      this.evaluationService.getEvaluationsByPhase(p.id),
    );
    if (evalRequests.length === 0) return;
    this.sub.add(
      forkJoin(evalRequests).subscribe({
        next: (results) => {
          this.phaseEvaluations = results.flat();
        },
        error: () => {},
      }),
    );
  }

  goBack(): void {
    if (this.user?.role === 'STAGIAIRE') {
      this.router.navigate(['/dashboard/stagiaire/formations']);
    } else if (this.user?.role === 'FORMATEUR') {
      this.router.navigate(['/dashboard/formateur/formations']);
    } else {
      this.router.navigate(['/dashboard/formations']);
    }
  }

  togglePhase(id: string): void {
    this.expandedPhase = this.expandedPhase === id ? null : id;
  }

  canEvaluate(): boolean {
    return this.formation?.status === 'TERMINEE';
  }

  evalStarRating = 5;

  openAttendance(seance: Seance): void {
    this.selectedSeance = seance;
    this.activePresences = seance.presences ? JSON.parse(JSON.stringify(seance.presences)) : [];
    this.showAttendanceModal = true;
    setTimeout(() => {
      const el = document.querySelector('.presence-slide-panel');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  }

  closeAttendance(): void {
    this.showAttendanceModal = false;
    this.selectedSeance = null;
    this.activePresences = [];
    this.savingAttendance = false;
  }

  getPresenceCardClass(p: Presence): string {
    if (p.present && !this.isRetard(p)) return 'border-emerald-500/30 bg-emerald-500/[0.04]';
    if (p.present && this.isRetard(p)) return 'border-amber-500/30 bg-amber-500/[0.04]';
    return 'border-red-500/20 bg-red-500/[0.03]';
  }

  setPresenceStatus(p: Presence, status: 'PRESENT' | 'RETARD' | 'ABSENT'): void {
    if (status === 'PRESENT') {
      p.present = true;
      p.sessionNote = (p.sessionNote || '').replace('[RETARD]', '').trim();
    } else if (status === 'RETARD') {
      p.present = true;
      if (!p.sessionNote?.includes('[RETARD]')) {
        p.sessionNote = ('[RETARD] ' + (p.sessionNote || '')).trim();
      }
    } else {
      p.present = false;
    }
  }

  isRetard(p: Presence): boolean {
    return p.sessionNote?.includes('[RETARD]') || false;
  }

  getPresentInModal(): number {
    return this.activePresences.filter((p) => p.present).length;
  }

  saveAttendance(): void {
    if (!this.selectedSeance) return;
    this.savingAttendance = true;
    this.sub.add(
      this.formationService.savePresence(this.selectedSeance.id, this.activePresences).subscribe({
        next: () => {
          this.selectedSeance!.presences = [...this.activePresences];
          this.closeAttendance();
        },
        error: () => {
          this.savingAttendance = false;
        },
      }),
    );
  }

  openEvalForStudent(e: EnrollmentInfo): void {
    this.selectedEnrollment = e;
    this.evalForm = { phaseId: '', grade: 10, skills: '', comment: '' };
    this.showEvalModal = true;
  }

  closeEvalModal(): void {
    this.showEvalModal = false;
    this.selectedEnrollment = null;
    this.submittingEval = false;
  }

  submitEvaluation(): void {
    if (!this.selectedEnrollment || !this.evalForm.phaseId || !this.user) return;
    this.submittingEval = true;
    const payload: Evaluation = {
      studentId: this.selectedEnrollment.studentId.toString(),
      trainerId: this.user.id,
      phaseId: this.evalForm.phaseId,
      grade: this.evalForm.grade,
      skills: this.evalForm.skills,
      comment: this.evalForm.comment,
    };
    this.sub.add(
      this.evaluationService.saveEvaluation(payload).subscribe({
        next: () => {
          this.loadAllEvaluations();
          setTimeout(() => {
            this.closeEvalModal();
          }, 800);
        },
        error: () => {
          this.submittingEval = false;
        },
      }),
    );
  }

  // Helpers
  getPresenceCount(seance: Seance): number {
    return seance.presences?.filter((p) => p.present).length || 0;
  }

  isToday(date: Date | string | null | undefined): boolean {
    if (!date) return false;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (typeof date === 'string') {
      const dateOnly = date.split('T')[0].trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
        return dateOnly === todayStr;
      }
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return false;
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }

  isPast(date: Date | string | null | undefined): boolean {
    if (!date) return false;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (typeof date === 'string') {
      const dateOnly = date.split('T')[0].trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
        return dateOnly < todayStr;
      }
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return false;
    return d < new Date(new Date().setHours(0, 0, 0, 0));
  }

  getTotalSessions(): number {
    return this.formation?.phases.reduce((sum, p) => sum + (p.seances?.length || 0), 0) || 0;
  }

  formatDay(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
  }

  formatDayNum(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.getDate().toString().padStart(2, '0');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'TERMINEE':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'PLANIFIEE':
        return 'bg-[rgba(245,166,35,0.1)] text-[#F5A623] border-[rgba(245,166,35,0.2)]';
      default:
        return 'bg-white/5 text-white/50 border-white/10';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'En cours';
      case 'TERMINEE':
        return 'Terminée';
      case 'PLANIFIEE':
        return 'Planifiée';
      default:
        return status;
    }
  }

  getPhaseStatusBg(status: string): string {
    switch (status) {
      case 'COMPLETEE':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'EN_COURS':
        return 'bg-gradient-to-br from-[#C62761] to-[#F5A623] text-white';
      case 'VERROUILLEE':
        return 'bg-white/5 text-white/30';
      default:
        return 'bg-white/5 text-white/30';
    }
  }

  getPhaseStatusBadge(status: string): string {
    switch (status) {
      case 'COMPLETEE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'EN_COURS':
        return 'bg-[rgba(198,39,97,0.1)] text-[#C62761] border-[rgba(198,39,97,0.2)]';
      case 'VERROUILLEE':
        return 'bg-white/5 text-white/30 border-white/10';
      default:
        return 'bg-white/5 text-white/30 border-white/10';
    }
  }

  getPhaseStatusText(status: string): string {
    switch (status) {
      case 'COMPLETEE':
        return '✓ Complétée';
      case 'EN_COURS':
        return '▶ En cours';
      case 'VERROUILLEE':
        return '🔒 Verrouillée';
      default:
        return status;
    }
  }

  gradeToStars(grade: number): number {
    return Math.round((grade / 20) * 5);
  }

  getGradeClass(grade: number): string {
    if (grade >= 16) return 'text-emerald-400';
    if (grade >= 14) return 'text-[#F5A623]';
    if (grade >= 10) return 'text-blue-400';
    return 'text-red-400';
  }

  getGradeLabel(grade: number): string {
    if (grade >= 16) return '🏆 Excellent';
    if (grade >= 14) return '⭐ Très bien';
    if (grade >= 12) return '✓ Bien';
    if (grade >= 10) return '○ Satisfaisant';
    return '✕ Insuffisant';
  }

  // ── Payment helpers ──────────────────────────────────────────────────────────
  loadPaiements(): void {
    if (!this.user || !this.formationId) return;
    this.loadingPaiements = true;
    this.sub.add(
      this.paiementService.getPaiementsByStagiaire(this.user.id).subscribe({
        next: (data) => {
          // Filter by formation if formationId available on paiement
          this.formationPaiements = data.filter(
            (p) =>
              !p.formationId ||
              p.formationId.toString() === this.formationId.toString() ||
              p.formationId === '',
          );
          this.loadingPaiements = false;
        },
        error: () => {
          this.loadingPaiements = false;
        },
      }),
    );
  }

  getPaiementForPhase(phase: Phase): Paiement | undefined {
    return this.formationPaiements.find(
      (p) =>
        p.phaseNumero === phase.numero ||
        (p.phaseId && p.phaseId.toString() === phase.id?.toString()),
    );
  }

  getTotalPaidFormation(): number {
    return this.formationPaiements
      .filter((p) => p.status === 'PAYE')
      .reduce((s, p) => s + p.montant, 0);
  }

  getTotalRemainingFormation(): number {
    return this.formationPaiements
      .filter((p) => p.status !== 'PAYE')
      .reduce((s, p) => s + p.montant, 0);
  }

  unlockPhase(phaseId: string): void {
    if (!phaseId) return;
    this.sub.add(
      this.formationService.unlockPhase(phaseId).subscribe({
        next: () => {
          this.toastService.success('Phase débloquée avec succès !', 'Déblocage de Phase');
          this.loadFormationDetails();
        },
        error: (err) => {
          this.toastService.error(
            err?.error?.message || 'Erreur lors du déblocage de la phase',
            'Erreur',
          );
        },
      }),
    );
  }

  closeSession(sessionId: string): void {
    if (!sessionId) return;
    this.sub.add(
      this.formationService.closeSession(sessionId).subscribe({
        next: () => {
          this.toastService.success(
            "Séance clôturée ! Les calculs d'assiduité et de progression ont été mis à jour.",
            'Clôture de Séance',
          );
          this.loadFormationDetails();
        },
        error: (err) => {
          this.toastService.error(
            err?.error?.message || 'Erreur lors de la clôture de la séance',
            'Erreur',
          );
        },
      }),
    );
  }

  payPhaseWithStripe(paiement: Paiement): void {
    if (!paiement) return;
    this.payingPhaseId = paiement.id;
    const enrollmentId = paiement.enrollmentId || Number(paiement.stagiaireId) || 1;
    const phaseId = paiement.phaseId || Number(paiement.phaseNumero) || 1;

    localStorage.setItem('pending_stripe_enrollment_id', enrollmentId.toString());
    localStorage.setItem('pending_stripe_phase_id', phaseId.toString());

    this.paiementService
      .initiateStripePayment({
        enrollmentId,
        phaseId,
        amount: paiement.montant,
      })
      .subscribe({
        next: (res: any) => {
          this.payingPhaseId = null;
          if (res?.url) {
            window.location.href = res.url;
          } else {
            this.toastService.error(
              "Impossible d'obtenir le lien de paiement Stripe.",
              'Paiement Stripe',
            );
          }
        },
        error: (err: any) => {
          this.payingPhaseId = null;
          this.toastService.error(
            err?.error?.message || 'Erreur lors de la connexion avec Stripe.',
            'Paiement Stripe',
          );
        },
      });
  }

  // ── Custom Plan Wizard & Preview Methods ───────────────────────────────────────

  toggleCustomPlanPreview(enrollmentId: string): void {
    if (this.expandedCustomPlanEnrollmentId === enrollmentId) {
      this.expandedCustomPlanEnrollmentId = null;
    } else {
      this.expandedCustomPlanEnrollmentId = enrollmentId;
    }
  }

  parseCustomPlan(jsonString?: string | null): CustomPlanData | null {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString) as CustomPlanData;
    } catch {
      return null;
    }
  }

  /** Retourne le plan depuis le cache (Map) — évite le re-parsing à chaque cycle */
  getParsedPlan(enrollment: EnrollmentInfo): CustomPlanData | null {
    if (!enrollment || !enrollment.customPlan) return null;
    const key = enrollment.id.toString();
    if (!this.parsedCustomPlans.has(key)) {
      const plan = this.parseCustomPlan(enrollment.customPlan);
      if (plan) this.parsedCustomPlans.set(key, plan);
      return plan;
    }
    return this.parsedCustomPlans.get(key) || null;
  }

  getPlanPhasesCount(jsonString?: string | null): number {
    const plan = this.parseCustomPlan(jsonString);
    return plan?.phases?.length || 0;
  }

  getPlanSessionsCount(jsonString?: string | null): number {
    const plan = this.parseCustomPlan(jsonString);
    if (!plan || !plan.phases) return 0;
    return plan.phases.reduce((sum, p) => sum + (p.seances ? p.seances.length : 0), 0);
  }

  openCustomPlanWizard(enrollment: EnrollmentInfo): void {
    this.selectedCustomEnrollment = enrollment;
    this.wizardStep = 1;
    this.wizardValidationErrors = [];

    const existingPlan = this.parseCustomPlan(enrollment.customPlan);
    if (existingPlan) {
      this.wizardStartDate = existingPlan.dateDebut || new Date().toISOString().split('T')[0];
      this.wizardNote = existingPlan.noteFormateur || '';
      this.wizardPhases = JSON.parse(JSON.stringify(existingPlan.phases || []));
    } else {
      this.wizardStartDate = this.formation?.dateDebut
        ? new Date(this.formation.dateDebut).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      this.wizardNote = '';

      // Auto initialize default phases based on custom duration
      const totalWeeks = enrollment.customDurationWeeks || 4;
      const numPhases = totalWeeks >= 8 ? 3 : totalWeeks >= 4 ? 2 : 1;
      const weeksPerPhase = Math.max(1, Math.floor(totalWeeks / numPhases));

      this.wizardPhases = [];
      for (let i = 1; i <= numPhases; i++) {
        const pWeeks =
          i === numPhases ? totalWeeks - weeksPerPhase * (numPhases - 1) : weeksPerPhase;
        this.wizardPhases.push({
          numero: i,
          nom: `Phase ${i} : ${i === 1 ? 'Fondamentaux & Prise en main' : i === 2 ? 'Pratique avancée & Projet' : 'Perfectionnement & Soutenance'}`,
          description: `Parcours intensif sur mesure sur ${pWeeks} semaine(s)`,
          dureeSemaines: pWeeks,
          minimumAttendance: 75,
          minimumGrade: 10,
          seances: [],
        });
      }

      // Auto-generate initial sessions for each phase
      this.wizardPhases.forEach((p, pIdx) => {
        this.autoGenerateSessions(pIdx);
      });
    }

    this.showCustomPlanWizard = true;
  }

  closeCustomPlanWizard(): void {
    if (this.savingCustomPlan) return;
    this.showCustomPlanWizard = false;
    this.selectedCustomEnrollment = null;
    this.wizardPhases = [];
    this.wizardValidationErrors = [];
  }

  wizardNextStep(): void {
    this.wizardValidationErrors = [];

    if (this.wizardStep === 1) {
      if (!this.wizardStartDate) {
        this.wizardValidationErrors.push('Veuillez renseigner une date de début pour le parcours.');
        return;
      }
      if (this.wizardPhases.length === 0) {
        this.wizardValidationErrors.push('Veuillez ajouter au moins une phase.');
        return;
      }
    } else if (this.wizardStep === 2) {
      for (let i = 0; i < this.wizardPhases.length; i++) {
        const p = this.wizardPhases[i];
        if (!p.nom || !p.nom.trim()) {
          this.wizardValidationErrors.push(`Le titre de la Phase ${p.numero} est obligatoire.`);
        }
        if (!p.dureeSemaines || p.dureeSemaines <= 0) {
          this.wizardValidationErrors.push(
            `La durée de la Phase ${p.numero} doit être d'au moins 1 semaine.`,
          );
        }
      }
      if (this.wizardTotalWeeks !== this.wizardTargetWeeks) {
        this.wizardValidationErrors.push(
          `La somme des durées des phases (${this.wizardTotalWeeks} sem.) doit correspondre exactement à l'engagement du stagiaire (${this.wizardTargetWeeks} sem.).`,
        );
      }
      if (this.wizardValidationErrors.length > 0) return;
    } else if (this.wizardStep === 3) {
      for (let i = 0; i < this.wizardPhases.length; i++) {
        const p = this.wizardPhases[i];
        if (!p.seances || p.seances.length === 0) {
          this.wizardValidationErrors.push(
            `Veuillez programmer au moins une séance pour la Phase ${p.numero}.`,
          );
        }
      }
      if (this.wizardValidationErrors.length > 0) return;
    }

    this.wizardStep = Math.min(this.wizardStep + 1, 4);
  }

  wizardPrevStep(): void {
    this.wizardValidationErrors = [];
    this.wizardStep = Math.max(this.wizardStep - 1, 1);
  }

  addWizardPhase(): void {
    const nextNum = this.wizardPhases.length + 1;
    this.wizardPhases.push({
      numero: nextNum,
      nom: `Phase ${nextNum} : Nouvel Objectif`,
      description: 'Description des compétences ciblées',
      dureeSemaines: 1,
      minimumAttendance: 75,
      minimumGrade: 10,
      seances: [],
    });
  }

  removeWizardPhase(index: number): void {
    if (this.wizardPhases.length <= 1) {
      this.toastService.warning('Il faut au moins une phase dans le parcours.', 'Structure');
      return;
    }
    this.wizardPhases.splice(index, 1);
    this.wizardPhases.forEach((p, idx) => (p.numero = idx + 1));
  }

  addWizardSession(phaseIndex: number): void {
    const p = this.wizardPhases[phaseIndex];
    if (!p.seances) p.seances = [];

    const baseDate = this.wizardStartDate ? new Date(this.wizardStartDate) : new Date();
    let weekOffset = 0;
    for (let i = 0; i < phaseIndex; i++) {
      weekOffset += Number(this.wizardPhases[i].dureeSemaines) || 1;
    }
    baseDate.setDate(baseDate.getDate() + weekOffset * 7 + p.seances.length * 3);

    p.seances.push({
      titre: `Séance ${p.seances.length + 1} : Atelier pratique`,
      date: baseDate.toISOString().split('T')[0],
      heureDebut: '18:30',
      dureeMinutes: 90,
      type: 'EN_LIGNE',
      salleOuLien: 'https://meet.google.com/the-bridge',
      description: 'Session interactive avec le formateur',
    });
  }

  removeWizardSession(phaseIndex: number, sessionIndex: number): void {
    this.wizardPhases[phaseIndex].seances.splice(sessionIndex, 1);
  }

  autoGenerateSessions(phaseIndex: number): void {
    const p = this.wizardPhases[phaseIndex];
    p.seances = [];
    const weeks = Number(p.dureeSemaines) || 2;
    const baseDate = this.wizardStartDate ? new Date(this.wizardStartDate) : new Date();

    let weekOffset = 0;
    for (let i = 0; i < phaseIndex; i++) {
      weekOffset += Number(this.wizardPhases[i].dureeSemaines) || 1;
    }

    for (let w = 0; w < weeks; w++) {
      const d1 = new Date(baseDate);
      d1.setDate(d1.getDate() + (weekOffset + w) * 7 + 1); // Tuesday
      p.seances.push({
        titre: `S${w * 2 + 1} : Théorie & Fondamentaux (Semaine ${w + 1})`,
        date: d1.toISOString().split('T')[0],
        heureDebut: '18:30',
        dureeMinutes: 90,
        type: 'EN_LIGNE',
        salleOuLien: 'https://meet.google.com/the-bridge',
        description: `Cours interactif et notions clés semaine ${w + 1}`,
      });

      const d2 = new Date(baseDate);
      d2.setDate(d2.getDate() + (weekOffset + w) * 7 + 3); // Thursday
      p.seances.push({
        titre: `S${w * 2 + 2} : TP & Exercices Pratiques (Semaine ${w + 1})`,
        date: d2.toISOString().split('T')[0],
        heureDebut: '18:30',
        dureeMinutes: 120,
        type: 'PRESENTIEL',
        salleOuLien: 'Lab Bridge A1',
        description: `Mise en pratique encadrée semaine ${w + 1}`,
      });
    }
    this.toastService.info(
      `${p.seances.length} séances générées pour la Phase ${p.numero}`,
      'Planning automatique',
    );
  }

  saveCustomPlanSubmit(): void {
    if (!this.selectedCustomEnrollment) return;
    this.savingCustomPlan = true;
    this.wizardValidationErrors = [];

    const planData: CustomPlanData = {
      formationId: this.formationId,
      formationNom: this.formation?.nom || '',
      studentId: this.selectedCustomEnrollment.studentId,
      studentNom: `${this.selectedCustomEnrollment.studentFirstName} ${this.selectedCustomEnrollment.studentLastName}`,
      totalDurationWeeks:
        this.selectedCustomEnrollment.customDurationWeeks || this.wizardTotalWeeks,
      dateDebut: this.wizardStartDate,
      phases: this.wizardPhases,
      noteFormateur: this.wizardNote.trim(),
      updatedAt: new Date().toISOString(),
    };

    const jsonStr = JSON.stringify(planData);
    const enrollmentId = Number(this.selectedCustomEnrollment.id);

    this.enrollmentService.saveCustomPlan(enrollmentId, jsonStr, this.wizardNote).subscribe({
      next: (res) => {
        this.savingCustomPlan = false;
        // Update local enrollment state
        const target = this.enrollments.find(
          (e) => e.id.toString() === this.selectedCustomEnrollment!.id.toString(),
        );
        if (target) {
          target.customPlan = jsonStr;
        }
        this.toastService.success(
          `Le parcours sur mesure de ${this.selectedCustomEnrollment?.studentFirstName} a été enregistré et notifié avec succès !`,
          '🎉 Planning configuré',
        );
        this.showCustomPlanWizard = false;
        this.selectedCustomEnrollment = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.savingCustomPlan = false;
        this.wizardValidationErrors = [
          err?.error?.message || "Erreur lors de l'enregistrement du plan personnalisé.",
        ];
        this.toastService.error("Erreur lors de l'enregistrement du plan", 'Erreur');
      },
    });
  }

  get myCustomPlan(): CustomPlanData | null {
    if (!this.isStagiaire || !this.user) return null;
    const myEnroll = this.enrollments.find(
      (e) => e.studentId.toString() === this.user!.id.toString(),
    );
    return myEnroll ? this.parseCustomPlan(myEnroll.customPlan) : null;
  }

  getCustomPlanAttendance(plan: CustomPlanData | null): number {
    if (!plan || !plan.phases) return 0;
    let totalMarked = 0;
    let presentCount = 0;
    plan.phases.forEach((p) => {
      p.seances?.forEach((s) => {
        if (s.present === true) {
          totalMarked++;
          presentCount++;
        } else if (s.present === false) {
          totalMarked++;
        }
      });
    });
    return totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 100;
  }

  getCustomPlanProgression(plan: CustomPlanData | null): number {
    if (!plan || !plan.phases) return 0;
    let totalSessions = 0;
    let completedSessions = 0;
    plan.phases.forEach((p) => {
      p.seances?.forEach((s) => {
        totalSessions++;
        if (s.present !== undefined && s.present !== null) {
          completedSessions++;
        } else if (this.isPast(s.date)) {
          completedSessions++;
        }
      });
    });
    return totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  }

  getCustomPhaseAttendance(phase: CustomPlanPhase): number {
    if (!phase.seances || phase.seances.length === 0) return 0;
    let totalMarked = 0;
    let presentCount = 0;
    phase.seances.forEach((s) => {
      if (s.present === true) {
        totalMarked++;
        presentCount++;
      } else if (s.present === false) {
        totalMarked++;
      }
    });
    return totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 100;
  }

  getCustomPhaseProgression(phase: CustomPlanPhase): number {
    if (!phase.seances || phase.seances.length === 0) return 0;
    let completed = 0;
    phase.seances.forEach((s) => {
      if (s.present !== undefined && s.present !== null) {
        completed++;
      } else if (this.isPast(s.date)) {
        completed++;
      }
    });
    return Math.round((completed / phase.seances.length) * 100);
  }

  markCustomSessionAttendance(
    enrollment: EnrollmentInfo,
    phaseIndex: number,
    sessionIndex: number,
    present: boolean,
  ): void {
    if (!enrollment) return;

    const key = enrollment.id.toString();

    // Récupère le plan depuis le cache ou le parse depuis le JSON
    const plan = this.parsedCustomPlans.get(key) || this.parseCustomPlan(enrollment.customPlan);
    if (!plan || !plan.phases) return;

    let phase = plan.phases[phaseIndex];
    if (!phase) {
      phase = plan.phases.find((p) => p.numero === phaseIndex + 1) || plan.phases[0];
    }
    if (!phase || !phase.seances || !phase.seances[sessionIndex]) return;

    const targetSession = phase.seances[sessionIndex];
    const previousVal = targetSession.present;

    // Toggle : si même valeur => reset à null, sinon => nouvelle valeur
    if (previousVal === present) {
      targetSession.present = null;
      targetSession.markedAt = undefined;
    } else {
      targetSession.present = present;
      targetSession.markedAt = new Date().toISOString();
    }

    plan.updatedAt = new Date().toISOString();
    const updatedJson = JSON.stringify(plan);

    // Mise à jour immédiate du cache et de l'enrollment
    this.parsedCustomPlans.set(key, plan);
    enrollment.customPlan = updatedJson;
    const localEnroll = this.enrollments.find((e) => e.id.toString() === key);
    if (localEnroll) {
      localEnroll.customPlan = updatedJson;
    }
    // Force Angular à re-rendre le template
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    const enrollmentId = Number(enrollment.id);
    const statusText =
      targetSession.present === true
        ? 'Présent'
        : targetSession.present === false
          ? 'Absent'
          : 'Non émargé';

    this.enrollmentService.saveCustomPlan(enrollmentId, updatedJson, plan.noteFormateur).subscribe({
      next: (res) => {
        // Si le serveur retourne un customPlan mis à jour, on l'utilise
        if (res && res.customPlan && res.customPlan !== updatedJson) {
          const serverPlan = this.parseCustomPlan(res.customPlan);
          if (serverPlan) {
            this.parsedCustomPlans.set(key, serverPlan);
            enrollment.customPlan = res.customPlan;
            if (localEnroll) localEnroll.customPlan = res.customPlan;
          }
        }
        this.toastService.success(
          `Émargement de ${enrollment.studentFirstName} enregistré : ${statusText}`,
          '📋 Assiduité mise à jour',
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Rollback en cas d'erreur
        targetSession.present = previousVal;
        targetSession.markedAt =
          previousVal !== null && previousVal !== undefined ? targetSession.markedAt : undefined;
        const rollbackPlan = { ...plan };
        this.parsedCustomPlans.set(key, plan);
        const rollbackJson = JSON.stringify(plan);
        enrollment.customPlan = rollbackJson;
        if (localEnroll) localEnroll.customPlan = rollbackJson;
        this.cdr.detectChanges();
        this.toastService.error(
          err?.error?.message || "Erreur lors de l'enregistrement de l'émargement.",
          'Erreur',
        );
      },
    });
  }
}
