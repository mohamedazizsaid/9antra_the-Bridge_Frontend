import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PaiementService,
  RegisterPaymentRequest,
} from '../../../../core/services/paiement.service';
import { FormationService } from '../../../../core/services/formation.service';
import { UserService } from '../../../../core/services/user.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Formation } from '../../../../core/models/formation.model';

interface ChartPoint {
  label: string;
  amount: number;
  count: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-admin-paiements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="overflow-hidden relative w-full">
      <div
        class="flex transition-transform duration-500 ease-in-out w-full"
        [style.transform]="selectedPayment ? 'translateX(-100%)' : 'translateX(0%)'"
      >
        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- PANEL 1: LIST, CHARTS, STATS & FILTERS                     -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div class="w-full flex-shrink-0 min-w-full space-y-6">
          <!-- ─── Header & Actions ─── -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[var(--bridge-gold)]/30 flex items-center justify-center text-[var(--bridge-gold)]"
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
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                </div>
                <div>
                  <h1 class="font-syne font-bold text-2xl text-white">Supervision des Paiements</h1>
                  <p class="text-[var(--bridge-text-muted)] text-sm mt-0.5">
                    Suivi financier en temps réel, encaissements et audit des transactions
                  </p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 flex-wrap">
              <button
                (click)="showNewPaymentModal = true"
                class="bridge-btn-primary px-4 py-2.5 text-xs flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Enregistrer un paiement</span>
              </button>
              <button
                (click)="exportCSV()"
                class="bridge-btn-secondary px-3.5 py-2.5 text-xs flex items-center gap-2 cursor-pointer"
                title="Exporter les transactions"
              >
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span class="hidden sm:inline">Exporter CSV</span>
              </button>
              <button
                (click)="loadData()"
                class="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Rafraîchir"
              >
                <svg
                  class="w-4 h-4"
                  [class.animate-spin]="loading"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </button>
            </div>
          </div>

          <!-- ─── Financial KPI Cards ─── -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- KPI 1: Chiffre d'affaires collecté -->
            <div class="bridge-card p-5 relative overflow-hidden group">
              <div
                class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-400"
              ></div>
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    Chiffre d'Affaires
                  </p>
                  <p class="text-2xl font-mono font-bold text-white mt-1.5">
                    {{ totalRevenue | number: '1.2-2' }}
                    <span class="text-xs font-sans text-emerald-400">TND</span>
                  </p>
                </div>
                <div
                  class="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
              </div>
              <div class="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400">
                <svg
                  class="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                <span>{{ completedPaymentsCount }} paiements validés</span>
              </div>
            </div>

            <!-- KPI 2: Paiements en Attente -->
            <div class="bridge-card p-5 relative overflow-hidden group">
              <div
                class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-400"
              ></div>
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    En Attente
                  </p>
                  <p class="text-2xl font-mono font-bold text-white mt-1.5">
                    {{ pendingAmount | number: '1.2-2' }}
                    <span class="text-xs font-sans text-amber-400">TND</span>
                  </p>
                </div>
                <div
                  class="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </div>
              <div class="mt-3 flex items-center gap-1.5 text-[11px] text-amber-400">
                <span>{{ pendingPaymentsCount }} échéances en attente</span>
              </div>
            </div>

            <!-- KPI 3: Ticket Moyen -->
            <div class="bridge-card p-5 relative overflow-hidden group">
              <div
                class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#C62761] to-[#E0452F]"
              ></div>
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    Montant Moyen
                  </p>
                  <p class="text-2xl font-mono font-bold text-white mt-1.5">
                    {{ averageAmount | number: '1.2-2' }}
                    <span class="text-xs font-sans text-[var(--bridge-crimson)]">TND</span>
                  </p>
                </div>
                <div
                  class="w-11 h-11 rounded-2xl bg-[rgba(198,39,97,0.1)] border border-[rgba(198,39,97,0.2)] text-[var(--bridge-crimson)] flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                  </svg>
                </div>
              </div>
              <div
                class="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--bridge-text-muted)]"
              >
                <span>Sur l'ensemble des encaissements</span>
              </div>
            </div>

            <!-- KPI 4: Total Transactions -->
            <div class="bridge-card p-5 relative overflow-hidden group">
              <div
                class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-400"
              ></div>
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    Total Transactions
                  </p>
                  <p class="text-2xl font-mono font-bold text-white mt-1.5">
                    {{ payments.length }}
                  </p>
                </div>
                <div
                  class="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
              </div>
              <div class="mt-3 flex items-center gap-1.5 text-[11px] text-purple-400">
                <span>Taux de succès: {{ successRate }}%</span>
              </div>
            </div>
          </div>

