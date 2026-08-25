import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { AnimatedBgComponent } from '../../../shared/components/animated-bg/animated-bg.component';
import { OAuthConfigResponse } from '../../../core/models/user.model';

declare global {
  interface Window {
    google?: any;
    FB?: any;
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AnimatedBgComponent],
  template: `
    <app-animated-bg></app-animated-bg>
    <div class="min-h-screen flex flex-col md:flex-row relative z-10 text-white font-inter">
      <!-- Brand Panel (Left 42%) -->
      <div
        class="animate-slide-left w-full md:w-[42%] bg-gradient-to-br from-[#10102A]/80 to-[#171738]/90 border-r border-[var(--bridge-border)] p-8 md:p-12 flex flex-col justify-between backdrop-blur-md"
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
            >PLATEFORME PROFESSIONNELLE</span
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
            Connectez-vous pour accéder à vos formations, suivre vos cours et obtenir vos
            certifications sécurisées sur la blockchain.
          </p>
        </div>

        <!-- Footer -->
        <div class="text-xs text-[var(--bridge-text-sub)]">
          &copy; 2026 9antra. Tous droits réservés.
        </div>
      </div>

      <!-- Login Form Card (Right 58%) -->
      <div
        class="animate-slide-right w-full md:w-[58%] flex items-center justify-center p-6 md:p-12"
      >
        <div
          class="w-full max-w-md glass-card p-8 md:p-10 relative overflow-hidden transition-all"
          [class.animate-shake]="hasError"
        >
          <!-- Card header -->
          <div class="form-item mb-8">
            <h2 class="font-syne font-bold text-2xl md:text-3xl">Connexion</h2>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-2">
              Vous n'avez pas de compte ?
              <a
                routerLink="/auth/register"
                class="text-[var(--bridge-gold)] hover:underline font-semibold ml-1"
                >Inscrivez-vous</a
              >
            </p>
          </div>

          <!-- Alert -->
          <div
            *ngIf="errorMessage"
            role="alert"
            class="form-item mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5"
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
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Email -->
            <div class="form-item">
              <label
                for="login-email"
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
                  id="login-email"
                  type="email"
                  formControlName="email"
                  placeholder="exemple@thebridge.tn"
                  autocomplete="email"
                  class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none transition-all"
                  [ngClass]="{ 'border-rose-500/50': submitted && f['email'].errors }"
                />
              </div>
              <div
                *ngIf="submitted && f['email'].errors"
                class="text-xs text-rose-400 mt-1"
                role="alert"
              >
                <span *ngIf="f['email'].errors['required']">L'email est requis</span>
                <span *ngIf="f['email'].errors['email']">Veuillez entrer un email valide</span>
              </div>
            </div>

            <!-- Password -->
            <div class="form-item">
              <div class="flex justify-between items-center mb-2">
                <label
                  for="login-password"
                  class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                  >Mot de passe</label
                >
                <a
                  routerLink="/auth/forgot-password"
                  class="text-xs text-[var(--bridge-text-muted)] hover:text-white hover:underline cursor-pointer"
                  >Oublié ?</a
                >
              </div>
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
                  id="login-password"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  class="w-full bg-white/[0.03] border border-white/10 focus:border-[var(--bridge-crimson)] rounded-xl py-3.5 pl-12 pr-12 text-sm text-white focus:outline-none transition-all"
                  [ngClass]="{ 'border-rose-500/50': submitted && f['password'].errors }"
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
              <div
                *ngIf="submitted && f['password'].errors"
                class="text-xs text-rose-400 mt-1"
                role="alert"
              >
                <span *ngIf="f['password'].errors['required']">Le mot de passe est requis</span>
              </div>
            </div>

            <!-- Remember me Custom Toggle -->
            <div class="form-item flex items-center justify-between">
              <div class="flex items-center gap-3">
                <label
                  class="relative inline-flex items-center cursor-pointer"
                  for="login-remember"
                >
                  <input
                    id="login-remember"
                    type="checkbox"
                    formControlName="rememberMe"
                    class="sr-only peer"
                  />
                  <div
                    class="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--bridge-crimson)]"
                  ></div>
                </label>
                <span class="text-xs text-[var(--bridge-text-muted)] select-none"
                  >Se souvenir de moi</span
                >
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loading"
              class="form-item w-full py-4 bg-gradient-to-r from-[#C62761] to-[#F5A623] hover:shadow-[0_0_20px_rgba(198,39,97,0.4)] disabled:opacity-50 text-white font-syne font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden group"
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
              <span>{{ loading ? 'Connexion en cours...' : 'Se Connecter' }}</span>
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
          </form>

          <!-- Divider -->
          <div
            class="form-item my-8 flex items-center justify-between text-xs text-[var(--bridge-text-muted)]"
          >
            <span class="w-[30%] h-px bg-white/10"></span>
            <span>OU CONTINUER AVEC</span>
            <span class="w-[30%] h-px bg-white/10"></span>
          </div>

          <!-- Social Logins -->
          <div class="form-item grid grid-cols-2 gap-4">
            <button
              (click)="socialLogin('GOOGLE')"
              class="py-3 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <!-- Official Google Icon -->
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.53l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuer avec Google
            </button>
            <button
              (click)="socialLogin('FACEBOOK')"
              class="py-3 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <!-- Official Facebook Icon -->
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  fill="#1877F2"
                />
              </svg>
              Continuer avec Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes shake {
        0%,
        100% {
          transform: translateX(0);
        }
        20%,
        60% {
          transform: translateX(-6px);
        }
        40%,
        80% {
          transform: translateX(6px);
        }
      }
      .animate-shake {
        animation: shake 0.4s ease-in-out;
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
    `,
  ],
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
  private oauthConfig: OAuthConfigResponse | null = null;
  private googleScriptLoaded = false;
  private facebookScriptLoaded = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Connexion | The Bridge — 9antra');
    this.meta.updateTag({
      name: 'description',
      content:
        'Connectez-vous à votre espace The Bridge (9antra) pour accéder à vos formations et certifications.',
    });
    const savedEmail = localStorage.getItem('bridge_remember_email');
    this.loginForm = this.formBuilder.group({
      email: [savedEmail || '', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [!!savedEmail],
    });

    this.startTypewriter();
    this.authService.getOAuthConfig().subscribe({
      next: (config) => (this.oauthConfig = config),
      error: () => (this.errorMessage = 'La configuration OAuth publique est indisponible.'),
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  get f() {
    return this.loginForm.controls;
  }

  startTypewriter() {
    const text1 = 'Le pont vers votre';
    const text2 = 'avenir certifié';

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
    this.errorMessage = '';
    this.hasError = false;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const rememberMe = this.loginForm.value.rememberMe;
    const email = this.loginForm.value.email;

    if (rememberMe) {
      localStorage.setItem('bridge_remember_email', email);
    } else {
      localStorage.removeItem('bridge_remember_email');
    }

    this.authService
      .login(
        {
          email: email,
          password: this.loginForm.value.password,
        },
        rememberMe,
      )
      .subscribe({
        next: (res) => {
          this.loading = false;
          const redirectUrl = this.authService.getRedirectUrl(res.role);
          this.router.navigateByUrl(redirectUrl);
        },
        error: (err: any) => {
          this.loading = false;
          this.errorMessage = err.error?.message || err.message || 'Identifiants invalides';
          this.hasError = true;
          setTimeout(() => (this.hasError = false), 500);
        },
      });
  }

  socialLogin(provider: string): void {
    this.errorMessage = '';
    this.hasError = false;

    if (provider === 'GOOGLE') {
      this.loginWithGoogle();
      return;
    }

    if (provider === 'FACEBOOK') {
      this.loginWithFacebook();
      return;
    }

    this.errorMessage = `Fournisseur OAuth non supporté: ${provider}`;
    this.hasError = true;
    setTimeout(() => (this.hasError = false), 500);
  }

  private async loginWithGoogle(): Promise<void> {
    if (!this.oauthConfig?.googleClientId) {
      this.errorMessage = 'Google OAuth est mal configuré: client ID manquant.';
      this.hasError = true;
      setTimeout(() => (this.hasError = false), 500);
      return;
    }

    try {
      await this.ensureGoogleScript();
      const google = window.google;
      if (!google?.accounts?.oauth2) {
        throw new Error('Google Identity Services indisponible');
      }

      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.oauthConfig.googleClientId,
        scope: 'openid email profile',
        callback: (response: any) => {
          if (response.error) {
            this.errorMessage = response.error_description || response.error;
            this.hasError = true;
            return;
          }
          this.exchangeOAuthToken('GOOGLE', response.access_token);
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error: any) {
      this.errorMessage = error?.message || "Impossible d'initialiser Google OAuth";
      this.hasError = true;
      setTimeout(() => (this.hasError = false), 500);
    }
  }

  private async loginWithFacebook(): Promise<void> {
    if (!this.oauthConfig?.facebookAppId) {
      this.errorMessage = 'Facebook OAuth est mal configuré: App ID manquant.';
      this.hasError = true;
      setTimeout(() => (this.hasError = false), 500);
      return;
    }

    try {
      await this.ensureFacebookScript();
      const fb = window.FB;
      if (!fb) {
        throw new Error('Facebook SDK indisponible');
      }

      fb.init({
        appId: this.oauthConfig.facebookAppId,
        cookie: true,
        xfbml: false,
        version: 'v21.0',
      });

      fb.login(
        (response: any) => {
          if (!response.authResponse?.accessToken) {
            this.errorMessage = 'Connexion Facebook annulée ou refusée.';
            this.hasError = true;
            return;
          }
          this.exchangeOAuthToken('FACEBOOK', response.authResponse.accessToken);
        },
        { scope: 'email,public_profile' },
      );
    } catch (error: any) {
      this.errorMessage = error?.message || "Impossible d'initialiser Facebook OAuth";
      this.hasError = true;
      setTimeout(() => (this.hasError = false), 500);
    }
  }

  private exchangeOAuthToken(provider: string, accessToken: string): void {
    this.loading = true;
    this.authService.oauthLogin(provider, accessToken).subscribe({
      next: (res) => {
        this.loading = false;
        const redirectUrl = this.authService.getRedirectUrl(res.role);
        this.router.navigateByUrl(redirectUrl);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || err.message || `Échec de connexion ${provider}`;
        this.hasError = true;
        setTimeout(() => (this.hasError = false), 500);
      },
    });
  }

  private ensureGoogleScript(): Promise<void> {
    if (this.googleScriptLoaded || window.google?.accounts?.oauth2) {
      this.googleScriptLoaded = true;
      return Promise.resolve();
    }

    return this.loadScript(
      'https://accounts.google.com/gsi/client',
      'google-identity-services',
    ).then(() => {
      this.googleScriptLoaded = true;
    });
  }

  private ensureFacebookScript(): Promise<void> {
    if (this.facebookScriptLoaded || window.FB) {
      this.facebookScriptLoaded = true;
      return Promise.resolve();
    }

    return this.loadScript('https://connect.facebook.net/en_US/sdk.js', 'facebook-jssdk').then(
      () => {
        this.facebookScriptLoaded = true;
      },
    );
  }

  private loadScript(src: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById(id)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Impossible de charger ${src}`));
      document.head.appendChild(script);
    });
  }
}
