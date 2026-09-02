import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormationService } from '../../core/services/formation.service';
import { OnboardingService } from '../../core/services/onboarding.service';
import { ToastService } from '../../core/services/toast.service';
import { Formation } from '../../core/models/formation.model';
import {
  InternshipPaymentMode,
  OnboardingPayload,
} from '../../core/models/stage-inscription.model';
import { User } from '../../core/models/user.model';
import { AnimatedBgComponent } from '../../shared/components/animated-bg/animated-bg.component';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AnimatedBgComponent],
  template: `
    <app-animated-bg></app-animated-bg>
    <div
      class="min-h-screen relative z-10 font-inter flex flex-col justify-between py-6 px-4 md:px-8"
      style="color: var(--bridge-text)"
    >
      <!-- Top Header / Brand -->
      <header
        class="max-w-5xl w-full mx-auto flex items-center justify-between py-2 pb-4 mb-4"
        style="border-bottom: 1px solid var(--bridge-border)"
      >
        <div class="flex items-center gap-3">
          <svg class="w-8 h-10" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M40 10 C20 10 10 25 10 38 C10 51 20 58 40 58 C48 58 54 55 58 50"
              stroke="#C62761"
              stroke-width="8"
              stroke-linecap="round"
              fill="none"
            />
            <path
              d="M40 90 C60 90 70 75 70 62 C70 49 60 42 40 42 C32 42 26 45 22 50"
              stroke="#F5A623"
              stroke-width="8"
              stroke-linecap="round"
              fill="none"
            />
          </svg>
          <div>
            <h1 class="font-syne font-bold text-xl tracking-wide" style="color: var(--bridge-text)">
              The <span class="text-gradient">Bridge</span>
            </h1>
            <p class="text-[9px] tracking-[3px] uppercase text-[var(--bridge-text-muted)]">
              9antra Onboarding
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <p class="text-xs font-semibold" style="color: var(--bridge-text)">
              {{ currentUser?.prenom }} {{ currentUser?.nom }}
            </p>
            <p class="text-[10px] text-[var(--bridge-gold)]">
              CIN: {{ currentUser?.cin || 'Non renseigné' }}
            </p>
          </div>
          <div
            class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center font-bold text-xs border border-white/20"
          >
            {{ userInitials }}
          </div>
        </div>
      </header>

      <!-- Main Stepper Container -->
      <main class="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-center">
        <!-- Progress Stepper Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-3 text-xs">
            <span class="font-syne font-bold uppercase tracking-wider text-[var(--bridge-gold)]">
              Étape {{ currentStepIndex + 1 }} / {{ activeSteps.length }} : {{ currentStepTitle }}
            </span>
            <span class="font-mono" style="color: var(--bridge-text-muted)"
              >{{ getProgressPercentage() }}%</span
            >
          </div>

          <!-- Progress Bar -->
          <div
            class="h-2 w-full rounded-full overflow-hidden relative"
            style="background: var(--bridge-border)"
          >
            <div
              class="h-full bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623] transition-all duration-500 ease-out"
              [style.width.%]="getProgressPercentage()"
            ></div>
          </div>

          <!-- Step Pills (Desktop) -->
          <div class="hidden sm:flex items-center justify-between mt-4">
            <div
              *ngFor="let step of activeSteps; let i = index"
              (click)="canJumpToStep(i) ? goToStepIndex(i) : null"
              class="flex items-center gap-2 cursor-pointer transition-all"
              [class.opacity-40]="i > currentStepIndex"
              [class.cursor-not-allowed]="!canJumpToStep(i)"
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
                <svg
                  *ngIf="i < currentStepIndex"
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span *ngIf="i >= currentStepIndex">{{ i + 1 }}</span>
              </div>
              <span
                class="text-[11px] font-medium hidden md:inline"
                [style]="
                  i === currentStepIndex
                    ? 'color: var(--bridge-text)'
                    : 'color: var(--bridge-text-muted)'
                "
              >
                {{ step.label }}
              </span>
            </div>
          </div>
        </div>

        <!-- Glassmorphism Main Content Card -->
        <div
          class="glass-card p-6 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl"
          style="border: 1px solid var(--bridge-border)"
        >
          <!-- ════════════════════════════════════════════════════════════════ -->
          <!-- STEP 1: CHOIX DU TYPE (Stage Facultatif VS Formations)          -->
          <!-- ════════════════════════════════════════════════════════════════ -->
          <div *ngIf="currentStepId === 'type'" class="space-y-6 animate-fadeIn">
            <div class="text-center max-w-lg mx-auto">
              <span
                class="px-3 py-1 bg-[rgba(198,39,97,0.15)] text-[#C62761] rounded-full text-xs font-bold uppercase tracking-wider border border-[#C62761]/30"
              >
                Bienvenue sur The Bridge
              </span>
              <h2
                class="font-syne font-extrabold text-2xl md:text-3xl mt-3"
                style="color: var(--bridge-text)"
              >
                Quel est votre objectif principal ?
              </h2>
              <p class="text-xs md:text-sm text-[var(--bridge-text-muted)] mt-2">
                Choisissez si vous souhaitez conventionner un stage facultatif avec convention
                officielle ou suivre uniquement des formations certifiantes.
              </p>
            </div>

            <div class="grid md:grid-cols-2 gap-6 pt-4">
              <!-- Option 1: Stage Facultatif -->
              <div
                (click)="wantsInternship = true"
                class="p-6 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
                [ngClass]="
                  wantsInternship
                    ? 'border-[var(--bridge-crimson)] bg-[rgba(198,39,97,0.08)] shadow-[0_0_30px_rgba(198,39,97,0.2)]'
                    : 'hover:border-[var(--bridge-border)]'
                "
              >
                <div
                  *ngIf="wantsInternship"
                  class="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--bridge-crimson)] flex items-center justify-center text-white"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <div>
                  <div
                    class="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center text-white mb-4 shadow-md"
                  >
                    <svg
                      class="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <h3
                    class="font-syne font-bold text-lg group-hover:text-[var(--bridge-gold)] transition-colors"
                    style="color: var(--bridge-text)"
                  >
                    Stage Facultatif + Formations
                  </h3>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-2 leading-relaxed">
                    Obtenez une convention de stage officielle 9antra, un encadrement personnalisé
                    sur projet réel et les formations de votre choix.
                  </p>
                </div>

                <div
                  class="mt-6 pt-4 flex items-center justify-between text-xs"
                  style="border-top: 1px solid var(--bridge-border); color: var(--bridge-text-muted)"
                >
                  <span class="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <svg
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Convention officielle incluse
                  </span>
                  <span class="text-[var(--bridge-gold)] font-bold">Populaire</span>
                </div>
              </div>

              <!-- Option 2: Formations Seules -->
              <div
                (click)="wantsInternship = false"
                class="p-6 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between"
                [ngClass]="
                  !wantsInternship
                    ? 'border-[var(--bridge-gold)] bg-[rgba(245,166,35,0.08)] shadow-[0_0_30px_rgba(245,166,35,0.2)]'
                    : 'hover:border-[var(--bridge-border)]'
                "
              >
                <div
                  *ngIf="!wantsInternship"
                  class="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--bridge-gold)] flex items-center justify-center text-[#10102A]"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <div>
                  <div
                    class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-4"
                  >
                    <svg
                      class="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <h3
                    class="font-syne font-bold text-lg group-hover:text-[var(--bridge-gold)] transition-colors"
                    style="color: var(--bridge-text)"
                  >
                    Formations Certifiantes Uniquement
                  </h3>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-2 leading-relaxed">
                    Sélectionnez vos modules de formation à la carte et validez vos compétences avec
                    des certificats blockchain infalsifiables.
                  </p>
                </div>

                <div
                  class="mt-6 pt-4 flex items-center justify-between text-xs"
                  style="border-top: 1px solid var(--bridge-border); color: var(--bridge-text-muted)"
                >
                  <span class="flex items-center gap-1.5 text-blue-400 font-semibold">
                    <svg
                      class="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Certificats Blockchain
                  </span>
                  <span>Accès direct</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ════════════════════════════════════════════════════════════════ -->
          <!-- STEP 2: DETAILS DU STAGE FACULTATIF (Si choisi)                -->
          <!-- ════════════════════════════════════════════════════════════════ -->
          <div *ngIf="currentStepId === 'stage_details'" class="space-y-6 animate-fadeIn">
            <div>
              <span class="text-xs font-bold text-[var(--bridge-gold)] uppercase tracking-wider"
                >Convention de Stage</span
              >
              <h2 class="font-syne font-bold text-2xl mt-1" style="color: var(--bridge-text)">
                Détails de votre stage facultatif
              </h2>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-1">
                Renseignez le sujet envisagé et joignez vos documents académiques (PDF).
              </p>
            </div>

            <div class="space-y-4">
              <!-- Sujet du stage -->
              <div>
                <label
                  class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                >
                  Titre / Thème du projet de stage <span class="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="stageProjectTitle"
                  placeholder="Ex: Développement d'une plateforme Fullstack Angular & Spring Boot"
                  class="w-full focus:border-[var(--bridge-crimson)] rounded-xl py-3 px-4 text-sm focus:outline-none transition-all"
                  style="background: var(--bridge-surface); border: 1px solid var(--bridge-border); color: var(--bridge-text)"
                />
              </div>

              <!-- Durée en semaines -->
              <div>
                <label
                  class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                >
                  Durée estimée du stage (en semaines) <span class="text-rose-400">*</span>
                </label>
                <div class="flex items-center gap-4">
                  <input
                    type="range"
                    min="4"
                    max="24"
                    step="1"
                    [(ngModel)]="stageDurationWeeks"
                    class="flex-1 accent-[var(--bridge-crimson)] cursor-pointer"
                  />
                  <span
                    class="px-4 py-2 rounded-xl font-mono font-bold text-sm min-w-[100px] text-center"
                    style="background: var(--bridge-card); color: var(--bridge-text); border: 1px solid var(--bridge-border)"
                  >
                    {{ stageDurationWeeks }} sem. ({{ (stageDurationWeeks / 4).toFixed(1) }} mois)
                  </span>
                </div>
              </div>

              <!-- Upload Documents: Drag & Drop Zones -->
              <div class="grid md:grid-cols-2 gap-4 pt-2">
                <!-- Doc 1: Demande de stage -->
                <div
                  (dragover)="onDragOver($event, 'demande')"
                  (dragleave)="onDragLeave('demande')"
                  (drop)="onDropFile($event, 'demande')"
                  (click)="demandeInput.click()"
                  class="p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center relative flex flex-col items-center justify-center min-h-[160px]"
                  [ngClass]="{
                    'border-[var(--bridge-crimson)] bg-[rgba(198,39,97,0.1)]': isDragOverDemande,
                    'border-emerald-500/50 bg-emerald-500/5': demandeFile,
                    'hover:opacity-90': !demandeFile && !isDragOverDemande,
                  }"
                  [style]="
                    !demandeFile && !isDragOverDemande
                      ? 'border-color: var(--bridge-border); background: var(--bridge-surface)'
                      : ''
                  "
                >
                  <input
                    #demandeInput
                    type="file"
                    accept="application/pdf"
                    (change)="onFileSelected($event, 'demande')"
                    class="hidden"
                  />

                  <div *ngIf="!demandeFile" class="space-y-2">
                    <div
                      class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/60"
                    >
                      <svg
                        class="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <p class="text-xs font-semibold" style="color: var(--bridge-text)">
                      Demande de stage (PDF)
                    </p>
                    <p class="text-[10px] text-[var(--bridge-text-muted)]">
                      Glissez votre fichier ici ou cliquez
                    </p>
                  </div>

                  <div *ngIf="demandeFile" class="flex flex-col items-center space-y-2">
                    <span
                      class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"
                    >
                      <svg
                        class="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <p class="text-xs font-semibold text-white truncate max-w-[200px]">
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

                <!-- Doc 2: Lettre d'affectation -->
                <div
                  (dragover)="onDragOver($event, 'lettre')"
                  (dragleave)="onDragLeave('lettre')"
                  (drop)="onDropFile($event, 'lettre')"
                  (click)="lettreInput.click()"
                  class="p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center relative flex flex-col items-center justify-center min-h-[160px]"
                  [ngClass]="{
                    'border-[var(--bridge-gold)] bg-[rgba(245,166,35,0.1)]': isDragOverLettre,
                    'border-emerald-500/50 bg-emerald-500/5': lettreFile,
                    'hover:opacity-90': !lettreFile && !isDragOverLettre,
                  }"
                  [style]="
                    !lettreFile && !isDragOverLettre
                      ? 'border-color: var(--bridge-border); background: var(--bridge-surface)'
                      : ''
                  "
                >
                  <input
                    #lettreInput
                    type="file"
                    accept="application/pdf"
                    (change)="onFileSelected($event, 'lettre')"
                    class="hidden"
                  />

                  <div *ngIf="!lettreFile" class="space-y-2">
                    <div
                      class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/60"
                    >
                      <svg
                        class="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <p class="text-xs font-semibold" style="color: var(--bridge-text)">
                      Lettre d'affectation (PDF)
                    </p>
                    <p class="text-[10px] text-[var(--bridge-text-muted)]">
                      Glissez votre fichier ici ou cliquez
                    </p>
                  </div>

                  <div *ngIf="lettreFile" class="flex flex-col items-center space-y-2">
                    <span
                      class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"
                    >
                      <svg
                        class="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <p class="text-xs font-semibold text-white truncate max-w-[200px]">
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
          </div>

          <!-- ════════════════════════════════════════════════════════════════ -->
          <!-- STEP 3: SELECTION DES FORMATIONS                               -->
          <!-- ════════════════════════════════════════════════════════════════ -->
          <div *ngIf="currentStepId === 'formations'" class="space-y-6 animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span class="text-xs font-bold text-[var(--bridge-gold)] uppercase tracking-wider"
                  >Catalogue Actif</span
                >
                <h2 class="font-syne font-bold text-2xl mt-1" style="color: var(--bridge-text)">
                  Sélectionnez vos formations
                </h2>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-1">
                  Cochez les parcours que vous désirez suivre. Vous pouvez en choisir plusieurs.
                </p>
              </div>

              <div class="flex items-center gap-2">
                <span
                  class="text-xs px-3 py-1.5 rounded-xl font-medium"
                  style="background: var(--bridge-card); color: var(--bridge-text); border: 1px solid var(--bridge-border)"
                >
                  {{ selectedFormationIds.length }} sélectionnée(s)
                </span>
              </div>
            </div>

            <!-- Formations Grid -->
            <div *ngIf="loadingFormations" class="py-12 text-center text-white/50">
              <div
                class="w-8 h-8 border-2 border-[var(--bridge-crimson)] border-t-transparent rounded-full animate-spin mx-auto mb-3"
              ></div>
              <p class="text-xs">Chargement du catalogue...</p>
            </div>

            <div
              *ngIf="!loadingFormations"
              class="grid sm:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1"
            >
              <div
                *ngFor="let formation of availableFormations"
                (click)="toggleFormation(formation.id)"
                class="p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group"
                [ngClass]="
                  isFormationSelected(formation.id)
                    ? 'border-[var(--bridge-crimson)] bg-[rgba(198,39,97,0.1)] shadow-lg'
                    : 'hover:opacity-90'
                "
                [style]="
                  !isFormationSelected(formation.id)
                    ? 'border-color: var(--bridge-border); background: var(--bridge-card)'
                    : ''
                "
              >
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-[var(--bridge-gold)]"
                    >
                      {{ formation.category || 'FORMATION' }}
                    </span>
                    <div
                      class="w-5 h-5 rounded-lg border flex items-center justify-center transition-all"
                      [ngClass]="
                        isFormationSelected(formation.id)
                          ? 'bg-[var(--bridge-crimson)] border-[var(--bridge-crimson)] text-white'
                          : 'border-white/30'
                      "
                    >
                      <svg
                        *ngIf="isFormationSelected(formation.id)"
                        class="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>

                  <h4
                    class="font-syne font-bold text-sm mt-2 group-hover:text-[var(--bridge-gold)] transition-colors line-clamp-1"
                    style="color: var(--bridge-text)"
                  >
                    {{ formation.nom }}
                  </h4>
                  <p
                    class="text-xs text-[var(--bridge-text-muted)] mt-1 line-clamp-2 leading-relaxed"
                  >
                    {{ formation.description }}
                  </p>
                </div>

                <div
                  class="mt-4 pt-3 flex items-center justify-between"
                  style="border-top: 1px solid var(--bridge-border)"
                >
                  <span class="text-[11px]" style="color: var(--bridge-text-muted)">
                    {{ formation.phases.length || 1 }} phase(s)
                  </span>
                  <span class="font-mono font-bold text-sm text-[var(--bridge-gold)]">
                    {{ formation.totalPrice || 0 }} TND
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- ════════════════════════════════════════════════════════════════ -->
          <!-- STEP 4: PARRAINAGE (Optionnel)                                 -->
          <!-- ════════════════════════════════════════════════════════════════ -->
          <div *ngIf="currentStepId === 'referral'" class="space-y-6 animate-fadeIn">
            <div>
              <span class="text-xs font-bold text-[var(--bridge-gold)] uppercase tracking-wider"
                >Avantage Communauté</span
              >
              <h2 class="font-syne font-bold text-2xl text-white mt-1">
                Parrainez un ami & obtenez 10% de remise
              </h2>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-1">
                Invitez un proche à rejoindre The Bridge. Un code de remise de 10% lui sera
                automatiquement envoyé par email.
              </p>
            </div>

            <div
              class="p-6 rounded-2xl bg-gradient-to-r from-[rgba(198,39,97,0.1)] to-[rgba(245,166,35,0.05)] space-y-4"
              style="border: 1px solid var(--bridge-border)"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl bg-[var(--bridge-gold)]/20 text-[var(--bridge-gold)] flex items-center justify-center text-xl"
                >
                  🎁
                </div>
                <div>
                  <h4 class="font-syne font-bold text-sm" style="color: var(--bridge-text)">
                    Programme de Parrainage 9antra
                  </h4>
                  <p class="text-xs text-[var(--bridge-text-muted)]">
                    Votre filleul bénéficiera immédiatement de 10% de réduction.
                  </p>
                </div>
              </div>

              <div>
                <label
                  class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                >
                  Adresse email de votre filleul (Optionnel)
                </label>
                <input
                  type="email"
                  [(ngModel)]="referralEmail"
                  placeholder="ami@exemple.com"
                  class="w-full focus:border-[var(--bridge-crimson)] rounded-xl py-3 px-4 text-sm focus:outline-none transition-all"
                  style="background: var(--bridge-surface); border: 1px solid var(--bridge-border); color: var(--bridge-text)"
                />
              </div>

              <p class="text-[11px] italic" style="color: var(--bridge-text-muted)">
                * Note : Si vous ne souhaitez pas parrainer pour l'instant, vous pouvez laisser ce
                champ vide et cliquer sur Continuer.
              </p>
            </div>
          </div>

          <!-- ════════════════════════════════════════════════════════════════ -->
          <!-- STEP 5: MODE DE PAIEMENT                                       -->
          <!-- ════════════════════════════════════════════════════════════════ -->
          <div *ngIf="currentStepId === 'payment'" class="space-y-6 animate-fadeIn">
            <div>
              <span class="text-xs font-bold text-[var(--bridge-gold)] uppercase tracking-wider"
                >Financement</span
              >
              <h2 class="font-syne font-bold text-2xl mt-1" style="color: var(--bridge-text)">
                Choisissez votre mode de règlement
              </h2>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-1">
                Bénéficiez de 10% de réduction immédiate pour tout paiement comptant.
              </p>
            </div>

            <!-- Option Mode: COMPTANT vs FACILITE -->
            <div class="grid sm:grid-cols-2 gap-4">
              <div
                (click)="paymentPlan = 'COMPTANT'"
                class="p-5 rounded-2xl border-2 transition-all cursor-pointer"
                [ngClass]="
                  paymentPlan === 'COMPTANT'
                    ? 'border-[var(--bridge-crimson)] bg-[rgba(198,39,97,0.1)]'
                    : 'hover:opacity-80'
                "
              >
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-syne font-bold text-sm" style="color: var(--bridge-text)">
                    Paiement Comptant
                  </h4>
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  >
                    -10% de remise
                  </span>
                </div>
                <p class="text-xs text-[var(--bridge-text-muted)]">
                  Réglez la totalité dès l'inscription et profitez d'une réduction de 10%.
                </p>
              </div>

              <div
                (click)="paymentPlan = 'FACILITE'"
                class="p-5 rounded-2xl border-2 transition-all cursor-pointer"
                [ngClass]="
                  paymentPlan === 'FACILITE'
                    ? 'border-[var(--bridge-gold)] bg-[rgba(245,166,35,0.1)]'
                    : 'hover:opacity-80'
                "
                [style]="
                  paymentPlan !== 'FACILITE'
                    ? 'border-color: var(--bridge-border); background: var(--bridge-card)'
                    : ''
                "
              >
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-syne font-bold text-sm" style="color: var(--bridge-text)">
                    Paiement par Facilité
                  </h4>
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                    style="background: var(--bridge-card); color: var(--bridge-text-muted)"
                  >
                    Échelonné
                  </span>
                </div>
                <p class="text-xs text-[var(--bridge-text-muted)]">
                  Réglez phase par phase selon votre rythme d'apprentissage.
                </p>
              </div>
            </div>

            <!-- Sous-options: Méthode de paiement -->
            <div>
              <label
                class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-3"
              >
                Moyen de paiement préféré
              </label>
              <div class="grid sm:grid-cols-3 gap-3">
                <!-- Stripe -->
                <div
                  (click)="paymentMethod = 'STRIPE'"
                  class="p-4 rounded-xl border transition-all cursor-pointer text-center"
                  [ngClass]="
                    paymentMethod === 'STRIPE'
                      ? 'border-[var(--bridge-crimson)] shadow-md'
                      : 'hover:opacity-90'
                  "
                  [style]="
                    paymentMethod === 'STRIPE'
                      ? 'background: var(--bridge-card)'
                      : 'border-color: var(--bridge-border); background: var(--bridge-surface)'
                  "
                >
                  <div
                    class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2"
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
                  <span class="text-xs font-bold block" style="color: var(--bridge-text)"
                    >Carte / Stripe</span
                  >
                  <span class="text-[10px]" style="color: var(--bridge-text-muted)"
                    >Paiement en ligne</span
                  >
                </div>

                <!-- Main-à-main -->
                <div
                  (click)="paymentMethod = 'MAIN_A_MAIN'"
                  class="p-4 rounded-xl border transition-all cursor-pointer text-center"
                  [ngClass]="
                    paymentMethod === 'MAIN_A_MAIN'
                      ? 'border-[var(--bridge-gold)] shadow-md'
                      : 'hover:opacity-90'
                  "
                  [style]="
                    paymentMethod === 'MAIN_A_MAIN'
                      ? 'background: var(--bridge-card)'
                      : 'border-color: var(--bridge-border); background: var(--bridge-surface)'
                  "
                >
                  <div
                    class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2"
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
                  <span class="text-xs font-bold block" style="color: var(--bridge-text)"
                    >Main à main</span
                  >
                  <span class="text-[10px]" style="color: var(--bridge-text-muted)"
                    >Sur place chez 9antra</span
                  >
                </div>

                <!-- Virement bancaire -->
                <div
                  (click)="paymentMethod = 'BANQUE'"
                  class="p-4 rounded-xl border transition-all cursor-pointer text-center"
                  [ngClass]="
                    paymentMethod === 'BANQUE' ? 'border-blue-400 shadow-md' : 'hover:opacity-90'
                  "
                  [style]="
                    paymentMethod === 'BANQUE'
                      ? 'background: var(--bridge-card)'
                      : 'border-color: var(--bridge-border); background: var(--bridge-surface)'
                  "
                >
                  <div
                    class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2"
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
                  <span class="text-xs font-bold block" style="color: var(--bridge-text)"
                    >Virement bancaire</span
                  >
                  <span class="text-[10px]" style="color: var(--bridge-text-muted)"
                    >RIB / Transfert</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- ════════════════════════════════════════════════════════════════ -->
          <!-- STEP 6: COMMENT AVEZ-VOUS CONNU 9ANTRA ?                       -->
          <!-- ════════════════════════════════════════════════════════════════ -->
          <div *ngIf="currentStepId === 'heard_from'" class="space-y-6 animate-fadeIn">
            <div>
              <span class="text-xs font-bold text-[var(--bridge-gold)] uppercase tracking-wider"
                >Enquête</span
              >
              <h2 class="font-syne font-bold text-2xl text-white mt-1">
                Comment avez-vous connu 9antra ?
              </h2>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-1">
                Aidez-nous à mieux comprendre votre parcours jusqu'à The Bridge.
              </p>
            </div>

            <div class="grid sm:grid-cols-2 gap-3">
              <div
                *ngFor="let source of sourceOptions"
                (click)="toggleSource(source.key)"
                class="p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3"
                [ngClass]="
                  selectedSources.includes(source.key)
                    ? 'border-[var(--bridge-crimson)] bg-[rgba(198,39,97,0.1)]'
                    : 'hover:opacity-80'
                "
                [style]="
                  selectedSources.includes(source.key)
                    ? 'color: var(--bridge-text)'
                    : 'border-color: var(--bridge-border); background: var(--bridge-card); color: var(--bridge-text-muted)'
                "
              >
                <div
                  class="w-5 h-5 rounded border flex items-center justify-center"
                  [ngClass]="
                    selectedSources.includes(source.key)
                      ? 'bg-[var(--bridge-crimson)] border-[var(--bridge-crimson)] text-white'
                      : 'border-white/30'
                  "
                >
                  <svg
                    *ngIf="selectedSources.includes(source.key)"
                    class="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span class="text-xs font-medium">{{ source.label }}</span>
              </div>
            </div>

            <div *ngIf="selectedSources.includes('AUTRE')" class="mt-3 animate-fadeIn">
              <label
                class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
              >
                Précisez comment vous nous avez connus
              </label>
              <input
                type="text"
                [(ngModel)]="heardFromOther"
                placeholder="Ex: Événement universitaire, recommandation d'un professeur..."
                class="w-full focus:border-[var(--bridge-crimson)] rounded-xl py-3 px-4 text-sm focus:outline-none transition-all"
                style="background: var(--bridge-surface); border: 1px solid var(--bridge-border); color: var(--bridge-text)"
              />
            </div>
          </div>

          <!-- ════════════════════════════════════════════════════════════════ -->
          <!-- STEP 7: ENGAGEMENT & RECAPITULATIF                             -->
          <!-- ════════════════════════════════════════════════════════════════ -->
          <div *ngIf="currentStepId === 'engagement'" class="space-y-6 animate-fadeIn">
            <div>
              <span class="text-xs font-bold text-[var(--bridge-gold)] uppercase tracking-wider"
                >Validation Finale</span
              >
              <h2 class="font-syne font-bold text-2xl mt-1" style="color: var(--bridge-text)">
                Récapitulatif de votre inscription
              </h2>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-1">
                Vérifiez vos choix ci-dessous et validez votre engagement pour finaliser votre accès
                à The Bridge.
              </p>
            </div>

            <!-- Summary Cards -->
            <div class="grid md:grid-cols-2 gap-4">
              <!-- Summary: Type & Stage -->
              <div
                class="p-4 rounded-2xl space-y-2"
                style="background: var(--bridge-card); border: 1px solid var(--bridge-border)"
              >
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-[var(--bridge-gold)]"
                  >Type d'Inscription</span
                >
                <p class="text-sm font-bold text-white">
                  {{ wantsInternship ? 'Stage Facultatif + Formations' : 'Formations Uniquement' }}
                </p>
                <div
                  *ngIf="wantsInternship"
                  class="pt-2 text-xs space-y-1"
                  style="color: var(--bridge-text-muted); border-top: 1px solid var(--bridge-border)"
                >
                  <p>
                    <span style="color: var(--bridge-text-sub)">Projet:</span>
                    {{ stageProjectTitle }}
                  </p>
                  <p>
                    <span style="color: var(--bridge-text-sub)">Durée:</span>
                    {{ stageDurationWeeks }} semaines
                  </p>
                  <p class="text-emerald-400">✓ Documents PDF attachés</p>
                </div>
              </div>

              <!-- Summary: Formations & Paiement -->
              <div
                class="p-4 rounded-2xl space-y-2"
                style="background: var(--bridge-card); border: 1px solid var(--bridge-border)"
              >
                <span
                  class="text-[10px] font-bold uppercase tracking-wider text-[var(--bridge-gold)]"
                  >Formations & Montant</span
                >
                <p class="text-sm font-bold" style="color: var(--bridge-text)">
                  {{ selectedFormationIds.length }} module(s) sélectionné(s)
                </p>
                <div
                  class="pt-2 text-xs space-y-1"
                  style="color: var(--bridge-text-muted); border-top: 1px solid var(--bridge-border)"
                >
                  <p>
                    <span style="color: var(--bridge-text-sub)">Mode:</span>
                    {{ paymentPlan === 'COMPTANT' ? 'Comptant (Remise 10%)' : 'Par Facilité' }}
                  </p>
                  <p>
                    <span style="color: var(--bridge-text-sub)">Méthode:</span> {{ paymentMethod }}
                  </p>
                  <p class="font-mono font-bold text-sm text-[var(--bridge-gold)]">
                    Total: {{ calculateFinalPrice() }} TND
                    <span
                      *ngIf="calculateDiscountAmount() > 0"
                      class="text-xs text-emerald-400 font-normal"
                    >
                      (dont -{{ calculateDiscountAmount() }} TND de remise)
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Agreement Checkboxes -->
            <div
              class="p-5 rounded-2xl bg-[rgba(198,39,97,0.05)] space-y-3"
              style="border: 1px solid rgba(198,39,97,0.2)"
            >
              <label
                class="flex items-start gap-3 cursor-pointer text-xs"
                style="color: var(--bridge-text)"
              >
                <input
                  type="checkbox"
                  [(ngModel)]="agreeTerms"
                  class="mt-0.5 accent-[var(--bridge-crimson)] w-4 h-4 cursor-pointer"
                />
                <span>
                  J'accepte les
                  <a href="#" class="text-[var(--bridge-gold)] underline"
                    >Conditions Générales d'Utilisation</a
                  >
                  et la politique de confidentialité de The Bridge.
                </span>
              </label>

              <label class="flex items-start gap-3 cursor-pointer text-xs text-white/90">
                <input
                  type="checkbox"
                  [(ngModel)]="agreeCharter"
                  class="mt-0.5 accent-[var(--bridge-crimson)] w-4 h-4 cursor-pointer"
                />
                <span>
                  Je m'engage à respecter le règlement intérieur, l'assiduité aux séances et
                  l'éthique de la communauté 9antra.
                </span>
              </label>
            </div>
          </div>

          <!-- Bottom Navigation Bar inside Card -->
          <div
            class="mt-8 pt-6 flex items-center justify-between gap-4"
            style="border-top: 1px solid var(--bridge-border)"
          >
            <button
              *ngIf="currentStepIndex > 0"
              type="button"
              (click)="prevStep()"
              class="px-5 py-3 rounded-xl font-syne font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              style="background: var(--bridge-card); color: var(--bridge-text); border: 1px solid var(--bridge-border)"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Précédent</span>
            </button>

            <div *ngIf="currentStepIndex === 0"></div>

            <!-- Next Step or Submit Button -->
            <button
              *ngIf="currentStepIndex < activeSteps.length - 1"
              type="button"
              (click)="nextStep()"
              class="px-8 py-3 rounded-xl bg-gradient-to-r from-[#C62761] to-[#F5A623] hover:shadow-[0_0_20px_rgba(198,39,97,0.4)] text-white font-syne font-bold text-xs flex items-center gap-2 transition-all cursor-pointer group"
            >
              <span>Continuer</span>
              <svg
                class="w-4 h-4 transition-transform group-hover:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <button
              *ngIf="currentStepIndex === activeSteps.length - 1"
              type="button"
              (click)="submitOnboarding()"
              [disabled]="submitting || !agreeTerms || !agreeCharter"
              class="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] disabled:opacity-50 text-white font-syne font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <svg *ngIf="submitting" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>{{ submitting ? 'Validation en cours...' : 'Confirmer mon inscription' }}</span>
              <svg
                *ngIf="!submitting"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Sticky Pricing Indicator Footer -->
        <div
          *ngIf="selectedFormationIds.length > 0"
          class="mt-4 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between text-xs animate-fadeIn"
          style="background: var(--bridge-surface); border: 1px solid var(--bridge-border)"
        >
          <div class="flex items-center gap-3">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span style="color: var(--bridge-text-muted)"
              >{{ selectedFormationIds.length }} formation(s) sélectionnée(s)</span
            >
          </div>

          <div class="flex items-center gap-4">
            <div class="text-right">
              <span class="text-[10px] block" style="color: var(--bridge-text-muted)"
                >Estimation totale</span
              >
              <span class="font-mono font-bold text-base text-[var(--bridge-gold)]"
                >{{ calculateFinalPrice() }} TND</span
              >
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="text-center text-xs text-[var(--bridge-text-sub)] mt-6">
        &copy; 2026 The Bridge — 9antra. Plateforme d'apprentissage et de certification.
      </footer>
    </div>
  `,
})
export class OnboardingComponent implements OnInit {
  currentUser: User | null = null;