          <!-- ─── Dynamic Revenue Trend Curve & Method Breakdown ─── -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Left: Revenue Trend Chart (7 cols) -->
            <div class="lg:col-span-7 bridge-card p-5 flex flex-col justify-between">
              <div
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--bridge-border)] mb-4"
              >
                <div>
                  <h3 class="font-syne font-bold text-base text-white flex items-center gap-2">
                    <svg
                      class="w-4 h-4 text-[var(--bridge-gold)]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    Évolution des Encaissements
                  </h3>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                    Volume de trésorerie collecté par période
                  </p>
                </div>

                <!-- Timeframe selector -->
                <div
                  class="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs"
                >
                  <button
                    (click)="chartTimeframe = 'month'"
                    class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    [class]="
                      chartTimeframe === 'month'
                        ? 'bg-[var(--bridge-crimson)] text-white font-bold'
                        : 'text-white/60 hover:text-white'
                    "
                  >
                    Mois
                  </button>
                  <button
                    (click)="chartTimeframe = 'year'"
                    class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    [class]="
                      chartTimeframe === 'year'
                        ? 'bg-[var(--bridge-crimson)] text-white font-bold'
                        : 'text-white/60 hover:text-white'
                    "
                  >
                    Année
                  </button>
                  <button
                    (click)="chartTimeframe = 'all'"
                    class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    [class]="
                      chartTimeframe === 'all'
                        ? 'bg-[var(--bridge-crimson)] text-white font-bold'
                        : 'text-white/60 hover:text-white'
                    "
                  >
                    Tout
                  </button>
                </div>
              </div>

              <!-- Dynamic SVG Trend Curve -->
              <div class="relative w-full h-56 my-2">
                <svg
                  class="w-full h-full overflow-visible"
                  viewBox="0 0 500 200"
                  preserveAspectRatio="none"
                >
                  <!-- Defs for Gradient -->
                  <defs>
                    <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#C62761" stop-opacity="0.45" />
                      <stop offset="100%" stop-color="#F5A623" stop-opacity="0.0" />
                    </linearGradient>
                    <linearGradient id="strokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#C62761" />
                      <stop offset="50%" stop-color="#E0452F" />
                      <stop offset="100%" stop-color="#F5A623" />
                    </linearGradient>
                  </defs>

                  <!-- Grid Horizontal Lines -->
                  <line
                    x1="0"
                    y1="40"
                    x2="500"
                    y2="40"
                    stroke="rgba(255,255,255,0.05)"
                    stroke-dasharray="4,4"
                  />
                  <line
                    x1="0"
                    y1="90"
                    x2="500"
                    y2="90"
                    stroke="rgba(255,255,255,0.05)"
                    stroke-dasharray="4,4"
                  />
                  <line
                    x1="0"
                    y1="140"
                    x2="500"
                    y2="140"
                    stroke="rgba(255,255,255,0.05)"
                    stroke-dasharray="4,4"
                  />
                  <line x1="0" y1="190" x2="500" y2="190" stroke="rgba(255,255,255,0.1)" />

                  <!-- Area Fill -->
                  <polygon
                    *ngIf="chartPoints.length > 1"
                    [attr.points]="chartAreaPoints"
                    fill="url(#revenueGrad)"
                  />

                  <!-- Smooth Stroke Curve -->
                  <polyline
                    *ngIf="chartPoints.length > 1"
                    [attr.points]="chartPolylinePoints"
                    fill="none"
                    stroke="url(#strokeGrad)"
                    stroke-width="3.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <!-- Interactive Points -->
                  <g *ngFor="let pt of chartPoints; let idx = index">
                    <circle
                      [attr.cx]="pt.x"
                      [attr.cy]="pt.y"
                      r="5"
                      class="fill-[#10102A] stroke-[var(--bridge-gold)] stroke-2 hover:r-7 transition-all cursor-pointer"
                      (mouseenter)="hoveredPoint = pt"
                      (mouseleave)="hoveredPoint = null"
                    />
                  </g>
                </svg>

                <!-- Tooltip Overlay -->
                <div
                  *ngIf="hoveredPoint"
                  class="absolute z-20 px-3 py-2 rounded-xl bg-[#10102A] border border-[var(--bridge-gold)]/40 shadow-2xl pointer-events-none text-xs"
                  [style.left.px]="(hoveredPoint.x / 500) * 350"
                  [style.top.px]="Math.max(10, hoveredPoint.y - 45)"
                >
                  <p class="font-bold text-white">{{ hoveredPoint.label }}</p>
                  <p class="text-emerald-400 font-mono font-bold">
                    {{ hoveredPoint.amount | number: '1.2-2' }} TND
                  </p>
                  <p class="text-[10px] text-white/50">{{ hoveredPoint.count }} transaction(s)</p>
                </div>
              </div>

              <!-- Bottom Chart Labels -->
              <div
                class="flex items-center justify-between text-[11px] text-[var(--bridge-text-muted)] pt-2 border-t border-white/5"
              >
                <span *ngFor="let pt of chartPoints">{{ pt.label }}</span>
              </div>
            </div>

            <!-- Right: Payment Methods Breakdown (5 cols) -->
            <div class="lg:col-span-5 bridge-card p-5 flex flex-col justify-between space-y-4">
              <div class="pb-3 border-b border-[var(--bridge-border)]">
                <h3 class="font-syne font-bold text-base text-white flex items-center gap-2">
                  <svg
                    class="w-4 h-4 text-[var(--bridge-crimson)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                    />
                  </svg>
                  Canaux de Paiement
                </h3>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                  Répartition par méthode de règlement
                </p>
              </div>

              <!-- Method Progress Bars -->
              <div class="space-y-4 flex-1 justify-center flex flex-col">
                <!-- CARTE / STRIPE -->
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-semibold text-white flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-blue-400"></span>
                      Carte Bancaire (Stripe)
                    </span>
                    <span class="font-mono font-bold text-white">
                      {{ methodStats['CARTE']?.amount || 0 | number: '1.2-2' }} TND
                      <span class="text-[10px] text-white/40"
                        >({{ methodStats['CARTE']?.percentage || 0 }}%)</span
                      >
                    </span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                      [style.width]="(methodStats['CARTE']?.percentage || 0) + '%'"
                    ></div>
                  </div>
                </div>

                <!-- VIREMENT -->
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-semibold text-white flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-purple-400"></span>
                      Virement Bancaire
                    </span>
                    <span class="font-mono font-bold text-white">
                      {{ methodStats['VIREMENT']?.amount || 0 | number: '1.2-2' }} TND
                      <span class="text-[10px] text-white/40"
                        >({{ methodStats['VIREMENT']?.percentage || 0 }}%)</span
                      >
                    </span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                      [style.width]="(methodStats['VIREMENT']?.percentage || 0) + '%'"
                    ></div>
                  </div>
                </div>

                <!-- ESPECES -->
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-semibold text-white flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Espèces
                    </span>
                    <span class="font-mono font-bold text-white">
                      {{ methodStats['ESPECES']?.amount || 0 | number: '1.2-2' }} TND
                      <span class="text-[10px] text-white/40"
                        >({{ methodStats['ESPECES']?.percentage || 0 }}%)</span
                      >
                    </span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      [style.width]="(methodStats['ESPECES']?.percentage || 0) + '%'"
                    ></div>
                  </div>
                </div>

                <!-- CHEQUE -->
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-semibold text-white flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                      Chèque
                    </span>
                    <span class="font-mono font-bold text-white">
                      {{ methodStats['CHEQUE']?.amount || 0 | number: '1.2-2' }} TND
                      <span class="text-[10px] text-white/40"
                        >({{ methodStats['CHEQUE']?.percentage || 0 }}%)</span
                      >
                    </span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                      [style.width]="(methodStats['CHEQUE']?.percentage || 0) + '%'"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ─── Advanced Filter & Search Bar ─── -->
          <div class="bridge-card p-4 flex flex-wrap gap-3 items-center">
            <!-- Search -->
            <div class="flex-1 min-w-[240px] relative">
              <svg
                class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="applyFilters()"
                placeholder="Rechercher par stagiaire, formation, réf..."
                class="bridge-input pl-10 text-xs w-full"
              />
            </div>

            <!-- Filter: Status -->
            <select
              [(ngModel)]="filterStatus"
              (ngModelChange)="applyFilters()"
              class="bridge-input text-xs"
            >
              <option value="">Tous les statuts</option>
              <option value="COMPLETED">✅ Payé (COMPLETED)</option>
              <option value="PENDING">⏳ En attente (PENDING)</option>
              <option value="FAILED">❌ Échoué (FAILED)</option>
            </select>

            <!-- Filter: Payment Method -->
            <select
              [(ngModel)]="filterMethod"
              (ngModelChange)="applyFilters()"
              class="bridge-input text-xs"
            >
              <option value="">Toutes les méthodes</option>
              <option value="CARTE">💳 Carte Bancaire (Stripe)</option>
              <option value="VIREMENT">🏦 Virement Bancaire</option>
              <option value="ESPECES">💵 Espèces</option>
              <option value="CHEQUE">📝 Chèque</option>
            </select>

            <!-- Filter: Formation -->
            <select
              [(ngModel)]="filterFormation"
              (ngModelChange)="applyFilters()"
              class="bridge-input text-xs max-w-xs"
            >
              <option value="">Toutes les formations</option>
              <option *ngFor="let form of formations" [value]="form.id">
                {{ form.nom }}
              </option>
            </select>
          </div>

          <!-- ─── Transactions Table ─── -->
          <div class="bridge-card overflow-hidden">
            <div
              class="px-5 py-4 border-b border-[var(--bridge-border)] flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <svg
                  class="w-4 h-4 text-[var(--bridge-gold)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <h3 class="font-semibold text-white text-sm">
                  Historique des Transactions ({{ filteredPayments.length }})
                </h3>
              </div>
            </div>

            <!-- Expandable scrollable table container -->
            <div [class]="expanded ? '' : 'max-h-[380px] overflow-y-auto'">
              <table class="w-full text-left text-xs">
                <thead
                  class="bg-[#10102A] sticky top-0 z-10 border-b border-[var(--bridge-border)]"
                >
                  <tr
                    class="text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                  >
                    <th class="py-3.5 px-4">Transaction</th>
                    <th class="py-3.5 px-4">Stagiaire</th>
                    <th class="py-3.5 px-4">Formation & Phase</th>
                    <th class="py-3.5 px-4">Montant</th>
                    <th class="py-3.5 px-4">Méthode</th>
                    <th class="py-3.5 px-4">Statut</th>
                    <th class="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr
                    *ngFor="let p of filteredPayments"
                    class="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    (click)="openDetail(p)"
                  >
                    <!-- Transaction Ref & Date -->
                    <td class="py-3.5 px-4">
                      <p
                        class="font-mono font-bold text-white group-hover:text-[var(--bridge-gold)] transition-colors"
                      >
                        #{{ p.id }}
                      </p>
                      <p class="text-[10px] text-[var(--bridge-text-muted)] mt-0.5">
                        {{
                          p.paymentDate
                            ? (p.paymentDate | date: 'dd/MM/yyyy HH:mm')
                            : (p.datePaiement | date: 'dd/MM/yyyy')
                        }}
                      </p>
                    </td>

                    <!-- Stagiaire Info (NO DUPLICATE AVATAR) -->
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-2.5">
                        <div
                          class="w-7 h-7 rounded-full bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center font-bold text-[10px] text-white flex-shrink-0 overflow-hidden"
                        >
                          <img
                            *ngIf="p.studentAvatar"
                            [src]="p.studentAvatar"
                            class="w-full h-full object-cover"
                            alt=""
                            onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='inline'"
                          />
                          <span *ngIf="!p.studentAvatar">{{
                            (p.studentFirstName?.[0] || 'S') + (p.studentLastName?.[0] || '')
                          }}</span>
                        </div>
                        <div>
                          <p class="font-semibold text-white">
                            {{ p.studentFirstName || 'Stagiaire' }}
                            {{ p.studentLastName || '#' + p.studentId }}
                          </p>
                          <p
                            class="text-[10px] text-[var(--bridge-text-muted)] truncate max-w-[150px]"
                          >
                            {{ p.studentEmail || '—' }}
                          </p>
                        </div>
                      </div>
                    </td>

                    <!-- Formation & Phase -->
                    <td class="py-3.5 px-4">
                      <p class="font-semibold text-white truncate max-w-[200px]">
                        {{ p.formationTitle || getFormationName(p.formationId) || 'Formation' }}
                      </p>
                      <p class="text-[10px] text-[var(--bridge-text-muted)] mt-0.5">
                        Phase {{ p.phaseOrder || p.phaseNumero || 1 }} :
                        {{ p.phaseTitle || "Phase d'apprentissage" }}
                      </p>
                    </td>

                    <!-- Montant -->
                    <td class="py-3.5 px-4">
                      <p class="font-mono font-bold text-sm text-emerald-400">
                        {{ p.amount || p.montant | number: '1.2-2' }}
                        <span class="text-[10px] text-white/50">TND</span>
                      </p>
                    </td>

                    <!-- Méthode -->
                    <td class="py-3.5 px-4">
                      <span
                        class="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-white/80"
                      >
                        {{ formatMethod(p.paymentMethod || p.methode) }}
                      </span>
                    </td>

                    <!-- Statut -->
                    <td class="py-3.5 px-4">
                      <span
                        [class]="getStatusBadgeClass(p.status)"
                        class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                      >
                        <span
                          class="w-1.5 h-1.5 rounded-full"
                          [class]="getStatusDotClass(p.status)"
                        ></span>
                        {{ formatStatus(p.status) }}
                      </span>
                    </td>

                    <!-- Actions -->
                    <td class="py-3.5 px-4 text-right">
                      <button
                        (click)="openDetail(p); $event.stopPropagation()"
                        class="px-2.5 py-1 rounded-lg text-[var(--bridge-crimson)] hover:text-white hover:bg-white/5 font-semibold text-xs transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Détails</span>
                        <svg
                          class="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2.5"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </td>
                  </tr>

                  <tr *ngIf="filteredPayments.length === 0">
                    <td colspan="7" class="text-center py-14 text-[var(--bridge-text-muted)]">
                      <p class="text-sm">Aucune transaction trouvée</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Table Footer with Voir Plus / Réduire -->
            <div
              class="px-4 py-3 border-t border-[var(--bridge-border)] flex items-center justify-between"
            >
              <span class="text-xs text-[var(--bridge-text-muted)]">
                {{ filteredPayments.length }} / {{ payments.length }} transactions
              </span>
              <button
                (click)="expanded = !expanded"
                class="text-xs text-[var(--bridge-crimson)] hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-white/5 cursor-pointer font-semibold"
              >
                {{ expanded ? '▲ Réduire' : '▼ Tout afficher' }}
              </button>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- PANEL 2: TRANSACTION DETAILS SLIDE VIEW                    -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div class="w-full flex-shrink-0 min-w-full space-y-6">
          <!-- Return Header Button -->
          <div class="flex items-center justify-between">
            <button
              (click)="selectedPayment = null"
              class="bridge-btn-secondary px-4 py-2 text-xs flex items-center gap-2 cursor-pointer group"
            >
              <svg
                class="w-4 h-4 transition-transform group-hover:-translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Retour à la supervision des paiements</span>
            </button>

            <div class="flex items-center gap-3">
              <button
                (click)="printReceipt()"
                class="bridge-btn-primary px-4 py-2 text-xs flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path
                    d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
                  />
                  <rect width="12" height="8" x="6" y="14" />
                </svg>
                <span>Imprimer le Reçu</span>
              </button>
            </div>
          </div>

          <!-- Details Card -->
          <div
            *ngIf="selectedPayment"
            class="bridge-card p-6 md:p-8 relative overflow-hidden animate-fadeIn"
          >
            <!-- Accent Top Line -->
            <div
              class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623]"
            ></div>

            <!-- Receipt Header -->
            <div
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[var(--bridge-border)]"
            >
              <div class="flex items-center gap-5">
                <div
                  class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C62761]/20 via-[#131336] to-[#F5A623]/20 border-2 border-[var(--bridge-gold)]/30 flex items-center justify-center text-[var(--bridge-gold)] flex-shrink-0 shadow-xl"
                >
                  <svg
                    class="w-8 h-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                </div>
                <div>
                  <span
                    class="text-[10px] font-bold uppercase tracking-widest text-[var(--bridge-gold)]"
                    >Reçu & Certificat de Règlement</span
                  >
                  <h2 class="font-syne font-bold text-2xl text-white mt-0.5">
                    Transaction #{{ selectedPayment.id }}
                  </h2>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-1">
                    Enregistrée le
                    {{
                      selectedPayment.paymentDate
                        ? (selectedPayment.paymentDate | date: 'dd MMMM yyyy à HH:mm')
                        : (selectedPayment.datePaiement | date: 'dd MMMM yyyy')
                    }}
                  </p>
                </div>
              </div>

              <!-- Amount Highlight Pill -->
              <div class="sm:text-right">
                <p
                  class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                >
                  Montant Réglé
                </p>
                <p class="text-3xl font-mono font-extrabold text-white mt-0.5">
                  {{ selectedPayment.amount || selectedPayment.montant | number: '1.2-2' }}
                  <span class="text-base font-sans text-emerald-400 font-bold">TND</span>
                </p>
                <div class="mt-2">
                  <span
                    [class]="getStatusBadgeClass(selectedPayment.status)"
                    class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                  >
                    <span
                      class="w-2 h-2 rounded-full"
                      [class]="getStatusDotClass(selectedPayment.status)"
                    ></span>
                    {{ formatStatus(selectedPayment.status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Stagiaire & Formation 2-Column Overview -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <!-- Stagiaire Box -->
              <div class="bg-white/[0.02] p-5 rounded-2xl border border-white/5 space-y-3">
                <p
                  class="text-xs font-bold uppercase tracking-wider text-[var(--bridge-gold)] flex items-center gap-2"
                >
                  <svg
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Informations du Stagiaire
                </p>
                <div class="flex items-center gap-3.5 pt-1">
                  <div
                    class="w-12 h-12 rounded-xl overflow-hidden border border-white/10 flex-shrink-0"
                  >
                    <img
                      [src]="
                        selectedPayment.studentAvatar ||
                        'https://api.dicebear.com/7.x/initials/svg?seed=' +
                          (selectedPayment.studentFirstName || 'S') +
                          '&backgroundColor=c62761'
                      "
                      class="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-white">
                      {{ selectedPayment.studentFirstName }} {{ selectedPayment.studentLastName }}
                    </p>
                    <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                      {{ selectedPayment.studentEmail || '—' }}
                    </p>
                    <p class="text-[10px] text-white/40 mt-1 font-mono">
                      ID Stagiaire: #{{ selectedPayment.studentId }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Formation & Phase Box -->
              <div class="bg-white/[0.02] p-5 rounded-2xl border border-white/5 space-y-3">
                <p
                  class="text-xs font-bold uppercase tracking-wider text-[var(--bridge-crimson)] flex items-center gap-2"
                >
                  <svg
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  Formation & Phase
                </p>
                <div class="pt-1">
                  <p class="text-sm font-bold text-white">
                    {{
                      selectedPayment.formationTitle ||
                        getFormationName(selectedPayment.formationId)
                    }}
                  </p>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-1 flex items-center gap-2">
                    <span
                      class="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-semibold text-white"
                    >
                      Phase {{ selectedPayment.phaseOrder || selectedPayment.phaseNumero || 1 }}
                    </span>
                    <span>{{ selectedPayment.phaseTitle || "Phase d'apprentissage" }}</span>
                  </p>
                  <p class="text-[10px] text-white/40 mt-2 font-mono">
                    ID Inscription: #{{ selectedPayment.enrollmentId || '—' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Transaction Metadata Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
              <div class="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <p
                  class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                >
                  Méthode
                </p>
                <p class="text-xs font-bold text-white mt-1">
                  {{ formatMethod(selectedPayment.paymentMethod || selectedPayment.methode) }}
                </p>
              </div>
              <div class="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <p
                  class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                >
                  Référence
                </p>
                <p class="text-xs font-mono font-bold text-[var(--bridge-gold)] mt-1 truncate">
                  {{ selectedPayment.transactionReference || 'REF-' + selectedPayment.id }}
                </p>
              </div>
              <div class="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <p
                  class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                >
                  Date d'échéance
                </p>
                <p class="text-xs font-bold text-white mt-1">
                  {{
                    selectedPayment.dueDate ? (selectedPayment.dueDate | date: 'dd/MM/yyyy') : '—'
                  }}
                </p>
              </div>
              <div class="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <p
                  class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                >
                  Audit Statut
                </p>
                <p class="text-xs font-bold text-emerald-400 mt-1">Validé en Base</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Modal: Enregistrer un Paiement Manuel ─── -->
      <div
        *ngIf="showNewPaymentModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      >
        <div
          class="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
          (click)="showNewPaymentModal = false"
        ></div>
        <div
          class="relative w-full max-w-md bridge-card p-6 bg-[#10102A] border border-white/10 shadow-2xl space-y-5 z-10"
        >
          <div
            class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623]"
          ></div>

          <div class="flex items-center justify-between">
            <h3 class="font-syne font-bold text-lg text-white">Enregistrer un Règlement</h3>
            <button
              (click)="showNewPaymentModal = false"
              class="text-white/50 hover:text-white text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div class="space-y-3.5 text-xs">
            <div>
              <label class="block text-[var(--bridge-text-muted)] mb-1 font-semibold"
                >Formation</label
              >
              <select
                [(ngModel)]="newPayment.formationId"
                (ngModelChange)="onFormationChange()"
                class="bridge-input w-full text-xs"
              >
                <option [ngValue]="null">Sélectionner une formation...</option>
                <option *ngFor="let f of formations" [value]="f.id">{{ f.nom }}</option>
              </select>
            </div>

            <div>
              <label class="block text-[var(--bridge-text-muted)] mb-1 font-semibold"
                >Stagiaire</label
              >
              <select [(ngModel)]="newPayment.studentId" class="bridge-input w-full text-xs">
                <option [ngValue]="null">Sélectionner un stagiaire...</option>
                <option *ngFor="let s of stagiaires" [value]="s.id">
                  {{ s.prenom }} {{ s.nom }} ({{ s.email }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-[var(--bridge-text-muted)] mb-1 font-semibold"
                >Montant (TND)</label
              >
              <input
                type="number"
                [(ngModel)]="newPayment.amount"
                placeholder="Ex: 350"
                class="bridge-input w-full text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label class="block text-[var(--bridge-text-muted)] mb-1 font-semibold"
                >Méthode de Paiement</label
              >
              <select [(ngModel)]="newPayment.paymentMethod" class="bridge-input w-full text-xs">
                <option value="ESPECES">💵 Espèces</option>
                <option value="VIREMENT">🏦 Virement Bancaire</option>
                <option value="CHEQUE">📝 Chèque</option>
                <option value="CARTE">💳 Carte Bancaire (Stripe)</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              (click)="showNewPaymentModal = false"
              class="bridge-btn-secondary px-4 py-2 text-xs cursor-pointer"
            >
              Annuler
            </button>
            <button
              (click)="submitPayment()"
              [disabled]="savingPayment || !newPayment.amount || !newPayment.studentId"
              class="bridge-btn-primary px-5 py-2 text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg
                *ngIf="savingPayment"
                class="animate-spin w-3.5 h-3.5 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{{ savingPayment ? 'Enregistrement...' : 'Confirmer le règlement' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminPaiementsComponent implements OnInit {
  Math = Math;
  loading = false;
  savingPayment = false;
  expanded = false;
  payments: any[] = [];
  filteredPayments: any[] = [];
  formations: Formation[] = [];
  stagiaires: any[] = [];

  // Filter state
  searchQuery = '';
  filterStatus = '';
  filterMethod = '';
  filterFormation = '';

  // Chart state
  chartTimeframe: 'month' | 'year' | 'all' = 'month';
  chartPoints: ChartPoint[] = [];
  hoveredPoint: ChartPoint | null = null;
  methodStats: Record<string, { amount: number; count: number; percentage: number }> = {};

  // Slide state
  selectedPayment: any = null;
  showNewPaymentModal = false;
  newPayment: any = {
    formationId: null,
    studentId: null,
    amount: null,
    paymentMethod: 'ESPECES',
  };

  constructor(
    private paiementService: PaiementService,
    private formationService: FormationService,
    private userService: UserService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Load Formations
    this.formationService.getFormations().subscribe({
      next: (forms) => (this.formations = forms || []),
    });

    // Load Stagiaires
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.stagiaires = (users || []).filter((u) => u.role === 'STAGIAIRE');
      },
    });

    // Load Payments
    this.paiementService.getAllPayments().subscribe({
      next: (data) => {
        this.loading = false;
        this.payments = data || [];
        this.applyFilters();
        this.buildChart();
      },
      error: () => {
        this.loading = false;
        this.toastService.error('Erreur lors du chargement des paiements');
      },
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase().trim();

    this.filteredPayments = this.payments.filter((p) => {
      const matchQ =
        !q ||
        p.id?.toString().includes(q) ||
        p.studentFirstName?.toLowerCase().includes(q) ||
        p.studentLastName?.toLowerCase().includes(q) ||
        p.studentEmail?.toLowerCase().includes(q) ||
        p.formationTitle?.toLowerCase().includes(q) ||
        p.transactionReference?.toLowerCase().includes(q);

      const matchStatus = !this.filterStatus || p.status === this.filterStatus;
      const matchMethod =
        !this.filterMethod || (p.paymentMethod || p.methode) === this.filterMethod;
      const matchFormation =
        !this.filterFormation || p.formationId?.toString() === this.filterFormation;

      return matchQ && matchStatus && matchMethod && matchFormation;
    });

    this.buildChart();
  }

  buildChart(): void {
    // 1. Calculate method statistics
    let totalAmt = 0;
    const stats: Record<string, { amount: number; count: number; percentage: number }> = {
      CARTE: { amount: 0, count: 0, percentage: 0 },
      VIREMENT: { amount: 0, count: 0, percentage: 0 },
      ESPECES: { amount: 0, count: 0, percentage: 0 },
      CHEQUE: { amount: 0, count: 0, percentage: 0 },
    };

    for (const p of this.filteredPayments) {
      const amt = Number(p.amount || p.montant || 0);
      const m = (p.paymentMethod || p.methode || 'ESPECES').toUpperCase();
      if (!stats[m]) {
        stats[m] = { amount: 0, count: 0, percentage: 0 };
      }
      stats[m].amount += amt;
      stats[m].count += 1;
      totalAmt += amt;
    }

    if (totalAmt > 0) {
      for (const k in stats) {
        stats[k].percentage = Math.round((stats[k].amount / totalAmt) * 100);
      }
    }
    this.methodStats = stats;

    // 2. Build time curve points
    const monthNames = [
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
    const buckets: Record<string, { amount: number; count: number }> = {};

    // Initialize 6 buckets
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]}`;
      buckets[key] = { amount: 0, count: 0 };
    }

    for (const p of this.filteredPayments) {
      const d = p.paymentDate ? new Date(p.paymentDate) : new Date();
      const key = `${monthNames[d.getMonth()]}`;
      if (buckets[key]) {
        buckets[key].amount += Number(p.amount || p.montant || 0);
        buckets[key].count += 1;
      }
    }

    const entries = Object.entries(buckets);
    const maxVal = Math.max(...entries.map(([, v]) => v.amount), 500);

    const width = 500;
    const height = 180;
    const padding = 20;

    this.chartPoints = entries.map(([label, val], idx) => {
      const x = padding + (idx / Math.max(1, entries.length - 1)) * (width - 2 * padding);
      const y = height - (val.amount / maxVal) * (height - 2 * padding) - 10;
      return {
        label,
        amount: val.amount,
        count: val.count,
        x: Math.round(x),
        y: Math.round(y),
      };
    });
  }

  get chartPolylinePoints(): string {
    return this.chartPoints.map((pt) => `${pt.x},${pt.y}`).join(' ');
  }

  get chartAreaPoints(): string {
    if (this.chartPoints.length === 0) return '';
    const first = this.chartPoints[0];
    const last = this.chartPoints[this.chartPoints.length - 1];
    return `${first.x},190 ${this.chartPolylinePoints} ${last.x},190`;
  }

  // Financial Metrics Computed
  get totalRevenue(): number {
    return this.filteredPayments
      .filter((p) => p.status === 'COMPLETED' || p.status === 'PAYE')
      .reduce((acc, p) => acc + Number(p.amount || p.montant || 0), 0);
  }

  get pendingAmount(): number {
    return this.filteredPayments
      .filter((p) => p.status === 'PENDING' || p.status === 'EN_ATTENTE')
      .reduce((acc, p) => acc + Number(p.amount || p.montant || 0), 0);
  }

  get completedPaymentsCount(): number {
    return this.filteredPayments.filter((p) => p.status === 'COMPLETED' || p.status === 'PAYE')
      .length;
  }

  get pendingPaymentsCount(): number {
    return this.filteredPayments.filter((p) => p.status === 'PENDING' || p.status === 'EN_ATTENTE')
      .length;
  }

  get averageAmount(): number {
    if (this.completedPaymentsCount === 0) return 0;
    return this.totalRevenue / this.completedPaymentsCount;
  }

  get successRate(): number {
    if (this.payments.length === 0) return 100;
    return Math.round((this.completedPaymentsCount / this.payments.length) * 100);
  }

  // Format Helpers
  formatStatus(status: string): string {
    if (status === 'COMPLETED' || status === 'PAYE') return 'Payé';
    if (status === 'PENDING' || status === 'EN_ATTENTE') return 'En attente';
    if (status === 'FAILED' || status === 'ECHOUE') return 'Échoué';
    return status || 'Inconnu';
  }

  getStatusBadgeClass(status: string): string {
    if (status === 'COMPLETED' || status === 'PAYE') {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
    if (status === 'PENDING' || status === 'EN_ATTENTE') {
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    }
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  }

  getStatusDotClass(status: string): string {
    if (status === 'COMPLETED' || status === 'PAYE') return 'bg-emerald-400';
    if (status === 'PENDING' || status === 'EN_ATTENTE') return 'bg-amber-400';
    return 'bg-rose-400';
  }

  formatMethod(method: string): string {
    if (!method) return 'Espèces';
    const m = method.toUpperCase();
    if (m === 'CARTE') return '💳 Carte Bancaire';
    if (m === 'VIREMENT') return '🏦 Virement';
    if (m === 'ESPECES') return '💵 Espèces';
    if (m === 'CHEQUE') return '📝 Chèque';
    return method;
  }

  getFormationName(id: any): string {
    if (!id) return 'Formation';
    const found = this.formations.find((f) => f.id?.toString() === id?.toString());
    return found ? found.nom : `Formation #${id}`;
  }

  openDetail(payment: any): void {
    this.selectedPayment = payment;
  }

  onFormationChange(): void {
    // Optionally auto-suggest price
  }

  submitPayment(): void {
    if (!this.newPayment.amount || !this.newPayment.studentId) return;

    this.savingPayment = true;
    const req: RegisterPaymentRequest = {
      enrollmentId: Number(this.newPayment.studentId),
      phaseId: 1,
      amount: Number(this.newPayment.amount),
      paymentMethod: this.newPayment.paymentMethod,
    };

    this.paiementService.registerPayment(req).subscribe({
      next: () => {
        this.savingPayment = false;
        this.showNewPaymentModal = false;
        this.toastService.success('Paiement enregistré avec succès !', 'Trésorerie Actualisée');
        this.loadData();
      },
      error: () => {
        this.savingPayment = false;
        this.toastService.error("Erreur lors de l'enregistrement du règlement.");
      },
    });
  }

  exportCSV(): void {
    if (this.filteredPayments.length === 0) {
      this.toastService.info('Aucune transaction à exporter');
      return;
    }

    const headers = [
      'ID',
      'Stagiaire',
      'Email',
      'Formation',
      'Montant (TND)',
      'Methode',
      'Statut',
      'Date',
    ];
    const rows = this.filteredPayments.map((p) => [
      p.id,
      `"${p.studentFirstName || ''} ${p.studentLastName || ''}"`,
      p.studentEmail || '',
      `"${p.formationTitle || this.getFormationName(p.formationId)}"`,
      p.amount || p.montant,
      p.paymentMethod || p.methode,
      p.status,
      p.paymentDate || p.datePaiement || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `the_bridge_paiements_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastService.success('Fichier CSV généré avec succès');
  }

  printReceipt(): void {
    window.print();
  }
}
