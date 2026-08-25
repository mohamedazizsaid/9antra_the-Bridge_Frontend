import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { AnimatedBgComponent } from '../../../shared/components/animated-bg/animated-bg.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AnimatedBgComponent],
  template: `
    <app-animated-bg></app-animated-bg>
    <div class="min-h-screen flex flex-col md:flex-row-reverse relative z-10 text-white font-inter">
      <!-- Brand Panel (Right 42%) -->
      <div
        class="animate-slide-right w-full md:w-[42%] bg-gradient-to-br from-[#10102A]/80 to-[#171738]/90 border-l border-[var(--bridge-border)] p-8 md:p-12 flex flex-col justify-between backdrop-blur-md"
      >
        <!-- Logo -->
        <div class="flex items-center gap-3 cursor-pointer" routerLink="/home">
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
            <h1 class="font-syne font-bold text-2xl tracking-wide">
              The <span class="text-gradient">Bridge</span>
            </h1>
            <p class="text-[10px] tracking-[4px] uppercase text-[var(--bridge-text-muted)]">
              9antra
            </p>
          </div>
        </div>

        <!-- Content -->
        <div class="my-auto py-12">
          <span class="text-xs font-bold text-[var(--bridge-gold)] tracking-widest uppercase"
            >INSCRIPTION EN 3 ÉTAPES</span
          >
          <h2
            class="font-syne font-extrabold text-3xl md:text-4xl lg:text-5xl mt-4 leading-tight min-h-[80px] md:min-h-[120px]"
          >
            {{ typedLine1 }}<br />
            <span class="text-gradient font-bold">{{ typedLine2 }}</span>
            <span class="animate-pulse text-[var(--bridge-gold)]">|</span>
          </h2>
          <p
            class="mt-6 text-[var(--bridge-text-muted)] text-sm md:text-base max-w-md leading-relaxed animate-fade"
          >
            Créez votre compte de stagiaire, téléversez votre avatar, et validez votre email par
            code OTP pour rejoindre notre plateforme.
          </p>
        </div>

        <!-- Footer -->
        <div class="text-xs text-[var(--bridge-text-sub)]">
          &copy; 2026 9antra. Tous droits réservés.
        </div>
      </div>

      <!-- Register Form Card (Left 58%) -->
      <div
        class="animate-slide-left w-full md:w-[58%] flex items-center justify-center p-6 md:p-12"
      >
        <div class="w-full max-w-lg glass-card p-8 md:p-10 relative overflow-hidden transition-all">
          <!-- Success Animation Overlay -->
          <div
            *ngIf="showSuccessAnimation"
            class="py-6 md:py-8 flex flex-col items-center justify-center text-center animate-fadeIn min-h-[320px]"
          >
            <div class="success-checkmark mb-6">
              <div class="check-icon">
                <span class="icon-line line-tip"></span>
                <span class="icon-line line-long"></span>
                <div class="icon-circle"></div>
                <div class="icon-fix"></div>
              </div>
            </div>
            <h3 class="font-syne font-bold text-2xl md:text-3xl mb-2 text-gradient">
              Inscription Réussie !
            </h3>
            <p class="text-sm text-[var(--bridge-text-muted)] max-w-xs mb-6 leading-relaxed">
              Votre adresse email a été validée avec succès. Connexion automatique en cours...
            </p>
            <div
              class="w-8 h-8 border-2 border-[var(--bridge-crimson)] border-t-transparent rounded-full animate-spin"
            ></div>
          </div>

          <!-- Step indicator -->
          <div *ngIf="!showSuccessAnimation" class="form-item flex items-center gap-4 mb-8">
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs shadow-md transition-all"
              [ngClass]="
                currentStep === 1
                  ? 'bg-[var(--bridge-crimson)] text-white'
                  : 'bg-emerald-500 text-white'
              "
            >
              <svg
                *ngIf="currentStep > 1"
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
              <span *ngIf="currentStep <= 1">1</span>
            </div>
            <div class="h-0.5 flex-1 bg-white/10 relative">
              <div
                class="absolute left-0 top-0 h-full bg-gradient-to-r from-[var(--bridge-crimson)] to-[var(--bridge-gold)] transition-all duration-300"
                [style.width]="currentStep > 1 ? '100%' : '0%'"
              ></div>
            </div>
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs transition-all"
              [ngClass]="
                currentStep === 2
                  ? 'bg-[var(--bridge-crimson)] text-white shadow-md'
                  : currentStep > 2
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-white/10 text-white/40'
              "
            >
              <svg
                *ngIf="currentStep > 2"
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
              <span *ngIf="currentStep <= 2">2</span>
            </div>
            <div class="h-0.5 flex-1 bg-white/10 relative">
              <div
                class="absolute left-0 top-0 h-full bg-gradient-to-r from-[var(--bridge-crimson)] to-[var(--bridge-gold)] transition-all duration-300"
                [style.width]="currentStep > 2 ? '100%' : '0%'"
              ></div>
            </div>
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs transition-all"
              [ngClass]="
                currentStep === 3
                  ? 'bg-[var(--bridge-crimson)] text-white shadow-md'
                  : 'bg-white/10 text-white/40'
              "
            >
              3
            </div>
          </div>

          <!-- Card header -->
          <div *ngIf="!showSuccessAnimation" class="form-item mb-6">
            <h3 class="font-syne font-bold text-2xl md:text-3xl">
              {{
                currentStep === 1
                  ? 'Informations personnelles'
                  : currentStep === 2
                    ? 'Sécurité & Photo'
                    : 'Vérification email'
              }}
            </h3>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-2">
              {{
                currentStep === 3
                  ? 'Nous avons envoyé un code de vérification à votre email.'
                  : 'Déjà inscrit ?'
              }}
              <a
                *ngIf="currentStep !== 3"
                routerLink="/auth/login"
                class="text-[var(--bridge-gold)] hover:underline font-semibold ml-1"
                >Connectez-vous</a
              >
            </p>
          </div>

          <!-- Alert -->
          <div
            *ngIf="errorMessage && !showSuccessAnimation"
            class="form-item mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5"
            role="alert"
          >
            <svg
              class="w-4 h-4 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Form -->
          <form
            [formGroup]="registerForm"
            (ngSubmit)="onSubmit()"
            class="space-y-6"
            *ngIf="!showSuccessAnimation"
          >
            <!-- STEP 1: IDENTITY -->
            <div *ngIf="currentStep === 1" class="space-y-4 animate-fadeIn">
              <div class="form-item grid grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                    >Prénom</label
                  >
                  <div class="relative">
                    <span
                      class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 flex items-center"
                      aria-hidden="true"
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
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      formControlName="prenom"
                      placeholder="Ahmed"
                      class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3 pl-10 pr-3 text-sm text-white focus:outline-none transition-all"
                    />
                  </div>
                  <div *ngIf="submitted && f['prenom'].errors" class="text-xs text-rose-400 mt-1">
                    Le prénom est requis
                  </div>
                </div>
                <div>
                  <label
                    class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                    >Nom</label
                  >
                  <div class="relative">
                    <span
                      class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 flex items-center"
                      aria-hidden="true"
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
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      formControlName="nom"
                      placeholder="Mansouri"
                      class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3 pl-10 pr-3 text-sm text-white focus:outline-none transition-all"
                    />
                  </div>
                  <div *ngIf="submitted && f['nom'].errors" class="text-xs text-rose-400 mt-1">
                    Le nom est requis
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="col-span-1">
                  <label
                    class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                    >Âge (Pro)</label
                  >
                  <div class="relative">
                    <span
                      class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 flex items-center"
                      aria-hidden="true"
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
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </span>
                    <input
                      type="number"
                      formControlName="age"
                      placeholder="22"
                      min="15"
                      max="100"
                      class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3 pl-9 pr-2 text-sm text-white focus:outline-none transition-all"
                    />
                  </div>
                  <div *ngIf="submitted && f['age'].errors" class="text-xs text-rose-400 mt-1">
                    Requis (15+)
                  </div>
                </div>
                <div class="col-span-2">
                  <label
                    class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                    >Téléphone</label
                  >
                  <div class="relative">
                    <span
                      class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 flex items-center"
                      aria-hidden="true"
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
                          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      formControlName="telephone"
                      placeholder="+216 55 555 555"
                      class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                (click)="nextStep()"
                class="form-item w-full py-4 bg-gradient-to-r from-[#C62761] to-[#F5A623] hover:shadow-[0_0_20px_rgba(198,39,97,0.4)] text-white font-syne font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer group"
              >
                <span>Continuer</span>
                <svg
                  class="w-4 h-4 transition-transform group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            <!-- STEP 2: SECURITY & AVATAR -->
            <div *ngIf="currentStep === 2" class="space-y-4 animate-fadeIn">
              <!-- Custom Avatar Upload -->
              <div
                class="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div class="relative group cursor-pointer" (click)="fileInput.click()">
                  <div
                    *ngIf="!avatarPreview"
                    class="w-16 h-16 rounded-full bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center text-xl font-bold border border-white/20"
                  >
                    {{ f['prenom'].value ? f['prenom'].value[0].toUpperCase() : 'U'
                    }}{{ f['nom'].value ? f['nom'].value[0].toUpperCase() : 'S' }}
                  </div>
                  <img
                    *ngIf="avatarPreview"
                    [src]="avatarPreview"
                    class="w-16 h-16 rounded-full object-cover border border-white/20"
                    alt="Aperçu de la photo de profil"
                    width="64"
                    height="64"
                  />
                  <div
                    class="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-white transition-opacity gap-1"
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
                        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                      />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>Éditer</span>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-xs font-semibold text-white">Photo de profil (Optionnelle)</p>
                  <p class="text-[10px] text-[var(--bridge-text-muted)] mt-1">
                    Ajoutez un avatar pour personnaliser votre profil.
                  </p>
                  <input
                    type="file"
                    #fileInput
                    (change)="onFileSelected($event)"
                    accept="image/*"
                    class="hidden"
                  />
                  <button
                    type="button"
                    (click)="fileInput.click()"
                    class="mt-2 text-xs text-[var(--bridge-gold)] hover:underline focus:outline-none flex items-center gap-1.5 cursor-pointer"
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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Choisir un fichier</span>
                  </button>
                </div>
              </div>

              <div class="form-item">
                <label
                  class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                  >Adresse Email</label
                >
                <div class="relative">
                  <span
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 flex items-center"
                    aria-hidden="true"
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
                  </span>
                  <input
                    type="email"
                    formControlName="email"
                    placeholder="exemple@thebridge.tn"
                    class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none transition-all"
                  />
                </div>
                <div *ngIf="submitted && f['email'].errors" class="text-xs text-rose-400 mt-1">
                  <span *ngIf="f['email'].errors['required']">L'email est requis</span>
                  <span *ngIf="f['email'].errors['email']">Veuillez entrer un email valide</span>
                </div>
              </div>

              <div>
                <label
                  class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                  >Mot de passe</label
                >
                <div class="relative">
                  <span
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 flex items-center"
                    aria-hidden="true"
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
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="••••••••"
                    (input)="checkPasswordStrength($event)"
                    class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3 pl-12 pr-12 text-sm text-white focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    (click)="showPassword = !showPassword"
                    [attr.aria-label]="
                      showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                    "
                    class="absolute right-4 top-1/2 -translate-y-1/2 focus:outline-none cursor-pointer"
                  >
                    <svg
                      *ngIf="showPassword"
                      class="w-5 h-5 text-white/50 hover:text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <svg
                      *ngIf="!showPassword"
                      class="w-5 h-5 text-white/50 hover:text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.024 10.024 0 014.168-5.63m2.712-1.178A9.979 9.979 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.613m-9.354-9.614a3 3 0 104.243 4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  </button>
                </div>
                <div *ngIf="submitted && f['password'].errors" class="text-xs text-rose-400 mt-1">
                  Le mot de passe est requis
                </div>

                <!-- Password strength bar -->
                <div class="mt-2 flex gap-1 h-1">
                  <div
                    class="flex-1 rounded transition-all duration-300"
                    [ngClass]="
                      strengthScore >= 1
                        ? strengthScore === 1
                          ? 'bg-rose-500'
                          : strengthScore === 2
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        : 'bg-white/10'
                    "
                  ></div>
                  <div
                    class="flex-1 rounded transition-all duration-300"
                    [ngClass]="
                      strengthScore >= 2
                        ? strengthScore === 2
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                        : 'bg-white/10'
                    "
                  ></div>
                  <div
                    class="flex-1 rounded transition-all duration-300"
                    [ngClass]="strengthScore >= 3 ? 'bg-emerald-500' : 'bg-white/10'"
                  ></div>
                </div>
                <p class="text-[10px] text-[var(--bridge-text-muted)] mt-1">
                  Force du mot de passe:
                  <span
                    class="font-semibold"
                    [ngClass]="
                      strengthScore === 1
                        ? 'text-rose-400'
                        : strengthScore === 2
                          ? 'text-amber-400'
                          : strengthScore === 3
                            ? 'text-emerald-400'
                            : 'text-white/40'
                    "
                  >
                    {{
                      strengthScore === 1
                        ? 'Faible'
                        : strengthScore === 2
                          ? 'Moyen'
                          : strengthScore === 3
                            ? 'Fort'
                            : 'Non saisi'
                    }}
                  </span>
                </p>
              </div>

              <div>
                <label
                  class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                  >Confirmer le mot de passe</label
                >
                <div class="relative">
                  <span
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 flex items-center"
                    aria-hidden="true"
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
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    [type]="showConfirmPassword ? 'text' : 'password'"
                    formControlName="confirmPassword"
                    placeholder="••••••••"
                    class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3 pl-12 pr-12 text-sm text-white focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    (click)="showConfirmPassword = !showConfirmPassword"
                    [attr.aria-label]="
                      showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                    "
                    class="absolute right-4 top-1/2 -translate-y-1/2 focus:outline-none cursor-pointer"
                  >
                    <svg
                      *ngIf="showConfirmPassword"
                      class="w-5 h-5 text-white/50 hover:text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <svg
                      *ngIf="!showConfirmPassword"
                      class="w-5 h-5 text-white/50 hover:text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.024 10.024 0 014.168-5.63m2.712-1.178A9.979 9.979 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.613m-9.354-9.614a3 3 0 104.243 4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  </button>
                </div>
                <div
                  *ngIf="submitted && registerForm.hasError('mismatch')"
                  class="text-xs text-rose-400 mt-1"
                >
                  Les mots de passe ne correspondent pas
                </div>
              </div>

              <div class="flex gap-4 pt-2">
                <button
                  type="button"
                  (click)="prevStep()"
                  class="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-syne font-bold rounded-xl transition-all cursor-pointer text-center text-sm border border-white/10 flex items-center justify-center gap-2"
                >
                  <svg
                    class="w-4 h-4"
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
                  <span>Retour</span>
                </button>
                <button
                  type="submit"
                  [disabled]="loading"
                  class="flex-[2] py-4 bg-gradient-to-r from-[#C62761] to-[#F5A623] hover:shadow-[0_0_20px_rgba(198,39,97,0.4)] disabled:opacity-50 text-white font-syne font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <svg
                    *ngIf="loading"
                    class="animate-spin w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
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
                  <span>{{ loading ? 'Enregistrement...' : "S'inscrire" }}</span>
                  <svg
                    *ngIf="!loading"
                    class="w-4 h-4 transition-transform group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- STEP 3: OTP EMAIL VERIFICATION -->
            <div *ngIf="currentStep === 3" class="animate-fadeIn">
              <div
                class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 text-center space-y-6"
              >
                <div>
                  <div
                    class="w-12 h-12 rounded-full bg-gradient-to-tr from-[#C62761]/20 to-[#F5A623]/20 border border-[var(--bridge-gold)]/30 mx-auto mb-3 flex items-center justify-center text-[var(--bridge-gold)]"
                  >
                    <svg
                      class="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                  </div>
                  <p
                    class="text-[11px] uppercase tracking-[0.35em] text-[var(--bridge-gold)] font-bold"
                  >
                    Vérification email
                  </p>
                  <p class="mt-3 text-sm text-[var(--bridge-text-muted)] leading-relaxed">
                    Entrez le code de vérification à 6 chiffres envoyé à
                    <strong class="text-white break-all">{{ f['email'].value }}</strong>
                  </p>
                </div>

                <!-- OTP Inputs -->
                <div class="flex flex-wrap gap-2 justify-center">
                  <input
                    *ngFor="let i of [0, 1, 2, 3, 4, 5]"
                    #otpInput
                    type="text"
                    maxlength="1"
                    inputmode="numeric"
                    pattern="[0-9]"
                    class="w-11 h-14 md:w-12 md:h-16 text-center bg-white/[0.04] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl text-xl font-bold text-white focus:outline-none transition-all"
                    (keyup)="onOtpKeyUp($event, i)"
                    (keydown)="onOtpKeyDown($event, i)"
                  />
                </div>

                <!-- Timer and Resend -->
                <div>
                  <p class="text-xs text-[var(--bridge-text-muted)]" *ngIf="otpTimer > 0">
                    Renvoyer le code dans
                    <span class="text-[var(--bridge-gold)] font-bold">{{ otpTimer }}s</span>
                  </p>
                  <button
                    *ngIf="otpTimer === 0"
                    type="button"
                    (click)="resendCode()"
                    [disabled]="loading"
                    class="text-xs text-[var(--bridge-gold)] hover:underline font-bold focus:outline-none cursor-pointer"
                  >
                    Renvoyer le code
                  </button>
                </div>

                <div class="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    type="button"
                    (click)="prevStep()"
                    class="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-syne font-bold rounded-xl transition-all cursor-pointer text-center text-sm border border-white/10 flex items-center justify-center gap-2"
                  >
                    <svg
                      class="w-4 h-4"
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
                    <span>Retour</span>
                  </button>
                  <button
                    type="button"
                    (click)="verifyOtp()"
                    [disabled]="loading"
                    class="flex-[2] py-4 bg-gradient-to-r from-[#C62761] to-[#F5A623] hover:shadow-[0_0_20px_rgba(198,39,97,0.4)] disabled:opacity-50 text-white font-syne font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer group"
                  >
                    <svg
                      *ngIf="loading"
                      class="animate-spin w-4 h-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
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
                    <span>Vérifier & Connecter</span>
                    <svg
                      *ngIf="!loading"
                      class="w-4 h-4 transition-transform group-hover:translate-x-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out forwards;
      }
      @keyframes fade {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      .animate-fade {
        animation: fade 1s ease-in-out 1s both;
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-40px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .animate-slide-left {
        animation: slideInLeft 0.75s cubic-bezier(0.35, 0, 0.25, 1) both;
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(40px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .animate-slide-right {
        animation: slideInRight 0.75s cubic-bezier(0.35, 0, 0.25, 1) both;
      }

      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .form-item {
        animation: slideInUp 0.5s cubic-bezier(0.35, 0, 0.25, 1) both;
      }
      .form-item:nth-child(1) {
        animation-delay: 150ms;
      }
      .form-item:nth-child(2) {
        animation-delay: 250ms;
      }
      .form-item:nth-child(3) {
        animation-delay: 350ms;
      }
      .form-item:nth-child(4) {
        animation-delay: 450ms;
      }
      .form-item:nth-child(5) {
        animation-delay: 550ms;
      }

      /* Success checkmark animation */
      .success-checkmark {
        width: 80px;
        height: 80px;
        margin: 0 auto;
        .check-icon {
          width: 80px;
          height: 80px;
          position: relative;
          border-radius: 50%;
          box-sizing: content-box;
          border: 4px solid rgba(16, 185, 129, 0.2);

          &::after {
            content: '';
            position: absolute;
            width: 80px;
            height: 120px;
            background: transparent;
            top: -20px;
            left: 40px;
            transform-origin: left;
            transform: rotate(-45deg);
          }

          .icon-line {
            height: 5px;
            background-color: #10b981;
            display: block;
            border-radius: 2px;
            position: absolute;
            z-index: 10;

            &.line-tip {
              width: 20px;
              left: 17px;
              top: 40px;
              transform: rotate(45deg);
              animation: icon-line-tip 0.75s;
            }

            &.line-long {
              width: 40px;
              right: 10px;
              top: 35px;
              transform: rotate(-45deg);
              animation: icon-line-long 0.75s;
            }
          }

          .icon-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 4px solid #10b981;
            box-sizing: content-box;
            position: absolute;
            left: -4px;
            top: -4px;
            z-index: 9;
            animation: icon-circle 0.5s;
          }
        }
      }

      @keyframes icon-line-tip {
        0% {
          width: 0;
          left: 1px;
          top: 19px;
        }
        54% {
          width: 0;
          left: 1px;
          top: 19px;
        }
        70% {
          width: 10px;
          left: 13px;
          top: 32px;
        }
        84% {
          width: 17px;
          left: 17px;
          top: 37px;
        }
        100% {
          width: 20px;
          left: 17px;
          top: 40px;
        }
      }

      @keyframes icon-line-long {
        0% {
          width: 0;
          right: 46px;
          top: 54px;
        }
        65% {
          width: 0;
          right: 46px;
          top: 54px;
        }
        84% {
          width: 25px;
          right: 25px;
          top: 43px;
        }
        100% {
          width: 40px;
          right: 10px;
          top: 35px;
        }
      }

      @keyframes icon-circle {
        0% {
          transform: scale(0.2);
          opacity: 0;
        }
        80% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `,
  ],
})
export class RegisterComponent implements OnInit, OnDestroy {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  registerForm!: FormGroup;
  currentStep = 1;
  submitted = false;
  loading = false;
  errorMessage = '';
  strengthScore = 0;