  // Step definition
  allSteps = [
    { id: 'type', label: 'Objectif' },
    { id: 'stage_details', label: 'Stage Facultatif' },
    { id: 'formations', label: 'Formations' },
    { id: 'referral', label: 'Parrainage' },
    { id: 'payment', label: 'Paiement' },
    { id: 'heard_from', label: 'Source' },
    { id: 'engagement', label: 'Validation' },
  ];

  currentStepIndex = 0;

  // Form State
  wantsInternship = true;

  // Stage details
  stageProjectTitle = '';
  stageDurationWeeks = 12;
  demandeFile: File | null = null;
  lettreFile: File | null = null;
  isDragOverDemande = false;
  isDragOverLettre = false;

  // Formations
  availableFormations: Formation[] = [];
  selectedFormationIds: number[] = [];
  loadingFormations = true;

  // Referral
  referralEmail = '';

  // Payment
  paymentPlan: 'COMPTANT' | 'FACILITE' = 'COMPTANT';
  paymentMethod: 'STRIPE' | 'MAIN_A_MAIN' | 'BANQUE' = 'MAIN_A_MAIN';

  // Source
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

  // Engagement
  agreeTerms = true;
  agreeCharter = true;

  submitting = false;

  constructor(
    private authService: AuthService,
    private formationService: FormationService,
    private onboardingService: OnboardingService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadFormations();
  }

