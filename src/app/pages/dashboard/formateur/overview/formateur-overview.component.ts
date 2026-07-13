import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { FormationService } from '../../../../core/services/formation.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { User } from '../../../../core/models/user.model';
import { Formation, Seance, Presence } from '../../../../core/models/formation.model';
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
            Bonjour, Dr. <span class="text-[#F5A623]">{{ user?.prenom }} {{ user?.nom }}</span> 👨‍🏫
          </h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">{{ getTodaySummary() }}</p>
        </div>
        <div class="text-sm text-[var(--bridge-text-muted)] font-mono">{{ today }}</div>
      </div>

      <!-- Quick Actions Bar -->
      <div class="flex flex-wrap gap-3 p-4 rounded-2xl bg-gradient-to-r from-[rgba(198,39,97,0.12)] to-[rgba(245,166,35,0.08)] border border-[rgba(198,39,97,0.2)]">
        <button (click)="openQuickAttendance()"
                class="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-105">
          📋 Faire l'Appel
        </button>
        <button (click)="openEvalModal()"
                class="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold border border-white/10 transition-all">
          ⭐ Évaluer un stagiaire
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-5 border border-[var(--bridge-border)]">
          <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider">Formations</p>
          <p class="text-3xl font-mono font-bold text-[#F5A623] mt-2">{{ formations.length }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">assignées</p>
        </div>
        <div class="glass-card p-5 border border-[var(--bridge-border)]">
          <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider">Stagiaires</p>
          <p class="text-3xl font-mono font-bold text-[#C62761] mt-2">{{ totalStagiaires }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">total</p>
        </div>
        <div class="glass-card p-5 border border-[var(--bridge-border)]">
          <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider">Séances Aujourd'hui</p>
          <p class="text-3xl font-mono font-bold mt-2" [class]="todaySeances.length > 0 ? 'text-emerald-400' : 'text-white/30'">
            {{ todaySeances.length }}
          </p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">programmées</p>
        </div>
        <div class="glass-card p-5 border border-[var(--bridge-border)]">
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
                    class="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
                AUJOURD'HUI
              </span>
            </div>

            <div class="space-y-4" *ngIf="todaySeances.length > 0">
              <div *ngFor="let seance of todaySeances"
                   class="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-[rgba(198,39,97,0.2)] transition-all group">
                <div class="text-center min-w-[50px]">
                  <div class="text-sm font-mono font-bold text-[#F5A623]">{{ seance.heureDebut }}</div>
                  <div class="text-xs text-[var(--bridge-text-muted)]">{{ seance.duree }}</div>
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-white text-sm">{{ seance.formationNom }}</p>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                    📍 {{ seance.salle }} ·
                    <span class="font-mono">{{ getPresentCount(seance) }}/{{ seance.presences?.length || '?' }}</span> présents
                  </p>
                </div>
                <button (click)="openAttendanceModal(seance)"
                        class="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#C62761] to-[#F5A623] rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                  Faire l'Appel →
                </button>
              </div>
            </div>

            <div class="flex flex-col items-center py-8 text-[var(--bridge-text-muted)]" *ngIf="todaySeances.length === 0">
              <span class="text-4xl mb-3">📅</span>
              <p class="text-sm font-medium">Aucune séance aujourd'hui</p>
              <p class="text-xs mt-1">Profitez de ce temps pour préparer vos évaluations</p>
            </div>
          </div>

          <!-- Formations Accordion -->
          <div class="glass-card border border-[var(--bridge-border)] p-6">
            <h3 class="font-syne font-bold text-lg mb-5">🏫 Mes Formations</h3>
            <div class="space-y-3">
              <div *ngFor="let formation of formations"
                   class="border border-white/5 rounded-xl overflow-hidden">
                <button (click)="toggleFormation(formation.id)"
                        class="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xs font-bold text-white">
                      {{ formation.nom[0] }}
                    </div>
                    <div class="text-left">
                      <p class="text-sm font-semibold text-white">{{ formation.nom }}</p>
                      <p class="text-xs text-[var(--bridge-text-muted)]">{{ formation.phases.length || 0 }} phases</p>
                    </div>
                  </div>
                  <span class="text-[var(--bridge-text-muted)] text-sm">{{ expandedFormation === formation.id ? '▲' : '▼' }}</span>
                </button>
                <div *ngIf="expandedFormation === formation.id" class="px-4 pb-4 space-y-2 border-t border-white/5">
                  <div *ngFor="let phase of formation.phases"
                       class="flex items-center justify-between py-2">
                    <span class="text-xs text-[var(--bridge-text-muted)]">Phase {{ phase.numero }} — {{ phase.nom }}</span>
                    <div class="flex items-center gap-2">
                      <div class="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full rounded-full bg-gradient-to-r from-[#C62761] to-[#F5A623]"
                             [style.width]="phase.progression + '%'"></div>
                      </div>
                      <span class="text-xs font-mono text-white/50 w-8 text-right">{{ phase.progression }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-center text-[var(--bridge-text-muted)] py-8 text-sm" *ngIf="formations.length === 0">
              Aucune formation assignée
            </div>
          </div>

          <!-- Recent Evaluations -->
          <div class="glass-card border border-[var(--bridge-border)] p-6">
            <h3 class="font-syne font-bold text-lg mb-5">📝 Évaluations récentes</h3>
            <div class="space-y-3" *ngIf="evaluations.length > 0">
              <div *ngFor="let eval of evaluations.slice(0,5)"
                   class="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div>
                  <p class="text-sm font-semibold text-white">{{ eval.studentFirstName }} {{ eval.studentLastName }}</p>
                  <p class="text-xs text-[var(--bridge-text-muted)]">{{ eval.phaseTitle }} · {{ eval.formationTitle }}</p>
                </div>
                <div class="text-right">
                  <span class="text-sm font-mono font-bold px-3 py-1 rounded-full"
                        [class]="eval.grade >= 15 ? 'bg-emerald-500/10 text-emerald-400'
                               : eval.grade >= 10 ? 'bg-[rgba(245,166,35,0.1)] text-[#F5A623]'
                               : 'bg-red-500/10 text-red-400'">
                    {{ eval.grade }}/20
                  </span>
                </div>
              </div>
            </div>
            <div class="text-center text-[var(--bridge-text-muted)] py-8 text-sm" *ngIf="evaluations.length === 0">
              Aucune évaluation saisie
            </div>
          </div>
        </div>

        <!-- Right: Stats + Upcoming -->
        <div class="space-y-6">
          <!-- Attendance Chart Simulation -->
          <div class="glass-card border border-[var(--bridge-border)] p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-syne font-bold text-base">📊 Assiduité par formation</h3>
              <span class="text-xs text-emerald-400 font-semibold">~85% moy.</span>
            </div>
            <div class="space-y-3">
              <div *ngFor="let formation of formations" class="space-y-1">
                <div class="flex justify-between text-xs">
                  <span class="text-white/70 truncate flex-1 pr-2">{{ formation.nom }}</span>
                  <span class="text-[#F5A623] font-mono">{{ getAttendanceRate(formation) }}%</span>
                </div>
                <div class="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-to-r from-[#C62761] to-[#F5A623] transition-all duration-1000"
                       [style.width]="getAttendanceRate(formation) + '%'"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Upcoming Sessions -->
          <div class="glass-card border border-[var(--bridge-border)] p-6">
            <h3 class="font-syne font-bold text-base mb-4">📅 Prochaines Séances</h3>
            <div class="space-y-3">
              <div *ngFor="let seance of upcomingSeances"
                   class="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div class="text-center min-w-[38px]">
                  <div class="text-[10px] font-bold uppercase text-[#F5A623]">{{ formatDay(seance.date) }}</div>
                  <div class="text-lg font-mono font-bold text-white">{{ formatDayNum(seance.date) }}</div>
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-semibold text-white truncate">{{ seance.formationNom }}</p>
                  <p class="text-[10px] text-[var(--bridge-text-muted)]">{{ seance.heureDebut }} · {{ seance.salle }}</p>
                </div>
              </div>
            </div>
            <div class="text-center text-[var(--bridge-text-muted)] text-xs py-4" *ngIf="upcomingSeances.length === 0">
              Aucune séance à venir
            </div>
          </div>
        </div>
      </div>

      <!-- Attendance Modal -->
      <div *ngIf="showAttendanceModal"
           class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
           (click)="closeAttendanceModal()">
        <div class="glass-card border border-[var(--bridge-border)] w-full max-w-2xl max-h-[90vh] flex flex-col"
             (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between p-6 border-b border-[var(--bridge-border)]">
            <div>
              <h3 class="font-syne font-bold text-lg text-white">📋 Appel & Évaluation</h3>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">{{ selectedSeance?.formationNom }}</p>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm font-mono text-[#F5A623] font-bold">
                {{ getPresentInModal() }}/{{ activePresences.length }} présents
              </span>
              <button (click)="closeAttendanceModal()" class="text-white/50 hover:text-white text-xl">✕</button>
            </div>
          </div>
          
          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            <div *ngFor="let presence of activePresences; let i = index"
                 class="p-4 rounded-xl border transition-all space-y-3"
                 [class]="presence.present ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'">
              
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xs font-bold">
                    {{ presence.stagiaireNom[0] }}
                  </div>
                  <span class="text-sm font-medium text-white">{{ presence.stagiaireNom }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs font-semibold" [class]="presence.present ? 'text-emerald-400' : 'text-red-400'">
                    {{ presence.present ? 'Présent' : 'Absent' }}
                  </span>
                  <button (click)="togglePresence(i)"
                          class="w-14 h-7 rounded-full transition-all duration-200 relative"
                          [class]="presence.present ? 'bg-emerald-500' : 'bg-white/10'">
                    <div class="w-5 h-5 rounded-full bg-white absolute top-1 transition-all duration-200"
                         [class]="presence.present ? 'left-8' : 'left-1'"></div>
                  </button>
                </div>
              </div>

              <!-- Star Rating & Notes (Visible only if Present) -->
              <div class="grid md:grid-cols-2 gap-3 pt-2 border-t border-white/5" *ngIf="presence.present">
                <div class="flex items-center gap-2">
                  <span class="text-[11px] text-[var(--bridge-text-muted)] uppercase">Note Séance :</span>
                  <div class="flex gap-1">
                    <button *ngFor="let star of [1,2,3,4,5]" 
                            (click)="presence.starRating = star"
                            class="text-lg focus:outline-none transition-transform hover:scale-125"
                            [class]="(presence.starRating || 0) >= star ? 'text-[#F5A623]' : 'text-white/20'">
                      ★
                    </button>
                  </div>
                </div>
                <div>
                  <input [(ngModel)]="presence.sessionNote" type="text"
                         class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C62761]"
                         placeholder="Note rapide / appréciation..." />
                </div>
              </div>

            </div>
          </div>

          <div class="p-6 border-t border-[var(--bridge-border)] flex flex-col sm:flex-row gap-3">
            <button (click)="closeSession()"
                    *ngIf="selectedSeance"
                    class="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold rounded-xl transition-all">
              🔒 Clôturer la Séance
            </button>
            <button (click)="saveAttendance()"
                    class="flex-1 py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl hover:opacity-90 transition-all">
              Valider l'Appel & Notes ({{ getPresentInModal() }}/{{ activePresences.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Evaluation Modal -->
      <div *ngIf="showEvalModal"
           class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
           (click)="closeEvalModal()">
        <div class="glass-card border border-[var(--bridge-border)] w-full max-w-md p-6"
             (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-syne font-bold text-lg">⭐ Nouvelle Évaluation</h3>
            <button (click)="closeEvalModal()" class="text-white/50 hover:text-white text-xl">✕</button>
          </div>
          <div class="space-y-4">
            <div>
              <label class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-2">ID Stagiaire</label>
              <input [(ngModel)]="evalForm.studentId" type="number"
                     class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C62761]"
                     placeholder="Ex: 42" />
            </div>
            <div>
              <label class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-2">ID Phase</label>
              <input [(ngModel)]="evalForm.phaseId" type="number"
                     class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C62761]"
                     placeholder="Ex: 1" />
            </div>
            <div>
              <label class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-2">Note (/20)</label>
              <input [(ngModel)]="evalForm.grade" type="number" min="0" max="20" step="0.5"
                     class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C62761]"
                     placeholder="Ex: 16.5" />
            </div>
            <div>
              <label class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-2">Compétences acquises</label>
              <input [(ngModel)]="evalForm.skills" type="text"
                     class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C62761]"
                     placeholder="Ex: Angular, TypeScript, RxJS" />
            </div>
            <div>
              <label class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-2">Commentaire</label>
              <textarea [(ngModel)]="evalForm.comment" rows="3"
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C62761] resize-none"
                        placeholder="Appréciation générale..."></textarea>
            </div>
            <button (click)="submitEvaluation()"
                    [disabled]="!evalForm.studentId || !evalForm.phaseId || !evalForm.grade"
                    class="w-full py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              {{ evalSuccess ? '✓ Évaluation enregistrée !' : 'Enregistrer l\'évaluation' }}
            </button>
          </div>
        </div>
      </div>

    </div>
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

  evalForm = { studentId: null as number | null, phaseId: null as number | null, grade: null as number | null, skills: '', comment: '' };

  get totalStagiaires(): number {
    return this.formations.reduce((sum, f) => sum + (f.stagiaires.length || 0), 0);
  }

  constructor(
    private authService: AuthService,
    private formationService: FormationService,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) return;

    this.sub.add(
      this.formationService.getFormationsByFormateur(this.user.id).subscribe(data => {
        this.formations = data;
      })
    );

    this.sub.add(
      this.formationService.getTodaySeances().subscribe(data => {
        this.todaySeances = data;
      })
    );

    this.sub.add(
      this.formationService.getUpcomingSeances().subscribe(data => {
        this.upcomingSeances = data.filter((_, i) => i < 5);
      })
    );

    if (this.user) {
      this.sub.add(
        this.evaluationService.getEvaluationsByStudent(this.user.id).subscribe(data => {
          this.evaluations = data;
        })
      );
    }
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  toggleFormation(id: string): void {
    this.expandedFormation = this.expandedFormation === id ? null : id;
  }

  getAttendanceRate(formation: Formation): number {
    if (!formation.phases?.length) return 0;
    const total = formation.phases.reduce((sum, p) => sum + (p.progression || 0), 0);
    return Math.round(total / formation.phases.length);
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
      return 'Vous avez ' + this.todaySeances.length + ' s\u00e9ance(s) aujourd\u2019hui';
    }
    return 'Aucune s\u00e9ance aujourd\u2019hui';
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
      if (confirm('Voulez-vous vraiment clôturer cette séance ? Cela validera la progression et déclenchera les certificats si c’est la dernière séance.')) {
        this.formationService.closeSession(this.selectedSeance.id).subscribe({
          next: () => {
            alert('Séance clôturée avec succès !');
            this.closeAttendanceModal();
          },
          error: (e) => alert(e?.error?.message || 'Erreur lors de la clôture')
        });
      }
    }
  }

  openEvalModal(): void { this.showEvalModal = true; this.evalSuccess = false; }
  closeEvalModal(): void { this.showEvalModal = false; }

  submitEvaluation(): void {
    if (!this.evalForm.studentId || !this.evalForm.phaseId || !this.evalForm.grade || !this.user) return;
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
        setTimeout(() => { this.closeEvalModal(); this.evalForm = { studentId: null, phaseId: null, grade: null, skills: '', comment: '' }; }, 1500);
      }
    });
  }

  formatDay(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
  }

  formatDayNum(date: Date): string {
    return new Date(date).getDate().toString().padStart(2, '0');
  }
}
