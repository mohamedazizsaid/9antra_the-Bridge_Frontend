import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { UserService } from '../../../../core/services/user.service';
import { FormationService } from '../../../../core/services/formation.service';
import { Formation } from '../../../../core/models/formation.model';

@Component({
  selector: 'app-admin-formateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <!-- ─── Sliding Container ─── -->
      <div class="relative overflow-hidden w-full">
        <div
          class="flex transition-transform duration-500 ease-in-out w-full items-start"
          [style.transform]="showAddForm ? 'translateX(-100%)' : 'translateX(0%)'"
        >
          <!-- ─── PANEL 1: LIST VIEW & STATS BREAKDOWN ─── -->
          <div class="w-full flex-shrink-0 min-w-full space-y-6">
            <!-- Header List -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[var(--bridge-gold)]/30 flex items-center justify-center text-[var(--bridge-gold)]"
                  >
                    <svg
                      class="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  <h1 class="font-syne font-bold text-2xl text-white">Formateurs & Pédagogie</h1>
                </div>
                <p class="text-[var(--bridge-text-muted)] text-sm mt-1">
                  Gestion des comptes formateurs et supervision de leurs formations assignées
                </p>
              </div>
              <button
                (click)="openAddForm()"
                class="bridge-btn-primary px-4 py-2.5 text-sm flex items-center justify-center gap-2 group cursor-pointer"
              >
                <svg
                  class="w-4 h-4 transition-transform group-hover:rotate-90 duration-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Ajouter un formateur</span>
              </button>
            </div>

            <!-- Top Summary KPI Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bridge-card p-4 text-center">
                <p class="text-2xl font-bold font-mono text-white">{{ formateurs.length }}</p>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Total formateurs</p>
              </div>
              <div class="bridge-card p-4 text-center">
                <p class="text-2xl font-bold font-mono text-emerald-400">
                  {{ getActiveFormateursCount() }}
                </p>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Comptes actifs</p>
              </div>
              <div class="bridge-card p-4 text-center">
                <p class="text-2xl font-bold font-mono text-[var(--bridge-gold)]">
                  {{ formations.length }}
                </p>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-1">Total formations</p>
              </div>
              <div class="bridge-card p-4 text-center">
                <p class="text-2xl font-bold font-mono text-purple-400">
                  {{ getAssignedRatio() }}%
                </p>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-1">
                  Formateurs actifs avec cours
                </p>
              </div>
            </div>

            <!-- 2-Column Layout: List (Left) + Stats Formateurs (Right) -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <!-- Left Column: Formateurs List -->
              <div class="lg:col-span-7 space-y-4">
                <div class="bridge-card overflow-hidden">
                  <div
                    class="px-5 py-4 border-b border-[var(--bridge-border)] flex items-center justify-between"
                  >
                    <div class="flex items-center gap-2">
                      <svg
                        class="w-4 h-4 text-[var(--bridge-gold)]"
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
                      <h3 class="font-semibold text-white text-sm">
                        Liste des formateurs ({{ formateurs.length }})
                      </h3>
                    </div>
                  </div>
                  <div [class]="expanded ? '' : 'max-h-[500px] overflow-y-auto'">
                    <div class="divide-y divide-white/5">
                      <div
                        *ngFor="let f of formateurs"
                        class="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-all group"
                      >
                        <div class="flex items-center gap-3.5 min-w-0 pr-3">
                          <div
                            class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center font-bold text-xs text-white border border-white/10 flex-shrink-0 overflow-hidden"
                          >
                            <img
                              *ngIf="f.avatar"
                              [src]="f.avatar"
                              class="w-full h-full object-cover"
                              alt="Avatar formateur"
                              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
                            />
                            <span
                              [style.display]="f.avatar ? 'none' : 'flex'"
                              class="items-center justify-center w-full h-full"
                            >
                              {{ (f.prenom?.[0] || 'F') + (f.nom?.[0] || 'T') }}
                            </span>
                          </div>
                          <div class="min-w-0">
                            <p
                              class="text-sm font-semibold text-white group-hover:text-[var(--bridge-gold)] transition-colors truncate"
                            >
                              {{ f.prenom }} {{ f.nom }}
                            </p>
                            <p
                              class="text-xs text-[var(--bridge-text-muted)] flex items-center gap-1.5 mt-0.5 truncate"
                            >
                              <span>{{ f.email }}</span>
                            </p>
                          </div>
                        </div>

                        <div class="flex items-center gap-2.5 flex-shrink-0">
                          <span
                            class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(245,166,35,0.1)] text-[#F5A623] border border-[#F5A623]/20"
                          >
                            {{ getFormationCount(f) }} formation(s)
                          </span>
                          <span
                            [class]="
                              f.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            "
                            class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                            >{{ f.status }}</span
                          >
                        </div>
                      </div>
                      <div
                        *ngIf="formateurs.length === 0"
                        class="text-center py-14 text-[var(--bridge-text-muted)]"
                      >
                        <p class="text-sm">Aucun formateur trouvé</p>
                      </div>
                    </div>
                  </div>
                  <div
                    *ngIf="formateurs.length > 5"
                    class="px-5 py-3 border-t border-[var(--bridge-border)]"
                  >
                    <button
                      (click)="expanded = !expanded"
                      class="text-xs text-[var(--bridge-crimson)] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <svg
                        class="w-3.5 h-3.5 transition-transform duration-300"
                        [class.rotate-180]="expanded"
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
                        expanded
                          ? 'Réduire la liste'
                          : 'Voir tous les formateurs (' + formateurs.length + ')'
                      }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Right Column: Formateurs & Formations Distribution Statistics -->
              <div class="lg:col-span-5 space-y-4">
                <div class="bridge-card p-5">
                  <div
                    class="flex items-center justify-between pb-3.5 border-b border-[var(--bridge-border)] mb-4"
                  >
                    <div class="flex items-center gap-2">
                      <svg
                        class="w-4 h-4 text-[var(--bridge-crimson)]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                        />
                        <line x1="12" y1="11" x2="12" y2="17" />
                        <line x1="9" y1="14" x2="15" y2="14" />
                      </svg>
                      <h3 class="font-semibold text-white text-sm">Formations par Formateur</h3>
                    </div>
                    <span class="text-[10px] text-[var(--bridge-text-muted)] font-mono">
                      {{ formations.length }} au total
                    </span>
                  </div>

                  <div class="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                    <div
                      *ngFor="let f of formateurs"
                      class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all space-y-2"
                    >
                      <div class="flex items-center justify-between">
                        <p class="text-xs font-semibold text-white truncate">
                          {{ f.prenom }} {{ f.nom }}
                        </p>
                        <span class="text-[10px] font-bold font-mono text-[var(--bridge-gold)]">
                          {{ getFormationCount(f) }} formation(s)
                        </span>
                      </div>

                      <!-- Progress / Load Bar -->
                      <div class="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          class="h-full rounded-full bg-gradient-to-r from-[#C62761] to-[#F5A623] transition-all duration-500"
                          [style.width]="getFormateurPercentage(f) + '%'"
                        ></div>
                      </div>

                      <!-- List of specific formation titles -->
                      <div class="pt-1">
                        <div
                          *ngIf="getFormationsForFormateur(f).length > 0"
                          class="flex flex-wrap gap-1.5"
                        >
                          <span
                            *ngFor="let form of getFormationsForFormateur(f)"
                            class="text-[9px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/80 font-medium truncate max-w-full"
                          >
                            📖 {{ form.nom }}
                          </span>
                        </div>
                        <div
                          *ngIf="getFormationsForFormateur(f).length === 0"
                          class="text-[10px] text-[var(--bridge-text-muted)] italic"
                        >
                          Aucune formation assignée pour le moment
                        </div>
                      </div>
                    </div>

                    <div
                      *ngIf="formateurs.length === 0"
                      class="text-center py-8 text-xs text-[var(--bridge-text-muted)]"
                    >
                      Aucune statistique disponible
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ─── PANEL 2: ADD FORMATEUR VIEW ─── -->
          <div class="w-full flex-shrink-0 min-w-full space-y-6">
            <!-- Header with Back Button -->
            <div class="flex items-center justify-between">
              <button
                (click)="closeAddForm()"
                class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer group"
              >
                <svg
                  class="w-4 h-4 transition-transform group-hover:-translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Retour à la liste</span>
              </button>

              <span class="text-xs text-[var(--bridge-gold)] uppercase font-bold tracking-widest">
                Nouveau Compte
              </span>
            </div>

            <!-- Create Card -->
            <div class="bridge-card overflow-hidden">
              <!-- Accent bar -->
              <div class="h-1 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623]"></div>
              <!-- Header -->
              <div
                class="flex items-center justify-between px-6 py-4 border-b border-[var(--bridge-border)]"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-white flex-shrink-0 shadow-md"
                  >
                    <svg
                      class="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-syne font-bold text-white text-base leading-tight">
                      Créer un compte formateur
                    </h3>
                    <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                      Remplissez les informations du formateur pour générer ses accès
                    </p>
                  </div>
                </div>
                <button
                  (click)="closeAddForm()"
                  aria-label="Fermer le formulaire"
                  class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/5 text-sm cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <!-- Form body -->
              <div class="p-6 space-y-5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      class="block text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-2"
                      >Prénom *</label
                    >
                    <div class="relative">
                      <span
                        class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 flex items-center pointer-events-none z-10"
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
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <input
                        [(ngModel)]="newFormateur.firstName"
                        placeholder="Ex: Sonia"
                        class="bridge-input bridge-input-icon w-full text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      class="block text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-2"
                      >Nom *</label
                    >
                    <div class="relative">
                      <span
                        class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 flex items-center pointer-events-none z-10"
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
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <input
                        [(ngModel)]="newFormateur.lastName"
                        placeholder="Ex: Belhadj"
                        class="bridge-input bridge-input-icon w-full text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    class="block text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-2"
                    >Email professionnel *</label
                  >
                  <div class="relative">
                    <span
                      class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 flex items-center pointer-events-none z-10"
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
                      [(ngModel)]="newFormateur.email"
                      type="email"
                      placeholder="formateur@9antra.tn"
                      class="bridge-input bridge-input-icon w-full text-sm"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      class="block text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-2"
                      >Téléphone</label
                    >
                    <div class="relative">
                      <span
                        class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 flex items-center pointer-events-none z-10"
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
                          <path
                            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                          />
                        </svg>
                      </span>
                      <input
                        [(ngModel)]="newFormateur.phone"
                        placeholder="+216 xx xxx xxx"
                        class="bridge-input bridge-input-icon w-full text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      class="block text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-2"
                      >Âge</label
                    >
                    <div class="relative">
                      <span
                        class="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 flex items-center pointer-events-none z-10"
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
                          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </span>
                      <input
                        [(ngModel)]="newFormateur.age"
                        type="number"
                        placeholder="Ex: 35"
                        class="bridge-input bridge-input-icon w-full text-sm"
                      />
                    </div>
                  </div>
                </div>

                <!-- Notice -->
                <div
                  class="flex items-start gap-3 bg-amber-500/[0.08] border border-amber-500/20 rounded-xl p-4"
                >
                  <svg
                    class="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
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
                  <p class="text-xs text-amber-300/90 leading-relaxed">
                    Un email automatique sera envoyé à l'adresse indiquée avec son mot de passe
                    temporaire et ses instructions d'accès.
                  </p>
                </div>

                <!-- Feedback -->
                <div
                  *ngIf="createError"
                  class="p-3.5 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5"
                  role="alert"
                >
                  <svg
                    class="w-4 h-4 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <span>{{ createError }}</span>
                </div>

                <div
                  *ngIf="createSuccess"
                  class="p-3.5 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5"
                  role="status"
                >
                  <svg
                    class="w-4 h-4 flex-shrink-0 text-emerald-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>{{ createSuccess }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-4 px-6 py-4 border-t border-[var(--bridge-border)]">
                <button
                  type="button"
                  (click)="closeAddForm()"
                  class="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-semibold text-sm rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  <span>Retour</span>
                </button>
                <button
                  type="button"
                  (click)="createFormateur()"
                  [disabled]="
                    creating ||
                    !newFormateur.firstName ||
                    !newFormateur.lastName ||
                    !newFormateur.email
                  "
                  class="flex-[2] py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(198,39,97,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <svg
                    *ngIf="creating"
                    class="animate-spin w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
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
                  <span>{{ creating ? 'Création en cours...' : 'Créer et envoyer email' }}</span>
                  <svg
                    *ngIf="!creating"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminFormateursComponent implements OnInit {
  formateurs: any[] = [];
  formations: Formation[] = [];
  showAddForm = false;
  creating = false;
  expanded = false;
  createError = '';
  createSuccess = '';
  newFormateur: any = { firstName: '', lastName: '', email: '', phone: '', age: 30 };

  constructor(
    private adminService: AdminService,
    private userService: UserService,
    private formationService: FormationService,
  ) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.formateurs = users.filter((u) => u.role === 'FORMATEUR');
      },
    });

    this.formationService.getFormations().subscribe({
      next: (data) => {
        this.formations = data || [];
      },
    });
  }

  getFormationsForFormateur(f: any): Formation[] {
    if (!f || !this.formations || this.formations.length === 0) return [];
    const fId = f.id ? f.id.toString() : '';
    const fFullName = `${f.prenom || f.firstName || ''} ${f.nom || f.lastName || ''}`
      .trim()
      .toLowerCase();

    return this.formations.filter((form) => {
      const matchId = form.formateurId && form.formateurId.toString() === fId;
      const matchName = form.formateurNom && form.formateurNom.trim().toLowerCase() === fFullName;
      return matchId || matchName;
    });
  }

  getFormationCount(f: any): number {
    return this.getFormationsForFormateur(f).length;
  }

  getFormateurPercentage(f: any): number {
    if (!this.formations || this.formations.length === 0) return 0;
    const count = this.getFormationCount(f);
    return Math.min(100, Math.round((count / this.formations.length) * 100));
  }

  getActiveFormateursCount(): number {
    return this.formateurs.filter((f) => f.status === 'ACTIVE').length;
  }

  getAssignedRatio(): number {
    if (!this.formateurs || this.formateurs.length === 0) return 0;
    const withFormations = this.formateurs.filter((f) => this.getFormationCount(f) > 0).length;
    return Math.round((withFormations / this.formateurs.length) * 100);
  }

  openAddForm(): void {
    this.createError = '';
    this.createSuccess = '';
    this.showAddForm = true;
  }

  closeAddForm(): void {
    this.showAddForm = false;
    this.createError = '';
    this.createSuccess = '';
  }

  createFormateur(): void {
    this.creating = true;
    this.createError = '';
    this.adminService.createFormateur(this.newFormateur).subscribe({
      next: (result) => {
        this.creating = false;
        this.createSuccess = `Formateur ${result.firstName} ${result.lastName} créé avec succès ! Email envoyé.`;
        this.formateurs.unshift({
          id: result.id,
          prenom: result.firstName,
          nom: result.lastName,
          email: result.email,
          status: 'ACTIVE',
          dateInscription: new Date(),
        });
        this.newFormateur = { firstName: '', lastName: '', email: '', phone: '', age: 30 };
        setTimeout(() => {
          this.closeAddForm();
        }, 1800);
      },
      error: (e) => {
        this.creating = false;
        this.createError = e?.error?.message || 'Erreur lors de la création';
      },
    });
  }
}
