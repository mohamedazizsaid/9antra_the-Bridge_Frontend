import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { FormationService } from '../../../../core/services/formation.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { Formation, Phase, Seance, Presence } from '../../../../core/models/formation.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-formateur-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">

      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="font-syne font-bold text-2xl md:text-3xl text-white">
            Bonjour, <span class="text-[#F5A623]">{{ user?.prenom }} {{ user?.nom }}</span> 👨‍🏫
          </h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">{{ getTodaySummary() }}</p>
        </div>
        <div class="text-sm text-[var(--bridge-text-muted)] font-mono bg-white/5 border border-white/10 px-4 py-2 rounded-xl">{{ today }}</div>
      </div>

      <!-- Session Notification Banner -->
      <div *ngIf="hasSessionSoon"
           class="relative overflow-hidden rounded-2xl border border-[rgba(245,166,35,0.3)] bg-gradient-to-r from-[rgba(245,166,35,0.08)] to-[rgba(198,39,97,0.05)] p-5">
        <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(circle at 20% 50%, rgba(245,166,35,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(198,39,97,0.1) 0%, transparent 60%)"></div>
        <div class="relative z-10 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-[rgba(245,166,35,0.15)] flex items-center justify-center text-2xl flex-shrink-0 animate-pulse">
            ⏰
          </div>
          <div class="flex-1">
            <p class="font-syne font-bold text-white">Séance qui commence bientôt !</p>
            <p class="text-sm text-white/60 mt-0.5">
              {{ todaySeances[0]?.formationNom }} — {{ todaySeances[0]?.heureDebut }} en {{ todaySeances[0]?.salle }}
            </p>
          </div>
          <button (click)="openAttendanceModal(todaySeances[0])"
                  class="flex-shrink-0 px-4 py-2.5 bg-[#F5A623] text-black font-bold rounded-xl text-sm hover:opacity-90 transition-all shadow-[0_0_20px_rgba(245,166,35,0.3)]">
            📋 Faire l'Appel
          </button>
        </div>
      </div>

      <!-- Quick Actions Bar -->
      <div class="flex flex-wrap gap-3 p-4 rounded-2xl bg-gradient-to-r from-[rgba(198,39,97,0.08)] to-[rgba(245,166,35,0.05)] border border-[rgba(198,39,97,0.15)]">
        <button (click)="openQuickAttendance()"
                class="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-105 shadow-[0_0_15px_rgba(198,39,97,0.3)]">
          📋 Faire l'Appel
        </button>
        <button (click)="openEvalModal()"
                class="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-semibold border border-white/10 transition-all hover:border-white/20">
          ⭐ Évaluer un stagiaire
        </button>
        <button (click)="goToFormations()"
                class="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-semibold border border-white/10 transition-all hover:border-white/20">
          🏫 Mes formations
        </button>
        <button (click)="goToEvaluations()"
                class="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-semibold border border-white/10 transition-all hover:border-white/20">
          📝 Historique évals
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-5 border border-[var(--bridge-border)] group hover:border-[rgba(245,166,35,0.3)] transition-all hover:scale-[1.02]">
          <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider">Formations</p>
          <p class="text-3xl font-mono font-bold text-[#F5A623] mt-2">{{ formations.length }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">assignées</p>
        </div>
        <div class="glass-card p-5 border border-[var(--bridge-border)] group hover:border-[rgba(198,39,97,0.3)] transition-all hover:scale-[1.02]">
          <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider">Stagiaires</p>
          <p class="text-3xl font-mono font-bold text-[#C62761] mt-2">{{ totalStagiaires }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">total</p>
        </div>
        <div class="glass-card p-5 border border-[var(--bridge-border)] group hover:border-emerald-500/30 transition-all hover:scale-[1.02]">
          <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider">Séances Aujourd'hui</p>
          <p class="text-3xl font-mono font-bold mt-2" [class]="todaySeances.length > 0 ? 'text-emerald-400' : 'text-white/30'">
            {{ todaySeances.length }}
          </p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">programmées</p>
        </div>
        <div class="glass-card p-5 border border-[var(--bridge-border)] group hover:border-purple-500/30 transition-all hover:scale-[1.02]">
          <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider">Évaluations</p>
          <p class="text-3xl font-mono font-bold text-purple-400 mt-2">{{ evaluations.length }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">saisies</p>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid lg:grid-cols-3 gap-6">

        <!-- Left: Sessions + Formations -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Today's Sessions -->
          <div class="glass-card border border-[var(--bridge-border)] p-6">
            <div class="flex items-center justify-between mb-5">
              <h3 class="font-syne font-bold text-lg">📋 Séances d'Aujourd'hui</h3>
              <span *ngIf="todaySeances.length > 0"
                    class="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold animate-pulse">
                AUJOURD'HUI
              </span>
            </div>

            <div class="space-y-4" *ngIf="todaySeances.length > 0">
              <div *ngFor="let seance of todaySeances"
                   class="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-[rgba(198,39,97,0.25)] transition-all group cursor-pointer"
                   (click)="openAttendanceModal(seance)">
                <div class="text-center min-w-[56px] flex-shrink-0">
                  <div class="text-sm font-mono font-bold text-[#F5A623]">{{ seance.heureDebut }}</div>
                  <div class="text-[10px] text-white/30 mt-0.5">{{ seance.duree }}</div>
                </div>
                <div class="w-px h-10 bg-white/10 flex-shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-white text-sm truncate">{{ seance.formationNom }}</p>
                  <p class="text-xs text-white/40 mt-0.5">
                    📍 {{ seance.salle }} ·
                    <span class="font-mono">{{ getPresentCount(seance) }}/{{ seance.presences?.length || '?' }}</span> présents
                  </p>
                </div>
                <div class="flex-shrink-0 flex items-center gap-2">
                  <span *ngIf="seance.type === 'EN_LIGNE'"
                        class="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-bold">
                    🌐 EN LIGNE
                  </span>
                  <button class="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#C62761] to-[#F5A623] rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    Appel →
                  </button>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-center py-8 text-white/30" *ngIf="todaySeances.length === 0">
              <span class="text-4xl mb-3">📅</span>
              <p class="text-sm font-medium text-white/50">Aucune séance aujourd'hui</p>
              <p class="text-xs mt-1">Profitez de ce temps pour préparer vos évaluations</p>
            </div>
          </div>

          <!-- Formations Accordion -->
          <div class="glass-card border border-[var(--bridge-border)] p-6">
            <h3 class="font-syne font-bold text-lg mb-5">🏫 Mes Formations</h3>
            <div class="space-y-3">
              <div *ngFor="let formation of formations"
                   class="border border-white/5 rounded-xl overflow-hidden hover:border-[rgba(198,39,97,0.2)] transition-all">
                <button (click)="toggleFormation(formation.id)"
                        class="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {{ formation.nom[0] }}
                    </div>
                    <div class="text-left min-w-0">
                      <p class="text-sm font-semibold text-white truncate">{{ formation.nom }}</p>
                      <p class="text-xs text-white/40">{{ formation.phases.length || 0 }} phases · {{ formation.stagiaires ? formation.stagiaires.length : 0 }} stagiaires</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 flex-shrink-0">
                    <button (click)="$event.stopPropagation(); goToFormationDetail(formation)"
                            class="px-3 py-1.5 text-[11px] font-bold bg-white/5 hover:bg-[rgba(198,39,97,0.1)] text-white/60 hover:text-[#C62761] border border-white/10 rounded-lg transition-all">
                      Détails →
                    </button>
                    <span class="text-white/30 text-sm">{{ expandedFormation === formation.id ? '▲' : '▼' }}</span>
                  </div>
                </button>
                <div *ngIf="expandedFormation === formation.id"
                     class="px-4 pb-4 space-y-2 border-t border-white/5 bg-black/10">
                  <div *ngFor="let phase of formation.phases"
                       class="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <div class="flex items-center gap-3">
                      <span class="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
                            [class]="getPhaseChipClass(phase.status)">{{ phase.numero }}</span>
                      <span class="text-xs text-white/60">{{ phase.nom }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full rounded-full bg-gradient-to-r from-[#C62761] to-[#F5A623] transition-all duration-700"
                             [style.width]="phase.progression + '%'"></div>
                      </div>
                      <span class="text-xs font-mono text-white/40 w-9 text-right">{{ phase.progression }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-center text-white/30 py-8 text-sm" *ngIf="formations.length === 0">
              Aucune formation assignée
            </div>
          </div>

          <!-- Recent Evaluations Preview -->
          <div class="glass-card border border-[var(--bridge-border)] p-6">
            <div class="flex items-center justify-between mb-5">
              <h3 class="font-syne font-bold text-lg">📝 Évaluations récentes</h3>
              <button (click)="goToEvaluations()"
                      class="text-xs text-[#C62761] hover:text-[#F5A623] font-semibold transition-colors">
                Voir tout →
              </button>
            </div>
            <div class="space-y-3" *ngIf="evaluations.length > 0">
              <div *ngFor="let ev of evaluations.slice(0,5)"
                   class="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[rgba(198,39,97,0.15)] transition-all">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden">
                    <img *ngIf="ev.studentAvatar" [src]="ev.studentAvatar" class="w-full h-full object-cover" />
                    <span *ngIf="!ev.studentAvatar">{{ ev.studentFirstName?.[0] }}{{ ev.studentLastName?.[0] }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-white truncate">{{ ev.studentFirstName }} {{ ev.studentLastName }}</p>
                    <p class="text-xs text-white/40 truncate">{{ ev.phaseTitle }}</p>
                  </div>
                </div>
                <span class="text-sm font-mono font-bold px-3 py-1 rounded-xl flex-shrink-0"
                      [class]="getGradeBadgeClass(ev.grade)">
                  {{ ev.grade }}/20
                </span>
              </div>
            </div>
            <div class="text-center text-white/30 py-8 text-sm" *ngIf="evaluations.length === 0">
              Aucune évaluation saisie
            </div>
          </div>
        </div>

        <!-- Right: Attendance Stats + Upcoming -->
        <div class="space-y-6">
          <!-- Attendance Chart -->
          <div class="glass-card border border-[var(--bridge-border)] p-6">
            <div class="flex items-center justify-between mb-5">
              <h3 class="font-syne font-bold text-base">📊 Assiduité</h3>
              <span class="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                ~{{ getGlobalAttendance() }}% moy.
              </span>
            </div>
            <div class="space-y-4">
              <div *ngFor="let formation of formations" class="space-y-1.5">
                <div class="flex justify-between text-xs">
                  <span class="text-white/60 truncate flex-1 pr-2 max-w-[130px]">{{ formation.nom }}</span>
                  <span class="text-[#F5A623] font-mono font-semibold">{{ getAttendanceRate(formation) }}%</span>
                </div>
                <div class="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-to-r from-[#C62761] to-[#F5A623] transition-all duration-1000"
                       [style.width]="getAttendanceRate(formation) + '%'"></div>
                </div>
              </div>
            </div>
            <div *ngIf="formations.length === 0" class="text-center text-white/30 text-xs py-4">
              Aucune donnée disponible
            </div>
          </div>

          <!-- Upcoming Sessions -->
          <div class="glass-card border border-[var(--bridge-border)] p-6">
            <h3 class="font-syne font-bold text-base mb-5">📅 Prochaines Séances</h3>
            <div class="space-y-3">
              <div *ngFor="let seance of upcomingSeances"
                   class="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[rgba(198,39,97,0.15)] transition-all">
                <div class="text-center min-w-[40px] flex-shrink-0">
                  <div class="text-[10px] font-bold uppercase text-[#F5A623]">{{ formatDay(seance.date) }}</div>
                  <div class="text-lg font-mono font-bold text-white">{{ formatDayNum(seance.date) }}</div>
                </div>
                <div class="w-px h-8 bg-white/10 flex-shrink-0"></div>
                <div class="min-w-0">
                  <p class="text-xs font-semibold text-white truncate">{{ seance.formationNom }}</p>
                  <p class="text-[10px] text-white/40">{{ seance.heureDebut }} · {{ seance.salle }}</p>
                </div>
              </div>
            </div>
            <div class="text-center text-white/30 text-xs py-4" *ngIf="upcomingSeances.length === 0">
              Aucune séance à venir
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Attendance Sheet Modal ────────────────────────────── -->
      <div *ngIf="showAttendanceModal"
           class="bridge-modal-overlay"
           (click)="closeAttendanceModal()">
        <div class="glass-card border border-[var(--bridge-border)] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
             (click)="$event.stopPropagation()">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-[var(--bridge-border)]">
            <div>
              <h3 class="font-syne font-bold text-lg text-white">📋 Feuille de Présence — Appel</h3>
              <p class="text-xs text-white/40 mt-0.5" *ngIf="selectedSeance">
                {{ selectedSeance.formationNom }} · {{ selectedSeance.date | date:'EEEE d MMMM y' }}
              </p>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-center">
                <span class="text-2xl font-mono font-bold text-emerald-400">{{ getPresentInModal() }}</span>
                <span class="text-white/30 text-lg">/{{ activePresences.length }}</span>
                <p class="text-[10px] text-white/40 uppercase tracking-wider">présents</p>
              </div>
              <button (click)="closeAttendanceModal()" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">✕</button>
            </div>
          </div>

          <!-- Presences List (3 States: Présent, Retard, Absent) -->
          <div class="flex-1 overflow-y-auto p-6 space-y-3">
            <div *ngFor="let presence of activePresences; let i = index"
                 class="p-4 rounded-xl border transition-all"
                 [class]="getPresenceCardClass(presence)"
                 [style.animation-delay]="(i * 40) + 'ms'"
                 style="animation: fadeSlideIn 0.35s ease both">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {{ presence.stagiaireNom?.[0] || 'S' }}
                  </div>
                  <div>
                    <span class="text-sm font-semibold text-white">{{ presence.stagiaireNom }}</span>
                    <!-- Star Rating for Present / Retard -->
                    <div class="flex items-center gap-1 mt-1" *ngIf="presence.present">
                      <button *ngFor="let star of [1,2,3,4,5]"
                              (click)="presence.starRating = star"
                              class="text-base transition-transform hover:scale-125 focus:outline-none"
                              [class]="(presence.starRating || 0) >= star ? 'text-[#F5A623]' : 'text-white/15'">★</button>
                    </div>
                  </div>
                </div>

                <!-- 3 States Buttons: Présent | Retard | Absent -->
                <div class="flex items-center gap-1.5 self-end sm:self-center">
                  <button (click)="setPresenceStatus(presence, 'PRESENT')"
                          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          [class]="presence.present && !isRetard(presence)
                            ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                            : 'bg-white/5 text-white/50 hover:bg-emerald-500/20 hover:text-emerald-400'">
                    ✓ Présent
                  </button>
                  <button (click)="setPresenceStatus(presence, 'RETARD')"
                          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          [class]="presence.present && isRetard(presence)
                            ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,166,35,0.4)]'
                            : 'bg-white/5 text-white/50 hover:bg-amber-500/20 hover:text-amber-400'">
                    ⏰ Retard
                  </button>
                  <button (click)="setPresenceStatus(presence, 'ABSENT')"
                          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          [class]="!presence.present
                            ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                            : 'bg-white/5 text-white/50 hover:bg-rose-500/20 hover:text-rose-400'">
                    ✗ Absent
                  </button>
                </div>
              </div>
              <!-- Quick Note -->
              <div class="mt-3 pt-2.5 border-t border-white/5" *ngIf="presence.present">
                <input [(ngModel)]="presence.sessionNote" type="text"
                       class="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C62761]/50 transition-colors"
                       placeholder="Remarque ou appréciation rapide..." />
              </div>
            </div>
            <div *ngIf="activePresences.length === 0" class="text-center py-8 text-white/30 text-sm">
              Aucun stagiaire enregistré pour cette séance.
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-6 border-t border-[var(--bridge-border)] flex flex-col sm:flex-row gap-3">
            <button (click)="closeSession()" *ngIf="selectedSeance"
                    class="flex-1 py-3 bg-red-500/10 hover:bg-red-500/15 text-red-400 border border-red-500/20 font-bold rounded-xl transition-all text-sm">
              🔒 Clôturer la Séance
            </button>
            <button (click)="saveAttendance()"
                    class="flex-1 py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm shadow-[0_0_15px_rgba(198,39,97,0.25)]">
              ✓ Valider l'Appel ({{ getPresentInModal() }}/{{ activePresences.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- ─── Evaluation Modal ──────────────────────────────────── -->
      <div *ngIf="showEvalModal"
           class="bridge-modal-overlay"
           (click)="closeEvalModal()">
        <div class="glass-card border border-[var(--bridge-border)] w-full max-w-lg p-7 space-y-5 shadow-2xl"
             (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between">
            <h3 class="font-syne font-bold text-lg">⭐ Évaluer un Stagiaire</h3>
            <button (click)="closeEvalModal()" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">✕</button>
          </div>
          <div class="space-y-4">
            <!-- Formation Select -->
            <div>
              <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold">Formation</label>
              <select [(ngModel)]="evalForm.formationId" (change)="onEvalFormationChange()"
                      class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors">
                <option value="" class="bg-[#10102A]">Choisir une formation...</option>
                <option *ngFor="let f of formations" [value]="f.id" class="bg-[#10102A]">
                  {{ f.nom }}
                </option>
              </select>
            </div>

            <!-- Stagiaire Select (By Name) -->
            <div>
              <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold">Stagiaire</label>
              <select [(ngModel)]="evalForm.studentId"
                      class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors">
                <option [ngValue]="null" class="bg-[#10102A]">Sélectionner le stagiaire par nom...</option>
                <option *ngFor="let s of availableStudentsForEval" [ngValue]="s.id" class="bg-[#10102A]">
                  {{ s.prenom }} {{ s.nom }} ({{ s.email }})
                </option>
              </select>
            </div>

            <!-- Phase Select (By Name) -->
            <div>
              <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold">Phase évaluée</label>
              <select [(ngModel)]="evalForm.phaseId"
                      class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors">
                <option [ngValue]="null" class="bg-[#10102A]">Sélectionner la phase par nom...</option>
                <option *ngFor="let p of availablePhasesForEval" [ngValue]="p.id" class="bg-[#10102A]">
                  Phase {{ p.numero }} — {{ p.nom }}
                </option>
              </select>
            </div>

            <!-- Rating Stars (1-5) -->
            <div>
              <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold">Évaluation Étoiles</label>
              <div class="flex items-center gap-2">
                <button *ngFor="let star of [1,2,3,4,5]"
                        (click)="evalForm.starRating = star"
                        class="text-2xl transition-transform hover:scale-125 focus:outline-none"
                        [class]="(evalForm.starRating || 0) >= star ? 'text-[#F5A623]' : 'text-white/20'">★</button>
                <span class="text-xs text-white/50 ml-2 font-mono" *ngIf="evalForm.starRating">
                  {{ evalForm.starRating }}/5 étoiles
                </span>
              </div>
            </div>

            <!-- Grade (/20) -->
            <div>
              <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold">Note (/20)</label>
              <div class="flex items-center gap-4">
                <input [(ngModel)]="evalForm.grade" type="range" min="0" max="20" step="0.5"
                       class="flex-1 accent-[#C62761]" />
                <span class="text-2xl font-mono font-bold w-14 text-right"
                      [class]="getGradeClass(evalForm.grade)">
                  {{ evalForm.grade }}
                </span>
              </div>
            </div>

            <!-- Skills -->
            <div>
              <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold">Compétences acquises</label>
              <input [(ngModel)]="evalForm.skills" type="text"
                     class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors"
                     placeholder="Ex: Spring Boot, Angular, Cybersécurité" />
            </div>

            <!-- Comment -->
            <div>
              <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold">Commentaire & Appréciation</label>
              <textarea [(ngModel)]="evalForm.comment" rows="3"
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors resize-none"
                        placeholder="Appréciation globale sur la progression..."></textarea>
            </div>

            <!-- Blockchain Certificate Banner -->
            <div *ngIf="evalForm.grade >= 14"
                 class="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span class="text-emerald-400 text-xl">🏅</span>
              <p class="text-emerald-400 text-xs font-semibold">Certificat Blockchain sera généré automatiquement (Note ≥ 14/20)</p>
            </div>

            <!-- Submit -->
            <button (click)="submitEvaluation()"
                    [disabled]="!evalForm.studentId || !evalForm.phaseId || evalForm.grade === null"
                    class="w-full py-3.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(198,39,97,0.2)]">
              {{ evalSuccess ? '✓ Évaluation enregistrée !' : 'Enregistrer l\'évaluation' }}
            </button>
          </div>
        </div>
      </div>

    </div>

    <style>
      .bridge-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
        padding: 1rem;
      }
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  `
})
export class FormateurOverviewComponent implements OnInit, OnDestroy {
  user: User | null = null;
  formations: Formation[] = [];
  todaySeances: Seance[] = [];
  upcomingSeances: Seance[] = [];
  evaluations: any[] = [];
  expandedFormation: string | null = null;
  showAttendanceModal = false;
  showEvalModal = false;
  selectedSeance: Seance | null = null;
  activePresences: Presence[] = [];
  evalSuccess = false;
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  private sub = new Subscription();

  evalForm = { formationId: '', studentId: null as any, phaseId: null as any, grade: 10, starRating: 5, skills: '', comment: '' };
  allStudents: User[] = [];
  availableStudentsForEval: User[] = [];
  availablePhasesForEval: Phase[] = [];

  get totalStagiaires(): number {
    return this.formations.reduce((sum, f) => sum + (f.stagiaires?.length || 0), 0);
  }

  get hasSessionSoon(): boolean {
    if (!this.todaySeances.length) return false;
    const now = new Date();
    return this.todaySeances.some(s => {
      const parts = s.heureDebut.split(':');
      const sessionTime = new Date();
      sessionTime.setHours(+parts[0], +parts[1], 0);
      const diff = (sessionTime.getTime() - now.getTime()) / 60000;
      return diff >= 0 && diff <= 60;
    });
  }

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private formationService: FormationService,
    private evaluationService: EvaluationService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) return;

    this.userService.getAllUsers().subscribe(users => {
      this.allStudents = users.filter(u => u.role === 'STAGIAIRE');
      this.availableStudentsForEval = [...this.allStudents];
    });

    this.sub.add(
      this.formationService.getFormationsByFormateur(this.user.id).subscribe(data => {
        this.formations = data;
        if (data.length > 0 && !this.evalForm.formationId) {
          this.evalForm.formationId = data[0].id;
          this.onEvalFormationChange();
        }
      })
    );

    this.sub.add(
      this.formationService.getTodaySeances(this.user.id).subscribe(data => {
        this.todaySeances = data;
      })
    );

    this.sub.add(
      this.formationService.getUpcomingSeances(this.user.id).subscribe(data => {
        this.upcomingSeances = data.filter((_, i) => i < 5);
      })
    );

    this.sub.add(
      this.evaluationService.getEvaluationsByTrainer(this.user.id).subscribe(data => {
        this.evaluations = data;
      })
    );
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  toggleFormation(id: string): void {
    this.expandedFormation = this.expandedFormation === id ? null : id;
  }

  goToFormations(): void {
    this.router.navigate(['/dashboard/formateur/formations']);
  }

  goToEvaluations(): void {
    this.router.navigate(['/dashboard/formateur/evaluations']);
  }

  goToFormationDetail(formation: Formation): void {
    this.router.navigate([`/dashboard/formateur/formations/${formation.id}`]);
  }

  getAttendanceRate(formation: Formation): number {
    if (!formation.phases?.length) return 0;
    const total = formation.phases.reduce((sum, p) => sum + (p.progression || 0), 0);
    return Math.round(total / formation.phases.length);
  }

  getGlobalAttendance(): number {
    if (!this.formations.length) return 0;
    const sum = this.formations.reduce((s, f) => s + this.getAttendanceRate(f), 0);
    return Math.round(sum / this.formations.length);
  }

  getPresentCount(seance: Seance): number {
    return seance.presences?.filter(p => p.present).length || 0;
  }

  getPresentInModal(): number {
    return this.activePresences.filter(p => p.present).length;
  }

  openAttendanceModal(seance: Seance): void {
    this.selectedSeance = seance;
    this.activePresences = seance.presences ? JSON.parse(JSON.stringify(seance.presences)) : [];
    this.showAttendanceModal = true;
  }

  getTodaySummary(): string {
    if (this.todaySeances.length > 0) {
      return `Vous avez ${this.todaySeances.length} séance(s) aujourd'hui`;
    }
    return 'Aucune séance aujourd\'hui';
  }

  openQuickAttendance(): void {
    if (this.todaySeances.length > 0) this.openAttendanceModal(this.todaySeances[0]);
  }

  closeAttendanceModal(): void {
    this.showAttendanceModal = false;
    this.selectedSeance = null;
    this.activePresences = [];
  }

  togglePresence(index: number): void {
    this.activePresences[index].present = !this.activePresences[index].present;
  }

  saveAttendance(): void {
    if (this.selectedSeance) {
      this.formationService.savePresence(this.selectedSeance.id, this.activePresences).subscribe(() => {
        this.selectedSeance!.presences = [...this.activePresences];
        this.closeAttendanceModal();
      });
    }
  }

  closeSession(): void {
    if (this.selectedSeance) {
      if (confirm('Voulez-vous vraiment clôturer cette séance ? Cela validera la progression et déclenchera les certificats si c\'est la dernière séance.')) {
        this.formationService.closeSession(this.selectedSeance.id).subscribe({
          next: () => {
            this.closeAttendanceModal();
          },
          error: (e) => alert(e?.error?.message || 'Erreur lors de la clôture')
        });
      }
    }
  }

  openEvalModal(): void {
    this.showEvalModal = true;
    this.evalSuccess = false;
    if (this.formations.length > 0 && !this.evalForm.formationId) {
      this.evalForm.formationId = this.formations[0].id;
    }
    this.onEvalFormationChange();
  }

  closeEvalModal(): void { this.showEvalModal = false; }

  onEvalFormationChange(): void {
    if (!this.evalForm.formationId) {
      this.availablePhasesForEval = [];
      this.availableStudentsForEval = [...this.allStudents];
      return;
    }
    const f = this.formations.find(item => item.id.toString() === this.evalForm.formationId.toString());
    if (f) {
      this.availablePhasesForEval = f.phases || [];
      if (f.stagiaires && f.stagiaires.length > 0) {
        this.availableStudentsForEval = this.allStudents.filter(st => f.stagiaires.includes(st.id));
        if (this.availableStudentsForEval.length === 0) {
          this.availableStudentsForEval = [...this.allStudents];
        }
      } else {
        this.availableStudentsForEval = [...this.allStudents];
      }
    } else {
      this.availablePhasesForEval = [];
      this.availableStudentsForEval = [...this.allStudents];
    }
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

  submitEvaluation(): void {
    if (!this.evalForm.studentId || !this.evalForm.phaseId || this.evalForm.grade === null || !this.user) return;
    const payload = {
      studentId: this.evalForm.studentId.toString(),
      trainerId: this.user.id,
      phaseId: this.evalForm.phaseId.toString(),
      grade: this.evalForm.grade,
      skills: this.evalForm.skills,
      comment: this.evalForm.comment
    };
    this.evaluationService.saveEvaluation(payload as any).subscribe({
      next: () => {
        this.evalSuccess = true;
        setTimeout(() => {
          this.closeEvalModal();
          this.evalForm = { formationId: '', studentId: null, phaseId: null, grade: 10, starRating: 5, skills: '', comment: '' };
        }, 1500);
      }
    });
  }

  formatDay(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
  }

  formatDayNum(date: Date): string {
    return new Date(date).getDate().toString().padStart(2, '0');
  }

  getPhaseChipClass(status: string): string {
    switch (status) {
      case 'COMPLETEE': return 'bg-emerald-500/20 text-emerald-400';
      case 'EN_COURS': return 'bg-[rgba(198,39,97,0.2)] text-[#C62761]';
      case 'VERROUILLEE': return 'bg-white/5 text-white/30';
      default: return 'bg-white/5 text-white/30';
    }
  }

  getGradeBadgeClass(grade: number): string {
    if (grade >= 16) return 'bg-emerald-500/10 text-emerald-400';
    if (grade >= 14) return 'bg-[rgba(245,166,35,0.1)] text-[#F5A623]';
    if (grade >= 10) return 'bg-blue-500/10 text-blue-400';
    return 'bg-red-500/10 text-red-400';
  }

  getGradeClass(grade: number): string {
    if (grade >= 16) return 'text-emerald-400';
    if (grade >= 14) return 'text-[#F5A623]';
    if (grade >= 10) return 'text-blue-400';
    return 'text-red-400';
  }
}
