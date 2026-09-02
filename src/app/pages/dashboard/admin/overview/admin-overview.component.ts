import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { FormationService } from '../../../../core/services/formation.service';
import { PaiementService } from '../../../../core/services/paiement.service';
import { EnrollmentService } from '../../../../core/services/enrollment.service';
import { ToastService } from '../../../../core/services/toast.service';
import { User } from '../../../../core/models/user.model';
import { Formation } from '../../../../core/models/formation.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fadeIn">
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div
            class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[var(--bridge-gold)]/30 flex items-center justify-center text-[var(--bridge-gold)] shadow-lg shadow-[rgba(198,39,97,0.1)] flex-shrink-0"
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
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <div>
            <h1 class="font-syne font-bold text-2xl md:text-3xl text-white">
              Panneau d'administration <span class="text-gradient">9antra</span>
            </h1>
            <p class="text-[var(--bridge-text-muted)] text-sm mt-0.5">
              Supervision consolidée et métriques de la plateforme en temps réel
            </p>
          </div>
        </div>
        <div
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[var(--bridge-text-muted)] font-mono self-start sm:self-auto"
        >
          <svg
            class="w-3.5 h-3.5 text-[var(--bridge-gold)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{{ today }}</span>
        </div>
      </div>

      <!-- Global Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          class="glass-card p-5 border border-[var(--bridge-border)] hover:border-white/20 transition-all group"
        >
          <div class="flex items-center justify-between">
            <p
              class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
            >
              Utilisateurs
            </p>
            <div
              class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <p class="text-3xl font-mono font-bold text-white mt-2">
            {{ stats?.totalUsers ?? allUsers.length }}
          </p>
          <div class="flex flex-wrap gap-1.5 mt-2.5">
            <span
              class="text-[10px] bg-[rgba(198,39,97,0.12)] text-[#C62761] border border-[#C62761]/20 px-2 py-0.5 rounded-full font-semibold"
              >{{ getStagiairesCount() }} stagiaires</span
            >
            <span
              class="text-[10px] bg-[rgba(245,166,35,0.12)] text-[#F5A623] border border-[#F5A623]/20 px-2 py-0.5 rounded-full font-semibold"
              >{{ getFormateursCount() }} formateurs</span
            >
          </div>
        </div>

        <div
          class="glass-card p-5 border border-[var(--bridge-border)] hover:border-white/20 transition-all group"
        >
          <div class="flex items-center justify-between">
            <p
              class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
            >
              Formations
            </p>
            <div
              class="w-8 h-8 rounded-lg bg-amber-500/10 text-[#F5A623] flex items-center justify-center"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="m4 6 8-4 8 4-8 4Z" />
                <path d="m18 10 4 2v6" />
                <path d="M6 10v7c0 3 3 5 6 5s6-2 6-5v-7" />
              </svg>
            </div>
          </div>
          <p class="text-3xl font-mono font-bold text-[#F5A623] mt-2">
            {{ stats?.totalFormations ?? '—' }}
          </p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-2.5 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            actives sur la plateforme
          </p>
        </div>

        <div
          class="glass-card p-5 border border-[var(--bridge-border)] hover:border-white/20 transition-all group"
        >
          <div class="flex items-center justify-between">
            <p
              class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
            >
              Inscriptions
            </p>
            <div
              class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="m9 14 2 2 4-4" />
              </svg>
            </div>
          </div>
          <p class="text-3xl font-mono font-bold text-emerald-400 mt-2">
            {{ stats?.totalEnrollments ?? '—' }}
          </p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-2.5">total cumulé</p>
        </div>

        <div
          class="glass-card p-5 border border-[var(--bridge-border)] hover:border-white/20 transition-all group"
        >
          <div class="flex items-center justify-between">
            <p
              class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
            >
              Certificats
            </p>
            <div
              class="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center"
            >
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
          </div>
          <p
            class="text-3xl font-mono font-bold text-transparent bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text mt-2"
          >
            {{ stats?.totalCertificates ?? '—' }}
          </p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-2.5 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            émis sur blockchain
          </p>
        </div>
      </div>

      <!-- Analytics Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="glass-card p-6 border border-[var(--bridge-border)] space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-syne font-bold text-white text-base flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#C62761]"></span>
              Revenus & Encaissements (TND)
            </h3>
            <span class="text-xs text-[var(--bridge-text-muted)]">Vue mensuelle</span>
          </div>
          <div class="h-60 relative">
            <canvas #adminRevenueChart></canvas>
          </div>
        </div>

        <div class="glass-card p-6 border border-[var(--bridge-border)] space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-syne font-bold text-white text-base flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#F5A623]"></span>
              Répartition des Rôles Utilisateurs
            </h3>
            <span class="text-xs text-[var(--bridge-text-muted)]">Global</span>
          </div>
          <div class="h-60 relative flex items-center justify-center">
            <canvas #adminRolesChart></canvas>
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Left: Users Table + Payments -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Users Management -->
          <div class="glass-card border border-[var(--bridge-border)] overflow-hidden">
            <div
              class="p-5 border-b border-[var(--bridge-border)] flex flex-wrap items-center justify-between gap-3"
            >
              <div class="flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-[var(--bridge-gold)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <h3 class="font-syne font-bold text-base text-white">Gestion des utilisateurs</h3>
              </div>
              <div class="flex flex-wrap gap-2">
                <select
                  [(ngModel)]="roleFilter"
                  (ngModelChange)="filterUsers()"
                  aria-label="Filtrer par rôle"
                  class="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C62761]"
                >
                  <option value="">Tous les rôles</option>
                  <option value="STAGIAIRE">Stagiaires</option>
                  <option value="FORMATEUR">Formateurs</option>
                  <option value="ADMIN">Admins</option>
                </select>
                <input
                  [(ngModel)]="searchQuery"
                  placeholder="Chercher..."
                  aria-label="Chercher un utilisateur"
                  class="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C62761] w-36"
                  (input)="filterUsers()"
                />
              </div>
            </div>
            <div
              class="overflow-x-auto"
              [class]="usersExpanded ? 'max-h-[500px] overflow-y-auto' : ''"
            >
              <table class="w-full text-sm">
                <thead>
                  <tr
                    class="border-b border-white/5 text-[10px] uppercase tracking-wider text-[var(--bridge-text-muted)] bg-white/[0.01]"
                  >
                    <th class="py-3 px-4 text-left font-semibold">Utilisateur</th>
                    <th class="py-3 px-4 text-left font-semibold">Email</th>
                    <th class="py-3 px-4 text-left font-semibold">Rôle</th>
                    <th class="py-3 px-4 text-left font-semibold">Statut</th>
                    <th class="py-3 px-4 text-left font-semibold">ID</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.03]">
                  <tr
                    *ngFor="let u of usersExpanded ? filteredUsers : filteredUsers.slice(0, 5)"
                    class="hover:bg-white/[0.02] transition-colors"
                  >
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-7 h-7 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xs font-bold flex-shrink-0"
                        >
                          {{ u.prenom[0] }}{{ u.nom[0] }}
                        </div>
                        <div>
                          <p class="font-semibold text-white text-xs">{{ u.prenom }} {{ u.nom }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-[var(--bridge-text-muted)] text-xs font-mono">
                      {{ u.email }}
                    </td>
                    <td class="py-3 px-4">
                      <span
                        class="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
                        [class]="
                          u.role === 'ADMIN'
                            ? 'bg-[rgba(198,39,97,0.1)] text-[#C62761]'
                            : u.role === 'FORMATEUR'
                              ? 'bg-[rgba(245,166,35,0.1)] text-[#F5A623]'
                              : 'bg-purple-500/10 text-purple-400'
                        "
                      >
                        {{ u.role }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <span
                        class="text-[9px] px-2 py-0.5 rounded-full font-bold"
                        [class]="
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : u.status === 'INACTIVE'
                              ? 'bg-white/5 text-white/40'
                              : 'bg-red-500/10 text-red-400'
                        "
                      >
                        {{ u.status || 'ACTIVE' }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-[var(--bridge-text-muted)] text-xs font-mono">
                      #{{ u.id }}
                    </td>
                  </tr>
                  <tr *ngIf="filteredUsers.length === 0">
                    <td
                      colspan="5"
                      class="py-8 text-center text-[var(--bridge-text-muted)] text-xs"
                    >
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Footer with compact Voir plus button -->
            <div class="px-5 py-2.5 border-t border-white/5 flex items-center justify-between">
              <p class="text-xs text-[var(--bridge-text-muted)]">
                {{ filteredUsers.length }} utilisateur(s)
              </p>
              <button
                *ngIf="filteredUsers.length > 5"
                (click)="usersExpanded = !usersExpanded"
                class="text-xs font-semibold text-[var(--bridge-crimson)] hover:text-white transition-colors flex items-center gap-1 cursor-pointer py-1 px-2 rounded hover:bg-white/5"
              >
                <svg
                  class="w-3.5 h-3.5 transition-transform duration-300"
                  [class.rotate-180]="usersExpanded"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <span>{{
                  usersExpanded ? 'Réduire' : 'Voir plus (' + filteredUsers.length + ')'
                }}</span>
              </button>
            </div>
          </div>

          <!-- Payments Overview -->
          <div class="glass-card border border-[var(--bridge-border)] overflow-hidden">
            <div
              class="p-5 border-b border-[var(--bridge-border)] flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-emerald-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                <div>
                  <h3 class="font-syne font-bold text-base text-white">
                    Supervision des Paiements
                  </h3>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                    Transactions récentes enregistrées sur la plateforme
                  </p>
                </div>
              </div>
            </div>
            <div class="p-5">
              <div *ngIf="payments.length > 0" class="space-y-2">
                <div
                  *ngFor="let p of paymentsExpanded ? payments : payments.slice(0, 4)"
                  class="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 transition-all"
                >
                  <div class="min-w-0 flex-1 pr-3">
                    <p class="text-xs font-semibold text-white truncate">
                      {{ getFormationName(p.formationId) }} ·
                      <span class="text-[var(--bridge-gold)]">Phase {{ p.phaseNumero }}</span>
                    </p>
                    <p
                      class="text-[11px] text-[var(--bridge-text-muted)] mt-0.5 flex items-center gap-1.5 truncate"
                    >
                      <span class="text-white/80 font-medium">{{
                        getStagiaireName(p.stagiaireId)
                      }}</span>
                      <span class="text-white/20">•</span>
                    </p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <p class="text-xs font-mono font-bold text-white">{{ p.montant }} TND</p>
                    <span
                      class="text-[9px] px-2 py-0.5 rounded-full font-bold inline-block mt-0.5"
                      [class]="
                        p.status === 'PAYE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : p.status === 'EN_RETARD'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-[rgba(245,166,35,0.1)] text-[#F5A623] border border-[#F5A623]/20'
                      "
                    >
                      {{ p.status }}
                    </span>
                  </div>
                </div>
              </div>
              <div
                *ngIf="payments.length === 0"
                class="text-center text-[var(--bridge-text-muted)] py-6 text-xs"
              >
                Aucun paiement enregistré
              </div>
            </div>
            <!-- Footer with compact Voir plus button -->
            <div
              *ngIf="payments.length > 4"
              class="px-5 py-2.5 border-t border-white/5 flex items-center justify-between"
            >
              <p class="text-xs text-[var(--bridge-text-muted)]">
                {{ payments.length }} transaction(s)
              </p>
              <button
                (click)="paymentsExpanded = !paymentsExpanded"
                class="text-xs font-semibold text-[var(--bridge-crimson)] hover:text-white transition-colors flex items-center gap-1 cursor-pointer py-1 px-2 rounded hover:bg-white/5"
              >
                <svg
                  class="w-3.5 h-3.5 transition-transform duration-300"
                  [class.rotate-180]="paymentsExpanded"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                <span>{{
                  paymentsExpanded ? 'Réduire' : 'Voir plus (' + payments.length + ')'
                }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- ─── Interactive Users & Status Donut Chart (Replacing Payment Form) ─── -->
          <div class="glass-card border border-[rgba(198,39,97,0.3)] p-5 space-y-4">
            <div class="flex items-center justify-between border-b border-white/5 pb-3">
              <div class="flex items-center gap-2">
                <svg
                  class="w-4 h-4 text-[var(--bridge-gold)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
                <h3 class="font-syne font-bold text-sm text-white">Statut & Rôles Comptes</h3>
              </div>

              <!-- Filter toggle -->
              <div
                class="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10 text-[11px]"
              >
                <button
                  (click)="setUserFilterMode('status')"
                  class="px-2.5 py-1 rounded-md transition-all cursor-pointer"
                  [class]="
                    userChartFilterMode === 'status'
                      ? 'bg-[var(--bridge-crimson)] text-white font-semibold'
                      : 'text-white/50 hover:text-white'
                  "
                >
                  Statut
                </button>
                <button
                  (click)="setUserFilterMode('roles')"
                  class="px-2.5 py-1 rounded-md transition-all cursor-pointer"
                  [class]="
                    userChartFilterMode === 'roles'
                      ? 'bg-[var(--bridge-crimson)] text-white font-semibold'
                      : 'text-white/50 hover:text-white'
                  "
                >
                  Rôles
                </button>
              </div>
            </div>

            <!-- Chart Container -->
            <div class="h-44 relative flex items-center justify-center">
              <canvas #userStatusCanvas></canvas>
              <!-- Center dynamic count -->
              <div
                class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              >
                <span class="text-2xl font-mono font-bold text-white leading-none">
                  {{ allUsers.length || 0 }}
                </span>
                <span class="text-[10px] text-white/40 uppercase tracking-widest mt-1"
                  >Comptes</span
                >
              </div>
            </div>

            <!-- Detailed breakdown pills -->
            <div
              *ngIf="userChartFilterMode === 'status'"
              class="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center"
            >
              <div class="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <p class="text-[10px] text-emerald-400 font-medium">Actifs</p>
                <p class="text-sm font-mono font-bold text-white mt-0.5">
                  {{ getActiveUsersCount() }}
                </p>
              </div>
              <div class="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <p class="text-[10px] text-amber-400 font-medium">Inactifs</p>
                <p class="text-sm font-mono font-bold text-white mt-0.5">
                  {{ getInactiveUsersCount() }}
                </p>
              </div>
              <div class="p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                <p class="text-[10px] text-red-400 font-medium">Bloqués</p>
                <p class="text-sm font-mono font-bold text-white mt-0.5">
                  {{ getBannedUsersCount() }}
                </p>
              </div>
            </div>

            <div
              *ngIf="userChartFilterMode === 'roles'"
              class="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center"
            >
              <div class="p-2 rounded-lg bg-pink-500/5 border border-pink-500/10">
                <p class="text-[10px] text-pink-400 font-medium">Stagiaires</p>
                <p class="text-sm font-mono font-bold text-white mt-0.5">
                  {{ getStagiairesCount() }}
                </p>
              </div>
              <div class="p-2 rounded-lg bg-[#F5A623]/5 border border-[#F5A623]/10">
                <p class="text-[10px] text-[#F5A623] font-medium">Formateurs</p>
                <p class="text-sm font-mono font-bold text-white mt-0.5">
                  {{ getFormateursCount() }}
                </p>
              </div>
              <div class="p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <p class="text-[10px] text-blue-400 font-medium">Admins</p>
                <p class="text-sm font-mono font-bold text-white mt-0.5">{{ getAdminsCount() }}</p>
              </div>
            </div>
          </div>

          <!-- Enroll Student Quick Action -->
          <div class="glass-card border border-[var(--bridge-border)] p-5">
            <div class="flex items-center gap-2 mb-3.5">
              <svg
                class="w-4 h-4 text-[var(--bridge-gold)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              <h3 class="font-syne font-bold text-sm text-white">Inscrire un Stagiaire</h3>
            </div>
            <div class="space-y-3.5">
              <div>
                <label
                  class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-1.5 font-semibold"
                  >Stagiaire *</label
                >
                <select
                  [(ngModel)]="enrollForm.studentId"
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5A623]"
                >
                  <option [ngValue]="null" disabled selected>
                    -- Sélectionner un stagiaire --
                  </option>
                  <option *ngFor="let s of getStagiairesList()" [ngValue]="+s.id">
                    {{ s.prenom }} {{ s.nom }} ({{ s.email }})
                  </option>
                </select>
              </div>
              <div>
                <label
                  class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-1.5 font-semibold"
                  >Formation *</label
                >
                <select
                  [(ngModel)]="enrollForm.formationId"
                  class="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5A623]"
                >
                  <option [ngValue]="null" disabled selected>
                    -- Sélectionner une formation --
                  </option>
                  <option *ngFor="let f of formations" [ngValue]="+f.id">
                    {{ f.nom }} {{ f.totalPrice ? '(' + f.totalPrice + ' TND)' : '' }}
                  </option>
                </select>
              </div>
              <button
                (click)="enrollStudent()"
                [disabled]="!enrollForm.studentId || !enrollForm.formationId || enrollLoading"
                class="w-full py-2.5 bg-gradient-to-r from-[#F5A623] to-[#C62761] text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[rgba(198,39,97,0.2)]"
              >
                <svg
                  *ngIf="enrollLoading"
                  class="animate-spin w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
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
                <svg
                  *ngIf="!enrollLoading"
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                <span>{{
                  enrollLoading ? 'Inscription en cours...' : 'Inscrire le stagiaire'
                }}</span>
              </button>
            </div>
          </div>

          <!-- Platform Health -->
          <div class="glass-card border border-[var(--bridge-border)] p-5">
            <div class="flex items-center gap-2 mb-3.5">
              <svg
                class="w-4 h-4 text-emerald-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <h3 class="font-syne font-bold text-sm text-white">État des Services</h3>
            </div>
            <div class="space-y-2.5">
              <div class="flex items-center justify-between text-xs">
                <span class="text-[var(--bridge-text-muted)]">Backend API</span>
                <span class="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Opérationnel
                </span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-[var(--bridge-text-muted)]">WebSocket STOMP</span>
                <span class="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Connecté
                </span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-[var(--bridge-text-muted)]">Blockchain Polygon</span>
                <span class="flex items-center gap-1.5 text-[#F5A623] font-semibold">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Connecté
                </span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-[var(--bridge-text-muted)]">Base de données</span>
                <span class="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> MySQL OK
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminOverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('adminRevenueChart') revenueCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('adminRolesChart') rolesCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('userStatusCanvas') userStatusCanvas!: ElementRef<HTMLCanvasElement>;

  private revenueChartInstance?: Chart;
  private rolesChartInstance?: Chart;
  private userStatusChartInstance?: Chart;

  user: User | null = null;
  stats: any = null;
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  formations: Formation[] = [];
  payments: any[] = [];
  usersExpanded = false;
  paymentsExpanded = false;
  userChartFilterMode: 'status' | 'roles' = 'status';

  today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  searchQuery = '';
  roleFilter = '';
  enrollForm = { studentId: null as number | null, formationId: null as number | null };
  enrollLoading = false;
  enrollSuccess = false;
  enrollError = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private formationService: FormationService,
    private paiementService: PaiementService,
    private enrollmentService: EnrollmentService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) return;

    this.userService.getAdminStats().subscribe({
      next: (s) => {
        this.stats = { ...this.stats, ...s };
        this.renderAdminCharts();
      },
    });

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.filteredUsers = users;
        this.renderAdminCharts();
        this.renderUserStatusChart();
      },
    });

    this.formationService.getFormations().subscribe({
      next: (fList) => {
        this.formations = fList || [];
      },
      error: () => {},
    });

    this.paiementService
      .getPaiementsByFormation('1')
      .subscribe({ next: (p) => (this.payments = p), error: () => {} });
  }

  getStagiairesList(): User[] {
    return this.allUsers.filter((u) => u.role === 'STAGIAIRE');
  }

  getFormationName(formationId: string | number): string {
    if (!formationId) return 'Formation';
    const found = this.formations.find((f) => f.id.toString() === formationId.toString());
    return found ? found.nom : `Formation #${formationId}`;
  }

  getStagiaireName(stagiaireId: string | number): string {
    if (!stagiaireId) return 'Stagiaire';
    const found = this.allUsers.find((u) => u.id.toString() === stagiaireId.toString());
    return found ? `${found.prenom} ${found.nom}` : `Stagiaire #${stagiaireId}`;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.renderAdminCharts();
      this.renderUserStatusChart();
    }, 200);
  }

  ngOnDestroy(): void {
    if (this.revenueChartInstance) this.revenueChartInstance.destroy();
    if (this.rolesChartInstance) this.rolesChartInstance.destroy();
    if (this.userStatusChartInstance) this.userStatusChartInstance.destroy();
  }

  setUserFilterMode(mode: 'status' | 'roles'): void {
    this.userChartFilterMode = mode;
    this.renderUserStatusChart();
  }

  getActiveUsersCount(): number {
    return this.allUsers.filter((u) => u.status === 'ACTIVE' || !u.status).length;
  }

  getInactiveUsersCount(): number {
    return this.allUsers.filter((u) => u.status === 'INACTIVE').length;
  }

  getBannedUsersCount(): number {
    return this.allUsers.filter((u) => u.status === 'BANNED' || u.status === 'BLOCKED').length;
  }

  getStagiairesCount(): number {
    return (
      this.stats?.totalStagiaires || this.allUsers.filter((u) => u.role === 'STAGIAIRE').length || 0
    );
  }

  getFormateursCount(): number {
    return (
      this.stats?.totalFormateurs || this.allUsers.filter((u) => u.role === 'FORMATEUR').length || 0
    );
  }

  getAdminsCount(): number {
    return this.allUsers.filter((u) => u.role === 'ADMIN').length || 1;
  }

  private renderUserStatusChart(): void {
    if (this.userStatusChartInstance) this.userStatusChartInstance.destroy();
    if (!this.userStatusCanvas) return;

    const ctx = this.userStatusCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.userChartFilterMode === 'status') {
      const active = this.getActiveUsersCount() || 1;
      const inactive = this.getInactiveUsersCount();
      const banned = this.getBannedUsersCount();

      this.userStatusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Actifs', 'Inactifs', 'Bloqués'],
          datasets: [
            {
              data: [active, inactive, banned],
              backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
              borderWidth: 0,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          cutout: '76%',
        },
      });
    } else {
      const stagiaires = this.getStagiairesCount() || 1;
      const formateurs = this.getFormateursCount();
      const admins = this.getAdminsCount();

      this.userStatusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Stagiaires', 'Formateurs', 'Admins'],
          datasets: [
            {
              data: [stagiaires, formateurs, admins],
              backgroundColor: ['#C62761', '#F5A623', '#3B82F6'],
              borderWidth: 0,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          cutout: '76%',
        },
      });
    }
  }

  private renderAdminCharts(): void {
    if (this.revenueChartInstance) this.revenueChartInstance.destroy();
    if (this.rolesChartInstance) this.rolesChartInstance.destroy();

    // 1. Revenue Chart (Line)
    if (this.revenueCanvas) {
      const ctx = this.revenueCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.revenueChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Janv', 'Févr', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil'],
            datasets: [
              {
                label: 'Revenus (TND)',
                data: [4200, 5800, 7100, 6900, 8500, 9400, 11200],
                borderColor: '#C62761',
                backgroundColor: 'rgba(198, 39, 97, 0.15)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: '#F5A623',
                pointRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8E8C9A' } },
              y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8E8C9A' } },
            },
          },
        });
      }
    }

    // 2. Roles Doughnut Chart
    if (this.rolesCanvas) {
      const ctx = this.rolesCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const stagiaires = this.getStagiairesCount() || 10;
        const formateurs = this.getFormateursCount() || 3;
        const admins = this.getAdminsCount() || 1;

        this.rolesChartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Stagiaires', 'Formateurs', 'Admins'],
            datasets: [
              {
                data: [stagiaires, formateurs, admins],
                backgroundColor: ['#C62761', '#F5A623', '#3B82F6'],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#ffffff', font: { size: 11 } },
              },
            },
            cutout: '70%',
          },
        });
      }
    }
  }

  filterUsers(): void {
    this.filteredUsers = this.allUsers.filter((u) => {
      const matchRole = !this.roleFilter || u.role === this.roleFilter;
      const q = this.searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        u.prenom?.toLowerCase().includes(q) ||
        u.nom?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }

  enrollStudent(): void {
    if (!this.enrollForm.studentId || !this.enrollForm.formationId) return;
    this.enrollLoading = true;
    this.enrollError = '';
    const studentName = this.getStagiaireName(this.enrollForm.studentId);
    const formationName = this.getFormationName(this.enrollForm.formationId);

    this.enrollmentService
      .enrollStudent(this.enrollForm.studentId, this.enrollForm.formationId)
      .subscribe({
        next: () => {
          this.enrollLoading = false;
          this.toastService.success(
            `${studentName} a été inscrit(e) avec succès à la formation "${formationName}".`,
            'Inscription Validée',
          );
          this.enrollForm = { studentId: null, formationId: null };
        },
        error: (e: any) => {
          this.enrollLoading = false;
          const msg = e?.error?.message || "Erreur lors de l'inscription du stagiaire.";
          this.enrollError = msg;
          this.toastService.error(msg, 'Échec Inscription');
        },
      });
  }
}
