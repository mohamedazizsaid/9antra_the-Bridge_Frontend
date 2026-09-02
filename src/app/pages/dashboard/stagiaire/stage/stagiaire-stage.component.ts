import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OnboardingService } from '../../../../core/services/onboarding.service';
import { FormationService } from '../../../../core/services/formation.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  StageInscription,
  OnboardingPayload,
  InternshipPaymentMode,
} from '../../../../core/models/stage-inscription.model';
import { Formation } from '../../../../core/models/formation.model';

@Component({
  selector: 'app-stagiaire-stage',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  styles: [
    `
      :host {
        display: block;
      }

      .modal-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        z-index: 999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 1rem !important;
      }

      .modal-backdrop {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        z-index: 999998 !important;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
      }

      .modal-panel {
        position: relative !important;
        z-index: 1000000 !important;
        max-height: 92vh !important;
        max-height: 92dvh !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
      }

      .drawer-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        height: 100dvh !important;
        z-index: 999999 !important;
        display: flex !important;
        justify-content: flex-end !important;
      }

      .drawer-panel {
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        max-width: 580px !important;
        height: 100vh !important;
        height: 100dvh !important;
        z-index: 1000000 !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes fadeInScale {
        from {
          transform: scale(0.95);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .animate-slide-in {
        animation: slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .animate-scale-in {
        animation: fadeInScale 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      /* Tooltip Alert Box Styles */
      .stage-tooltip-box {
        z-index: 999999 !important;
        background: rgba(16, 16, 42, 0.98);
        border: 1px solid rgba(245, 166, 35, 0.45);
        color: #f0f0ff;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(12px);
      }

      /* Light Theme Overrides */
      :host-context([data-theme='light']) .theme-header-card {
        background: linear-gradient(135deg, #ffffff 0%, #f7f3eb 100%) !important;
        border-color: #e2d9c8 !important;
        color: #1d2433 !important;
      }

      :host-context([data-theme='light']) .theme-panel {
        background-color: #ffffff !important;
        border-color: #e2d9c8 !important;
        color: #1d2433 !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
      }

      :host-context([data-theme='light']) .theme-sub-card {
        background-color: #f9f6f0 !important;
        border-color: #e2d9c8 !important;
        color: #1d2433 !important;
      }

      :host-context([data-theme='light']) .theme-input {
        background-color: #ffffff !important;
        border-color: #d1c7b7 !important;
        color: #1d2433 !important;
      }

      :host-context([data-theme='light']) .theme-input:focus {
        border-color: #c62761 !important;
      }

      :host-context([data-theme='light']) .theme-close-btn {
        background-color: #f0ece3 !important;
        border-color: #e2d9c8 !important;
        color: #5f6878 !important;
      }

      :host-context([data-theme='light']) .theme-close-btn:hover {
        background-color: #e2d9c8 !important;
        color: #1d2433 !important;
      }

      :host-context([data-theme='light']) .stage-tooltip-box {
        background: #ffffff !important;
        border: 1px solid #f59e0b !important;
        color: #1d2433 !important;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.16) !important;
      }

      :host-context([data-theme='light']) .stage-tooltip-arrow {
        background-color: #ffffff !important;
        border-color: #f59e0b !important;
      }

      :host-context([data-theme='light']) .stage-tooltip-title {
        color: #b45309 !important;
      }

      :host-context([data-theme='light']) .stage-tooltip-desc {
        color: #4b5563 !important;
      }

      :host-context([data-theme='light']) .theme-engaged-banner {
        color: #b45309 !important;
        border-top-color: #e2d9c8 !important;
      }

      :host-context([data-theme='light']) .theme-engaged-banner svg {
        color: #d97706 !important;
      }
    `,
  ],
  template: `
    <div class="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      <!-- Header Banner -->
      <div
        class="glass-card theme-header-card border border-[var(--bridge-border)] p-6 md:p-8 rounded-3xl relative z-30 bg-gradient-to-br from-[#10102A] to-[#171738]"
      >
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <!-- Title & Icon -->
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center text-white shadow-lg shadow-[rgba(198,39,97,0.3)] flex-shrink-0"
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
              <div class="flex items-center gap-3 flex-wrap">
                <h1 class="font-syne font-bold text-2xl md:text-3xl text-[var(--bridge-text)]">
                  Mon Stage Facultatif
                </h1>
                <!-- Status Badge -->
                <span
                  *ngIf="inscription"
                  class="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border shadow-md"
                  [ngClass]="getStatusBadgeClass(inscription.status)"
                >
                  <span
                    class="w-2 h-2 rounded-full"
                    [ngClass]="getStatusDotClass(inscription.status)"
                  ></span>
                  {{ getStatusLabel(inscription.status) }}
                </span>
              </div>
              <p class="text-xs md:text-sm text-[var(--bridge-text-muted)] mt-1">
                Convention officielle, encadrement pédagogique et attestation de stage certifiée
              </p>
            </div>
          </div>

          <!-- Action Buttons in Header -->
          <div class="flex items-center gap-3 flex-wrap">
            <!-- Bouton Historique des stages -->
            <button
              type="button"
              (click)="openHistory()"
              class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--bridge-text)] text-xs font-bold transition-all border border-[var(--bridge-border)] flex items-center gap-2 cursor-pointer shadow-sm hover:scale-102 active:scale-98"
            >
              <svg
                class="w-4 h-4 text-[var(--bridge-gold)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Historique des Stages</span>
            </button>

            <!-- Bouton Demander un autre stage (Actif seulement si pas engagé) -->
            <div class="relative group z-40">
              <button
                type="button"
                (click)="openNewStageWizard()"
                [disabled]="isEngaged"
                class="px-4 py-2.5 rounded-xl font-syne font-bold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer"
                [ngClass]="
                  isEngaged
                    ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white hover:shadow-[0_0_20px_rgba(198,39,97,0.4)] hover:scale-102 active:scale-98'
                "
              >
                <!-- Icon if locked / active -->
                <svg
                  *ngIf="isEngaged"
                  class="w-4 h-4 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <svg
                  *ngIf="!isEngaged"
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Demander un autre stage</span>
              </button>

              <!-- Tooltip if engaged with high z-index and dual theme support -->
              <div
                *ngIf="isEngaged"
                class="stage-tooltip-box absolute right-0 top-full mt-2.5 w-80 p-3.5 rounded-2xl border shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none"
              >
                <!-- Arrow pointing to button -->
                <div
                  class="stage-tooltip-arrow absolute -top-1.5 right-8 w-3 h-3 rotate-45 border-t border-l border-amber-500/40 bg-[#10102A]"
                ></div>

                <div class="flex items-start gap-2.5 relative z-10">
                  <div
                    class="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div>
                    <span class="stage-tooltip-title text-amber-400 font-bold block text-xs mb-1">
                      Action temporairement indisponible
                    </span>
                    <p
                      class="stage-tooltip-desc text-[11px] leading-relaxed text-[var(--bridge-text-muted)]"
                    >
                      Vous avez déjà un stage en cours (statut :
                      <strong class="text-[var(--bridge-text)]">{{
                        getStatusLabel(inscription?.status)
                      }}</strong
                      >). L'administration n'autorise qu'une seule convention active à la fois. Vous
                      pourrez soumettre une nouvelle demande dès sa clôture.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Engaged Stage Notice Banner inside Header (if engaged) -->
        <div
          *ngIf="isEngaged"
          class="mt-4 pt-3 border-t border-white/10 theme-engaged-banner flex items-center gap-2 text-xs text-amber-400/90"
        >
          <svg
            class="w-4 h-4 flex-shrink-0 text-amber-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            Vous avez actuellement un stage actif ou en cours de traitement. La soumission d'une
            nouvelle convention sera disponible dès sa clôture administrative.
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="py-20 text-center text-[var(--bridge-text-muted)]">
        <div
          class="w-10 h-10 border-3 border-[var(--bridge-crimson)] border-t-transparent rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-sm">Chargement de votre dossier de stage...</p>
      </div>

      <!-- No Inscription State -->
      <div
        *ngIf="!loading && !inscription"
        class="glass-card theme-panel border border-[var(--bridge-border)] p-10 rounded-3xl text-center space-y-5 max-w-lg mx-auto bg-[var(--bridge-card)]"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-white/5 border border-[var(--bridge-border)] flex items-center justify-center mx-auto text-white/40 shadow-inner"
        >
          <svg
            class="w-8 h-8 text-[var(--bridge-gold)]"
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
          <h3 class="font-syne font-bold text-xl text-[var(--bridge-text)]">
            Aucun stage ou onboarding en cours
          </h3>
          <p class="text-xs text-[var(--bridge-text-muted)] leading-relaxed mt-1.5">
            Vous n'avez pas encore finalisé votre demande de stage facultatif ou votre parcours
            d'onboarding.
          </p>
        </div>
        <div class="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            (click)="openNewStageWizard()"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-syne font-bold text-xs shadow-lg hover:shadow-[0_0_20px_rgba(198,39,97,0.4)] transition-all cursor-pointer"
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
            <span>Demander mon Stage Facultatif</span>
          </button>
        </div>
      </div>

      <!-- Main Inscription Details Content -->
      <div *ngIf="!loading && inscription" class="space-y-6">
        <!-- Stage APPROVED & STRIPE UNPAID Action Banner -->
        <div
          *ngIf="canPayWithStripe"
          class="glass-card p-6 md:p-7 rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-[#635BFF]/20 via-indigo-900/30 to-purple-900/20 shadow-xl relative overflow-hidden animate-fadeIn"
        >
          <div
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-14 h-14 rounded-2xl bg-[#635BFF] flex items-center justify-center text-white text-2xl shadow-lg shadow-[#635BFF]/30 flex-shrink-0"
              >
                <svg
                  class="w-7 h-7"
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
                <div class="flex items-center gap-2 flex-wrap">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  >
                    Stage Approuvé
                  </span>
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  >
                    Paiement Stripe Requis
                  </span>
                </div>
                <h3 class="font-syne font-bold text-lg md:text-xl text-[var(--bridge-text)] mt-1">
                  Réglez votre convention de stage en ligne
                </h3>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                  Votre stage a été validé par l'administration. Vous pouvez maintenant régler votre
                  montant de
                  <strong class="text-[var(--bridge-gold)]"
                    >{{ inscription.totalPrice || 0 }} TND</strong
                  >
                  via le portail sécurisé Stripe.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                (click)="payWithStripe()"
                [disabled]="payingWithStripe"
                class="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#635BFF] to-[#7A73FF] hover:from-[#5851EA] hover:to-[#6C65F5] text-white font-syne font-bold text-xs shadow-lg hover:shadow-[0_0_25px_rgba(99,91,255,0.5)] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 flex-shrink-0"
              >
                <span
                  *ngIf="payingWithStripe"
                  class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></span>
                <svg
                  *ngIf="!payingWithStripe"
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
                  payingWithStripe ? 'Ouverture Stripe...' : 'Payer maintenant avec Stripe'
                }}</span>
                <svg
                  *ngIf="!payingWithStripe"
                  class="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Stage COMPLETED Celebration & Attestation Card -->
        <div
          *ngIf="inscription.status === 'COMPLETED'"
          class="glass-card p-6 md:p-7 rounded-3xl border border-blue-500/40 bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 shadow-xl relative overflow-hidden"
        >
          <div
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl shadow-lg flex-shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M2 10l10-5 10 5-10 5-10-5z" />
                  <path d="M6 12v5c3 2 9 2 12 0v-5" />
                  <path d="M22 10v6" />
                </svg>
              </div>
              <div>
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30"
                >
                  Stage Officiellement Clôturé
                </span>
                <h3 class="font-syne font-bold text-lg md:text-xl text-[var(--bridge-text)] mt-1">
                  Attestation de Stage Professionnelle Disponible
                </h3>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                  Félicitations pour la complétion de votre stage ! Votre attestation officielle
                  signée par 9antra a été générée.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto">
              <a
                *ngIf="inscription.attestationPdfUrl"
                [href]="inscription.attestationPdfUrl"
                target="_blank"
                class="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-syne font-bold text-xs shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                <span>Télécharger l'Attestation (PDF)</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Admin Note Alert if present -->
        <div
          *ngIf="inscription.adminNotes"
          class="p-4.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3.5 shadow-md"
        >
          <div
            class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5"
          >
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <span class="font-bold block mb-1 text-amber-200"
              >Note de l'administration 9antra :</span
            >
            <p class="leading-relaxed text-amber-300/90">{{ inscription.adminNotes }}</p>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <!-- Left Column (2 Cols): Project Info + Documents + Formations -->
          <div class="md:col-span-2 space-y-6">
            <!-- Card 1: Project Details -->
            <div
              class="glass-card theme-panel border border-[var(--bridge-border)] p-6 rounded-2xl space-y-4 bg-[var(--bridge-card)]"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-xl bg-[rgba(245,166,35,0.15)] text-[var(--bridge-gold)] flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-syne font-bold text-base text-[var(--bridge-text)]">
                    Projet & Convention de Stage
                  </h3>
                  <p class="text-[11px] text-[var(--bridge-text-muted)]">
                    Informations déclarées lors de votre demande
                  </p>
                </div>
              </div>

              <div class="grid sm:grid-cols-2 gap-4 text-xs pt-1">
                <div
                  class="p-4 rounded-xl bg-white/[0.02] theme-sub-card border border-white/5 space-y-1"
                >
                  <span class="text-[var(--bridge-text-muted)] block">Titre du Projet</span>
                  <p class="text-[var(--bridge-text)] font-semibold text-sm">
                    {{ inscription.stageProjectTitle || 'Non renseigné' }}
                  </p>
                </div>

                <div
                  class="p-4 rounded-xl bg-white/[0.02] theme-sub-card border border-white/5 space-y-1"
                >
                  <span class="text-[var(--bridge-text-muted)] block">Durée Prévue</span>
                  <p class="text-[var(--bridge-text)] font-semibold text-sm">
                    {{ inscription.stageDurationWeeks || 12 }} semaines ({{
                      ((inscription.stageDurationWeeks || 12) / 4).toFixed(1)
                    }}
                    mois)
                  </p>
                </div>

                <div
                  class="p-4 rounded-xl bg-white/[0.02] theme-sub-card border border-white/5 space-y-1"
                >
                  <span class="text-[var(--bridge-text-muted)] block">Date de Soumission</span>
                  <p class="text-[var(--bridge-text)] font-semibold">
                    {{ inscription.createdAt | date: 'dd MMMM yyyy' }}
                  </p>
                </div>

                <div
                  class="p-4 rounded-xl bg-white/[0.02] theme-sub-card border border-white/5 space-y-1"
                >
                  <span class="text-[var(--bridge-text-muted)] block">Type d'engagement</span>
                  <p class="text-emerald-500 font-semibold">
                    {{
                      inscription.wantsInternship
                        ? 'Convention de stage facultatif'
                        : 'Formations certifiantes'
                    }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Card 2: Documents Attachés (PDFs) -->
            <div
              class="glass-card theme-panel border border-[var(--bridge-border)] p-6 rounded-2xl space-y-4 bg-[var(--bridge-card)]"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-xl bg-[rgba(198,39,97,0.15)] text-[#C62761] flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="font-syne font-bold text-base text-[var(--bridge-text)]">
                    Documents & Conventions (PDF)
                  </h3>
                  <p class="text-[11px] text-[var(--bridge-text-muted)]">
                    Fichiers officiels téléchargés et validés
                  </p>
                </div>
              </div>

              <div class="grid sm:grid-cols-2 gap-4 pt-1">
                <!-- Demande de stage PDF -->
                <div
                  class="p-4 rounded-xl bg-white/[0.02] theme-sub-card border border-white/5 flex items-center justify-between gap-3"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div
                      class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0"
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
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-semibold text-[var(--bridge-text)] truncate">
                        Demande de stage
                      </p>
                      <span class="text-[10px] text-[var(--bridge-text-muted)]"
                        >Fichier PDF officiel</span
                      >
                    </div>
                  </div>

                  <a
                    *ngIf="inscription.demandeStageUrl"
                    [href]="inscription.demandeStageUrl"
                    target="_blank"
                    class="px-3 py-1.5 rounded-lg bg-[var(--bridge-crimson)] hover:opacity-90 text-white text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 shadow-md"
                  >
                    <span>Voir</span>
                    <svg
                      class="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                  <span
                    *ngIf="!inscription.demandeStageUrl"
                    class="text-[11px] text-[var(--bridge-text-muted)] italic"
                    >Non fourni</span
                  >
                </div>

                <!-- Lettre d'affectation PDF -->
                <div
                  class="p-4 rounded-xl bg-white/[0.02] theme-sub-card border border-white/5 flex items-center justify-between gap-3"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div
                      class="w-10 h-10 rounded-xl bg-amber-500/10 text-[var(--bridge-gold)] border border-amber-500/20 flex items-center justify-center flex-shrink-0"
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
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-semibold text-[var(--bridge-text)] truncate">
                        Lettre d'affectation
                      </p>
                      <span class="text-[10px] text-[var(--bridge-text-muted)]"
                        >Fichier PDF officiel</span
                      >
                    </div>
                  </div>

                  <a
                    *ngIf="inscription.lettreAffectationUrl"
                    [href]="inscription.lettreAffectationUrl"
                    target="_blank"
                    class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#F5A623] to-amber-500 hover:opacity-90 text-[#10102A] text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 shadow-md"
                  >
                    <span>Voir</span>
                    <svg
                      class="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                  <span
                    *ngIf="!inscription.lettreAffectationUrl"
                    class="text-[11px] text-[var(--bridge-text-muted)] italic"
                    >Non fourni</span
                  >
                </div>
              </div>
            </div>

            <!-- Card 3: Modules de Formation Associés -->
            <div
              class="glass-card theme-panel border border-[var(--bridge-border)] p-6 rounded-2xl space-y-4 bg-[var(--bridge-card)]"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-syne font-bold text-base text-[var(--bridge-text)]">
                    Modules de Formation Associés
                  </h3>
                  <p class="text-[11px] text-[var(--bridge-text-muted)]">
                    Parcours et compétences inclus dans votre programme
                  </p>
                </div>
              </div>

              <div
                *ngIf="
                  !inscription.selectedFormationTitles ||
                  inscription.selectedFormationTitles.length === 0
                "
                class="text-xs text-[var(--bridge-text-muted)] italic pt-1"
              >
                Aucun module spécifique n'a été lié à cette convention.
              </div>

              <div
                *ngIf="
                  inscription.selectedFormationTitles &&
                  inscription.selectedFormationTitles.length > 0
                "
                class="grid sm:grid-cols-2 gap-3 pt-1"
              >
                <div
                  *ngFor="let title of inscription.selectedFormationTitles"
                  class="p-3.5 rounded-xl bg-white/[0.03] theme-sub-card border border-white/5 flex items-center gap-3"
                >
                  <div
                    class="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs font-bold flex-shrink-0"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span class="text-xs font-semibold text-[var(--bridge-text)] truncate">{{
                    title
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column (1 Col): Supervisor & Financial Summary -->
          <div class="space-y-6">
            <!-- Encadrant Pédagogique Card (si assigné) -->
            <div
              *ngIf="inscription.supervisorFirstName"
              class="glass-card theme-panel border border-emerald-500/30 p-6 rounded-2xl space-y-3.5 bg-emerald-500/[0.02]"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-emerald-500">
                  <svg
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <h4 class="font-syne font-bold text-xs uppercase tracking-wider">
                    Encadrant Pédagogique
                  </h4>
                </div>
                <span
                  class="text-[9px] font-bold text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded uppercase"
                >
                  Assigné
                </span>
              </div>

              <div
                class="p-3.5 rounded-xl bg-white/[0.03] theme-sub-card border border-white/5 flex items-center gap-3"
              >
                <div
                  class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow-md"
                >
                  <img
                    *ngIf="inscription.supervisorAvatar"
                    [src]="inscription.supervisorAvatar"
                    class="w-full h-full rounded-full object-cover"
                    alt=""
                  />
                  <span *ngIf="!inscription.supervisorAvatar">
                    {{
                      (inscription.supervisorFirstName[0] || '') +
                        (inscription.supervisorLastName?.[0] || '')
                    }}
                  </span>
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-[var(--bridge-text)] text-xs truncate">
                    {{ inscription.supervisorFirstName }} {{ inscription.supervisorLastName }}
                  </p>
                  <span class="text-[10px] text-[var(--bridge-text-muted)] truncate block">{{
                    inscription.supervisorEmail
                  }}</span>
                </div>
              </div>

              <a
                *ngIf="inscription.supervisorEmail"
                [href]="'mailto:' + inscription.supervisorEmail"
                class="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--bridge-text)] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg
                  class="w-3.5 h-3.5 text-[var(--bridge-gold)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span>Contacter mon encadrant</span>
              </a>
            </div>

            <!-- Financial Summary Card -->
            <div
              class="glass-card theme-panel border border-[var(--bridge-border)] p-6 rounded-2xl space-y-4 bg-[var(--bridge-card)]"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-xl bg-[rgba(245,166,35,0.15)] text-[var(--bridge-gold)] flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-4 h-4"
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
                  <h3 class="font-syne font-bold text-base text-[var(--bridge-text)]">
                    Règlement & Dossier
                  </h3>
                  <p class="text-[11px] text-[var(--bridge-text-muted)]">État de facturation</p>
                </div>
              </div>

              <div class="space-y-3 text-xs pt-1">
                <div class="flex justify-between items-center py-2 border-b border-white/5">
                  <span class="text-[var(--bridge-text-muted)]">Prix Original</span>
                  <span class="font-mono text-[var(--bridge-text)]"
                    >{{ inscription.originalPrice || 0 }} TND</span
                  >
                </div>

                <div
                  *ngIf="inscription.discountAmount && inscription.discountAmount > 0"
                  class="flex justify-between items-center py-2 border-b border-white/5 text-emerald-500"
                >
                  <span>{{ inscription.discountReason || 'Remise appliquée' }}</span>
                  <span class="font-mono font-bold">-{{ inscription.discountAmount }} TND</span>
                </div>

                <div class="flex justify-between items-center py-2 border-b border-white/5">
                  <span class="text-[var(--bridge-text-muted)]">Mode de paiement</span>
                  <span class="font-bold text-[var(--bridge-text)]">{{
                    inscription.paymentMode || 'Non défini'
                  }}</span>
                </div>

                <div class="flex justify-between items-center py-2 border-b border-white/5">
                  <span class="text-[var(--bridge-text-muted)]">Statut Règlement</span>
                  <span
                    class="font-bold px-2 py-0.5 rounded text-[10px]"
                    [ngClass]="
                      inscription.adminPaymentConfirmed || inscription.stripePaymentConfirmed
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-amber-500/20 text-amber-500'
                    "
                  >
                    {{
                      inscription.adminPaymentConfirmed || inscription.stripePaymentConfirmed
                        ? 'PAYÉ'
                        : 'EN ATTENTE'
                    }}
                  </span>
                </div>

                <div class="pt-3 flex justify-between items-center">
                  <span class="font-syne font-bold text-sm text-[var(--bridge-text)]"
                    >Total Final</span
                  >
                  <span class="font-mono font-bold text-lg text-[var(--bridge-gold)]">
                    {{ inscription.totalPrice || 0 }} TND
                  </span>
                </div>

                <!-- Bouton Payer avec Stripe dans la carte financière -->
                <div *ngIf="canPayWithStripe" class="pt-3 border-t border-white/5">
                  <button
                    type="button"
                    (click)="payWithStripe()"
                    [disabled]="payingWithStripe"
                    class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#635BFF] to-[#7A73FF] hover:from-[#5851EA] hover:to-[#6C65F5] text-white font-syne font-bold text-xs shadow-md hover:shadow-[0_0_20px_rgba(99,91,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span
                      *ngIf="payingWithStripe"
                      class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></span>
                    <svg
                      *ngIf="!payingWithStripe"
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                    <span>{{ payingWithStripe ? 'Ouverture...' : 'Payer avec Stripe' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Contact Support CTA -->
            <div
              class="p-5 rounded-2xl bg-white/[0.02] theme-sub-card border border-white/5 text-center space-y-2"
            >
              <div
                class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mx-auto text-[var(--bridge-text-muted)]"
              >
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <p class="text-xs font-semibold text-[var(--bridge-text)]">
                Une question sur votre convention ?
              </p>
              <p class="text-[11px] text-[var(--bridge-text-muted)]">
                L'équipe administrative 9antra est à votre écoute pour vous accompagner.
              </p>
              <a
                href="mailto:contact@9antra.tn"
                class="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[var(--bridge-gold)] hover:underline"
              >
                <span>Contacter l'administration</span>
                <svg
                  class="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════════════ -->
      <!-- MODAL WIZARD: DEMANDER UN AUTRE STAGE (FLOW COMPLET ÉTAPE PAR ÉTAPE) -->
      <!-- ════════════════════════════════════════════════════════════════════ -->
      <div *ngIf="showNewStageModal" class="modal-overlay">
        <!-- Backdrop -->
        <div class="modal-backdrop" (click)="closeNewStageWizard()"></div>

        <!-- Modal Panel -->
        <div
          class="modal-panel theme-panel w-full max-w-3xl bg-[#0d0d21] border border-white/15 rounded-3xl shadow-2xl animate-scale-in"
          (click)="$event.stopPropagation()"
        >
          <!-- Gradient Top Line -->
          <div
            class="h-1.5 w-full bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623] flex-shrink-0"
          ></div>

          <!-- Wizard Header -->
          <div
            class="px-6 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0"
          >
            <div>
              <span
                class="text-[10px] font-bold text-[var(--bridge-gold)] uppercase tracking-wider"
              >
                Étape {{ currentStepIndex + 1 }} / {{ wizardSteps.length }} : {{ currentStepTitle }}
              </span>
              <h3 class="font-syne font-bold text-lg text-[var(--bridge-text)]">
                Demande d'un Nouveau Stage Facultatif
              </h3>
            </div>
            <button
              type="button"
              (click)="closeNewStageWizard()"
              class="theme-close-btn w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>

          <!-- Progress Bar & Stepper Tabs -->
          <div class="px-6 pt-3 pb-2 bg-white/[0.02] border-b border-white/5 flex-shrink-0">
            <!-- Progress Bar -->
            <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-3">
              <div
                class="h-full bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623] transition-all duration-300"
                [style.width.%]="getProgressPercentage()"
              ></div>
            </div>

            <!-- Step Pills -->
            <div class="flex items-center justify-between overflow-x-auto gap-2 py-1">
              <div
                *ngFor="let step of wizardSteps; let i = index"
                (click)="i <= currentStepIndex ? (currentStepIndex = i) : null"
                class="flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                [class.opacity-40]="i > currentStepIndex"
              >
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                  [ngClass]="{
                    'bg-emerald-500 text-white shadow-md': i < currentStepIndex,
                    'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-lg ring-2 ring-white/30':
                      i === currentStepIndex,
                    'bg-white/10 text-white/50': i > currentStepIndex,
                  }"
                >
                  <span *ngIf="i < currentStepIndex">✓</span>
                  <span *ngIf="i >= currentStepIndex">{{ i + 1 }}</span>
                </div>
                <span
                  class="text-[11px] font-medium hidden sm:inline"
                  [class]="
                    i === currentStepIndex
                      ? 'text-[var(--bridge-text)] font-bold'
                      : 'text-[var(--bridge-text-muted)]'
                  "
                >
                  {{ step.label }}
                </span>
              </div>
            </div>
          </div>

          <!-- Wizard Body (Scrollable) -->
          <div class="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-[var(--bridge-text)]">
            <!-- ════════════════════════════════════════════════════════════ -->
            <!-- STEP 1 : DÉTAILS DU STAGE & DOCUMENTS                        -->
            <!-- ════════════════════════════════════════════════════════════ -->
            <div *ngIf="currentStepId === 'stage_details'" class="space-y-5 animate-fadeIn">
              <div>
                <span class="text-xs font-bold text-[var(--bridge-gold)] uppercase tracking-wider"
                  >Convention de Stage</span
                >
                <h4 class="font-syne font-bold text-lg text-[var(--bridge-text)] mt-0.5">
                  Projet de stage & Pièces justificatives
                </h4>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-1">
                  Définissez votre sujet de stage et chargez vos documents officiels en format PDF.
                </p>
              </div>

              <!-- Titre du projet -->
              <div>
                <label class="block font-semibold mb-1.5 text-[var(--bridge-text)]">
                  Titre / Thème du projet de stage <span class="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="newStageTitle"
                  placeholder="Ex: Conception d'une plateforme Fullstack avec Spring Boot et Angular"
                  class="theme-input w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[var(--bridge-crimson)] transition-all"
                />
              </div>

              <!-- Durée estimée slider -->
              <div>
                <label class="block font-semibold mb-1.5 text-[var(--bridge-text)]">
                  Durée estimée du stage (en semaines) <span class="text-rose-500">*</span>
                </label>
                <div class="flex items-center gap-4">
                  <input
                    type="range"
                    min="4"
                    max="24"
                    step="1"
                    [(ngModel)]="newStageDurationWeeks"
                    class="flex-1 accent-[var(--bridge-crimson)] cursor-pointer"
                  />
                  <span
                    class="px-4 py-2 bg-white/10 theme-sub-card rounded-xl font-mono font-bold text-xs text-[var(--bridge-text)] min-w-[110px] text-center border border-white/10"
                  >
                    {{ newStageDurationWeeks }} sem. ({{ (newStageDurationWeeks / 4).toFixed(1) }}
                    mois)
                  </span>
                </div>
              </div>

              <!-- Drag & Drop Zones: Demande & Lettre -->
              <div class="grid sm:grid-cols-2 gap-4 pt-2">
                <!-- Demande de stage -->
                <div
                  (dragover)="onDragOver($event, 'demande')"
                  (dragleave)="onDragLeave('demande')"
                  (drop)="onDropFile($event, 'demande')"
                  (click)="demandeFileInput.click()"
                  class="theme-sub-card p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center relative flex flex-col items-center justify-center min-h-[150px]"
                  [ngClass]="{
                    'border-[var(--bridge-crimson)] bg-[rgba(198,39,97,0.1)]': isDragOverDemande,
                    'border-emerald-500/50 bg-emerald-500/5': demandeFile,
                    'border-white/15 bg-white/[0.02] hover:border-white/30':
                      !demandeFile && !isDragOverDemande,
                  }"
                >
                  <input
                    #demandeFileInput
                    type="file"
                    accept="application/pdf"
                    (change)="onFileSelected($event, 'demande')"
                    class="hidden"
                  />

                  <div *ngIf="!demandeFile" class="space-y-1.5">
                    <div
                      class="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center mx-auto text-rose-400"
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
                      </svg>
                    </div>
                    <p class="text-xs font-semibold text-[var(--bridge-text)]">
                      Demande de stage (PDF)
                    </p>
                    <p class="text-[10px] text-[var(--bridge-text-muted)]">
                      Glissez votre PDF ici ou cliquez
                    </p>
                  </div>

                  <div *ngIf="demandeFile" class="flex flex-col items-center space-y-1.5">
                    <span
                      class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold"
                      >✓</span
                    >
                    <p
                      class="text-xs font-semibold text-[var(--bridge-text)] truncate max-w-[200px]"
                    >
                      {{ demandeFile.name }}
                    </p>
                    <p class="text-[10px] text-emerald-400">
                      {{ formatFileSize(demandeFile.size) }}
                    </p>
                    <button
                      type="button"
                      (click)="$event.stopPropagation(); removeFile('demande')"
                      class="text-[10px] text-rose-400 hover:underline cursor-pointer"
                    >
                      Remplacer
                    </button>
                  </div>
                </div>

                <!-- Lettre d'affectation -->
                <div
                  (dragover)="onDragOver($event, 'lettre')"
                  (dragleave)="onDragLeave('lettre')"
                  (drop)="onDropFile($event, 'lettre')"
                  (click)="lettreFileInput.click()"
                  class="theme-sub-card p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center relative flex flex-col items-center justify-center min-h-[150px]"
                  [ngClass]="{
                    'border-[var(--bridge-gold)] bg-[rgba(245,166,35,0.1)]': isDragOverLettre,
                    'border-emerald-500/50 bg-emerald-500/5': lettreFile,
                    'border-white/15 bg-white/[0.02] hover:border-white/30':
                      !lettreFile && !isDragOverLettre,
                  }"
                >
                  <input
                    #lettreFileInput
                    type="file"
                    accept="application/pdf"
                    (change)="onFileSelected($event, 'lettre')"
                    class="hidden"
                  />

                  <div *ngIf="!lettreFile" class="space-y-1.5">
                    <div
                      class="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center mx-auto text-[var(--bridge-gold)]"
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
                      </svg>
                    </div>
                    <p class="text-xs font-semibold text-[var(--bridge-text)]">
                      Lettre d'affectation / Convention
                    </p>
                    <p class="text-[10px] text-[var(--bridge-text-muted)]">
                      Glissez votre PDF ici ou cliquez
                    </p>
                  </div>

                  <div *ngIf="lettreFile" class="flex flex-col items-center space-y-1.5">
                    <span
                      class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold"
                      >✓</span
                    >
                    <p
                      class="text-xs font-semibold text-[var(--bridge-text)] truncate max-w-[200px]"
                    >
                      {{ lettreFile.name }}
                    </p>
                    <p class="text-[10px] text-emerald-400">
                      {{ formatFileSize(lettreFile.size) }}
                    </p>
                    <button
                      type="button"
                      (click)="$event.stopPropagation(); removeFile('lettre')"
                      class="text-[10px] text-rose-400 hover:underline cursor-pointer"
                    >
                      Remplacer
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- ════════════════════════════════════════════════════════════ -->
            <!-- STEP 2 : FORMATIONS CERTIFIANTES                             -->
            <!-- ════════════════════════════════════════════════════════════ -->
            <div *ngIf="currentStepId === 'formations'" class="space-y-4 animate-fadeIn">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-xs font-bold text-[var(--bridge-gold)] uppercase tracking-wider"
                    >Catalogue Actif</span
                  >
                  <h4 class="font-syne font-bold text-lg text-[var(--bridge-text)] mt-0.5">
                    Sélectionnez vos modules de formation
                  </h4>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                    Associez les modules certifiants nécessaires à la réalisation de votre projet.
                  </p>
                </div>
                <span
                  class="px-3 py-1 rounded-xl bg-white/10 theme-sub-card border border-white/10 text-xs font-bold text-[var(--bridge-text)]"
                >
                  {{ selectedFormationIds.length }} sélectionnée(s)
                </span>
              </div>

              <!-- Loading formations -->
              <div
                *ngIf="loadingFormations"
                class="py-10 text-center text-[var(--bridge-text-muted)]"
              >
                <div
                  class="w-8 h-8 border-2 border-[var(--bridge-crimson)] border-t-transparent rounded-full animate-spin mx-auto mb-2"
                ></div>
                <p>Chargement du catalogue...</p>
              </div>

              <!-- Grid formations -->
              <div
                *ngIf="!loadingFormations"
                class="grid sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1"
              >
                <div
                  *ngFor="let f of availableFormations"
                  (click)="toggleFormation(f.id)"
                  class="theme-sub-card p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group"
                  [ngClass]="
                    isFormationSelected(f.id)
                      ? 'border-[var(--bridge-crimson)] bg-[rgba(198,39,97,0.1)] shadow-md'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  "
                >
                  <div>
                    <div class="flex items-center justify-between gap-2">
                      <span
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-[var(--bridge-gold)]"
                      >
                        {{ f.category || 'FORMATION' }}
                      </span>
                      <div
                        class="w-5 h-5 rounded-md border flex items-center justify-center transition-all"
                        [ngClass]="
                          isFormationSelected(f.id)
                            ? 'bg-[var(--bridge-crimson)] border-[var(--bridge-crimson)] text-white'
                            : 'border-white/30'
                        "
                      >
                        <span *ngIf="isFormationSelected(f.id)" class="text-[10px] font-bold"
                          >✓</span
                        >
                      </div>
                    </div>

                    <h5
                      class="font-syne font-bold text-sm text-[var(--bridge-text)] mt-2 line-clamp-1 group-hover:text-[var(--bridge-gold)] transition-colors"
                    >
                      {{ f.nom }}
                    </h5>
                    <p
                      class="text-xs text-[var(--bridge-text-muted)] mt-1 line-clamp-2 leading-relaxed"
                    >
                      {{ f.description }}
                    </p>
                  </div>

                  <div
                    class="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs"
                  >
                    <span class="text-[var(--bridge-text-muted)]"
                      >{{ f.phases.length || 1 }} phase(s)</span
                    >
                    <span class="font-mono font-bold text-[var(--bridge-gold)]"
                      >{{ f.totalPrice || 0 }} TND</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- ════════════════════════════════════════════════════════════ -->
            <!-- STEP 3 : PARRAINAGE                                          -->
            <!-- ════════════════════════════════════════════════════════════ -->
            <div *ngIf="currentStepId === 'referral'" class="space-y-4 animate-fadeIn">
              <div>
                <span class="text-xs font-bold text-[var(--bridge-gold)] uppercase tracking-wider"
                  >Programme Communauté</span
                >
                <h4 class="font-syne font-bold text-lg text-[var(--bridge-text)] mt-0.5">
                  Parrainez un ami & offrez-lui 10% de réduction
                </h4>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                  Invitez un proche à rejoindre The Bridge pour son stage ou ses formations
                  certifiantes.
                </p>
              </div>

              <div
                class="theme-sub-card p-6 rounded-2xl bg-gradient-to-r from-[rgba(198,39,97,0.08)] to-[rgba(245,166,35,0.04)] border border-white/10 space-y-4"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-[var(--bridge-gold)]/20 text-[var(--bridge-gold)] flex items-center justify-center text-xl"
                  >
                    🎁
                  </div>
                  <div>
                    <h5 class="font-syne font-bold text-sm text-[var(--bridge-text)]">
                      Avantage Parrainage 9antra
                    </h5>
                    <p class="text-xs text-[var(--bridge-text-muted)]">
                      Un coupon officiel de 10% lui sera envoyé immédiatement par email.
                    </p>
                  </div>
                </div>

                <div>
                  <label class="block font-semibold mb-1 text-[var(--bridge-text)]">
                    Adresse email de votre filleul (Optionnel)
                  </label>
                  <input
                    type="email"
                    [(ngModel)]="referralEmail"
                    placeholder="ami@exemple.com"
                    class="theme-input w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[var(--bridge-crimson)] transition-all"
                  />
                </div>

                <p class="text-[11px] text-[var(--bridge-text-muted)] italic">
                  * Facultatif : vous pouvez laisser ce champ vide si vous ne souhaitez pas
                  parrainer maintenant.
                </p>
              </div>
            </div>

            <!-- ════════════════════════════════════════════════════════════ -->
            <!-- STEP 4 : MODE DE PAIEMENT & FINANCEMENT                      -->
            <!-- ════════════════════════════════════════════════════════════ -->
            <div *ngIf="currentStepId === 'payment'" class="space-y-5 animate-fadeIn">
              <div>
                <span class="text-xs font-bold text-[var(--bridge-gold)] uppercase tracking-wider"
                  >Financement</span
                >
                <h4 class="font-syne font-bold text-lg text-[var(--bridge-text)] mt-0.5">
                  Choisissez votre modalité de règlement
                </h4>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                  Profitez de 10% de réduction immédiate pour tout paiement comptant dès
                  l'inscription.
                </p>
              </div>

              <!-- Option: COMPTANT vs FACILITÉ -->
              <div class="grid sm:grid-cols-2 gap-4">
                <div
                  (click)="paymentPlan = 'COMPTANT'"
                  class="theme-sub-card p-4 rounded-2xl border-2 transition-all cursor-pointer"
                  [ngClass]="
                    paymentPlan === 'COMPTANT'
                      ? 'border-[var(--bridge-crimson)] bg-[rgba(198,39,97,0.1)] shadow-md'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  "
                >
                  <div class="flex items-center justify-between mb-1.5">
                    <h5 class="font-syne font-bold text-sm text-[var(--bridge-text)]">
                      Paiement Comptant
                    </h5>
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                    >
                      -10% Remise
                    </span>
                  </div>
                  <p class="text-xs text-[var(--bridge-text-muted)]">
                    Réglez en une seule fois et bénéficiez de 10% de déduction immédiate.
                  </p>
                </div>

                <div
                  (click)="paymentPlan = 'FACILITE'"
                  class="theme-sub-card p-4 rounded-2xl border-2 transition-all cursor-pointer"
                  [ngClass]="
                    paymentPlan === 'FACILITE'
                      ? 'border-[var(--bridge-gold)] bg-[rgba(245,166,35,0.1)] shadow-md'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  "
                >
                  <div class="flex items-center justify-between mb-1.5">
                    <h5 class="font-syne font-bold text-sm text-[var(--bridge-text)]">
                      Paiement par Facilité
                    </h5>
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-[var(--bridge-text-muted)]"
                    >
                      Échelonné
                    </span>
                  </div>
                  <p class="text-xs text-[var(--bridge-text-muted)]">
                    Réglez étape par étape au fil de votre avancement académique.
                  </p>
                </div>
              </div>

              <!-- Méthode de paiement -->
              <div>
                <label class="block font-semibold mb-2.5 text-[var(--bridge-text)]">
                  Moyen de paiement préféré
                </label>
                <div class="grid sm:grid-cols-3 gap-3">
                  <!-- Stripe -->
                  <div
                    (click)="paymentMethod = 'STRIPE'"
                    class="theme-sub-card p-3.5 rounded-xl border transition-all cursor-pointer text-center"
                    [ngClass]="
                      paymentMethod === 'STRIPE'
                        ? 'border-[var(--bridge-crimson)] bg-white/10 shadow-md font-bold'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
                    "
                  >
                    <div
                      class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-1.5"
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
                    </div>
                    <span class="text-xs text-[var(--bridge-text)] block">Carte / Stripe</span>
                    <span class="text-[10px] text-[var(--bridge-text-muted)]"
                      >En ligne sécurisé</span
                    >
                  </div>

                  <!-- Main-à-main -->
                  <div
                    (click)="paymentMethod = 'MAIN_A_MAIN'"
                    class="theme-sub-card p-3.5 rounded-xl border transition-all cursor-pointer text-center"
                    [ngClass]="
                      paymentMethod === 'MAIN_A_MAIN'
                        ? 'border-[var(--bridge-gold)] bg-white/10 shadow-md font-bold'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
                    "
                  >
                    <div
                      class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-1.5"
                    >
                      <svg
                        class="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <span class="text-xs text-[var(--bridge-text)] block">Main à main</span>
                    <span class="text-[10px] text-[var(--bridge-text-muted)]"
                      >Au centre 9antra</span
                    >
                  </div>

                  <!-- Virement bancaire -->
                  <div
                    (click)="paymentMethod = 'BANQUE'"
                    class="theme-sub-card p-3.5 rounded-xl border transition-all cursor-pointer text-center"
                    [ngClass]="
                      paymentMethod === 'BANQUE'
                        ? 'border-blue-400 bg-white/10 shadow-md font-bold'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
                    "
                  >
                    <div
                      class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-1.5"
                    >
                      <svg
                        class="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                    </div>
                    <span class="text-xs text-[var(--bridge-text)] block">Virement bancaire</span>
                    <span class="text-[10px] text-[var(--bridge-text-muted)]">RIB / Transfert</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ════════════════════════════════════════════════════════════ -->
            <!-- STEP 5 : COMMENT AVEZ-VOUS CONNU 9ANTRA ?                    -->
            <!-- ════════════════════════════════════════════════════════════ -->
            <div *ngIf="currentStepId === 'heard_from'" class="space-y-4 animate-fadeIn">
              <div>
                <span class="text-xs font-bold text-[var(--bridge-gold)] uppercase tracking-wider"
                  >Enquête</span
                >
                <h4 class="font-syne font-bold text-lg text-[var(--bridge-text)] mt-0.5">
                  Comment avez-vous connu 9antra ?
                </h4>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                  Aidez-nous à mieux comprendre votre parcours jusqu'à The Bridge.
                </p>
              </div>

              <div class="grid sm:grid-cols-2 gap-3">
                <div
                  *ngFor="let source of sourceOptions"
                  (click)="toggleSource(source.key)"
                  class="theme-sub-card p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3"
                  [ngClass]="
                    selectedSources.includes(source.key)
                      ? 'border-[var(--bridge-crimson)] bg-[rgba(198,39,97,0.1)] text-[var(--bridge-text)] font-semibold'
                      : 'border-white/10 bg-white/[0.02] text-[var(--bridge-text-muted)] hover:bg-white/5'
                  "
                >
                  <div
                    class="w-5 h-5 rounded border flex items-center justify-center flex-shrink-0"
                    [ngClass]="
                      selectedSources.includes(source.key)
                        ? 'bg-[var(--bridge-crimson)] border-[var(--bridge-crimson)] text-white'
                        : 'border-white/30'
                    "
                  >
                    <span *ngIf="selectedSources.includes(source.key)" class="text-[10px] font-bold"
                      >✓</span
                    >
                  </div>
                  <span class="text-xs">{{ source.label }}</span>
                </div>
              </div>

              <div *ngIf="selectedSources.includes('AUTRE')" class="mt-2 animate-fadeIn">
                <label class="block font-semibold mb-1 text-[var(--bridge-text)]">
                  Précisez comment vous nous avez connus
                </label>
                <input
                  type="text"
                  [(ngModel)]="heardFromOther"
                  placeholder="Ex: Événement universitaire, recommandation d'un professeur..."
                  class="theme-input w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-[var(--bridge-text)] focus:outline-none focus:border-[var(--bridge-crimson)] transition-all"
                />
              </div>
            </div>

            <!-- ════════════════════════════════════════════════════════════ -->
            <!-- STEP 6 : RÉCAPITULATIF & VALIDATION                          -->
            <!-- ════════════════════════════════════════════════════════════ -->
            <div *ngIf="currentStepId === 'engagement'" class="space-y-5 animate-fadeIn">
              <div>
                <span class="text-xs font-bold text-[var(--bridge-gold)] uppercase tracking-wider"
                  >Validation Finale</span
                >
                <h4 class="font-syne font-bold text-lg text-[var(--bridge-text)] mt-0.5">
                  Récapitulatif de votre demande
                </h4>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                  Vérifiez vos choix ci-dessous et confirmez votre engagement pour soumettre votre
                  convention.
                </p>
              </div>

              <!-- Summary Cards -->
              <div class="grid sm:grid-cols-2 gap-4">
                <!-- Card 1: Projet & Stage -->
                <div
                  class="theme-sub-card p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2"
                >
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider text-[var(--bridge-gold)]"
                  >
                    Projet de Stage
                  </span>
                  <p class="text-sm font-bold text-[var(--bridge-text)]">
                    {{ newStageTitle }}
                  </p>
                  <div
                    class="pt-2 text-xs text-[var(--bridge-text-muted)] space-y-1 border-t border-white/5"
                  >
                    <p>
                      <strong class="text-[var(--bridge-text)]">Durée :</strong>
                      {{ newStageDurationWeeks }} semaines ({{
                        (newStageDurationWeeks / 4).toFixed(1)
                      }}
                      mois)
                    </p>
                    <p>
                      <strong class="text-[var(--bridge-text)]">Demande :</strong>
                      {{ demandeFile ? demandeFile.name : 'Non fournie' }}
                    </p>
                    <p>
                      <strong class="text-[var(--bridge-text)]">Convention :</strong>
                      {{ lettreFile ? lettreFile.name : 'Non fournie' }}
                    </p>
                  </div>
                </div>

                <!-- Card 2: Formations & Paiement -->
                <div
                  class="theme-sub-card p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2"
                >
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider text-[var(--bridge-gold)]"
                  >
                    Financement & Formations
                  </span>
                  <p class="text-sm font-bold text-[var(--bridge-text)]">
                    {{ selectedFormationIds.length }} module(s) sélectionné(s)
                  </p>
                  <div
                    class="pt-2 text-xs text-[var(--bridge-text-muted)] space-y-1 border-t border-white/5"
                  >
                    <p>
                      <strong class="text-[var(--bridge-text)]">Mode :</strong>
                      {{ paymentPlan === 'COMPTANT' ? 'Comptant (-10% remise)' : 'Par Facilité' }}
                    </p>
                    <p>
                      <strong class="text-[var(--bridge-text)]">Moyen :</strong> {{ paymentMethod }}
                    </p>
                    <p class="font-mono font-bold text-sm text-[var(--bridge-gold)] pt-1">
                      Total : {{ calculateFinalPrice() }} TND
                      <span
                        *ngIf="calculateDiscountAmount() > 0"
                        class="text-xs text-emerald-500 font-normal"
                      >
                        (dont -{{ calculateDiscountAmount() }} TND de remise)
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Checkboxes CGU & Charte -->
              <div
                class="theme-sub-card p-4 rounded-2xl bg-[rgba(198,39,97,0.05)] border border-[rgba(198,39,97,0.2)] space-y-2.5"
              >
                <label
                  class="flex items-start gap-3 cursor-pointer text-xs text-[var(--bridge-text)]"
                >
                  <input
                    type="checkbox"
                    [(ngModel)]="agreeTerms"
                    class="mt-0.5 accent-[var(--bridge-crimson)] w-4 h-4 cursor-pointer"
                  />
                  <span>
                    J'accepte les Conditions Générales d'Utilisation et la politique administrative
                    de The Bridge.
                  </span>
                </label>

                <label
                  class="flex items-start gap-3 cursor-pointer text-xs text-[var(--bridge-text)]"
                >
                  <input
                    type="checkbox"
                    [(ngModel)]="agreeCharter"
                    class="mt-0.5 accent-[var(--bridge-crimson)] w-4 h-4 cursor-pointer"
                  />
                  <span>
                    Je m'engage à respecter le règlement intérieur, l'assiduité du stage et
                    l'éthique professionnelle de 9antra.
                  </span>
                </label>
              </div>
            </div>
          </div>

          <!-- Wizard Footer Controls -->
          <div
            class="px-6 py-4 border-t border-white/10 flex items-center justify-between flex-shrink-0 bg-white/[0.01]"
          >
            <button
              *ngIf="currentStepIndex > 0"
              type="button"
              (click)="prevStep()"
              class="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-[var(--bridge-text)] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              ← Précédent
            </button>
            <div *ngIf="currentStepIndex === 0"></div>

            <button
              *ngIf="currentStepIndex < wizardSteps.length - 1"
              type="button"
              (click)="nextStep()"
              class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 hover:opacity-95"
            >
              <span>Continuer</span>
              <span>→</span>
            </button>

            <button
              *ngIf="currentStepIndex === wizardSteps.length - 1"
              type="button"
              (click)="submitNewStage()"
              [disabled]="submitting || !agreeTerms || !agreeCharter"
              class="px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white font-syne font-bold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span
                *ngIf="submitting"
                class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></span>
              <span>{{
                submitting ? 'Validation en cours...' : 'Confirmer et Soumettre ma Demande'
              }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════════════ -->
      <!-- SLIDE-OVER DRAWER: HISTORIQUE DES STAGES FACULTATIFS                 -->
      <!-- ════════════════════════════════════════════════════════════════════ -->
      <div *ngIf="showHistoryModal" class="drawer-overlay">
        <!-- Backdrop -->
        <div class="modal-backdrop" (click)="closeHistory()"></div>

        <!-- Drawer Container -->
        <div
          class="drawer-panel theme-panel bg-[#0d0d21] border-l border-white/10 shadow-2xl animate-slide-in"
          (click)="$event.stopPropagation()"
        >
          <!-- Top Accent Line -->
          <div
            class="h-1 w-full bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623] flex-shrink-0"
          ></div>

          <!-- Drawer Header -->
          <div
            class="px-6 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-[var(--bridge-gold)]/15 text-[var(--bridge-gold)] flex items-center justify-center flex-shrink-0"
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
              <div>
                <h3 class="font-syne font-bold text-base md:text-lg text-[var(--bridge-text)]">
                  Historique des Stages
                </h3>
                <p class="text-[11px] text-[var(--bridge-text-muted)]">
                  Suivi chronologique de toutes vos demandes et conventions
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="closeHistory()"
              class="theme-close-btn w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>

          <!-- Drawer Body (List of stages) -->
          <div class="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-[var(--bridge-text)]">
            <!-- Loading -->
            <div *ngIf="historyLoading" class="py-12 text-center text-[var(--bridge-text-muted)]">
              <div
                class="w-8 h-8 border-2 border-[var(--bridge-crimson)] border-t-transparent rounded-full animate-spin mx-auto mb-3"
              ></div>
              <p class="text-xs">Chargement de votre historique...</p>
            </div>

            <!-- Empty History -->
            <div
              *ngIf="!historyLoading && history.length === 0"
              class="py-12 text-center text-[var(--bridge-text-muted)] space-y-2"
            >
              <p>Aucun historique de stage disponible pour l'instant.</p>
            </div>

            <!-- History Stage Cards -->
            <div
              *ngFor="let item of history; let i = index"
              class="theme-sub-card p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 hover:border-white/20 transition-all"
            >
              <!-- Card Top Row: Title + Status -->
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-mono text-[var(--bridge-text-muted)]"
                      >#{{ item.id }}</span
                    >
                    <h4 class="font-syne font-bold text-sm text-[var(--bridge-text)] truncate">
                      {{ item.stageProjectTitle || 'Stage Facultatif' }}
                    </h4>
                  </div>
                  <span class="text-[10px] text-[var(--bridge-text-muted)] mt-0.5 block">
                    Soumis le {{ item.createdAt | date: 'dd/MM/yyyy' }}
                  </span>
                </div>

                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                  [ngClass]="getStatusBadgeClass(item.status)"
                >
                  {{ getStatusLabel(item.status) }}
                </span>
              </div>

              <!-- Meta info -->
              <div class="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/5">
                <div>
                  <span class="text-[var(--bridge-text-muted)]">Durée : </span>
                  <strong class="text-[var(--bridge-text)]"
                    >{{ item.stageDurationWeeks || 12 }} sem.</strong
                  >
                </div>
                <div>
                  <span class="text-[var(--bridge-text-muted)]">Encadrant : </span>
                  <strong class="text-[var(--bridge-text)]">{{
                    item.supervisorFirstName
                      ? item.supervisorFirstName + ' ' + item.supervisorLastName
                      : 'Non assigné'
                  }}</strong>
                </div>
              </div>

              <!-- Attestation Download Button if completed -->
              <div *ngIf="item.status === 'COMPLETED' && item.attestationPdfUrl" class="pt-2">
                <a
                  [href]="item.attestationPdfUrl"
                  target="_blank"
                  class="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
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
                  <span>Télécharger l'Attestation PDF</span>
                </a>
              </div>

              <!-- Documents links -->
              <div
                class="flex items-center gap-2 pt-1"
                *ngIf="item.demandeStageUrl || item.lettreAffectationUrl"
              >
                <a
                  *ngIf="item.demandeStageUrl"
                  [href]="item.demandeStageUrl"
                  target="_blank"
                  class="text-[10px] text-[var(--bridge-gold)] hover:underline flex items-center gap-1"
                >
                  <span>📄 Demande</span>
                </a>
                <span
                  *ngIf="item.demandeStageUrl && item.lettreAffectationUrl"
                  class="text-white/20"
                  >•</span
                >
                <a
                  *ngIf="item.lettreAffectationUrl"
                  [href]="item.lettreAffectationUrl"
                  target="_blank"
                  class="text-[10px] text-[var(--bridge-gold)] hover:underline flex items-center gap-1"
                >
                  <span>📄 Convention</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class StagiaireStageComponent implements OnInit {
  inscription: StageInscription | null = null;
  history: StageInscription[] = [];
  loading = true;
  historyLoading = false;

  showHistoryModal = false;
  showNewStageModal = false;
  submitting = false;

  // ══════════════════════════════════════════════════════════════════════════
  // WIZARD STATE (Aligné fidèlement sur onboarding.component.ts)
  // ══════════════════════════════════════════════════════════════════════════
  wizardSteps = [
    { id: 'stage_details', label: 'Stage & Documents' },
    { id: 'formations', label: 'Formations' },
    { id: 'referral', label: 'Parrainage' },
    { id: 'payment', label: 'Paiement' },
    { id: 'heard_from', label: 'Source' },
    { id: 'engagement', label: 'Validation' },
  ];
  currentStepIndex = 0;

  // Étape 1: Détails du stage
  newStageTitle = '';
  newStageDurationWeeks = 12;
  demandeFile: File | null = null;
  lettreFile: File | null = null;
  isDragOverDemande = false;
  isDragOverLettre = false;

  // Étape 2: Formations
  availableFormations: Formation[] = [];
  selectedFormationIds: number[] = [];
  loadingFormations = false;

  // Étape 3: Parrainage
  referralEmail = '';

  // Étape 4: Mode de paiement
  paymentPlan: 'COMPTANT' | 'FACILITE' = 'COMPTANT';
  paymentMethod: 'STRIPE' | 'MAIN_A_MAIN' | 'BANQUE' = 'MAIN_A_MAIN';

  // Étape 5: Source d'acquisition
  sourceOptions = [
    { key: 'RESEAUX_SOCIAUX', label: '📱 Réseaux Sociaux (Facebook, LinkedIn, Instagram)' },
    { key: 'AMI', label: '🤝 Recommandation d’un ami ou collègue' },
    { key: 'GOOGLE', label: '🔍 Recherche Google / Web' },
    { key: 'PUBLICITE', label: '📢 Publicité en ligne' },
    { key: 'ANCIEN_STAGIAIRE', label: '🎓 Ancien stagiaire 9antra' },
    { key: 'AUTRE', label: '✨ Autre source' },
  ];
  selectedSources: string[] = ['RESEAUX_SOCIAUX'];
  heardFromOther = '';

  // Étape 6: Engagement
  agreeTerms = true;
  agreeCharter = true;

  constructor(
    private onboardingService: OnboardingService,
    private formationService: FormationService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadMyInscription();
  }

  /**
   * Un stagiaire est engagé s'il a une demande en attente, approuvée ou active.
   * Dans ce cas, il ne peut pas soumettre une autre demande.
   */
  get isEngaged(): boolean {
    if (!this.inscription) return false;
    const s = this.inscription.status;
    return s === 'PENDING_REVIEW' || s === 'APPROVED' || s === 'ACTIVE';
  }

  /**
   * Le paiement par Stripe est accessible uniquement si le stage est approuvé/actif,
   * que le mode de règlement choisi est STRIPE, et que le paiement n'a pas encore été validé.
   */
  get canPayWithStripe(): boolean {
    if (!this.inscription) return false;
    const isApproved =
      this.inscription.status === 'APPROVED' || this.inscription.status === 'ACTIVE';
    const isStripe = this.inscription.paymentMode === 'STRIPE';
    const isUnpaid =
      !this.inscription.stripePaymentConfirmed && !this.inscription.adminPaymentConfirmed;
    return isApproved && isStripe && isUnpaid;
  }

  payingWithStripe = false;

  payWithStripe(): void {
    if (!this.inscription?.id) return;
    this.payingWithStripe = true;

    // Si une URL de paiement Stripe existe déjà sur le dossier
    if (this.inscription.stripePaymentUrl) {
      this.toastService.info('Redirection vers le portail sécurisé Stripe...', 'Paiement');
      window.location.href = this.inscription.stripePaymentUrl;
      this.payingWithStripe = false;
      return;
    }

    // Sinon générer/récupérer la session Stripe via le backend
    this.onboardingService.createStripeCheckoutSession(this.inscription.id).subscribe({
      next: (res) => {
        this.payingWithStripe = false;
        if (res.stripePaymentUrl) {
          this.inscription = res;
          this.toastService.info('Redirection vers le portail sécurisé Stripe...', 'Paiement');
          window.location.href = res.stripePaymentUrl;
        } else {
          this.toastService.error(
            "Impossible d'accéder à la session Stripe. Veuillez contacter le support.",
            'Paiement',
          );
        }
      },
      error: (err) => {
        this.payingWithStripe = false;
        this.toastService.error(
          err?.error?.message || 'Erreur lors de la préparation du paiement Stripe.',
          'Paiement',
        );
      },
    });
  }

  get currentStepId(): string {
    return this.wizardSteps[this.currentStepIndex]?.id || 'stage_details';
  }

  get currentStepTitle(): string {
    return this.wizardSteps[this.currentStepIndex]?.label || '';
  }

  getProgressPercentage(): number {
    return Math.round(((this.currentStepIndex + 1) / this.wizardSteps.length) * 100);
  }

  loadMyInscription(): void {
    this.loading = true;
    this.onboardingService.getMyInscription().subscribe({
      next: (res) => {
        this.inscription = res;
        this.loading = false;
      },
      error: () => {
        this.inscription = null;
        this.loading = false;
      },
    });
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

  loadHistory(): void {
    this.historyLoading = true;
    this.onboardingService.getMyInscriptionHistory().subscribe({
      next: (res) => {
        this.history = (res || []).sort((a, b) => {
          const dateA = this.parseDate(a.createdAt);
          const dateB = this.parseDate(b.createdAt);
          return dateA !== dateB ? dateA - dateB : (a.id || 0) - (b.id || 0);
        });
        this.historyLoading = false;
      },
      error: () => {
        this.history = [];
        this.historyLoading = false;
      },
    });
  }

  openHistory(): void {
    this.showHistoryModal = true;
    this.loadHistory();
  }

  closeHistory(): void {
    this.showHistoryModal = false;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // WIZARD OPEN / CLOSE & INIT
  // ══════════════════════════════════════════════════════════════════════════
  openNewStageWizard(): void {
    if (this.isEngaged) {
      this.toastService.warning(
        "Vous avez déjà un stage en cours. Vous ne pouvez pas demander un autre stage tant que le stage actuel n'est pas clôturé.",
        'Stage en cours',
      );
      return;
    }

    // Reset wizard form state
    this.currentStepIndex = 0;
    this.newStageTitle = '';
    this.newStageDurationWeeks = 12;
    this.demandeFile = null;
    this.lettreFile = null;
    this.isDragOverDemande = false;
    this.isDragOverLettre = false;
    this.referralEmail = '';
    this.paymentPlan = 'COMPTANT';
    this.paymentMethod = 'MAIN_A_MAIN';
    this.selectedSources = ['RESEAUX_SOCIAUX'];
    this.heardFromOther = '';
    this.agreeTerms = true;
    this.agreeCharter = true;

    this.showNewStageModal = true;
    this.loadFormations();
  }

  closeNewStageWizard(): void {
    this.showNewStageModal = false;
  }

  loadFormations(): void {
    if (this.availableFormations.length > 0) return;
    this.loadingFormations = true;
    this.formationService.getFormations().subscribe({
      next: (list) => {
        this.availableFormations = list.filter((f) => !f.archived);
        if (this.availableFormations.length > 0 && this.selectedFormationIds.length === 0) {
          this.selectedFormationIds.push(Number(this.availableFormations[0].id));
        }
        this.loadingFormations = false;
      },
      error: () => {
        this.loadingFormations = false;
      },
    });
  }

  toggleFormation(formationId: string): void {
    const id = Number(formationId);
    const idx = this.selectedFormationIds.indexOf(id);
    if (idx > -1) {
      this.selectedFormationIds.splice(idx, 1);
    } else {
      this.selectedFormationIds.push(id);
    }
  }

  isFormationSelected(formationId: string): boolean {
    return this.selectedFormationIds.includes(Number(formationId));
  }

  // ── Drag & Drop & File Selection ──
  onDragOver(event: DragEvent, type: 'demande' | 'lettre'): void {
    event.preventDefault();
    if (type === 'demande') this.isDragOverDemande = true;
    if (type === 'lettre') this.isDragOverLettre = true;
  }

  onDragLeave(type: 'demande' | 'lettre'): void {
    if (type === 'demande') this.isDragOverDemande = false;
    if (type === 'lettre') this.isDragOverLettre = false;
  }

  onDropFile(event: DragEvent, type: 'demande' | 'lettre'): void {
    event.preventDefault();
    this.onDragLeave(type);
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        if (type === 'demande') this.demandeFile = file;
        if (type === 'lettre') this.lettreFile = file;
      } else {
        this.toastService.error('Seuls les fichiers PDF sont acceptés.', 'Document');
      }
    }
  }

  onFileSelected(event: any, type: 'demande' | 'lettre'): void {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        if (type === 'demande') this.demandeFile = file;
        if (type === 'lettre') this.lettreFile = file;
      } else {
        this.toastService.error('Seuls les fichiers PDF sont acceptés.', 'Document');
      }
    }
  }

  removeFile(type: 'demande' | 'lettre'): void {
    if (type === 'demande') this.demandeFile = null;
    if (type === 'lettre') this.lettreFile = null;
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 KB';
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  // ── Source Toggle ──
  toggleSource(key: string): void {
    const idx = this.selectedSources.indexOf(key);
    if (idx > -1) {
      this.selectedSources.splice(idx, 1);
    } else {
      this.selectedSources.push(key);
    }
  }

  // ── Price Calculations ──
  calculateOriginalPrice(): number {
    return this.availableFormations
      .filter((f) => this.selectedFormationIds.includes(Number(f.id)))
      .reduce((sum, f) => sum + (f.totalPrice || 0), 0);
  }

  calculateDiscountAmount(): number {
    const original = this.calculateOriginalPrice();
    if (this.paymentPlan === 'COMPTANT') {
      return original * 0.1;
    }
    if (this.referralEmail && this.referralEmail.trim().length > 0) {
      return original * 0.1;
    }
    return 0;
  }

  calculateFinalPrice(): number {
    return this.calculateOriginalPrice() - this.calculateDiscountAmount();
  }

  // ── Navigation ──
  nextStep(): void {
    if (this.currentStepId === 'stage_details') {
      if (!this.newStageTitle.trim()) {
        this.toastService.error('Veuillez renseigner le titre du projet de stage.', 'Champ requis');
        return;
      }
    }

    if (this.currentStepId === 'formations') {
      if (this.selectedFormationIds.length === 0) {
        this.toastService.error('Veuillez sélectionner au moins une formation.', 'Formations');
        return;
      }
    }

    if (this.currentStepIndex < this.wizardSteps.length - 1) {
      this.currentStepIndex++;
    }
  }

  prevStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
    }
  }

  // ── Submission ──
  submitNewStage(): void {
    if (!this.newStageTitle.trim()) {
      this.toastService.error('Veuillez renseigner le titre du projet', 'Champ requis');
      return;
    }
    if (!this.agreeTerms || !this.agreeCharter) {
      this.toastService.error(
        "Veuillez accepter les CGU et la charte d'engagement.",
        'Validation requise',
      );
      return;
    }

    this.submitting = true;
    const payload: OnboardingPayload = {
      wantsInternship: true,
      stageProjectTitle: this.newStageTitle.trim(),
      stageDurationWeeks: this.newStageDurationWeeks,
      selectedFormationIds: this.selectedFormationIds,
      referralEmail: this.referralEmail ? this.referralEmail.trim() : undefined,
      paymentMode: this.paymentMethod as InternshipPaymentMode,
      payNow: this.paymentPlan === 'COMPTANT',
      heardFrom: this.selectedSources.join(','),
      heardFromOther: this.selectedSources.includes('AUTRE') ? this.heardFromOther : undefined,
      termsAccepted: true,
    };

    this.onboardingService
      .submitOnboarding(payload, this.demandeFile || undefined, this.lettreFile || undefined)
      .subscribe({
        next: (created) => {
          this.submitting = false;
          this.showNewStageModal = false;
          this.toastService.success(
            "Votre demande de stage facultatif a été soumise avec succès ! Votre convention est en attente de validation par l'administration.",
            'Demande Envoyée',
          );
          this.loadMyInscription();
          this.loadHistory();
        },
        error: (err) => {
          this.submitting = false;
          this.toastService.error(
            err?.error?.message || 'Erreur lors de la soumission de la demande de stage.',
            'Erreur',
          );
        },
      });
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.showNewStageModal) this.closeNewStageWizard();
    if (this.showHistoryModal) this.closeHistory();
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
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-white/10 text-[var(--bridge-text)] border-white/20';
    }
  }

  getStatusDotClass(status?: string): string {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return 'bg-emerald-500 animate-pulse';
      case 'PENDING_REVIEW':
        return 'bg-amber-500 animate-pulse';
      case 'REJECTED':
        return 'bg-rose-500';
      case 'COMPLETED':
        return 'bg-blue-400';
      default:
        return 'bg-white';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'APPROVED':
        return 'Dossier Approuvé';
      case 'ACTIVE':
        return 'Stage En Cours';
      case 'PENDING_REVIEW':
        return 'En Attente de Validation';
      case 'REJECTED':
        return 'Dossier Rejeté';
      case 'COMPLETED':
        return 'Stage Clôturé';
      default:
        return 'En Examen';
    }
  }
}
