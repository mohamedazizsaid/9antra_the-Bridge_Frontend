import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AnimatedBgComponent } from '../../../shared/components/animated-bg/animated-bg.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
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
            >CONFIDENTIALITÉ</span
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
            Le nouveau mot de passe sera protégé et appliquera le même thème que le reste de votre
            expérience The Bridge.
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
              Réinitialisation
            </p>
            <h2 class="font-syne font-bold text-2xl md:text-3xl mt-3">
              Définir un nouveau mot de passe
            </h2>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-2">
              Saisissez le code reçu par email.
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

          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-5" *ngIf="!message">
            <div>
              <label
                for="reset-email"
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
                  id="reset-email"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label
                for="reset-code"
                class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                >Code OTP</label
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
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <circle cx="12" cy="11" r="2" />
                  </svg>
                </span>
                <input
                  id="reset-code"
                  type="text"
                  formControlName="code"
                  maxlength="6"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  placeholder="123456"
                  class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none transition-all tracking-[0.3em] text-center font-mono"
                />
              </div>
            </div>

            <div>
              <label
                for="reset-new-password"
                class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                >Nouveau mot de passe</label
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
                  id="reset-new-password"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="newPassword"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 pl-12 pr-12 text-sm text-white focus:outline-none transition-all"
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
            </div>

            <div>
              <label
                for="reset-confirm-password"
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
                  id="reset-confirm-password"
                  [type]="showConfirmPassword ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 pl-12 pr-12 text-sm text-white focus:outline-none transition-all"
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
              <p
                *ngIf="submitted && resetForm.errors?.['mismatch']"
                class="text-xs text-rose-400 mt-1 flex items-center gap-1.5"
                role="alert"
              >
                <svg
                  class="w-3.5 h-3.5 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
                  />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Les mots de passe ne correspondent pas</span>
              </p>
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
              <span>{{ loading ? 'Validation...' : 'Réinitialiser le mot de passe' }}</span>
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
                routerLink="/auth/forgot-password"
                class="text-[var(--bridge-gold)] hover:underline flex items-center gap-1"
              >
                <span>Je n'ai pas reçu le code</span>
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
export class ResetPasswordComponent implements OnInit, OnDestroy {
  resetForm;
  loading = false;
  submitted = false;
  message = '';
  showPassword = false;
  showConfirmPassword = false;

  typedLine1 = '';
  typedLine2 = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private title: Title,
    private meta: Meta,
  ) {
    this.resetForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatch },
    );
  }

  ngOnInit(): void {
    this.title.setTitle('Nouveau mot de passe | The Bridge — 9antra');
    this.meta.updateTag({
      name: 'description',
      content: 'Définissez votre nouveau mot de passe pour sécuriser votre compte The Bridge.',
    });
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.resetForm.patchValue({ email });
    }
    this.startTypewriter();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  startTypewriter() {
    const text1 = 'Entrez le code et choisissez un';
    const text2 = 'nouveau mot de passe';

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

  passwordsMatch(group: any) {
    return group.get('newPassword')?.value === group.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit(): void {
    this.submitted = true;
    this.message = '';
    if (this.resetForm.invalid) return;

    this.loading = true;
    this.authService
      .resetPassword({
        email: this.resetForm.value.email!,
        code: this.resetForm.value.code!,
        newPassword: this.resetForm.value.newPassword!,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.message = 'Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.';
          setTimeout(() => this.router.navigateByUrl('/auth/login'), 1800);
        },
        error: (err) => {
          this.loading = false;
          this.message = err.error?.message || 'Impossible de réinitialiser le mot de passe.';
        },
      });
  }
}
