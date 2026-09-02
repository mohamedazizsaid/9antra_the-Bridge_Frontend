import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnboardingService } from '../../../../core/services/onboarding.service';
import {
  StageInscription,
  InternshipStatus,
} from '../../../../core/models/stage-inscription.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-admin-stages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      :host {
        display: contents;
      }

      .bridge-drawer-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        z-index: 999999 !important;
        margin: 0 !important;
        padding: 0 !important;
        transform: none !important;
        display: flex !important;
        justify-content: flex-end !important;
        pointer-events: auto !important;
      }

      .bridge-drawer-backdrop {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        margin: 0 !important;
        padding: 0 !important;
        z-index: 999999 !important;
      }

      .drawer-panel-container {
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        max-width: 580px !important;
        height: 100vh !important;
        height: 100dvh !important;
        max-height: 100vh !important;
        max-height: 100dvh !important;
        margin: 0 !important;
        z-index: 1000000 !important;
        display: flex !important;
        flex-direction: column !important;
      }

      @keyframes drawerSlideIn {
        0% {
          transform: translateX(100%);
          opacity: 0.5;
        }
        100% {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes drawerSlideOut {
        0% {
          transform: translateX(0);
          opacity: 1;
        }
        100% {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      @keyframes backdropFadeIn {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }

      @keyframes backdropFadeOut {
        0% {
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }

      .drawer-slide-in {
        animation: drawerSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        will-change: transform, opacity;
      }

      .drawer-slide-out {
        animation: drawerSlideOut 0.22s cubic-bezier(0.4, 0, 1, 1) forwards;
        will-change: transform, opacity;
      }

      .backdrop-fade-in {
        animation: backdropFadeIn 0.25s ease-out forwards;
        will-change: opacity;
      }

      .backdrop-fade-out {
        animation: backdropFadeOut 0.2s ease-in forwards;
        will-change: opacity;
      }

      :host-context([data-theme='light']) .drawer-panel-container {
        background-color: #ffffff !important;
        border-left-color: #e2d9c8 !important;
        color: #1d2433 !important;
        box-shadow: -15px 0 50px rgba(0, 0, 0, 0.12) !important;
      }

      :host-context([data-theme='light']) .drawer-header-bg,
      :host-context([data-theme='light']) .drawer-footer-bg {
        background-color: #faf7f2 !important;
        border-color: #e2d9c8 !important;
      }

      :host-context([data-theme='light']) .drawer-section-card {
        background-color: #f9f6f0 !important;
        border-color: #e2d9c8 !important;
      }

      :host-context([data-theme='light']) .drawer-select-input,
      :host-context([data-theme='light']) .drawer-textarea-input {
        background-color: #ffffff !important;
        border-color: #d1c7b7 !important;
        color: #1d2433 !important;
      }

      :host-context([data-theme='light']) .drawer-close-btn {
        background-color: #f0ece3 !important;
        border-color: #e2d9c8 !important;
        color: #5f6878 !important;
      }

      :host-context([data-theme='light']) .drawer-close-btn:hover {
        background-color: #e2d9c8 !important;
        color: #1d2433 !important;
      }

      :host-context([data-theme='light']) .cloture-confirm-box {
        background-color: #f0f4ff !important;
        border-color: #c7d7fe !important;
      }
    `,
  ],
  template: `
    <div class="max-w-7xl mx-auto space-y-6 pb-12">
      <!-- Header Banner -->
      <div
        class="glass-card border border-[var(--bridge-border)] p-6 md:p-8 rounded-3xl relative overflow-hidden bg-[var(--bridge-surface)]"
      >
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center text-white shadow-lg shadow-[rgba(198,39,97,0.3)]"
            >
              <svg
                class="w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div>
              <h1 class="font-syne font-bold text-2xl md:text-3xl text-[var(--bridge-text)]">
                Gestion des Stages Facultatifs
              </h1>
              <p class="text-xs md:text-sm text-[var(--bridge-text-muted)] mt-1">
                Supervision des conventions, assignation des encadrants et synchronisation
                financière
              </p>
            </div>
          </div>

          <button
            type="button"
            (click)="loadInscriptions()"
            class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--bridge-text)] text-xs font-bold transition-all border border-[var(--bridge-border)] flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <svg
              class="w-4 h-4"
              [class.animate-spin]="loading"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      <!-- KPI Cards Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- KPI 1 -->
        <div
          class="glass-card border border-[var(--bridge-border)] p-5 rounded-2xl bg-[var(--bridge-card)]"
        >
          <div class="flex items-center justify-between">
            <span
              class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
              >Total Inscriptions</span
            >
            <span
              class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--bridge-text-muted)] text-sm"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </span>
          </div>
          <p class="font-mono font-bold text-2xl text-[var(--bridge-text)] mt-3">
            {{ totalCount }}
          </p>
          <span class="text-[10px] text-[var(--bridge-text-muted)] mt-1 block"
            >Stages & Formations</span
          >
        </div>

        <!-- KPI 2 -->
        <div class="glass-card border border-amber-500/30 p-5 rounded-2xl bg-amber-500/[0.03]">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-amber-500 uppercase tracking-wider"
              >En Attente</span
            >
            <span
              class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center text-sm"
            >
              <svg
                class="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
          </div>
          <p class="font-mono font-bold text-2xl text-amber-500 mt-3">{{ pendingCount }}</p>
          <span class="text-[10px] text-amber-500/80 mt-1 block">À valider par l'admin</span>
        </div>

        <!-- KPI 3 -->
        <div class="glass-card border border-emerald-500/30 p-5 rounded-2xl bg-emerald-500/[0.03]">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-emerald-500 uppercase tracking-wider"
              >Approuvés / Actifs</span
            >
            <span
              class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </div>
          <p class="font-mono font-bold text-2xl text-emerald-500 mt-3">{{ approvedCount }}</p>
          <span class="text-[10px] text-emerald-500/80 mt-1 block">Conventions validées</span>
        </div>

        <!-- KPI 4 -->
        <div
          class="glass-card border border-[var(--bridge-gold)]/30 p-5 rounded-2xl bg-[rgba(245,166,35,0.03)]"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-[var(--bridge-gold)] uppercase tracking-wider"
              >Revenus Total</span
            >
            <span
              class="w-8 h-8 rounded-lg bg-[var(--bridge-gold)]/20 text-[var(--bridge-gold)] flex items-center justify-center text-sm"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </span>
          </div>
          <p class="font-mono font-bold text-2xl text-[var(--bridge-gold)] mt-3">
            {{ totalRevenue }} TND
          </p>
          <span class="text-[10px] text-[var(--bridge-text-muted)] mt-1 block"
            >Montant global engagé</span
          >
        </div>
      </div>

      <!-- Filters & Search Bar -->
      <div
        class="glass-card border border-[var(--bridge-border)] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--bridge-card)]"
      >
        <!-- Filter Tabs -->
        <div
          class="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl overflow-x-auto w-full sm:w-auto"
        >
          <button
            *ngFor="let tab of filterTabs"
            type="button"
            (click)="activeFilter = tab.key"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            [ngClass]="
              activeFilter === tab.key
                ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow'
                : 'text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] hover:bg-white/5'
            "
          >
            {{ tab.label }} ({{ getFilterCount(tab.key) }})
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bridge-text-muted)]">
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Rechercher stagiaire, CIN..."
            class="w-full bg-white/[0.03] border border-[var(--bridge-border)] rounded-xl py-2 pl-9 pr-3 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[var(--bridge-crimson)] transition-all"
          />
        </div>
      </div>

      <!-- Inscriptions Data Table -->
      <div
        class="glass-card border border-[var(--bridge-border)] rounded-2xl overflow-hidden shadow-xl bg-[var(--bridge-card)]"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-[var(--bridge-text)]">
            <thead
              class="bg-white/5 border-b border-[var(--bridge-border)] text-[var(--bridge-text-muted)] font-semibold uppercase tracking-wider text-[10px]"
            >
              <tr>
                <th class="py-3.5 px-4 text-center">Stagiaire</th>
                <th class="py-3.5 px-4 text-center">CIN</th>
                <th class="py-3.5 px-4 text-center">Projet / Sujet</th>
                <th class="py-3.5 px-4 text-center">Encadrant Assigné</th>
                <th class="py-3.5 px-4 text-center">Montant</th>
                <th class="py-3.5 px-4 text-center">Paiement</th>
                <th class="py-3.5 px-4 text-center">Statut</th>
                <th class="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--bridge-border)]">
              <tr
                *ngIf="filteredInscriptions.length === 0"
                class="text-center text-[var(--bridge-text-muted)] py-12"
              >
                <td colspan="9" class="py-8">Aucune inscription trouvée.</td>
              </tr>

              <tr
                *ngFor="let item of filteredInscriptions"
                class="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                (click)="openDetail(item)"
              >
                <!-- Stagiaire -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center font-bold text-xs text-white flex-shrink-0 overflow-hidden"
                    >
                      <img
                        *ngIf="item.studentAvatar"
                        [src]="item.studentAvatar"
                        class="w-full h-full object-cover"
                        alt=""
                      />
                      <span *ngIf="!item.studentAvatar">{{
                        (item.studentFirstName?.[0] || '') + (item.studentLastName?.[0] || '')
                      }}</span>
                    </div>
                    <div>
                      <p
                        class="font-bold text-[var(--bridge-text)] group-hover:text-[var(--bridge-gold)] transition-colors"
                      >
                        {{ item.studentFirstName }} {{ item.studentLastName }}
                      </p>
                      <span class="text-[10px] text-[var(--bridge-text-muted)]">{{
                        item.studentEmail
                      }}</span>
                    </div>
                  </div>
                </td>

                <!-- CIN -->
                <td class="py-3.5 px-4 font-mono font-semibold text-[var(--bridge-text)]">
                  {{ item.studentCin || '—' }}
                </td>

                <!-- Projet -->
                <td class="py-3.5 px-4 max-w-[180px]">
                  <p class="truncate text-[var(--bridge-text)] font-medium">
                    {{ item.stageProjectTitle || '—' }}
                  </p>
                  <span
                    *ngIf="item.stageDurationWeeks"
                    class="text-[10px] text-[var(--bridge-text-muted)]"
                  >
                    {{ item.stageDurationWeeks }} sem.
                  </span>
                </td>

                <!-- Encadrant -->
                <td class="py-3.5 px-4">
                  <div *ngIf="item.supervisorFirstName" class="flex items-center gap-2">
                    <div
                      class="w-6 h-6 rounded-full bg-[var(--bridge-gold)]/20 text-[var(--bridge-gold)] flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    >
                      {{
                        (item.supervisorFirstName[0] || '') + (item.supervisorLastName?.[0] || '')
                      }}
                    </div>
                    <span
                      class="text-xs font-semibold text-[var(--bridge-text)] truncate max-w-[130px]"
                    >
                      {{ item.supervisorFirstName }} {{ item.supervisorLastName }}
                    </span>
                  </div>
                  <span
                    *ngIf="!item.supervisorFirstName"
                    class="text-[11px] text-[var(--bridge-text-muted)] italic"
                  >
                    Non assigné
                  </span>
                </td>

                <!-- Montant -->
                <td class="py-3.5 px-4 font-mono font-bold text-[var(--bridge-gold)]">
                  {{ item.totalPrice || 0 }} TND
                </td>

                <!-- Statut Paiement (avec bouton de bascule rapide) -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-2">
                    <span
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1"
                      [ngClass]="
                        isPaymentPaid(item)
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                      "
                    >
                      <span
                        class="w-1.5 h-1.5 rounded-full"
                        [ngClass]="
                          isPaymentPaid(item) ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                        "
                      ></span>
                      {{ isPaymentPaid(item) ? 'Payé' : 'En attente' }}
                    </span>

                    <button
                      type="button"
                      (click)="$event.stopPropagation(); togglePaymentStatus(item)"
                      class="p-1 rounded-md bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] transition-colors border border-[var(--bridge-border)] cursor-pointer"
                      [title]="
                        isPaymentPaid(item)
                          ? 'Marquer comme non payé'
                          : 'Marquer comme encaissé (main à main)'
                      "
                    >
                      {{ isPaymentPaid(item) ? '✕ Annuler' : '✓ Encaissé' }}
                    </button>
                  </div>
                </td>

                <!-- Statut Inscription -->
                <td class="py-3.5 px-4">
                  <span
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                    [ngClass]="getStatusBadgeClass(item.status)"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      [ngClass]="getStatusDotClass(item.status)"
                    ></span>
                    {{ getStatusLabel(item.status) }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <!-- Quick Attestation link if completed -->
                    <a
                      *ngIf="item.status === 'COMPLETED' && item.attestationPdfUrl"
                      [href]="item.attestationPdfUrl"
                      target="_blank"
                      (click)="$event.stopPropagation()"
                      title="Télécharger l'Attestation de stage PDF"
                      class="px-2.5 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-500 text-xs font-bold transition-all inline-flex items-center gap-1 border border-blue-500/30"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span class="hidden md:inline">Attestation</span>
                    </a>

                    <!-- Quick Clôturer button if APPROVED or ACTIVE -->
                    <button
                      *ngIf="item.status === 'APPROVED' || item.status === 'ACTIVE'"
                      type="button"
                      (click)="
                        $event.stopPropagation(); openDetail(item); showCloturerConfirm = true
                      "
                      title="Clôturer le stage et générer l'attestation PDF"
                      class="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-blue-400 hover:text-blue-300 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 border border-blue-500/30"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="hidden md:inline">Clôturer</span>
                    </button>

                    <!-- Examiner Button -->
                    <button
                      type="button"
                      (click)="$event.stopPropagation(); openDetail(item)"
                      class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[var(--bridge-text)] text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 border border-[var(--bridge-border)]"
                    >
                      <span>Examiner</span>
                      <svg
                        class="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════════════ -->
      <!-- SLIDE-OVER DRAWER MODAL : ULTRA-PRO SLIDE OVERLAY (100vh FULL VIEW)  -->
      <!-- ════════════════════════════════════════════════════════════════════ -->
      <div *ngIf="selectedItem" class="bridge-drawer-overlay">
        <!-- Full-Screen Backdrop with Fade Blur -->
        <div
          class="bridge-drawer-backdrop bg-black/70 backdrop-blur-md"
          [class.backdrop-fade-in]="!isClosing"
          [class.backdrop-fade-out]="isClosing"
          (click)="closeDetail()"
        ></div>

        <!-- Slide-over Drawer Panel with Smooth Slide In / Slide Out -->
        <div
          class="drawer-panel-container bg-[#0d0d21] border-l border-white/10 shadow-[-15px_0_50px_rgba(0,0,0,0.85)] overflow-hidden"
          [class.drawer-slide-in]="!isClosing"
          [class.drawer-slide-out]="isClosing"
          (click)="$event.stopPropagation()"
        >
          <!-- Top Accent Gradient Line -->
          <div
            class="h-1 w-full bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623] flex-shrink-0"
          ></div>

          <!-- Drawer Header -->
          <div
            class="drawer-header-bg bg-[#12122d] px-6 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0 shadow-sm"
          >
            <div class="flex items-center gap-3.5 min-w-0">
              <div
                class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center font-bold text-sm text-white flex-shrink-0 shadow-lg ring-2 ring-white/10"
              >
                {{
                  (selectedItem.studentFirstName?.[0] || '') +
                    (selectedItem.studentLastName?.[0] || '')
                }}
              </div>
              <div class="min-w-0">
                <h3
                  class="font-syne font-bold text-base md:text-lg text-[var(--bridge-text)] truncate leading-snug"
                >
                  {{ selectedItem.studentFirstName }} {{ selectedItem.studentLastName }}
                </h3>
                <div class="flex items-center gap-2 mt-0.5">
                  <span
                    class="text-[11px] text-[var(--bridge-gold)] font-mono font-bold bg-[rgba(245,166,35,0.1)] px-2 py-0.5 rounded-md border border-[var(--bridge-gold)]/20"
                  >
                    CIN: {{ selectedItem.studentCin || 'Non renseigné' }}
                  </span>
                  <span class="text-[11px] text-[var(--bridge-text-muted)] truncate">
                    {{ selectedItem.studentEmail }}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              (click)="closeDetail()"
              aria-label="Fermer"
              class="drawer-close-btn w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] transition-all cursor-pointer flex-shrink-0 hover:rotate-90 duration-200"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Drawer Body Content (Scrollable) -->
          <div
            class="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-xs text-[var(--bridge-text)] custom-scrollbar"
          >
            <!-- Status Alert Banner -->
            <div
              class="p-4 rounded-2xl border flex items-center justify-between"
              [ngClass]="getStatusBadgeClass(selectedItem.status)"
            >
              <span class="font-bold uppercase tracking-wider text-xs">Statut du dossier :</span>
              <span class="font-bold text-xs flex items-center gap-2">
                <span
                  class="w-2.5 h-2.5 rounded-full"
                  [ngClass]="getStatusDotClass(selectedItem.status)"
                ></span>
                {{ getStatusLabel(selectedItem.status) }}
              </span>
            </div>

            <!-- SECTION: ASSIGNATION D'UN ENCADRANT / FORMATEUR -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h4
                  class="font-syne font-bold text-xs text-[var(--bridge-gold)] uppercase tracking-wider flex items-center gap-2"
                >
                  <svg
                    class="w-4 h-4 text-[var(--bridge-gold)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Encadrant / Formateur Référent
                </h4>
                <span
                  class="text-[10px] text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
                >
                  Requis pour l'approbation
                </span>
              </div>

              <div
                class="drawer-section-card p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3"
              >
                <label class="block text-[11px] text-[var(--bridge-text-muted)]">
                  Sélectionnez le formateur qui assurera le suivi et l'encadrement de ce stage :
                </label>

                <!-- Select Box Formateurs -->
                <div class="relative">
                  <select
                    [(ngModel)]="selectedSupervisorId"
                    class="drawer-select-input w-full bg-[#171738] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[var(--bridge-gold)] transition-all cursor-pointer appearance-none"
                  >
                    <option [ngValue]="null">-- Sélectionner un formateur encadrant --</option>
                    <option *ngFor="let f of formateurs" [ngValue]="f.id">
                      {{ f.firstName }} {{ f.lastName }} ({{ f.email }})
                    </option>
                  </select>
                  <span
                    class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--bridge-text-muted)]"
                  >
                    <svg
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>

                <!-- Preview Selected Formateur Card -->
                <div
                  *ngIf="selectedSupervisor"
                  class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 animate-fadeIn"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs font-bold flex-shrink-0"
                    >
                      {{
                        (selectedSupervisor.firstName?.[0] || '') +
                          (selectedSupervisor.lastName?.[0] || '')
                      }}
                    </div>
                    <div>
                      <p class="font-bold text-[var(--bridge-text)] text-xs">
                        {{ selectedSupervisor.firstName }} {{ selectedSupervisor.lastName }}
                      </p>
                      <span class="text-[10px] text-[var(--bridge-text-muted)]">{{
                        selectedSupervisor.email
                      }}</span>
                    </div>
                  </div>
                  <span
                    class="text-[10px] font-bold text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded"
                  >
                    Encadrant assigné
                  </span>
                </div>
              </div>
            </div>

            <!-- Section: Infos Stage -->
            <div class="space-y-3">
              <h4
                class="font-syne font-bold text-xs text-[var(--bridge-gold)] uppercase tracking-wider flex items-center gap-2"
              >
                <svg
                  class="w-4 h-4 text-[var(--bridge-gold)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                Projet de Stage Facultatif
              </h4>
              <div
                class="drawer-section-card p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5"
              >
                <p>
                  <span class="text-[var(--bridge-text-muted)]">Titre:</span>
                  <strong class="text-[var(--bridge-text)] ml-1 font-semibold">{{
                    selectedItem.stageProjectTitle || 'Non renseigné'
                  }}</strong>
                </p>
                <p>
                  <span class="text-[var(--bridge-text-muted)]">Durée:</span>
                  <strong class="text-[var(--bridge-text)] ml-1 font-semibold"
                    >{{ selectedItem.stageDurationWeeks || 12 }} semaines ({{
                      ((selectedItem.stageDurationWeeks || 12) / 4).toFixed(1)
                    }}
                    mois)</strong
                  >
                </p>
                <p>
                  <span class="text-[var(--bridge-text-muted)]">Email:</span>
                  <strong class="text-[var(--bridge-text)] ml-1">{{
                    selectedItem.studentEmail
                  }}</strong>
                </p>
                <p>
                  <span class="text-[var(--bridge-text-muted)]">Source d'acquisition:</span>
                  <strong class="text-[var(--bridge-text)] ml-1 font-normal">{{
                    selectedItem.heardFrom || '—'
                  }}</strong>
                </p>
              </div>
            </div>

            <!-- Section: Documents Fournis (PDFs) -->
            <div class="space-y-3">
              <h4
                class="font-syne font-bold text-xs text-[var(--bridge-gold)] uppercase tracking-wider flex items-center gap-2"
              >
                <svg
                  class="w-4 h-4 text-[#C62761]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Documents Fournis (PDFs)
              </h4>
              <div class="grid grid-cols-2 gap-3">
                <!-- Demande PDF -->
                <div
                  class="drawer-section-card p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-3"
                >
                  <div>
                    <p class="font-bold text-[var(--bridge-text)] text-xs">Demande de stage</p>
                    <span class="text-[10px] text-[var(--bridge-text-muted)]"
                      >Document stagiaire</span
                    >
                  </div>
                  <a
                    *ngIf="selectedItem.demandeStageUrl"
                    [href]="selectedItem.demandeStageUrl"
                    target="_blank"
                    class="px-3 py-2 rounded-xl bg-[var(--bridge-crimson)] text-white text-center font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>Ouvrir PDF</span>
                    <svg
                      class="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                  <span
                    *ngIf="!selectedItem.demandeStageUrl"
                    class="text-[var(--bridge-text-muted)] italic text-[11px]"
                    >Non fourni</span
                  >
                </div>

                <!-- Lettre affectation PDF -->
                <div
                  class="drawer-section-card p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-3"
                >
                  <div>
                    <p class="font-bold text-[var(--bridge-text)] text-xs">Lettre d'affectation</p>
                    <span class="text-[10px] text-[var(--bridge-text-muted)]"
                      >Convention officielle</span
                    >
                  </div>
                  <a
                    *ngIf="selectedItem.lettreAffectationUrl"
                    [href]="selectedItem.lettreAffectationUrl"
                    target="_blank"
                    class="px-3 py-2 rounded-xl bg-gradient-to-r from-[#F5A623] to-amber-500 text-[#10102A] text-center font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>Ouvrir PDF</span>
                    <svg
                      class="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                  <span
                    *ngIf="!selectedItem.lettreAffectationUrl"
                    class="text-[var(--bridge-text-muted)] italic text-[11px]"
                    >Non fourni</span
                  >
                </div>
              </div>
            </div>

            <!-- Section: Formations & Tarification -->
            <div class="space-y-3">
              <h4
                class="font-syne font-bold text-xs text-[var(--bridge-gold)] uppercase tracking-wider flex items-center gap-2"
              >
                <svg
                  class="w-4 h-4 text-[var(--bridge-gold)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                Formations & Règlement
              </h4>
              <div
                class="drawer-section-card p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5"
              >
                <div class="flex justify-between">
                  <span class="text-[var(--bridge-text-muted)]">Formations:</span>
                  <span class="font-bold text-[var(--bridge-text)] text-right">{{
                    selectedItem.selectedFormationTitles?.join(', ') || 'Aucune'
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[var(--bridge-text-muted)]">Mode de paiement:</span>
                  <span class="font-bold text-[var(--bridge-text)]">{{
                    selectedItem.paymentMode
                  }}</span>
                </div>
                <div
                  class="flex justify-between"
                  *ngIf="selectedItem.discountAmount && selectedItem.discountAmount > 0"
                >
                  <span class="text-emerald-500">Remise ({{ selectedItem.discountReason }}):</span>
                  <span class="font-mono text-emerald-500 font-bold"
                    >-{{ selectedItem.discountAmount }} TND</span
                  >
                </div>
                <div class="flex justify-between pt-2 border-t border-[var(--bridge-border)]">
                  <span class="font-bold text-[var(--bridge-text)] text-sm">Montant Total :</span>
                  <span class="font-mono font-bold text-base text-[var(--bridge-gold)]"
                    >{{ selectedItem.totalPrice }} TND</span
                  >
                </div>
              </div>
            </div>

            <!-- Section: Synchronisation du Paiement Manuel -->
            <div
              class="drawer-section-card p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h5 class="font-bold text-[var(--bridge-text)] text-xs">Statut Financier</h5>
                  <p class="text-[11px] text-[var(--bridge-text-muted)] mt-0.5">
                    Mode :
                    <span class="font-semibold text-[var(--bridge-text)]">{{
                      selectedItem.paymentMode || 'MAIN_A_MAIN'
                    }}</span>
                  </p>
                </div>

                <span
                  class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  [ngClass]="
                    isPaymentPaid(selectedItem)
                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                  "
                >
                  {{
                    isPaymentPaid(selectedItem) ? '✓ ENCAISSÉ / PAYÉ' : '⏳ EN ATTENTE DE RÈGLEMENT'
                  }}
                </span>
              </div>

              <!-- Toggle Action Button -->
              <button
                type="button"
                (click)="togglePaymentStatus(selectedItem)"
                [disabled]="actionLoading"
                class="w-full py-2.5 rounded-xl font-syne font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                [ngClass]="
                  isPaymentPaid(selectedItem)
                    ? 'bg-white/10 hover:bg-rose-500/20 text-[var(--bridge-text)] hover:text-rose-500 border border-[var(--bridge-border)]'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20'
                "
              >
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                <span>{{
                  isPaymentPaid(selectedItem)
                    ? 'Basculer en Non Encaissé'
                    : 'Valider et Synchroniser le Paiement Manuel'
                }}</span>
              </button>
            </div>

            <!-- Section: Notes Administratives (Motif de validation ou de rejet) -->
            <div class="space-y-2">
              <label
                class="block font-syne font-bold text-xs text-[var(--bridge-gold)] uppercase tracking-wider"
              >
                Motif / Remarque Administrative (transmis en temps réel au stagiaire)
              </label>
              <textarea
                [(ngModel)]="adminNotes"
                rows="3"
                placeholder="Ex: Convention validée, encadrement assigné... ou motif du refus..."
                class="drawer-textarea-input w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[var(--bridge-crimson)] transition-all"
              ></textarea>
            </div>
          </div>

          <!-- Drawer Footer (Sticky Bottom with Actions) -->
          <div
            class="drawer-footer-bg bg-[#12122d] px-6 py-4 border-t border-white/10 flex-shrink-0 shadow-lg space-y-3"
          >
            <!-- Clôturer & Attestation button (APPROVED or ACTIVE only) -->
            <div *ngIf="selectedItem.status === 'APPROVED' || selectedItem.status === 'ACTIVE'">
              <!-- Confirm clôture prompt -->
              <div *ngIf="!showCloturerConfirm" class="w-full">
                <button
                  type="button"
                  (click)="showCloturerConfirm = true"
                  [disabled]="clotureLoading || actionLoading"
                  class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-syne font-bold text-xs shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Clôturer le Stage & Générer Attestation PDF</span>
                </button>
              </div>
              <!-- Confirm Clôture dialog -->
              <div
                *ngIf="showCloturerConfirm"
                class="cloture-confirm-box rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-3"
              >
                <p class="text-xs font-bold text-[var(--bridge-text)] text-center">
                  ⚠️ Confirmer la Clôture du Stage ?
                </p>
                <p class="text-[11px] text-[var(--bridge-text-muted)] text-center leading-relaxed">
                  Cette action marquera le stage comme
                  <span class="text-blue-400 font-bold">COMPLÉTÉ</span> et générera l'attestation de
                  stage PDF qui sera envoyée au stagiaire.
                </p>
                <div class="flex gap-2">
                  <button
                    type="button"
                    (click)="showCloturerConfirm = false"
                    class="flex-1 py-2.5 rounded-xl border border-[var(--bridge-border)] text-[var(--bridge-text-muted)] text-xs font-bold hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    (click)="confirmerCloture(selectedItem.id!)"
                    [disabled]="clotureLoading"
                    class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-90"
                  >
                    <span
                      *ngIf="clotureLoading"
                      class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></span>
                    <svg
                      *ngIf="!clotureLoading"
                      class="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{{ clotureLoading ? 'Génération...' : 'Confirmer & Clôturer' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Download Attestation (if COMPLETED and attestation URL exists) -->
            <div *ngIf="selectedItem.status === 'COMPLETED' && selectedItem.attestationPdfUrl">
              <a
                [href]="selectedItem.attestationPdfUrl"
                target="_blank"
                class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 font-syne font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-500/30 transition-all"
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
                <span>Télécharger l'Attestation PDF</span>
              </a>
            </div>

            <!-- Action Row: Rejeter + Approuver -->
            <div class="flex items-center gap-3">
              <!-- Rejeter Button -->
              <button
                *ngIf="selectedItem.status !== 'COMPLETED'"
                type="button"
                (click)="updateStatus(selectedItem.id!, 'REJECTED')"
                [disabled]="actionLoading || clotureLoading"
                class="flex-1 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 font-syne font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>Rejeter</span>
              </button>

              <!-- Approuver Button : HIDDEN when already approved or active or completed -->
              <button
                *ngIf="
                  selectedItem.status !== 'APPROVED' &&
                  selectedItem.status !== 'ACTIVE' &&
                  selectedItem.status !== 'COMPLETED'
                "
                type="button"
                (click)="updateStatus(selectedItem.id!, 'APPROVED')"
                [disabled]="actionLoading || clotureLoading"
                class="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-syne font-bold text-xs shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
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
                <span>Approuver la convention</span>
              </button>

              <!-- Already Approved Badge -->
              <div
                *ngIf="
                  (selectedItem.status === 'APPROVED' || selectedItem.status === 'ACTIVE') &&
                  !showCloturerConfirm
                "
                class="flex-1 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 font-syne font-bold text-xs flex items-center justify-center gap-2"
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
                <span>Convention Validée & Active</span>
              </div>

              <!-- Completed Badge -->
              <div
                *ngIf="selectedItem.status === 'COMPLETED'"
                class="flex-1 py-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-syne font-bold text-xs flex items-center justify-center gap-2"
              >
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Stage Clôturé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminStagesComponent implements OnInit {
  inscriptions: StageInscription[] = [];
  formateurs: any[] = [];
  loading = true;
  actionLoading = false;

  selectedItem: StageInscription | null = null;
  selectedSupervisorId: number | null = null;
  adminNotes = '';
  isClosing = false;

  searchQuery = '';
  activeFilter = 'ALL';

  filterTabs = [
    { key: 'ALL', label: 'Tous' },
    { key: 'PENDING_REVIEW', label: 'En attente' },
    { key: 'APPROVED', label: 'Approuvés' },
    { key: 'REJECTED', label: 'Rejetés' },
    { key: 'COMPLETED', label: 'Clôturés' },
  ];

  clotureLoading = false;
  showCloturerConfirm = false;

  constructor(
    private onboardingService: OnboardingService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadInscriptions();
    this.loadFormateurs();
  }

  private parseDate(val: any): number {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    if (Array.isArray(val)) {
      return new Date(
        val[0],
        (val[1] || 1) - 1,
        val[2] || 1,
        val[3] || 0,
        val[4] || 0,
        val[5] || 0,
      ).getTime();
    }
    const t = new Date(val).getTime();
    return isNaN(t) ? 0 : t;
  }

  loadInscriptions(): void {
    this.loading = true;
    this.onboardingService.getAllInscriptions().subscribe({
      next: (list) => {
        this.inscriptions = (list || []).sort((a, b) => {
          const dateA = this.parseDate(a.createdAt);
          const dateB = this.parseDate(b.createdAt);
          return dateA !== dateB ? dateA - dateB : (a.id || 0) - (b.id || 0);
        });
        this.loading = false;
      },
      error: () => {
        this.inscriptions = [];
        this.loading = false;
      },
    });
  }

  loadFormateurs(): void {
    this.onboardingService.getFormateurs().subscribe({
      next: (list) => {
        this.formateurs = list || [];
      },
      error: () => {
        this.formateurs = [];
      },
    });
  }

  get totalCount(): number {
    return this.inscriptions.length;
  }

  get pendingCount(): number {
    return this.inscriptions.filter((i) => i.status === 'PENDING_REVIEW').length;
  }

  get approvedCount(): number {
    return this.inscriptions.filter((i) => i.status === 'APPROVED' || i.status === 'ACTIVE').length;
  }

  get totalRevenue(): number {
    return this.inscriptions.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
  }

  get selectedSupervisor(): any | null {
    if (!this.selectedSupervisorId) return null;
    return this.formateurs.find((f) => f.id === this.selectedSupervisorId) || null;
  }

  getFilterCount(key: string): number {
    if (key === 'ALL') return this.inscriptions.length;
    return this.inscriptions.filter((i) => i.status === key).length;
  }

  get filteredInscriptions(): StageInscription[] {
    return this.inscriptions
      .filter((item) => {
        // Filter tab
        if (this.activeFilter !== 'ALL' && item.status !== this.activeFilter) {
          return false;
        }
        // Search query
        if (this.searchQuery.trim()) {
          const q = this.searchQuery.toLowerCase();
          const fullName = `${item.studentFirstName} ${item.studentLastName}`.toLowerCase();
          const cin = (item.studentCin || '').toLowerCase();
          const email = (item.studentEmail || '').toLowerCase();
          const title = (item.stageProjectTitle || '').toLowerCase();
          const supervisor =
            `${item.supervisorFirstName || ''} ${item.supervisorLastName || ''}`.toLowerCase();
          return (
            fullName.includes(q) ||
            cin.includes(q) ||
            email.includes(q) ||
            title.includes(q) ||
            supervisor.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = this.parseDate(a.createdAt);
        const dateB = this.parseDate(b.createdAt);
        return dateA !== dateB ? dateA - dateB : (a.id || 0) - (b.id || 0);
      });
  }

  openDetail(item: StageInscription): void {
    this.selectedItem = item;
    this.selectedSupervisorId = item.supervisorId || null;
    this.adminNotes = item.adminNotes || '';
    this.isClosing = false;
    this.showCloturerConfirm = false;
  }

  closeDetail(): void {
    if (this.isClosing) return;
    this.isClosing = true;
    this.showCloturerConfirm = false;
    setTimeout(() => {
      this.selectedItem = null;
      this.selectedSupervisorId = null;
      this.adminNotes = '';
      this.isClosing = false;
    }, 220);
  }

  confirmerCloture(id: number): void {
    this.clotureLoading = true;
    this.onboardingService.cloturerStage(id).subscribe({
      next: (updated) => {
        this.clotureLoading = false;
        this.showCloturerConfirm = false;
        // Update list
        const idx = this.inscriptions.findIndex((i) => i.id === id);
        if (idx > -1) this.inscriptions[idx] = updated;
        if (this.selectedItem && this.selectedItem.id === id) {
          this.selectedItem = updated;
        }
        this.toastService.success(
          "Stage clôturé avec succès ! L'attestation PDF a été générée.",
          'Clôture Validée',
        );
        // Auto-open attestation PDF
        if (updated.attestationPdfUrl) {
          window.open(updated.attestationPdfUrl, '_blank');
        }
      },
      error: (err) => {
        this.clotureLoading = false;
        this.toastService.error(
          err?.error?.message || 'Erreur lors de la clôture du stage.',
          'Erreur',
        );
      },
    });
  }

  @HostListener('window:keydown.escape')
  onEscapePress(): void {
    if (this.selectedItem) {
      this.closeDetail();
    }
  }

  isPaymentPaid(item?: StageInscription | null): boolean {
    if (!item) return false;
    return !!(item.adminPaymentConfirmed || item.stripePaymentConfirmed);
  }

  togglePaymentStatus(item: StageInscription): void {
    if (!item.id) return;
    const currentPaid = this.isPaymentPaid(item);
    const newPaid = !currentPaid;

    this.actionLoading = true;
    this.onboardingService.updatePaymentStatus(item.id, newPaid).subscribe({
      next: (updated) => {
        this.actionLoading = false;
        item.adminPaymentConfirmed = updated.adminPaymentConfirmed;
        item.adminPaymentDate = updated.adminPaymentDate;
        if (this.selectedItem && this.selectedItem.id === item.id) {
          this.selectedItem.adminPaymentConfirmed = updated.adminPaymentConfirmed;
          this.selectedItem.adminPaymentDate = updated.adminPaymentDate;
        }
        this.toastService.success(
          newPaid
            ? 'Paiement marqué comme Encaissé (Synchronisé).'
            : 'Paiement marqué comme En Attente.',
          'Trésorerie',
        );
      },
      error: (err) => {
        this.actionLoading = false;
        this.toastService.error(
          err?.error?.message || 'Erreur lors du changement de paiement.',
          'Erreur',
        );
      },
    });
  }

  updateStatus(id: number, status: InternshipStatus): void {
    if (status === 'APPROVED' && !this.selectedSupervisorId) {
      this.toastService.error(
        "Veuillez sélectionner un formateur encadrant avant d'approuver la convention de stage.",
        'Encadrement requis',
      );
      return;
    }

    this.actionLoading = true;
    this.onboardingService
      .updateStatus(id, status, this.adminNotes, this.selectedSupervisorId)
      .subscribe({
        next: (updated) => {
          this.actionLoading = false;
          this.toastService.success(
            status === 'APPROVED'
              ? 'Convention de stage approuvée et encadrant assigné !'
              : 'Demande de stage rejetée.',
            'Supervision',
          );
          const idx = this.inscriptions.findIndex((i) => i.id === id);
          if (idx > -1) {
            this.inscriptions[idx] = updated;
          }
          this.closeDetail();
        },
        error: (err) => {
          this.actionLoading = false;
          this.toastService.error(
            err?.error?.message || 'Erreur lors de la mise à jour.',
            'Erreur',
          );
        },
      });
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'PENDING_REVIEW':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      default:
        return 'bg-white/10 text-[var(--bridge-text)] border-white/20';
    }
  }

  getStatusDotClass(status?: string): string {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return 'bg-emerald-500';
      case 'PENDING_REVIEW':
        return 'bg-amber-500 animate-pulse';
      case 'REJECTED':
        return 'bg-rose-500';
      case 'COMPLETED':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'APPROVED':
        return 'Approuvé';
      case 'ACTIVE':
        return 'Actif';
      case 'PENDING_REVIEW':
        return 'En Attente';
      case 'REJECTED':
        return 'Rejeté';
      case 'COMPLETED':
        return 'Clôturé';
      default:
        return 'En Examen';
    }
  }
}
