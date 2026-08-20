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
            class="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs"
          >
            {{ message }}
          </div>

          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-5" *ngIf="!message">
            <div>
              <label
                for="reset-email"
                class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                >Adresse Email</label
              >
              <input
                id="reset-email"
                type="email"
                formControlName="email"
                autocomplete="email"
                class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <label
                for="reset-code"
                class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                >Code OTP</label
              >
              <input
                id="reset-code"
                type="text"
                formControlName="code"
                maxlength="6"
                inputmode="numeric"
                autocomplete="one-time-code"
                class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none transition-all tracking-[0.3em] text-center"
              />
            </div>

            <div>
              <label
                for="reset-new-password"
                class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                >Nouveau mot de passe</label
              >
              <input
                id="reset-new-password"
                type="password"
                formControlName="newPassword"
                autocomplete="new-password"
                class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <label
                for="reset-confirm-password"
                class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2"
                >Confirmer le mot de passe</label
              >
              <input
                id="reset-confirm-password"
                type="password"
                formControlName="confirmPassword"
                autocomplete="new-password"
                class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none transition-all"
              />
              <p
                *ngIf="submitted && resetForm.errors?.['mismatch']"
                class="text-xs text-rose-400 mt-1"
                role="alert"
              >
                Les mots de passe ne correspondent pas
              </p>
            </div>

            <button
              type="submit"
              [disabled]="loading"
              class="w-full py-4 bg-gradient-to-r from-[#C62761] to-[#F5A623] hover:shadow-[0_0_20px_rgba(198,39,97,0.4)] disabled:opacity-50 text-white font-syne font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span *ngIf="loading" class="animate-spin text-sm" aria-hidden="true">⌛</span>
              <span>{{ loading ? 'Validation...' : 'Réinitialiser le mot de passe' }}</span>
            </button>

            <div class="flex items-center justify-between text-xs text-[var(--bridge-text-muted)]">
              <a routerLink="/auth/login" class="hover:text-white hover:underline"
                >Retour à la connexion</a
              >
              <a
                routerLink="/auth/forgot-password"
                class="text-[var(--bridge-gold)] hover:underline"
                >Je n'ai pas reçu le code</a
              >
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