  get userInitials(): string {
    if (!this.currentUser) return 'ST';
    const p = this.currentUser.prenom?.[0] || '';
    const n = this.currentUser.nom?.[0] || '';
    return (p + n).toUpperCase();
  }

  get activeSteps() {
    if (this.wantsInternship) {
      return this.allSteps;
    }
    return this.allSteps.filter((s) => s.id !== 'stage_details');
  }

  get currentStepId(): string {
    return this.activeSteps[this.currentStepIndex]?.id || 'type';
  }

  get currentStepTitle(): string {
    return this.activeSteps[this.currentStepIndex]?.label || '';
  }

  getProgressPercentage(): number {
    return Math.round(((this.currentStepIndex + 1) / this.activeSteps.length) * 100);
  }

  canJumpToStep(index: number): boolean {
    return index <= this.currentStepIndex;
  }

  goToStepIndex(index: number): void {
    if (index >= 0 && index < this.activeSteps.length) {
      this.currentStepIndex = index;
    }
  }

  loadFormations(): void {
    this.loadingFormations = true;
    this.formationService.getFormations().subscribe({
      next: (list) => {
        this.availableFormations = list.filter((f) => !f.archived);
        if (this.availableFormations.length > 0 && this.selectedFormationIds.length === 0) {
          // Select first by default
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

  // ── Drag and Drop Files ──
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
    // 10% if comptant OR referral
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

  // ── Step Navigation ──
  nextStep(): void {
    if (this.currentStepId === 'stage_details') {
      if (!this.stageProjectTitle.trim()) {
        this.toastService.error('Veuillez renseigner le titre du projet de stage.', 'Stage');
        return;
      }
    }

    if (this.currentStepId === 'formations') {
      if (this.selectedFormationIds.length === 0) {
        this.toastService.error('Veuillez sélectionner au moins une formation.', 'Formations');
        return;
      }
    }

    if (this.currentStepIndex < this.activeSteps.length - 1) {
      this.currentStepIndex++;
    }
  }

  prevStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
    }
  }

  // ── Submission ──
  submitOnboarding(): void {
    if (!this.agreeTerms || !this.agreeCharter) {
      this.toastService.error('Veuillez accepter les CGU et le règlement intérieur.', 'Engagement');
      return;
    }

    this.submitting = true;

    const payload: OnboardingPayload = {
      wantsInternship: this.wantsInternship,
      stageProjectTitle: this.wantsInternship ? this.stageProjectTitle : undefined,
      stageDurationWeeks: this.wantsInternship ? this.stageDurationWeeks : undefined,
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
        next: (res) => {
          this.submitting = false;
          this.toastService.success(
            'Votre inscription a été enregistrée avec succès !',
            'Félicitations',
          );

          if (this.currentUser) {
            this.currentUser.onboardingCompleted = true;
            this.authService.updateCurrentUser(this.currentUser);
          }

          // Pour un stage facultatif, l'approbation administrative est requise avant le paiement
          if (this.wantsInternship) {
            this.toastService.success(
              "Votre demande de stage facultatif a été enregistrée avec succès ! Votre dossier sera examiné et approuvé par l'administration avant le règlement.",
              'Dossier Soumis',
            );
            this.router.navigate(['/dashboard/stagiaire/stage']);
          } else {
            // Formations certifiantes seules (sans convention de stage)
            if (this.paymentMethod === 'STRIPE') {
              if (res.stripePaymentUrl) {
                this.toastService.info(
                  'Redirection vers le portail sécurisé Stripe...',
                  'Paiement',
                );
                setTimeout(() => {
                  window.location.href = res.stripePaymentUrl!;
                }, 400);
              } else {
                this.toastService.success(
                  'Inscription enregistrée. Vous pouvez finaliser votre paiement sur votre espace.',
                  'Paiement',
                );
                this.router.navigate(['/dashboard/stagiaire/stage']);
              }
            } else {
              this.router.navigate(['/dashboard/stagiaire/stage']);
            }
          }
        },
        error: (err) => {
          this.submitting = false;
          this.toastService.error(
            err?.error?.message || "Erreur lors de la soumission de l'onboarding.",
            'Erreur',
          );
        },
      });
  }
}
