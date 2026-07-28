import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { FormationService } from '../../../../core/services/formation.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { Formation, Seance, Presence } from '../../../../core/models/formation.model';
import { Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'app-formateur-seances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fadein">

      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="font-syne font-bold text-2xl md:text-3xl text-white">
            📅 Agenda & <span class="bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text text-transparent">Séances</span>
          </h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">
            Gérez vos séances, faites l'appel et clôturez vos sessions.
          </p>
        </div>
        <div class="text-sm text-[var(--bridge-text-muted)] font-mono bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          {{ todayLabel }}
        </div>
      </div>

      <!-- Week At A Glance -->
      <div class="glass-card border border-[var(--bridge-border)] p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-syne font-bold text-base text-white">📆 Semaine en cours</h3>
          <div class="flex items-center gap-2">
            <button (click)="prevWeek()" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">‹</button>
            <span class="text-xs font-mono text-white/50 min-w-[120px] text-center">{{ weekRangeLabel }}</span>
            <button (click)="nextWeek()" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">›</button>
          </div>
        </div>
        <div class="grid grid-cols-7 gap-2">
          <div *ngFor="let day of weekDays" class="flex flex-col items-center gap-2">
            <!-- Day Header -->
            <div class="text-center">
              <p class="text-[9px] uppercase tracking-widest font-bold"
                 [class]="day.isToday ? 'text-[#F5A623]' : 'text-white/30'">{{ day.label }}</p>
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-mono font-bold mt-1 transition-all"
                   [class]="day.isToday
                     ? 'bg-gradient-to-br from-[#C62761] to-[#F5A623] text-white shadow-[0_0_15px_rgba(198,39,97,0.4)]'
                     : 'bg-white/5 text-white/60'">
                {{ day.num }}
              </div>
            </div>
            <!-- Sessions for this day -->
            <div class="w-full space-y-1 min-h-[40px]">
              <div *ngFor="let s of day.seances"
                   (click)="openAttendanceModal(s)"
                   class="w-full px-1.5 py-1 rounded-lg text-[9px] font-bold cursor-pointer transition-all hover:scale-105"
                   [class]="s.status === 'CLOTUREE'
                     ? 'bg-white/5 text-white/30 line-through'
                     : 'bg-gradient-to-r from-[rgba(198,39,97,0.25)] to-[rgba(245,166,35,0.15)] text-[#F5A623] border border-[rgba(245,166,35,0.2)]'">
                <div class="truncate">{{ s.heureDebut }}</div>
                <div class="truncate text-white/50 font-normal" style="font-size:8px">{{ s.formationNom | slice:0:12 }}…</div>
              </div>
              <div *ngIf="day.seances.length === 0" class="w-full h-8 rounded-lg border border-dashed border-white/5"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs: Aujourd'hui | Prochaines | Passées -->
      <div class="flex gap-1 p-1 bg-white/[0.03] rounded-2xl border border-white/5 w-fit">
        <button *ngFor="let tab of tabs"
                (click)="activeTab = tab.key"
                class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                [class]="activeTab === tab.key
                  ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-[0_0_15px_rgba(198,39,97,0.25)]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'">
          {{ tab.label }}
          <span class="ml-2 text-[10px] font-mono opacity-60">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
        <div class="w-12 h-12 rounded-full border-2 border-[#C62761]/30 border-t-[#C62761] animate-spin"></div>
        <p class="text-white/40 text-sm">Chargement des séances…</p>
      </div>

      <!-- Session List -->
      <div *ngIf="!loading" class="glass-card border border-[var(--bridge-border)] overflow-hidden">
        <!-- Table Header -->
        <div class="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-white/5 bg-white/[0.02]">
          <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Formation / Séance</span>
          <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold hidden sm:block">Date</span>
          <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold hidden md:block">Salle</span>
          <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-center">Présents</span>
          <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-right">Action</span>
        </div>

        <!-- Rows -->
        <div *ngIf="paginatedSeances.length > 0" class="divide-y divide-white/[0.03]">
          <div *ngFor="let seance of paginatedSeances; let i = index"
               class="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group items-center"
               [style.animation-delay]="(i * 40) + 'ms'"
               style="animation: fadeSlideIn 0.35s ease both">

            <!-- Formation + Time -->
            <div class="min-w-0">
              <p class="text-sm font-semibold text-white truncate group-hover:text-[#F5A623] transition-colors">{{ seance.formationNom }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs font-mono text-white/40">{{ seance.heureDebut }}</span>
                <span *ngIf="seance.type === 'EN_LIGNE'" class="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-bold">🌐 EN LIGNE</span>
                <span *ngIf="seance.status === 'CLOTUREE'" class="text-[9px] px-1.5 py-0.5 bg-white/5 text-white/30 rounded-full font-bold">🔒 CLÔTURÉE</span>
              </div>
            </div>

            <!-- Date -->
            <div class="hidden sm:flex flex-col justify-center">
              <p class="text-sm text-white/70 font-mono">{{ seance.date | date:'dd/MM' }}</p>
              <p class="text-[10px] text-white/30">{{ formatDayName(seance.date) }}</p>
            </div>

            <!-- Salle -->
            <div class="hidden md:flex items-center">
              <span class="text-sm text-white/50 truncate">{{ seance.salle || '—' }}</span>
            </div>

            <!-- Présents count -->
            <div class="flex items-center justify-center">
              <span class="text-sm font-mono font-bold px-3 py-1 rounded-xl"
                    [class]="getPresentBadgeClass(seance)">
                {{ getPresentCount(seance) }}/{{ (seance.presences?.length || 0) || '?' }}
              </span>
            </div>

            <!-- Action button -->
            <div class="flex items-center justify-end">
              <button (click)="openAttendanceModal(seance)"
                      [disabled]="seance.status === 'CLOTUREE'"
                      class="px-4 py-2 text-xs font-bold rounded-lg transition-all"
                      [class]="seance.status === 'CLOTUREE'
                        ? 'bg-white/5 text-white/20 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white hover:opacity-90 hover:scale-105 shadow-[0_0_10px_rgba(198,39,97,0.2)]'">
                {{ seance.status === 'CLOTUREE' ? '🔒 Clôturée' : '📋 Appel' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="paginatedSeances.length === 0" class="flex flex-col items-center py-16 text-white/30">
          <span class="text-5xl mb-4">📅</span>
          <p class="text-base font-medium text-white/40">Aucune séance</p>
          <p class="text-sm mt-1">{{ emptyStateText }}</p>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="!loading && totalPages > 1" class="flex items-center justify-between">
        <p class="text-xs text-white/40 font-mono">
          {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredSeances.length) }} sur {{ filteredSeances.length }}
        </p>
        <div class="flex items-center gap-1">
          <button (click)="goToPage(currentPage - 1)"
                  [disabled]="currentPage === 1"
                  class="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm">
            ‹
          </button>
          <button *ngFor="let p of pageNumbers"
                  (click)="goToPage(p)"
                  class="w-9 h-9 rounded-lg text-sm font-mono transition-all"
                  [class]="p === currentPage
                    ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold'
                    : 'border border-white/10 text-white/50 hover:text-white hover:border-white/20'">
            {{ p }}
          </button>
          <button (click)="goToPage(currentPage + 1)"
                  [disabled]="currentPage === totalPages"
                  class="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm">
            ›
          </button>
        </div>
      </div>

      <!-- ─── Attendance Modal ────────────────────────────── -->
      <div *ngIf="showAttendanceModal"
           class="bridge-modal-overlay"
           (click)="closeAttendanceModal()">
        <div class="glass-card border border-[var(--bridge-border)] w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl"
             (click)="$event.stopPropagation()">

          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-[var(--bridge-border)] flex-shrink-0">
            <div>
              <h3 class="font-syne font-bold text-lg text-white">📋 Feuille de Présence</h3>
              <p class="text-xs text-white/40 mt-0.5" *ngIf="selectedSeance">
                {{ selectedSeance.formationNom }} · {{ selectedSeance.date | date:'EEEE d MMMM y' }} à {{ selectedSeance.heureDebut }}
              </p>
            </div>
            <div class="flex items-center gap-4">
              <!-- Live counter -->
              <div class="text-center px-4 py-2 bg-white/5 rounded-xl">
                <span class="text-2xl font-mono font-bold"
                      [class]="getPresentInModal() === activePresences.length ? 'text-emerald-400' : getPresentInModal() > 0 ? 'text-[#F5A623]' : 'text-red-400'">
                  {{ getPresentInModal() }}
                </span>
                <span class="text-white/30 text-lg">/{{ activePresences.length }}</span>
                <p class="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">présents</p>
              </div>
              <button (click)="closeAttendanceModal()"
                      class="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">✕</button>
            </div>
          </div>

          <!-- Quick All-Present / All-Absent -->
          <div class="flex items-center gap-3 px-6 py-3 border-b border-white/5 flex-shrink-0 bg-black/10">
            <span class="text-xs text-white/40">Action rapide :</span>
            <button (click)="markAll('PRESENT')"
                    class="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20 transition-all">
              ✓ Tous présents
            </button>
            <button (click)="markAll('ABSENT')"
                    class="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all">
              ✗ Tous absents
            </button>
          </div>

          <!-- Presences List -->
          <div class="flex-1 overflow-y-auto p-6 space-y-3">
            <div *ngFor="let presence of activePresences; let i = index"
                 class="p-4 rounded-xl border transition-all"
                 [class]="getPresenceCardClass(presence)"
                 [style.animation-delay]="(i * 30) + 'ms'"
                 style="animation: fadeSlideIn 0.3s ease both">

              <div class="flex items-center justify-between gap-4">
                <!-- Student info -->
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white overflow-hidden"
                       [class]="presence.present ? 'bg-gradient-to-br from-[#C62761] to-[#F5A623]' : 'bg-white/10'">
                    <img *ngIf="presence.stagiaireAvatar" [src]="presence.stagiaireAvatar" class="w-full h-full object-cover" />
                    <span *ngIf="!presence.stagiaireAvatar">{{ (presence.stagiaireNom || 'S')[0] }}</span>
                  </div>
                  <div>
                    <span class="text-sm font-semibold text-white">{{ presence.stagiaireNom }}</span>
                    <!-- Star Rating (présents uniquement) -->
                    <div class="flex items-center gap-0.5 mt-0.5" *ngIf="presence.present">
                      <button *ngFor="let star of [1,2,3,4,5]"
                              (click)="presence.starRating = star"
                              class="text-sm transition-transform hover:scale-125 focus:outline-none leading-none"
                              [class]="(presence.starRating || 0) >= star ? 'text-[#F5A623]' : 'text-white/15'">★</button>
                    </div>
                  </div>
                </div>

                <!-- Status Buttons -->
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <button (click)="setPresenceStatus(presence, 'PRESENT')"
                          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          [class]="presence.present && !isRetard(presence)
                            ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-white/5 text-white/40 hover:bg-emerald-500/20 hover:text-emerald-400'">
                    ✓ Présent
                  </button>
                  <button (click)="setPresenceStatus(presence, 'RETARD')"
                          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          [class]="presence.present && isRetard(presence)
                            ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,166,35,0.3)]'
                            : 'bg-white/5 text-white/40 hover:bg-amber-500/20 hover:text-amber-400'">
                    ⏰ Retard
                  </button>
                  <button (click)="setPresenceStatus(presence, 'ABSENT')"
                          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          [class]="!presence.present
                            ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                            : 'bg-white/5 text-white/40 hover:bg-rose-500/20 hover:text-rose-400'">
                    ✗ Absent
                  </button>
                </div>
              </div>

              <!-- Note input (for present students) -->
              <div class="mt-3 pt-2.5 border-t border-white/5" *ngIf="presence.present">
                <input [(ngModel)]="presence.sessionNote" type="text"
                       class="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C62761]/50 transition-colors"
                       placeholder="Remarque rapide (ex: excellent travail, manque de participation…)" />
              </div>
            </div>

            <div *ngIf="activePresences.length === 0" class="text-center py-12">
              <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl mx-auto mb-4">👥</div>
              <p class="text-white/50 font-medium">Aucun stagiaire pour cette séance</p>
              <p class="text-white/30 text-xs mt-2">Les stagiaires apparaîtront ici une fois inscrits.</p>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-6 border-t border-[var(--bridge-border)] flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <button (click)="closeSession()"
                    *ngIf="selectedSeance && selectedSeance.status !== 'CLOTUREE'"
                    class="flex-1 py-3 bg-red-500/10 hover:bg-red-500/15 text-red-400 border border-red-500/20 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
              🔒 Clôturer la Séance
            </button>
            <button (click)="saveAttendance()"
                    [disabled]="savingAttendance"
                    class="flex-1 py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-60 transition-all text-sm shadow-[0_0_15px_rgba(198,39,97,0.25)] flex items-center justify-center gap-2">
              <span *ngIf="savingAttendance" class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
              <span *ngIf="!savingAttendance">✓ Valider l'Appel ({{ getPresentInModal() }}/{{ activePresences.length }})</span>
              <span *ngIf="savingAttendance">Enregistrement…</span>
            </button>
          </div>
        </div>
      </div>

    </div>

    <style>
      .bridge-modal-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.75);
        backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        z-index: 50; padding: 1rem;
      }
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadein { animation: fadeSlideIn 0.4s ease both; }
    </style>
  `
})
export class FormateurSeancesComponent implements OnInit, OnDestroy {
  user: User | null = null;
  formations: Formation[] = [];
  allStudents: User[] = [];

  todaySeances: Seance[] = [];
  upcomingSeances: Seance[] = [];
  pastSeances: Seance[] = [];

  activeTab: 'today' | 'upcoming' | 'past' = 'today';
  loading = true;

  // Week navigation
  weekOffset = 0; // 0 = current week
  weekDays: { label: string; num: string; isToday: boolean; date: Date; seances: Seance[] }[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 8;

  // Attendance modal
  showAttendanceModal = false;
  selectedSeance: Seance | null = null;
  activePresences: Presence[] = [];
  savingAttendance = false;

  protected Math = Math;
  private sub = new Subscription();

  todayLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  tabs = [
    { key: 'today' as const, label: "Aujourd'hui", count: 0 },
    { key: 'upcoming' as const, label: 'Prochaines', count: 0 },
    { key: 'past' as const, label: 'Passées', count: 0 },
  ];

  constructor(
    private authService: AuthService,
    private formationService: FormationService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) return;

    this.sub.add(
      this.userService.getAllUsers().subscribe(users => {
        this.allStudents = users.filter(u => u.role === 'STAGIAIRE');
      })
    );

    this.sub.add(
      this.formationService.getFormationsByFormateur(this.user.id).subscribe(data => {
        this.formations = data;
      })
    );

    this.sub.add(
      this.formationService.getTodaySeances(this.user.id).subscribe(data => {
        this.todaySeances = data;
        this.tabs[0].count = data.length;
        this.buildWeekDays();
      })
    );

    this.sub.add(
      this.formationService.getUpcomingSeances(this.user.id).subscribe(data => {
        this.upcomingSeances = data;
        this.tabs[1].count = data.length;
        this.buildWeekDays();
        this.loading = false;
      })
    );

    this.sub.add(
      this.formationService.getPastSeancesByFormateur(this.user.id).subscribe(data => {
        this.pastSeances = data;
        this.tabs[2].count = data.length;
        this.buildWeekDays();
      })
    );

    this.buildWeekDays();
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  buildWeekDays(): void {
    const today = new Date();
    const monday = new Date(today);
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
    monday.setDate(today.getDate() - dayOfWeek + (this.weekOffset * 7));

    const dayNames = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
    const allSeances = [...this.todaySeances, ...this.upcomingSeances, ...this.pastSeances];

    this.weekDays = dayNames.map((label, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toDateString();
      const daySeances = allSeances.filter(s => new Date(s.date).toDateString() === dateStr);
      return {
        label,
        num: date.getDate().toString().padStart(2, '0'),
        isToday: date.toDateString() === today.toDateString(),
        date,
        seances: daySeances
      };
    });
  }

  prevWeek(): void { this.weekOffset--; this.buildWeekDays(); }
  nextWeek(): void { this.weekOffset++; this.buildWeekDays(); }

  get weekRangeLabel(): string {
    if (!this.weekDays.length) return '';
    const start = this.weekDays[0].date;
    const end = this.weekDays[6].date;
    const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return `${fmt(start)} — ${fmt(end)}`;
  }

  get filteredSeances(): Seance[] {
    switch (this.activeTab) {
      case 'today': return this.todaySeances;
      case 'upcoming': return this.upcomingSeances;
      case 'past': return this.pastSeances;
    }
  }

  get paginatedSeances(): Seance[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSeances.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSeances.length / this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  get emptyStateText(): string {
    switch (this.activeTab) {
      case 'today': return 'Aucune séance prévue aujourd\'hui';
      case 'upcoming': return 'Aucune séance à venir planifiée';
      case 'past': return 'Aucune séance passée enregistrée';
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  formatDayName(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'long' });
  }

  getPresentCount(seance: Seance): number {
    return seance.presences?.filter(p => p.present).length || 0;
  }

  getPresentInModal(): number {
    return this.activePresences.filter(p => p.present).length;
  }

  getPresentBadgeClass(seance: Seance): string {
    const count = this.getPresentCount(seance);
    const total = seance.presences?.length || 0;
    if (total === 0) return 'bg-white/5 text-white/30';
    const rate = count / total;
    if (rate >= 0.8) return 'bg-emerald-500/15 text-emerald-400';
    if (rate >= 0.5) return 'bg-[rgba(245,166,35,0.15)] text-[#F5A623]';
    return 'bg-red-500/10 text-red-400';
  }

  openAttendanceModal(seance: Seance): void {
    if (seance.status === 'CLOTUREE') return;
    this.selectedSeance = seance;

    if (seance.presences && seance.presences.length > 0) {
      this.activePresences = JSON.parse(JSON.stringify(seance.presences));
    } else {
      // Build presences from formation students
      const formation = this.formations.find(f => f.nom === seance.formationNom || f.id === seance.formationId);
      let students: User[] = [];
      if (formation && formation.stagiaires.length > 0) {
        students = this.allStudents.filter(s => formation.stagiaires.includes(s.id));
      }
      if (students.length === 0) students = this.allStudents;
      this.activePresences = students.map(s => ({
        stagiaireId: s.id,
        stagiaireNom: `${s.prenom} ${s.nom}`,
        stagiaireAvatar: s.avatar,
        present: false,
        starRating: 0,
        sessionNote: ''
      }));
    }

    this.showAttendanceModal = true;
  }

  closeAttendanceModal(): void {
    this.showAttendanceModal = false;
    this.selectedSeance = null;
    this.activePresences = [];
    this.savingAttendance = false;
  }

  markAll(status: 'PRESENT' | 'ABSENT'): void {
    this.activePresences.forEach(p => this.setPresenceStatus(p, status));
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

  getPresenceCardClass(p: Presence): string {
    if (p.present && !this.isRetard(p)) return 'border-emerald-500/30 bg-emerald-500/[0.04]';
    if (p.present && this.isRetard(p)) return 'border-amber-500/30 bg-amber-500/[0.04]';
    return 'border-red-500/20 bg-red-500/[0.03]';
  }

  saveAttendance(): void {
    if (!this.selectedSeance || this.savingAttendance) return;
    this.savingAttendance = true;
    this.formationService.savePresence(this.selectedSeance.id, this.activePresences).subscribe({
      next: () => {
        this.selectedSeance!.presences = [...this.activePresences];
        this.closeAttendanceModal();
      },
      error: () => { this.savingAttendance = false; }
    });
  }

  closeSession(): void {
    if (!this.selectedSeance) return;
    if (confirm('Clôturer cette séance ? Cela validera la progression et déclenchera les certificats si c\'est la dernière séance de la formation.')) {
      this.formationService.closeSession(this.selectedSeance.id).subscribe({
        next: () => {
          if (this.selectedSeance) {
            this.selectedSeance.status = 'CLOTUREE';
          }
          this.closeAttendanceModal();
        },
        error: (e) => alert(e?.error?.message || 'Erreur lors de la clôture.')
      });
    }
  }
}