  avatarFile: File | undefined;
  avatarPreview: string | undefined;

  showPassword = false;
  showConfirmPassword = false;

  otpCode: string[] = ['', '', '', '', '', ''];
  otpTimer = 60;
  otpTimerSub: Subscription | undefined;
  showSuccessAnimation = false;

  typedLine1 = '';
  typedLine2 = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Inscription | The Bridge — 9antra');
    this.meta.updateTag({
      name: 'description',
      content:
        'Créez votre compte sur The Bridge (9antra) et démarrez votre parcours de formation certifié blockchain.',
    });
    this.registerForm = this.formBuilder.group(
      {
        prenom: ['', Validators.required],
        nom: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        telephone: [''],
        age: [null, [Validators.required, Validators.min(15), Validators.max(100)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );

    this.startTypewriter();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    if (this.otpTimerSub) {
      this.otpTimerSub.unsubscribe();
    }
  }

  get f() {
    return this.registerForm.controls;
  }

  startTypewriter() {
    const text1 = 'Rejoignez la';
    const text2 = 'communauté 9antra';

    let i = 0;
    const sub1 = interval(45)
      .pipe(take(text1.length))
      .subscribe({
        next: () => {
          this.typedLine1 = text1.substring(0, i + 1);
          i++;
        },
        complete: () => {
          let j = 0;
          const sub2 = interval(55)
            .pipe(take(text2.length))
            .subscribe({
              next: () => {
                this.typedLine2 = text2.substring(0, j + 1);
                j++;
              },
            });
          this.subscriptions.push(sub2);
        },
      });
    this.subscriptions.push(sub1);
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  nextStep(): void {
    this.submitted = true;
    if (this.currentStep === 1) {
      if (this.f['prenom'].invalid || this.f['nom'].invalid || this.f['age'].invalid) {
        return;
      }
      this.submitted = false;
      this.currentStep = 2;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.submitted = false;
    }
  }

  checkPasswordStrength(event: any): void {
    const val = event.target.value;
    if (!val) {
      this.strengthScore = 0;
      return;
    }
    if (val.length < 6) {
      this.strengthScore = 1;
      return;
    }
    const hasLetters = /[a-zA-Z]/.test(val);
    const hasNumbers = /[0-9]/.test(val);
    const hasSpecial = /[^a-zA-Z0-9]/.test(val);

    if (hasLetters && hasNumbers && hasSpecial) {
      this.strengthScore = 3;
    } else if (hasLetters && hasNumbers) {
      this.strengthScore = 2;
    } else {
      this.strengthScore = 1;
    }
  }

  startOtpTimer(): void {
    this.otpTimer = 60;
    if (this.otpTimerSub) {
      this.otpTimerSub.unsubscribe();
    }
    this.otpTimerSub = interval(1000).subscribe(() => {
      if (this.otpTimer > 0) {
        this.otpTimer--;
      } else {
        this.otpTimerSub?.unsubscribe();
      }
    });
  }

  onOtpKeyUp(event: any, index: number): void {
    const val = event.target.value;
    this.otpCode[index] = val;

    if (val && index < 5) {
      const inputs = this.otpInputs.toArray();
      inputs[index + 1].nativeElement.focus();
    }
  }

  onOtpKeyDown(event: any, index: number): void {
    if (event.key === 'Backspace' && !this.otpCode[index] && index > 0) {
      const inputs = this.otpInputs.toArray();
      inputs[index - 1].nativeElement.focus();
    }
  }

  resendCode(): void {
    this.loading = true;
    this.authService.resendCode(this.f['email'].value).subscribe({
      next: () => {
        this.loading = false;
        this.startOtpTimer();
        this.errorMessage = '';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors du renvoi du code';
      },
    });
  }

  verifyOtp(): void {
    const fullCode = this.otpCode.join('');
    if (fullCode.length < 6) {
      this.errorMessage = 'Veuillez saisir le code à 6 chiffres';
      return;
    }

    this.loading = true;
    this.authService.verifyEmail(this.f['email'].value, fullCode).subscribe({
      next: () => {
        this.loading = false;
        this.errorMessage = '';
        this.showSuccessAnimation = true;

        // Auto-login after 2.5s success animation
        setTimeout(() => {
          this.authService
            .login({
              email: this.f['email'].value,
              password: this.f['password'].value,
            })
            .subscribe({
              next: (res) => {
                const redirectUrl = this.authService.getRedirectUrl(res.role);
                this.router.navigateByUrl(redirectUrl);
              },
              error: () => {
                // Fallback to login screen if auto login fails
                this.router.navigateByUrl('/auth/login');
              },
            });
        }, 2500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Code de vérification incorrect';
      },
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService
      .register(
        {
          prenom: this.registerForm.value.prenom,
          nom: this.registerForm.value.nom,
          email: this.registerForm.value.email,
          telephone: this.registerForm.value.telephone,
          age: this.registerForm.value.age,
          password: this.registerForm.value.password,
        },
        this.avatarFile,
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.currentStep = 3;
          this.startOtpTimer();
        },
        error: (err: any) => {
          this.loading = false;
          this.errorMessage = err.error?.message || err.message || 'Une erreur est survenue';
        },
      });
  }
}
