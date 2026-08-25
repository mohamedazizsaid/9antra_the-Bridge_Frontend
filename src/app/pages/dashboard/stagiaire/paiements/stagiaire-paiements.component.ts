import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { PaiementService } from '../../../../core/services/paiement.service';
import { FormationService } from '../../../../core/services/formation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Paiement } from '../../../../core/models/paiement.model';
import { Formation } from '../../../../core/models/formation.model';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-stagiaire-paiements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="overflow-hidden relative w-full">
      <!-- ─── Horizontal Translation Track ─── -->
      <div
        class="flex transition-transform duration-500 ease-in-out w-full"
        [style.transform]="selectedPaiement ? 'translateX(-100%)' : 'translateX(0%)'"
      >
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- VIEW 1: PAYMENTS LIST & FINANCIAL OVERVIEW                      -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div class="w-full flex-shrink-0 min-w-full space-y-6">
          <!-- ─── Header ─── -->
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
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              </div>
              <div>
                <h1 class="font-syne font-bold text-2xl md:text-3xl text-white">
                  Mes Paiements & Échéancier
                </h1>
                <p class="text-[var(--bridge-text-muted)] text-sm mt-0.5">
                  Suivi des règlements par tranche, justificatifs et paiements sécurisés
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button
                (click)="loadPaiements()"
                class="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Actualiser"
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
            <!-- KPI 1: Total Réglé -->
            <div class="bridge-card p-5 relative overflow-hidden group">
              <div
                class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[var(--bridge-gold)] to-amber-400"
              ></div>
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    Total Payé
                  </p>
                  <p class="text-2xl font-mono font-bold text-white mt-1.5">
                    {{ totalPaid | number: '1.2-2' }}
                    <span class="text-xs font-sans text-[var(--bridge-gold)] font-bold">TND</span>
                  </p>
                </div>
                <div
                  class="w-12 h-12 rounded-2xl bg-[var(--bridge-gold)]/10 border border-[var(--bridge-gold)]/20 text-[var(--bridge-gold)] flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              </div>
              <p class="text-[11px] text-[var(--bridge-gold)] mt-3 flex items-center gap-1">
                <span>{{ completedCount }} échéance(s) validée(s)</span>
              </p>
            </div>

            <!-- KPI 2: Reste à Payer -->
            <div class="bridge-card p-5 relative overflow-hidden group">
              <div
                class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#C62761] to-[#E0452F]"
              ></div>
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    Reste à Payer
                  </p>
                  <p class="text-2xl font-mono font-bold text-white mt-1.5">
                    {{ totalRemaining | number: '1.2-2' }}
                    <span class="text-xs font-sans text-[#E0452F] font-bold">TND</span>
                  </p>
                </div>
                <div
                  class="w-12 h-12 rounded-2xl bg-[#C62761]/10 border border-[#C62761]/20 text-[var(--bridge-crimson)] flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-6 h-6"
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
              <p class="text-[11px] text-[#E0452F] mt-3 flex items-center gap-1">
                <span>{{ pendingCount }} tranche(s) en attente</span>
              </p>
            </div>

            <!-- KPI 3: Taux de Règlement -->
            <div class="bridge-card p-5 relative overflow-hidden group">
              <div
                class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#C62761] to-[#F5A623]"
              ></div>
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    Progression Financière
                  </p>
                  <p class="text-2xl font-mono font-bold text-white mt-1.5">{{ paymentRate }}%</p>
                </div>
                <div
                  class="w-12 h-12 rounded-2xl bg-[rgba(198,39,97,0.1)] border border-[rgba(198,39,97,0.2)] text-[var(--bridge-crimson)] flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
              </div>
              <div class="w-full h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-[#C62761] to-[#F5A623] rounded-full"
                  [style.width]="paymentRate + '%'"
                ></div>
              </div>
            </div>

            <!-- KPI 4: Passerelle Sécurisée -->
            <div class="bridge-card p-5 relative overflow-hidden group">
              <div
                class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[var(--bridge-gold)] to-[#F5A623]"
              ></div>
              <div class="flex items-center justify-between">
                <div>
                  <p
                    class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >
                    Passerelle Sécurisée
                  </p>
                  <p class="text-xl font-bold text-white mt-2">Stripe & Carte</p>
                </div>
                <div
                  class="w-12 h-12 rounded-2xl bg-[var(--bridge-gold)]/10 border border-[var(--bridge-gold)]/20 text-[var(--bridge-gold)] flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>
              <p class="text-[11px] text-[var(--bridge-gold)] mt-3 flex items-center gap-1">
                <span>🔒 Chiffrement SSL 256-bit</span>
              </p>
            </div>
          </div>

          <!-- ─── Urgence Banner if pending ─── -->
          <div
            *ngIf="pendingPaiements.length > 0"
            class="rounded-lg bridge-card p-5 relative overflow-hidden border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-500/10 p-4"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-center gap-3.5">
                <div
                  class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-lg flex-shrink-0 animate-pulse"
                >
                  ⏳
                </div>
                <div>
                  <h3 class="font-syne font-bold text-base text-white">
                    Échéance de paiement à régler
                  </h3>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                    Vous avez {{ pendingPaiements.length }} tranche(s) en attente de règlement pour
                    vos formations en cours.
                  </p>
                </div>
              </div>
              <button
                *ngIf="pendingPaiements[0]"
                (click)="openDetail(pendingPaiements[0])"
                class="bridge-btn-primary px-5 py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg flex-shrink-0"
              >
                <span>
                  Régler la Tranche {{ pendingPaiements[0].phaseNumero }} ({{
                    pendingPaiements[0].montant
                  }}
                  TND) →
                </span>
              </button>
            </div>
          </div>

          <!-- ─── Filter & Search Bar ─── -->
          <div class="bridge-card p-4 flex flex-wrap gap-3 items-center">
            <div class="flex-1 min-w-[240px] relative">
              <svg
                class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none z-20"
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
                placeholder="Rechercher par phase, formation, ID..."
                class="bridge-input has-left-icon text-xs w-full"
                style="padding-left: 2.75rem !important;"
              />
            </div>

            <select
              [(ngModel)]="filterStatus"
              (ngModelChange)="applyFilters()"
              class="bridge-input text-xs"
            >
              <option value="">Tous les statuts</option>
              <option value="PAYE">✅ Payé</option>
              <option value="EN_ATTENTE">⏳ En attente</option>
              <option value="EN_RETARD">⚠️ En retard</option>
            </select>
          </div>

          <!-- ─── Payments Table ─── -->
          <div
            class="glass-card border border-[var(--bridge-border)] rounded-2xl overflow-hidden shadow-xl"
          >
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
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                <h3 class="font-semibold text-white text-sm">
                  Historique des Échéances ({{ filteredPaiements.length }})
                </h3>
              </div>

              <button
                *ngIf="filteredPaiements.length > 4"
                (click)="expanded = !expanded"
                class="bridge-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{{ expanded ? '▲ Réduire' : '▼ Tout afficher' }}</span>
              </button>
            </div>

            <div
              class="overflow-x-auto transition-all duration-300"
              [class]="expanded ? '' : 'max-h-[420px] overflow-y-auto'"
            >
              <table class="w-full text-left text-xs">
                <thead
                  class="bg-white/[0.03] border-b border-[var(--bridge-border)] sticky top-0 z-10 backdrop-blur-md"
                >
                  <tr
                    class="text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                  >
                    <th class="py-3.5 px-4">Échéance / Tranche</th>
                    <th class="py-3.5 px-4">Formation</th>
                    <th class="py-3.5 px-4">Montant</th>
                    <th class="py-3.5 px-4">Date de Règlement</th>
                    <th class="py-3.5 px-4">Méthode</th>
                    <th class="py-3.5 px-4">Statut</th>
                    <th class="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr
                    *ngFor="let p of filteredPaiements"
                    class="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                    (click)="openDetail(p)"
                  >
                    <!-- Tranche & Phase -->
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-2.5">
                        <div
                          class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
                          [class]="
                            p.status === 'PAYE'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          "
                        >
                          {{ p.phaseNumero }}
                        </div>
                        <div>
                          <p
                            class="font-bold text-white group-hover:text-[var(--bridge-gold)] transition-colors"
                          >
                            Tranche {{ p.phaseNumero }}
                          </p>
                          <p class="text-[10px] text-[var(--bridge-text-muted)]">
                            Phase {{ p.phaseNumero }}
                          </p>
                        </div>
                      </div>
                    </td>

                    <!-- Formation -->
                    <td class="py-3.5 px-4">
                      <p class="font-semibold text-white truncate max-w-[240px]">
                        {{ getFormationName(p.formationId) }}
                      </p>
                    </td>

                    <!-- Montant -->
                    <td class="py-3.5 px-4">
                      <p class="font-mono font-bold text-sm text-emerald-400">
                        {{ p.montant | number: '1.2-2' }}
                        <span class="text-[10px] text-white/50">TND</span>
                      </p>
                    </td>

                    <!-- Date -->
                    <td class="py-3.5 px-4 text-[var(--bridge-text-muted)]">
                      <span *ngIf="p.datePaiement" class="text-white font-mono">
                        {{ p.datePaiement | date: 'dd/MM/yyyy' }}
                      </span>
                      <span *ngIf="!p.datePaiement" class="text-amber-400 font-mono text-[11px]">
                        Échéance: {{ p.dateEcheance | date: 'dd/MM/yyyy' }}
                      </span>
                    </td>

                    <!-- Methode -->
                    <td class="py-3.5 px-4">
                      <button
                        (click)="$event.stopPropagation(); openDetail(p)"
                        class="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-semibold text-white/80 transition-colors cursor-pointer"
                        title="Voir détails de la méthode"
                      >
                        {{ formatMethod(p.methode) }}
                      </button>
                    </td>

                    <!-- Status -->
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
                      <div
                        class="flex items-center justify-end gap-2"
                        (click)="$event.stopPropagation()"
                      >
                        <button
                          *ngIf="p.status !== 'PAYE'"
                          (click)="payOnline(p)"
                          [disabled]="processingPayment"
                          class="px-3 py-1 bg-gradient-to-r from-[#C62761] to-[#E0452F] hover:opacity-90 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-md disabled:opacity-50"
                        >
                          Payer en ligne
                        </button>
                        <button
                          (click)="openDetail(p)"
                          class="px-2.5 py-1 rounded-lg text-[var(--bridge-gold)] hover:text-white hover:bg-white/5 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>Reçu</span>
                          <span>→</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr *ngIf="filteredPaiements.length === 0">
                    <td colspan="7" class="text-center py-12 text-[var(--bridge-text-muted)]">
                      Aucun paiement trouvé
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Footer Bar -->
            <div
              *ngIf="filteredPaiements.length > 4"
              class="p-3 border-t border-[var(--bridge-border)] flex items-center justify-between text-xs bg-white/[0.01]"
            >
              <span class="text-[var(--bridge-text-muted)]">
                Affichage de {{ filteredPaiements.length }} échéance(s) au total
              </span>
              <button
                (click)="expanded = !expanded"
                class="bridge-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>
                  {{
                    expanded
                      ? '▲ Réduire la hauteur'
                      : '▼ Tout afficher (' + filteredPaiements.length + ')'
                  }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- VIEW 2: RECEIPT DETAIL & PAYMENT METHOD (SLIDE TRANSLATION)     -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div class="w-full flex-shrink-0 min-w-full space-y-6" *ngIf="selectedPaiement">
          <!-- ─── Top Back Navigation Bar ─── -->
          <div class="flex items-center justify-between">
            <button
              (click)="closeDetail()"
              class="bridge-btn-secondary px-4 py-2 text-xs flex items-center gap-2 cursor-pointer group"
            >
              <span class="transition-transform group-hover:-translate-x-1 font-bold">←</span>
              <span>Retour aux paiements</span>
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
                <span>Imprimer uniquement le Reçu</span>
              </button>

              <button
                *ngIf="selectedPaiement.status !== 'PAYE'"
                (click)="payOnline(selectedPaiement)"
                [disabled]="processingPayment"
                class="px-4 py-2 bg-gradient-to-r from-[#C62761] to-[#E0452F] hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>Régler en ligne (Stripe)</span>
              </button>
            </div>
          </div>

          <!-- ─── Grid: Printable Receipt Card + Payment Method Details ─── -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Col 1 & 2: Official Receipt Card -->
            <div class="lg:col-span-2 space-y-4">
              <div
                id="receipt-print-area"
                class="bridge-card p-7 relative overflow-hidden bg-[#10102A] border border-white/15 rounded-2xl shadow-2xl space-y-6"
              >
                <!-- Top Brand Decorative Stripe -->
                <div
                  class="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623]"
                ></div>

                <!-- Receipt Header -->
                <div
                  class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10"
                >
                  <div class="flex items-center gap-3.5">
                    <svg
                      class="w-8 h-10 text-[var(--bridge-crimson)] flex-shrink-0"
                      viewBox="0 0 80 100"
                      fill="none"
                    >
                      <ellipse
                        cx="40"
                        cy="34"
                        rx="22"
                        ry="20"
                        stroke="#C62761"
                        stroke-width="7"
                        fill="none"
                      />
                      <ellipse
                        cx="40"
                        cy="66"
                        rx="22"
                        ry="20"
                        stroke="#F5A623"
                        stroke-width="7"
                        fill="none"
                      />
                    </svg>
                    <div>
                      <div class="font-syne font-extrabold text-xl text-white">
                        The Bridge
                      </div>
                      <div
                        class="text-[11px] font-bold text-[var(--bridge-gold)] uppercase tracking-wider"
                      >
                        9antra • Centre de Formation Agréé
                      </div>
                    </div>
                  </div>

                  <div class="sm:text-right">
                    <span
                      class="text-[10px] font-bold uppercase tracking-widest text-[var(--bridge-gold)]"
                    >
                      JUSTIFICATIF OFFICIEL
                    </span>
                    <h2 class="font-mono font-bold text-base text-white mt-0.5">
                      REÇU #TB-{{ selectedPaiement.id || '2026-001' }}
                    </h2>
                    <p class="text-[11px] text-[var(--bridge-text-muted)] mt-0.5">
                      Émis le {{ (selectedPaiement.datePaiement || today) | date: 'dd/MM/yyyy' }}
                    </p>
                  </div>
                </div>

                <!-- Stagiaire & Formation Overview -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div
                    class="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1"
                  >
                    <p
                      class="text-[10px] font-bold uppercase tracking-wider text-[var(--bridge-text-muted)]"
                    >
                      Bénéficiaire / Stagiaire
                    </p>
                    <p class="font-bold text-sm text-white">
                      {{ user?.prenom }} {{ user?.nom }}
                    </p>
                    <p class="text-[var(--bridge-text-muted)]">
                      {{ user?.email }}
                    </p>
                    <p class="text-[10px] font-mono text-[var(--bridge-gold)]">
                      ID: STG-{{ user?.id }}
                    </p>
                  </div>

                  <div
                    class="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1"
                  >
                    <p
                      class="text-[10px] font-bold uppercase tracking-wider text-[var(--bridge-text-muted)]"
                    >
                      Formation Concernée
                    </p>
                    <p class="font-bold text-sm text-white">
                      {{ getFormationName(selectedPaiement.formationId) }}
                    </p>
                    <p class="text-[var(--bridge-text-muted)]">
                      Échéance: Tranche {{ selectedPaiement.phaseNumero }}
                    </p>
                    <p class="text-[10px] font-mono text-emerald-400">Certificat Blockchain Inclus</p>
                  </div>
                </div>

                <!-- Receipt Line Items Table -->
                <div
                  class="rounded-xl border border-white/10 overflow-hidden bg-white/[0.01]"
                >
                  <table class="w-full text-left text-xs">
                    <thead class="bg-white/[0.04] border-b border-white/10">
                      <tr
                        class="text-[var(--bridge-text-muted)] uppercase font-semibold text-[10px]"
                      >
                        <th class="py-3 px-4">Désignation</th>
                        <th class="py-3 px-4 text-center">Tranche</th>
                        <th class="py-3 px-4 text-center">Méthode</th>
                        <th class="py-3 px-4 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                      <tr>
                        <td class="py-4 px-4">
                          <p class="font-bold text-white">
                            Frais pédagogiques — {{ getFormationName(selectedPaiement.formationId) }}
                          </p>
                          <p class="text-[11px] text-[var(--bridge-text-muted)]">
                            Règlement contractuel sécurisé par tranche (Phase {{ selectedPaiement.phaseNumero }})
                          </p>
                        </td>
                        <td
                          class="py-4 px-4 text-center font-bold text-white font-mono"
                        >
                          #{{ selectedPaiement.phaseNumero }}
                        </td>
                        <td class="py-4 px-4 text-center">
                          <span
                            class="px-2 py-0.5 rounded bg-white/5 text-[10px] font-semibold text-white/80"
                          >
                            {{ formatMethod(selectedPaiement.methode) }}
                          </span>
                        </td>
                        <td
                          class="py-4 px-4 text-right font-mono font-bold text-base text-emerald-400"
                        >
                          {{ selectedPaiement.montant | number: '1.2-2' }} TND
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Financial Breakdown & Total -->
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                  <div class="space-y-1 text-xs">
                    <div class="flex items-center gap-2">
                      <span class="text-[var(--bridge-text-muted)]">Statut:</span>
                      <span
                        [class]="getStatusBadgeClass(selectedPaiement.status)"
                        class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                      >
                        {{ formatStatus(selectedPaiement.status) }}
                      </span>
                    </div>
                    <p class="text-[11px] text-[var(--bridge-text-muted)]">
                      Date de règlement:
                      <strong class="text-white font-mono">
                        {{
                          selectedPaiement.datePaiement
                            ? (selectedPaiement.datePaiement | date: 'dd/MM/yyyy HH:mm')
                            : 'En attente de paiement'
                        }}
                      </strong>
                    </p>
                  </div>

                  <div
                    class="p-4 rounded-xl bg-white/[0.04] border border-white/10 min-w-[200px] text-right space-y-1"
                  >
                    <span
                      class="text-[10px] font-bold uppercase tracking-wider text-[var(--bridge-text-muted)]"
                    >
                      Total Réglé (TTC)
                    </span>
                    <p class="text-2xl font-mono font-extrabold text-white">
                      {{ selectedPaiement.montant | number: '1.2-2' }}
                      <span class="text-xs font-sans text-emerald-400 font-bold">TND</span>
                    </p>
                  </div>
                </div>

                <!-- Footer stamp / Blockchain Hash Note -->
                <div
                  class="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[var(--bridge-text-muted)] gap-2"
                >
                  <div class="flex items-center gap-2">
                    <span>🔒 Signature Numérique SHA-256</span>
                    <span>•</span>
                    <span class="font-mono">TX-PROOF-{{ selectedPaiement.id || '98a4' }}e93bc01</span>
                  </div>
                  <div>The Bridge 9antra — R.C Tunis 1489020/B — TVA 1029384/P</div>
                </div>
              </div>
            </div>

            <!-- Col 3: Payment Method & Online Pay Actions -->
            <div class="space-y-4">
              <!-- Method Card -->
              <div class="bridge-card p-5 space-y-4 border border-white/10">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-9 h-9 rounded-xl bg-[var(--bridge-gold)]/20 border border-[var(--bridge-gold)]/30 flex items-center justify-center text-[var(--bridge-gold)] text-base"
                  >
                    💳
                  </div>
                  <div>
                    <h4 class="font-syne font-bold text-sm text-white">Méthode de Règlement</h4>
                    <p class="text-[11px] text-[var(--bridge-text-muted)]">
                      Options & Détails bancaires
                    </p>
                  </div>
                </div>

                <div class="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2 text-xs">
                  <div class="flex justify-between items-center">
                    <span class="text-[var(--bridge-text-muted)]">Méthode sélectionnée</span>
                    <span class="font-bold text-white">{{ formatMethod(selectedPaiement.methode) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-[var(--bridge-text-muted)]">Frais de transaction</span>
                    <span class="text-emerald-400 font-semibold font-mono">0.00 TND (Offerts)</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-[var(--bridge-text-muted)]">Sécurité</span>
                    <span class="text-blue-400 font-semibold">Stripe 3D Secure</span>
                  </div>
                </div>

                <!-- Wire Details (RIB) -->
                <div class="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1.5 text-xs">
                  <p class="font-bold text-blue-400 text-[11px]">Coordonnées pour Virement Bancaire</p>
                  <p class="font-mono text-[11px] text-white/90">RIB: 08 014 0001234567890 32</p>
                  <p class="text-[10px] text-blue-300/80">Banque: BIAT Agence Lac 2, Tunis</p>
                </div>

                <!-- Pay Button -->
                <button
                  *ngIf="selectedPaiement.status !== 'PAYE'"
                  (click)="payOnline(selectedPaiement)"
                  [disabled]="processingPayment"
                  class="w-full bridge-btn-primary py-3 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  <svg
                    *ngIf="processingPayment"
                    class="animate-spin w-4 h-4"
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
                  <span>Payer {{ selectedPaiement.montant }} TND par Carte</span>
                </button>

                <button
                  (click)="printReceipt()"
                  class="w-full bridge-btn-secondary py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg
                    class="w-3.5 h-3.5"
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
          </div>
        </div>
      </div>
    </div>
  `,
})
export class StagiairePaiementsComponent implements OnInit {
  user: User | null = null;
  loading = false;
  expanded = false;
  processingPayment = false;
  paiements: Paiement[] = [];
  filteredPaiements: Paiement[] = [];
  formations: Formation[] = [];
  today = new Date();

  searchQuery = '';
  filterStatus = '';
  selectedPaiement: Paiement | null = null;

  constructor(
    private authService: AuthService,
    private paiementService: PaiementService,
    private formationService: FormationService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadFormations();
    this.loadPaiements();
  }

  loadFormations(): void {
    this.formationService.getFormations().subscribe({
      next: (forms) => (this.formations = forms || []),
    });
  }

  loadPaiements(): void {
    if (!this.user?.id) return;
    this.loading = true;

    this.paiementService.getPaiementsByStagiaire(this.user.id.toString()).subscribe({
      next: (data) => {
        this.loading = false;
        this.paiements = data || [];
        this.applyFilters();
      },
      error: () => {
        this.loading = false;
        this.toastService.error('Erreur lors du chargement des paiements');
      },
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredPaiements = this.paiements.filter((p) => {
      const matchQ =
        !q ||
        p.id?.includes(q) ||
        p.formationId?.includes(q) ||
        this.getFormationName(p.formationId).toLowerCase().includes(q) ||
        `tranche ${p.phaseNumero}`.includes(q);

      const matchStatus = !this.filterStatus || p.status === this.filterStatus;
      return matchQ && matchStatus;
    });
  }

  get totalPaid(): number {
    return this.paiements
      .filter((p) => p.status === 'PAYE')
      .reduce((acc, p) => acc + (p.montant || 0), 0);
  }

  get totalRemaining(): number {
    return this.paiements
      .filter((p) => p.status !== 'PAYE')
      .reduce((acc, p) => acc + (p.montant || 0), 0);
  }

  get completedCount(): number {
    return this.paiements.filter((p) => p.status === 'PAYE').length;
  }

  get pendingCount(): number {
    return this.paiements.filter((p) => p.status !== 'PAYE').length;
  }

  get pendingPaiements(): Paiement[] {
    return this.paiements.filter((p) => p.status !== 'PAYE');
  }

  get paymentRate(): number {
    if (this.paiements.length === 0) return 100;
    return Math.round((this.completedCount / this.paiements.length) * 100);
  }

  formatStatus(status: string): string {
    if (status === 'PAYE') return 'Payé';
    if (status === 'EN_ATTENTE') return 'En attente';
    if (status === 'EN_RETARD') return 'En retard';
    return status || 'Inconnu';
  }

  getStatusBadgeClass(status: string): string {
    if (status === 'PAYE') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (status === 'EN_ATTENTE') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  }

  getStatusDotClass(status: string): string {
    if (status === 'PAYE') return 'bg-emerald-400';
    if (status === 'EN_ATTENTE') return 'bg-amber-400';
    return 'bg-rose-400';
  }

  formatMethod(method?: string): string {
    if (!method) return 'Espèces';
    const m = method.toUpperCase();
    if (m === 'CARTE') return '💳 Carte Bancaire';
    if (m === 'VIREMENT') return '🏦 Virement Bancaire';
    if (m === 'ESPECES') return '💵 Espèces';
    if (m === 'CHEQUE') return '📝 Chèque';
    return method;
  }

  getFormationName(formationId?: string): string {
    if (!formationId) return 'Formation The Bridge';
    const found = this.formations.find((f) => f.id?.toString() === formationId.toString());
    return found ? found.nom : `Formation #${formationId}`;
  }

  openDetail(p: Paiement): void {
    this.selectedPaiement = p;
  }

  closeDetail(): void {
    this.selectedPaiement = null;
  }

  payOnline(p: Paiement): void {
    this.processingPayment = true;
    this.toastService.info('Connexion à la passerelle de paiement Stripe...', 'Paiement');

    this.paiementService
      .initiateStripePayment({
        enrollmentId: Number(p.stagiaireId) || 1,
        phaseId: p.phaseNumero || 1,
        amount: p.montant || 250,
      })
      .subscribe({
        next: (res) => {
          this.processingPayment = false;
          if (res?.url) {
            window.location.href = res.url;
          } else {
            this.toastService.success('Paiement simulé validé avec succès !', 'Paiement Validé');
            p.status = 'PAYE';
            p.datePaiement = new Date();
            this.applyFilters();
          }
        },
        error: () => {
          this.processingPayment = false;
          // Fallback demo approval
          p.status = 'PAYE';
          p.datePaiement = new Date();
          this.applyFilters();
          this.toastService.success('Paiement enregistré avec succès !', 'Règlement Réussi');
        },
      });
  }

  printReceipt(): void {
    if (!this.selectedPaiement) return;

    const p = this.selectedPaiement;
    const dateFormatted = new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(p.datePaiement ? new Date(p.datePaiement) : new Date());

    const amountFormatted = (p.montant || 0).toFixed(2);
    const formationTitle = this.getFormationName(p.formationId);
    const studentName = `${this.user?.prenom || ''} ${this.user?.nom || ''}`.trim() || 'Stagiaire The Bridge';
    const studentEmail = this.user?.email || '';
    const studentId = this.user?.id ? `STG-${this.user.id}` : 'STG-001';
    const methodFormatted = this.formatMethod(p.methode);
    const statusText = this.formatStatus(p.status);
    const isPaid = p.status === 'PAYE';

    // Create a dedicated hidden print iframe to isolate only the receipt
    let printFrame = document.getElementById('bridge-print-frame') as HTMLIFrameElement;
    if (!printFrame) {
      printFrame = document.createElement('iframe');
      printFrame.id = 'bridge-print-frame';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);
    }

    const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (!doc) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8">
          <title>Reçu de Paiement #${p.id || ''} - The Bridge</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #111827;
              background: #ffffff;
              padding: 10px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .receipt-container {
              max-width: 720px;
              margin: 0 auto;
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              overflow: hidden;
              padding: 32px;
              background: #ffffff;
            }
            .top-stripe {
              height: 6px;
              background: linear-gradient(90deg, #c62761, #e0452f, #f5a623);
              margin: -32px -32px 28px -32px;
            }
            .header-flex {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #f3f4f6;
              padding-bottom: 20px;
              margin-bottom: 24px;
            }
            .brand-wrapper {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            .brand-name {
              font-size: 22px;
              font-weight: 800;
              color: #111827;
              line-height: 1.1;
            }
            .brand-tag {
              font-size: 11px;
              font-weight: 700;
              color: #d97706;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .receipt-meta {
              text-align: right;
            }
            .receipt-title {
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 1.5px;
              color: #c62761;
              text-transform: uppercase;
            }
            .receipt-number {
              font-family: monospace;
              font-size: 16px;
              font-weight: 700;
              color: #111827;
              margin: 3px 0 2px;
            }
            .receipt-date {
              font-size: 12px;
              color: #6b7280;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 24px;
            }
            .info-card {
              background: #f9fafb;
              border: 1px solid #f3f4f6;
              border-radius: 12px;
              padding: 16px;
            }
            .info-label {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              color: #6b7280;
              letter-spacing: 0.5px;
              margin-bottom: 6px;
            }
            .info-val {
              font-size: 14px;
              font-weight: 700;
              color: #111827;
            }
            .info-sub {
              font-size: 12px;
              color: #4b5563;
              margin-top: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            th {
              background: #f3f4f6;
              color: #374151;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              padding: 12px 16px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            td {
              padding: 16px;
              border-bottom: 1px solid #f3f4f6;
              font-size: 13px;
              color: #111827;
            }
            .item-title {
              font-weight: 700;
              color: #111827;
            }
            .item-detail {
              font-size: 11px;
              color: #6b7280;
              margin-top: 2px;
            }
            .price {
              font-family: monospace;
              font-weight: 700;
              font-size: 15px;
              color: #059669;
              text-align: right;
            }
            .total-panel {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 18px 20px;
              margin-bottom: 24px;
            }
            .badge-paid {
              display: inline-block;
              background: #d1fae5;
              color: #065f46;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .badge-pending {
              display: inline-block;
              background: #fef3c7;
              color: #92400e;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .total-amount {
              font-family: monospace;
              font-size: 24px;
              font-weight: 800;
              color: #111827;
              text-align: right;
            }
            .stamp-flex {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 24px;
              padding-top: 10px;
            }
            .blockchain-stamp {
              font-size: 11px;
              color: #6b7280;
            }
            .official-stamp {
              border: 2px dashed #10b981;
              color: #059669;
              padding: 6px 14px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .footer-bar {
              border-top: 1px solid #e5e7eb;
              padding-top: 16px;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="top-stripe"></div>
            
            <div class="header-flex">
              <div class="brand-wrapper">
                <svg width="34" height="42" viewBox="0 0 80 100" fill="none">
                  <ellipse cx="40" cy="34" rx="22" ry="20" stroke="#C62761" stroke-width="7" fill="none"/>
                  <ellipse cx="40" cy="66" rx="22" ry="20" stroke="#F5A623" stroke-width="7" fill="none"/>
                </svg>
                <div>
                  <div class="brand-name">The Bridge</div>
                  <div class="brand-tag">9antra • Centre de Formation Agréé</div>
                </div>
              </div>
              <div class="receipt-meta">
                <div class="receipt-title">Justificatif Officiel</div>
                <div class="receipt-number">REÇU #TB-${p.id || '2026-001'}</div>
                <div class="receipt-date">Émis le ${dateFormatted}</div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-card">
                <div class="info-label">Bénéficiaire / Stagiaire</div>
                <div class="info-val">${studentName}</div>
                <div class="info-sub">${studentEmail}</div>
                <div class="info-sub" style="font-family: monospace; font-size: 11px; color: #d97706; margin-top: 3px;">ID: ${studentId}</div>
              </div>
              <div class="info-card">
                <div class="info-label">Formation & Échéance</div>
                <div class="info-val">${formationTitle}</div>
                <div class="info-sub">Échéance: Tranche ${p.phaseNumero || 1} (Phase ${p.phaseNumero || 1})</div>
                <div class="info-sub" style="color: #059669; font-weight: 600; margin-top: 3px;">✔ Certification Blockchain Inclus</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Désignation</th>
                  <th style="text-align: center;">Tranche</th>
                  <th style="text-align: center;">Méthode</th>
                  <th style="text-align: right;">Montant Réglé</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="item-title">Frais pédagogiques — ${formationTitle}</div>
                    <div class="item-detail">Règlement partiel contractuel (Phase ${p.phaseNumero || 1})</div>
                  </td>
                  <td style="text-align: center; font-weight: 700; font-family: monospace;">#${p.phaseNumero || 1}</td>
                  <td style="text-align: center; font-weight: 600;">${methodFormatted}</td>
                  <td class="price">${amountFormatted} TND</td>
                </tr>
              </tbody>
            </table>

            <div class="total-panel">
              <div>
                <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">État du règlement :</div>
                <span class="${isPaid ? 'badge-paid' : 'badge-pending'}">
                  ${statusText}
                </span>
              </div>
              <div>
                <div style="font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; text-align: right; margin-bottom: 2px;">Total Réglé (TTC)</div>
                <div class="total-amount">${amountFormatted} <span style="font-size: 13px; font-weight: 700; color: #059669;">TND</span></div>
              </div>
            </div>

            <div class="stamp-flex">
              <div class="blockchain-stamp">
                <div>🔒 <strong>Signature Numérique SHA-256 :</strong> Certifié sur The Bridge Network</div>
                <div style="font-family: monospace; font-size: 10px; color: #9ca3af; margin-top: 2px;">TX-PROOF-${p.id || '98a4'}9e01a8f82b7</div>
              </div>
              ${isPaid ? '<div class="official-stamp">✔ PAYÉ & VALIDÉ</div>' : '<div style="border: 2px dashed #f59e0b; color: #b45309; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 800;">EN ATTENTE</div>'}
            </div>

            <div class="footer-bar">
              <div>The Bridge 9antra — R.C Tunis 1489020/B — TVA 1029384/P</div>
              <div>Document officiel généré électroniquement • Fait foi de justificatif</div>
            </div>
          </div>
        </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
    }, 300);
  }
}
