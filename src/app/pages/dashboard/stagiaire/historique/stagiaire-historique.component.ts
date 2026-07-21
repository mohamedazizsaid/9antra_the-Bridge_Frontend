import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-stagiaire-historique',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl">📋</div>
        <div>
          <h1 class="font-syne font-bold text-2xl text-white">Mon Historique</h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">Présences, évaluations et progression</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 border-b border-[var(--bridge-border)]">
        <button *ngFor="let tab of tabs" (click)="activeTab = tab.key"
                [class]="activeTab === tab.key ? 'text-white border-b-2 border-[var(--bridge-crimson)] bg-white/[0.03]' : 'text-[var(--bridge-text-muted)] hover:text-white'"
                class="px-4 py-3 text-sm font-semibold transition-all rounded-t-lg -mb-px">
          {{ tab.label }}
        </button>
      </div>

      <!-- Evaluations -->
      <div *ngIf="activeTab === 'evals'">
        <div *ngIf="evaluations.length === 0 && !loading" class="bridge-card p-12 text-center">
          <div class="text-4xl mb-4">📝</div>
          <p class="text-[var(--bridge-text-muted)]">Aucune évaluation pour le moment</p>
        </div>

        <div class="space-y-4">
          <div *ngFor="let e of evaluations" class="bridge-card p-5 hover:border-[var(--bridge-crimson)]/20 transition-all">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded">Phase {{ e.phaseOrder }}</span>
                  <h3 class="font-semibold text-white">{{ e.phaseTitle }}</h3>
                </div>
                <p class="text-xs text-[var(--bridge-text-muted)] mb-2">📚 {{ e.formationTitle }}</p>
                
                <!-- Stars rating -->
                <div class="flex items-center gap-1 mb-3">
                  <span *ngFor="let s of getStars(e.grade)" [class]="s ? 'text-[#F5A623]' : 'text-white/20'" class="text-lg">★</span>
                  <span class="text-sm font-bold ml-1" [class]="getGradeColor(e.grade)">{{ e.grade }}/20</span>
                  <span class="text-[10px] ml-2 font-bold px-1.5 py-0.5 rounded-full" [class]="getBadgeClass(e.grade)">
                    {{ getGradeLabel(e.grade) }}
                  </span>
                </div>

                <blockquote class="border-l-2 border-[var(--bridge-crimson)] pl-3 text-sm text-[var(--bridge-text-muted)] italic">
                  "{{ e.comment }}"
                </blockquote>

                <div *ngIf="e.skills" class="flex flex-wrap gap-1.5 mt-3">
                  <span *ngFor="let skill of e.skills.split(', ')" 
                        class="text-[10px] bg-[rgba(198,39,97,0.1)] text-[var(--bridge-crimson)] px-2 py-0.5 rounded-full border border-[rgba(198,39,97,0.2)]">
                    {{ skill }}
                  </span>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl border-2"
                     [class]="getGradeCircleClass(e.grade)">
                  {{ e.grade }}
                </div>
                <p class="text-[10px] text-[var(--bridge-text-muted)] mt-2">{{ e.evaluationDate | date:'dd/MM/yyyy' }}</p>
                <p class="text-[10px] text-white/40 mt-0.5">par {{ e.trainerName }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Attendance -->
      <div *ngIf="activeTab === 'presence'">
        <div class="bridge-card p-5 mb-4">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <p class="text-2xl font-bold text-emerald-400">{{ attendanceStats.present }}</p>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-1">✅ Présences</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-red-400">{{ attendanceStats.absent }}</p>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-1">❌ Absences</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-white">{{ attendanceStats.rate }}%</p>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-1">📊 Taux présence</p>
            </div>
          </div>
          <div class="mt-4 h-3 bg-white/10 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-1000"
                 [class]="attendanceStats.rate >= 75 ? 'bg-emerald-500' : 'bg-red-500'"
                 [style.width]="attendanceStats.rate + '%'"></div>
          </div>
          <p class="text-xs text-[var(--bridge-text-muted)] text-center mt-2">Minimum requis : 75%</p>
        </div>

        <div *ngIf="attendances.length === 0 && !loading" class="bridge-card p-12 text-center">
          <div class="text-4xl mb-4">📅</div>
          <p class="text-[var(--bridge-text-muted)]">Aucun historique de présence</p>
        </div>

        <div [class]="presenceExpanded ? '' : 'max-h-[400px] overflow-y-auto'" class="bridge-card overflow-hidden">
          <div class="divide-y divide-white/5">
            <div *ngFor="let a of attendances" class="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-all">
              <div class="flex items-center gap-3">
                <div [class]="a.present ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'"
                     class="w-8 h-8 rounded-lg flex items-center justify-center text-sm">
                  {{ a.present ? '✅' : '❌' }}
                </div>
                <div>
                  <p class="text-sm font-medium text-white">{{ a.sessionDate | date:'EEEE d MMMM yyyy':'':'fr' }}</p>
                  <p class="text-xs text-[var(--bridge-text-muted)]">{{ a.phaseTitle }} • {{ a.location }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="flex items-center gap-0.5" *ngIf="a.starRating">
                  <span *ngFor="let s of [1,2,3,4,5]" [class]="s <= a.starRating ? 'text-[#F5A623]' : 'text-white/20'" class="text-sm">★</span>
                </div>
                <p class="text-[10px] text-[var(--bridge-text-muted)] mt-0.5">{{ a.startTime }}</p>
              </div>
            </div>
          </div>
          <div *ngIf="attendances.length > 5" class="px-5 py-3 border-t border-[var(--bridge-border)]">
            <button (click)="presenceExpanded = !presenceExpanded" class="text-xs text-[var(--bridge-crimson)] hover:text-white transition-colors">
              {{ presenceExpanded ? '▲ Réduire' : '▼ Voir tout (' + attendances.length + ')' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Progression -->
      <div *ngIf="activeTab === 'progression'">
        <div class="space-y-4">
          <div *ngFor="let prog of progressions" class="bridge-card p-5">
            <div class="flex items-center justify-between mb-3">
              <div>
                <p class="text-xs text-[var(--bridge-text-muted)]">{{ prog.formationTitle }}</p>
                <h3 class="font-semibold text-white">{{ prog.phaseTitle }}</h3>
              </div>
              <span [class]="prog.pedagogicalValidated ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'"
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {{ prog.pedagogicalValidated ? '✅ Validée' : '⏳ En cours' }}
              </span>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div class="text-center p-2 bg-white/5 rounded-xl">
                <p class="text-lg">{{ prog.paymentValidated ? '✅' : '⏳' }}</p>
                <p class="text-[10px] text-[var(--bridge-text-muted)] mt-1">Paiement</p>
              </div>
              <div class="text-center p-2 bg-white/5 rounded-xl">
                <p class="text-lg">{{ prog.pedagogicalValidated ? '✅' : '⏳' }}</p>
                <p class="text-[10px] text-[var(--bridge-text-muted)] mt-1">Validation</p>
              </div>
              <div class="text-center p-2 bg-white/5 rounded-xl">
                <p class="text-lg">{{ prog.unlocked ? '🔓' : '🔒' }}</p>
                <p class="text-[10px] text-[var(--bridge-text-muted)] mt-1">Débloqué</p>
              </div>
            </div>
            <p *ngIf="prog.validationDate" class="text-xs text-[var(--bridge-text-muted)] mt-3">
              Validé le {{ prog.validationDate | date:'dd/MM/yyyy' }}
            </p>
          </div>
          <div *ngIf="progressions.length === 0 && !loading" class="bridge-card p-12 text-center">
            <div class="text-4xl mb-4">📊</div>
            <p class="text-[var(--bridge-text-muted)]">Aucune donnée de progression</p>
          </div>
        </div>
      </div>

    </div>
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

  tabs = [
    { key: 'evals', label: '⭐ Évaluations' },
    { key: 'presence', label: '📅 Présences' },
    { key: 'progression', label: '📈 Progression' },
  ];

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

  getGradeColor(grade: number): string {
    if (grade >= 16) return 'text-emerald-400';
    if (grade >= 14) return 'text-blue-400';
    if (grade >= 12) return 'text-yellow-400';
    return 'text-red-400';
  }

  getGradeLabel(grade: number): string {
    if (grade >= 16) return 'Excellent';
    if (grade >= 14) return 'Très bien';
    if (grade >= 12) return 'Bien';
    if (grade >= 10) return 'Passable';
    return 'Insuffisant';
  }

  getBadgeClass(grade: number): string {
    if (grade >= 14) return 'bg-emerald-500/10 text-emerald-400';
    if (grade >= 12) return 'bg-blue-500/10 text-blue-400';
    return 'bg-red-500/10 text-red-400';
  }

  getGradeCircleClass(grade: number): string {
    if (grade >= 16) return 'border-emerald-500 text-emerald-400 bg-emerald-500/10';
    if (grade >= 14) return 'border-blue-500 text-blue-400 bg-blue-500/10';
    if (grade >= 12) return 'border-yellow-500 text-yellow-400 bg-yellow-500/10';
    return 'border-red-500 text-red-400 bg-red-500/10';
  }
}
