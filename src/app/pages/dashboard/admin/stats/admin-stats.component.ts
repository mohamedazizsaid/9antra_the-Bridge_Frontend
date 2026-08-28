import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { UserService } from '../../../../core/services/user.service';
import { PaiementService } from '../../../../core/services/paiement.service';
import { FormationService } from '../../../../core/services/formation.service';
import { User } from '../../../../core/models/user.model';
import { Formation } from '../../../../core/models/formation.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface MonthMetric {
  year: number;
  month: number; // 0-11
  key: string; // 'YYYY-MM'
  label: string; // 'Août 2026'
  shortLabel: string; // 'Août'
  revenue: number;
  count: number;
  avgTicket: number;
}

interface YearComparisonRow {
  monthIndex: number;
  monthName: string;
  revenueYearA: number;
  revenueYearB: number;
  delta: number;
  percentChange: number;
}

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fadeIn pb-12">
      <!-- ═════════════════════════ HEADER ═════════════════════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div
            class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[var(--bridge-gold)]/30 flex items-center justify-center text-[var(--bridge-gold)] shadow-lg"
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
            <h1 class="font-syne font-bold text-2xl text-white">Statistiques & Analytique</h1>
            <p class="text-[var(--bridge-text-muted)] text-sm mt-0.5">
              Supervision financière, comparaison interannuelle et analyse globale
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <select
            [(ngModel)]="period"
            (change)="loadCharts()"
            aria-label="Sélectionner la période"
            class="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#C62761]"
          >
            <option value="6m">6 derniers mois</option>
            <option value="12m">12 derniers mois</option>
            <option value="30d">30 derniers jours</option>
          </select>
          <button
            (click)="load()"
            class="bridge-btn-secondary px-4 py-2 text-xs flex items-center gap-2 cursor-pointer"
          >
            <svg
              class="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      <!-- ═════════════════════════ 4 KPI CARDS ═════════════════════════ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- KPI 1 : Total Utilisateurs -->
        <div class="bridge-card p-5 relative overflow-hidden group">
          <div
            class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-400"
          ></div>
          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
              >
                Total Utilisateurs
              </p>
              <p class="text-2xl font-mono font-bold text-white mt-1.5">
                {{ getTotalUsersCount() }}
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <p class="text-[11px] text-blue-300 mt-3 flex items-center gap-1 font-semibold">
            <span>{{ getActiveUsersCount() }} actifs · {{ getStagiairesCount() }} stagiaires</span>
          </p>
        </div>

        <!-- KPI 2 : Chiffre d'Affaires Réalisé -->
        <div class="bridge-card p-5 relative overflow-hidden group">
          <div
            class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-400"
          ></div>
          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
              >
                Volume Financier
              </p>
              <p class="text-2xl font-mono font-bold text-emerald-400 mt-1.5">
                {{ totalRevenue | number: '1.2-2' }}
                <span class="text-xs font-sans text-white/50">TND</span>
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
          </div>
          <p class="text-[11px] text-emerald-400 mt-3 flex items-center gap-1 font-semibold">
            <span
              >✓ {{ totalPaidCount }} encaissement{{ totalPaidCount > 1 ? 's' : '' }} en base</span
            >
          </p>
        </div>

        <!-- KPI 3 : Formations & Inscriptions -->
        <div class="bridge-card p-5 relative overflow-hidden group">
          <div
            class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[var(--bridge-crimson)] to-[var(--bridge-gold)]"
          ></div>
          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
              >
                Formations & Parcours
              </p>
              <p class="text-2xl font-mono font-bold text-[var(--bridge-gold)] mt-1.5">
                {{ getFormationsCount() }}
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-2xl bg-[var(--bridge-crimson)]/10 border border-[var(--bridge-crimson)]/20 text-[var(--bridge-crimson)] flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="m4 6 8-4 8 4-8 4Z" />
                <path d="m18 10 4 2v6" />
                <path d="M6 10v7c0 3 3 5 6 5s6-2 6-5v-7" />
              </svg>
            </div>
          </div>
          <p
            class="text-[11px] text-[var(--bridge-gold)] mt-3 flex items-center gap-1 font-semibold"
          >
            <span>{{ getEnrollmentsCount() }} inscription(s) active(s)</span>
          </p>
        </div>

        <!-- KPI 4 : Certificats Polygon -->
        <div class="bridge-card p-5 relative overflow-hidden group">
          <div
            class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500"
          ></div>
          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
              >
                Certificats Blockchain
              </p>
              <p class="text-2xl font-mono font-bold text-purple-400 mt-1.5">
                {{ getCertificatesCount() }}
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
          </div>
          <p class="text-[11px] text-purple-300 mt-3 flex items-center gap-1 font-semibold">
            <span>⚡ Audit Polygon Proof-of-Skill</span>
          </p>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <!-- MODULE TRAÇABILITÉ & COMPARATEUR FINANCIER (MoM & YoY)                 -->
      <!-- ═══════════════════════════════════════════════════════════════════════ -->
      <div
        class="bridge-card p-6 md:p-8 space-y-6 border border-[var(--bridge-gold)]/20 relative overflow-hidden"
      >
        <div
          class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623]"
        ></div>

        <!-- Section Title & Tabs Switcher -->
        <div
          class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--bridge-border)]"
        >
          <div>
            <div class="flex items-center gap-2.5">
              <span
                class="px-2.5 py-1 rounded-md bg-[var(--bridge-gold)]/10 text-[var(--bridge-gold)] text-[10px] font-bold uppercase tracking-wider border border-[var(--bridge-gold)]/30"
              >
                AUDIT & TRAÇABILITÉ
              </span>
              <h2 class="font-syne font-bold text-xl text-white">Comparateur Financier Pro</h2>
            </div>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-1">
              Données directes de la base de données : analysez la dynamique mois par mois (MoM) et
              d'un exercice à l'autre (YoY).
            </p>
          </div>

          <!-- Mode Toggle -->
          <div class="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              (click)="comparisonMode = 'MoM'; onComparisonChange()"
              class="px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              [class]="
                comparisonMode === 'MoM'
                  ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold shadow'
                  : 'text-white/60 hover:text-white'
              "
            >
              <span>📅 Mois à Mois (MoM)</span>
            </button>
            <button
              (click)="comparisonMode = 'YoY'; onComparisonChange()"
              class="px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              [class]="
                comparisonMode === 'YoY'
                  ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold shadow'
                  : 'text-white/60 hover:text-white'
              "
            >
              <span>📊 Année à Année (YoY)</span>
            </button>
          </div>
        </div>

        <!-- ────────────── SOUS-SECTION 1: COMPARAISON MOIS À MOIS (MoM) ────────────── -->
        <div *ngIf="comparisonMode === 'MoM'" class="space-y-6 animate-fadeIn">
          <!-- Selectors: Mois A vs Mois B -->
          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5"
          >
            <div>
              <label
                class="block text-xs font-semibold text-[var(--bridge-gold)] uppercase tracking-wider mb-1.5"
              >
                Mois Actuel / Référence (A)
              </label>
              <select
                [(ngModel)]="selectedMonthA"
                (change)="onComparisonChange()"
                class="bridge-input w-full text-xs font-semibold text-white bg-[#10102A]"
              >
                <option *ngFor="let m of availableMonths" [value]="m.key">
                  {{ m.label }} ({{ m.revenue | number: '1.2-2' }} TND)
                </option>
              </select>
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5"
              >
                Mois de Comparaison (B)
              </label>
              <select
                [(ngModel)]="selectedMonthB"
                (change)="onComparisonChange()"
                class="bridge-input w-full text-xs font-semibold text-white bg-[#10102A]"
              >
                <option *ngFor="let m of availableMonths" [value]="m.key">
                  {{ m.label }} ({{ m.revenue | number: '1.2-2' }} TND)
                </option>
              </select>
            </div>
          </div>

          <!-- Comparison Delta KPIs -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- CA Diff -->
            <div class="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <span class="text-[10px] text-white/40 uppercase tracking-wider font-semibold block"
                >Chiffre d'Affaires (MoM)</span
              >
              <div class="flex items-baseline justify-between">
                <p class="text-xl font-mono font-bold text-white">
                  {{ momMetricA.revenue | number: '1.2-2' }}
                  <span class="text-xs text-white/40">TND</span>
                </p>
                <span
                  class="text-xs font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  [ngClass]="
                    momRevenueDelta >= 0
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  "
                >
                  {{ momRevenueDelta >= 0 ? '+' : '' }}{{ momRevenuePercent | number: '1.1-1' }}%
                </span>
              </div>
              <p class="text-[11px] text-white/50">
                Comparé à {{ momMetricB.revenue | number: '1.2-2' }} TND (Écart:
                <span [class]="momRevenueDelta >= 0 ? 'text-emerald-400' : 'text-red-400'"
                  >{{ momRevenueDelta >= 0 ? '+' : ''
                  }}{{ momRevenueDelta | number: '1.2-2' }} TND</span
                >)
              </p>
            </div>

            <!-- Transactions Diff -->
            <div class="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <span class="text-[10px] text-white/40 uppercase tracking-wider font-semibold block"
                >Volume d'Encaissements</span
              >
              <div class="flex items-baseline justify-between">
                <p class="text-xl font-mono font-bold text-white">
                  {{ momMetricA.count }} <span class="text-xs text-white/40">paiements</span>
                </p>
                <span
                  class="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                  [ngClass]="
                    momCountDelta >= 0
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  "
                >
                  {{ momCountDelta >= 0 ? '+' : '' }}{{ momCountDelta }}
                </span>
              </div>
              <p class="text-[11px] text-white/50">
                Contre {{ momMetricB.count }} transactions le mois comparé
              </p>
            </div>

            <!-- Ticket Moyen Diff -->
            <div class="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <span class="text-[10px] text-white/40 uppercase tracking-wider font-semibold block"
                >Panier Moyen / Transaction</span
              >
              <div class="flex items-baseline justify-between">
                <p class="text-xl font-mono font-bold text-white">
                  {{ momMetricA.avgTicket | number: '1.2-2' }}
                  <span class="text-xs text-white/40">TND</span>
                </p>
                <span
                  class="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                  [ngClass]="
                    momTicketDelta >= 0
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  "
                >
                  {{ momTicketDelta >= 0 ? '+' : '' }}{{ momTicketPercent | number: '1.1-1' }}%
                </span>
              </div>
              <p class="text-[11px] text-white/50">
                Ticket moyen précédent : {{ momMetricB.avgTicket | number: '1.2-2' }} TND
              </p>
            </div>
          </div>

          <!-- Comparative Chart: MoM Revenue Curve -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h3
                class="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2"
              >
                📈 Encaissements Quotidiens Réels (Jour 1 à 31)
              </h3>
              <div class="flex items-center gap-4 text-xs">
                <span class="flex items-center gap-1.5 text-[#C62761] font-semibold">
                  <span class="w-3 h-1 bg-[#C62761] rounded"></span> {{ momMetricA.label }}
                </span>
                <span class="flex items-center gap-1.5 text-[#F5A623] font-semibold">
                  <span class="w-3 h-1 bg-[#F5A623] rounded"></span> {{ momMetricB.label }}
                </span>
              </div>
            </div>
            <div class="h-60 relative w-full">
              <canvas #momChart></canvas>
            </div>
          </div>
        </div>

        <!-- ────────────── SOUS-SECTION 2: COMPARAISON ANNÉE À ANNÉE (YoY) ────────────── -->
        <div *ngIf="comparisonMode === 'YoY'" class="space-y-6 animate-fadeIn">
          <!-- Selectors: Année A vs Année B -->
          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5"
          >
            <div>
              <label
                class="block text-xs font-semibold text-[var(--bridge-gold)] uppercase tracking-wider mb-1.5"
              >
                Année Référence (A)
              </label>
              <select
                [(ngModel)]="selectedYearA"
                (change)="onComparisonChange()"
                class="bridge-input w-full text-xs font-semibold text-white bg-[#10102A]"
              >
                <option *ngFor="let y of availableYears" [value]="y">{{ y }}</option>
              </select>
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5"
              >
                Année de Comparaison (B)
              </label>
              <select
                [(ngModel)]="selectedYearB"
                (change)="onComparisonChange()"
                class="bridge-input w-full text-xs font-semibold text-white bg-[#10102A]"
              >
                <option *ngFor="let y of availableYears" [value]="y">{{ y }}</option>
              </select>
            </div>
          </div>

          <!-- YoY Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <span class="text-[10px] text-white/40 uppercase tracking-wider font-semibold block"
                >CA Annuel {{ selectedYearA }}</span
              >
              <p class="text-2xl font-mono font-bold text-emerald-400">
                {{ yoyTotalA | number: '1.2-2' }} <span class="text-xs text-white/40">TND</span>
              </p>
              <p class="text-[11px] text-white/50">
                Total collecté sur l'exercice {{ selectedYearA }}
              </p>
            </div>

            <div class="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <span class="text-[10px] text-white/40 uppercase tracking-wider font-semibold block"
                >CA Annuel {{ selectedYearB }}</span
              >
              <p class="text-2xl font-mono font-bold text-white/80">
                {{ yoyTotalB | number: '1.2-2' }} <span class="text-xs text-white/40">TND</span>
              </p>
              <p class="text-[11px] text-white/50">
                Total collecté sur l'exercice {{ selectedYearB }}
              </p>
            </div>

            <div class="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <span class="text-[10px] text-white/40 uppercase tracking-wider font-semibold block"
                >Croissance Annuelle (YoY)</span
              >
              <div class="flex items-baseline gap-2">
                <p
                  class="text-2xl font-mono font-bold"
                  [ngClass]="yoyDelta >= 0 ? 'text-emerald-400' : 'text-red-400'"
                >
                  {{ yoyDelta >= 0 ? '+' : '' }}{{ yoyPercent | number: '1.1-1' }}%
                </p>
                <span
                  class="text-xs font-mono"
                  [ngClass]="yoyDelta >= 0 ? 'text-emerald-400' : 'text-red-400'"
                >
                  ({{ yoyDelta >= 0 ? '+' : '' }}{{ yoyDelta | number: '1.0-0' }} TND)
                </span>
              </div>
              <p class="text-[11px] text-white/50">Progression globale d'un exercice à l'autre</p>
            </div>
          </div>

          <!-- YoY 12-Month Multi-Bar Chart -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h3
                class="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2"
              >
                📊 Chiffre d'Affaires Mensuel Réel Comparatif (Janvier à Décembre)
              </h3>
              <div class="flex items-center gap-4 text-xs">
                <span class="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span class="w-3 h-3 bg-emerald-500/80 rounded"></span> Exercice
                  {{ selectedYearA }}
                </span>
                <span class="flex items-center gap-1.5 text-[#F5A623] font-semibold">
                  <span class="w-3 h-3 bg-[#F5A623]/80 rounded"></span> Exercice {{ selectedYearB }}
                </span>
              </div>
            </div>
            <div class="h-64 relative w-full">
              <canvas #yoyChart></canvas>
            </div>
          </div>

          <!-- YoY Detailed Traceability Table -->
          <div class="overflow-x-auto rounded-xl border border-white/5">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  class="bg-white/[0.04] text-[var(--bridge-text-muted)] uppercase tracking-wider text-[10px] border-b border-white/5"
                >
                  <th class="py-3 px-4">Mois</th>
                  <th class="py-3 px-4 text-right">Exercice {{ selectedYearA }}</th>
                  <th class="py-3 px-4 text-right">Exercice {{ selectedYearB }}</th>
                  <th class="py-3 px-4 text-right">Écart (TND)</th>
                  <th class="py-3 px-4 text-right">Évolution (%)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr
                  *ngFor="let row of yoyTableRows"
                  class="hover:bg-white/[0.02] transition-colors"
                >
                  <td class="py-2.5 px-4 font-semibold text-white">{{ row.monthName }}</td>
                  <td class="py-2.5 px-4 text-right font-mono text-emerald-400 font-bold">
                    {{ row.revenueYearA | number: '1.2-2' }} TND
                  </td>
                  <td class="py-2.5 px-4 text-right font-mono text-white/70">
                    {{ row.revenueYearB | number: '1.2-2' }} TND
                  </td>
                  <td
                    class="py-2.5 px-4 text-right font-mono font-semibold"
                    [class]="row.delta >= 0 ? 'text-emerald-400' : 'text-red-400'"
                  >
                    {{ row.delta >= 0 ? '+' : '' }}{{ row.delta | number: '1.2-2' }} TND
                  </td>
                  <td class="py-2.5 px-4 text-right">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-block"
                      [ngClass]="
                        row.delta >= 0
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      "
                    >
                      {{ row.delta >= 0 ? '+' : '' }}{{ row.percentChange | number: '1.1-1' }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ═════════════════════════ CHARTS ROW 1 ═════════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Line Chart -->
        <div class="glass-card p-6 border border-[var(--bridge-border)] space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-syne font-bold text-white text-base flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#C62761]"></span>
              Évolution Globale des Revenus
            </h3>
            <span class="text-xs text-[var(--bridge-text-muted)] font-mono">TND</span>
          </div>
          <div class="h-64 relative">
            <canvas #revenueChart></canvas>
          </div>
        </div>

        <!-- User Role Breakdown Doughnut -->
        <div class="glass-card p-6 border border-[var(--bridge-border)] space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-syne font-bold text-white text-base flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#F5A623]"></span>
              Répartition des Utilisateurs
            </h3>
            <span class="text-xs text-[var(--bridge-text-muted)]">Rôles actifs</span>
          </div>
          <div class="h-64 relative flex items-center justify-center">
            <canvas #usersChart></canvas>
          </div>
        </div>
      </div>

      <!-- ═════════════════════════ CHARTS ROW 2 ═════════════════════════ -->
      <div class="glass-card p-6 border border-[var(--bridge-border)] space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-syne font-bold text-white text-base flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            Flux des Inscriptions & Nouveaux Utilisateurs
          </h3>
          <span class="text-xs text-[var(--bridge-text-muted)] font-mono">Volume mensuel</span>
        </div>
        <div class="h-64 relative">
          <canvas #inscriptionsChart></canvas>
        </div>
      </div>
    </div>
  `,
})
export class AdminStatsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('revenueChart') revenueCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('usersChart') usersCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('inscriptionsChart') inscriptionsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('momChart') momCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('yoyChart') yoyCanvas?: ElementRef<HTMLCanvasElement>;

  stats: any = null;
  baseStats: any = null;
  dashboardStats: any = null;
  allUsers: User[] = [];
  formations: Formation[] = [];
  payments: any[] = [];
  totalRevenue = 0;
  totalPaidCount = 0;
  period = '6m';

  // ── Comparison Module State ──
  comparisonMode: 'MoM' | 'YoY' = 'MoM';
  availableYears: number[] = [];
  availableMonths: MonthMetric[] = [];
  selectedMonthA = '';
  selectedMonthB = '';
  selectedYearA = new Date().getFullYear();
  selectedYearB = new Date().getFullYear() - 1;

  momMetricA: MonthMetric = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    key: '',
    label: '',
    shortLabel: '',
    revenue: 0,
    count: 0,
    avgTicket: 0,
  };
  momMetricB: MonthMetric = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() - 1,
    key: '',
    label: '',
    shortLabel: '',
    revenue: 0,
    count: 0,
    avgTicket: 0,
  };
  momRevenueDelta = 0;
  momRevenuePercent = 0;
  momCountDelta = 0;
  momTicketDelta = 0;
  momTicketPercent = 0;

  yoyTotalA = 0;
  yoyTotalB = 0;
  yoyDelta = 0;
  yoyPercent = 0;
  yoyTableRows: YearComparisonRow[] = [];

  private revenueChartInstance?: Chart;
  private usersChartInstance?: Chart;
  private inscriptionsChartInstance?: Chart;
  private momChartInstance?: Chart;
  private yoyChartInstance?: Chart;

  constructor(
    private adminService: AdminService,
    private userService: UserService,
    private paiementService: PaiementService,
    private formationService: FormationService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadCharts();
      this.renderComparisonChart();
    }, 250);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  load(): void {
    // 1. Extended stats from backend
    this.adminService.getExtendedStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loadCharts();
      },
      error: () => {},
    });

    // 2. User base stats
    this.userService.getAdminStats().subscribe({
      next: (data) => {
        this.baseStats = data;
        this.loadCharts();
      },
      error: () => {},
    });

    // 3. Formation dashboard stats
    this.formationService.getDashboardStats().subscribe({
      next: (ds) => {
        this.dashboardStats = ds;
        this.loadCharts();
      },
      error: () => {},
    });

    // 4. All Users from Database
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users || [];
        this.loadCharts();
      },
      error: () => {},
    });

    // 5. Formations from Database
    this.formationService.getFormations().subscribe({
      next: (fList: Formation[]) => {
        this.formations = fList || [];
        this.computeRevenue();
        this.loadCharts();
      },
      error: () => {},
    });

    // 6. ALL Real Payments from Database
    this.paiementService.getAllPayments().subscribe({
      next: (list) => {
        this.payments = list || [];
        this.computeRevenue();
        this.computeComparisonData();
        this.loadCharts();
        setTimeout(() => this.renderComparisonChart(), 200);
      },
      error: () => {
        this.computeRevenue();
        this.computeComparisonData();
      },
    });
  }

  private isPaymentPaid(p: any): boolean {
    const s = (p.status || '').toUpperCase();
    return s === 'COMPLETED' || s === 'PAID' || s === 'PAYE' || s === 'CONFIRMED';
  }

  private getPaymentDate(p: any): Date | null {
    const raw = p.paymentDate || p.datePaiement || p.createdAt;
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

  private computeRevenue(): void {
    let paidSum = 0;
    let paidCount = 0;

    this.payments.forEach((p) => {
      if (this.isPaymentPaid(p)) {
        paidSum += Number(p.amount || p.montant || 0);
        paidCount++;
      }
    });

    this.totalRevenue = paidSum;
    this.totalPaidCount = paidCount;
  }

  // ══════════════ Comparison MoM & YoY Calculations Directly From DB ══════════════
  computeComparisonData(): void {
    const monthNames = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];
    const shortNames = [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Août',
      'Sep',
      'Oct',
      'Nov',
      'Déc',
    ];

    // Discover real years present in database payments
    const discoveredYears = new Set<number>();
    discoveredYears.add(new Date().getFullYear());
    discoveredYears.add(new Date().getFullYear() - 1);

    this.payments.forEach((p) => {
      const d = this.getPaymentDate(p);
      if (d) discoveredYears.add(d.getFullYear());
    });

    this.availableYears = Array.from(discoveredYears).sort((a, b) => b - a);
    this.selectedYearA = this.availableYears[0];
    this.selectedYearB = this.availableYears[1] || this.availableYears[0] - 1;

    // Build available months from the last 12 calendar months based on DB
    const list: MonthMetric[] = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const key = `${y}-${(m + 1).toString().padStart(2, '0')}`;

      // Filter real DB payments for this month
      const monthPayments = this.payments.filter((p) => {
        if (!this.isPaymentPaid(p)) return false;
        const pDate = this.getPaymentDate(p);
        return pDate && pDate.getFullYear() === y && pDate.getMonth() === m;
      });

      const rev = monthPayments.reduce((acc, p) => acc + Number(p.amount || p.montant || 0), 0);
      const count = monthPayments.length;

      list.push({
        year: y,
        month: m,
        key,
        label: `${monthNames[m]} ${y}`,
        shortLabel: shortNames[m],
        revenue: rev,
        count,
        avgTicket: count > 0 ? rev / count : 0,
      });
    }

    this.availableMonths = list;
    if (list.length >= 2) {
      this.selectedMonthA = list[0].key;
      this.selectedMonthB = list[1].key;
    } else if (list.length === 1) {
      this.selectedMonthA = list[0].key;
      this.selectedMonthB = list[0].key;
    }

    this.onComparisonChange();
  }

  onComparisonChange(): void {
    // MoM Update
    const mA =
      this.availableMonths.find((m) => m.key === this.selectedMonthA) ||
      this.availableMonths[0] ||
      this.momMetricA;
    const mB =
      this.availableMonths.find((m) => m.key === this.selectedMonthB) ||
      this.availableMonths[1] ||
      this.momMetricB;

    this.momMetricA = mA;
    this.momMetricB = mB;

    this.momRevenueDelta = mA.revenue - mB.revenue;
    this.momRevenuePercent =
      mB.revenue > 0 ? (this.momRevenueDelta / mB.revenue) * 100 : mA.revenue > 0 ? 100 : 0;
    this.momCountDelta = mA.count - mB.count;
    this.momTicketDelta = mA.avgTicket - mB.avgTicket;
    this.momTicketPercent =
      mB.avgTicket > 0 ? (this.momTicketDelta / mB.avgTicket) * 100 : mA.avgTicket > 0 ? 100 : 0;

    // YoY Update with real database sums
    const monthNames = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];

    const rows: YearComparisonRow[] = [];
    let totA = 0;
    let totB = 0;

    for (let mi = 0; mi < 12; mi++) {
      // Calculate Year A monthly rev from DB
      const pA = this.payments.filter((p) => {
        if (!this.isPaymentPaid(p)) return false;
        const d = this.getPaymentDate(p);
        return d && d.getFullYear() === Number(this.selectedYearA) && d.getMonth() === mi;
      });
      const revA = pA.reduce((acc, p) => acc + Number(p.amount || p.montant || 0), 0);

      // Calculate Year B monthly rev from DB
      const pB = this.payments.filter((p) => {
        if (!this.isPaymentPaid(p)) return false;
        const d = this.getPaymentDate(p);
        return d && d.getFullYear() === Number(this.selectedYearB) && d.getMonth() === mi;
      });
      const revB = pB.reduce((acc, p) => acc + Number(p.amount || p.montant || 0), 0);

      totA += revA;
      totB += revB;
      const delta = revA - revB;
      const pct = revB > 0 ? (delta / revB) * 100 : revA > 0 ? 100 : 0;

      rows.push({
        monthIndex: mi,
        monthName: monthNames[mi],
        revenueYearA: revA,
        revenueYearB: revB,
        delta,
        percentChange: pct,
      });
    }

    this.yoyTableRows = rows;
    this.yoyTotalA = totA;
    this.yoyTotalB = totB;
    this.yoyDelta = totA - totB;
    this.yoyPercent = totB > 0 ? (this.yoyDelta / totB) * 100 : totA > 0 ? 100 : 0;

    setTimeout(() => this.renderComparisonChart(), 100);
  }

  private renderComparisonChart(): void {
    if (this.comparisonMode === 'MoM') {
      if (!this.momCanvas?.nativeElement) return;
      if (this.momChartInstance) this.momChartInstance.destroy();

      const ctx = this.momCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      const days = Array.from({ length: 31 }, (_, i) => `J${i + 1}`);

      // Calculate real daily amounts for Month A and Month B
      const dataA = days.map((_, i) => {
        const dayNum = i + 1;
        return this.payments
          .filter((p) => {
            if (!this.isPaymentPaid(p)) return false;
            const d = this.getPaymentDate(p);
            return (
              d &&
              d.getFullYear() === this.momMetricA.year &&
              d.getMonth() === this.momMetricA.month &&
              d.getDate() === dayNum
            );
          })
          .reduce((acc, p) => acc + Number(p.amount || p.montant || 0), 0);
      });

      const dataB = days.map((_, i) => {
        const dayNum = i + 1;
        return this.payments
          .filter((p) => {
            if (!this.isPaymentPaid(p)) return false;
            const d = this.getPaymentDate(p);
            return (
              d &&
              d.getFullYear() === this.momMetricB.year &&
              d.getMonth() === this.momMetricB.month &&
              d.getDate() === dayNum
            );
          })
          .reduce((acc, p) => acc + Number(p.amount || p.montant || 0), 0);
      });

      this.momChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: days,
          datasets: [
            {
              label: this.momMetricA.label,
              data: dataA,
              borderColor: '#C62761',
              backgroundColor: 'rgba(198, 39, 97, 0.15)',
              tension: 0.3,
              borderWidth: 2.5,
              pointRadius: 3,
              fill: true,
            },
            {
              label: this.momMetricB.label,
              data: dataB,
              borderColor: '#F5A623',
              backgroundColor: 'rgba(245, 166, 35, 0.05)',
              tension: 0.3,
              borderWidth: 2,
              borderDash: [4, 4],
              pointRadius: 2,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          resizeDelay: 100,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (c) => ` ${c.dataset.label}: ${c.parsed.y} TND`,
              },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#8E8C9A', font: { size: 9 } } },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#8E8C9A', font: { size: 9 } },
            },
          },
        },
      });
    } else {
      if (!this.yoyCanvas?.nativeElement) return;
      if (this.yoyChartInstance) this.yoyChartInstance.destroy();

      const ctx = this.yoyCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      const labels = [
        'Jan',
        'Fév',
        'Mar',
        'Avr',
        'Mai',
        'Juin',
        'Juil',
        'Août',
        'Sep',
        'Oct',
        'Nov',
        'Déc',
      ];
      const dataA = this.yoyTableRows.map((r) => r.revenueYearA);
      const dataB = this.yoyTableRows.map((r) => r.revenueYearB);

      this.yoyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: `Exercice ${this.selectedYearA}`,
              data: dataA,
              backgroundColor: 'rgba(16, 185, 129, 0.75)',
              borderColor: '#10B981',
              borderWidth: 1,
              borderRadius: 6,
            },
            {
              label: `Exercice ${this.selectedYearB}`,
              data: dataB,
              backgroundColor: 'rgba(245, 166, 35, 0.65)',
              borderColor: '#F5A623',
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          resizeDelay: 100,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (c) => ` ${c.dataset.label}: ${c.parsed.y} TND`,
              },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#8E8C9A', font: { size: 10 } } },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#8E8C9A', font: { size: 10 } },
            },
          },
        },
      });
    }
  }

  // ══════════════ Real Database Counts UI ══════════════
  getTotalUsersCount(): number {
    return this.allUsers.length || this.stats?.totalUsers || this.baseStats?.totalUsers || 0;
  }

  getActiveUsersCount(): number {
    return (
      this.allUsers.filter((u) => u.status === 'ACTIVE' || !u.status).length ||
      this.stats?.activeUsers ||
      0
    );
  }

  getStagiairesCount(): number {
    return (
      this.allUsers.filter((u) => u.role === 'STAGIAIRE').length ||
      this.stats?.stagiaires ||
      this.baseStats?.totalStagiaires ||
      0
    );
  }

  getFormateursCount(): number {
    return (
      this.allUsers.filter((u) => u.role === 'FORMATEUR').length ||
      this.stats?.formateurs ||
      this.baseStats?.totalFormateurs ||
      0
    );
  }

  getAdminsCount(): number {
    return this.allUsers.filter((u) => u.role === 'ADMIN').length || 0;
  }

  getFormationsCount(): number {
    return (
      this.formations.length ||
      this.dashboardStats?.totalFormations ||
      this.baseStats?.totalFormations ||
      0
    );
  }

  getEnrollmentsCount(): number {
    const fromFormations = this.formations.reduce((acc, f) => acc + (f.stagiaires?.length || 0), 0);
    return (
      fromFormations ||
      this.dashboardStats?.totalEnrollments ||
      this.baseStats?.totalEnrollments ||
      0
    );
  }

  getCertificatesCount(): number {
    return this.dashboardStats?.totalCertificates || this.baseStats?.totalCertificates || 0;
  }

  private destroyCharts(): void {
    if (this.revenueChartInstance) this.revenueChartInstance.destroy();
    if (this.usersChartInstance) this.usersChartInstance.destroy();
    if (this.inscriptionsChartInstance) this.inscriptionsChartInstance.destroy();
    if (this.momChartInstance) this.momChartInstance.destroy();
    if (this.yoyChartInstance) this.yoyChartInstance.destroy();
  }

  loadCharts(): void {
    this.destroyCharts();

    // 1. Revenue Chart (Line) from real DB payments
    if (this.revenueCanvas) {
      const ctx = this.revenueCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 220);
        gradient.addColorStop(0, 'rgba(198, 39, 97, 0.45)');
        gradient.addColorStop(1, 'rgba(198, 39, 97, 0.0)');

        let labels: string[] = [];
        let data: number[] = [];
        const now = new Date();

        if (this.period === '30d') {
          labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
          data = [0, 0, 0, 0];
          this.payments.forEach((p) => {
            if (!this.isPaymentPaid(p)) return;
            const d = this.getPaymentDate(p);
            if (!d) return;
            const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
            if (diffDays >= 0 && diffDays < 30) {
              const weekIdx = Math.min(3, Math.floor(diffDays / 7.5));
              data[3 - weekIdx] += Number(p.amount || p.montant || 0);
            }
          });
        } else if (this.period === '12m') {
          const shortMonthNames = [
            'Jan',
            'Fév',
            'Mar',
            'Avr',
            'Mai',
            'Juin',
            'Juil',
            'Août',
            'Sep',
            'Oct',
            'Nov',
            'Déc',
          ];
          labels = [];
          data = [];
          for (let i = 11; i >= 0; i--) {
            const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(shortMonthNames[targetDate.getMonth()]);
            const mSum = this.payments
              .filter((p) => {
                if (!this.isPaymentPaid(p)) return false;
                const d = this.getPaymentDate(p);
                return (
                  d &&
                  d.getFullYear() === targetDate.getFullYear() &&
                  d.getMonth() === targetDate.getMonth()
                );
              })
              .reduce((acc, p) => acc + Number(p.amount || p.montant || 0), 0);
            data.push(mSum);
          }
        } else {
          // 6m
          const shortMonthNames = [
            'Jan',
            'Fév',
            'Mar',
            'Avr',
            'Mai',
            'Juin',
            'Juil',
            'Août',
            'Sep',
            'Oct',
            'Nov',
            'Déc',
          ];
          labels = [];
          data = [];
          for (let i = 5; i >= 0; i--) {
            const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(shortMonthNames[targetDate.getMonth()]);
            const mSum = this.payments
              .filter((p) => {
                if (!this.isPaymentPaid(p)) return false;
                const d = this.getPaymentDate(p);
                return (
                  d &&
                  d.getFullYear() === targetDate.getFullYear() &&
                  d.getMonth() === targetDate.getMonth()
                );
              })
              .reduce((acc, p) => acc + Number(p.amount || p.montant || 0), 0);
            data.push(mSum);
          }
        }

        this.revenueChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: "Chiffre d'affaires (TND)",
                data,
                borderColor: '#C62761',
                backgroundColor: gradient,
                fill: true,
                tension: 0.35,
                borderWidth: 3,
                pointBackgroundColor: '#F5A623',
                pointRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            resizeDelay: 100,
            plugins: {
              legend: { display: false },
              tooltip: { backgroundColor: '#10102A', titleColor: '#fff', bodyColor: '#F5A623' },
            },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8E8C9A' } },
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8E8C9A' } },
            },
          },
        });
      }
    }

    // 2. Users Doughnut Chart (Real Database Counts)
    if (this.usersCanvas) {
      const ctx = this.usersCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const stagiaires = this.getStagiairesCount();
        const formateurs = this.getFormateursCount();
        const admins = this.getAdminsCount();

        this.usersChartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Stagiaires', 'Formateurs', 'Administrateurs'],
            datasets: [
              {
                data: [stagiaires, formateurs, admins],
                backgroundColor: ['#3B82F6', '#F5A623', '#C62761'],
                borderWidth: 0,
                hoverOffset: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            resizeDelay: 100,
            plugins: {
              legend: { position: 'bottom', labels: { color: '#ffffff', font: { size: 11 } } },
            },
            cutout: '70%',
          },
        });
      }
    }

    // 3. Inscriptions Bar Chart from real user registration dates
    if (this.inscriptionsCanvas) {
      const ctx = this.inscriptionsCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const shortMonthNames = [
          'Jan',
          'Fév',
          'Mar',
          'Avr',
          'Mai',
          'Juin',
          'Juil',
          'Août',
          'Sep',
          'Oct',
          'Nov',
          'Déc',
        ];
        const months: string[] = [];
        const monthlyData: number[] = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
          const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push(shortMonthNames[targetDate.getMonth()]);

          const count = this.allUsers.filter((u) => {
            const raw = u.dateInscription;
            if (!raw) return false;
            const d = new Date(raw);
            return (
              !isNaN(d.getTime()) &&
              d.getFullYear() === targetDate.getFullYear() &&
              d.getMonth() === targetDate.getMonth()
            );
          }).length;

          monthlyData.push(count);
        }

        this.inscriptionsChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: months,
            datasets: [
              {
                label: 'Nouvelles Inscriptions',
                data: monthlyData,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: '#10B981',
                borderWidth: 1,
                borderRadius: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            resizeDelay: 100,
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#8E8C9A' } },
              y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#8E8C9A', stepSize: 1 },
              },
            },
          },
        });
      }
    }
  }
}
