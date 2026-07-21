import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormationService } from '../../../core/services/formation.service';
import { EvaluationService, Evaluation } from '../../../core/services/evaluation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Formation, Phase, Seance, Presence } from '../../../core/models/formation.model';
import { User } from '../../../core/models/user.model';
import { Subscription, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface EnrollmentInfo {
  id: string;
  studentId: number;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentAvatar?: string;
  enrollmentDate: string;
}

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fadein">

      <!-- Back Button -->
      <div class="flex items-center gap-3">
        <button (click)="goBack()"
                class="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/70 hover:text-white transition-all group">
          <span class="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Retour aux formations</span>
        </button>
        <span class="text-white/20">|</span>
        <span class="text-xs text-white/40 font-mono">{{ formation?.category }}</span>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
        <div class="w-12 h-12 rounded-full border-2 border-[#C62761]/30 border-t-[#C62761] animate-spin"></div>
        <p class="text-white/40 text-sm">Chargement de la formation...</p>
      </div>

      <ng-container *ngIf="!loading && formation">

        <!-- Formation Header -->
        <div class="glass-card border border-[var(--bridge-border)] p-8 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-[rgba(198,39,97,0.06)] to-[rgba(245,166,35,0.03)] pointer-events-none"></div>
          <div class="relative z-10">
            <div class="flex flex-col lg:flex-row lg:items-start gap-6">
              <!-- Title Block -->
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <span class="text-[10px] px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 uppercase font-mono tracking-widest">
                    {{ formation.category || 'Général' }}
                  </span>
                  <span class="text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border"
                        [class]="getStatusClass(formation.status)">
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
                  <p class="text-2xl font-mono font-bold text-[#F5A623]">{{ formation.phases.length }}</p>
                  <p class="text-[10px] text-white/40 uppercase tracking-wider mt-1">Phases</p>
                </div>
                <div class="text-center p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <p class="text-2xl font-mono font-bold text-[#C62761]">{{ enrollments.length }}</p>
                  <p class="text-[10px] text-white/40 uppercase tracking-wider mt-1">Stagiaires</p>
                </div>
                <div class="text-center p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <p class="text-2xl font-mono font-bold text-emerald-400">{{ getTotalSessions() }}</p>
                  <p class="text-[10px] text-white/40 uppercase tracking-wider mt-1">Séances</p>
                </div>
              </div>
            </div>

            <!-- Formateur Info -->
            <div class="flex items-center gap-3 mt-6 pt-6 border-t border-white/5">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                <img *ngIf="formation.formateurAvatar" [src]="formation.formateurAvatar" class="w-full h-full object-cover" [alt]="formation.formateurNom" />
                <span *ngIf="!formation.formateurAvatar">{{ formation.formateurNom[0] }}</span>
              </div>
              <div>
                <p class="text-sm font-semibold text-white">{{ formation.formateurNom }}</p>
                <p class="text-xs text-white/40">Formateur Principal</p>
              </div>
              <div class="ml-auto">
                <span class="text-lg font-mono font-bold text-[#F5A623]">{{ formation.totalPrice | number }} TND</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="flex gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-xl w-fit">
          <button *ngFor="let tab of tabs" (click)="activeTab = tab.id"
                  class="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                  [class]="activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-[0_0_15px_rgba(198,39,97,0.3)]'
                    : 'text-white/50 hover:text-white hover:bg-white/5'">
            {{ tab.icon }} {{ tab.label }}
            <span *ngIf="tab.count !== undefined"
                  class="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-mono"
                  [class]="activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'">
              {{ tab.count }}
            </span>
          </button>
        </div>

        <!-- Tab: Phases & Séances -->
        <div *ngIf="activeTab === 'phases'" class="space-y-4">
          <div *ngFor="let phase of formation.phases; let pi = index"
               class="glass-card border border-[var(--bridge-border)] overflow-hidden transition-all duration-300 hover:border-[rgba(198,39,97,0.2)]"
               [style.animation-delay]="(pi * 80) + 'ms'"
               style="animation: fadeSlideIn 0.4s ease both">

            <!-- Phase Header -->
            <button (click)="togglePhase(phase.id)"
                    class="w-full flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors text-left">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm flex-shrink-0"
                   [class]="getPhaseStatusBg(phase.status)">
                {{ phase.numero }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-syne font-bold text-white text-sm">{{ phase.nom }}</h3>
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border"
                        [class]="getPhaseStatusBadge(phase.status)">
                    {{ getPhaseStatusText(phase.status) }}
                  </span>
                </div>
                <p class="text-xs text-white/40 mt-0.5 line-clamp-1">{{ phase.description }}</p>
              </div>
              <div class="flex items-center gap-4 flex-shrink-0">
                <div class="text-right hidden sm:block">
                  <p class="text-xs text-white/40">{{ phase.seances ? phase.seances.length : 0 }} séances</p>
                  <div class="flex items-center gap-2 mt-1">
                    <div class="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div class="h-full rounded-full bg-gradient-to-r from-[#C62761] to-[#F5A623] transition-all duration-700"
                           [style.width]="(phase.progression || 0) + '%'"></div>
                    </div>
                    <span class="text-[10px] font-mono text-white/40">{{ phase.progression }}%</span>
                  </div>
                </div>
                <span class="text-white/30 text-lg">{{ expandedPhase === phase.id ? '▲' : '▼' }}</span>
              </div>
            </button>

            <!-- Phase Expanded: Sessions -->
            <div *ngIf="expandedPhase === phase.id" class="border-t border-white/5 p-5 space-y-3 bg-black/20">
              <p class="text-xs text-white/50 leading-relaxed mb-4">{{ phase.description }}</p>
              <div *ngIf="phase.seances && phase.seances.length > 0" class="space-y-3">
                <h4 class="text-[11px] text-white/40 uppercase tracking-widest font-semibold">Séances</h4>
                <div *ngFor="let seance of phase.seances; let si = index"
                     class="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-[rgba(198,39,97,0.2)] transition-all group">
                  <div class="flex-shrink-0 text-center w-14">
                    <div class="text-[10px] font-bold uppercase text-[#F5A623]">{{ formatDay(seance.date) }}</div>
                    <div class="text-lg font-mono font-bold text-white">{{ formatDayNum(seance.date) }}</div>
                  </div>
                  <div class="w-px h-8 bg-white/10 flex-shrink-0"></div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-mono font-bold text-[#F5A623]">{{ seance.heureDebut }}</span>
                      <span class="text-white/20">·</span>
                      <span class="text-xs text-white/40">{{ seance.duree }}</span>
                      <span *ngIf="seance.type === 'EN_LIGNE'"
                            class="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-bold">
                        🌐 EN LIGNE
                      </span>
                    </div>
                    <p class="text-xs text-white/50 mt-0.5">📍 {{ seance.salle }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-white/30 font-mono">
                      {{ getPresenceCount(seance) }}/{{ seance.presences?.length || 0 }} présents
                    </span>
                    <button *ngIf="canManage && isToday(seance.date)"
                            (click)="openAttendance(seance)"
                            class="px-3 py-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-[#C62761] to-[#F5A623] rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                      Appel →
                    </button>
                    <span *ngIf="isPast(seance.date)" class="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">✓</span>
                    <span *ngIf="isToday(seance.date) && !isPast(seance.date)" class="text-[10px] px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full animate-pulse">AUJOURD'HUI</span>
                  </div>
                </div>
              </div>
              <div *ngIf="!phase.seances || phase.seances.length === 0"
                   class="text-center py-6 text-white/30 text-xs">
                📅 Aucune séance dans cette phase
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Stagiaires -->
        <div *ngIf="activeTab === 'stagiaires'" class="space-y-4">
          <div *ngIf="enrollments.length > 0">
            <!-- Search Bar -->
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
              <input [(ngModel)]="searchQuery" type="text" placeholder="Rechercher un stagiaire..."
                     class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors" />
            </div>

            <!-- Student Cards -->
            <div class="grid md:grid-cols-2 gap-4">
              <div *ngFor="let e of filteredEnrollments; let i = index"
                   class="glass-card border border-[var(--bridge-border)] p-5 hover:border-[rgba(198,39,97,0.3)] transition-all group"
                   [style.animation-delay]="(i * 60) + 'ms'"
                   style="animation: fadeSlideIn 0.4s ease both">
                <div class="flex items-center gap-4">
                  <!-- Avatar -->
                  <div class="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden ring-2 ring-white/10 group-hover:ring-[#C62761]/40 transition-all">
                    <img *ngIf="e.studentAvatar" [src]="e.studentAvatar" class="w-full h-full object-cover" [alt]="e.studentFirstName" />
                    <div *ngIf="!e.studentAvatar"
                         class="w-full h-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center font-bold text-white text-sm">
                      {{ e.studentFirstName[0] }}{{ e.studentLastName[0] }}
                    </div>
                  </div>
                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-white text-sm">{{ e.studentFirstName }} {{ e.studentLastName }}</p>
                    <p class="text-xs text-white/40 truncate">{{ e.studentEmail }}</p>
                    <p class="text-[10px] text-white/30 mt-1">Inscrit le {{ e.enrollmentDate | date:'d MMM y' }}</p>
                  </div>
                  <!-- Actions -->
                  <div class="flex flex-col items-end gap-2">
                    <button *ngIf="canManage && canEvaluate()"
                            (click)="openEvalForStudent(e)"
                            class="px-3 py-1.5 text-[11px] font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      ⭐ Évaluer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="enrollments.length === 0"
               class="glass-card border border-[var(--bridge-border)] p-12 text-center">
            <div class="text-5xl mb-4">👥</div>
            <p class="font-syne font-bold text-lg text-white">Aucun stagiaire inscrit</p>
            <p class="text-white/40 text-sm mt-2">Les inscriptions n'ont pas encore commencé.</p>
          </div>
        </div>

        <!-- Tab: Évaluations -->
        <div *ngIf="activeTab === 'evaluations'" class="space-y-4">
          <div *ngIf="phaseEvaluations.length > 0" class="space-y-3">
            <div *ngFor="let ev of phaseEvaluations; let i = index"
                 class="glass-card border border-[var(--bridge-border)] p-5 hover:border-[rgba(198,39,97,0.2)] transition-all"
                 [style.animation-delay]="(i * 60) + 'ms'"
                 style="animation: fadeSlideIn 0.4s ease both">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                    <img *ngIf="ev.studentAvatar" [src]="ev.studentAvatar" class="w-full h-full object-cover" />
                    <span *ngIf="!ev.studentAvatar">{{ ev.studentFirstName?.[0] }}{{ ev.studentLastName?.[0] }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-white">{{ ev.studentFirstName }} {{ ev.studentLastName }}</p>
                    <p class="text-xs text-white/40">{{ ev.phaseTitle }} · {{ ev.evaluationDate | date:'d MMM y' }}</p>
                    <p class="text-xs text-white/30 mt-1 max-w-sm line-clamp-1">{{ ev.comment }}</p>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <span class="text-lg font-mono font-bold px-4 py-2 rounded-xl"
                        [class]="getGradeClass(ev.grade)">
                    {{ ev.grade }}/20
                  </span>
                  <p class="text-[10px] text-white/30 mt-1">{{ getGradeLabel(ev.grade) }}</p>
                </div>
              </div>
              <div *ngIf="ev.skills" class="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-1.5">
                <span *ngFor="let skill of ev.skills.split(',')"
                      class="text-[10px] px-2 py-0.5 bg-[rgba(245,166,35,0.1)] text-[#F5A623] border border-[rgba(245,166,35,0.2)] rounded-full font-medium">
                  {{ skill.trim() }}
                </span>
              </div>
            </div>
          </div>
          <div *ngIf="phaseEvaluations.length === 0"
               class="glass-card border border-[var(--bridge-border)] p-12 text-center">
            <div class="text-5xl mb-4">📝</div>
            <p class="font-syne font-bold text-lg text-white">Aucune évaluation saisie</p>
            <p class="text-white/40 text-sm mt-2">Commencez à évaluer vos stagiaires pour chaque phase.</p>
          </div>
        </div>

        <!-- CTA Banner: Evaluate (if formation terminée) -->
        <div *ngIf="canEvaluate() && canManage && activeTab !== 'evaluations'"
             class="glass-card border border-purple-500/30 bg-purple-500/5 p-6 flex flex-col sm:flex-row items-center gap-4">
          <div class="flex items-center gap-4 flex-1">
            <span class="text-3xl">🏅</span>
            <div>
              <p class="font-syne font-bold text-white">Formation terminée — Évaluations disponibles</p>
              <p class="text-sm text-white/50 mt-1">
                Toutes les phases sont complètes. Vous pouvez maintenant évaluer chaque stagiaire.
                Une note ≥ 14/20 génèrera automatiquement le certificat blockchain.
              </p>
            </div>
          </div>
          <button (click)="activeTab = 'evaluations'"
                  class="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)]">
            Voir les Évaluations →
          </button>
        </div>

      </ng-container>

      <!-- Attendance Modal -->
      <div *ngIf="showAttendanceModal"
           class="bridge-modal-overlay"
           (click)="closeAttendance()">
        <div class="glass-card border border-[var(--bridge-border)] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
             (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-[var(--bridge-border)]">
            <div>
              <h3 class="font-syne font-bold text-lg text-white">📋 Feuille de Présence — Appel</h3>
              <p class="text-xs text-white/40 mt-0.5">
                {{ selectedSeance?.formationNom }} · {{ selectedSeance?.date | date:'EEEE d MMMM y' }}
              </p>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-center">
                <span class="text-2xl font-mono font-bold text-emerald-400">{{ getPresentInModal() }}</span>
                <span class="text-white/30">/</span>
                <span class="text-lg font-mono text-white/50">{{ activePresences.length }}</span>
                <p class="text-[10px] text-white/40 uppercase tracking-wider">présents</p>
              </div>
              <button (click)="closeAttendance()" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">✕</button>
            </div>
          </div>

          <!-- Presence Table (3 States: Présent | Retard | Absent) -->
          <div class="flex-1 overflow-y-auto p-6 space-y-3">
            <div *ngFor="let p of activePresences; let i = index"
                 class="p-4 rounded-xl border transition-all"
                 [class]="getPresenceCardClass(p)"
                 [style.animation-delay]="(i * 40) + 'ms'"
                 style="animation: fadeSlideIn 0.3s ease both">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {{ p.stagiaireNom?.[0] || 'S' }}
                  </div>
                  <div>
                    <p class="font-semibold text-white text-sm">{{ p.stagiaireNom }}</p>
                    <div class="flex items-center gap-1 mt-1" *ngIf="p.present">
                      <button *ngFor="let star of [1,2,3,4,5]"
                              (click)="p.starRating = star"
                              class="text-base transition-transform hover:scale-125 focus:outline-none"
                              [class]="(p.starRating || 0) >= star ? 'text-[#F5A623]' : 'text-white/15'">★</button>
                    </div>
                  </div>
                </div>
                <!-- 3 States Buttons -->
                <div class="flex items-center gap-1.5 self-end sm:self-center">
                  <button (click)="setPresenceStatus(p, 'PRESENT')"
                          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          [class]="p.present && !isRetard(p)
                            ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                            : 'bg-white/5 text-white/50 hover:bg-emerald-500/20 hover:text-emerald-400'">
                    ✓ Présent
                  </button>
                  <button (click)="setPresenceStatus(p, 'RETARD')"
                          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          [class]="p.present && isRetard(p)
                            ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,166,35,0.4)]'
                            : 'bg-white/5 text-white/50 hover:bg-amber-500/20 hover:text-amber-400'">
                    ⏰ Retard
                  </button>
                  <button (click)="setPresenceStatus(p, 'ABSENT')"
                          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          [class]="!p.present
                            ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                            : 'bg-white/5 text-white/50 hover:bg-rose-500/20 hover:text-rose-400'">
                    ✗ Absent
                  </button>
                </div>
              </div>
              <div class="mt-2.5 pt-2 border-t border-white/5" *ngIf="p.present">
                <input [(ngModel)]="p.sessionNote" type="text"
                       class="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C62761]/50 transition-colors"
                       placeholder="Remarque ou appréciation rapide..." />
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-6 border-t border-[var(--bridge-border)] flex gap-3">
            <button (click)="closeAttendance()"
                    class="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 font-semibold rounded-xl transition-all">
              Annuler
            </button>
            <button (click)="saveAttendance()"
                    [disabled]="savingAttendance"
                    class="flex-1 py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-40 transition-all">
              {{ savingAttendance ? 'Enregistrement...' : 'Valider l\'Appel (' + getPresentInModal() + '/' + activePresences.length + ')' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Evaluation Modal -->
      <div *ngIf="showEvalModal && selectedEnrollment"
           class="bridge-modal-overlay"
           (click)="closeEvalModal()">
        <div class="glass-card border border-[var(--bridge-border)] w-full max-w-lg p-6 space-y-5 shadow-2xl"
             (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between">
            <h3 class="font-syne font-bold text-lg text-white">⭐ Évaluation Stagiaire</h3>
            <button (click)="closeEvalModal()" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">✕</button>
          </div>

          <!-- Student Info -->
          <div class="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
              <img *ngIf="selectedEnrollment.studentAvatar" [src]="selectedEnrollment.studentAvatar" class="w-full h-full object-cover" />
              <span *ngIf="!selectedEnrollment.studentAvatar">{{ selectedEnrollment.studentFirstName?.[0] || 'S' }}</span>
            </div>
            <div>
              <p class="font-semibold text-white">{{ selectedEnrollment.studentFirstName }} {{ selectedEnrollment.studentLastName }}</p>
              <p class="text-xs text-white/40">{{ selectedEnrollment.studentEmail }}</p>
            </div>
          </div>

          <!-- Phase Selection -->
          <div>
            <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold">Phase évaluée</label>
            <select [(ngModel)]="evalForm.phaseId"
                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors">
              <option value="" class="bg-[#10102A]">Sélectionner une phase par nom...</option>
              <option *ngFor="let phase of formation!.phases" [value]="phase.id" class="bg-[#10102A]">
                Phase {{ phase.numero }} — {{ phase.nom }}
              </option>
            </select>
          </div>

          <!-- Rating Stars -->
          <div>
            <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold font-syne">Étoiles</label>
            <div class="flex items-center gap-2">
              <button *ngFor="let star of [1,2,3,4,5]"
                      (click)="evalStarRating = star"
                      class="text-2xl transition-transform hover:scale-125 focus:outline-none"
                      [class]="(evalStarRating || 5) >= star ? 'text-[#F5A623]' : 'text-white/20'">★</button>
              <span class="text-xs text-white/40 font-mono ml-2">{{ evalStarRating }}/5</span>
            </div>
          </div>

          <!-- Grade -->
          <div>
            <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold font-syne">Note (/20)</label>
            <div class="flex items-center gap-4">
              <input [(ngModel)]="evalForm.grade" type="range" min="0" max="20" step="0.5"
                     class="flex-1 accent-[#C62761]" />
              <span class="text-2xl font-mono font-bold w-16 text-right"
                    [class]="getGradeClass(evalForm.grade)">
                {{ evalForm.grade }}
              </span>
            </div>
            <div class="flex justify-between text-[10px] text-white/30 mt-1 px-1">
              <span>0</span><span>5</span><span>10</span><span>15</span><span>20</span>
            </div>
          </div>

          <!-- Skills -->
          <div>
            <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold">Compétences acquises</label>
            <input [(ngModel)]="evalForm.skills" type="text"
                   class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors"
                   placeholder="Ex: Angular, TypeScript, RxJS" />
          </div>

          <!-- Comment -->
          <div>
            <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold">Commentaire & Appréciation</label>
            <textarea [(ngModel)]="evalForm.comment" rows="3"
                      class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors resize-none"
                      placeholder="Appréciation générale sur la progression..."></textarea>
          </div>

          <!-- Certificate Notice -->
          <div *ngIf="evalForm.grade >= 14"
               class="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span class="text-emerald-400 text-xl">🏅</span>
            <div>
              <p class="text-emerald-400 text-sm font-semibold">Certificat Blockchain sera généré</p>
              <p class="text-emerald-400/70 text-xs">Note ≥ 14/20 — Le certificat sera envoyé par email automatiquement</p>
            </div>
          </div>

          <!-- Submit -->
          <button (click)="submitEvaluation()"
                  [disabled]="!evalForm.phaseId || evalForm.grade === null || submittingEval"
                  class="w-full py-3.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(198,39,97,0.2)]">
            {{ submittingEval ? '✓ Enregistrement...' : 'Enregistrer l\'évaluation' }}
          </button>
        </div>
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
export class FormationDetailComponent implements OnInit, OnDestroy {
  formation: Formation | null = null;
  enrollments: EnrollmentInfo[] = [];
  phaseEvaluations: Evaluation[] = [];
  loading = true;
  activeTab = 'phases';
  expandedPhase: string | null = null;
  searchQuery = '';
  user: User | null = null;

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

  get tabs() {
    return [
      { id: 'phases', label: 'Phases & Séances', icon: '🗂️', count: this.formation?.phases.length },
      { id: 'stagiaires', label: 'Stagiaires', icon: '👥', count: this.enrollments.length },
      { id: 'evaluations', label: 'Évaluations', icon: '📝', count: this.phaseEvaluations.length }
    ];
  }

  get canManage(): boolean {
    return this.user?.role === 'FORMATEUR' || this.user?.role === 'ADMIN';
  }

  get filteredEnrollments(): EnrollmentInfo[] {
    if (!this.searchQuery.trim()) return this.enrollments;
    const q = this.searchQuery.toLowerCase();
    return this.enrollments.filter(e =>
      e.studentFirstName.toLowerCase().includes(q) ||
      e.studentLastName.toLowerCase().includes(q) ||
      e.studentEmail.toLowerCase().includes(q)
    );
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formationService: FormationService,
    private evaluationService: EvaluationService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.formationId = this.route.snapshot.paramMap.get('id') || '';
    this.loadFormationDetails();
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

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
        error: () => { this.loading = false; }
      })
    );
  }

  loadEnrollments(): void {
    this.sub.add(
      this.http.get<EnrollmentInfo[]>(`http://localhost:8080/api/enrollments/formation/${this.formationId}`).subscribe({
        next: (data) => { this.enrollments = data || []; },
        error: () => {}
      })
    );
  }

  loadAllEvaluations(): void {
    if (!this.formation) return;
    const evalRequests = this.formation.phases.map(p =>
      this.evaluationService.getEvaluationsByPhase(p.id)
    );
    if (evalRequests.length === 0) return;
    this.sub.add(
      forkJoin(evalRequests).subscribe({
        next: (results) => {
          this.phaseEvaluations = results.flat();
        },
        error: () => {}
      })
    );
  }

  goBack(): void {
    this.router.navigate([this.user?.role === 'FORMATEUR' ? '/dashboard/formateur/formations' : '/dashboard/formations']);
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
    return this.activePresences.filter(p => p.present).length;
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
        error: () => { this.savingAttendance = false; }
      })
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
      comment: this.evalForm.comment
    };
    this.sub.add(
      this.evaluationService.saveEvaluation(payload).subscribe({
        next: () => {
          this.loadAllEvaluations();
          setTimeout(() => { this.closeEvalModal(); }, 800);
        },
        error: () => { this.submittingEval = false; }
      })
    );
  }

  // Helpers
  getPresenceCount(seance: Seance): number {
    return seance.presences?.filter(p => p.present).length || 0;
  }

  isToday(date: Date): boolean {
    const d = new Date(date);
    const today = new Date();
    return d.getFullYear() === today.getFullYear() &&
           d.getMonth() === today.getMonth() &&
           d.getDate() === today.getDate();
  }

  isPast(date: Date): boolean {
    return new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));
  }

  getTotalSessions(): number {
    return this.formation?.phases.reduce((sum, p) => sum + (p.seances?.length || 0), 0) || 0;
  }

  formatDay(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
  }

  formatDayNum(date: Date): string {
    return new Date(date).getDate().toString().padStart(2, '0');
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
      case 'ACTIVE': return 'En cours';
      case 'TERMINEE': return 'Terminée';
      case 'PLANIFIEE': return 'Planifiée';
      default: return status;
    }
  }

  getPhaseStatusBg(status: string): string {
    switch (status) {
      case 'COMPLETEE': return 'bg-emerald-500/20 text-emerald-400';
      case 'EN_COURS': return 'bg-gradient-to-br from-[#C62761] to-[#F5A623] text-white';
      case 'VERROUILLEE': return 'bg-white/5 text-white/30';
      default: return 'bg-white/5 text-white/30';
    }
  }

  getPhaseStatusBadge(status: string): string {
    switch (status) {
      case 'COMPLETEE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'EN_COURS': return 'bg-[rgba(198,39,97,0.1)] text-[#C62761] border-[rgba(198,39,97,0.2)]';
      case 'VERROUILLEE': return 'bg-white/5 text-white/30 border-white/10';
      default: return 'bg-white/5 text-white/30 border-white/10';
    }
  }

  getPhaseStatusText(status: string): string {
    switch (status) {
      case 'COMPLETEE': return '✓ Complétée';
      case 'EN_COURS': return '▶ En cours';
      case 'VERROUILLEE': return '🔒 Verrouillée';
      default: return status;
    }
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
}
