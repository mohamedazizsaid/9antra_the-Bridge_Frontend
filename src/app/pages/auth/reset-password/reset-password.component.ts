import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AnimatedBgComponent } from '../../../shared/components/animated-bg/animated-bg.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AnimatedBgComponent],
  template: `
    <app-animated-bg></app-animated-bg>
    <div class="min-h-screen flex flex-col md:flex-row relative z-10 text-white font-inter">
      <div class="w-full md:w-[42%] bg-gradient-to-br from-[#10102A]/80 to-[#171738]/90 border-r border-[var(--bridge-border)] p-8 md:p-12 flex flex-col justify-between backdrop-blur-md">
        <div class="flex items-center gap-3 cursor-pointer" routerLink="/home">
          <svg class="w-8 h-10" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 10 C20 10 10 25 10 38 C10 51 20 58 40 58 C48 58 54 55 58 50" stroke="#C62761" stroke-width="8" stroke-linecap="round" fill="none" />
            <path d="M40 90 C60 90 70 75 70 62 C70 49 60 42 40 42 C32 42 26 45 22 50" stroke="#F5A623" stroke-width="8" stroke-linecap="round" fill="none" />
          </svg>
          <div>
            <h1 class="font-syne font-bold text-2xl tracking-wide">The <span class="text-gradient">Bridge</span></h1>
            <p class="text-[10px] tracking-[4px] uppercase text-[var(--bridge-text-muted)]">9antra</p>
          </div>
        </div>

        <div class="my-auto py-12">
          <span class="text-xs font-bold text-[var(--bridge-gold)] tracking-widest uppercase">CONFIDENTIALITÉ</span>
          <h2 class="font-syne font-extrabold text-3xl md:text-4xl lg:text-5xl mt-4 leading-tight max-w-md">
            Entrez le code et choisissez un<br/>
            <span class="text-gradient font-bold">nouveau mot de passe</span>
          </h2>
          <p class="mt-6 text-[var(--bridge-text-muted)] text-sm md:text-base max-w-md leading-relaxed">
            Le nouveau mot de passe sera protégé et appliquera le même thème que le reste de votre expérience The Bridge.
          </p>
        </div>

        <div class="text-xs text-[var(--bridge-text-sub)]">
          &copy; 2026 9antra. Tous droits réservés.
        </div>
      </div>

      <div class="w-full md:w-[58%] flex items-center justify-center p-6 md:p-12">
        <div class="w-full max-w-md glass-card p-8 md:p-10">
          <div class="mb-8">
            <p class="text-[11px] uppercase tracking-[0.35em] text-[var(--bridge-gold)] font-bold">Réinitialisation</p>
            <h3 class="font-syne font-bold text-2xl md:text-3xl mt-3">Définir un nouveau mot de passe</h3>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-2">Saisissez le code reçu par email.</p>
          </div>

          <div *ngIf="message" class="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
            {{ message }}
          </div>

          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-5" *ngIf="!message">
            <div>
              <label class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2">Adresse Email</label>
              <input type="email" formControlName="email" class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none transition-all" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2">Code OTP</label>
              <input type="text" formControlName="code" maxlength="6" inputmode="numeric" class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none transition-all tracking-[0.3em] text-center" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2">Nouveau mot de passe</label>
              <input type="password" formControlName="newPassword" class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none transition-all" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2">Confirmer le mot de passe</label>
              <input type="password" formControlName="confirmPassword" class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none transition-all" />
              <p *ngIf="submitted && resetForm.errors?.['mismatch']" class="text-xs text-rose-400 mt-1">Les mots de passe ne correspondent pas</p>
            </div>

            <button type="submit" [disabled]="loading" class="w-full py-4 bg-gradient-to-r from-[#C62761] to-[#F5A623] hover:shadow-[0_0_20px_rgba(198,39,97,0.4)] disabled:opacity-50 text-white font-syne font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
              <span *ngIf="loading" class="animate-spin text-sm">⌛</span>
              <span>{{ loading ? 'Validation...' : 'Réinitialiser le mot de passe' }}</span>
            </button>

            <div class="flex items-center justify-between text-xs text-[var(--bridge-text-muted)]">
              <a routerLink="/auth/login" class="hover:text-white hover:underline">Retour à la connexion</a>
              <a routerLink="/auth/forgot-password" class="text-[var(--bridge-gold)] hover:underline">Je n'ai pas reçu le code</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  resetForm;
  loading = false;
  submitted = false;
  message = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private route: ActivatedRoute) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.resetForm.patchValue({ email });
    }
  }

  passwordsMatch(group: any) {
    return group.get('newPassword')?.value === group.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  onSubmit(): void {
    this.submitted = true;
    this.message = '';
    if (this.resetForm.invalid) return;

    this.loading = true;
    this.authService.resetPassword({
      email: this.resetForm.value.email!,
      code: this.resetForm.value.code!,
      newPassword: this.resetForm.value.newPassword!
    }).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.';
        setTimeout(() => this.router.navigateByUrl('/auth/login'), 1800);
      },
      error: (err) => {
        this.loading = false;
        this.message = err.error?.message || 'Impossible de réinitialiser le mot de passe.';
      }
    });
  }
}