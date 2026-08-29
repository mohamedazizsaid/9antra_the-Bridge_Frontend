import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { FormationService } from '../../../../core/services/formation.service';
import { PaiementService } from '../../../../core/services/paiement.service';
import { CertificatService } from '../../../../core/services/certificat.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { EnrollmentService } from '../../../../core/services/enrollment.service';
import { ToastService } from '../../../../core/services/toast.service';
import { User } from '../../../../core/models/user.model';
import { Formation, Seance } from '../../../../core/models/formation.model';
import { Paiement } from '../../../../core/models/paiement.model';
import { Certificat } from '../../../../core/models/certificat.model';
import { Notification } from '../../../../core/models/notification.model';
import { Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { EnrollmentStepperComponent } from '../../formations/enrollment-stepper.component';

Chart.register(...registerables);

@Component({
  selector: 'app-stagiaire-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EnrollmentStepperComponent],
  template: `
    <div class="min-h-screen space-y-6">
      <!-- ═══════════════════════════════ HEADER ═══════════════════════════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div
            class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[var(--bridge-gold)]/30 flex items-center justify-center text-lg font-bold text-[var(--bridge-gold)] shadow-lg"
          >
            {{ user?.prenom?.[0] || 'S' }}
          </div>
          <div>
            <h1 class="font-syne font-bold text-2xl md:text-3xl text-white flex items-center gap-2">
              Bonjour,
              <span
                class="bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text text-transparent"
                >{{ user?.prenom }}</span
              >
              <svg
                class="w-5 h-5 inline-block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M8 11V5a1 1 0 0 1 2 0v5" />
                <path d="M10 10V3.5a1 1 0 0 1 2 0V10" />
                <path d="M12 10V5a1 1 0 0 1 2 0v6" />
                <path d="M14 11V7a1 1 0 0 1 2 0v7" />
              </svg>
            </h1>
            <p class="text-[var(--bridge-text-muted)] text-sm mt-0.5">
              {{ today }} — Espace Stagiaire The Bridge
            </p>
          </div>
        </div>
        <!-- Unread badge -->
        <div class="flex items-center gap-3">
          <button
            (click)="setActiveTab('notifications')"
            class="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[rgba(198,39,97,0.3)] transition-all text-sm text-white"
          >
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            Notifications
            <span
              *ngIf="unreadCount > 0"
              class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#C62761] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- ═══════════════════════════════ 4 KPI CARDS — STYLE HISTORIQUE ═══════════════════════════════ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- KPI 1 : Mes Formations -->
        <div
          class="bridge-card p-5 relative overflow-hidden group cursor-pointer"
          (click)="openMyFormations()"
        >
          <div
            class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[var(--bridge-crimson)] to-[var(--bridge-gold)]"
          ></div>

          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
              >
                Mes Formations
              </p>
              <p class="text-2xl font-mono font-bold text-white mt-1.5">
                {{ myFormations.length }}
              </p>
            </div>

            <div
              class="w-12 h-12 rounded-2xl bg-[var(--bridge-crimson)]/10 border border-[var(--bridge-crimson)]/20 text-[var(--bridge-crimson)] flex items-center justify-center flex-shrink-0"
            >
              <span class="text-xl"
                ><svg
                  class="w-5 h-5 inline-block"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg
              ></span>
            </div>
          </div>

          <p
            class="text-[11px] text-[var(--bridge-gold)] mt-3 flex items-center gap-1 font-semibold"
          >
            <span>{{ activeFormationsCount }} formation(s) active(s)</span>
          </p>
        </div>

        <!-- KPI 2 : Assiduité -->
        <div class="bridge-card p-5 relative overflow-hidden group">
          <div
            class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[var(--bridge-gold)] to-amber-400"
          ></div>

          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
              >
                Assiduité Globale
              </p>
              <p
                class="text-2xl font-mono font-bold mt-1.5"
                [class]="attendanceRate >= 75 ? 'text-[var(--bridge-gold)]' : 'text-rose-400'"
              >
                {{ attendanceRate }}%
              </p>
            </div>

            <div
              class="w-12 h-12 rounded-2xl bg-[var(--bridge-gold)]/10 border border-[var(--bridge-gold)]/20 text-[var(--bridge-gold)] flex items-center justify-center flex-shrink-0"
            >
              <span class="text-xl"
                ><svg
                  class="w-5 h-5 inline-block"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <line x1="4" y1="19" x2="4" y2="10" />
                  <line x1="10" y1="19" x2="10" y2="4" />
                  <line x1="16" y1="19" x2="16" y2="13" />
                  <line x1="22" y1="19" x2="22" y2="7" /></svg
              ></span>
            </div>
          </div>

          <p
            class="text-[11px] mt-3 flex items-center gap-1"
            [class]="attendanceRate >= 75 ? 'text-[var(--bridge-gold)]' : 'text-rose-400'"
          >
            <span>{{
              attendanceRate >= 75 ? '✓ Assiduité conforme (≥ 75%)' : '⚠️ Attention aux absences'
            }}</span>
          </p>
        </div>

        <!-- KPI 3 : Paiements -->
        <div
          class="bridge-card p-5 relative overflow-hidden group cursor-pointer"
          (click)="setActiveTab('paiements')"
        >
          <div
            class="h-1 absolute top-0 left-0 right-0"
            [class]="
              retardCount > 0
                ? 'bg-gradient-to-r from-red-500 to-orange-400'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400'
            "
          ></div>

          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
              >
                Paiements
              </p>
              <p
                class="text-2xl font-mono font-bold mt-1.5"
                [class]="retardCount > 0 ? 'text-rose-400' : 'text-emerald-400'"
              >
                {{ paidPaymentsCount }}
                <span class="text-xs font-sans text-white/50">/ {{ paiements.length }}</span>
              </p>
            </div>

            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              [class]="
                retardCount > 0
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              "
            >
              <span class="text-xl"
                ><svg
                  class="w-5 h-5 inline-block"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                  <line x1="6" y1="15" x2="9" y2="15" /></svg
              ></span>
            </div>
          </div>

          <p
            class="text-[11px] mt-3 flex items-center gap-1 font-semibold"
            [class]="retardCount > 0 ? 'text-red-400' : 'text-emerald-400'"
          >
            <span>{{ retardCount > 0 ? retardCount + ' en retard ⚠' : 'À jour ✓' }}</span>
          </p>
        </div>

        <!-- KPI 4 : Certificats -->
        <div
          class="bridge-card p-5 relative overflow-hidden group cursor-pointer"
          (click)="setActiveTab('certificats')"
        >
          <div
            class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[var(--bridge-crimson)] to-[var(--bridge-gold)]"
          ></div>

          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
              >
                Certificats
              </p>
              <p class="text-2xl font-mono font-bold text-[var(--bridge-gold)] mt-1.5">
                {{ certificats.length }}
              </p>
            </div>

            <div
              class="w-12 h-12 rounded-2xl bg-[var(--bridge-crimson)]/10 border border-[var(--bridge-crimson)]/20 text-[var(--bridge-crimson)] flex items-center justify-center flex-shrink-0"
            >
              <span class="text-xl"
                ><svg
                  class="w-5 h-5 inline-block"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                  <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
                  <path d="M7 6H4v2a4 4 0 0 0 4 4" />
                  <path d="M17 6h3v2a4 4 0 0 1-4 4" /></svg
              ></span>
            </div>
          </div>

          <p
            class="text-[11px] text-[var(--bridge-gold)] mt-3 flex items-center gap-1 font-semibold"
          >
            <span
              ><svg
                class="w-4 h-4 inline-block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              Blockchain The Bridge Active</span
            >
          </p>
        </div>
      </div>

      <!-- ═══════════════════════════════ PAYMENT REMINDER BANNER ═══════════════════════════════ -->
      <div
        *ngIf="urgentPayments.length > 0"
        class="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-500/10 p-4"
      >
        <div
          class="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent pointer-events-none"
        ></div>
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xl flex-shrink-0 animate-pulse"
          >
            <svg
              class="w-5 h-5 inline-block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3 2.5 20h19L12 3z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <circle cx="12" cy="16.5" r=".8" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-semibold text-orange-300 text-sm">Rappel de paiement</p>
            <p class="text-orange-200/70 text-xs mt-0.5">
              Vous avez <strong>{{ urgentPayments.length }}</strong> paiement(s) à effectuer
              bientôt.
              <span *ngFor="let p of urgentPayments; let last = last">
                Phase {{ p.phaseNumero }} ({{ p.montant }} TND —
                {{ getDaysUntilDue(p.dateEcheance) }} jrs)<span *ngIf="!last">, </span>
              </span>
            </p>
          </div>
          <button
            (click)="setActiveTab('paiements'); scrollToSection('payments-section')"
            class="flex-shrink-0 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-xl transition-all"
          >
            Payer →
          </button>
        </div>
      </div>

      <!-- ═══════════════════════════════ TAB NAV ═══════════════════════════════ -->
      <div
        class="flex items-center gap-3 p-1.5 glass-card border border-[var(--bridge-border)] rounded-2xl overflow-x-auto w-fit"
      >
        <button
          *ngFor="let tab of tabs"
          (click)="setActiveTab(tab.key)"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 cursor-pointer"
          [class]="
            activeTab === tab.key
              ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-lg'
              : 'text-[var(--bridge-text-muted)] hover:text-white hover:bg-white/5'
          "
        >
          <svg
            *ngIf="tab.key === 'catalogue'"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <svg
            *ngIf="tab.key === 'paiements'"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
          <svg
            *ngIf="tab.key === 'certificats'"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
          <svg
            *ngIf="tab.key === 'presence'"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <svg
            *ngIf="tab.key === 'notifications'"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- ═══════════════════════════════ TAB: CATALOGUE FORMATIONS ═══════════════════════════════ -->
      <div *ngIf="activeTab === 'catalogue'" class="space-y-6">
        <!-- ── Sub-filter toggle + Search ── -->
        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center ">
          <!-- View toggle: Toutes / Mes formations -->
          <div class="flex items-center p-1 rounded-xl bg-white/[0.04]  gap-1 flex-shrink-0">
            <button
              (click)="catalogView = 'all'"
              class="px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap"
              [class]="
                catalogView === 'all'
                  ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-md'
                  : 'text-[var(--bridge-text-muted)] hover:text-white'
              "
            >
              <svg
                class="w-4 h-4 inline-block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16.65" y2="16.65" />
              </svg>
              Toutes
            </button>
            <button
              (click)="catalogView = 'mine'"
              class="px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-1.5"
              [class]="
                catalogView === 'mine'
                  ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-md'
                  : 'text-[var(--bridge-text-muted)] hover:text-white'
              "
            >
              <svg
                class="w-5 h-5 inline-block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Mes formations
              <span class="text-[10px] font-mono opacity-75">({{ myFormations.length }})</span>
            </button>
          </div>

          <!-- Search (only shown for 'all' view) -->
          <ng-container *ngIf="catalogView === 'all'">
            <div class="relative flex-1">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bridge-text-muted)]"
                ><svg
                  class="w-4 h-4 inline-block"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="20" y1="20" x2="16.65" y2="16.65" /></svg
              ></span>
              <input
                [(ngModel)]="catalogSearch"
                (ngModelChange)="filterCatalogue()"
                placeholder="Rechercher une formation..."
                class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C62761] transition-all"
              />
            </div>
            <select
              [(ngModel)]="catalogCategory"
              (ngModelChange)="filterCatalogue()"
              class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-all min-w-[160px]"
            >
              <option value="">Toutes les catégories</option>
              <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
            </select>
          </ng-container>
        </div>

        <!-- ════════ VUE : TOUTES LES FORMATIONS ════════ -->
        <ng-container *ngIf="catalogView === 'all'">
          <!-- Formations grid -->
          <div
            *ngIf="filteredCatalogue.length > 0"
            class="grid md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            <div
              *ngFor="let f of filteredCatalogue"
              class="glass-card border border-[var(--bridge-border)] overflow-hidden group hover:border-[rgba(198,39,97,0.4)] hover:-translate-y-1 transition-all duration-300"
            >
              <div class="h-2 bg-gradient-to-r from-[#C62761] to-[#F5A623]"></div>
              <div class="p-5">
                <div class="flex items-center justify-between mb-3">
                  <span
                    class="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[rgba(198,39,97,0.1)] text-[#C62761] border border-[rgba(198,39,97,0.2)]"
                  >
                    {{ f.category || 'Général' }}
                  </span>
                  <span
                    *ngIf="isEnrolled(f.id)"
                    class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    >✓ Inscrit</span
                  >
                  <span
                    *ngIf="isPending(f.id)"
                    class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    >⏳ En attente</span
                  >
                </div>
                <h3
                  class="font-syne font-bold text-white text-base leading-tight group-hover:text-[#F5A623] transition-colors"
                >
                  {{ f.nom }}
                </h3>
                <p
                  class="text-[var(--bridge-text-muted)] text-xs mt-2 line-clamp-2 leading-relaxed"
                >
                  {{ f.description }}
                </p>
                <div
                  class="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-[var(--bridge-text-muted)]"
                >
                  <span class="flex items-center gap-1"
                    ><svg
                      class="w-4 h-4 inline-block"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="7" r="3" />
                      <path d="M5 21a7 7 0 0 1 14 0" />
                      <path d="M16 4h4v4" />
                      <path d="M20 4l-4 4" />
                    </svg>
                    {{ f.formateurNom }}</span
                  >
                  <span class="flex items-center gap-1"
                    ><svg
                      class="w-4 h-4 inline-block"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="5" y="4" width="14" height="16" rx="2" />
                      <path d="M9 4V2h6v2" />
                      <line x1="8" y1="9" x2="16" y2="9" />
                      <line x1="8" y1="13" x2="16" y2="13" />
                      <line x1="8" y1="17" x2="13" y2="17" />
                    </svg>
                    {{ f.phases.length }} phase(s)</span
                  >
                </div>
                <div class="flex items-center justify-between mt-4">
                  <div>
                    <span class="text-xs text-[var(--bridge-text-muted)]">Prix total</span>
                    <p class="font-mono font-bold text-[#F5A623] text-lg">
                      {{ f.totalPrice || 0 }}
                      <span class="text-xs text-[var(--bridge-text-muted)]">TND</span>
                    </p>
                  </div>
                  <button
                    *ngIf="!isEnrolled(f.id) && !isPending(f.id)"
                    (click)="openEnrollStepper(f)"
                    class="px-4 py-2 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[rgba(198,39,97,0.2)] cursor-pointer"
                  >
                    S'inscrire →
                  </button>
                  <button
                    *ngIf="isPending(f.id)"
                    disabled
                    class="px-4 py-2 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-xl border border-amber-500/20 cursor-not-allowed"
                  >
                    ⏳ En attente
                  </button>
                  <button
                    *ngIf="isEnrolled(f.id)"
                    (click)="goToFormationDetail(f)"
                    class="px-4 py-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                  >
                    Voir détails →
                  </button>
                </div>
                <p
                  *ngIf="enrollSuccessId === f.id"
                  class="text-[10px] text-emerald-400 mt-2 text-center font-semibold"
                >
                  ✓ Inscription confirmée !
                </p>
                <p *ngIf="enrollErrorId === f.id" class="text-[10px] text-red-400 mt-2 text-center">
                  {{ enrollError }}
                </p>
              </div>
            </div>
          </div>

          <!-- Empty catalogue -->
          <div
            *ngIf="filteredCatalogue.length === 0 && !loadingCatalogue"
            class="glass-card border border-[var(--bridge-border)] p-16 text-center"
          >
            <div class="text-5xl mb-4">
              <svg
                class="w-4 h-4 inline-block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p class="font-syne font-bold text-lg text-white">Aucune formation trouvée</p>
            <p class="text-[var(--bridge-text-muted)] text-sm mt-2">
              Essayez une autre recherche ou catégorie.
            </p>
          </div>

          <!-- Loading skeleton -->
          <div *ngIf="loadingCatalogue" class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            <div
              *ngFor="let _ of [1, 2, 3, 4, 5, 6]"
              class="glass-card border border-[var(--bridge-border)] p-5 animate-pulse"
            >
              <div class="h-2 bg-white/10 rounded mb-4"></div>
              <div class="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-white/5 rounded w-full mb-1"></div>
              <div class="h-3 bg-white/5 rounded w-4/5"></div>
            </div>
          </div>
        </ng-container>

        <!-- ════════ VUE : MES FORMATIONS INSCRITES ════════ -->
        <ng-container *ngIf="catalogView === 'mine'">
          <!-- Empty state -->
          <div
            *ngIf="myFormations.length === 0 && !loadingMine"
            class="glass-card border border-[var(--bridge-border)] p-16 text-center"
          >
            <div class="text-5xl mb-4 animate-bounce">
              <svg
                class="w-5 h-5 inline-block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <p class="font-syne font-bold text-lg text-white">Aucune formation inscrite</p>
            <p class="text-[var(--bridge-text-muted)] text-sm mt-2">
              Parcourez le catalogue et inscrivez-vous.
            </p>
            <button
              (click)="catalogView = 'all'"
              class="mt-6 px-6 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all"
            >
              Voir le catalogue →
            </button>
          </div>

          <!-- Enrolled formations grid -->
          <div *ngIf="myFormations.length > 0" class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            <div
              *ngFor="let f of myFormations"
              class="glass-card border overflow-hidden transition-all duration-300"
              [class]="
                remboursementFormationId === f.id
                  ? 'border-orange-500/40 shadow-lg shadow-orange-500/5'
                  : 'border-[var(--bridge-border)] hover:border-emerald-500/30 hover:-translate-y-1'
              "
            >
              <!-- ── CARD STATE 1: FORMATION DETAILS ── -->
              <ng-container *ngIf="remboursementFormationId !== f.id">
                <div class="h-2 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                <div class="p-5">
                  <!-- Badges -->
                  <div class="flex items-center justify-between mb-3">
                    <span
                      class="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      >✓ Inscrit</span
                    >
                    <span
                      class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[rgba(198,39,97,0.1)] text-[#C62761] border border-[rgba(198,39,97,0.2)]"
                    >
                      {{ f.category || 'Général' }}
                    </span>
                  </div>
                  <!-- Title -->
                  <h3
                    class="font-syne font-bold text-white text-base leading-tight group-hover:text-[#F5A623] transition-colors"
                  >
                    {{ f.nom }}
                  </h3>
                  <p
                    class="text-[var(--bridge-text-muted)] text-xs mt-2 line-clamp-2 leading-relaxed"
                  >
                    {{ f.description }}
                  </p>
                  <!-- Stats -->
                  <div
                    class="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-[var(--bridge-text-muted)]"
                  >
                    <span class="flex items-center gap-1"
                      ><svg
                        class="w-4 h-4 inline-block"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="7" r="3" />
                        <path d="M5 21a7 7 0 0 1 14 0" />
                        <path d="M16 4h4v4" />
                        <path d="M20 4l-4 4" />
                      </svg>
                      {{ f.formateurNom }}</span
                    >
                    <span class="flex items-center gap-1"
                      ><svg
                        class="w-4 h-4 inline-block"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="5" y="4" width="14" height="16" rx="2" />
                        <path d="M9 4V2h6v2" />
                        <line x1="8" y1="9" x2="16" y2="9" />
                        <line x1="8" y1="13" x2="16" y2="13" />
                        <line x1="8" y1="17" x2="13" y2="17" />
                      </svg>
                      {{ f.phases.length }} phase(s)</span
                    >
                  </div>
                  <!-- Progress bar -->
                  <div class="mt-4">
                    <div class="flex items-center justify-between mb-1.5">
                      <span
                        class="text-[10px] text-[var(--bridge-text-muted)] font-semibold uppercase tracking-wider"
                        >Progression</span
                      >
                      <span class="text-[10px] font-mono font-bold text-[#F5A623]"
                        >{{ getFormationProgress(f) }}%</span
                      >
                    </div>
                    <div class="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        class="h-full bg-gradient-to-r from-[#C62761] to-[#F5A623] rounded-full transition-all duration-1000"
                        [style.width]="getFormationProgress(f) + '%'"
                      ></div>
                    </div>
                  </div>
                  <!-- Actions -->
                  <div class="flex items-center gap-2 mt-4">
                    <button
                      (click)="goToFormationDetail(f)"
                      class="flex-1 px-3 py-2 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all text-center shadow-md shadow-[rgba(198,39,97,0.15)]"
                    >
                      Voir détails →
                    </button>
                    <!-- Unenroll -->
                    <div *ngIf="unenrollConfirmId !== f.id">
                      <button
                        (click)="unenrollConfirmId = f.id"
                        title="Se désinscrire"
                        class="px-3 py-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all text-xs font-semibold"
                      >
                        🚪
                      </button>
                    </div>
                    <div *ngIf="unenrollConfirmId === f.id" class="flex items-center gap-1">
                      <span class="text-[10px] text-red-300">Confirmer ?</span>
                      <button
                        (click)="unenrollFormation(f)"
                        [disabled]="unenrollingId === f.id"
                        class="text-[10px] font-bold px-2.5 py-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-all disabled:opacity-50"
                      >
                        {{ unenrollingId === f.id ? '...' : 'Oui' }}
                      </button>
                      <button
                        (click)="unenrollConfirmId = null"
                        class="text-[10px] px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg transition-all"
                      >
                        Non
                      </button>
                    </div>
                    <!-- Remboursement toggle -->
                    <button
                      (click)="toggleRemboursement(f.id)"
                      title="Demande de remboursement"
                      class="px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-orange-400 bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20"
                    >
                      <svg
                        class="w-4 h-4 inline-block"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="9 14 4 9 9 4" />
                        <path d="M4 9h10a6 6 0 0 1 6 6v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              </ng-container>

              <!-- ── CARD STATE 2: DEMANDE DE REMBOURSEMENT ── -->
              <ng-container *ngIf="remboursementFormationId === f.id">
                <div class="h-2 bg-gradient-to-r from-orange-500 via-[#F5A623] to-[#C62761]"></div>
                <div class="p-5 space-y-4 animate-fadein">
                  <!-- Header -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <div
                        class="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-sm font-bold text-orange-400"
                      >
                        <svg
                          class="w-4 h-4 inline-block"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="9 14 4 9 9 4" />
                          <path d="M4 9h10a6 6 0 0 1 6 6v1" />
                        </svg>
                      </div>
                      <div>
                        <h4 class="font-syne font-bold text-white text-sm">
                          Demande de remboursement
                        </h4>
                        <p
                          class="text-[10px] text-[var(--bridge-text-muted)] truncate max-w-[180px]"
                        >
                          {{ f.nom }}
                        </p>
                      </div>
                    </div>
                    <button
                      (click)="toggleRemboursement(null)"
                      class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center text-xs transition-all border border-white/5"
                    >
                      <svg
                        class="w-4 h-4 inline-block"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="6" y1="6" x2="18" y2="18" />
                        <line x1="18" y1="6" x2="6" y2="18" />
                      </svg>
                    </button>
                  </div>

                  <!-- Success state -->
                  <div
                    *ngIf="remboursementSuccess === f.id"
                    class="py-6 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1"
                  >
                    <span class="text-2xl"
                      ><svg
                        class="w-5 h-5 inline-block"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <polyline points="8 12 11 15 16 9" /></svg
                    ></span>
                    <p class="text-emerald-400 font-bold text-xs">Demande envoyée !</p>
                    <p class="text-[10px] text-emerald-300/70">
                      Un responsable étudiera votre dossier sous 48h.
                    </p>
                  </div>

                  <!-- Form view -->
                  <ng-container *ngIf="remboursementSuccess !== f.id">
                    <!-- Motif input -->
                    <div>
                      <label
                        class="block text-[10px] font-bold uppercase tracking-wider text-[var(--bridge-text-muted)] mb-1.5"
                      >
                        Motif de la demande <span class="text-red-400">*</span>
                      </label>
                      <textarea
                        [(ngModel)]="remboursementMotif"
                        rows="3"
                        placeholder="Raison de votre demande (ex: indisponibilité, changement de projet...)"
                        class="w-full bg-white/5 border border-white/10 focus:border-[#F5A623] rounded-xl p-3 text-xs text-white placeholder-white/20 focus:outline-none transition-all resize-none"
                      ></textarea>
                    </div>

                    <!-- Notice alert -->
                    <div
                      class="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-2"
                    >
                      <span class="text-orange-400 text-xs mt-0.5"
                        ><svg
                          class="w-4 h-4 inline-block"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <line x1="12" y1="10" x2="12" y2="16" />
                          <circle cx="12" cy="7" r=".8" fill="currentColor" stroke="none" /></svg
                      ></span>
                      <p class="text-[10px] text-orange-200/80 leading-tight">
                        Sous réserve d'éligibilité. Le remboursement n'est possible que si aucune
                        phase n'a été complétée.
                      </p>
                    </div>

                    <!-- Confirm checkbox -->
                    <label class="flex items-start gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        [(ngModel)]="remboursementConfirm"
                        class="mt-0.5 accent-[#F5A623]"
                      />
                      <span
                        class="text-[10px] text-[var(--bridge-text-muted)] group-hover:text-white transition-colors leading-tight"
                      >
                        Je confirme vouloir initier la demande de désinscription et de
                        remboursement.
                      </span>
                    </label>

                    <!-- Buttons -->
                    <div class="flex items-center gap-2 pt-1">
                      <button
                        (click)="toggleRemboursement(null)"
                        class="flex-1 py-2 text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                      >
                        Annuler
                      </button>
                      <button
                        (click)="submitRemboursement(f)"
                        [disabled]="
                          !remboursementMotif.trim() ||
                          !remboursementConfirm ||
                          remboursementSubmitting
                        "
                        class="flex-1 py-2 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[rgba(198,39,97,0.2)]"
                      >
                        <span
                          *ngIf="remboursementSubmitting"
                          class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
                        ></span>
                        {{ remboursementSubmitting ? 'Envoi...' : 'Envoyer' }}
                      </button>
                    </div>
                  </ng-container>
                </div>
              </ng-container>
            </div>
          </div>
        </ng-container>

        <style>
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-8px);
              max-height: 0;
            }
            to {
              opacity: 1;
              transform: translateY(0);
              max-height: 600px;
            }
          }
        </style>
      </div>

      <!-- ═══════════════════════════════ TAB: MES FORMATIONS ═══════════════════════════════ -->
      <div *ngIf="activeTab === 'mes-formations'" class="space-y-6">
        <!-- Empty state -->
        <div
          *ngIf="myFormations.length === 0 && !loadingMine"
          class="glass-card border border-[var(--bridge-border)] p-16 text-center"
        >
          <div class="text-5xl mb-4 animate-bounce">
            <svg
              class="w-5 h-5 inline-block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <p class="font-syne font-bold text-lg text-white">Aucune formation en cours</p>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-2">
            Parcourez le catalogue et inscrivez-vous à votre première formation.
          </p>
          <button
            (click)="setActiveTab('catalogue')"
            class="mt-6 px-6 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all"
          >
            Voir le catalogue →
          </button>
        </div>

        <!-- Loading -->
        <div *ngIf="loadingMine" class="space-y-4">
          <div
            *ngFor="let _ of [1, 2]"
            class="glass-card border border-[var(--bridge-border)] p-6 animate-pulse"
          >
            <div class="h-5 bg-white/10 rounded w-1/3 mb-4"></div>
            <div class="h-3 bg-white/5 rounded w-full mb-2"></div>
            <div class="h-3 bg-white/5 rounded w-3/4"></div>
          </div>
        </div>

        <!-- Formation cards -->
        <div
          *ngFor="let f of myFormations"
          class="glass-card border border-[var(--bridge-border)] overflow-hidden"
        >
          <!-- Card header -->
          <div class="flex items-center justify-between p-6 border-b border-[var(--bridge-border)]">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xl shadow-lg flex-shrink-0"
              >
                <svg
                  class="w-5 h-5 inline-block"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div>
                <h3 class="font-syne font-bold text-white text-lg">{{ f.nom }}</h3>
                <p class="text-[var(--bridge-text-muted)] text-sm">{{ f.formateurNom }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span
                class="text-[10px] font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                >ACTIF</span
              >
              <button
                (click)="goToFormationDetail(f)"
                class="text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white rounded-lg hover:opacity-90 transition-all"
              >
                Détails →
              </button>
              <!-- Unenroll -->
              <button
                *ngIf="unenrollConfirmId !== f.id"
                (click)="unenrollConfirmId = f.id"
                class="text-xs font-semibold px-3 py-1.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
              >
                Se désinscrire
              </button>
              <div *ngIf="unenrollConfirmId === f.id" class="flex items-center gap-2">
                <span class="text-xs text-red-300">Confirmer ?</span>
                <button
                  (click)="unenrollFormation(f)"
                  [disabled]="unenrollingId === f.id"
                  class="text-xs font-bold px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  {{ unenrollingId === f.id ? '...' : 'Oui' }}
                </button>
                <button
                  (click)="unenrollConfirmId = null"
                  class="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg transition-all"
                >
                  Non
                </button>
              </div>
            </div>
          </div>

          <!-- Overall progress bar -->
          <div class="px-6 pt-5">
            <div class="flex items-center justify-between mb-2">
              <span
                class="text-xs text-[var(--bridge-text-muted)] font-semibold uppercase tracking-wider"
                >Progression globale</span
              >
              <span class="font-mono text-xs font-bold text-[#F5A623]"
                >{{ getFormationProgress(f) }}%</span
              >
            </div>
            <div class="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-[#C62761] to-[#F5A623] rounded-full transition-all duration-1000"
                [style.width]="getFormationProgress(f) + '%'"
              ></div>
            </div>
          </div>

          <!-- Phases timeline -->
          <div class="p-6 space-y-4">
            <div *ngFor="let phase of f.phases; let i = index" class="relative">
              <!-- Connector line -->
              <div
                *ngIf="i < f.phases.length - 1"
                class="absolute left-5 top-10 w-0.5 h-full bg-white/10 z-0"
              ></div>
              <div class="flex items-start gap-4 relative z-10">
                <!-- Status dot -->
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold border-2 shadow-lg"
                  [class]="
                    phase.status === 'COMPLETEE'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-500/20'
                      : phase.status === 'EN_COURS'
                        ? 'bg-[rgba(198,39,97,0.2)] text-[#C62761] border-[rgba(198,39,97,0.5)] shadow-[rgba(198,39,97,0.2)] animate-pulse'
                        : 'bg-white/5 text-white/30 border-white/10'
                  "
                >
                  {{
                    phase.status === 'COMPLETEE' ? '✓' : phase.status === 'EN_COURS' ? '▶' : '🔒'
                  }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <p
                      class="text-sm font-bold"
                      [class]="phase.status === 'VERROUILLEE' ? 'text-white/30' : 'text-white'"
                    >
                      Phase {{ phase.numero }} — {{ phase.nom }}
                    </p>
                    <span
                      class="text-xs font-mono"
                      [class]="
                        phase.status === 'COMPLETEE'
                          ? 'text-emerald-400'
                          : 'text-[var(--bridge-text-muted)]'
                      "
                    >
                      {{ phase.status !== 'VERROUILLEE' ? phase.progression + '%' : '' }}
                    </span>
                  </div>
                  <p class="text-xs text-[var(--bridge-text-muted)] leading-relaxed">
                    {{ phase.description }}
                  </p>
                  <!-- Phase progress bar -->
                  <div
                    class="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden"
                    *ngIf="phase.status !== 'VERROUILLEE'"
                  >
                    <div
                      class="h-full rounded-full transition-all duration-1000"
                      [class]="
                        phase.status === 'COMPLETEE'
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-[#C62761] to-[#F5A623]'
                      "
                      [style.width]="phase.progression + '%'"
                    ></div>
                  </div>
                  <!-- Sessions count -->
                  <div
                    class="flex items-center gap-4 mt-2 text-[10px] text-[var(--bridge-text-muted)]"
                    *ngIf="phase.status !== 'VERROUILLEE'"
                  >
                    <span
                      ><svg
                        class="w-4 h-4 inline-block"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="3" y="4" width="18" height="17" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {{ phase.seances.length }} séances</span
                    >
                    <span
                      *ngIf="phase.status === 'COMPLETEE'"
                      class="text-emerald-400 font-semibold"
                      >✓ Phase complétée</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Upcoming sessions of this formation -->
          <div
            class="border-t border-[var(--bridge-border)] p-6"
            *ngIf="getUpcomingForFormation(f).length > 0"
          >
            <h4
              class="text-xs font-bold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-3"
            >
              Prochaines séances
            </h4>
            <div class="space-y-2">
              <div
                *ngFor="let s of getUpcomingForFormation(f)"
                class="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div class="text-center w-10">
                  <div class="text-[10px] font-bold uppercase text-[#F5A623]">
                    {{ formatDay(s.date) }}
                  </div>
                  <div class="text-lg font-mono font-bold text-white">
                    {{ formatDayNum(s.date) }}
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-white">{{ s.heureDebut }}</p>
                  <p class="text-xs text-[var(--bridge-text-muted)]">
                    {{ s.salle || (s.type === 'EN_LIGNE' ? 'En ligne' : 'Salle non définie') }}
                  </p>
                </div>
                <span
                  class="text-[10px] px-2 py-1 rounded-full border"
                  [class]="
                    s.type === 'EN_LIGNE'
                      ? 'text-blue-400 border-blue-400/30 bg-blue-400/10'
                      : 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
                  "
                >
                  {{ s.type === 'EN_LIGNE' ? '🌐' : '🏫' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════ TAB: PAIEMENTS ═══════════════════════════════ -->
      <div *ngIf="activeTab === 'paiements'" id="payments-section" class="space-y-6">
        <!-- Summary bar -->
        <div class="grid grid-cols-3 gap-4">
          <div class="glass-card border border-emerald-500/20 p-4 text-center">
            <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider mb-1">
              Payés
            </p>
            <p class="text-2xl font-mono font-bold text-emerald-400">{{ paidPaymentsCount }}</p>
            <p class="text-xs text-emerald-400/70 font-mono mt-1">{{ getTotalPaid() }} TND</p>
          </div>
          <div class="glass-card border border-orange-500/20 p-4 text-center">
            <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider mb-1">
              En attente
            </p>
            <p class="text-2xl font-mono font-bold text-[#F5A623]">{{ pendingPaymentsCount }}</p>
            <p class="text-xs text-[#F5A623]/70 font-mono mt-1">{{ getTotalPending() }} TND</p>
          </div>
          <div class="glass-card border border-red-500/20 p-4 text-center">
            <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider mb-1">
              En retard
            </p>
            <p class="text-2xl font-mono font-bold text-red-400">{{ retardCount }}</p>
            <p class="text-xs text-red-400/70 font-mono mt-1">{{ getTotalLate() }} TND</p>
          </div>
        </div>

        <!-- Payment timeline -->
        <div class="glass-card border border-[var(--bridge-border)] overflow-hidden">
          <div class="p-6 border-b border-[var(--bridge-border)] flex items-center justify-between">
            <h3 class="font-syne font-bold text-lg">
              <svg
                class="w-5 h-5 inline-block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path
                  d="M15 8.5c-.7-.7-1.7-1.1-3-1.1-1.8 0-3 .9-3 2.1s1.2 2 3 2.4 3 1.2 3 2.4-1.2 2.1-3 2.1c-1.3 0-2.4-.4-3.1-1.1"
                />
                <line x1="12" y1="6" x2="12" y2="18" />
              </svg>
              Historique des Paiements
            </h3>
            <span class="text-xs text-[var(--bridge-text-muted)]"
              >{{ paiements.length }} transaction(s)</span
            >
          </div>

          <div *ngIf="paiements.length === 0" class="p-12 text-center">
            <div class="text-4xl mb-3">
              <svg
                class="w-5 h-5 inline-block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
                <line x1="6" y1="15" x2="9" y2="15" />
              </svg>
            </div>
            <p class="text-[var(--bridge-text-muted)] text-sm">Aucun paiement enregistré</p>
          </div>

          <div class="divide-y divide-white/[0.03]">
            <div
              *ngFor="let p of paiements"
              class="flex items-center gap-5 px-6 py-4 hover:bg-white/[0.02] transition-colors"
              [class]="
                p.status === 'EN_RETARD' ? 'bg-red-500/[0.03] border-l-2 border-red-500/50' : ''
              "
            >
              <!-- Status Icon -->
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                [class]="
                  p.status === 'PAYE'
                    ? 'bg-emerald-500/15 border border-emerald-500/20'
                    : p.status === 'EN_RETARD'
                      ? 'bg-red-500/15 border border-red-500/20 animate-pulse'
                      : 'bg-orange-500/15 border border-orange-500/20'
                "
              >
                {{ p.status === 'PAYE' ? '✅' : p.status === 'EN_RETARD' ? '⚠️' : '⏳' }}
              </div>
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-white">Phase {{ p.phaseNumero }}</p>
                <div class="flex items-center gap-3 mt-0.5">
                  <p class="text-xs text-[var(--bridge-text-muted)] font-mono">
                    {{ p.datePaiement ? (p.datePaiement | date: 'dd/MM/yyyy') : 'Non payé' }}
                  </p>
                  <span class="text-[10px] text-[var(--bridge-text-muted)]">•</span>
                  <p class="text-xs text-[var(--bridge-text-muted)]">{{ p.methode || '—' }}</p>
                </div>
                <!-- Due date warning -->
                <p
                  *ngIf="p.status !== 'PAYE'"
                  class="text-[10px] mt-0.5"
                  [class]="p.status === 'EN_RETARD' ? 'text-red-400' : 'text-orange-400'"
                >
                  Échéance : {{ p.dateEcheance | date: 'dd/MM/yyyy' }}
                  <span *ngIf="getDaysUntilDue(p.dateEcheance) >= 0">
                    — {{ getDaysUntilDue(p.dateEcheance) }} jrs restants</span
                  >
                  <span *ngIf="getDaysUntilDue(p.dateEcheance) < 0">
                    — {{ -getDaysUntilDue(p.dateEcheance) }} jrs de retard</span
                  >
                </p>
              </div>
              <!-- Amount & Action -->
              <div class="text-right flex-shrink-0 flex flex-col items-end gap-2">
                <p class="font-mono font-bold text-white text-base">
                  {{ p.montant }} <span class="text-xs text-[var(--bridge-text-muted)]">TND</span>
                </p>
                <div class="flex items-center gap-2">
                  <button
                    *ngIf="p.status !== 'PAYE'"
                    (click)="payWithStripe(p)"
                    [disabled]="loadingStripePaiementId === p.id"
                    class="px-3 py-1 rounded-xl bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1 shadow-md disabled:opacity-50"
                  >
                    <span
                      *ngIf="loadingStripePaiementId === p.id"
                      class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
                    ></span>
                    <svg
                      class="w-5 h-5 inline-block"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                      <line x1="6" y1="15" x2="9" y2="15" />
                    </svg>
                    {{ loadingStripePaiementId === p.id ? 'Chargement...' : 'Payer Stripe' }}
                  </button>
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase inline-block"
                    [class]="
                      p.status === 'PAYE'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : p.status === 'EN_RETARD'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-orange-500/10 text-orange-400'
                    "
                  >
                    {{
                      p.status === 'PAYE' ? 'Payé' : p.status === 'EN_RETARD' ? 'Retard' : 'Attente'
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════ TAB: CERTIFICATS ═══════════════════════════════ -->
      <div *ngIf="activeTab === 'certificats'" class="space-y-6">
        <!-- Empty state -->
        <div
          *ngIf="certificats.length === 0"
          class="glass-card border border-[var(--bridge-border)] p-16 text-center"
        >
          <div class="text-6xl mb-4">
            <svg
              class="w-5 h-5 inline-block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M8 21h8" />
              <path d="M12 17v4" />
              <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
              <path d="M7 6H4v2a4 4 0 0 0 4 4" />
              <path d="M17 6h3v2a4 4 0 0 1-4 4" />
            </svg>
          </div>
          <p class="font-syne font-bold text-xl text-white">Pas encore de certificat</p>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-2 max-w-sm mx-auto">
            Complétez vos phases de formation avec 75%+ d'assiduité et de bonnes évaluations pour
            obtenir vos certificats blockchain.
          </p>
        </div>

        <!-- Certificates grid -->
        <div class="grid md:grid-cols-2 gap-6" *ngIf="certificats.length > 0">
          <div
            *ngFor="let cert of certificats"
            class="relative glass-card border border-[rgba(198,39,97,0.3)] overflow-hidden group hover:border-[rgba(245,166,35,0.4)] hover:-translate-y-1 transition-all duration-300"
          >
            <!-- Background glow -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-[rgba(198,39,97,0.05)] via-transparent to-[rgba(245,166,35,0.05)] pointer-events-none"
            ></div>
            <!-- Top bar -->
            <div
              class="h-1 bg-gradient-to-r from-[#C62761] via-[#F5A623] to-[#C62761] bg-size-200 animate-gradient"
            ></div>
            <div class="p-6">
              <!-- Header -->
              <div class="flex items-start justify-between mb-4">
                <div
                  class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[rgba(198,39,97,0.2)] to-[rgba(245,166,35,0.2)] border border-[rgba(198,39,97,0.3)] flex items-center justify-center text-3xl shadow-lg"
                >
                  <svg
                    class="w-5 h-5 inline-block"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M8 21h8" />
                    <path d="M12 17v4" />
                    <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
                    <path d="M7 6H4v2a4 4 0 0 0 4 4" />
                    <path d="M17 6h3v2a4 4 0 0 1-4 4" />
                  </svg>
                </div>
                <div class="text-right">
                  <span
                    class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"
                  >
                    <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    Vérifié Blockchain
                  </span>
                </div>
              </div>
              <!-- Content -->
              <h3 class="font-syne font-bold text-white text-lg leading-tight">
                {{ cert.phaseNom }}
              </h3>
              <p class="text-[var(--bridge-text-muted)] text-sm mt-1">{{ cert.formationNom }}</p>
              <!-- Issue date -->
              <div class="flex items-center gap-2 mt-4">
                <span class="text-[#F5A623] text-sm"
                  ><svg
                    class="w-4 h-4 inline-block"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="17" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" /></svg
                ></span>
                <span class="font-mono text-xs text-[var(--bridge-text-muted)]"
                  >Émis le {{ cert.dateObtention | date: 'dd MMMM yyyy' : '' : 'fr' }}</span
                >
              </div>
              <!-- Blockchain hash -->
              <div class="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <p
                  class="text-[10px] text-[var(--bridge-text-muted)] font-semibold uppercase tracking-wider mb-1"
                >
                  Hash Blockchain
                </p>
                <p class="font-mono text-[10px] text-[#F5A623] truncate">
                  {{ cert.hashBlockchain || 'N/A' }}
                </p>
              </div>
              <!-- Actions -->
              <div class="flex gap-3 mt-5">
                <a
                  *ngIf="cert.pdfUrl"
                  [href]="cert.pdfUrl"
                  target="_blank"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-xs font-semibold rounded-xl transition-all"
                >
                  <svg
                    class="w-4 h-4 inline-block"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Télécharger PDF
                </a>
                <button
                  (click)="openCertificateVerif(cert)"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[rgba(198,39,97,0.15)] to-[rgba(245,166,35,0.1)] hover:from-[rgba(198,39,97,0.25)] hover:to-[rgba(245,166,35,0.2)] border border-[rgba(198,39,97,0.3)] text-[#C62761] text-xs font-semibold rounded-xl transition-all"
                >
                  <svg
                    class="w-4 h-4 inline-block"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" />
                    <path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15" />
                  </svg>
                  Vérifier
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── Inline : Certificat Vérifié ─── -->
        <div *ngIf="selectedCertForVerif" class="bridge-card overflow-hidden inline-view-card">
          <div class="h-1 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
          <!-- Header -->
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-[var(--bridge-border)]"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-base"
              >
                <svg
                  class="w-4 h-4 inline-block"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" />
                  <path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15" />
                </svg>
              </div>
              <div>
                <h3 class="font-syne font-bold text-sm text-white">Certificat Vérifié</h3>
                <p class="text-[10px] text-white/40 mt-0.5">Authentifié sur la Blockchain</p>
              </div>
            </div>
            <button
              (click)="selectedCertForVerif = null"
              class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/5 text-sm"
            >
              <svg
                class="w-4 h-4 inline-block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>
          <!-- Content -->
          <div class="p-5 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <!-- Formation info -->
              <div class="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p class="text-[10px] text-white/40 uppercase tracking-wider mb-1">Formation</p>
                <p class="text-sm font-semibold text-white">{{ selectedCertForVerif.phaseNom }}</p>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                  {{ selectedCertForVerif.formationNom }}
                </p>
              </div>
              <!-- Issue date -->
              <div class="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p class="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                  Date d'émission
                </p>
                <p class="text-sm text-white font-semibold">
                  {{ selectedCertForVerif.dateObtention | date: 'dd MMMM yyyy' }}
                </p>
              </div>
            </div>
            <!-- Blockchain hash -->
            <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div class="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Authentifié sur la Blockchain
              </div>
              <p class="font-mono text-xs text-emerald-300/70 break-all leading-relaxed">
                {{ selectedCertForVerif.hashBlockchain }}
              </p>
            </div>
          </div>
          <!-- Footer -->
          <div class="px-5 py-4 border-t border-[var(--bridge-border)] flex justify-end">
            <button
              (click)="selectedCertForVerif = null"
              class="px-6 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════ TAB: PRÉSENCE & ÉVALUATION ═══════════════════════════════ -->
      <div *ngIf="activeTab === 'presence'" class="space-y-6">
        <!-- Global attendance stat -->
        <div class="glass-card border border-[var(--bridge-border)] p-6 space-y-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-syne font-bold text-lg">
              <svg
                class="w-5 h-5 inline-block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <line x1="4" y1="19" x2="4" y2="10" />
                <line x1="10" y1="19" x2="10" y2="4" />
                <line x1="16" y1="19" x2="16" y2="13" />
                <line x1="22" y1="19" x2="22" y2="7" />
              </svg>
              Analyse de Présence & Progression
            </h3>
            <span
              class="font-mono text-2xl font-black"
              [class]="attendanceRate >= 75 ? 'text-emerald-400' : 'text-red-400'"
              >{{ attendanceRate }}%</span
            >
          </div>

          <div class="h-64 relative">
            <canvas #stagiairePresenceChart></canvas>
          </div>

          <div class="h-3 rounded-full bg-white/5 overflow-hidden mb-2">
            <div
              class="h-full rounded-full transition-all duration-1000"
              [class]="
                attendanceRate >= 75
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-red-500 to-orange-500'
              "
              [style.width]="attendanceRate + '%'"
            ></div>
          </div>
          <div class="flex items-center justify-between text-xs text-[var(--bridge-text-muted)]">
            <span>Minimum requis : 75%</span>
            <span
              [class]="
                attendanceRate >= 75
                  ? 'text-emerald-400 font-semibold'
                  : 'text-red-400 font-semibold'
              "
            >
              {{ attendanceRate >= 75 ? '✓ Éligible aux certificats' : '⚠ Seuil non atteint' }}
            </span>
          </div>
        </div>

        <!-- Per formation breakdown -->

        <div
          *ngFor="let f of myFormations"
          class="glass-card border border-[var(--bridge-border)] overflow-hidden"
        >
          <div class="p-5 border-b border-[var(--bridge-border)] flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-base flex-shrink-0"
            >
              <svg
                class="w-5 h-5 inline-block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div>
              <h4 class="font-syne font-bold text-white text-base">{{ f.nom }}</h4>
              <p class="text-xs text-[var(--bridge-text-muted)]">{{ f.formateurNom }}</p>
            </div>
          </div>

          <!-- Sessions attendance detail -->
          <div class="p-5">
            <div *ngFor="let phase of f.phases" class="mb-6 last:mb-0">
              <div class="flex items-center justify-between mb-3">
                <h5 class="text-sm font-bold text-white">
                  Phase {{ phase.numero }} — {{ phase.nom }}
                </h5>
                <span class="text-xs font-mono text-[#F5A623]">{{ phase.progression }}%</span>
              </div>

              <div class="space-y-2" *ngIf="phase.seances && phase.seances.length > 0">
                <div
                  *ngFor="let seance of phase.seances"
                  class="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <!-- Date -->
                  <div class="w-14 text-center flex-shrink-0">
                    <div class="text-[10px] font-bold uppercase text-[#F5A623]">
                      {{ formatDay(seance.date) }}
                    </div>
                    <div class="text-lg font-mono font-bold text-white">
                      {{ formatDayNum(seance.date) }}
                    </div>
                  </div>
                  <!-- Session info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-semibold text-white">{{ seance.heureDebut || '—' }}</p>
                      <span
                        class="text-[10px] px-2 py-0.5 rounded-full border"
                        [class]="
                          seance.type === 'EN_LIGNE'
                            ? 'text-blue-400 border-blue-400/30 bg-blue-400/10'
                            : 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
                        "
                      >
                        {{ seance.type === 'EN_LIGNE' ? '🌐' : '🏫' }}
                      </span>
                    </div>
                    <!-- My presence for this session -->
                    <div class="flex items-center gap-4 mt-2" *ngIf="getMyPresence(seance) as pres">
                      <!-- Present/Absent -->
                      <span
                        class="text-xs font-bold px-2 py-0.5 rounded-full"
                        [class]="
                          pres.present
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        "
                      >
                        {{ pres.present ? '✓ Présent' : '✗ Absent' }}
                      </span>
                      <!-- Star rating -->
                      <div *ngIf="pres.starRating" class="flex items-center gap-1">
                        <span
                          *ngFor="let star of [1, 2, 3, 4, 5]"
                          class="text-sm"
                          [class]="
                            star <= (pres.starRating || 0) ? 'text-[#F5A623]' : 'text-white/20'
                          "
                          >★</span
                        >
                        <span class="text-xs text-[var(--bridge-text-muted)] ml-1"
                          >{{ pres.starRating }}/5</span
                        >
                      </div>
                      <!-- Note -->
                      <p
                        *ngIf="pres.sessionNote"
                        class="text-xs text-[var(--bridge-text-muted)] italic truncate max-w-xs"
                      >
                        "{{ pres.sessionNote }}"
                      </p>
                    </div>
                    <!-- No record yet -->
                    <p *ngIf="!getMyPresence(seance)" class="text-xs text-white/30 mt-1 italic">
                      Non enregistrée
                    </p>
                  </div>
                </div>
              </div>

              <div
                *ngIf="!phase.seances || phase.seances.length === 0"
                class="text-xs text-white/30 italic py-2"
              >
                Aucune séance pour cette phase.
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div
          *ngIf="myFormations.length === 0 && !loadingMine"
          class="glass-card border border-[var(--bridge-border)] p-12 text-center"
        >
          <div class="text-4xl mb-3">
            <svg
              class="w-4 h-4 inline-block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="5" y="4" width="14" height="16" rx="2" />
              <path d="M9 4V2h6v2" />
              <line x1="8" y1="9" x2="16" y2="9" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="13" y2="17" />
            </svg>
          </div>
          <p class="text-[var(--bridge-text-muted)] text-sm">
            Aucune donnée de présence disponible.
          </p>
        </div>
      </div>

      <!-- ═══════════════════════════════ TAB: NOTIFICATIONS ═══════════════════════════════ -->
      <div *ngIf="activeTab === 'notifications'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-syne font-bold text-xl text-white">
            <svg
              class="w-4 h-4 inline-block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
            Mes Notifications
          </h3>
          <button
            *ngIf="unreadCount > 0"
            (click)="markAllRead()"
            class="text-xs px-4 py-2 rounded-xl border border-[rgba(198,39,97,0.3)] text-[#C62761] hover:bg-[rgba(198,39,97,0.1)] transition-all font-semibold"
          >
            ✓ Tout marquer lu
          </button>
        </div>

        <div
          *ngIf="allNotifications.length === 0"
          class="glass-card border border-[var(--bridge-border)] p-12 text-center"
        >
          <div class="text-4xl mb-3">
            <svg
              class="w-4 h-4 inline-block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>
          </div>
          <p class="text-[var(--bridge-text-muted)] text-sm">Aucune notification</p>
        </div>

        <div class="space-y-2">
          <div
            *ngFor="let notif of allNotifications"
            class="flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer hover:bg-white/[0.02]"
            [class]="
              notif.read
                ? 'border-white/5 bg-white/[0.01]'
                : 'border-[rgba(198,39,97,0.2)] bg-[rgba(198,39,97,0.03)]'
            "
            (click)="markNotifRead(notif.id)"
          >
            <!-- Icon -->
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              [class]="
                notif.read
                  ? 'bg-white/5'
                  : 'bg-[rgba(198,39,97,0.1)] border border-[rgba(198,39,97,0.2)]'
              "
            >
              {{ getNotifIcon(notif.type) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-semibold text-white truncate">{{ notif.title }}</p>
                <span class="text-[10px] font-mono text-white/30 flex-shrink-0">{{
                  timeAgo(notif.timestamp)
                }}</span>
              </div>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-1 leading-relaxed line-clamp-2">
                {{ notif.body }}
              </p>
            </div>
            <div
              *ngIf="!notif.read"
              class="w-2.5 h-2.5 rounded-full bg-[#C62761] flex-shrink-0 mt-1.5"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ ENROLLMENT STEPPER MODAL ═══ -->
    <app-enrollment-stepper
      *ngIf="showStepper && stepperFormation"
      [formation]="stepperFormation!"
      [user]="user"
      (closed)="closeStepper()"
      (enrolled)="onEnrollmentComplete($event)"
    ></app-enrollment-stepper>
  `,
})
export class StagiaireOverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stagiairePresenceChart') presenceCanvas!: ElementRef<HTMLCanvasElement>;
  private presenceChartInstance?: Chart;

  user: User | null = null;
  activeTab = 'catalogue';

  // Catalogue view toggle
  catalogView: 'all' | 'mine' = 'all';

  // Remboursement inline form state
  remboursementFormationId: string | null = null;
  remboursementMotif = '';
  remboursementConfirm = false;
  remboursementSubmitting = false;
  remboursementSuccess: string | null = null;

  tabs = [
    { key: 'catalogue', icon: '🔎', label: 'Formations' },
    { key: 'paiements', icon: '💳', label: 'Paiements' },
    { key: 'certificats', icon: '🏆', label: 'Certificats' },
    { key: 'presence', icon: '📋', label: 'Présence & Éval.' },
    { key: 'notifications', icon: '🔔', label: 'Notifications' },
  ];

  // Catalogue
  allFormations: Formation[] = [];
  filteredCatalogue: Formation[] = [];
  catalogSearch = '';
  catalogCategory = '';
  categories: string[] = [];
  loadingCatalogue = true;

  // My formations
  myFormations: Formation[] = [];
  enrolledIds: Set<string> = new Set();
  pendingIds: Set<string> = new Set();
  loadingMine = true;

  // Enrollment stepper
  showStepper = false;
  stepperFormation: Formation | null = null;

  // Upcoming sessions
  upcomingSeances: Seance[] = [];

  // Payments
  paiements: Paiement[] = [];
  retardCount = 0;
  urgentPayments: Paiement[] = [];
  loadingStripePaiementId: string | null = null;

  payWithStripe(paiement: Paiement): void {
    if (!paiement) return;
    this.loadingStripePaiementId = paiement.id;

    const phaseId = Number(paiement.phaseNumero) || 1;
    const enrollmentId = Number(paiement.id) || 1;

    localStorage.setItem('pending_stripe_enrollment_id', enrollmentId.toString());
    localStorage.setItem('pending_stripe_phase_id', phaseId.toString());

    this.paiementService
      .initiateStripePayment({
        enrollmentId: enrollmentId,
        phaseId: phaseId,
        amount: paiement.montant,
      })
      .subscribe({
        next: (res: any) => {
          this.loadingStripePaiementId = null;
          if (res && res.url) {
            window.location.href = res.url;
          } else {
            this.toastService.error(
              "Impossible d'obtenir le lien de paiement Stripe.",
              'Paiement Stripe',
            );
          }
        },
        error: (err: any) => {
          this.loadingStripePaiementId = null;
          this.toastService.error(
            err?.error?.message || 'Erreur lors de la connexion avec Stripe.',
            'Paiement Stripe',
          );
        },
      });
  }

  getPaiementsCompletionRate(): string {
    if (this.paiements.length === 0) return '100%';
    const paid = this.paidPaymentsCount;
    return `${Math.round((paid / this.paiements.length) * 100)}%`;
  }

  constructor(
    private authService: AuthService,
    private formationService: FormationService,
    private paiementService: PaiementService,
    private certificatService: CertificatService,
    private notificationService: NotificationService,
    private enrollmentService: EnrollmentService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  // Certificates
  certificats: Certificat[] = [];
  selectedCertForVerif: Certificat | null = null;

  // Notifications
  allNotifications: Notification[] = [];
  unreadCount = 0;

  // Stats
  attendanceRate = 0;

  // Enrollment state
  enrollingId: string | null = null;
  enrollSuccessId: string | null = null;
  enrollErrorId: string | null = null;
  enrollError = '';
  unenrollConfirmId: string | null = null;
  unenrollingId: string | null = null;

  today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  private sub = new Subscription();

  get activeFormationsCount(): number {
    return this.myFormations.length;
  }

  get paidPaymentsCount(): number {
    return this.paiements ? this.paiements.filter((p) => p.status === 'PAYE').length : 0;
  }

  get pendingPaymentsCount(): number {
    return this.paiements ? this.paiements.filter((p) => p.status === 'EN_ATTENTE').length : 0;
  }

  get paymentProgressPercentage(): string {
    if (!this.paiements || this.paiements.length === 0) return '0%';
    const paid = this.paidPaymentsCount;
    return `${Math.round((paid / this.paiements.length) * 100)}%`;
  }

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) return;

    this.sub.add(
      this.router.events.subscribe(() => {
        this.syncTabWithUrl();
      }),
    );
    this.syncTabWithUrl();

    // Load catalogue (all formations)
    this.sub.add(
      this.formationService.getFormations().subscribe({
        next: (data) => {
          this.allFormations = data;
          this.categories = [...new Set(data.map((f) => f.category || 'Général').filter(Boolean))];
          this.filterCatalogue();
          this.loadingCatalogue = false;
        },
        error: () => {
          this.loadingCatalogue = false;
        },
      }),
    );

    // Load my formations
    this.sub.add(
      this.formationService.getFormationsByStagiaire(this.user.id).subscribe({
        next: (data) => {
          this.myFormations = data;
          this.enrolledIds = new Set(data.map((f) => f.id));
          // Calculate attendance rate
          let totalSessions = 0,
            presentSessions = 0;
          data.forEach((f) => {
            f.phases?.forEach((p) => {
              p.seances?.forEach((s) => {
                s.presences?.forEach((pr) => {
                  if (pr.stagiaireId === this.user?.id) {
                    totalSessions++;
                    if (pr.present) presentSessions++;
                  }
                });
              });
            });
          });
          if (totalSessions > 0) {
            this.attendanceRate = Math.round((presentSessions / totalSessions) * 100);
          } else {
            // fallback: average of phase progression
            const allPhases = data.flatMap((f) => f.phases || []);
            if (allPhases.length > 0) {
              this.attendanceRate = Math.round(
                allPhases.reduce((s, p) => s + (p.progression || 0), 0) / allPhases.length,
              );
            }
          }
          this.loadingMine = false;
        },
        error: () => {
          this.loadingMine = false;
        },
      }),
    );

    // Load upcoming sessions
    this.sub.add(
      this.formationService.getUpcomingSeances().subscribe({
        next: (data) => {
          this.upcomingSeances = data;
        },
        error: () => {},
      }),
    );

    // Load payments
    this.sub.add(
      this.paiementService.getPaiementsByStagiaire(this.user.id).subscribe({
        next: (data) => {
          this.paiements = data.sort(
            (a, b) => new Date(b.dateEcheance).getTime() - new Date(a.dateEcheance).getTime(),
          );
          this.retardCount = data.filter((p) => p.status === 'EN_RETARD').length;
          // Payments due in 10 days or less & not paid
          const now = new Date();
          this.urgentPayments = data.filter((p) => {
            if (p.status === 'PAYE') return false;
            const days = this.getDaysUntilDue(p.dateEcheance);
            return days >= 0 && days <= 10;
          });
        },
        error: () => {},
      }),
    );

    // Load certificates
    this.sub.add(
      this.certificatService.getCertificatsByStagiaire(this.user.id).subscribe({
        next: (data) => {
          this.certificats = data;
        },
        error: () => {},
      }),
    );

    // Load notifications
    this.sub.add(
      this.notificationService.notifications$.subscribe((data) => {
        this.allNotifications = data;
        this.unreadCount = data.filter((n) => !n.read).length;
      }),
    );

    this.notificationService.refreshNotifications();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderStagiaireChart(), 200);
  }

  ngOnDestroy(): void {
    if (this.presenceChartInstance) this.presenceChartInstance.destroy();
    this.sub.unsubscribe();
  }

  private renderStagiaireChart(): void {
    if (this.presenceChartInstance) this.presenceChartInstance.destroy();

    if (this.presenceCanvas) {
      const ctx = this.presenceCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.presenceChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'],
            datasets: [
              {
                label: 'Mon Assiduité (%)',
                data: [100, 85, 90, 95],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#F5A623',
                pointRadius: 5,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8E8C9A' } },
              y: {
                min: 50,
                max: 100,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#8E8C9A' },
              },
            },
          },
        });
      }
    }
  }

  // ── Catalogue ──────────────────────────────────────────────────────────────
  filterCatalogue(): void {
    const q = this.catalogSearch.toLowerCase();
    const cat = this.catalogCategory;
    this.filteredCatalogue = this.allFormations.filter((f) => {
      const matchQ =
        !q ||
        f.nom.toLowerCase().includes(q) ||
        (f.description || '').toLowerCase().includes(q) ||
        (f.formateurNom || '').toLowerCase().includes(q);
      const matchCat = !cat || (f.category || 'Général') === cat;
      return matchQ && matchCat;
    });
  }

  isEnrolled(formationId: string): boolean {
    return this.enrolledIds.has(formationId);
  }

  enrollFormation(f: Formation): void {
    this.openEnrollStepper(f);
  }

  openEnrollStepper(f: Formation): void {
    this.stepperFormation = f;
    this.showStepper = true;
  }

  closeStepper(): void {
    this.showStepper = false;
    this.stepperFormation = null;
  }

  onEnrollmentComplete(result: { enrollment: any; formation: Formation }): void {
    const fid = result.formation.id.toString();
    if (result.enrollment.status === 'APPROVED') {
      this.enrolledIds.add(fid);
      this.myFormations = [...this.myFormations, result.formation];
    } else if (result.enrollment.status === 'PENDING') {
      this.pendingIds.add(fid);
    }
    setTimeout(() => this.closeStepper(), 4500);
  }

  isPending(formationId: string): boolean {
    return this.pendingIds.has(formationId.toString());
  }

  unenrollFormation(f: Formation): void {
    if (!this.user) return;
    this.unenrollingId = f.id;
    this.enrollmentService.unenrollStudent(parseInt(this.user.id), parseInt(f.id)).subscribe({
      next: () => {
        this.unenrollingId = null;
        this.unenrollConfirmId = null;
        this.myFormations = this.myFormations.filter((mf) => mf.id !== f.id);
        this.enrolledIds.delete(f.id);
      },
      error: () => {
        this.unenrollingId = null;
        this.unenrollConfirmId = null;
      },
    });
  }

  // ── Formation utils ────────────────────────────────────────────────────────
  getFormationProgress(f: Formation): number {
    const phases = f.phases || [];
    if (phases.length === 0) return 0;
    return Math.round(phases.reduce((s, p) => s + (p.progression || 0), 0) / phases.length);
  }

  getUpcomingForFormation(f: Formation): Seance[] {
    const now = new Date();
    return this.upcomingSeances
      .filter(
        (s) =>
          s.formationNom === f.nom || f.phases.some((p) => p.seances?.some((ps) => ps.id === s.id)),
      )
      .filter((s) => new Date(s.date) >= now)
      .slice(0, 3);
  }

  // ── Payments ───────────────────────────────────────────────────────────────
  getDaysUntilDue(date: Date): number {
    const diff = new Date(date).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getTotalPaid(): number {
    return this.paiements.filter((p) => p.status === 'PAYE').reduce((s, p) => s + p.montant, 0);
  }
  getTotalPending(): number {
    return this.paiements
      .filter((p) => p.status === 'EN_ATTENTE')
      .reduce((s, p) => s + p.montant, 0);
  }
  getTotalLate(): number {
    return this.paiements
      .filter((p) => p.status === 'EN_RETARD')
      .reduce((s, p) => s + p.montant, 0);
  }

  scrollToSection(id: string): void {
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  // ── Certificates ───────────────────────────────────────────────────────────
  openCertificateVerif(cert: Certificat): void {
    this.selectedCertForVerif = cert;
  }

  // ── Presence ───────────────────────────────────────────────────────────────
  getMyPresence(seance: Seance): any {
    if (!seance.presences || !this.user) return null;
    return seance.presences.find((p) => p.stagiaireId === this.user!.id) || null;
  }

  // ── Notifications ──────────────────────────────────────────────────────────
  markAllRead(): void {
    this.notificationService.markAllAsRead();
  }
  markNotifRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  // ── Formatters ─────────────────────────────────────────────────────────────
  formatDay(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
  }

  formatDayNum(date: Date): string {
    return new Date(date).getDate().toString().padStart(2, '0');
  }

  getNotifIcon(type: string): string {
    const icons: Record<string, string> = {
      PAIEMENT_CONFIRME: '✅',
      PAIEMENT_RETARD: '⚠️',
      PHASE_DEBLOQUEE: '🚀',
      CERTIFICAT_GENERE: '🎓',
      SEANCE_PLANIFIEE: '📅',
      EVALUATION_PUBLIEE: '⭐',
      ANNONCE: '📢',
    };
    return icons[type] || '🔔';
  }

  timeAgo(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `il y a ${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours}h`;
    return `il y a ${Math.floor(hours / 24)}j`;
  }

  syncTabWithUrl(): void {
    const url = this.router.url;
    if (url.includes('/paiements')) {
      this.activeTab = 'paiements';
    } else if (url.includes('/certificats')) {
      this.activeTab = 'certificats';
    } else if (url.includes('/presence')) {
      this.activeTab = 'presence';
    } else if (url.includes('/notifications')) {
      this.activeTab = 'notifications';
    } else {
      this.activeTab = 'catalogue';
    }
  }

  setActiveTab(key: string): void {
    this.activeTab = key;
    // catalogue tab stays at root URL — no navigation needed
    if (key === 'catalogue') {
      this.router.navigateByUrl('/dashboard/stagiaire');
      return;
    }
    let path = '/dashboard/stagiaire';
    if (key === 'paiements') path += '/paiements';
    else if (key === 'certificats') path += '/certificats';
    else if (key === 'presence') path += '/presence';
    else if (key === 'notifications') path += '/notifications';
    this.router.navigateByUrl(path);
  }

  openMyFormations(): void {
    this.activeTab = 'catalogue';
    this.catalogView = 'mine';
    this.router.navigateByUrl('/dashboard/stagiaire');
  }

  toggleRemboursement(formationId: string | null): void {
    if (this.remboursementFormationId === formationId) {
      this.remboursementFormationId = null;
    } else {
      this.remboursementFormationId = formationId;
      this.remboursementMotif = '';
      this.remboursementConfirm = false;
      this.remboursementSuccess = null;
      this.remboursementSubmitting = false;
    }
  }

  submitRemboursement(formation: Formation): void {
    if (!this.remboursementMotif.trim() || !this.remboursementConfirm) return;
    this.remboursementSubmitting = true;
    // Simulate API call — replace with real HTTP call when backend endpoint is ready
    setTimeout(() => {
      this.remboursementSubmitting = false;
      this.remboursementSuccess = formation.id;
      // Auto-close after 4 seconds
      setTimeout(() => {
        if (this.remboursementFormationId === formation.id) {
          this.remboursementFormationId = null;
        }
        this.remboursementSuccess = null;
      }, 4000);
    }, 1200);
  }

  goToFormationDetail(formation: Formation): void {
    this.router.navigate([`/dashboard/stagiaire/formations/${formation.id}`]);
  }
}
