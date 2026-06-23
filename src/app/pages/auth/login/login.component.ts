import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { AnimatedBgComponent } from '../../../shared/components/animated-bg/animated-bg.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AnimatedBgComponent],
  template: `
    <app-animated-bg></app-animated-bg>
    <div class="min-h-screen flex flex-col md:flex-row relative z-10 text-white font-inter">
      <!-- Brand Panel (Left 42%) -->
      <div class="animate-slide-left w-full md:w-[42%] bg-gradient-to-br from-[#10102A]/80 to-[#171738]/90 border-r border-[var(--bridge-border)] p-8 md:p-12 flex flex-col justify-between backdrop-blur-md">
        <!-- Logo -->
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

        <!-- Content -->
        <div class="my-auto py-12">
          <span class="text-xs font-bold text-[var(--bridge-gold)] tracking-widest uppercase">PLATEFORME PROFESSIONNELLE</span>
          <h2 class="font-syne font-extrabold text-3xl md:text-4xl lg:text-5xl mt-4 leading-tight min-h-[80px] md:min-h-[120px]">
            {{ typedLine1 }}<br/>
            <span class="text-gradient font-bold">{{ typedLine2 }}</span>
            <span class="animate-pulse text-[var(--bridge-gold)]">|</span>
          </h2>
          <p class="mt-6 text-[var(--bridge-text-muted)] text-sm md:text-base max-w-md leading-relaxed animate-fade">
            Connectez-vous pour accéder à vos formations, suivre vos cours et obtenir vos certifications sécurisées sur la blockchain.
          </p>
        </div>

        <!-- Footer -->
        <div class="text-xs text-[var(--bridge-text-sub)]">
          &copy; 2026 9antra. Tous droits réservés.
        </div>
      </div>

      <!-- Login Form Card (Right 58%) -->
      <div class="animate-slide-right w-full md:w-[58%] flex items-center justify-center p-6 md:p-12">
        <div class="w-full max-w-md glass-card p-8 md:p-10 relative overflow-hidden transition-all" [class.animate-shake]="hasError">
          <!-- Card header -->
          <div class="form-item mb-8">
            <h3 class="font-syne font-bold text-2xl md:text-3xl">Connexion</h3>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-2">
              Vous n'avez pas de compte ? 
              <a routerLink="/auth/register" class="text-[var(--bridge-gold)] hover:underline font-semibold ml-1">Inscrivez-vous</a>
            </p>
          </div>

          <!-- Alert -->
          <div *ngIf="errorMessage" class="form-item mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Email -->
            <div class="form-item">
              <label class="block text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-2">Adresse Email</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">📧</span>
                <input 
                  type="email" 
                  formControlName="email"
                  placeholder="exemple@thebridge.tn"
                  class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none transition-all"
                  [ngClass]="{'border-rose-500/50': submitted && f['email'].errors}"
                />
              </div>
              <div *ngIf="submitted && f['email'].errors" class="text-xs text-rose-400 mt-1">
                <span *ngIf="f['email'].errors['required']">L'email est requis</span>
                <span *ngIf="f['email'].errors['email']">Veuillez entrer un email valide</span>
              </div>
            </div>

            <!-- Password -->
            <div class="form-item">
              <div class="flex justify-between items-center mb-2">
                <label class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Mot de passe</label>
                  <a routerLink="/auth/forgot-password" class="text-xs text-[var(--bridge-text-muted)] hover:text-white hover:underline cursor-pointer">Oublié ?</a>
              </div>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">🔒</span>
                <input 
                  [type]="showPassword ? 'text' : 'password'" 
                  formControlName="password"
                  placeholder="••••••••"
                  class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 pl-12 pr-12 text-sm text-white focus:outline-none transition-all"
                  [ngClass]="{'border-rose-500/50': submitted && f['password'].errors}"
                />
                <button 
                  type="button" 
                  (click)="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 focus:outline-none cursor-pointer"
                >
                  <svg *ngIf="showPassword" class="w-5 h-5 text-white/50 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg *ngIf="!showPassword" class="w-5 h-5 text-white/50 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.024 10.024 0 014.168-5.63m2.712-1.178A9.979 9.979 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.613m-9.354-9.614a3 3 0 104.243 4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                </button>
              </div>
              <div *ngIf="submitted && f['password'].errors" class="text-xs text-rose-400 mt-1">
                <span *ngIf="f['password'].errors['required']">Le mot de passe est requis</span>
              </div>
            </div>

            <!-- Remember me Custom Toggle -->
            <div class="form-item flex items-center justify-between">
              <div class="flex items-center gap-3">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" formControlName="rememberMe" class="sr-only peer">
                  <div class="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--bridge-crimson)]"></div>
                </label>
                <span class="text-xs text-[var(--bridge-text-muted)] select-none">Se souvenir de moi</span>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              [disabled]="loading"
              class="form-item w-full py-4 bg-gradient-to-r from-[#C62761] to-[#F5A623] hover:shadow-[0_0_20px_rgba(198,39,97,0.4)] disabled:opacity-50 text-white font-syne font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden group"
            >
              <span *ngIf="loading" class="animate-spin text-sm">⌛</span>
              <span>{{ loading ? 'Connexion en cours...' : 'Se Connecter' }}</span>
              <span *ngIf="!loading" class="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>
          </form>

          <!-- Divider -->
          <div class="form-item my-8 flex items-center justify-between text-xs text-[var(--bridge-text-muted)]">
            <span class="w-[30%] h-px bg-white/10"></span>
            <span>OU CONTINUER AVEC</span>
            <span class="w-[30%] h-px bg-white/10"></span>
          </div>

          <!-- Social Logins -->
          <div class="form-item grid grid-cols-2 gap-4">
            <button (click)="socialLogin('GOOGLE')" class="py-3 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm">
              <!-- Official Google Icon -->
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.53l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </button>
            <button (click)="socialLogin('FACEBOOK')" class="py-3 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm">
              <!-- Official Facebook Icon -->
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
              </svg>
              Continuer avec Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }
    .animate-shake {
      animation: shake 0.4s ease-in-out;
    }
    @keyframes fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade {
      animation: fade 1s ease-in-out 1s both;
    }
    
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-left {
      animation: slideInLeft 0.75s cubic-bezier(0.35, 0, 0.25, 1) both;
    }

    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-right {
      animation: slideInRight 0.75s cubic-bezier(0.35, 0, 0.25, 1) both;
    }

    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .form-item {
      animation: slideInUp 0.5s cubic-bezier(0.35, 0, 0.25, 1) both;
    }
    .form-item:nth-child(1) { animation-delay: 150ms; }
    .form-item:nth-child(2) { animation-delay: 250ms; }
    .form-item:nth-child(3) { animation-delay: 350ms; }
    .form-item:nth-child(4) { animation-delay: 450ms; }
    .form-item:nth-child(5) { animation-delay: 550ms; }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  hasError = false;
  showPassword = false;

  typedLine1 = '';
  typedLine2 = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    this.startTypewriter();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get f() { return this.loginForm.controls; }

  startTypewriter() {
    const text1 = 'Le pont vers votre';
    const text2 = 'avenir certifié';

    let i = 0;
    const sub1 = interval(45).pipe(take(text1.length)).subscribe({
      next: () => {
        this.typedLine1 = text1.substring(0, i + 1);
        i++;
      },
      complete: () => {
        let j = 0;
        const sub2 = interval(55).pipe(take(text2.length)).subscribe({
          next: () => {
            this.typedLine2 = text2.substring(0, j + 1);
            j++;
          }
        });
        this.subscriptions.push(sub2);
      }
    });
    this.subscriptions.push(sub1);
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.hasError = false;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    }, this.loginForm.value.rememberMe).subscribe({
      next: (res) => {
        this.loading = false;
        const redirectUrl = this.authService.getRedirectUrl(res.role);
        this.router.navigateByUrl(redirectUrl);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || err.message || 'Identifiants invalides';
        this.hasError = true;
        setTimeout(() => this.hasError = false, 500);
      }
    });
  }

  socialLogin(provider: string): void {
    this.errorMessage = `La connexion ${provider} n'est pas encore reliée à un vrai client OAuth.`;
    this.hasError = true;
    setTimeout(() => this.hasError = false, 500);
  }
}
