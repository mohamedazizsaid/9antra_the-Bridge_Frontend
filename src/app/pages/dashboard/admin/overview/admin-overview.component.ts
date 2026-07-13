import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { FormationService } from '../../../../core/services/formation.service';
import { PaiementService } from '../../../../core/services/paiement.service';
import { EnrollmentService } from '../../../../core/services/enrollment.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">

      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="font-syne font-bold text-2xl md:text-3xl text-white">
            Panneau d'administration <span class="text-[#C62761]">9antra</span>
          </h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">Vue consolidée de la plateforme en temps réel</p>
        </div>
        <div class="text-sm text-[var(--bridge-text-muted)] font-mono">{{ today }}</div>
      </div>

      <!-- Global Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-5 border border-[var(--bridge-border)]">
          <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider">Utilisateurs</p>
          <p class="text-3xl font-mono font-bold text-white mt-2">{{ stats?.totalUsers ?? '—' }}</p>
          <div class="flex gap-2 mt-2">
            <span class="text-[10px] bg-[rgba(198,39,97,0.1)] text-[#C62761] px-2 py-0.5 rounded-full">{{ stats?.totalStagiaires ?? 0 }} stagiaires</span>
            <span class="text-[10px] bg-[rgba(245,166,35,0.1)] text-[#F5A623] px-2 py-0.5 rounded-full">{{ stats?.totalFormateurs ?? 0 }} formateurs</span>
          </div>
        </div>
        <div class="glass-card p-5 border border-[var(--bridge-border)]">
          <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider">Formations</p>
          <p class="text-3xl font-mono font-bold text-[#F5A623] mt-2">{{ stats?.totalFormations ?? '—' }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-2">actives sur la plateforme</p>
        </div>
        <div class="glass-card p-5 border border-[var(--bridge-border)]">
          <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider">Inscriptions</p>
          <p class="text-3xl font-mono font-bold text-emerald-400 mt-2">{{ stats?.totalEnrollments ?? '—' }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-2">total cumulé</p>
        </div>
        <div class="glass-card p-5 border border-[var(--bridge-border)]">
          <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider">Certificats</p>
          <p class="text-3xl font-mono font-bold text-transparent bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text mt-2">{{ stats?.totalCertificates ?? '—' }}</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-2">émis sur blockchain</p>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid lg:grid-cols-3 gap-6">

        <!-- Left: Users Table -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Users Management -->
          <div class="glass-card border border-[var(--bridge-border)] overflow-hidden">
            <div class="p-6 border-b border-[var(--bridge-border)] flex items-center justify-between">
              <h3 class="font-syne font-bold text-lg">👥 Gestion des utilisateurs</h3>
              <div class="flex gap-2">
                <select [(ngModel)]="roleFilter"
                        class="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C62761]">
                  <option value="">Tous les rôles</option>
                  <option value="STAGIAIRE">Stagiaires</option>
                  <option value="FORMATEUR">Formateurs</option>
                  <option value="ADMIN">Admins</option>
                </select>
                <input [(ngModel)]="searchQuery" placeholder="Chercher..."
                       class="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C62761] w-36"
                       (input)="filterUsers()" />
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-white/5 text-[10px] uppercase tracking-wider text-[var(--bridge-text-muted)]">
                    <th class="py-3 px-4 text-left font-semibold">Utilisateur</th>
                    <th class="py-3 px-4 text-left font-semibold">Email</th>
                    <th class="py-3 px-4 text-left font-semibold">Rôle</th>
                    <th class="py-3 px-4 text-left font-semibold">Statut</th>
                    <th class="py-3 px-4 text-left font-semibold">ID</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let u of filteredUsers.slice(0, 10)"
                      class="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {{ u.prenom?.[0] }}{{ u.nom?.[0] }}
                        </div>
                        <div>
                          <p class="font-semibold text-white text-sm">{{ u.prenom }} {{ u.nom }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-[var(--bridge-text-muted)] text-xs font-mono">{{ u.email }}</td>
                    <td class="py-3 px-4">
                      <span class="text-[10px] px-2 py-1 rounded-full font-bold uppercase"
                            [class]="u.role === 'ADMIN' ? 'bg-[rgba(198,39,97,0.1)] text-[#C62761]'
                                   : u.role === 'FORMATEUR' ? 'bg-[rgba(245,166,35,0.1)] text-[#F5A623]'
                                   : 'bg-purple-500/10 text-purple-400'">
                        {{ u.role }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <span class="text-[10px] px-2 py-1 rounded-full font-bold"
                            [class]="u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400'
                                   : u.status === 'INACTIVE' ? 'bg-white/5 text-white/40'
                                   : 'bg-orange-500/10 text-orange-400'">
                        {{ u.status || 'ACTIVE' }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-[var(--bridge-text-muted)] text-xs font-mono">#{{ u.id }}</td>
                  </tr>
                  <tr *ngIf="filteredUsers.length === 0">
                    <td colspan="5" class="py-12 text-center text-[var(--bridge-text-muted)] text-sm">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="px-6 py-3 border-t border-white/5 flex items-center justify-between">
              <p class="text-xs text-[var(--bridge-text-muted)]">{{ filteredUsers.length }} utilisateur(s)</p>
            </div>
          </div>

          <!-- Payments Overview -->
          <div class="glass-card border border-[var(--bridge-border)] overflow-hidden">
            <div class="p-6 border-b border-[var(--bridge-border)]">
              <h3 class="font-syne font-bold text-lg">💰 Supervision des Paiements</h3>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Transactions récentes sur la plateforme</p>
            </div>
            <div class="p-6">
              <div *ngIf="payments.length > 0" class="space-y-2">
                <div *ngFor="let p of payments.slice(0,8)"
                     class="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p class="text-sm text-white">Formation #{{ p.formationId }} · Phase {{ p.phaseNumero }}</p>
                    <p class="text-xs text-[var(--bridge-text-muted)] font-mono">Stagiaire #{{ p.stagiaireId }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-mono font-bold text-white">{{ p.montant }} TND</p>
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          [class]="p.status === 'PAYE' ? 'bg-emerald-500/10 text-emerald-400'
                                 : p.status === 'EN_RETARD' ? 'bg-red-500/10 text-red-400'
                                 : 'bg-[rgba(245,166,35,0.1)] text-[#F5A623]'">
                      {{ p.status }}
                    </span>
                  </div>
                </div>
              </div>
              <div *ngIf="payments.length === 0" class="text-center text-[var(--bridge-text-muted)] py-8 text-sm">
                Aucun paiement enregistré
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column -->
        <div class="space-y-6">

          <!-- Enroll Student Panel -->
          <div class="glass-card border border-[rgba(245,166,35,0.3)] p-6">
            <h3 class="font-syne font-bold text-base mb-4">➕ Inscrire un Stagiaire</h3>
            <div class="space-y-3">
              <div>
                <label class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-1.5">ID Stagiaire</label>
                <input [(ngModel)]="enrollForm.studentId" type="number"
                       class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F5A623]"
                       placeholder="Ex: 12" />
              </div>
              <div>
                <label class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-1.5">ID Formation</label>
                <input [(ngModel)]="enrollForm.formationId" type="number"
                       class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F5A623]"
                       placeholder="Ex: 3" />
              </div>
              <button (click)="enrollStudent()"
                      [disabled]="!enrollForm.studentId || !enrollForm.formationId || enrollLoading"
                      class="w-full py-2.5 bg-gradient-to-r from-[#F5A623] to-[#C62761] text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-40 transition-all">
                {{ enrollSuccess ? '✓ Inscrit !' : enrollLoading ? 'Inscription...' : 'Inscrire →' }}
              </button>
              <p class="text-xs text-red-400" *ngIf="enrollError">{{ enrollError }}</p>
            </div>
          </div>

          <!-- Register Payment Panel -->
          <div class="glass-card border border-[rgba(198,39,97,0.3)] p-6">
            <h3 class="font-syne font-bold text-base mb-4">💳 Enregistrer un Paiement</h3>
            <div class="space-y-3">
              <div>
                <label class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-1.5">ID Inscription</label>
                <input [(ngModel)]="payForm.enrollmentId" type="number"
                       class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761]"
                       placeholder="Ex: 5" />
              </div>
              <div>
                <label class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-1.5">ID Phase</label>
                <input [(ngModel)]="payForm.phaseId" type="number"
                       class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761]"
                       placeholder="Ex: 1" />
              </div>
              <div>
                <label class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-1.5">Montant (TND)</label>
                <input [(ngModel)]="payForm.amount" type="number"
                       class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761]"
                       placeholder="Ex: 300" />
              </div>
              <div>
                <label class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-1.5">Méthode</label>
                <select [(ngModel)]="payForm.method"
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C62761]">
                  <option value="ESPECES">Espèces</option>
                  <option value="VIREMENT">Virement</option>
                  <option value="FLOUCI">Flouci</option>
                  <option value="PAYMEE">Paymee</option>
                </select>
              </div>
              <button (click)="registerPayment()"
                      [disabled]="!payForm.enrollmentId || !payForm.phaseId || !payForm.amount || payLoading"
                      class="w-full py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-40 transition-all">
                {{ paySuccess ? '✓ Paiement enregistré !' : payLoading ? 'Enregistrement...' : 'Valider le Paiement →' }}
              </button>
              <p class="text-xs text-red-400" *ngIf="payError">{{ payError }}</p>
            </div>
          </div>

          <!-- Platform Health -->
          <div class="glass-card border border-[var(--bridge-border)] p-6">
            <h3 class="font-syne font-bold text-base mb-4">⚡ État de la Plateforme</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs text-[var(--bridge-text-muted)]">Backend API</span>
                <span class="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Opérationnel
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-[var(--bridge-text-muted)]">WebSocket STOMP</span>
                <span class="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Connecté
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-[var(--bridge-text-muted)]">Blockchain Polygon</span>
                <span class="flex items-center gap-1.5 text-xs text-[#F5A623] font-semibold">
                  <span class="w-2 h-2 rounded-full bg-[#F5A623]"></span> Simulation
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-[var(--bridge-text-muted)]">Base de données</span>
                <span class="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> MySQL OK
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class AdminOverviewComponent implements OnInit {
  user: User | null = null;
  stats: any = null;
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  payments: any[] = [];
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  searchQuery = '';
  roleFilter = '';
  enrollForm = { studentId: null as number | null, formationId: null as number | null };
  payForm = { enrollmentId: null as number | null, phaseId: null as number | null, amount: null as number | null, method: 'ESPECES' };
  enrollLoading = false; enrollSuccess = false; enrollError = '';
  payLoading = false; paySuccess = false; payError = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private paiementService: PaiementService,
    private enrollmentService: EnrollmentService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) return;

    this.userService.getAdminStats().subscribe({ next: s => this.stats = s });
    this.userService.getAllUsers().subscribe({ next: users => { this.allUsers = users; this.filteredUsers = users; } });
    this.paiementService.getPaiementsByFormation('1').subscribe({ next: p => this.payments = p, error: () => {} });
  }

  filterUsers(): void {
    this.filteredUsers = this.allUsers.filter(u => {
      const matchRole = !this.roleFilter || u.role === this.roleFilter;
      const q = this.searchQuery.toLowerCase();
      const matchSearch = !q || u.prenom?.toLowerCase().includes(q) || u.nom?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }

  enrollStudent(): void {
    if (!this.enrollForm.studentId || !this.enrollForm.formationId) return;
    this.enrollLoading = true; this.enrollError = '';
    this.enrollmentService.enrollStudent(this.enrollForm.studentId, this.enrollForm.formationId).subscribe({
      next: () => {
        this.enrollLoading = false; this.enrollSuccess = true;
        setTimeout(() => { this.enrollSuccess = false; this.enrollForm = { studentId: null, formationId: null }; }, 2000);
      },
      error: (e: any) => { this.enrollLoading = false; this.enrollError = e?.error?.message || 'Erreur inscription'; }
    });
  }

  registerPayment(): void {
    if (!this.payForm.enrollmentId || !this.payForm.phaseId || !this.payForm.amount) return;
    this.payLoading = true; this.payError = '';
    this.paiementService.registerPayment({
      enrollmentId: this.payForm.enrollmentId,
      phaseId: this.payForm.phaseId,
      amount: this.payForm.amount,
      paymentMethod: this.payForm.method
    }).subscribe({
      next: () => {
        this.payLoading = false; this.paySuccess = true;
        setTimeout(() => { this.paySuccess = false; this.payForm = { enrollmentId: null, phaseId: null, amount: null, method: 'ESPECES' }; }, 2000);
      },
      error: (e: any) => { this.payLoading = false; this.payError = e?.error?.message || 'Erreur enregistrement'; }
    });
  }
}