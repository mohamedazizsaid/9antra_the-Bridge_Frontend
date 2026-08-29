import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Formation } from '../../../core/models/formation.model';
import { EnrollmentService, EnrollmentResponse } from '../../../core/services/enrollment.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user.model';

export interface EnrollmentResult {
  enrollment: EnrollmentResponse;
  formation: Formation;
}

@Component({
  selector: 'app-enrollment-stepper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- ═══ Backdrop ═══ -->
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      (click)="onBackdropClick($event)"
    >
      <!-- Blur overlay -->
      <div class="absolute inset-0 bg-black/75 backdrop-blur-md"></div>

      <!-- Modal -->
      <div
        class="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        (click)="$event.stopPropagation()"
        [style]="'animation: slideUpFadeIn 0.3s ease both'"
      >
        <!-- Glass card -->
        <div class="glass-card border border-[var(--bridge-border)] flex flex-col overflow-hidden">
          <!-- Top gradient bar -->
          <div
            class="h-1 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623] flex-shrink-0"
          ></div>

          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[var(--bridge-gold)]/30 flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-[var(--bridge-gold)]"
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
                <h2 class="font-syne font-bold text-white text-base">Inscription à la formation</h2>
                <p class="text-[11px] text-[var(--bridge-text-muted)] truncate max-w-[280px]">
                  {{ formation?.nom }}
                </p>
              </div>
            </div>
            <button
              (click)="close()"
              class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Stepper indicator -->
          <div
            class="flex items-center justify-center gap-0 px-6 py-4 border-b border-white/5 flex-shrink-0"
            *ngIf="currentStep < 4"
          >
            <ng-container *ngFor="let step of steps; let i = index; let last = last">
              <!-- Step circle -->
              <div class="flex flex-col items-center gap-1">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300"
                  [class]="getStepClass(i + 1)"
                >
                  <svg
                    *ngIf="currentStep > i + 1"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span *ngIf="currentStep <= i + 1">{{ i + 1 }}</span>
                </div>
                <span
                  class="text-[9px] font-semibold uppercase tracking-wide transition-colors"
                  [class]="
                    currentStep === i + 1
                      ? 'text-white'
                      : currentStep > i + 1
                        ? 'text-emerald-400'
                        : 'text-white/30'
                  "
                >
                  {{ step }}
                </span>
              </div>
              <!-- Connector line -->
              <div
                *ngIf="!last"
                class="h-0.5 w-16 mx-2 mb-5 rounded-full transition-all duration-500"
                [class]="
                  currentStep > i + 1
                    ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623]'
                    : 'bg-white/10'
                "
              ></div>
            </ng-container>
          </div>

          <!-- Scrollable content -->
          <div class="flex-1 overflow-y-auto p-6 min-h-0">
            <!-- ═══ STEP 1: Choix du parcours ═══ -->
            <div *ngIf="currentStep === 1" class="space-y-5 animate-fadein">
              <div>
                <p class="text-white font-syne font-bold text-base mb-1">
                  Choisissez votre parcours
                </p>
                <p class="text-[var(--bridge-text-muted)] text-xs">
                  Sélectionnez le type d'inscription qui vous convient le mieux.
                </p>
              </div>

              <!-- Formation summary card -->
              <div class="glass-card border border-[var(--bridge-border)] p-4 rounded-2xl">
                <div class="flex items-start gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[var(--bridge-gold)]/20 flex items-center justify-center flex-shrink-0"
                  >
                    <svg
                      class="w-5 h-5 text-[#F5A623]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect x="5" y="4" width="14" height="16" rx="2" />
                      <path d="M9 4V2h6v2" />
                      <line x1="8" y1="9" x2="16" y2="9" />
                      <line x1="8" y1="13" x2="16" y2="13" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-syne font-bold text-white text-sm">{{ formation?.nom }}</p>
                    <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5 line-clamp-2">
                      {{ formation?.description }}
                    </p>
                    <div class="flex items-center gap-3 mt-2">
                      <span class="text-[10px] text-white/50 flex items-center gap-1">
                        <svg
                          class="w-3 h-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <circle cx="12" cy="7" r="3" />
                          <path d="M5 21a7 7 0 0 1 14 0" />
                        </svg>
                        {{ formation?.formateurNom }}
                      </span>
                      <span class="text-[10px] font-mono font-bold text-[#F5A623]"
                        >{{ formation?.totalPrice | number }} TND</span
                      >
                      <span *ngIf="formation?.phases?.length" class="text-[10px] text-white/50">
                        {{ formation?.phases?.length }} phase(s)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Option A: Parcours standard -->
              <div
                class="cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 hover:scale-[1.01]"
                [class]="
                  selectedOption === 'standard'
                    ? 'border-emerald-500/60 bg-emerald-500/5 shadow-lg shadow-emerald-500/10'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                "
                (click)="selectOption('standard')"
              >
                <div class="flex items-start gap-3">
                  <div
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                    [class]="
                      selectedOption === 'standard'
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-white/30'
                    "
                  >
                    <div
                      *ngIf="selectedOption === 'standard'"
                      class="w-2 h-2 rounded-full bg-white"
                    ></div>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <p class="font-syne font-bold text-white text-sm">Parcours standard</p>
                      <span
                        class="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wide"
                        >Recommandé</span
                      >
                    </div>
                    <p class="text-xs text-[var(--bridge-text-muted)] leading-relaxed">
                      Suivez le programme tel qu'il a été conçu par le formateur.
                      <ng-container *ngIf="defaultDurationWeeks">
                        Durée :
                        <strong class="text-white">{{ defaultDurationWeeks }} semaine(s)</strong>.
                      </ng-container>
                      Inscription immédiate et confirmée.
                    </p>
                    <div class="flex items-center gap-2 mt-2">
                      <span
                        class="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold"
                        >✓ Inscription immédiate</span
                      >
                      <span class="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-white/50"
                        >{{ formation?.phases?.length || 0 }} phase(s) prévue(s)</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Option B: Durée personnalisée -->
              <div
                class="cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 hover:scale-[1.01]"
                [class]="
                  selectedOption === 'custom'
                    ? 'border-[#C62761]/60 bg-[#C62761]/5 shadow-lg shadow-[#C62761]/10'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                "
                (click)="selectOption('custom')"
              >
                <div class="flex items-start gap-3">
                  <div
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                    [class]="
                      selectedOption === 'custom'
                        ? 'border-[#C62761] bg-[#C62761]'
                        : 'border-white/30'
                    "
                  >
                    <div
                      *ngIf="selectedOption === 'custom'"
                      class="w-2 h-2 rounded-full bg-white"
                    ></div>
                  </div>
                  <div class="flex-1">
                    <p class="font-syne font-bold text-white text-sm mb-1">Durée personnalisée</p>
                    <p class="text-xs text-[var(--bridge-text-muted)] leading-relaxed mb-3">
                      Proposez une durée de formation adaptée à votre emploi du temps. Le formateur
                      devra valider votre demande.
                    </p>

                    <!-- Duration slider (only visible when custom is selected) -->
                    <div
                      *ngIf="selectedOption === 'custom'"
                      class="mt-3 space-y-3 animate-fadein"
                      (click)="$event.stopPropagation()"
                    >
                      <div class="flex items-center justify-between">
                        <label
                          class="text-[10px] text-white/60 font-semibold uppercase tracking-wider"
                          >Durée souhaitée</label
                        >
                        <span class="text-sm font-mono font-bold text-[#F5A623]"
                          >{{ customDurationWeeks }} semaine{{
                            customDurationWeeks > 1 ? 's' : ''
                          }}</span
                        >
                      </div>
                      <input
                        type="range"
                        [(ngModel)]="customDurationWeeks"
                        [min]="1"
                        [max]="52"
                        step="1"
                        class="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#C62761]"
                        style="background: linear-gradient(to right, #C62761 0%, #F5A623 {{
                          (customDurationWeeks / 52) * 100
                        }}%, rgba(255,255,255,0.1) {{ (customDurationWeeks / 52) * 100 }}%)"
                      />
                      <div class="flex justify-between text-[9px] text-white/30 font-mono">
                        <span>1 sem.</span>
                        <span>13 sem.</span>
                        <span>26 sem.</span>
                        <span>52 sem.</span>
                      </div>
                      <!-- Alternative: number input -->
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] text-white/50">Ou saisir :</span>
                        <input
                          type="number"
                          [(ngModel)]="customDurationWeeks"
                          [min]="1"
                          [max]="52"
                          class="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#C62761] transition-colors text-center"
                        />
                        <span class="text-[10px] text-white/50">semaine(s)</span>
                      </div>
                      <div class="flex items-center gap-2 pt-1">
                        <span
                          class="text-[10px] px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-semibold"
                          >⏳ Validation requise</span
                        >
                        <span class="text-[10px] text-white/40"
                          >Le formateur a 48h pour répondre</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ═══ STEP 2: Informations complémentaires ═══ -->
            <div *ngIf="currentStep === 2" class="space-y-5 animate-fadein">
              <div>
                <p class="text-white font-syne font-bold text-base mb-1">
                  Informations complémentaires
                </p>
                <p class="text-[var(--bridge-text-muted)] text-xs">
                  <ng-container *ngIf="selectedOption === 'custom'"
                    >Expliquez au formateur vos contraintes ou motivations pour cette durée
                    personnalisée.</ng-container
                  >
                  <ng-container *ngIf="selectedOption === 'standard'"
                    >Confirmez les détails de votre inscription au parcours standard.</ng-container
                  >
                </p>
              </div>

              <!-- Recap card -->
              <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
                <p class="text-[10px] text-white/50 font-semibold uppercase tracking-wider">
                  Récapitulatif
                </p>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span class="text-[var(--bridge-text-muted)]">Formation</span>
                    <p class="text-white font-semibold mt-0.5 truncate">{{ formation?.nom }}</p>
                  </div>
                  <div>
                    <span class="text-[var(--bridge-text-muted)]">Formateur</span>
                    <p class="text-white font-semibold mt-0.5">{{ formation?.formateurNom }}</p>
                  </div>
                  <div>
                    <span class="text-[var(--bridge-text-muted)]">Parcours</span>
                    <p
                      class="mt-0.5 font-semibold"
                      [class]="
                        selectedOption === 'standard' ? 'text-emerald-400' : 'text-[#F5A623]'
                      "
                    >
                      {{ selectedOption === 'standard' ? 'Standard' : 'Durée personnalisée' }}
                    </p>
                  </div>
                  <div>
                    <span class="text-[var(--bridge-text-muted)]">Durée</span>
                    <p class="text-white font-semibold mt-0.5">
                      {{
                        selectedOption === 'standard'
                          ? defaultDurationWeeks
                            ? defaultDurationWeeks + ' sem.'
                            : 'Par défaut'
                          : customDurationWeeks + ' semaine(s)'
                      }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Message de motivation (only for custom) -->
              <div *ngIf="selectedOption === 'custom'">
                <label
                  class="text-[10px] text-white/60 font-semibold uppercase tracking-wider block mb-2"
                >
                  Message pour le formateur <span class="text-[#F5A623]">(recommandé)</span>
                </label>
                <textarea
                  [(ngModel)]="motivationMessage"
                  rows="4"
                  placeholder="Ex: Je suis disponible uniquement le weekend, j'aimerais adapter la formation sur 8 semaines intensives plutôt que le parcours standard..."
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors resize-none"
                ></textarea>
                <p class="text-[10px] text-white/30 mt-1">
                  {{ motivationMessage.length }}/500 caractères
                </p>
              </div>

              <!-- Avertissement pour custom -->
              <div
                *ngIf="selectedOption === 'custom'"
                class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2.5"
              >
                <svg
                  class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 3 2.5 20h19L12 3z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <circle cx="12" cy="16.5" r=".8" fill="currentColor" stroke="none" />
                </svg>
                <p class="text-[11px] text-amber-200/80 leading-relaxed">
                  Votre demande sera examinée par le formateur sous <strong>48h</strong>. Vous
                  recevrez une notification avec sa réponse. En attendant, vous pouvez consulter le
                  catalogue d'autres formations.
                </p>
              </div>

              <!-- Avertissement pour standard -->
              <div
                *ngIf="selectedOption === 'standard'"
                class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-start gap-2.5"
              >
                <svg
                  class="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="8 12 11 15 16 9" />
                </svg>
                <p class="text-[11px] text-emerald-200/80 leading-relaxed">
                  Votre inscription sera <strong>confirmée immédiatement</strong>. Les phases et les
                  paiements correspondants seront générés automatiquement.
                </p>
              </div>
            </div>

            <!-- ═══ STEP 3: Confirmation ═══ -->
            <div *ngIf="currentStep === 3" class="space-y-5 animate-fadein">
              <div>
                <p class="text-white font-syne font-bold text-base mb-1">Confirmer l'inscription</p>
                <p class="text-[var(--bridge-text-muted)] text-xs">
                  Vérifiez les informations ci-dessous avant de valider.
                </p>
              </div>

              <!-- Final recap -->
              <div
                class="glass-card border rounded-2xl p-5 space-y-4"
                [class]="
                  selectedOption === 'custom' ? 'border-amber-500/30' : 'border-emerald-500/30'
                "
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-2 h-2 rounded-full"
                    [class]="selectedOption === 'custom' ? 'bg-amber-400' : 'bg-emerald-400'"
                  ></div>
                  <p
                    class="text-[10px] font-bold uppercase tracking-wider"
                    [class]="selectedOption === 'custom' ? 'text-amber-400' : 'text-emerald-400'"
                  >
                    {{
                      selectedOption === 'custom'
                        ? 'Demande de durée personnalisée'
                        : 'Parcours standard'
                    }}
                  </p>
                </div>
                <div class="space-y-2.5 text-xs">
                  <div class="flex items-center justify-between border-b border-white/5 pb-2">
                    <span class="text-[var(--bridge-text-muted)]">Formation</span>
                    <span class="text-white font-semibold">{{ formation?.nom }}</span>
                  </div>
                  <div class="flex items-center justify-between border-b border-white/5 pb-2">
                    <span class="text-[var(--bridge-text-muted)]">Formateur</span>
                    <span class="text-white font-semibold">{{ formation?.formateurNom }}</span>
                  </div>
                  <div class="flex items-center justify-between border-b border-white/5 pb-2">
                    <span class="text-[var(--bridge-text-muted)]">Durée</span>
                    <span
                      class="font-bold"
                      [class]="selectedOption === 'custom' ? 'text-amber-400' : 'text-emerald-400'"
                    >
                      {{
                        selectedOption === 'standard'
                          ? defaultDurationWeeks
                            ? defaultDurationWeeks + ' semaines (standard)'
                            : 'Parcours par défaut'
                          : customDurationWeeks + ' semaine(s) (personnalisé)'
                      }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between border-b border-white/5 pb-2">
                    <span class="text-[var(--bridge-text-muted)]">Prix total</span>
                    <span class="text-[#F5A623] font-mono font-bold"
                      >{{ formation?.totalPrice || 0 | number }} TND</span
                    >
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-[var(--bridge-text-muted)]">Statut après inscription</span>
                    <span
                      class="font-bold"
                      [class]="selectedOption === 'custom' ? 'text-amber-400' : 'text-emerald-400'"
                    >
                      {{
                        selectedOption === 'custom'
                          ? '⏳ En attente de validation'
                          : '✓ Confirmée immédiatement'
                      }}
                    </span>
                  </div>
                </div>

                <!-- Motivation preview for custom -->
                <div
                  *ngIf="selectedOption === 'custom' && motivationMessage.trim()"
                  class="border-t border-white/5 pt-3"
                >
                  <p class="text-[10px] text-white/50 uppercase tracking-wider mb-1">
                    Votre message
                  </p>
                  <p class="text-xs text-white/70 italic leading-relaxed">
                    « {{ motivationMessage }} »
                  </p>
                </div>
              </div>

              <!-- Error -->
              <div
                *ngIf="errorMsg"
                class="rounded-xl border border-red-500/30 bg-red-500/10 p-3 flex items-center gap-2"
              >
                <svg
                  class="w-4 h-4 text-red-400 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <circle cx="12" cy="16" r=".8" fill="currentColor" stroke="none" />
                </svg>
                <p class="text-[11px] text-red-300">{{ errorMsg }}</p>
              </div>
            </div>

            <!-- ═══ STEP 4: Succès ═══ -->
            <div
              *ngIf="currentStep === 4"
              class="py-8 flex flex-col items-center justify-center text-center space-y-5 animate-fadein"
            >
              <!-- Success icon -->
              <div
                class="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-2xl"
                [class]="
                  enrollmentResult?.status === 'PENDING'
                    ? 'bg-gradient-to-br from-amber-500/20 to-amber-400/10 border border-amber-500/30'
                    : 'bg-gradient-to-br from-emerald-500/20 to-teal-400/10 border border-emerald-500/30'
                "
                style="animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both"
              >
                <span *ngIf="enrollmentResult?.status === 'PENDING'">⏳</span>
                <span *ngIf="enrollmentResult?.status !== 'PENDING'">🎉</span>
              </div>

              <div class="space-y-2">
                <h3 class="font-syne font-bold text-xl text-white">
                  {{
                    enrollmentResult?.status === 'PENDING'
                      ? 'Demande envoyée !'
                      : 'Inscription confirmée !'
                  }}
                </h3>
                <p class="text-[var(--bridge-text-muted)] text-sm max-w-sm mx-auto leading-relaxed">
                  <ng-container *ngIf="enrollmentResult?.status === 'PENDING'">
                    Votre demande pour <strong class="text-white">{{ formation?.nom }}</strong> avec
                    une durée de
                    <strong class="text-[#F5A623]"
                      >{{ enrollmentResult?.customDurationWeeks }} semaine(s)</strong
                    >
                    est en attente de validation. Le formateur vous répondra sous 48h.
                  </ng-container>
                  <ng-container *ngIf="enrollmentResult?.status !== 'PENDING'">
                    Vous êtes maintenant inscrit(e) à
                    <strong class="text-white">{{ formation?.nom }}</strong
                    >. Votre parcours est actif et vos paiements ont été générés.
                  </ng-container>
                </p>
              </div>

              <!-- Status badge -->
              <div
                class="px-4 py-2 rounded-full text-sm font-bold border"
                [class]="
                  enrollmentResult?.status === 'PENDING'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                "
              >
                {{
                  enrollmentResult?.status === 'PENDING'
                    ? '⏳ En attente de validation formateur'
                    : '✓ Inscription validée'
                }}
              </div>

              <button
                (click)="close()"
                class="px-6 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>

          <!-- Footer: Navigation buttons -->
          <div
            *ngIf="currentStep < 4"
            class="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/5 flex-shrink-0"
          >
            <button
              (click)="prevStep()"
              [disabled]="currentStep === 1"
              class="px-4 py-2 rounded-xl text-xs font-bold border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              ← Retour
            </button>

            <div class="flex items-center gap-2">
              <!-- Step dots -->
              <div class="flex items-center gap-1.5" *ngIf="currentStep < 4">
                <div
                  *ngFor="let s of steps; let i = index"
                  class="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  [class]="
                    currentStep === i + 1
                      ? 'bg-[#C62761] w-3'
                      : currentStep > i + 1
                        ? 'bg-emerald-500'
                        : 'bg-white/20'
                  "
                ></div>
              </div>
            </div>

            <button
              *ngIf="currentStep < 3"
              (click)="nextStep()"
              [disabled]="!canProceed"
              class="px-5 py-2 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
            >
              Suivant →
            </button>

            <button
              *ngIf="currentStep === 3"
              (click)="confirmEnrollment()"
              [disabled]="submitting"
              class="px-5 py-2 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span
                *ngIf="submitting"
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></span>
              <span>{{ submitting ? 'En cours...' : "Confirmer l'inscription" }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <style>
      @keyframes slideUpFadeIn {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.5);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes fadein {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fadein {
        animation: fadein 0.25s ease both;
      }
    </style>
  `,
})
export class EnrollmentStepperComponent implements OnInit {
  @Input() formation!: Formation;
  @Input() user!: User | null;
  @Output() closed = new EventEmitter<void>();
  @Output() enrolled = new EventEmitter<EnrollmentResult>();

  steps = ['Parcours', 'Détails', 'Confirmation'];
  currentStep = 1;

  selectedOption: 'standard' | 'custom' = 'standard';
  customDurationWeeks = 4;
  motivationMessage = '';

  submitting = false;
  errorMsg = '';
  enrollmentResult: EnrollmentResponse | null = null;

  get defaultDurationWeeks(): number | undefined {
    return this.formation?.defaultDurationWeeks;
  }

  get canProceed(): boolean {
    if (this.currentStep === 1) return this.selectedOption !== null;
    return true;
  }

  constructor(
    private enrollmentService: EnrollmentService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    // Pre-fill custom duration with default if available
    if (this.formation?.defaultDurationWeeks) {
      this.customDurationWeeks = this.formation.defaultDurationWeeks;
    }
  }

  selectOption(opt: 'standard' | 'custom'): void {
    this.selectedOption = opt;
  }

  getStepClass(step: number): string {
    if (this.currentStep > step) return 'border-emerald-500 bg-emerald-500 text-white';
    if (this.currentStep === step)
      return 'border-[#C62761] bg-gradient-to-br from-[#C62761] to-[#F5A623] text-white shadow-lg shadow-[rgba(198,39,97,0.3)]';
    return 'border-white/20 bg-white/5 text-white/30';
  }

  nextStep(): void {
    if (!this.canProceed) return;
    this.errorMsg = '';
    this.currentStep = Math.min(this.currentStep + 1, 3);
  }

  prevStep(): void {
    this.errorMsg = '';
    this.currentStep = Math.max(this.currentStep - 1, 1);
  }

  onBackdropClick(e: Event): void {
    if (!this.submitting) this.close();
  }

  close(): void {
    if (!this.submitting) this.closed.emit();
  }

  confirmEnrollment(): void {
    if (!this.user || !this.formation || this.submitting) return;
    this.submitting = true;
    this.errorMsg = '';

    const req = {
      studentId: parseInt(this.user.id),
      formationId: parseInt(this.formation.id),
      customDurationWeeks: this.selectedOption === 'custom' ? this.customDurationWeeks : null,
      motivationMessage:
        this.selectedOption === 'custom' && this.motivationMessage.trim()
          ? this.motivationMessage.trim()
          : null,
    };

    this.enrollmentService.enrollStudentWithOptions(req).subscribe({
      next: (result) => {
        this.submitting = false;
        this.enrollmentResult = result;
        this.currentStep = 4;
        this.enrolled.emit({ enrollment: result, formation: this.formation });

        if (result.status === 'APPROVED') {
          this.toastService.success(
            `Vous êtes inscrit(e) à « ${this.formation.nom} » !`,
            '🎉 Inscription confirmée',
          );
        } else {
          this.toastService.info(
            `Votre demande pour « ${this.formation.nom} » est en attente de validation.`,
            '⏳ Demande envoyée',
          );
        }
      },
      error: (err: any) => {
        this.submitting = false;
        this.errorMsg = err?.error?.message || "Une erreur s'est produite lors de l'inscription.";
      },
    });
  }
}
