import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AnimatedBgComponent } from '../../../shared/components/animated-bg/animated-bg.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AnimatedBgComponent],
  template: `
    <app-animated-bg></app-animated-bg>
    <div class="min-h-screen flex flex-col md:flex-row relative z-10 text-white font-inter">
      <div
        class="w-full md:w-[42%] bg-gradient-to-br from-[#10102A]/80 to-[#171738]/90 border-r border-[var(--bridge-border)] p-8 md:p-12 flex flex-col justify-between backdrop-blur-md"
      >
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

        <div class="my-auto py-12">
          <span class="text-xs font-bold text-[var(--bridge-gold)] tracking-widest uppercase"
            >SÉCURITÉ DU COMPTE</span
          >
          <h2
            class="font-syne font-extrabold text-3xl md:text-4xl lg:text-5xl mt-4 leading-tight max-w-md min-h-[80px] md:min-h-[120px]"
          >
            {{ typedLine1 }}<br />
            <span class="text-gradient font-bold">{{ typedLine2 }}</span>
            <span class="animate-pulse text-[var(--bridge-gold)]">|</span>
          </h2>
          <p
            class="mt-6 text-[var(--bridge-text-muted)] text-sm md:text-base max-w-md leading-relaxed animate-fade"
          >
            Nous vous envoyons un code de sécurité pour garder votre compte protégé avec la même
            expérience visuelle de la plateforme.
          </p>
        </div>

        <div class="text-xs text-[var(--bridge-text-sub)]">
          &copy; 2026 9antra. Tous droits réservés.
        </div>
      </div>

      <div class="w-full md:w-[58%] flex items-center justify-center p-6 md:p-12">
        <div class="w-full max-w-md glass-card p-8 md:p-10">
          <div class="mb-8">
            <p class="text-[11px] uppercase tracking-[0.35em] text-[var(--bridge-gold)] font-bold">
              Mot de passe oublié
            </p>
            <h2 class="font-syne font-bold text-2xl md:text-3xl mt-3">
              Recevoir un code de réinitialisation
            </h2>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-2">
              Saisissez votre adresse email et nous vous enverrons un code OTP.
            </p>
          </div>

          <div
            *ngIf="message"
            class="mb-6 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5"
            role="status"
          >
            <svg
              class="w-4 h-4 flex-shrink-0 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{{ message }}</span>
          </div>

          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-5" *ngIf="!message">
            <div>
              <label
                for="forgot-email"
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
                  id="forgot-email"
                  type="email"
                  formControlName="email"
                  placeholder="exemple@thebridge.tn"
                  autocomplete="email"
                  class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none transition-all"
                />
              </div>
              <div
                *ngIf="submitted && forgotForm.get('email')?.errors"
                class="text-xs text-rose-400 mt-1"
                role="alert"
              >
                Veuillez entrer un email valide
              </div>
            </div>

            <button
              type="submit"
              [disabled]="loading"
              class="w-full py-4 bg-gradient-to-r from-[#C62761] to-[#F5A623] hover:shadow-[0_0_20px_rgba(198,39,97,0.4)] disabled:opacity-50 text-white font-syne font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer group"
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
              <span>{{ loading ? 'Envoi en cours...' : 'Envoyer le code' }}</span>
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

            <div class="flex items-center justify-between text-xs text-[var(--bridge-text-muted)]">
              <a
                routerLink="/auth/login"
                class="hover:text-white hover:underline flex items-center gap-1.5"
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
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Retour à la connexion</span>
              </a>
              <a
                routerLink="/auth/reset-password"
                [queryParams]="{ email: forgotForm.value.email }"
                class="text-[var(--bridge-gold)] hover:underline flex items-center gap-1"
              >
                <span>J'ai déjà le code</span>
                <svg
                  class="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </form>

          <div *ngIf="message" class="flex flex-col gap-4">
            <button
              routerLink="/auth/reset-password"
              [queryParams]="{ email: forgotForm.value.email }"
              class="w-full py-4 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-syne font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>Continuer vers la réinitialisation</span>
              <svg
                class="w-4 h-4 transition-transform group-hover:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <a
              routerLink="/auth/login"
              class="text-center text-xs text-[var(--bridge-text-muted)] hover:text-white hover:underline flex items-center justify-center gap-1.5"
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
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Revenir à la connexion</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
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
    `,
  ],
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  forgotForm;
  loading = false;
  submitted = false;
  message = '';

  typedLine1 = '';
  typedLine2 = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private title: Title,
    private meta: Meta,
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.title.setTitle('Mot de passe oublié | The Bridge — 9antra');
    this.meta.updateTag({
      name: 'description',
      content: "Réinitialisez votre mot de passe pour retrouver l'accès à votre compte The Bridge.",
    });
    this.startTypewriter();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  startTypewriter() {
    const text1 = 'Réinitialisez votre';
    const text2 = 'mot de passe';

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

  onSubmit(): void {
    this.submitted = true;
    this.message = '';
    if (this.forgotForm.invalid) return;

    this.loading = true;
    this.authService.forgotPassword(this.forgotForm.value.email!).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Un code de réinitialisation a été envoyé à votre adresse email.';
      },
      error: (err) => {
        this.loading = false;
        this.message = err.error?.message || "Impossible d'envoyer le code pour le moment.";
      },
    });
  }
}
