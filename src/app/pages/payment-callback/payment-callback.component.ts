import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaiementService } from '../../core/services/paiement.service';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#0D0B18] p-4 font-sans">
      <div
        class="glass-card max-w-md w-full p-8 border border-[var(--bridge-border)] text-center rounded-3xl relative overflow-hidden shadow-2xl"
      >
        <!-- Background Glow -->
        <div
          class="absolute -top-24 -left-24 w-48 h-48 bg-[#C62761]/20 rounded-full blur-3xl pointer-events-none"
        ></div>
        <div
          class="absolute -bottom-24 -right-24 w-48 h-48 bg-[#F5A623]/20 rounded-full blur-3xl pointer-events-none"
        ></div>

        <!-- State: Loading -->
        <div *ngIf="loading" class="space-y-6 py-6">
          <div
            class="w-16 h-16 border-4 border-[#C62761] border-t-transparent rounded-full animate-spin mx-auto"
          ></div>
          <div>
            <h2 class="text-xl font-bold text-white font-syne">Vérification du paiement Stripe</h2>
            <p class="text-sm text-[var(--bridge-text-muted)] mt-2">
              Veuillez patienter pendant la confirmation de votre transaction Stripe...
            </p>
          </div>
        </div>

        <!-- State: Success -->
        <div *ngIf="!loading && success" class="space-y-6">
          <div
            class="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-4xl mx-auto text-emerald-400 animate-bounce"
          >
            🎉
          </div>
          <div>
            <h2 class="text-2xl font-bold text-white font-syne">Paiement Réussi !</h2>
            <p class="text-sm text-emerald-300/80 mt-2">
              Votre règlement Stripe a été validé avec succès. Votre accès et votre progression ont
              été mis à jour.
            </p>
          </div>
          <div class="pt-4">
            <button
              (click)="goToDashboard()"
              class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg"
            >
              Retour au Tableau de Bord →
            </button>
          </div>
        </div>

        <!-- State: Error / Fail -->
        <div *ngIf="!loading && !success" class="space-y-6">
          <div
            class="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-4xl mx-auto text-red-400"
          >
            ⚠️
          </div>
          <div>
            <h2 class="text-2xl font-bold text-white font-syne">Paiement Non Validé</h2>
            <p class="text-sm text-red-300/80 mt-2">
              {{ errorMessage ? errorMessage : 'La transaction n'a pas pu être confirmée par Stripe.' }}
            </p>
          </div>
          <div class="pt-4 flex gap-3">
            <button
              (click)="goToDashboard()"
              class="flex-1 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-xs hover:bg-white/10 transition-all"
            >
              Tableau de bord
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paiementService: PaiementService,
  ) {}

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    const enrollmentId =
      this.route.snapshot.queryParamMap.get('enrollmentId') ||
      localStorage.getItem('pending_stripe_enrollment_id');
    const phaseId =
      this.route.snapshot.queryParamMap.get('phaseId') ||
      localStorage.getItem('pending_stripe_phase_id');

    if (sessionId && enrollmentId && phaseId) {
      this.paiementService
        .verifyStripePayment(sessionId, Number(enrollmentId), Number(phaseId))
        .subscribe({
          next: () => {
            this.loading = false;
            this.success = true;
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
    this.router.navigate(['/dashboard/stagiaire']);
  }
}
