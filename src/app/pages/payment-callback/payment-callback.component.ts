import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaiementService } from '../../core/services/paiement.service';
import { ComboEnrollmentService } from '../../core/services/combo-enrollment.service';
import { OnboardingService } from '../../core/services/onboarding.service';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        min-height: 100dvh;
      }

      .callback-bg {
        background-color: #0d0b18;
        transition: background-color 0.3s ease;
      }

      .theme-card {
        background: rgba(16, 16, 42, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(16px);
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
      }

      /* Light Theme Overrides */
      :host-context([data-theme='light']) .callback-bg {
        background-color: #f7f4ed !important;
        background-image:
          radial-gradient(at 0% 0%, rgba(198, 39, 97, 0.05) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(245, 166, 35, 0.05) 0px, transparent 50%) !important;
      }

      :host-context([data-theme='light']) .theme-card {
        background: #ffffff !important;
        border: 1px solid #e2d9c8 !important;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1) !important;
      }

      :host-context([data-theme='light']) .theme-title {
        color: #1d2433 !important;
      }

      :host-context([data-theme='light']) .theme-desc {
        color: #5a6474 !important;
      }

      :host-context([data-theme='light']) .theme-success-text {
        color: #065f46 !important;
      }

      :host-context([data-theme='light']) .theme-error-text {
        color: #991b1b !important;
      }

      :host-context([data-theme='light']) .theme-secondary-btn {
        background-color: #f0ece3 !important;
        border-color: #e2d9c8 !important;
        color: #1d2433 !important;
      }

      :host-context([data-theme='light']) .theme-secondary-btn:hover {
        background-color: #e2d9c8 !important;
      }
    `,
  ],
  template: `
    <div
      class="callback-bg min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-300"
    >
      <div
        class="glass-card theme-card max-w-md w-full p-8 text-center rounded-3xl relative overflow-hidden shadow-2xl transition-colors duration-300"
      >
        <!-- Background Glow -->
        <div
          class="absolute -top-24 -left-24 w-48 h-48 bg-[#C62761]/20 rounded-full blur-3xl pointer-events-none"
        ></div>
        <div
          class="absolute -bottom-24 -right-24 w-48 h-48 bg-[#F5A623]/20 rounded-full blur-3xl pointer-events-none"
        ></div>

        <!-- State: Loading -->
        <div *ngIf="loading" class="space-y-6 py-6 relative z-10">
          <div
            class="w-16 h-16 border-4 border-[#C62761] border-t-transparent rounded-full animate-spin mx-auto"
          ></div>
          <div>
            <h2 class="theme-title text-xl font-bold text-white font-syne">
              Vérification du paiement Stripe
            </h2>
            <p class="theme-desc text-sm text-[var(--bridge-text-muted)] mt-2">
              Veuillez patienter pendant la confirmation de votre transaction Stripe...
            </p>
          </div>
        </div>

        <!-- State: Success -->
        <div *ngIf="!loading && success" class="space-y-6 relative z-10">
          <div
            class="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-4xl mx-auto text-emerald-400 animate-bounce"
          >
            🎉
          </div>
          <div>
            <h2 class="theme-title text-2xl font-bold text-white font-syne">Paiement Réussi !</h2>
            <p class="theme-success-text text-sm text-emerald-300/90 mt-2 leading-relaxed">
              {{ successMessage }}
            </p>
          </div>
          <div class="pt-4">
            <button
              (click)="goToDashboard()"
              class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold text-sm hover:opacity-95 transition-all shadow-lg cursor-pointer"
            >
              {{ isStagePayment ? 'Voir mon Stage Facultatif →' : 'Retour au Tableau de Bord →' }}
            </button>
          </div>
        </div>

        <!-- State: Error / Fail -->
        <div *ngIf="!loading && !success" class="space-y-6 relative z-10">
          <div
            class="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-4xl mx-auto text-red-400"
          >
            ⚠️
          </div>
          <div>
            <h2 class="theme-title text-2xl font-bold text-white font-syne">Paiement Non Validé</h2>
            <p class="theme-error-text text-sm text-red-300/90 mt-2 leading-relaxed">
              {{
                errorMessage ? errorMessage : "La transaction n'a pas pu être confirmée par Stripe."
              }}
            </p>
          </div>
          <div class="pt-4 flex gap-3">
            <button
              (click)="goToDashboard()"
              class="theme-secondary-btn flex-1 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-xs hover:bg-white/10 transition-all cursor-pointer"
            >
              {{ isStagePayment ? 'Mon Espace Stage' : 'Tableau de bord' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PaymentCallbackComponent implements OnInit {
  loading = true;
  success = false;
  errorMessage = '';
  successMessage =
    'Votre règlement Stripe a été validé avec succès. Votre accès et votre parcours personnalisé ont été activés en base de données.';
  isStagePayment = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paiementService: PaiementService,
    private comboEnrollmentService: ComboEnrollmentService,
    private onboardingService: OnboardingService,
  ) {}

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    const stageInscriptionId = this.route.snapshot.queryParamMap.get('stageInscriptionId');
    const comboId =
      this.route.snapshot.queryParamMap.get('comboId') || sessionStorage.getItem('pendingComboId');
    const enrollmentId =
      this.route.snapshot.queryParamMap.get('enrollmentId') ||
      localStorage.getItem('pending_stripe_enrollment_id');
    const phaseId =
      this.route.snapshot.queryParamMap.get('phaseId') ||
      localStorage.getItem('pending_stripe_phase_id');

    if (sessionId && stageInscriptionId) {
      // Validation du paiement d'une convention de stage facultatif
      this.isStagePayment = true;
      this.onboardingService.verifyStagePayment(sessionId, Number(stageInscriptionId)).subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          this.successMessage =
            'Votre règlement de convention de stage a été validé avec succès ! Votre dossier est maintenant actif.';
        },
        error: (err: any) => {
          this.loading = false;
          this.success = false;
          this.errorMessage =
            err?.error?.message ||
            'Erreur lors de la validation du paiement de votre convention de stage.';
        },
      });
    } else if (sessionId && comboId) {
      // Validation du combo de formations
      this.comboEnrollmentService.verifyComboPayment(sessionId, Number(comboId)).subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          this.successMessage =
            'Votre règlement Stripe a été validé avec succès. Votre accès et votre parcours personnalisé ont été activés en base de données.';
          sessionStorage.removeItem('pendingComboId');
          sessionStorage.removeItem('pendingComboReceiptRef');
        },
        error: (err: any) => {
          this.loading = false;
          this.success = false;
          this.errorMessage =
            err?.error?.message || 'Erreur lors de la validation du paiement du combo.';
        },
      });
    } else if (sessionId && enrollmentId && phaseId) {
      // Validation d'une phase de formation individuelle
      this.paiementService
        .verifyStripePayment(sessionId, Number(enrollmentId), Number(phaseId))
        .subscribe({
          next: () => {
            this.loading = false;
            this.success = true;
            this.successMessage = 'Votre règlement de phase de formation a été validé avec succès.';
            localStorage.removeItem('pending_stripe_enrollment_id');
            localStorage.removeItem('pending_stripe_phase_id');
          },
          error: (err: any) => {
            this.loading = false;
            this.success = false;
            this.errorMessage =
              err?.error?.message || 'Erreur lors de la validation du paiement Stripe.';
          },
        });
    } else {
      const isSuccessPath = this.router.url.includes('payment-success');
      this.loading = false;
      this.success = isSuccessPath;
      if (!isSuccessPath) {
        this.errorMessage = 'Paiement annulé ou échoué.';
      }
    }
  }

  goToDashboard(): void {
    if (this.isStagePayment) {
      this.router.navigate(['/dashboard/stagiaire/stage']);
    } else {
      this.router.navigate(['/dashboard/stagiaire']);
    }
  }
}
