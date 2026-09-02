import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Formation } from '../../../core/models/formation.model';
import {
  ComboEnrollment,
  ComboFormationItem,
  computeComboDiscount,
} from '../../../core/models/combo-enrollment.model';
import { ComboEnrollmentService } from '../../../core/services/combo-enrollment.service';
import { FormationService } from '../../../core/services/formation.service';
import { AuthService } from '../../../core/services/auth.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-combo-parcours',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [
    `
      :host {
        display: contents;
      }

      .combo-modal-container {
        background: var(--bridge-card, #171738);
        color: var(--bridge-text, #f0f0ff);
      }

      :host-context([data-theme='light']) .combo-modal-container {
        background: #ffffff !important;
        color: #1d2433 !important;
      }

      :host-context([data-theme='light']) .combo-hero-bg {
        background: linear-gradient(
          135deg,
          rgba(198, 39, 97, 0.08) 0%,
          #ffffff 50%,
          rgba(245, 166, 35, 0.08) 100%
        ) !important;
      }

      :host-context([data-theme='light']) .combo-receipt-header {
        background: #f9f6f0 !important;
      }

      :host-context([data-theme='light']) .combo-tier-box {
        background: #f9f6f0 !important;
        border-color: #e2d9c8 !important;
      }
    `,
  ],
  template: `
    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- BACKDROP                                                    -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      (click)="onBackdropClick($event)"
    >
      <div class="absolute inset-0 bg-black/80 backdrop-blur-md"></div>

      <div
        class="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col animate-fadeIn"
        (click)="$event.stopPropagation()"
      >
        <!-- Card principale -->
        <div
          class="combo-modal-container border border-[var(--bridge-border)] overflow-hidden flex flex-col max-h-[92vh] rounded-3xl shadow-2xl"
        >
          <!-- Gradient top bar -->
          <div
            class="h-1.5 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623] flex-shrink-0"
          ></div>

          <!-- ─── Header ─── -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-[var(--bridge-border)] flex-shrink-0 bg-[var(--bridge-surface)]"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20
                          border border-[var(--bridge-gold)]/30 flex items-center justify-center text-[var(--bridge-gold)] shadow-sm"
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
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div>
                <h2 class="font-syne font-bold text-[var(--bridge-text)] text-lg">
                  Personnaliser votre parcours
                </h2>
                <p class="text-xs text-[var(--bridge-text-muted)]">
                  Composez votre combo de formations avec une remise progressive
                </p>
              </div>
            </div>
            <button
              (click)="close()"
              aria-label="Fermer"
              class="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center
                     text-[var(--bridge-text-muted)] hover:text-[var(--bridge-text)] transition-all text-sm cursor-pointer border border-[var(--bridge-border)]"
            >
              ✕
            </button>
          </div>

          <!-- ─── Stepper Indicators ─── -->
          <div
            class="flex items-center gap-0 px-6 py-3 border-b border-[var(--bridge-border)] flex-shrink-0 overflow-x-auto bg-[var(--bridge-surface)]/60"
          >
            <ng-container *ngFor="let s of steps; let i = index">
              <div class="flex items-center gap-2 flex-shrink-0">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  [class]="
                    currentStep > i
                      ? 'bg-emerald-500 text-white'
                      : currentStep === i
                        ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-lg shadow-[rgba(198,39,97,0.3)]'
                        : 'bg-[var(--bridge-surface)] text-[var(--bridge-text-muted)] border border-[var(--bridge-border)]'
                  "
                >
                  <svg
                    *ngIf="currentStep > i"
                    class="w-3.5 h-3.5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span *ngIf="currentStep <= i">{{ i + 1 }}</span>
                </div>
                <span
                  class="text-xs font-semibold whitespace-nowrap transition-colors duration-300"
                  [class]="
                    currentStep === i
                      ? 'text-[var(--bridge-text)] font-bold'
                      : 'text-[var(--bridge-text-muted)]'
                  "
                >
                  {{ s }}
                </span>
              </div>
              <div
                *ngIf="i < steps.length - 1"
                class="flex-1 min-w-[20px] h-px mx-3 transition-colors duration-500"
                [class]="currentStep > i ? 'bg-emerald-500/50' : 'bg-[var(--bridge-border)]'"
              ></div>
            </ng-container>
          </div>

          <!-- ─── Scrollable Content ─── -->
          <div class="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
            <!-- ══════════════════════════════════════════════════════════ -->
            <!-- ÉTAPE 0 : Introduction                                     -->
            <!-- ══════════════════════════════════════════════════════════ -->
            <div *ngIf="currentStep === 0" class="p-6 space-y-6 animate-fadein">
              <!-- Hero Banner -->
              <div
                class="relative overflow-hidden rounded-2xl border border-[#F5A623]/30
                       combo-hero-bg bg-gradient-to-br from-[#C62761]/10 via-[var(--bridge-surface)] to-[#F5A623]/10 p-8 text-center shadow-md"
              >
                <div class="absolute inset-0 overflow-hidden pointer-events-none">
                  <div
                    class="absolute -top-10 -right-10 w-40 h-40 rounded-full
                               bg-[#F5A623]/10 blur-3xl"
                  ></div>
                  <div
                    class="absolute -bottom-10 -left-10 w-40 h-40 rounded-full
                               bg-[#C62761]/10 blur-3xl"
                  ></div>
                </div>
                <div class="relative z-10">
                  <div
                    class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[var(--bridge-gold)]/30 flex items-center justify-center mx-auto mb-4 text-[var(--bridge-gold)] shadow-lg"
                  >
                    <svg
                      class="w-8 h-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  <h3 class="font-syne font-bold text-2xl text-[var(--bridge-text)] mb-2">
                    Votre Parcours Personnalisé
                  </h3>
                  <p
                    class="text-[var(--bridge-text-muted)] text-sm max-w-md mx-auto leading-relaxed"
                  >
                    Choisissez librement les formations qui correspondent à vos ambitions et
                    bénéficiez d'une
                    <strong class="text-[#F5A623]">remise progressive exclusive</strong>.
                  </p>
                </div>
              </div>

              <!-- Avantages -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  *ngFor="let benefit of benefits"
                  class="glass-card border border-[var(--bridge-border)] p-5 text-center bg-[var(--bridge-card)] shadow-sm"
                >
                  <div
                    class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C62761]/15 to-[#F5A623]/15 border border-[#F5A623]/20 flex items-center justify-center mx-auto mb-3 text-[var(--bridge-gold)]"
                  >
                    <svg
                      *ngIf="benefit.type === 'target'"
                      class="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                    <svg
                      *ngIf="benefit.type === 'discount'"
                      class="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="19" y1="5" x2="5" y2="19" />
                      <circle cx="6.5" cy="6.5" r="2.5" />
                      <circle cx="17.5" cy="17.5" r="2.5" />
                    </svg>
                    <svg
                      *ngIf="benefit.type === 'receipt'"
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
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <p class="text-[var(--bridge-text)] font-semibold text-sm">{{ benefit.title }}</p>
                  <p class="text-[var(--bridge-text-muted)] text-xs mt-1">{{ benefit.desc }}</p>
                </div>
              </div>

              <!-- Barème remise -->
              <div
                class="glass-card border border-[#F5A623]/30 p-5 bg-[var(--bridge-card)] shadow-sm"
              >
                <div
                  class="flex items-center gap-2 text-xs text-[#F5A623] font-bold uppercase tracking-wider mb-4"
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
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  <span>Barème de remise progressive</span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div
                    *ngFor="let tier of discountTiers"
                    class="text-center p-3 rounded-xl border transition-all combo-tier-box"
                    [class]="
                      tier.highlight
                        ? 'bg-gradient-to-b from-[#C62761]/15 to-[#F5A623]/10 border-[#F5A623]/40 shadow-md'
                        : 'bg-[var(--bridge-surface)]/60 border-[var(--bridge-border)]'
                    "
                  >
                    <p class="text-xs text-[var(--bridge-text-muted)]">{{ tier.label }}</p>
                    <p
                      class="font-mono font-bold text-xl mt-1"
                      [class]="tier.highlight ? 'text-[#F5A623]' : 'text-[var(--bridge-text)]'"
                    >
                      {{ tier.discount }}%
                    </p>
                    <p class="text-[10px] text-[var(--bridge-text-muted)] mt-0.5">de remise</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- ══════════════════════════════════════════════════════════ -->
            <!-- ÉTAPE 1 : Sélection des formations                         -->
            <!-- ══════════════════════════════════════════════════════════ -->
            <div *ngIf="currentStep === 1" class="p-6 space-y-4 animate-fadein">
              <!-- Compteur live en sticky -->
              <div
                class="sticky top-0 z-10 glass-card border border-[var(--bridge-border)] p-4
                          backdrop-blur-xl rounded-2xl shadow-xl flex flex-wrap items-center
                          justify-between gap-3 bg-[var(--bridge-surface)]/95"
              >
                <div class="flex items-center gap-4">
                  <div class="text-center">
                    <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider">
                      Formations
                    </p>
                    <p class="font-mono font-bold text-xl text-[var(--bridge-text)]">
                      {{ selectedIds.size }}
                    </p>
                  </div>
                  <div class="w-px h-8 bg-[var(--bridge-border)]"></div>
                  <div class="text-center">
                    <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider">
                      Durée totale
                    </p>
                    <p class="font-mono font-bold text-xl text-[var(--bridge-text)]">
                      {{ totalWeeks }}
                      <span class="text-xs font-sans text-[var(--bridge-text-muted)]">sem.</span>
                    </p>
                  </div>
                  <div class="w-px h-8 bg-[var(--bridge-border)]"></div>
                  <div class="text-center">
                    <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider">
                      Remise
                    </p>
                    <p class="font-mono font-bold text-xl text-[#F5A623]">{{ currentDiscount }}%</p>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase">Total</p>
                  <p
                    class="text-xs text-[var(--bridge-text-muted)] line-through font-mono"
                    *ngIf="currentDiscount > 0"
                  >
                    {{ totalPriceRaw | number: '1.0-0' }} TND
                  </p>
                  <p
                    class="font-mono font-bold text-xl bg-gradient-to-r from-[#C62761] to-[#F5A623]
                             bg-clip-text text-transparent"
                  >
                    {{ finalPrice | number: '1.0-0' }} TND
                  </p>
                </div>
              </div>

              <!-- Barre de promo si sélection >= 2 -->
              <div
                *ngIf="selectedIds.size >= 2"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl
                       bg-[#F5A623]/10 border border-[#F5A623]/30 text-xs font-semibold text-[#F5A623]"
              >
                <svg
                  class="w-4 h-4 text-[#F5A623] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"
                  />
                </svg>
                <span
                  >Bravo ! Remise de <strong>{{ currentDiscount }}%</strong> appliquée sur votre
                  combo.</span
                >
                <span *ngIf="currentDiscount < 40" class="text-[var(--bridge-text-muted)] ml-1">
                  (Ajoutez {{ formationNeededForNextTier }} formation(s) pour atteindre
                  {{ nextDiscount }}%)
                </span>
                <span *ngIf="currentDiscount === 40" class="text-emerald-500 font-bold ml-1">
                  ✓ Remise maximale atteinte !
                </span>
              </div>
              <div
                *ngIf="selectedIds.size < 2"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl
                       bg-[var(--bridge-surface)] border border-[var(--bridge-border)] text-xs text-[var(--bridge-text-muted)]"
              >
                <svg
                  class="w-4 h-4 text-[var(--bridge-text-muted)] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Sélectionnez au moins 2 formations pour bénéficier d'une remise.</span>
              </div>

              <!-- Grille formations -->
              <div *ngIf="loadingFormations" class="grid md:grid-cols-2 gap-4">
                <div
                  *ngFor="let _ of [1, 2, 3, 4]"
                  class="glass-card border border-[var(--bridge-border)] p-5 animate-pulse h-32 bg-[var(--bridge-card)]"
                ></div>
              </div>

              <div *ngIf="!loadingFormations" class="grid md:grid-cols-2 gap-4">
                <div
                  *ngFor="let f of availableFormations"
                  (click)="toggleFormation(f)"
                  class="glass-card border p-4 cursor-pointer transition-all duration-200 relative group bg-[var(--bridge-card)]"
                  [class]="getFormationCardClass(f)"
                >
                  <!-- Badge sélectionné -->
                  <div
                    *ngIf="selectedIds.has(f.id)"
                    class="absolute top-3 right-3 w-6 h-6 rounded-full
                           bg-gradient-to-br from-[#C62761] to-[#F5A623]
                           flex items-center justify-center text-white text-xs font-bold shadow-lg"
                  >
                    ✓
                  </div>

                  <!-- Badge déjà dans un combo actif -->
                  <div
                    *ngIf="activeComboFormationIds.has(f.id)"
                    class="absolute top-3 right-3 text-[10px] px-2 py-0.5
                           bg-amber-500/15 text-amber-500 border border-amber-500/30 rounded-full font-bold flex items-center gap-1"
                  >
                    <svg
                      class="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                    Déjà en combo
                  </div>

                  <!-- Badge déjà inscrit individuellement -->
                  <div
                    *ngIf="enrolledIds.has(f.id) && !activeComboFormationIds.has(f.id)"
                    class="absolute top-3 right-3 text-[10px] px-2 py-0.5
                           bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 rounded-full font-bold flex items-center gap-1"
                  >
                    <svg
                      class="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Inscrit
                  </div>

                  <div class="flex items-start gap-3">
                    <!-- Checkbox visuel -->
                    <div
                      class="w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 transition-all duration-200
                             flex items-center justify-center"
                      [class]="
                        selectedIds.has(f.id)
                          ? 'bg-gradient-to-br from-[#C62761] to-[#F5A623] border-transparent'
                          : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)]'
                      "
                    >
                      <svg
                        *ngIf="selectedIds.has(f.id)"
                        class="w-3 h-3 text-white"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    </div>

                    <div class="flex-1 min-w-0 pr-8">
                      <div class="flex items-center gap-2 mb-1">
                        <span
                          class="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--bridge-surface)]
                                 text-[var(--bridge-text-muted)] font-mono uppercase border border-[var(--bridge-border)]"
                        >
                          {{ f.category || 'Général' }}
                        </span>
                      </div>
                      <h4
                        class="font-syne font-bold text-[var(--bridge-text)] text-sm leading-tight
                               group-hover:text-[#F5A623] transition-colors"
                      >
                        {{ f.nom }}
                      </h4>
                      <p class="text-xs text-[var(--bridge-text-muted)] mt-1 line-clamp-2">
                        {{ f.description }}
                      </p>
                      <div class="flex items-center justify-between mt-3">
                        <div
                          class="flex items-center gap-3 text-xs text-[var(--bridge-text-muted)]"
                        >
                          <span>{{ f.formateurNom || 'Formateur' }}</span>
                          <span *ngIf="f.defaultDurationWeeks">
                            · {{ f.defaultDurationWeeks }} sem.
                          </span>
                        </div>
                        <span class="font-mono font-bold text-[#F5A623] text-sm">
                          {{ f.totalPrice || 0 | number: '1.0-0' }} TND
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ══════════════════════════════════════════════════════════ -->
            <!-- ÉTAPE 2 : Récapitulatif & Reçu                            -->
            <!-- ══════════════════════════════════════════════════════════ -->
            <div *ngIf="currentStep === 2" class="p-6 space-y-4 animate-fadein">
              <!-- Zone reçu imprimable -->
              <div
                id="combo-receipt-print"
                class="glass-card border border-[var(--bridge-border)] overflow-hidden bg-[var(--bridge-card)] rounded-2xl shadow-lg"
              >
                <!-- Receipt Header -->
                <div class="bg-gradient-to-r from-[#C62761] to-[#F5A623] p-0.5">
                  <div class="combo-receipt-header bg-[var(--bridge-surface)] p-6">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          <div
                            class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20
                                       border border-[#F5A623]/30 flex items-center justify-center text-[var(--bridge-gold)] shadow-sm"
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
                                d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"
                              />
                              <path d="M6 6h10" />
                              <path d="M6 10h10" />
                            </svg>
                          </div>
                          <span class="font-syne font-black text-[var(--bridge-text)] text-lg"
                            >The Bridge</span
                          >
                        </div>
                        <p class="text-[10px] text-[var(--bridge-text-muted)]">
                          9antra — Plateforme de formation
                        </p>
                      </div>
                      <div class="text-right">
                        <p
                          class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider"
                        >
                          Devis parcours personnalisé
                        </p>
                        <p class="font-mono font-bold text-[#F5A623] text-sm mt-0.5">
                          {{ receiptPreviewRef }}
                        </p>
                        <p class="text-[10px] text-[var(--bridge-text-muted)] mt-0.5">
                          {{ today | date: 'dd/MM/yyyy' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Stagiaire info -->
                <div class="px-6 py-4 border-b border-[var(--bridge-border)]">
                  <p
                    class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                  >
                    Bénéficiaire
                  </p>
                  <p class="font-semibold text-[var(--bridge-text)] text-sm">
                    {{ user?.prenom }} {{ user?.nom }}
                  </p>
                  <p class="text-xs text-[var(--bridge-text-muted)]">{{ user?.email }}</p>
                </div>

                <!-- Table formations -->
                <div class="px-6 py-4">
                  <p
                    class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider mb-3"
                  >
                    Formations sélectionnées
                  </p>
                  <div class="space-y-2">
                    <div
                      *ngFor="let f of selectedFormations; let i = index"
                      class="flex items-center justify-between py-3 border-b border-[var(--bridge-border)]"
                    >
                      <div class="flex items-center gap-3">
                        <span
                          class="w-5 h-5 rounded bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20
                                     flex items-center justify-center text-[10px] font-mono text-[#F5A623]"
                        >
                          {{ i + 1 }}
                        </span>
                        <div>
                          <p class="text-sm font-semibold text-[var(--bridge-text)]">{{ f.nom }}</p>
                          <p class="text-xs text-[var(--bridge-text-muted)]">
                            {{ f.category || 'Général' }}
                            <span *ngIf="f.defaultDurationWeeks">
                              · {{ f.defaultDurationWeeks }} sem.</span
                            >
                          </p>
                        </div>
                      </div>
                      <span class="font-mono font-bold text-[var(--bridge-text)] text-sm">
                        {{ f.totalPrice || 0 | number: '1.0-0' }} TND
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Pricing recap -->
                <div class="px-6 pb-6 space-y-2">
                  <div class="flex justify-between text-sm text-[var(--bridge-text-muted)]">
                    <span>Sous-total</span>
                    <span class="font-mono text-[var(--bridge-text)]"
                      >{{ totalPriceRaw | number: '1.0-0' }} TND</span
                    >
                  </div>
                  <div class="flex justify-between text-sm text-[#F5A623] font-semibold">
                    <span>Remise combo {{ currentDiscount }}%</span>
                    <span class="font-mono">- {{ discountAmount | number: '1.0-0' }} TND</span>
                  </div>
                  <div class="h-px bg-gradient-to-r from-[#C62761]/30 to-[#F5A623]/30 my-2"></div>
                  <div class="flex justify-between items-center">
                    <span class="font-syne font-bold text-[var(--bridge-text)] text-base"
                      >Total à payer</span
                    >
                    <span
                      class="font-mono font-black text-xl bg-gradient-to-r from-[#C62761] to-[#F5A623]
                                 bg-clip-text text-transparent"
                    >
                      {{ finalPrice | number: '1.0-0' }} TND
                    </span>
                  </div>
                  <p class="text-[10px] text-[var(--bridge-text-muted)] mt-2">
                    * Ce devis est valable 48h. Le paiement se fait via Stripe (carte bancaire
                    sécurisée).
                  </p>
                </div>
              </div>

              <!-- Actions reçu -->
              <div class="flex flex-col sm:flex-row items-center gap-3">
                <button
                  (click)="printReceipt()"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bridge-surface)]
                         border border-[var(--bridge-border)] text-[var(--bridge-text)] text-xs font-semibold hover:bg-[var(--bridge-card-hover)]
                         transition-all cursor-pointer shadow-sm"
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
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path
                      d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
                    />
                    <rect width="12" height="8" x="6" y="14" />
                  </svg>
                  <span>Imprimer le reçu</span>
                </button>
                <p class="text-xs text-[var(--bridge-text-muted)]">
                  Vous recevrez aussi un email de confirmation après le paiement.
                </p>
              </div>
            </div>

            <!-- ══════════════════════════════════════════════════════════ -->
            <!-- ÉTAPE 3 : Confirmation succès                              -->
            <!-- ══════════════════════════════════════════════════════════ -->
            <div *ngIf="currentStep === 3" class="p-8 text-center space-y-6 animate-fadein">
              <div
                class="w-20 h-20 rounded-full mx-auto
                           bg-gradient-to-br from-emerald-500/20 to-teal-500/20
                           border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl"
              >
                <svg
                  class="w-10 h-10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h3 class="font-syne font-bold text-2xl text-[var(--bridge-text)] mb-2">
                  Parcours activé !
                </h3>
                <p class="text-[var(--bridge-text-muted)] text-sm max-w-md mx-auto">
                  Votre paiement a été confirmé. Vous êtes maintenant inscrit(e) à
                  <strong class="text-[var(--bridge-text)]"
                    >{{ confirmedFormationCount }} formation(s)</strong
                  >. Un email de confirmation a été envoyé à
                  <strong class="text-[#F5A623]">{{ user?.email }}</strong
                  >.
                </p>
              </div>
              <div
                class="glass-card border border-emerald-500/20 p-4 max-w-sm mx-auto bg-[var(--bridge-card)]"
              >
                <p
                  class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider mb-1"
                >
                  Référence reçu
                </p>
                <p class="font-mono font-bold text-[#F5A623] text-lg">{{ confirmedReceiptRef }}</p>
              </div>
              <button
                (click)="close()"
                class="px-6 py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white
                       rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg cursor-pointer"
              >
                Accéder à mes formations →
              </button>
            </div>
          </div>
          <!-- end scrollable content -->

          <!-- ─── Footer Actions ─── -->
          <div
            *ngIf="currentStep < 3"
            class="flex items-center justify-between gap-3 px-6 py-4 border-t border-[var(--bridge-border)] flex-shrink-0
                   bg-[var(--bridge-surface)] shadow-lg"
          >
            <button
              *ngIf="currentStep > 0"
              (click)="prevStep()"
              [disabled]="submitting"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bridge-card)] hover:bg-[var(--bridge-card-hover)] border border-[var(--bridge-border)]
                     text-[var(--bridge-text)] text-sm font-semibold transition-all cursor-pointer
                     disabled:opacity-50"
            >
              ← Retour
            </button>
            <div *ngIf="currentStep === 0"></div>

            <!-- Step 1 : Sélectionner min 2 -->
            <button
              *ngIf="currentStep === 0"
              (click)="nextStep()"
              class="ml-auto px-6 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623]
                     text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all
                     shadow-lg cursor-pointer flex items-center gap-2"
            >
              <span>Choisir mes formations →</span>
            </button>

            <button
              *ngIf="currentStep === 1"
              (click)="nextStep()"
              [disabled]="selectedIds.size < 2"
              class="ml-auto px-6 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623]
                     text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all
                     shadow-lg cursor-pointer flex items-center gap-2 disabled:opacity-40"
            >
              <span>Voir le récapitulatif →</span>
              <span class="text-xs opacity-75"
                >({{ selectedIds.size }} formation{{ selectedIds.size > 1 ? 's' : '' }})</span
              >
            </button>

            <!-- Step 2 : Payer via Stripe -->
            <div *ngIf="currentStep === 2" class="ml-auto flex items-center gap-3">
              <div
                *ngIf="submitting"
                class="text-xs text-[var(--bridge-text-muted)] flex items-center gap-2"
              >
                <svg
                  class="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-opacity="0.3" />
                  <path d="M21 12a9 9 0 00-9-9" />
                </svg>
                Création de la session Stripe...
              </div>
              <button
                *ngIf="!submitting"
                (click)="proceedToStripe()"
                [disabled]="selectedIds.size < 2"
                class="px-6 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623]
                       text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all
                       shadow-lg cursor-pointer flex items-center gap-2 disabled:opacity-40"
              >
                <svg
                  class="w-4 h-4 text-white"
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
                <span>Payer {{ finalPrice | number: '1.0-0' }} TND via Stripe →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Print styles (isolés, uniquement le reçu) -->
    <style>
      @media print {
        body > *:not(.combo-print-overlay) {
          display: none !important;
        }
        .combo-print-overlay {
          display: block !important;
        }
        #combo-receipt-print {
          display: block !important;
          border: none !important;
        }
      }
    </style>
  `,
})
export class ComboParcoursComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() comboCompleted = new EventEmitter<any>();

  currentStep = 0;
  steps = ['Introduction', 'Sélection', 'Récapitulatif', 'Confirmation'];

  availableFormations: ComboFormationItem[] = [];
  loadingFormations = false;

  selectedIds = new Set<string>();
  enrolledIds = new Set<string>();
  activeComboFormationIds = new Set<string>();

  submitting = false;
  confirmedFormationCount = 0;
  confirmedReceiptRef = '';

  today = new Date();
  receiptPreviewRef = 'BRG-COMBO-XXXXX';

  benefits = [
    {
      type: 'target',
      title: 'Parcours sur-mesure',
      desc: 'Combinez les formations selon vos besoins',
    },
    {
      type: 'discount',
      title: "Remise jusqu'à 40%",
      desc: 'Plus vous choisissez, plus vous économisez',
    },
    {
      type: 'receipt',
      title: 'Reçu professionnel',
      desc: 'Devis imprimable et confirmation par email',
    },
  ];

  discountTiers = [
    { label: '2 formations', discount: 10, highlight: false },
    { label: '3 formations', discount: 15, highlight: false },
    { label: '4 formations', discount: 20, highlight: true },
    { label: '5+ formations', discount: '20+', highlight: false },
  ];

  constructor(
    private comboService: ComboEnrollmentService,
    private formationService: FormationService,
    private enrollmentService: EnrollmentService,
    private authService: AuthService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    if (!this.user) {
      this.user = this.authService.getCurrentUser();
    }
    this.generateReceiptPreviewRef();
    this.loadData();
  }

  // ─── Data loading ────────────────────────────────────────────────────────

  loadData(): void {
    this.loadingFormations = true;
    this.formationService.getFormations().subscribe({
      next: (list: Formation[]) => {
        this.availableFormations = list
          .filter((f) => !f.archived)
          .map((f) => ({
            id: f.id.toString(),
            nom: f.nom,
            description: f.description,
            category: f.category,
            totalPrice: f.totalPrice,
            defaultDurationWeeks: f.defaultDurationWeeks,
            formateurNom: f.formateurNom,
          }));
        this.loadingFormations = false;
        this.checkExistingEnrollments();
      },
      error: () => {
        this.loadingFormations = false;
        this.toastService.error('Impossible de charger les formations.', 'Erreur');
      },
    });
  }

  checkExistingEnrollments(): void {
    if (!this.user?.id) return;
    const studentId = Number(this.user.id);
    this.enrollmentService.getEnrollmentsByStudent(studentId).subscribe({
      next: (enrollments) => {
        this.enrolledIds.clear();
        (enrollments || []).forEach((e) => {
          if (e.formationId) {
            this.enrolledIds.add(e.formationId.toString());
          }
        });
      },
      error: () => {},
    });

    this.comboService.getCombosByStudent(studentId).subscribe({
      next: (combos: ComboEnrollment[]) => {
        this.activeComboFormationIds.clear();
        (combos || []).forEach((c) => {
          if (c.status === 'ACTIVE' || c.status === 'PENDING_PAYMENT') {
            (c.formations || []).forEach((f: any) => {
              this.activeComboFormationIds.add(f.id.toString());
            });
          }
        });
      },
      error: () => {},
    });
  }

  generateReceiptPreviewRef(): void {
    const rand = Math.floor(10000 + Math.random() * 90000);
    this.receiptPreviewRef = `BRG-COMBO-${rand}`;
  }

  // ─── Computed properties ─────────────────────────────────────────────────

  get selectedFormations(): ComboFormationItem[] {
    return this.availableFormations.filter((f) => this.selectedIds.has(f.id));
  }

  get totalPriceRaw(): number {
    return this.selectedFormations.reduce((sum, f) => sum + (f.totalPrice || 0), 0);
  }

  get totalWeeks(): number {
    return this.selectedFormations.reduce((sum, f) => sum + (f.defaultDurationWeeks || 0), 0);
  }

  get currentDiscount(): number {
    return computeComboDiscount(this.selectedIds.size);
  }

  get discountAmount(): number {
    return (this.totalPriceRaw * this.currentDiscount) / 100;
  }

  get finalPrice(): number {
    return this.totalPriceRaw - this.discountAmount;
  }

  get nextDiscount(): number {
    const n = this.selectedIds.size;
    if (n === 0) return 10;
    if (n === 1) return 10;
    if (n === 2) return 15;
    if (n === 3) return 20;
    return 40;
  }

  get formationNeededForNextTier(): number {
    if (this.selectedIds.size < 2) return 2 - this.selectedIds.size;
    return 1;
  }

  // ─── Selection logic ─────────────────────────────────────────────────────

  toggleFormation(f: ComboFormationItem): void {
    const id = f.id.toString();
    if (this.activeComboFormationIds.has(id)) {
      this.toastService.warning(
        `Cette formation est déjà dans un combo actif.`,
        '⚠️ Formation réservée',
      );
      return;
    }
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  getFormationCardClass(f: ComboFormationItem): string {
    const id = f.id.toString();
    if (this.activeComboFormationIds.has(id)) {
      return 'border-amber-500/20 opacity-50 cursor-not-allowed';
    }
    if (this.selectedIds.has(id)) {
      return 'border-[#C62761]/70 shadow-[0_0_20px_rgba(198,39,97,0.15)] bg-gradient-to-br from-[#C62761]/5 to-[#F5A623]/5';
    }
    return 'border-[var(--bridge-border)] hover:border-[var(--bridge-gold)]/50 hover:-translate-y-0.5';
  }

  // ─── Navigation ──────────────────────────────────────────────────────────

  nextStep(): void {
    if (this.currentStep === 1 && this.selectedIds.size < 2) {
      this.toastService.warning('Sélectionnez au moins 2 formations.', '⚠️ Sélection');
      return;
    }
    this.currentStep = Math.min(this.currentStep + 1, 3);
  }

  prevStep(): void {
    this.currentStep = Math.max(this.currentStep - 1, 0);
  }

  // ─── Stripe payment ──────────────────────────────────────────────────────

  proceedToStripe(): void {
    if (this.selectedIds.size < 2) {
      this.toastService.warning('Sélectionnez au moins 2 formations.', '⚠️ Combo invalide');
      return;
    }
    if (!this.user?.id) {
      this.toastService.error('Utilisateur non connecté.', 'Erreur');
      return;
    }

    this.submitting = true;
    const formationIds = Array.from(this.selectedIds).map((id) => Number(id));

    this.comboService
      .createCombo(
        Number(this.user.id),
        formationIds,
        `Combo de ${formationIds.length} formations personnalisé`,
      )
      .subscribe({
        next: (res: ComboEnrollment) => {
          this.submitting = false;
          if (res.stripeCheckoutUrl) {
            this.toastService.info('Redirection vers Stripe Checkout...', 'Paiement');
            window.location.href = res.stripeCheckoutUrl;
          } else {
            this.confirmedFormationCount = formationIds.length;
            this.confirmedReceiptRef = res.receiptRef || this.receiptPreviewRef;
            this.currentStep = 3;
            this.comboCompleted.emit(res);
          }
        },
        error: (err) => {
          this.submitting = false;
          this.toastService.error(
            err.error?.message || 'Erreur lors de la création du combo.',
            'Erreur',
          );
        },
      });
  }

  printReceipt(): void {
    window.print();
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    this.close();
  }
}
