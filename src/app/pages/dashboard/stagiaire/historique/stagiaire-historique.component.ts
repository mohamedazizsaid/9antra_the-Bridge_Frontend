import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-stagiaire-historique',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  template: `
    <div class="space-y-6">

      <!-- ══ HEADER ══ -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#C62761] flex items-center justify-center text-2xl shadow-lg shadow-[rgba(124,58,237,0.3)]">
            📋
          </div>
          <div>
            <h1 class="font-syne font-bold text-2xl text-white">Mon Historique</h1>
            <p class="text-[var(--bridge-text-muted)] text-sm mt-0.5">Présences, évaluations et progression</p>
          </div>
        </div>
        <!-- Global badge -->
        <div class="flex items-center gap-3">
          <div class="glass-card border border-[var(--bridge-border)] px-4 py-2.5 flex items-center gap-3">
            <div class="text-center">
              <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider">Assiduité</p>
              <p class="font-mono font-bold text-lg" [class]="attendanceStats.rate >= 75 ? 'text-emerald-400' : 'text-red-400'">
                {{ attendanceStats.rate }}%
              </p>
            </div>
            <div class="w-px h-8 bg-white/10"></div>
            <div class="text-center">
              <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider">Évals</p>
              <p class="font-mono font-bold text-lg text-[#F5A623]">{{ evaluations.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ TAB NAV ══ -->
      <div class="flex items-center gap-1 p-1 glass-card border border-[var(--bridge-border)] rounded-2xl w-fit">
        <button *ngFor="let tab of tabs" (click)="activeTab = tab.key"
                class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200"
                [class]="activeTab === tab.key
                  ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-lg'
                  : 'text-[var(--bridge-text-muted)] hover:text-white hover:bg-white/5'">
          {{ tab.icon }} {{ tab.label }}
          <span *ngIf="tab.count !== undefined"
                class="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
                [class]="activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'">
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- ══ TAB: ÉVALUATIONS ══ -->
      <div *ngIf="activeTab === 'evals'" class="space-y-4">

        <!-- Loading -->
        <div *ngIf="loading" class="space-y-4">
          <div *ngFor="let _ of [1,2,3]" class="glass-card border border-[var(--bridge-border)] p-6 animate-pulse">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 rounded-2xl bg-white/10 flex-shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-white/10 rounded w-1/3"></div>
                <div class="h-3 bg-white/5 rounded w-1/2"></div>
                <div class="h-3 bg-white/5 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div *ngIf="evaluations.length === 0 && !loading"
             class="glass-card border border-[var(--bridge-border)] p-16 text-center">
          <div class="text-6xl mb-4">📝</div>
          <p class="font-syne font-bold text-xl text-white">Aucune évaluation pour le moment</p>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-2 max-w-sm mx-auto">
            Vos évaluations apparaîtront ici après chaque phase de formation.
          </p>
        </div>

        <!-- Evaluation Cards -->
        <div *ngFor="let e of evaluations; let i = index"
             class="glass-card border border-[var(--bridge-border)] overflow-hidden group hover:border-[rgba(198,39,97,0.3)] transition-all duration-300"
             [style.animation-delay]="(i * 80) + 'ms'"
             style="animation: fadeSlideIn 0.4s ease both">

          <!-- Top gradient bar based on grade -->
          <div class="h-1" [class]="getGradeBarClass(e.grade)"></div>

          <div class="p-6">
            <div class="flex items-start gap-5">

              <!-- Grade Circle -->
              <div class="flex-shrink-0 w-18">
                <div class="w-18 h-18 relative">
                  <div class="w-16 h-16 rounded-2xl border-2 flex items-center justify-center"
                       [class]="getGradeCircleClass(e.grade)">
                    <span class="font-mono font-black text-xl">{{ e.grade }}</span>
                  </div>
                  <div class="absolute -top-1.5 -right-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold border"
                       [class]="getBadgeClass(e.grade)">
                    {{ getGradeLabel(e.grade) }}
                  </div>
                </div>
                <p class="text-[10px] text-center text-[var(--bridge-text-muted)] mt-2 font-mono">/20</p>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <!-- Header -->
                <div class="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[rgba(198,39,97,0.1)] text-[#C62761] border border-[rgba(198,39,97,0.2)]">
                        Phase {{ e.phaseOrder }}
                      </span>
                    </div>
                    <h3 class="font-syne font-bold text-white text-base">{{ e.phaseTitle }}</h3>
                    <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">📚 {{ e.formationTitle }}</p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <p class="text-xs text-[var(--bridge-text-muted)] font-mono">{{ e.evaluationDate | date:'dd/MM/yyyy' }}</p>
                    <p class="text-[10px] text-white/30 mt-0.5">par {{ e.trainerName }}</p>
                  </div>
                </div>

                <!-- Star Rating -->
                <div class="flex items-center gap-1 mb-3">
                  <span *ngFor="let star of getStars(e.grade)"
                        [class]="star ? 'text-[#F5A623]' : 'text-white/15'"
                        class="text-lg">★</span>
                  <span class="text-xs text-[var(--bridge-text-muted)] ml-2 font-mono">{{ getStarCount(e.grade) }}/5</span>
                </div>

                <!-- Grade progress bar -->
                <div class="mb-3">
                  <div class="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-1000"
                         [class]="getGradeBarClass(e.grade)"
                         [style.width]="((e.grade / 20) * 100) + '%'"></div>
                  </div>
                </div>

                <!-- Comment -->
                <blockquote *ngIf="e.comment"
                            class="border-l-2 border-[rgba(198,39,97,0.4)] pl-3 text-sm text-[var(--bridge-text-muted)] italic leading-relaxed">
                  "{{ e.comment }}"
                </blockquote>

                <!-- Skills -->
                <div *ngIf="e.skills" class="flex flex-wrap gap-1.5 mt-3">
                  <span *ngFor="let skill of e.skills.split(',')"
                        class="text-[11px] bg-[rgba(245,166,35,0.08)] text-[#F5A623] px-2.5 py-1 rounded-full border border-[rgba(245,166,35,0.2)] font-medium">
                    ✦ {{ skill.trim() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ TAB: PRÉSENCES ══ -->
      <div *ngIf="activeTab === 'presence'" class="space-y-5">

        <!-- Stats Cards -->
        <div class="grid grid-cols-3 gap-4">
          <div class="glass-card border border-emerald-500/20 p-5 text-center group hover:border-emerald-500/40 transition-all">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl mx-auto mb-3">✅</div>
            <p class="text-3xl font-mono font-black text-emerald-400">{{ attendanceStats.present }}</p>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-1 uppercase tracking-wider font-semibold">Présences</p>
          </div>
          <div class="glass-card border border-red-500/20 p-5 text-center group hover:border-red-500/40 transition-all">
            <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xl mx-auto mb-3">❌</div>
            <p class="text-3xl font-mono font-black text-red-400">{{ attendanceStats.absent }}</p>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-1 uppercase tracking-wider font-semibold">Absences</p>
          </div>
          <div class="glass-card border border-[rgba(245,166,35,0.3)] p-5 text-center group hover:border-[rgba(245,166,35,0.5)] transition-all">
            <div class="w-10 h-10 rounded-xl bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)] flex items-center justify-center text-xl mx-auto mb-3">📊</div>
            <p class="text-3xl font-mono font-black"
               [class]="attendanceStats.rate >= 75 ? 'text-emerald-400' : 'text-red-400'">
              {{ attendanceStats.rate }}%
            </p>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-1 uppercase tracking-wider font-semibold">Taux</p>
          </div>
        </div>

        <!-- Progress bar with threshold -->
        <div class="glass-card border border-[var(--bridge-border)] p-6">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold text-white">Taux d'assiduité global</span>
            <span class="font-mono font-bold text-sm"
                  [class]="attendanceStats.rate >= 75 ? 'text-emerald-400' : 'text-red-400'">
              {{ attendanceStats.rate }}% / 75% requis
            </span>
          </div>
          <div class="relative h-3 rounded-full bg-white/5 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-1000"
                 [class]="attendanceStats.rate >= 75 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-orange-500'"
                 [style.width]="attendanceStats.rate + '%'"></div>
            <!-- Threshold line -->
            <div class="absolute top-0 bottom-0 w-0.5 bg-white/30" style="left: 75%"></div>
          </div>
          <div class="flex justify-between text-[10px] text-[var(--bridge-text-muted)] mt-1.5">
            <span>0%</span>
            <span class="text-white/50">Seuil: 75%</span>
            <span>100%</span>
          </div>
          <div class="mt-3 flex items-center gap-2">
            <span class="text-sm font-semibold" [class]="attendanceStats.rate >= 75 ? 'text-emerald-400' : 'text-red-400'">
              {{ attendanceStats.rate >= 75 ? '✓ Éligible aux certificats' : '⚠ Seuil d\'assiduité non atteint' }}
            </span>
          </div>
        </div>

        <!-- Attendance list -->
        <div *ngIf="attendances.length === 0 && !loading"
             class="glass-card border border-[var(--bridge-border)] p-12 text-center">
          <div class="text-5xl mb-4">📅</div>
          <p class="font-syne font-bold text-lg text-white">Aucun historique de présence</p>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-2">Vos présences seront enregistrées lors de vos séances.</p>
        </div>

        <div *ngIf="attendances.length > 0" class="glass-card border border-[var(--bridge-border)] overflow-hidden">
          <div class="p-5 border-b border-[var(--bridge-border)] flex items-center justify-between">
            <h3 class="font-syne font-bold text-white">📅 Registre des présences</h3>
            <span class="text-xs text-[var(--bridge-text-muted)]">{{ attendances.length }} séance(s)</span>
          </div>
          <div [class]="presenceExpanded ? '' : 'max-h-[440px] overflow-y-auto'">
            <div class="divide-y divide-white/[0.04]">
              <div *ngFor="let a of attendances; let i = index"
                   class="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-all group"
                   [style.animation-delay]="(i * 30) + 'ms'"
                   style="animation: fadeSlideIn 0.3s ease both">
                <!-- Status icon -->
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-all group-hover:scale-110"
                     [class]="a.present ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'">
                  {{ a.present ? '✅' : '❌' }}
                </div>
                <!-- Date & Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-white">{{ a.sessionDate | date:'EEEE d MMMM yyyy':'':'fr' }}</p>
                  <div class="flex items-center gap-2 mt-0.5">
                    <p class="text-xs text-[var(--bridge-text-muted)]">{{ a.phaseTitle }}</p>
                    <span *ngIf="a.location" class="text-[10px] text-white/20">•</span>
                    <p *ngIf="a.location" class="text-xs text-[var(--bridge-text-muted)]">📍 {{ a.location }}</p>
                  </div>
                </div>
                <!-- Stars & Time -->
                <div class="text-right flex-shrink-0">
                  <div class="flex items-center gap-0.5 justify-end" *ngIf="a.starRating">
                    <span *ngFor="let s of [1,2,3,4,5]"
                          [class]="s <= a.starRating ? 'text-[#F5A623]' : 'text-white/10'"
                          class="text-sm">★</span>
                  </div>
                  <p class="text-[10px] text-[var(--bridge-text-muted)] font-mono mt-1">{{ a.startTime || '—' }}</p>
                </div>
                <!-- Status badge -->
                <span class="text-[10px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0"
                      [class]="a.present ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'">
                  {{ a.present ? 'Présent' : 'Absent' }}
                </span>
              </div>
            </div>
          </div>
          <!-- See more -->
          <div *ngIf="attendances.length > 6" class="px-5 py-3 border-t border-[var(--bridge-border)]">
            <button (click)="presenceExpanded = !presenceExpanded"
                    class="flex items-center gap-2 text-xs font-semibold text-[#C62761] hover:text-white transition-colors">
              <span>{{ presenceExpanded ? '▲ Réduire' : '▼ Voir tout (' + attendances.length + ' séances)' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ══ TAB: PROGRESSION ══ -->
      <div *ngIf="activeTab === 'progression'" class="space-y-4">

        <!-- Empty -->
        <div *ngIf="progressions.length === 0 && !loading"
             class="glass-card border border-[var(--bridge-border)] p-16 text-center">
          <div class="text-6xl mb-4">📈</div>
          <p class="font-syne font-bold text-xl text-white">Aucune donnée de progression</p>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-2">Votre progression apparaîtra après le démarrage de vos formations.</p>
        </div>

        <!-- Timeline -->
        <div class="space-y-3">
          <div *ngFor="let prog of progressions; let i = index; let last = last"
               class="relative"
               [style.animation-delay]="(i * 60) + 'ms'"
               style="animation: fadeSlideIn 0.4s ease both">
            <!-- Connector -->
            <div *ngIf="!last" class="absolute left-[27px] top-[56px] w-0.5 h-[calc(100%+12px)] bg-gradient-to-b from-white/10 to-transparent z-0"></div>

            <div class="glass-card border overflow-hidden transition-all hover:border-[rgba(198,39,97,0.3)] z-10 relative"
                 [class]="prog.pedagogicalValidated ? 'border-emerald-500/20' : 'border-[var(--bridge-border)]'">
              <div class="p-5 flex items-start gap-4">
                <!-- Status icon -->
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border-2 shadow-lg"
                     [class]="prog.pedagogicalValidated
                       ? 'bg-emerald-500/15 border-emerald-500/40 shadow-emerald-500/10'
                       : 'bg-white/5 border-white/15 shadow-white/5'">
                  {{ prog.pedagogicalValidated ? '✅' : '⏳' }}
                </div>

                <div class="flex-1 min-w-0">
                  <!-- Header -->
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-xs text-[var(--bridge-text-muted)] font-mono">{{ prog.formationTitle }}</p>
                      <h3 class="font-syne font-bold text-white text-base mt-0.5">{{ prog.phaseTitle }}</h3>
                    </div>
                    <span class="text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border flex-shrink-0"
                          [class]="prog.pedagogicalValidated
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-[rgba(245,166,35,0.1)] text-[#F5A623] border-[rgba(245,166,35,0.2)]'">
                      {{ prog.pedagogicalValidated ? '✅ Validée' : '⏳ En cours' }}
                    </span>
                  </div>

                  <!-- 3 status boxes -->
                  <div class="grid grid-cols-3 gap-3 mt-4">
                    <div class="text-center p-3 rounded-xl border transition-all"
                         [class]="prog.paymentValidated ? 'bg-emerald-500/[0.07] border-emerald-500/20' : 'bg-white/[0.02] border-white/5'">
                      <div class="text-xl mb-1">{{ prog.paymentValidated ? '✅' : '⏳' }}</div>
                      <p class="text-[10px] font-semibold uppercase tracking-wider"
                         [class]="prog.paymentValidated ? 'text-emerald-400' : 'text-[var(--bridge-text-muted)]'">
                        Paiement
                      </p>
                    </div>
                    <div class="text-center p-3 rounded-xl border transition-all"
                         [class]="prog.pedagogicalValidated ? 'bg-emerald-500/[0.07] border-emerald-500/20' : 'bg-white/[0.02] border-white/5'">
                      <div class="text-xl mb-1">{{ prog.pedagogicalValidated ? '✅' : '⏳' }}</div>
                      <p class="text-[10px] font-semibold uppercase tracking-wider"
                         [class]="prog.pedagogicalValidated ? 'text-emerald-400' : 'text-[var(--bridge-text-muted)]'">
                        Validation
                      </p>
                    </div>
                    <div class="text-center p-3 rounded-xl border transition-all"
                         [class]="prog.unlocked ? 'bg-[rgba(198,39,97,0.08)] border-[rgba(198,39,97,0.2)]' : 'bg-white/[0.02] border-white/5'">
                      <div class="text-xl mb-1">{{ prog.unlocked ? '🔓' : '🔒' }}</div>
                      <p class="text-[10px] font-semibold uppercase tracking-wider"
                         [class]="prog.unlocked ? 'text-[#C62761]' : 'text-[var(--bridge-text-muted)]'">
                        Débloqué
                      </p>
                    </div>
                  </div>

                  <!-- Validation date -->
                  <p *ngIf="prog.validationDate" class="text-xs text-[var(--bridge-text-muted)] mt-3 flex items-center gap-1">
                    <span class="text-emerald-400">📅</span>
                    Validée le {{ prog.validationDate | date:'dd MMMM yyyy':'':'fr' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <style>
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  `
})
export class StagiaireHistoriqueComponent implements OnInit {
  activeTab = 'evals';
  loading = false;
  evaluations: any[] = [];
  attendances: any[] = [];
  progressions: any[] = [];
  presenceExpanded = false;
  attendanceStats = { present: 0, absent: 0, rate: 0 };

  get tabs() {
    return [
      { key: 'evals', icon: '⭐', label: 'Évaluations', count: this.evaluations.length },
      { key: 'presence', icon: '📅', label: 'Présences', count: this.attendances.length },
      { key: 'progression', icon: '📈', label: 'Progression', count: this.progressions.length },
    ];
  }

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.http.get<any[]>('http://localhost:8080/api/evaluations/my').subscribe({
      next: (evals) => {
        this.evaluations = evals;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.http.get<any>('http://localhost:8080/api/attendance/my').subscribe({
      next: (data) => {
        this.attendances = data.attendances || data || [];
        const total = this.attendances.length;
        const present = this.attendances.filter((a: any) => a.present).length;
        this.attendanceStats = {
          present,
          absent: total - present,
          rate: total ? Math.round((present / total) * 100) : 0
        };
      },
      error: () => {}
    });

    this.http.get<any[]>('http://localhost:8080/api/progressions/my').subscribe({
      next: (data) => { this.progressions = data; },
      error: () => {}
    });
  }

  getStars(grade: number): boolean[] {
    const stars = Math.round((grade / 20) * 5);
    return [1,2,3,4,5].map(s => s <= stars);
  }

  getStarCount(grade: number): number {
    return Math.round((grade / 20) * 5);
  }

  getGradeBarClass(grade: number): string {
    if (grade >= 16) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    if (grade >= 14) return 'bg-gradient-to-r from-blue-500 to-blue-400';
    if (grade >= 12) return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
    return 'bg-gradient-to-r from-red-500 to-orange-500';
  }

  getGradeCircleClass(grade: number): string {
    if (grade >= 16) return 'border-emerald-500/60 text-emerald-400 bg-emerald-500/10';
    if (grade >= 14) return 'border-blue-500/60 text-blue-400 bg-blue-500/10';
    if (grade >= 12) return 'border-yellow-500/60 text-yellow-400 bg-yellow-500/10';
    return 'border-red-500/60 text-red-400 bg-red-500/10';
  }

  getGradeLabel(grade: number): string {
    if (grade >= 16) return 'Excellent';
    if (grade >= 14) return 'Très bien';
    if (grade >= 12) return 'Bien';
    if (grade >= 10) return 'Passable';
    return 'Insuffisant';
  }

  getBadgeClass(grade: number): string {
    if (grade >= 14) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (grade >= 12) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (grade >= 10) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/10 text-red-400 border-red-500/30';
  }
}
