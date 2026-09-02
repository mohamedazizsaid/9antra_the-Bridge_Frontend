import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { FormationService } from '../../../../core/services/formation.service';
import { UserService } from '../../../../core/services/user.service';
import { ToastService } from '../../../../core/services/toast.service';
import { User } from '../../../../core/models/user.model';
import { Formation, Seance, Presence } from '../../../../core/models/formation.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-formateur-seances',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      :host {
        display: block;
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

      .custom-scroll::-webkit-scrollbar {
        width: 5px;
      }
      .custom-scroll::-webkit-scrollbar-track {
        background: transparent;
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

      :host-context([data-theme='light']) .table-header-bg {
        background-color: #f7f3eb !important;
        border-bottom-color: #e2d9c8 !important;
        color: #5f6878 !important;
      }

      :host-context([data-theme='light']) .table-row-hover:hover {
        background-color: #faf7f2 !important;
      }
    `,
  ],
  template: `
    <div class="space-y-6 animate-fadein pb-12">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <span
              >Agenda &
              <span
                class="bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text text-transparent"
                >Séances</span
              ></span
            >
          </h1>
          <p class="text-[var(--bridge-text-muted)] text-xs md:text-sm mt-1">
            Gérez votre calendrier de cours, effectuez l'appel et clôturez vos sessions de
            formation.
          </p>
        </div>
        <div
          class="text-xs text-[var(--bridge-text-muted)] font-mono bg-[var(--bridge-card)] border border-[var(--bridge-border)] px-3.5 py-2 rounded-xl shadow-sm"
        >
          {{ todayLabel }}
        </div>
      </div>

      <!-- Week At A Glance -->
      <div
        class="glass-card border border-[var(--bridge-border)] rounded-2xl bg-[var(--bridge-card)] p-5 md:p-6 shadow-sm"
      >
        <div class="flex items-center justify-between mb-4">
          <h3
            class="font-syne font-bold text-sm md:text-base text-[var(--bridge-text)] flex items-center gap-2"
          >
            <svg
              class="w-4 h-4 text-[#F5A623]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Semaine en cours</span>
          </h3>
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="prevWeek()"
              class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--bridge-border)] flex items-center justify-center text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] transition-all cursor-pointer text-xs"
            >
              ‹
            </button>
            <span
              class="text-xs font-mono text-[var(--bridge-text-muted)] min-w-[120px] text-center font-semibold"
            >
              {{ weekRangeLabel }}
            </span>
            <button
              type="button"
              (click)="nextWeek()"
              class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--bridge-border)] flex items-center justify-center text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] transition-all cursor-pointer text-xs"
            >
              ›
            </button>
          </div>
        </div>

        <div class="grid grid-cols-7 gap-2">
          <div *ngFor="let day of weekDays" class="flex flex-col items-center gap-2">
            <div class="text-center">
              <p
                class="text-[9px] uppercase tracking-widest font-bold"
                [class]="day.isToday ? 'text-[#F5A623]' : 'text-[var(--bridge-text-muted)]'"
              >
                {{ day.label }}
              </p>
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-bold mt-1 transition-all"
                [class]="
                  day.isToday
                    ? 'bg-gradient-to-br from-[#C62761] to-[#F5A623] text-white shadow-md'
                    : 'bg-white/5 text-[var(--bridge-text-muted)] border border-[var(--bridge-border)]'
                "
              >
                {{ day.num }}
              </div>
            </div>
            <div class="w-full space-y-1 min-h-[40px]">
              <div
                *ngFor="let s of day.seances"
                (click)="canDoAppel(s) || s.status === 'CLOTUREE' ? openAttendanceModal(s) : null"
                class="w-full px-1.5 py-1 rounded-lg text-[9px] font-bold transition-all shadow-sm"
                [class]="
                  s.status === 'CLOTUREE'
                    ? 'bg-white/5 text-[var(--bridge-text-muted)] opacity-60 line-through cursor-default border border-[var(--bridge-border)]'
                    : canDoAppel(s)
                      ? 'bg-gradient-to-r from-[rgba(198,39,97,0.2)] to-[rgba(245,166,35,0.2)] text-[#F5A623] border border-[#F5A623]/40 cursor-pointer hover:scale-105'
                      : 'bg-white/5 text-[var(--bridge-text-muted)] cursor-not-allowed border border-[var(--bridge-border)]'
                "
              >
                <div class="truncate">{{ s.heureDebut }}</div>
                <div class="truncate opacity-75 font-normal text-[8px]">
                  {{ s.formationNom | slice: 0 : 12 }}…
                </div>
              </div>
              <div
                *ngIf="day.seances.length === 0"
                class="w-full h-8 rounded-lg border border-dashed border-[var(--bridge-border)] opacity-30"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div
        class="flex items-center p-1.5 bg-[var(--bridge-card)] border border-[var(--bridge-border)] rounded-2xl w-fit max-w-full overflow-x-auto shadow-sm"
      >
        <button
          *ngFor="let tab of tabs"
          type="button"
          (click)="activeTab = tab.key; currentPage = 1"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          [ngClass]="
            activeTab === tab.key
              ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-md'
              : 'text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] hover:bg-white/5'
          "
        >
          <span>{{ tab.label }}</span>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
            [ngClass]="
              activeTab === tab.key
                ? 'bg-black/20 text-white'
                : 'bg-white/10 text-[var(--bridge-text-muted)]'
            "
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
        <div
          class="w-10 h-10 rounded-full border-2 border-[#C62761]/30 border-t-[#C62761] animate-spin"
        ></div>
        <p class="text-[var(--bridge-text-muted)] text-xs">Chargement des séances…</p>
      </div>

      <!-- Session List Table -->
      <div
        *ngIf="!loading"
        class="glass-card border border-[var(--bridge-border)] rounded-2xl bg-[var(--bridge-card)] overflow-hidden shadow-sm"
      >
        <div
          class="table-header-bg grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-[var(--bridge-border)] bg-white/[0.02]"
        >
          <span
            class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold"
            >Formation / Séance</span
          >
          <span
            class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold hidden sm:block"
            >Date</span
          >
          <span
            class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold hidden md:block"
            >Salle</span
          >
          <span
            class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold text-center"
            >Présents</span
          >
          <span
            class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold text-right"
            >Action</span
          >
        </div>

        <div *ngIf="paginatedSeances.length > 0" class="divide-y divide-[var(--bridge-border)]">
          <div
            *ngFor="let seance of paginatedSeances"
            class="table-row-hover grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors items-center group"
          >
            <div class="min-w-0">
              <p
                class="text-xs font-semibold text-[var(--bridge-text)] truncate group-hover:text-[#F5A623] transition-colors"
              >
                {{ seance.formationNom }}
              </p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[11px] font-mono text-[var(--bridge-text-muted)]">{{
                  seance.heureDebut
                }}</span>
                <span
                  *ngIf="seance.type === 'EN_LIGNE'"
                  class="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-bold flex items-center gap-1"
                >
                  <svg
                    class="w-2.5 h-2.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                  </svg>
                  <span>En ligne</span>
                </span>
                <span
                  *ngIf="seance.status === 'CLOTUREE'"
                  class="text-[9px] px-1.5 py-0.5 bg-white/5 text-[var(--bridge-text-muted)] rounded-full font-bold border border-[var(--bridge-border)]"
                >
                  Clôturée
                </span>
                <span
                  *ngIf="isToday(seance.date) && seance.status !== 'CLOTUREE'"
                  class="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold animate-pulse"
                >
                  Aujourd'hui
                </span>
              </div>
            </div>

            <div class="hidden sm:flex flex-col justify-center">
              <p class="text-xs text-[var(--bridge-text)] font-mono font-medium">
                {{ seance.date | date: 'dd/MM' }}
              </p>
              <p class="text-[10px] text-[var(--bridge-text-muted)] capitalize">
                {{ formatDayName(seance.date) }}
              </p>
            </div>

            <div class="hidden md:flex items-center">
              <span class="text-xs text-[var(--bridge-text-muted)] truncate">{{
                seance.salle || '—'
              }}</span>
            </div>

            <div class="flex items-center justify-center">
              <span
                class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg"
                [class]="getPresentBadgeClass(seance)"
              >
                {{ getPresentCount(seance) }}/{{ seance.presences?.length || 0 }}
              </span>
            </div>

            <!-- Action Button -->
            <div class="flex items-center justify-end">
              <ng-container *ngIf="seance.status !== 'CLOTUREE'; else closedBadge">
                <ng-container *ngIf="isToday(seance.date); else notToday">
                  <button
                    *ngIf="canDoAppel(seance)"
                    type="button"
                    (click)="openAttendanceModal(seance)"
                    class="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white hover:opacity-95 hover:scale-105 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                      />
                      <rect x="8" y="2" width="8" height="4" rx="1" />
                    </svg>
                    <span>Appel</span>
                  </button>
                  <div
                    *ngIf="!canDoAppel(seance)"
                    class="text-[10px] text-[var(--bridge-text-muted)] italic bg-white/5 px-2.5 py-1 rounded-lg border border-[var(--bridge-border)] text-center leading-tight"
                  >
                    Dispo à {{ seance.heureDebut }}
                  </div>
                </ng-container>
                <ng-template #notToday>
                  <div
                    class="text-[10px] text-[var(--bridge-text-muted)] opacity-60 italic bg-white/5 px-2.5 py-1 rounded-lg border border-[var(--bridge-border)]"
                  >
                    Jour J uniquement
                  </div>
                </ng-template>
              </ng-container>
              <ng-template #closedBadge>
                <span
                  class="text-[10px] px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg font-semibold flex items-center gap-1"
                >
                  <svg
                    class="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Clôturée</span>
                </span>
              </ng-template>
            </div>
          </div>
        </div>

        <div
          *ngIf="paginatedSeances.length === 0"
          class="flex flex-col items-center py-16 text-[var(--bridge-text-muted)]"
        >
          <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
            <svg
              class="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-[var(--bridge-text)]">Aucune séance</p>
          <p class="text-xs mt-1">{{ emptyStateText }}</p>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="!loading && totalPages > 1" class="flex items-center justify-between pt-2">
        <p class="text-xs text-[var(--bridge-text-muted)] font-mono">
          {{ (currentPage - 1) * pageSize + 1 }}–{{
            Math.min(currentPage * pageSize, filteredSeances.length)
          }}
          sur {{ filteredSeances.length }}
        </p>
        <div class="flex items-center gap-1">
          <button
            type="button"
            (click)="goToPage(currentPage - 1)"
            [disabled]="currentPage === 1"
            class="w-8 h-8 rounded-lg border border-[var(--bridge-border)] flex items-center justify-center text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-xs"
          >
            ‹
          </button>
          <button
            *ngFor="let p of pageNumbers"
            type="button"
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
            type="button"
            (click)="goToPage(currentPage + 1)"
            [disabled]="currentPage === totalPages"
            class="w-8 h-8 rounded-lg border border-[var(--bridge-border)] flex items-center justify-center text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-xs"
          >
            ›
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- DRAWER MODAL — Feuille de présence                              -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div
      *ngIf="showAttendanceModal"
      class="fixed inset-0 z-[99999] flex items-stretch justify-end"
      (click)="closeAttendanceModal()"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <!-- Drawer Panel -->
      <div
        class="drawer-panel-bg relative z-10 w-full max-w-lg h-screen flex flex-col drawer-slide-in bg-[#10102A] border-l border-[var(--bridge-border)] overflow-hidden shadow-2xl"
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
          <div>
            <h3
              class="font-syne font-bold text-base text-[var(--bridge-text)] flex items-center gap-2"
            >
              <svg
                *ngIf="attendanceValidated"
                class="w-4 h-4 text-emerald-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <svg
                *ngIf="!attendanceValidated"
                class="w-4 h-4 text-[#F5A623]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                />
                <rect x="8" y="2" width="8" height="4" rx="1" />
              </svg>
              <span>{{ attendanceValidated ? 'Clôturer la séance' : 'Feuille de Présence' }}</span>
            </h3>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5" *ngIf="selectedSeance">
              {{ selectedSeance.formationNom }} · {{ selectedSeance.date | date: 'EEEE d MMMM' }} à
              {{ selectedSeance.heureDebut }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <!-- Live counter -->
            <div
              class="flex items-center gap-2 px-3 py-1.5 rounded-2xl border"
              [class]="
                getPresentInModal() === activePresences.length
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  : getPresentInModal() > 0
                    ? 'bg-amber-500/10 border-amber-500/20 text-[#F5A623]'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
              "
            >
              <span class="text-lg font-mono font-bold leading-none">
                {{ getPresentInModal() }}
              </span>
              <div>
                <p class="text-[10px] text-[var(--bridge-text-muted)] leading-none">
                  /{{ activePresences.length }}
                </p>
                <p class="text-[8px] uppercase tracking-wider mt-0.5 leading-none font-semibold">
                  présents
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="closeAttendanceModal()"
              class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] transition-all border border-[var(--bridge-border)] text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="px-6 pt-4 pb-2 flex-shrink-0" *ngIf="activePresences.length > 0">
          <div
            class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-[var(--bridge-border)]"
          >
            <div
              class="h-full rounded-full transition-all duration-500"
              [class]="
                getPresentInModal() === activePresences.length
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-[#C62761] to-[#F5A623]'
              "
              [style.width]="
                (activePresences.length > 0
                  ? (getPresentInModal() / activePresences.length) * 100
                  : 0) + '%'
              "
            ></div>
          </div>
          <div class="flex justify-between mt-1.5 text-[10px] text-[var(--bridge-text-muted)]">
            <span>{{ getPresentInModal() }} présent(s)</span>
            <span>{{ activePresences.length - getPresentInModal() }} absent(s)</span>
          </div>
        </div>

        <!-- Quick actions -->
        <div
          *ngIf="!attendanceValidated"
          class="flex items-center gap-3 px-6 py-2.5 border-b border-[var(--bridge-border)] flex-shrink-0 bg-white/[0.01]"
        >
          <span class="text-xs text-[var(--bridge-text-muted)]">Action rapide :</span>
          <button
            type="button"
            (click)="markAll('PRESENT')"
            class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
          >
            <svg
              class="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Tous présents</span>
          </button>
          <button
            type="button"
            (click)="markAll('ABSENT')"
            class="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer flex items-center gap-1"
          >
            <svg
              class="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>Tous absents</span>
          </button>
        </div>

        <!-- Validated banner -->
        <div
          *ngIf="attendanceValidated"
          class="mx-6 mt-3 p-3.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 flex items-center gap-3 flex-shrink-0"
        >
          <div
            class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0"
          >
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p class="text-emerald-500 font-semibold text-xs">Appel validé avec succès !</p>
            <p class="text-[var(--bridge-text-muted)] text-[11px] mt-0.5">
              {{ getPresentInModal() }}/{{ activePresences.length }} présents enregistrés. Vous
              pouvez maintenant clôturer la séance.
            </p>
          </div>
        </div>

        <!-- Presences List -->
        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-2.5 custom-scroll">
          <div
            *ngFor="let presence of activePresences"
            class="p-3.5 rounded-2xl border transition-all"
            [class]="getPresenceCardClass(presence)"
          >
            <div class="flex items-center justify-between gap-4">
              <!-- Student info -->
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white overflow-hidden shadow-sm"
                  [class]="
                    presence.present
                      ? 'bg-gradient-to-br from-[#C62761] to-[#F5A623]'
                      : 'bg-white/10 text-[var(--bridge-text-muted)]'
                  "
                >
                  <img
                    *ngIf="presence.stagiaireAvatar"
                    [src]="presence.stagiaireAvatar"
                    class="w-full h-full object-cover"
                    alt=""
                  />
                  <span *ngIf="!presence.stagiaireAvatar">{{
                    (presence.stagiaireNom || 'S')[0]
                  }}</span>
                </div>
                <div class="min-w-0">
                  <span class="text-xs font-semibold text-[var(--bridge-text)] block truncate">
                    {{ presence.stagiaireNom }}
                  </span>
                  <!-- Star rating when present -->
                  <div
                    class="flex items-center gap-0.5 mt-0.5"
                    *ngIf="presence.present && !attendanceValidated"
                  >
                    <button
                      *ngFor="let star of [1, 2, 3, 4, 5]"
                      type="button"
                      (click)="presence.starRating = star"
                      class="text-xs transition-transform hover:scale-125 focus:outline-none leading-none cursor-pointer"
                      [class]="
                        (presence.starRating || 0) >= star
                          ? 'text-[#F5A623]'
                          : 'text-gray-400 opacity-30'
                      "
                    >
                      ★
                    </button>
                  </div>
                  <div
                    class="flex items-center gap-0.5 mt-0.5"
                    *ngIf="presence.present && attendanceValidated"
                  >
                    <span
                      *ngFor="let star of [1, 2, 3, 4, 5]"
                      class="text-xs leading-none"
                      [class]="
                        (presence.starRating || 0) >= star
                          ? 'text-[#F5A623]'
                          : 'text-gray-400 opacity-30'
                      "
                    >
                      ★
                    </span>
                  </div>
                </div>
              </div>

              <!-- Status Buttons -->
              <div *ngIf="!attendanceValidated" class="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  (click)="setPresenceStatus(presence, 'PRESENT')"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  [class]="
                    presence.present && !isRetard(presence)
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white/5 text-[var(--bridge-text-muted)] hover:bg-emerald-500/20 hover:text-emerald-500'
                  "
                >
                  <svg
                    class="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Présent</span>
                </button>
                <button
                  type="button"
                  (click)="setPresenceStatus(presence, 'RETARD')"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  [class]="
                    presence.present && isRetard(presence)
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white/5 text-[var(--bridge-text-muted)] hover:bg-amber-500/20 hover:text-amber-500'
                  "
                >
                  <svg
                    class="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Retard</span>
                </button>
                <button
                  type="button"
                  (click)="setPresenceStatus(presence, 'ABSENT')"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  [class]="
                    !presence.present
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-white/5 text-[var(--bridge-text-muted)] hover:bg-rose-500/20 hover:text-rose-500'
                  "
                >
                  <svg
                    class="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span>Absent</span>
                </button>
              </div>

              <!-- Validated status badge -->
              <div *ngIf="attendanceValidated" class="flex-shrink-0">
                <span
                  class="text-[11px] font-bold px-2.5 py-1 rounded-full border"
                  [class]="
                    presence.present && !isRetard(presence)
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : presence.present && isRetard(presence)
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  "
                >
                  {{
                    presence.present && !isRetard(presence)
                      ? '✓ Présent'
                      : presence.present && isRetard(presence)
                        ? 'Retard'
                        : '✗ Absent'
                  }}
                </span>
              </div>
            </div>

            <!-- Note input -->
            <div
              class="mt-2.5 pt-2 border-t border-[var(--bridge-border)]"
              *ngIf="presence.present && !attendanceValidated"
            >
              <input
                [(ngModel)]="presence.sessionNote"
                type="text"
                class="input-themed w-full bg-[var(--bridge-card)] border border-[var(--bridge-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[#C62761]/50 transition-colors"
                placeholder="Remarque particulière (optionnel…)"
              />
            </div>
            <div
              *ngIf="presence.present && attendanceValidated && presence.sessionNote"
              class="mt-2 text-xs text-[var(--bridge-text-muted)] italic"
            >
              "{{ presence.sessionNote }}"
            </div>
          </div>

          <div
            *ngIf="activePresences.length === 0"
            class="text-center py-12 text-[var(--bridge-text-muted)]"
          >
            <div
              class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3"
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
            <p class="text-xs font-medium text-[var(--bridge-text)]">Aucun stagiaire inscrit</p>
            <p class="text-[11px] mt-1">
              Les stagiaires inscrits à cette formation apparaîtront ici.
            </p>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="flex gap-3 px-6 py-4 border-t border-[var(--bridge-border)] flex-shrink-0 bg-white/[0.01]"
        >
          <ng-container *ngIf="!attendanceValidated">
            <button
              type="button"
              (click)="saveAttendance()"
              [disabled]="savingAttendance || activePresences.length === 0"
              class="flex-1 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl hover:opacity-95 disabled:opacity-40 transition-all text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span
                *ngIf="savingAttendance"
                class="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"
              ></span>
              <span *ngIf="!savingAttendance"
                >Valider l'Appel ({{ getPresentInModal() }}/{{ activePresences.length }})</span
              >
            </button>
          </ng-container>

          <ng-container *ngIf="attendanceValidated">
            <button
              type="button"
              (click)="closeSession()"
              [disabled]="savingAttendance"
              class="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl hover:opacity-95 disabled:opacity-40 transition-all text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span
                *ngIf="savingAttendance"
                class="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"
              ></span>
              <svg
                *ngIf="!savingAttendance"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span *ngIf="!savingAttendance">Clôturer la Séance</span>
            </button>
          </ng-container>
        </div>
      </div>
    </div>
  `,
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

  weekOffset = 0;
  weekDays: { label: string; num: string; isToday: boolean; date: Date; seances: Seance[] }[] = [];

  currentPage = 1;
  pageSize = 8;

  // Attendance modal
  showAttendanceModal = false;
  selectedSeance: Seance | null = null;
  activePresences: Presence[] = [];
  savingAttendance = false;
  attendanceValidated = false;

  protected Math = Math;
  private sub = new Subscription();

  todayLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  tabs = [
    { key: 'today' as const, label: "Aujourd'hui", count: 0 },
    { key: 'upcoming' as const, label: 'Prochaines', count: 0 },
    { key: 'past' as const, label: 'Passées', count: 0 },
  ];

  constructor(
    private authService: AuthService,
    private formationService: FormationService,
    private userService: UserService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) return;

    this.userService.getAllUsers().subscribe((users) => {
      this.allStudents = users.filter((u) => u.role === 'STAGIAIRE');
    });

    this.sub.add(
      this.formationService.getFormationsByFormateur(this.user.id).subscribe((data) => {
        this.formations = data;
      }),
    );

    this.sub.add(
      this.formationService.getTodaySeances(this.user.id).subscribe((data) => {
        this.todaySeances = data;
        this.tabs[0].count = data.length;
        this.buildWeekDays();
      }),
    );

    this.sub.add(
      this.formationService.getUpcomingSeances(this.user.id).subscribe((data) => {
        this.upcomingSeances = data;
        this.tabs[1].count = data.length;
        this.buildWeekDays();
        this.loading = false;
      }),
    );

    this.sub.add(
      this.formationService.getPastSeancesByFormateur(this.user.id).subscribe((data) => {
        this.pastSeances = data;
        this.tabs[2].count = data.length;
        this.buildWeekDays();
      }),
    );

    this.buildWeekDays();
  }

  loadSeances(): void {
    if (!this.user) return;
    this.loading = true;
    this.formationService.getTodaySeances(this.user.id).subscribe((data) => {
      this.todaySeances = data;
      this.tabs[0].count = data.length;
      this.buildWeekDays();
    });
    this.formationService.getUpcomingSeances(this.user.id).subscribe((data) => {
      this.upcomingSeances = data;
      this.tabs[1].count = data.length;
      this.buildWeekDays();
      this.loading = false;
    });
    this.formationService.getPastSeancesByFormateur(this.user.id).subscribe((data) => {
      this.pastSeances = data;
      this.tabs[2].count = data.length;
      this.buildWeekDays();
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  buildWeekDays(): void {
    const today = new Date();
    const monday = new Date(today);
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
    monday.setDate(today.getDate() - dayOfWeek + this.weekOffset * 7);

    const dayNames = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
    const allSeances = [...this.todaySeances, ...this.upcomingSeances, ...this.pastSeances];

    this.weekDays = dayNames.map((label, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toDateString();
      const daySeances = allSeances.filter((s) => new Date(s.date).toDateString() === dateStr);
      return {
        label,
        num: date.getDate().toString().padStart(2, '0'),
        isToday: date.toDateString() === today.toDateString(),
        date,
        seances: daySeances,
      };
    });
  }

  prevWeek(): void {
    this.weekOffset--;
    this.buildWeekDays();
  }
  nextWeek(): void {
    this.weekOffset++;
    this.buildWeekDays();
  }

  get weekRangeLabel(): string {
    if (!this.weekDays.length) return '';
    const start = this.weekDays[0].date;
    const end = this.weekDays[6].date;
    const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return `${fmt(start)} — ${fmt(end)}`;
  }

  get filteredSeances(): Seance[] {
    switch (this.activeTab) {
      case 'today':
        return this.todaySeances;
      case 'upcoming':
        return this.upcomingSeances;
      case 'past':
        return this.pastSeances;
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
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  get emptyStateText(): string {
    switch (this.activeTab) {
      case 'today':
        return "Aucune séance prévue aujourd'hui";
      case 'upcoming':
        return 'Aucune séance à venir planifiée';
      case 'past':
        return 'Aucune séance passée enregistrée';
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

  canDoAppel(seance: Seance): boolean {
    if (!this.isToday(seance.date)) return false;
    if (seance.status === 'CLOTUREE') return false;
    if (!seance.heureDebut) return true;
    const [h, m] = seance.heureDebut.split(':').map(Number);
    const sessionTime = new Date();
    sessionTime.setHours(h, m, 0, 0);
    const thirtyMinBefore = new Date(sessionTime.getTime() - 30 * 60 * 1000);
    const now = new Date();
    return now >= thirtyMinBefore;
  }

  isToday(date: Date | string): boolean {
    return new Date(date).toDateString() === new Date().toDateString();
  }

  getPresentCount(seance: Seance): number {
    return seance.presences?.filter((p) => p.present).length || 0;
  }

  getPresentInModal(): number {
    return this.activePresences.filter((p) => p.present).length;
  }

  getPresentBadgeClass(seance: Seance): string {
    const count = this.getPresentCount(seance);
    const total = seance.presences?.length || 0;
    if (total === 0) return 'bg-white/5 text-[var(--bridge-text-muted)]';
    const rate = count / total;
    if (rate >= 0.8) return 'bg-emerald-500/15 text-emerald-500';
    if (rate >= 0.5) return 'bg-amber-500/15 text-amber-500';
    return 'bg-rose-500/15 text-rose-500';
  }

  openAttendanceModal(seance: Seance): void {
    if (seance.status === 'CLOTUREE') return;
    this.selectedSeance = seance;
    this.attendanceValidated = false;

    if (seance.presences && seance.presences.length > 0) {
      this.activePresences = JSON.parse(JSON.stringify(seance.presences));
      this.attendanceValidated = true;
    } else {
      const formation = this.formations.find(
        (f) => f.nom === seance.formationNom || f.id === seance.formationId,
      );
      if (formation && formation.stagiaires && formation.stagiaires.length > 0) {
        const enrolledStudents = this.allStudents.filter((s) =>
          formation.stagiaires.includes(s.id),
        );
        this.activePresences = enrolledStudents.map((s) => ({
          stagiaireId: s.id,
          stagiaireNom: `${s.prenom} ${s.nom}`,
          stagiaireAvatar: s.avatar,
          present: false,
          starRating: 0,
          sessionNote: '',
        }));
      } else {
        this.activePresences = [];
      }
    }

    this.showAttendanceModal = true;
  }

  closeAttendanceModal(): void {
    this.showAttendanceModal = false;
    this.selectedSeance = null;
    this.activePresences = [];
    this.savingAttendance = false;
    this.attendanceValidated = false;
  }

  markAll(status: 'PRESENT' | 'ABSENT'): void {
    this.activePresences.forEach((p) => this.setPresenceStatus(p, status));
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
    return 'border-rose-500/20 bg-rose-500/[0.03]';
  }

  saveAttendance(): void {
    if (!this.selectedSeance || this.savingAttendance) return;
    this.savingAttendance = true;
    this.formationService.savePresence(this.selectedSeance.id, this.activePresences).subscribe({
      next: () => {
        this.selectedSeance!.presences = [...this.activePresences];
        this.savingAttendance = false;
        this.attendanceValidated = true;
        this.toastService.success(
          `Appel validé ! ${this.getPresentInModal()}/${this.activePresences.length} présents enregistrés.`,
          'Feuille de Présence',
        );
      },
      error: () => {
        this.savingAttendance = false;
      },
    });
  }

  closeSession(): void {
    if (!this.selectedSeance || this.savingAttendance) return;
    this.savingAttendance = true;
    this.formationService.closeSession(this.selectedSeance.id).subscribe({
      next: () => {
        this.toastService.success(
          'Séance clôturée ! Progressions et certificats mis à jour.',
          'Clôture',
        );
        this.closeAttendanceModal();
        this.loadSeances();
      },
      error: (e) => {
        this.savingAttendance = false;
        this.toastService.error(e?.error?.message || 'Erreur lors de la clôture.', 'Clôture');
      },
    });
  }
}
