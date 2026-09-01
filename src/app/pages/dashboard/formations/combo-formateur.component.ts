import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComboEnrollment, ComboFormationItem } from '../../../core/models/combo-enrollment.model';
import { ComboEnrollmentService } from '../../../core/services/combo-enrollment.service';
import { FormationService } from '../../../core/services/formation.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user.model';
import { Presence, Seance } from '../../../core/models/formation.model';

@Component({
  selector: 'app-combo-formateur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      (click)="onBackdropClick($event)"
    >
      <div class="absolute inset-0 bg-black/80 backdrop-blur-md"></div>

      <div
        class="relative z-10 w-full max-w-5xl max-h-[94vh] flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <div
          class="glass-card border border-[var(--bridge-border)] overflow-hidden flex flex-col max-h-[94vh]"
        >
          <!-- Top bar -->
          <div
            class="h-1.5 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623] flex-shrink-0"
          ></div>

          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20
                          border border-[var(--bridge-gold)]/30 flex items-center justify-center text-[var(--bridge-gold)]"
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
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div>
                <h2 class="font-syne font-bold text-white text-lg">Formations Combo</h2>
                <p class="text-xs text-[var(--bridge-text-muted)]">
                  Suivez vos stagiaires inscrits en parcours personnalisé
                </p>
              </div>
            </div>
            <button
              (click)="close()"
              class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center
                     text-white/50 hover:text-white transition-all text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>

          <!-- Scrollable body -->
          <div class="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
            <!-- Loading -->
            <div *ngIf="loading" class="space-y-4">
              <div
                *ngFor="let _ of [1, 2, 3]"
                class="glass-card border border-[var(--bridge-border)] p-5 animate-pulse h-24"
              ></div>
            </div>

            <!-- Empty state -->
            <div
              *ngIf="!loading && combos.length === 0"
              class="glass-card border border-[var(--bridge-border)] p-16 text-center"
            >
              <div
                class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[var(--bridge-gold)]"
              >
                <svg
                  class="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <p class="font-syne font-bold text-lg text-white">Aucun combo pour vos formations</p>
              <p class="text-[var(--bridge-text-muted)] text-sm mt-2">
                Aucun stagiaire n'a créé de parcours personnalisé incluant vos formations pour le
                moment.
              </p>
            </div>

            <!-- Combo cards -->
            <div
              *ngFor="let combo of combos; let ci = index"
              class="glass-card border border-[var(--bridge-border)] overflow-hidden"
            >
              <!-- Combo header -->
              <div
                class="p-5 flex items-center justify-between border-b border-white/5 cursor-pointer
                          hover:bg-white/[0.02] transition-colors"
                (click)="toggleCombo(combo.id)"
              >
                <div class="flex items-center gap-3">
                  <!-- Avatar stagiaire -->
                  <div
                    class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20
                              border border-white/10 flex items-center justify-center text-sm font-bold text-[#F5A623]"
                  >
                    {{ (combo.studentFirstName || 'S')[0] }}{{ (combo.studentLastName || '')[0] }}
                  </div>
                  <div>
                    <p class="font-semibold text-white text-sm">
                      {{ combo.studentFirstName }} {{ combo.studentLastName }}
                    </p>
                    <p class="text-xs text-[var(--bridge-text-muted)]">
                      {{ combo.studentEmail }} · {{ combo.formations.length }} formation(s)
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span
                    class="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border"
                    [class]="getComboStatusClass(combo.status)"
                  >
                    {{ getComboStatusLabel(combo.status) }}
                  </span>
                  <span class="font-mono font-bold text-[#F5A623] text-sm">
                    {{ combo.finalPrice | number: '1.0-0' }} TND
                  </span>
                  <svg
                    class="w-4 h-4 text-white/40 transition-transform duration-200"
                    [class.rotate-180]="expandedComboId === combo.id"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              <!-- Expanded: formations + phases + séances -->
              <div *ngIf="expandedComboId === combo.id" class="divide-y divide-white/5">
                <!-- Loop over MY formations in this combo only -->
                <ng-container *ngFor="let formation of getMyFormationsInCombo(combo)">
                  <div class="p-5 space-y-3">
                    <!-- Formation header -->
                    <div class="flex items-center gap-2">
                      <span
                        class="text-[10px] px-2 py-0.5 rounded-full bg-[#C62761]/10
                                   text-[#C62761] border border-[#C62761]/20 font-bold uppercase"
                      >
                        {{ formation.category || 'Général' }}
                      </span>
                      <h4 class="font-syne font-bold text-white text-sm">{{ formation.nom }}</h4>
                    </div>

                    <!-- Progression bar -->
                    <div class="space-y-1">
                      <div class="flex justify-between text-[10px] text-white/40">
                        <span>Progression du stagiaire</span>
                        <span class="font-mono"
                          >{{ getStudentProgress(combo, formation.id) }}%</span
                        >
                      </div>
                      <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          class="h-full rounded-full bg-gradient-to-r from-[#C62761] to-[#F5A623] transition-all duration-700"
                          [style.width]="getStudentProgress(combo, formation.id) + '%'"
                        ></div>
                      </div>
                    </div>

                    <!-- Phases accordion -->
                    <div
                      *ngFor="let phase of formation.phases"
                      class="pl-3 border-l border-white/8 space-y-2"
                    >
                      <p class="text-xs font-semibold text-white/70">
                        Phase {{ phase.numero }} — {{ phase.nom }}
                      </p>

                      <!-- Séances -->
                      <div
                        *ngFor="let seance of phase.seances"
                        class="rounded-xl border p-3 space-y-3 transition-all"
                        [class]="
                          seance.status === 'CLOTUREE'
                            ? 'border-emerald-500/20 bg-emerald-500/5'
                            : 'border-white/8 bg-white/[0.02]'
                        "
                      >
                        <div class="flex items-center justify-between">
                          <div>
                            <p class="text-xs font-semibold text-white">
                              {{ seance.date | date: 'dd/MM/yyyy' }}
                              <span class="text-white/40 ml-2">{{ seance.heureDebut }}</span>
                            </p>
                            <p class="text-[10px] text-[var(--bridge-text-muted)]">
                              {{ seance.salle || seance.type }}
                            </p>
                          </div>
                          <span
                            class="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1"
                            [class]="
                              seance.status === 'CLOTUREE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-white/5 text-white/40 border border-white/10'
                            "
                          >
                            <svg
                              *ngIf="seance.status === 'CLOTUREE'"
                              class="w-2.5 h-2.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {{ seance.status === 'CLOTUREE' ? 'Clôturée' : 'Ouverte' }}
                          </span>
                        </div>

                        <!-- Feuille d'appel stagiaire du combo -->
                        <div class="space-y-1">
                          <p
                            class="text-[9px] text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                          >
                            Appel — Stagiaire(s) combo
                          </p>
                          <!-- Stagiaire de ce combo -->
                          <div
                            class="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.03]
                                      border border-white/5"
                          >
                            <div class="flex items-center gap-2">
                              <div
                                class="w-6 h-6 rounded-full bg-[#C62761]/20 flex items-center
                                          justify-center text-[9px] font-bold text-[#C62761]"
                              >
                                {{ (combo.studentFirstName || 'S')[0] }}
                              </div>
                              <span class="text-xs text-white font-medium">
                                {{ combo.studentFirstName }} {{ combo.studentLastName }}
                              </span>
                            </div>

                            <!-- Toggle présence -->
                            <div class="flex items-center gap-2">
                              <button
                                (click)="markAttendance(seance, combo, true)"
                                [class]="
                                  getPresenceStatus(seance, combo.studentId) === true
                                    ? 'px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-lg'
                                    : 'px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs hover:border-emerald-500/40 hover:text-emerald-400 transition-all'
                                "
                                class="cursor-pointer transition-all flex items-center gap-1"
                              >
                                <svg
                                  class="w-3 h-3"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>Présent</span>
                              </button>
                              <button
                                (click)="markAttendance(seance, combo, false)"
                                [class]="
                                  getPresenceStatus(seance, combo.studentId) === false
                                    ? 'px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-bold shadow-lg'
                                    : 'px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs hover:border-red-500/40 hover:text-red-400 transition-all'
                                "
                                class="cursor-pointer transition-all flex items-center gap-1"
                              >
                                <svg
                                  class="w-3 h-3"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                <span>Absent</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <!-- Save button -->
                        <div class="flex justify-end" *ngIf="pendingAttendance[seance.id]">
                          <button
                            (click)="saveAttendance(seance)"
                            [disabled]="savingSeanceId === seance.id"
                            class="px-4 py-1.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs
                                   font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <svg
                              *ngIf="savingSeanceId !== seance.id"
                              class="w-3.5 h-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <path
                                d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                              />
                              <polyline points="17 21 17 13 7 13 7 21" />
                              <polyline points="7 3 7 8 15 8" />
                            </svg>
                            <span
                              >{{ savingSeanceId === seance.id ? 'Sauvegarde...' : 'Enregistrer l'appel' }}</span
                            >
                          </button>
                        </div>

                        <!-- Certificat auto badge -->
                        <div
                          *ngIf="getStudentProgress(combo, formation.id) === 100"
                          class="flex items-center gap-2 px-3 py-2 rounded-lg
                                    bg-[#F5A623]/10 border border-[#F5A623]/20"
                        >
                          <svg
                            class="w-4 h-4 text-[#F5A623] shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <circle cx="12" cy="8" r="6" />
                            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                          </svg>
                          <p class="text-xs text-[#F5A623] font-semibold">
                            Certificat généré automatiquement — 100% de progression
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ng-container>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ComboFormateurComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() closed = new EventEmitter<void>();

  combos: ComboEnrollment[] = [];
  loading = true;
  expandedComboId: number | null = null;

  // Map: seanceId → { studentId → boolean (présence) }
  pendingAttendance: Record<string, Record<number, boolean>> = {};
  savingSeanceId: string | null = null;

  constructor(
    private comboService: ComboEnrollmentService,
    private formationService: FormationService,
    private authService: AuthService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    if (!this.user) this.user = this.authService.getCurrentUser();
    this.loadCombos();
  }

  loadCombos(): void {
    if (!this.user) return;
    this.loading = true;
    this.comboService.getCombosByFormateur(parseInt(this.user.id)).subscribe({
      next: (data) => {
        this.combos = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  /** Retourne uniquement les formations du combo assignées à CE formateur */
  getMyFormationsInCombo(combo: ComboEnrollment): ComboFormationItem[] {
    if (!this.user) return combo.formations;
    return combo.formations.filter((f) =>
      f.formateurNom
        ?.toLowerCase()
        .includes(((this.user!.prenom || '') + ' ' + (this.user!.nom || '')).toLowerCase().trim()),
    );
  }

  getStudentProgress(combo: ComboEnrollment, formationId: string): number {
    const formation = combo.formations.find((f) => f.id === formationId);
    if (!formation?.phases || formation.phases.length === 0) return 0;
    const total = formation.phases.reduce((sum: number, p: any) => sum + (p.progression || 0), 0);
    return Math.round(total / formation.phases.length);
  }

  toggleCombo(id: number): void {
    this.expandedComboId = this.expandedComboId === id ? null : id;
  }

  // ─── Attendance ────────────────────────────────────────────────────────────

  getPresenceStatus(seance: Seance, studentId: number): boolean | undefined {
    return this.pendingAttendance[seance.id]?.[studentId];
  }

  markAttendance(seance: Seance, combo: ComboEnrollment, present: boolean): void {
    if (!this.pendingAttendance[seance.id]) {
      this.pendingAttendance[seance.id] = {};
    }
    this.pendingAttendance[seance.id][combo.studentId] = present;
  }

  saveAttendance(seance: Seance): void {
    const pending = this.pendingAttendance[seance.id];
    if (!pending) return;

    this.savingSeanceId = seance.id;
    const presences: Presence[] = Object.entries(pending).map(([sid, present]) => ({
      stagiaireId: sid,
      stagiaireNom: '',
      present,
    }));

    this.formationService.savePresence(seance.id, presences).subscribe({
      next: () => {
        this.toastService.success('Présences enregistrées !', '✅ Appel');
        delete this.pendingAttendance[seance.id];
        this.savingSeanceId = null;
      },
      error: () => {
        this.toastService.error('Erreur lors de la sauvegarde.', 'Appel');
        this.savingSeanceId = null;
      },
    });
  }

  // ─── Status helpers ───────────────────────────────────────────────────────

  getComboStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PENDING_PAYMENT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'COMPLETED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-white/5 text-white/40 border-white/10';
    }
  }

  getComboStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return '● Actif';
      case 'PENDING_PAYMENT':
        return '⏳ En attente';
      case 'COMPLETED':
        return '✓ Terminé';
      case 'CANCELLED':
        return '✗ Annulé';
      default:
        return status;
    }
  }

  onBackdropClick(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('fixed')) this.close();
  }

  close(): void {
    this.closed.emit();
  }
}
