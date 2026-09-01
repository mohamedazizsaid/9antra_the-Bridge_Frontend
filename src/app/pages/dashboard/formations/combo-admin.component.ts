import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComboEnrollment } from '../../../core/models/combo-enrollment.model';
import { ComboEnrollmentService } from '../../../core/services/combo-enrollment.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-combo-admin',
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
        class="relative z-10 w-full max-w-6xl max-h-[94vh] flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <div
          class="glass-card border border-[var(--bridge-border)] overflow-hidden flex flex-col max-h-[94vh]"
        >
          <!-- Top gradient bar -->
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
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div>
                <h2 class="font-syne font-bold text-white text-lg">Supervision Combos</h2>
                <p class="text-xs text-[var(--bridge-text-muted)]">
                  Vue globale de tous les parcours personnalisés
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

          <!-- KPI strip -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-0 border-b border-white/5 flex-shrink-0">
            <div class="p-4 border-r border-white/5">
              <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider">
                Total combos
              </p>
              <p class="font-mono font-bold text-2xl text-white mt-1">{{ combos.length }}</p>
            </div>
            <div class="p-4 border-r border-white/5">
              <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider">
                Actifs
              </p>
              <p class="font-mono font-bold text-2xl text-emerald-400 mt-1">{{ activeCount }}</p>
            </div>
            <div class="p-4 border-r border-white/5">
              <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider">
                En attente paiement
              </p>
              <p class="font-mono font-bold text-2xl text-amber-400 mt-1">{{ pendingCount }}</p>
            </div>
            <div class="p-4">
              <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider">
                Revenus générés
              </p>
              <p class="font-mono font-bold text-2xl text-[#F5A623] mt-1">
                {{ totalRevenue | number: '1.0-0' }} TND
              </p>
            </div>
          </div>

          <!-- Filters -->
          <div class="flex flex-wrap gap-3 px-6 py-3 border-b border-white/5 flex-shrink-0">
            <button
              *ngFor="let s of statusFilters"
              (click)="activeFilter = s.key"
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              [class]="
                activeFilter === s.key
                  ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-md'
                  : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'
              "
            >
              {{ s.label }}
              <span class="ml-1 text-[9px] opacity-70">({{ getCountForStatus(s.key) }})</span>
            </button>

            <!-- Search -->
            <div class="relative flex-1 min-w-[200px]">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">
                <svg
                  class="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="20" y1="20" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                [(ngModel)]="searchQuery"
                placeholder="Rechercher stagiaire, formation..."
                class="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs
                       text-white placeholder-white/30 focus:outline-none focus:border-[#C62761] transition-all"
              />
            </div>
          </div>

          <!-- Table -->
          <div class="flex-1 overflow-y-auto min-h-0">
            <!-- Loading -->
            <div *ngIf="loading" class="p-6 space-y-3">
              <div
                *ngFor="let _ of [1, 2, 3, 4, 5]"
                class="h-12 glass-card border border-[var(--bridge-border)] animate-pulse rounded-xl"
              ></div>
            </div>

            <!-- Table header -->
            <div
              *ngIf="!loading"
              class="sticky top-0 grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-2
                        bg-white/[0.02] border-b border-white/5 z-10"
            >
              <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold w-12"
                >#</span
              >
              <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold"
                >Stagiaire / Formations</span
              >
              <span
                class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-center"
                >Nbr.</span
              >
              <span
                class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-right"
                >Remise</span
              >
              <span
                class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-right"
                >Total</span
              >
              <span
                class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-center"
                >Statut</span
              >
            </div>

            <!-- Table rows -->
            <div *ngIf="!loading" class="divide-y divide-white/[0.03]">
              <div
                *ngFor="let combo of filteredCombos; let i = index"
                class="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-3 items-center
                       hover:bg-white/[0.02] cursor-pointer group transition-colors"
                (click)="toggleDetail(combo.id)"
              >
                <!-- Index -->
                <span class="text-xs text-white/30 font-mono w-12">{{ i + 1 }}</span>

                <!-- Stagiaire + formations -->
                <div class="min-w-0">
                  <p
                    class="font-semibold text-white text-sm group-hover:text-[#F5A623] transition-colors"
                  >
                    {{ combo.studentFirstName }} {{ combo.studentLastName }}
                  </p>
                  <p class="text-xs text-[var(--bridge-text-muted)] truncate mt-0.5">
                    {{ getFormationsSummary(combo) }}
                    <span *ngIf="getExtraFormationsCount(combo) > 0" class="text-white/30"
                      >+{{ getExtraFormationsCount(combo) }}</span
                    >
                  </p>
                  <p class="text-[10px] text-white/30 mt-0.5">{{ combo.receiptRef }}</p>
                </div>

                <!-- Nombre formations -->
                <span class="text-sm font-mono font-bold text-white text-center">
                  {{ combo.formations.length }}
                </span>

                <!-- Remise -->
                <span class="text-sm font-mono font-bold text-[#F5A623] text-right">
                  -{{ combo.discountPercent }}%
                </span>

                <!-- Total -->
                <span class="text-sm font-mono font-bold text-white text-right">
                  {{ combo.finalPrice | number: '1.0-0' }} TND
                </span>

                <!-- Statut -->
                <span
                  class="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border text-center"
                  [class]="getComboStatusClass(combo.status)"
                >
                  {{ getComboStatusLabel(combo.status) }}
                </span>
              </div>

              <!-- Row: détail expandé -->
              <ng-container *ngFor="let combo of filteredCombos">
                <div
                  *ngIf="expandedDetailId === combo.id"
                  class="px-6 py-4 bg-white/[0.01] border-b border-[#C62761]/10"
                >
                  <div class="grid md:grid-cols-2 gap-4">
                    <!-- Info bloc -->
                    <div class="space-y-2">
                      <p
                        class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                      >
                        Détail du combo
                      </p>
                      <div class="flex justify-between text-xs">
                        <span class="text-[var(--bridge-text-muted)]">Email</span>
                        <span class="text-white">{{ combo.studentEmail }}</span>
                      </div>
                      <div class="flex justify-between text-xs">
                        <span class="text-[var(--bridge-text-muted)]">Créé le</span>
                        <span class="text-white">{{ combo.createdAt | date: 'dd/MM/yyyy' }}</span>
                      </div>
                      <div class="flex justify-between text-xs">
                        <span class="text-[var(--bridge-text-muted)]">Payé le</span>
                        <span class="text-white">{{
                          combo.paidAt ? (combo.paidAt | date: 'dd/MM/yyyy') : '—'
                        }}</span>
                      </div>
                      <div class="flex justify-between text-xs">
                        <span class="text-[var(--bridge-text-muted)]">Sous-total</span>
                        <span class="text-white font-mono"
                          >{{ combo.totalPrice | number: '1.0-0' }} TND</span
                        >
                      </div>
                      <div class="flex justify-between text-xs text-[#F5A623]">
                        <span>Remise ({{ combo.discountPercent }}%)</span>
                        <span class="font-mono">
                          -{{ combo.totalPrice - combo.finalPrice | number: '1.0-0' }} TND
                        </span>
                      </div>
                      <div
                        class="flex justify-between text-sm font-bold border-t border-white/10 pt-2 mt-2"
                      >
                        <span class="text-white">Total payé</span>
                        <span class="text-[#C62761] font-mono"
                          >{{ combo.finalPrice | number: '1.0-0' }} TND</span
                        >
                      </div>
                    </div>

                    <!-- Formations list -->
                    <div class="space-y-2">
                      <p
                        class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                      >
                        Formations incluses
                      </p>
                      <div
                        *ngFor="let f of combo.formations; let fi = index"
                        class="flex items-center justify-between px-3 py-2 rounded-lg bg-white/3 border border-white/8"
                      >
                        <div>
                          <p class="text-xs font-semibold text-white">{{ fi + 1 }}. {{ f.nom }}</p>
                          <p class="text-[10px] text-[var(--bridge-text-muted)]">
                            {{ f.formateurNom || 'Formateur' }}
                            <span *ngIf="f.defaultDurationWeeks">
                              · {{ f.defaultDurationWeeks }} sem.</span
                            >
                          </p>
                        </div>
                        <span class="font-mono text-xs text-[#F5A623]"
                          >{{ f.totalPrice | number: '1.0-0' }} TND</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </ng-container>
            </div>

            <!-- Empty filter result -->
            <div *ngIf="!loading && filteredCombos.length === 0" class="p-16 text-center">
              <p class="text-white/40">Aucun combo ne correspond à ce filtre.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ComboAdminComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() closed = new EventEmitter<void>();

  combos: ComboEnrollment[] = [];
  loading = true;

  activeFilter = 'ALL';
  searchQuery = '';
  expandedDetailId: number | null = null;

  statusFilters = [
    { key: 'ALL', label: 'Tous' },
    { key: 'ACTIVE', label: 'Actifs' },
    { key: 'PENDING_PAYMENT', label: 'En attente' },
    { key: 'COMPLETED', label: 'Terminés' },
    { key: 'CANCELLED', label: 'Annulés' },
  ];

  constructor(
    private comboService: ComboEnrollmentService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    if (!this.user) this.user = this.authService.getCurrentUser();
    this.loadCombos();
  }

  loadCombos(): void {
    this.loading = true;
    this.comboService.getAllCombos().subscribe({
      next: (data) => {
        this.combos = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get filteredCombos(): ComboEnrollment[] {
    return this.combos.filter((c) => {
      const matchStatus = this.activeFilter === 'ALL' || c.status === this.activeFilter;
      const q = this.searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        `${c.studentFirstName} ${c.studentLastName}`.toLowerCase().includes(q) ||
        c.formations.some((f) => f.nom.toLowerCase().includes(q)) ||
        (c.receiptRef || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }

  get activeCount(): number {
    return this.combos.filter((c) => c.status === 'ACTIVE').length;
  }

  get pendingCount(): number {
    return this.combos.filter((c) => c.status === 'PENDING_PAYMENT').length;
  }

  get totalRevenue(): number {
    return this.combos
      .filter((c) => c.status === 'ACTIVE' || c.status === 'COMPLETED')
      .reduce((sum, c) => sum + (c.finalPrice || 0), 0);
  }

  getCountForStatus(key: string): number {
    if (key === 'ALL') return this.combos.length;
    return this.combos.filter((c) => c.status === key).length;
  }

  toggleDetail(id: number): void {
    this.expandedDetailId = this.expandedDetailId === id ? null : id;
  }

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

  getFormationsSummary(combo: ComboEnrollment): string {
    if (!combo.formations || combo.formations.length === 0) return '';
    return combo.formations
      .slice(0, 3)
      .map((f) => f.nom)
      .join(' · ');
  }

  getExtraFormationsCount(combo: ComboEnrollment): number {
    return (combo.formations?.length || 0) > 3 ? combo.formations.length - 3 : 0;
  }

  close(): void {
    this.closed.emit();
  }
}
