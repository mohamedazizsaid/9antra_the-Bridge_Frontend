import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormationService } from '../../../core/services/formation.service';
import { AuthService } from '../../../core/services/auth.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { ToastService } from '../../../core/services/toast.service';
import { Formation } from '../../../core/models/formation.model';
import { User } from '../../../core/models/user.model';
import { EnrollmentStepperComponent } from './enrollment-stepper.component';
import { ComboParcoursComponent } from './combo-parcours.component';
import { ComboFormateurComponent } from './combo-formateur.component';
import { ComboAdminComponent } from './combo-admin.component';
import { ComboEnrollmentService } from '../../../core/services/combo-enrollment.service';
import { ComboEnrollment, ComboFormationItem } from '../../../core/models/combo-enrollment.model';
import { PaiementService } from '../../../core/services/paiement.service';
import { Paiement } from '../../../core/models/paiement.model';

@Component({
  selector: 'app-formations-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    EnrollmentStepperComponent,
    ComboParcoursComponent,
    ComboFormateurComponent,
    ComboAdminComponent,
  ],
  template: `
    <div class="space-y-8 animate-fadein">
      <!-- ─── Header Synchronisé ─── -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div
            class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[var(--bridge-gold)]/30 flex items-center justify-center text-[var(--bridge-gold)] shadow-lg"
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
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
            </svg>
          </div>
          <div>
            <h1 class="font-syne font-bold text-2xl md:text-3xl text-white">
              {{
                isAdmin
                  ? 'Gestion des Formations'
                  : isStagiaire
                    ? 'Catalogue & Mes Formations'
                    : 'Mes Programmes de Formation'
              }}
            </h1>
            <p class="text-[var(--bridge-text-muted)] text-sm mt-0.5">
              {{
                isAdmin
                  ? 'Supervision des cursus, phases pédagogiques et inscriptions'
                  : isStagiaire
                    ? 'Inscrivez-vous aux programmes disponibles et accédez à vos cursus en cours'
                    : 'Consultez vos programmes assignés et le suivi de vos apprenants'
              }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <!-- ─── STAGIAIRE : Personnaliser votre parcours ─── -->
          <button
            *ngIf="isStagiaire"
            (click)="openComboParcours()"
            id="btn-combo-parcours"
            class="bridge-btn-primary px-4 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <svg
              class="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"
              />
            </svg>
            <span>Personnaliser votre parcours</span>
          </button>

          <!-- ─── STAGIAIRE : Mes Combos (avec statut de paiement) ─── -->
          <button
            *ngIf="isStagiaire"
            (click)="stagiaireViewFilter = 'combos'"
            id="btn-stagiaire-combos"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-lg"
            [class]="
              stagiaireViewFilter === 'combos'
                ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white border-transparent'
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
            "
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
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span>Mes Combos ({{ myCombos.length }})</span>
            <span
              *ngIf="pendingPaymentCombosCount > 0"
              class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 animate-pulse"
            >
              <svg
                class="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {{ pendingPaymentCombosCount }} en attente
            </span>
            <span
              *ngIf="pendingPaymentCombosCount === 0 && myCombos.length > 0"
              class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-1"
            >
              <svg
                class="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Payé
            </span>
          </button>

          <!-- ─── FORMATEUR : Formations Combo ─── -->
          <button
            *ngIf="isFormateur"
            (click)="showComboFormateur = true"
            id="btn-combo-formateur"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border
                   bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20
                   transition-all cursor-pointer shadow-lg"
          >
            <svg
              class="w-4 h-4 text-purple-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span>Formations Combo</span>
          </button>

          <!-- ─── ADMIN : Combos Supervision ─── -->
          <button
            *ngIf="isAdmin"
            (click)="showComboAdmin = true"
            id="btn-combo-admin"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border
                   bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20
                   transition-all cursor-pointer shadow-lg"
          >
            <svg
              class="w-4 h-4 text-indigo-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Combos Supervision</span>
          </button>

          <!-- Archive toggle (Admin only) -->
          <button
            *ngIf="isAdmin"
            (click)="showArchived = !showArchived"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer"
            [class]="
              showArchived
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
            "
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
                d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
              />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
            <span>{{ showArchived ? 'Actives' : 'Archivées' }}</span>
          </button>

          <!-- Add formation button (Admin only) -->
          <button
            *ngIf="isAdmin"
            routerLink="/dashboard/formations/new"
            class="bridge-btn-primary px-4 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <svg
              class="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nouvelle Formation</span>
          </button>
        </div>
      </div>

      <!-- ─── Stagiaire Filter Tabs (Toutes / Mes Inscriptions / Disponibles) ─── -->
      <div
        *ngIf="isStagiaire"
        class="flex items-center gap-2 border-b border-white/10 pb-3 flex-wrap"
      >
        <button
          (click)="stagiaireViewFilter = 'all'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          [class]="
            stagiaireViewFilter === 'all'
              ? 'bg-white/10 text-white border border-white/20 shadow-md'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          "
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
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path
              d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
            />
          </svg>
          <span>Toutes les formations</span>
          <span class="text-[10px] font-mono opacity-70">({{ formations.length }})</span>
        </button>

        <button
          (click)="stagiaireViewFilter = 'mine'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          [class]="
            stagiaireViewFilter === 'mine'
              ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-lg'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          "
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
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
          <span>Mes inscriptions</span>
          <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/20">
            {{ myEnrolledCount }}
          </span>
        </button>

        <button
          (click)="stagiaireViewFilter = 'available'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          [class]="
            stagiaireViewFilter === 'available'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          "
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
            <path
              d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"
            />
          </svg>
          <span>Disponibles à l'inscription</span>
          <span class="text-[10px] font-mono opacity-70">({{ availableCount }})</span>
        </button>

        <button
          (click)="stagiaireViewFilter = 'combos'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
          [class]="
            stagiaireViewFilter === 'combos'
              ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-lg'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          "
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
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span>Mes Formations Combo</span>
          <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/20">
            {{ myCombos.length }}
          </span>
          <span
            *ngIf="pendingPaymentCombosCount > 0"
            class="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 animate-pulse"
          >
            <svg
              class="w-2.5 h-2.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {{ pendingPaymentCombosCount }} en attente
          </span>
        </button>
      </div>

      <!-- Loading Skeleton -->
      <div *ngIf="loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let i of [1, 2, 3]"
          class="glass-card border border-[var(--bridge-border)] p-6 space-y-4 animate-pulse"
        >
          <div class="flex justify-between">
            <div class="h-5 w-20 bg-white/5 rounded-full"></div>
            <div class="h-5 w-16 bg-white/5 rounded-full"></div>
          </div>
          <div class="h-6 w-3/4 bg-white/5 rounded-lg"></div>
          <div class="space-y-2">
            <div class="h-3 bg-white/5 rounded"></div>
            <div class="h-3 w-5/6 bg-white/5 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Search + Filter Bar -->
      <div *ngIf="!loading" class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bridge-text-muted)]">
            <svg
              class="w-4 h-4 inline-block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="20" y1="20" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            [(ngModel)]="searchQuery"
            type="text"
            placeholder="Rechercher une formation..."
            aria-label="Rechercher une formation par titre ou mot-clé"
            class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors"
          />
        </div>
        <select
          [(ngModel)]="filterCategory"
          aria-label="Filtrer par catégorie"
          class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors"
        >
          <option value="" class="bg-[#10102A]">Toutes les catégories</option>
          <option *ngFor="let cat of categories" [value]="cat" class="bg-[#10102A]">
            {{ cat }}
          </option>
        </select>
        <div class="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          <button
            (click)="viewMode = 'grid'"
            class="px-3 py-2 rounded-lg text-sm transition-all cursor-pointer"
            [class]="
              viewMode === 'grid'
                ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white'
                : 'text-white/40 hover:text-white'
            "
          >
            ⊞
          </button>
          <button
            (click)="viewMode = 'list'"
            class="px-3 py-2 rounded-lg text-sm transition-all cursor-pointer"
            [class]="
              viewMode === 'list'
                ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white'
                : 'text-white/40 hover:text-white'
            "
          >
            ☰
          </button>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- COMBOS VIEW (STAGIAIRE)                                     -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <div
        *ngIf="!loading && isStagiaire && stagiaireViewFilter === 'combos'"
        class="space-y-6 animate-fadein"
      >
        <!-- Banner Intro -->
        <div
          class="glass-card border border-[var(--bridge-gold)]/20 p-6 bg-gradient-to-r from-[#C62761]/10 via-[#0D0D22] to-[#F5A623]/10 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[var(--bridge-gold)]/30 flex items-center justify-center text-[var(--bridge-gold)] flex-shrink-0"
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
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div>
              <h2 class="font-syne font-bold text-lg text-white">
                Vos Parcours Combo Personnalisés
              </h2>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                Consultez vos combos créés, le statut de votre règlement Stripe et accédez à vos
                formations.
              </p>
            </div>
          </div>
          <button
            (click)="openComboParcours()"
            class="bridge-btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
          >
            <svg
              class="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"
              />
            </svg>
            <span>Nouveau Combo</span>
          </button>
        </div>

        <!-- Loading combos skeleton -->
        <div *ngIf="loadingCombos" class="space-y-4">
          <div
            *ngFor="let _ of [1, 2]"
            class="glass-card border border-[var(--bridge-border)] p-6 animate-pulse h-40"
          ></div>
        </div>

        <!-- Empty state -->
        <div
          *ngIf="!loadingCombos && myCombos.length === 0"
          class="glass-card border border-[var(--bridge-border)] p-16 text-center"
        >
          <div
            class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[var(--bridge-gold)]"
          >
            <svg
              class="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <p class="font-syne font-bold text-lg text-white">Aucun parcours combo personnalisé</p>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-2 max-w-md mx-auto">
            Créez votre propre parcours en combinant 2 formations ou plus pour bénéficier d'une
            remise jusqu'à 40%.
          </p>
          <button
            (click)="openComboParcours()"
            class="mt-6 bridge-btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <svg
              class="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"
              />
            </svg>
            <span>Personnaliser mon premier parcours</span>
          </button>
        </div>

        <!-- Combo Cards List -->
        <div *ngIf="!loadingCombos && myCombos.length > 0" class="space-y-6">
          <div
            *ngFor="let combo of myCombos; let ci = index"
            class="glass-card border overflow-hidden transition-all duration-300"
            [class]="
              combo.status === 'PENDING_PAYMENT'
                ? 'border-amber-500/30 hover:border-amber-500/50 shadow-[0_0_25px_rgba(245,166,35,0.08)]'
                : 'border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.08)]'
            "
          >
            <!-- Top Gradient Status Bar -->
            <div
              class="h-1.5"
              [class]="
                combo.status === 'PENDING_PAYMENT'
                  ? 'bg-gradient-to-r from-amber-500 via-[#F5A623] to-amber-300'
                  : combo.status === 'ACTIVE'
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-[#F5A623]'
                    : 'bg-white/10'
              "
            ></div>

            <!-- Card Header -->
            <div
              class="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <div class="flex items-center gap-3 flex-wrap">
                  <span class="font-mono font-bold text-sm text-[#F5A623]">
                    {{ combo.receiptRef || 'COMBO #' + combo.id }}
                  </span>
                  <span class="text-xs text-white/40 font-mono">·</span>
                  <span class="text-xs text-white/50">
                    Créé le {{ combo.createdAt || 'Récemment' }}
                  </span>
                  <span *ngIf="combo.paidAt" class="text-xs text-emerald-400 font-semibold">
                    · Payé le {{ combo.paidAt }}
                  </span>
                </div>
                <h3 class="font-syne font-bold text-white text-lg mt-1 flex items-center gap-2">
                  Combo de {{ combo.formations.length }} Formation{{
                    combo.formations.length > 1 ? 's' : ''
                  }}
                </h3>
              </div>

              <!-- Payment Status Tag Badge -->
              <div class="flex items-center gap-3 flex-wrap">
                <!-- Tag status -->
                <div
                  class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider"
                  [class]="
                    combo.status === 'PENDING_PAYMENT'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse'
                      : combo.status === 'ACTIVE'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : combo.status === 'COMPLETED'
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                          : 'bg-red-500/15 text-red-300 border-red-500/40'
                  "
                >
                  <span
                    *ngIf="combo.status === 'PENDING_PAYMENT'"
                    class="flex items-center gap-1.5"
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
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Paiement en attente
                  </span>
                  <span *ngIf="combo.status === 'ACTIVE'" class="flex items-center gap-1.5">
                    <svg
                      class="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Paiement validé & Actif
                  </span>
                  <span *ngIf="combo.status === 'COMPLETED'" class="flex items-center gap-1.5">
                    <svg
                      class="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="8" r="6" />
                      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                    </svg>
                    Terminé
                  </span>
                  <span *ngIf="combo.status === 'CANCELLED'" class="flex items-center gap-1.5">
                    <svg
                      class="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Annulé
                  </span>
                </div>

                <!-- Price pill -->
                <div class="text-right">
                  <p class="text-[10px] text-white/40 uppercase">Montant Net</p>
                  <p class="font-mono font-extrabold text-base text-[#F5A623]">
                    {{ combo.finalPrice | number: '1.0-0' }} TND
                  </p>
                </div>
              </div>
            </div>

            <!-- Formations Grid inside this Combo -->
            <div class="p-6 bg-white/[0.01]">
              <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">
                Formations incluses dans ce parcours
              </p>
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  *ngFor="let f of combo.formations; let fi = index"
                  class="rounded-xl border p-4 transition-all duration-200 cursor-pointer group hover:scale-[1.01]"
                  [class]="
                    combo.status === 'ACTIVE'
                      ? 'bg-emerald-500/[0.04] border-emerald-500/25 hover:border-emerald-500/60 hover:bg-emerald-500/[0.08]'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  "
                  (click)="openFormation(f)"
                >
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span
                      class="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 font-mono uppercase border border-white/10"
                    >
                      {{ f.category || 'Module ' + (fi + 1) }}
                    </span>
                    <span class="text-xs font-mono font-bold text-[#F5A623]">
                      {{ f.totalPrice || 0 | number: '1.0-0' }} TND
                    </span>
                  </div>

                  <h4
                    class="font-syne font-bold text-white text-sm leading-snug line-clamp-1 mb-1 group-hover:text-[var(--bridge-gold)] transition-colors"
                  >
                    {{ f.nom }}
                  </h4>

                  <p class="text-xs text-[var(--bridge-text-muted)] line-clamp-2 mb-3">
                    {{ f.description || 'Formation professionnelle certifiante' }}
                  </p>

                  <div
                    class="flex items-center justify-between text-[11px] text-white/50 pt-2 border-t border-white/5"
                  >
                    <span>{{ f.formateurNom || 'Formateur' }}</span>
                    <span
                      class="flex items-center gap-1 text-[var(--bridge-gold)] group-hover:translate-x-0.5 transition-transform font-semibold"
                    >
                      <span>Détails</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Financial Summary Bar & Action Buttons -->
              <div
                class="mt-6 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div class="flex items-center gap-6 text-xs flex-wrap">
                  <div>
                    <span class="text-white/40">Sous-total brut : </span>
                    <span class="font-mono text-white/70 line-through"
                      >{{ combo.totalPrice | number: '1.0-0' }} TND</span
                    >
                  </div>
                  <div>
                    <span class="text-[#F5A623] font-bold">Remise appliquée : </span>
                    <span class="font-mono font-bold text-[#F5A623]"
                      >-{{ combo.discountPercent }}% (-{{
                        (combo.totalPrice || 0) - (combo.finalPrice || 0) | number: '1.0-0'
                      }}
                      TND)</span
                    >
                  </div>
                  <div>
                    <span class="text-white font-bold">Total payé : </span>
                    <span class="font-mono font-extrabold text-sm text-[#C62761]"
                      >{{ combo.finalPrice | number: '1.0-0' }} TND</span
                    >
                  </div>
                </div>

                <div class="flex items-center gap-3 flex-wrap">
                  <!-- Action for Pending Payment: Finalize Stripe payment -->
                  <button
                    *ngIf="combo.status === 'PENDING_PAYMENT' || combo.status === 'CANCELLED'"
                    (click)="resumeComboPayment(combo)"
                    class="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <svg
                      class="w-4 h-4 text-white"
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
                    <span>Payer via Stripe ({{ combo.finalPrice | number: '1.0-0' }} TND) →</span>
                  </button>

                  <!-- Action for Pending: Cancel without browser alert -->
                  <button
                    *ngIf="combo.status === 'PENDING_PAYMENT'"
                    (click)="cancelPendingCombo(combo, $event)"
                    class="px-3 py-2 rounded-xl bg-white/5 hover:bg-amber-500/10 text-white/50 hover:text-amber-400 border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Annuler le parcours combo"
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
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span>Annuler</span>
                  </button>

                  <!-- Action for Cancelled: Delete permanently from DB -->
                  <button
                    *ngIf="combo.status === 'CANCELLED'"
                    (click)="deleteCancelledCombo(combo, $event)"
                    class="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Supprimer définitivement ce combo de la base de données"
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
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                    <span>Supprimer</span>
                  </button>

                  <!-- Action for Active: Print receipt -->
                  <button
                    *ngIf="combo.status === 'ACTIVE'"
                    (click)="printComboReceipt(combo)"
                    class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <svg
                      class="w-4 h-4 text-white/70"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="6 9 6 2 18 2 18 9" />
                      <path
                        d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
                      />
                      <rect width="12" height="8" x="6" y="14" />
                    </svg>
                    <span>Reçu de paiement</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- GRID VIEW                                                   -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <div
        *ngIf="!loading && stagiaireViewFilter !== 'combos' && viewMode === 'grid'"
        class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          *ngFor="let f of filteredFormations; let i = index"
          class="glass-card border p-6 flex flex-col justify-between cursor-pointer group transition-all duration-300 relative"
          [class]="
            f.archived
              ? 'border-amber-500/20 opacity-60 hover:opacity-80 hover:border-amber-500/40'
              : 'border-[var(--bridge-border)] hover:border-[#C62761]/40 hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(198,39,97,0.12)]'
          "
          [style.animation-delay]="i * 70 + 'ms'"
          style="animation: fadeSlideIn 0.4s ease both"
          (click)="openFormation(f)"
        >
          <!-- Archived ribbon -->
          <div
            *ngIf="f.archived"
            class="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full font-bold uppercase tracking-wide"
          >
            📦 Archivée
          </div>

          <!-- Top Row -->
          <div>
            <div class="flex justify-between items-start mb-4">
              <span
                class="text-[10px] px-2.5 py-1 bg-white/5 rounded-full text-white/60 uppercase font-mono tracking-wider font-semibold border border-white/10"
              >
                {{ f.category || 'Général' }}
              </span>
              <div class="flex items-center gap-2">
                <!-- Stagiaire Enrollment Badge -->
                <span
                  *ngIf="isStagiaire && isEnrolled(f.id)"
                  class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                >
                  ✓ Inscrit
                </span>
                <span
                  *ngIf="isStagiaire && isPending(f.id)"
                  class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"
                >
                  ⏳ En attente
                </span>
                <span
                  *ngIf="isStagiaire && !isEnrolled(f.id) && !isPending(f.id)"
                  class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[rgba(245,166,35,0.1)] text-[#F5A623] border border-[rgba(245,166,35,0.2)]"
                >
                  ✨ Disponible
                </span>

                <span
                  *ngIf="!isStagiaire"
                  class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border"
                  [class]="getStatusClass(f.status)"
                >
                  {{ getStatusLabel(f.status) }}
                </span>
                <span class="text-xs font-mono font-bold text-[#F5A623]">
                  {{ f.totalPrice | number }} TND
                </span>
              </div>
            </div>

            <!-- Stagiaire Combo Payment Tag Badge on Card -->
            <div
              *ngIf="isStagiaire && getComboStatusForFormation(f.id)"
              class="mb-3 px-3 py-1.5 rounded-xl border flex items-center justify-between text-xs"
              [class]="
                getComboStatusForFormation(f.id) === 'PENDING_PAYMENT'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
              "
            >
              <div class="flex items-center gap-1.5 font-bold">
                <svg
                  class="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <span>Inclus dans un Combo</span>
              </div>
              <span
                class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1"
                [class]="
                  getComboStatusForFormation(f.id) === 'PENDING_PAYMENT'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                "
              >
                <svg
                  *ngIf="getComboStatusForFormation(f.id) === 'PENDING_PAYMENT'"
                  class="w-2.5 h-2.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <svg
                  *ngIf="getComboStatusForFormation(f.id) !== 'PENDING_PAYMENT'"
                  class="w-2.5 h-2.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {{
                  getComboStatusForFormation(f.id) === 'PENDING_PAYMENT'
                    ? 'Paiement en attente'
                    : 'Payé & Actif'
                }}
              </span>
            </div>

            <!-- Stagiaire Simple Enrollment Payment Tag Badge on Card -->
            <div
              *ngIf="isStagiaire && isEnrolled(f.id) && !getComboStatusForFormation(f.id)"
              class="mb-3 px-3 py-1.5 rounded-xl border flex items-center justify-between text-xs"
              [class]="
                getFormationPaymentStatus(f.id) === 'PAID'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : getFormationPaymentStatus(f.id) === 'PARTIAL'
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              "
            >
              <div class="flex items-center gap-1.5 font-bold">
                <svg
                  class="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                </svg>
                <span>Inscription Individuelle</span>
              </div>
              <span
                class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1"
                [class]="
                  getFormationPaymentStatus(f.id) === 'PAID'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : getFormationPaymentStatus(f.id) === 'PARTIAL'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                "
              >
                <svg
                  *ngIf="getFormationPaymentStatus(f.id) === 'PAID'"
                  class="w-2.5 h-2.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <svg
                  *ngIf="getFormationPaymentStatus(f.id) !== 'PAID'"
                  class="w-2.5 h-2.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {{
                  getFormationPaymentStatus(f.id) === 'PAID'
                    ? 'Payé & Actif'
                    : getFormationPaymentStatus(f.id) === 'PARTIAL'
                      ? 'Partiellement Payé'
                      : 'Paiement en attente'
                }}
              </span>
            </div>

            <h3
              class="font-syne font-bold text-lg text-white mb-2 group-hover:text-[#F5A623] transition-colors leading-snug"
            >
              {{ f.nom }}
            </h3>
            <p class="text-xs text-[var(--bridge-text-muted)] line-clamp-3 mb-5 leading-relaxed">
              {{ f.description }}
            </p>
          </div>

          <!-- Progress / Phases info -->
          <div>
            <div class="mb-4 space-y-1.5">
              <div class="flex justify-between text-[10px] text-white/40">
                <span>Progression globale</span>
                <span class="font-mono">{{ getOverallProgress(f) }}%</span>
              </div>
              <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-[#C62761] to-[#F5A623] transition-all duration-700"
                  [style.width]="getOverallProgress(f) + '%'"
                ></div>
              </div>
            </div>

            <!-- Meta Info -->
            <div class="border-t border-white/5 pt-4 space-y-2.5">
              <div class="flex justify-between text-xs text-[var(--bridge-text-muted)]">
                <span>Formateur :</span>
                <span class="font-semibold text-[#C62761] truncate max-w-[140px]">
                  {{ f.formateurNom || 'Non assigné' }}
                </span>
              </div>
              <div class="flex justify-between text-xs text-[var(--bridge-text-muted)]">
                <span>Phases :</span>
                <span class="font-semibold text-white/70"
                  >{{ f.phases.length }} module{{ f.phases.length > 1 ? 's' : '' }}</span
                >
              </div>
            </div>

            <!-- Actions Bar -->
            <div class="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-white/5">
              <!-- Admin / Formateur default button -->
              <button
                *ngIf="!isStagiaire"
                class="text-xs text-[#C62761] font-semibold hover:text-[#F5A623] transition-colors"
                (click)="openFormation(f)"
              >
                Voir les détails →
              </button>

              <!-- Stagiaire dynamic action button -->
              <div *ngIf="isStagiaire" class="w-full flex items-center justify-between gap-2">
                <button
                  *ngIf="!isEnrolled(f.id) && !isPending(f.id)"
                  (click)="openEnrollStepper(f, $event)"
                  [disabled]="enrollingId === f.id"
                  class="w-full py-2 px-4 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>S'inscrire ({{ f.totalPrice || 0 | number }} TND) →</span>
                </button>

                <button
                  *ngIf="isPending(f.id)"
                  disabled
                  class="w-full py-2 px-4 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-xl border border-amber-500/20 flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  ⏳ Validation en attente
                </button>

                <button
                  *ngIf="isEnrolled(f.id)"
                  (click)="openFormation(f)"
                  class="w-full py-2 px-4 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Accéder à mon cursus →</span>
                </button>
              </div>

              <!-- Admin controls -->
              <div
                *ngIf="isAdmin"
                class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <!-- Edit -->
                <button
                  (click)="$event.stopPropagation(); openEditModal(f)"
                  class="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm transition-all"
                  title="Modifier"
                >
                  ✏️
                </button>
                <!-- Archive -->
                <button
                  (click)="$event.stopPropagation(); toggleArchive(f)"
                  class="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all"
                  [class]="
                    f.archived
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                  "
                  [title]="f.archived ? 'Désarchiver' : 'Archiver'"
                >
                  {{ f.archived ? '📂' : '📦' }}
                </button>
                <!-- Delete -->
                <button
                  (click)="$event.stopPropagation(); confirmDelete(f)"
                  class="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center text-sm transition-all"
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- LIST VIEW                                                   -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <div
        *ngIf="!loading && stagiaireViewFilter !== 'combos' && viewMode === 'list'"
        class="glass-card border border-[var(--bridge-border)] overflow-hidden"
      >
        <div
          class="grid gap-4 px-5 py-3 bg-white/[0.02] border-b border-white/5"
          [class]="
            isAdmin ? 'grid-cols-[1fr_auto_auto_auto_auto]' : 'grid-cols-[1fr_auto_auto_auto_auto]'
          "
        >
          <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold"
            >Formation</span
          >
          <span
            class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-center"
            >Phases</span
          >
          <span
            class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-center"
            >Statut / Inscription</span
          >
          <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-right"
            >Prix</span
          >
          <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-right"
            >Actions</span
          >
        </div>
        <div class="divide-y divide-white/[0.03]">
          <div
            *ngFor="let f of filteredFormations; let i = index"
            class="grid gap-4 px-5 py-4 hover:bg-white/[0.02] cursor-pointer transition-colors group items-center"
            [class]="
              (isAdmin
                ? 'grid-cols-[1fr_auto_auto_auto_auto]'
                : 'grid-cols-[1fr_auto_auto_auto_auto]') + (f.archived ? ' opacity-60' : '')
            "
            [style.animation-delay]="i * 40 + 'ms'"
            style="animation: fadeSlideIn 0.3s ease both"
            (click)="openFormation(f)"
          >
            <div class="min-w-0 flex items-center gap-2">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <p
                    class="font-semibold text-white text-sm group-hover:text-[#F5A623] transition-colors truncate"
                  >
                    {{ f.nom }}
                  </p>
                  <!-- Combo Tag in List Row -->
                  <span
                    *ngIf="isStagiaire && getComboStatusForFormation(f.id)"
                    class="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
                    [class]="
                      getComboStatusForFormation(f.id) === 'PENDING_PAYMENT'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    "
                  >
                    🎯 Combo:
                    {{
                      getComboStatusForFormation(f.id) === 'PENDING_PAYMENT'
                        ? '⏳ Paiement en attente'
                        : '✓ Payé & Actif'
                    }}
                  </span>

                  <!-- Simple Enrollment Tag in List Row -->
                  <span
                    *ngIf="isStagiaire && isEnrolled(f.id) && !getComboStatusForFormation(f.id)"
                    class="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1"
                    [class]="
                      getFormationPaymentStatus(f.id) === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : getFormationPaymentStatus(f.id) === 'PARTIAL'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                    "
                  >
                    {{
                      getFormationPaymentStatus(f.id) === 'PAID'
                        ? '✓ Payé & Actif'
                        : getFormationPaymentStatus(f.id) === 'PARTIAL'
                          ? '⏳ Partiellement Payé'
                          : '⏳ Non Payé (En attente)'
                    }}
                  </span>
                </div>
                <p class="text-xs text-white/40 mt-0.5">{{ f.formateurNom }} · {{ f.category }}</p>
              </div>
              <span
                *ngIf="f.archived"
                class="text-[9px] px-1.5 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full font-bold uppercase shrink-0"
              >
                Archivée
              </span>
            </div>

            <!-- Phases Chips -->
            <div class="flex items-center justify-center gap-1">
              <span
                *ngFor="let p of f.phases; let pi = index"
                class="w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center"
                [class]="getPhaseChipClass(p.status)"
              >
                {{ pi + 1 }}
              </span>
            </div>

            <!-- Statut / Inscription -->
            <div class="flex items-center justify-center">
              <span
                *ngIf="isStagiaire && isEnrolled(f.id)"
                class="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >
                ✓ Inscrit
              </span>
              <span
                *ngIf="isStagiaire && isPending(f.id)"
                class="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20"
              >
                ⏳ En attente
              </span>
              <span
                *ngIf="isStagiaire && !isEnrolled(f.id) && !isPending(f.id)"
                class="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest bg-[rgba(245,166,35,0.1)] text-[#F5A623] border border-[rgba(245,166,35,0.2)]"
              >
                ✨ Disponible
              </span>
              <span
                *ngIf="!isStagiaire"
                class="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border"
                [class]="getStatusClass(f.status)"
              >
                {{ getStatusLabel(f.status) }}
              </span>
            </div>

            <!-- Prix -->
            <div class="flex items-center justify-end">
              <span class="text-sm font-mono font-bold text-[#F5A623]">
                {{ f.totalPrice | number }} TND
              </span>
            </div>

            <!-- Actions Column -->
            <div class="flex items-center justify-end gap-1.5" (click)="$event.stopPropagation()">
              <!-- Stagiaire button -->
              <button
                *ngIf="isStagiaire && !isEnrolled(f.id) && !isPending(f.id)"
                (click)="openEnrollStepper(f, $event)"
                [disabled]="enrollingId === f.id"
                class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow"
              >
                S'inscrire
              </button>

              <span
                *ngIf="isStagiaire && isPending(f.id)"
                class="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20 cursor-not-allowed"
              >
                ⏳ En attente
              </span>

              <button
                *ngIf="isStagiaire && isEnrolled(f.id)"
                (click)="openFormation(f)"
                class="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                Accéder →
              </button>

              <!-- Admin action buttons -->
              <ng-container *ngIf="isAdmin">
                <button
                  (click)="openEditModal(f)"
                  class="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs transition-all opacity-0 group-hover:opacity-100"
                  title="Modifier"
                >
                  ✏️
                </button>
                <button
                  (click)="toggleArchive(f)"
                  class="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all opacity-0 group-hover:opacity-100"
                  [class]="
                    f.archived
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                  "
                  [title]="f.archived ? 'Désarchiver' : 'Archiver'"
                >
                  {{ f.archived ? '📂' : '📦' }}
                </button>
                <button
                  (click)="confirmDelete(f)"
                  class="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center text-xs transition-all opacity-0 group-hover:opacity-100"
                  title="Supprimer"
                >
                  🗑️
                </button>
              </ng-container>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="!loading && filteredFormations.length === 0"
        class="glass-card border border-[var(--bridge-border)] p-16 text-center"
      >
        <div
          class="w-20 h-20 rounded-full bg-gradient-to-br from-[rgba(198,39,97,0.1)] to-[rgba(245,166,35,0.05)] flex items-center justify-center text-4xl mx-auto mb-6"
        >
          {{ showArchived ? '📦' : '📚' }}
        </div>
        <p class="font-syne font-bold text-xl text-white">
          {{ showArchived ? 'Aucune formation archivée' : 'Aucune formation disponible' }}
        </p>
        <p
          class="text-[var(--bridge-text-muted)] text-sm mt-3 mb-8 max-w-md mx-auto leading-relaxed"
        >
          {{
            showArchived
              ? 'Les formations archivées apparaîtront ici.'
              : 'Aucun programme ne correspond à vos filtres actuels.'
          }}
        </p>
        <button
          *ngIf="canCreate && !showArchived"
          routerLink="/dashboard/formations/new"
          class="px-6 py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white rounded-xl text-sm font-bold transition-all hover:opacity-90 shadow-[0_0_20px_rgba(198,39,97,0.3)]"
        >
          ➕ Créer un programme
        </button>
      </div>

      <!-- ═══ EDIT MODAL ═══ -->
      <div
        *ngIf="showEditModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        (click)="closeEditModal()"
      >
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div class="relative z-10 w-full max-w-lg" (click)="$event.stopPropagation()">
          <div class="glass-card border border-[var(--bridge-border)] overflow-hidden">
            <div class="h-1 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623]"></div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 class="font-syne font-bold text-lg text-white">✏️ Modifier la formation</h3>
                  <p class="text-xs text-white/40 mt-0.5">{{ editForm.nom }}</p>
                </div>
                <button
                  (click)="closeEditModal()"
                  class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all text-sm"
                >
                  ✕
                </button>
              </div>

              <div class="space-y-4">
                <div>
                  <label
                    class="text-xs text-white/60 font-semibold uppercase tracking-wider block mb-1.5"
                  >
                    Titre
                  </label>
                  <input
                    [(ngModel)]="editForm.nom"
                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C62761]"
                  />
                </div>
                <div>
                  <label
                    class="text-xs text-white/60 font-semibold uppercase tracking-wider block mb-1.5"
                  >
                    Description
                  </label>
                  <textarea
                    [(ngModel)]="editForm.description"
                    rows="3"
                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C62761]"
                  ></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      class="text-xs text-white/60 font-semibold uppercase tracking-wider block mb-1.5"
                    >
                      Catégorie
                    </label>
                    <input
                      [(ngModel)]="editForm.category"
                      class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C62761]"
                    />
                  </div>
                  <div>
                    <label
                      class="text-xs text-white/60 font-semibold uppercase tracking-wider block mb-1.5"
                    >
                      Prix Total (TND)
                    </label>
                    <input
                      type="number"
                      [(ngModel)]="editForm.totalPrice"
                      class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#C62761]"
                    />
                  </div>
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button (click)="closeEditModal()" class="bridge-btn-secondary px-4 py-2 text-xs">
                  Annuler
                </button>
                <button
                  (click)="saveEdit()"
                  [disabled]="saving"
                  class="bridge-btn-primary px-5 py-2 text-xs font-bold"
                >
                  {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ DELETE MODAL ═══ -->
      <div
        *ngIf="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        (click)="closeDeleteModal()"
      >
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div class="relative z-10 w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="glass-card border border-red-500/20 overflow-hidden">
            <div class="h-1 bg-red-500"></div>
            <div class="p-6 text-center">
              <div
                class="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-2xl mx-auto mb-4"
              >
                🗑️
              </div>
              <h3 class="font-syne font-bold text-lg text-white mb-2">Supprimer la formation ?</h3>
              <p class="text-xs text-white/60 mb-6">
                Êtes-vous sûr de vouloir supprimer définitivement « {{ formationToDelete?.nom }} » ?
                Cette action est irréversible.
              </p>
              <div class="flex justify-center gap-3">
                <button (click)="closeDeleteModal()" class="bridge-btn-secondary px-4 py-2 text-xs">
                  Annuler
                </button>
                <button
                  (click)="executeDelete()"
                  [disabled]="saving"
                  class="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {{ saving ? 'Suppression...' : 'Confirmer la suppression' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ ENROLLMENT STEPPER MODAL ═══ -->
    <app-enrollment-stepper
      *ngIf="showStepper && stepperFormation"
      [formation]="stepperFormation"
      [user]="user"
      (closed)="closeStepper()"
      (enrolled)="onEnrollmentComplete($event)"
    ></app-enrollment-stepper>

    <!-- ═══ COMBO PARCOURS (STAGIAIRE) ═══ -->
    <app-combo-parcours
      *ngIf="showComboParcours"
      [user]="user"
      (closed)="showComboParcours = false"
      (comboCompleted)="onComboCompleted($event)"
    ></app-combo-parcours>

    <!-- ═══ COMBO FORMATEUR ═══ -->
    <app-combo-formateur
      *ngIf="showComboFormateur"
      [user]="user"
      (closed)="showComboFormateur = false"
    ></app-combo-formateur>

    <!-- ═══ COMBO ADMIN ═══ -->
    <app-combo-admin
      *ngIf="showComboAdmin"
      [user]="user"
      (closed)="showComboAdmin = false"
    ></app-combo-admin>
  `,
})
export class FormationsListComponent implements OnInit {
  user: User | null = null;
  formations: Formation[] = [];
  loading = true;
  viewMode: 'grid' | 'list' = 'grid';
  showArchived = false;

  // Search & Filters
  searchQuery = '';
  filterCategory = '';
  stagiaireViewFilter: 'all' | 'mine' | 'available' | 'combos' = 'all';

  // Stagiaire Enrolled IDs Set
  enrolledFormationIds: Set<string> = new Set();
  pendingFormationIds: Set<string> = new Set();
  enrollingId: string | null = null;

  // Combo data
  myCombos: ComboEnrollment[] = [];
  loadingCombos = false;
  expandedComboIds = new Set<number>();

  // Enrollment stepper
  showStepper = false;
  stepperFormation: Formation | null = null;

  // Combo modals
  showComboParcours = false;
  showComboFormateur = false;
  showComboAdmin = false;

  // Edit modal
  showEditModal = false;
  editingFormation: Formation | null = null;
  editForm = {
    nom: '',
    description: '',
    category: '',
    totalPrice: 0,
    status: 'PLANIFIEE' as Formation['status'],
  };
  saving = false;

  // Delete modal
  showDeleteModal = false;
  formationToDelete: Formation | null = null;

  get isAdmin(): boolean {
    return this.user?.role === 'ADMIN';
  }
  get isFormateur(): boolean {
    return this.user?.role === 'FORMATEUR';
  }
  get isStagiaire(): boolean {
    return this.user?.role === 'STAGIAIRE';
  }

  get pendingPaymentCombosCount(): number {
    return this.myCombos.filter((c) => c.status === 'PENDING_PAYMENT').length;
  }

  get hasPendingPaymentCombos(): boolean {
    return this.pendingPaymentCombosCount > 0;
  }

  get canCreate(): boolean {
    return this.isAdmin;
  }
  get canCreateAny(): boolean {
    return this.isAdmin;
  }
  canManage(f: Formation): boolean {
    return this.isAdmin;
  }

  get categories(): string[] {
    const set = new Set(this.formations.map((f) => f.category).filter(Boolean) as string[]);
    return Array.from(set);
  }

  isEnrolled(formationId: string): boolean {
    return this.enrolledFormationIds.has(formationId.toString());
  }

  get myEnrolledCount(): number {
    return this.formations.filter((f) => this.isEnrolled(f.id)).length;
  }

  get availableCount(): number {
    return this.formations.filter((f) => !this.isEnrolled(f.id) && !f.archived).length;
  }

  get filteredFormations(): Formation[] {
    return this.formations.filter((f) => {
      const matchArchived = this.showArchived ? f.archived === true : f.archived !== true;
      const matchSearch =
        !this.searchQuery.trim() ||
        f.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (f.description || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (f.formateurNom || '').toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchCat = !this.filterCategory || f.category === this.filterCategory;

      // Stagiaire Sub-filter: all / mine / available
      let matchStagiaireTab = true;
      if (this.isStagiaire) {
        if (this.stagiaireViewFilter === 'mine') {
          matchStagiaireTab = this.isEnrolled(f.id);
        } else if (this.stagiaireViewFilter === 'available') {
          matchStagiaireTab = !this.isEnrolled(f.id);
        }
      }

      return matchArchived && matchSearch && matchCat && matchStagiaireTab;
    });
  }

  paiements: Paiement[] = [];

  constructor(
    private formationService: FormationService,
    private authService: AuthService,
    private enrollmentService: EnrollmentService,
    private comboService: ComboEnrollmentService,
    private paiementService: PaiementService,
    private toastService: ToastService,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadFormations();
    if (this.isStagiaire && this.user) {
      this.loadStagiaireEnrollments();
      this.loadStagiaireCombos();
      this.loadStagiairePayments();
    }
  }

  loadStagiairePayments(): void {
    if (!this.user?.id) return;
    this.paiementService.getPaiementsByStagiaire(this.user.id).subscribe({
      next: (data) => {
        this.paiements = data || [];
      },
      error: () => {},
    });
  }

  getFormationPaymentStatus(
    formationId: string | number,
  ): 'PAID' | 'PARTIAL' | 'PENDING' | 'LATE' | 'NONE' {
    if (!formationId || !this.paiements || this.paiements.length === 0) return 'NONE';
    const fPaiements = this.paiements.filter(
      (p) => p.formationId?.toString() === formationId.toString(),
    );
    if (fPaiements.length === 0) return 'NONE';
    const hasLate = fPaiements.some((p) => p.status === 'EN_RETARD');
    if (hasLate) return 'LATE';
    const allPaid = fPaiements.every((p) => p.status === 'PAYE');
    if (allPaid) return 'PAID';
    const hasPaid = fPaiements.some((p) => p.status === 'PAYE');
    if (hasPaid) return 'PARTIAL';
    return 'PENDING';
  }

  loadFormations(): void {
    this.loading = true;
    const obs =
      this.user?.role === 'FORMATEUR'
        ? this.formationService.getFormationsByFormateur(this.user!.id)
        : this.formationService.getFormations();
    obs.subscribe({
      next: (data) => {
        this.formations = data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadStagiaireEnrollments(): void {
    if (!this.user) return;
    this.enrollmentService.getEnrollmentsByStudent(parseInt(this.user.id)).subscribe({
      next: (enrollments) => {
        this.enrolledFormationIds = new Set();
        this.pendingFormationIds = new Set();
        (enrollments || []).forEach((e) => {
          const fid = e.formationId?.toString() || '';
          if (!fid) return;
          if (e.status === 'APPROVED') this.enrolledFormationIds.add(fid);
          else if (e.status === 'PENDING') this.pendingFormationIds.add(fid);
        });
      },
      error: () => {},
    });
  }

  // ── Stepper enrollment (remplace l'ancien enrollFormation direct) ──────────
  openEnrollStepper(f: Formation, event?: Event): void {
    if (event) event.stopPropagation();
    this.stepperFormation = f;
    this.showStepper = true;
  }

  closeStepper(): void {
    this.showStepper = false;
    this.stepperFormation = null;
  }

  onEnrollmentComplete(result: { enrollment: any; formation: Formation }): void {
    const fid = result.formation.id.toString();
    if (result.enrollment.status === 'APPROVED') {
      this.enrolledFormationIds.add(fid);
    } else if (result.enrollment.status === 'PENDING') {
      this.pendingFormationIds.add(fid);
    }
    // Close stepper after a brief delay (success step is shown inside)
    setTimeout(() => this.closeStepper(), 4000);
  }

  isPending(formationId: string): boolean {
    return this.pendingFormationIds.has(formationId.toString());
  }

  /** @deprecated Remplacé par openEnrollStepper — conservé pour rétrocompatibilité */
  enrollFormation(f: Formation, event?: Event): void {
    this.openEnrollStepper(f, event);
  }

  openFormation(f: Formation | ComboFormationItem | any): void {
    const formationId = f?.id !== null && f?.id !== undefined ? f.id : f;
    if (!formationId) return;
    if (this.user?.role === 'ADMIN') {
      this.router.navigate([`/dashboard/formations/${formationId}`]);
    } else if (this.user?.role === 'FORMATEUR') {
      this.router.navigate([`/dashboard/formateur/formations/${formationId}`]);
    } else {
      this.router.navigate([`/dashboard/stagiaire/formations/${formationId}`]);
    }
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  openEditModal(f: Formation): void {
    this.router.navigate(['/dashboard/formations/new'], { queryParams: { editId: f.id } });
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingFormation = null;
    this.saving = false;
  }

  saveEdit(): void {
    if (!this.editingFormation || this.saving) return;
    this.saving = true;
    this.formationService
      .updateFormation(this.editingFormation.id, {
        nom: this.editForm.nom,
        description: this.editForm.description,
        category: this.editForm.category,
        totalPrice: this.editForm.totalPrice,
        status: this.editForm.status,
      })
      .subscribe({
        next: (updated) => {
          const idx = this.formations.findIndex((f) => f.id === updated.id);
          if (idx !== -1) this.formations[idx] = updated;
          this.toastService.success('Formation mise à jour avec succès !', '✏️ Modification');
          this.closeEditModal();
        },
        error: () => {
          this.saving = false;
          this.toastService.error('Erreur lors de la modification.', 'Modification');
        },
      });
  }

  // ── Archive ───────────────────────────────────────────────────────────────
  toggleArchive(f: Formation): void {
    this.formationService.archiveFormation(f.id).subscribe({
      next: () => {
        f.archived = !f.archived;
        const action = f.archived ? 'archivée' : 'désarchivée';
        this.toastService.success(`Formation ${action} avec succès !`, `📦 Archivage`);
      },
      error: () => this.toastService.error("Erreur lors de l'archivage.", 'Archivage'),
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  confirmDelete(f: Formation): void {
    this.formationToDelete = f;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.formationToDelete = null;
    this.saving = false;
  }

  executeDelete(): void {
    if (!this.formationToDelete || this.saving) return;
    this.saving = true;
    this.formationService.deleteFormation(this.formationToDelete.id).subscribe({
      next: () => {
        this.formations = this.formations.filter((f) => f.id !== this.formationToDelete!.id);
        this.toastService.success('Formation supprimée définitivement.', '🗑️ Suppression');
        this.closeDeleteModal();
      },
      error: () => {
        this.saving = false;
        this.toastService.error('Erreur lors de la suppression.', 'Suppression');
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getOverallProgress(f: Formation): number {
    if (!f.phases || f.phases.length === 0) return 0;
    const sum = f.phases.reduce((s, p) => s + (p.progression || 0), 0);
    return Math.round(sum / f.phases.length);
  }

  getPhaseChipClass(status: string): string {
    switch (status) {
      case 'COMPLETEE':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'EN_COURS':
        return 'bg-[rgba(198,39,97,0.2)] text-[#C62761]';
      default:
        return 'bg-white/5 text-white/30';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'TERMINEE':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'PLANIFIEE':
        return 'bg-[rgba(245,166,35,0.1)] text-[#F5A623] border-[rgba(245,166,35,0.2)]';
      default:
        return 'bg-white/5 text-white/50 border-white/10';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return '● En cours';
      case 'TERMINEE':
        return '✓ Terminée';
      case 'PLANIFIEE':
        return '○ Planifiée';
      default:
        return status;
    }
  }

  // ─── Combo helpers ────────────────────────────────────────────────────────

  loadStagiaireCombos(): void {
    if (!this.user) return;
    this.loadingCombos = true;
    this.comboService.getCombosByStudent(parseInt(this.user.id)).subscribe({
      next: (combos) => {
        this.myCombos = combos || [];
        this.loadingCombos = false;
      },
      error: () => {
        this.loadingCombos = false;
      },
    });
  }

  getComboForFormation(formationId: string | number): ComboEnrollment | null {
    if (!this.myCombos || this.myCombos.length === 0) return null;
    const fidStr = formationId.toString();
    return (
      this.myCombos.find(
        (c) =>
          c.status !== 'CANCELLED' &&
          c.formations &&
          c.formations.some((f) => f.id === fidStr || f.nom === fidStr),
      ) || null
    );
  }

  getComboStatusForFormation(formationId: string | number): string | null {
    const combo = this.getComboForFormation(formationId);
    return combo ? combo.status : null;
  }

  toggleComboCard(id: number): void {
    if (this.expandedComboIds.has(id)) {
      this.expandedComboIds.delete(id);
    } else {
      this.expandedComboIds.add(id);
    }
  }

  isComboExpanded(id: number): boolean {
    return this.expandedComboIds.has(id);
  }

  openComboParcours(): void {
    this.showComboParcours = true;
  }

  onComboCompleted(combo: any): void {
    this.showComboParcours = false;
    this.loadStagiaireCombos();
    if (combo?.enrollments) {
      combo.enrollments.forEach((e: any) => {
        if (e.formationId) {
          this.enrolledFormationIds.add(e.formationId.toString());
        }
      });
    }
    this.toastService.success('Parcours personnalisé créé avec succès !', '🎉 Félicitations');
  }

  resumeComboPayment(combo: ComboEnrollment): void {
    const studentId = this.user ? parseInt(this.user.id) : combo.studentId;
    this.toastService.info(
      'Préparation de votre session de paiement sécurisée...',
      'Paiement Stripe',
    );
    this.comboService.retryCheckout(combo.id, studentId).subscribe({
      next: (updated) => {
        if (updated.stripeCheckoutUrl) {
          window.location.href = updated.stripeCheckoutUrl;
        } else {
          this.toastService.info('Session Stripe initialisée.', 'Paiement');
        }
      },
      error: (err) => {
        this.toastService.error(
          err?.error?.message || 'Erreur lors de la préparation du paiement.',
          'Paiement',
        );
      },
    });
  }

  cancelPendingCombo(combo: ComboEnrollment, event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.user || combo.status !== 'PENDING_PAYMENT') return;

    this.comboService.cancelCombo(combo.id, parseInt(this.user.id)).subscribe({
      next: () => {
        this.toastService.success('Le parcours personnalisé a été annulé.', 'Combos');
        this.loadStagiaireCombos();
      },
      error: (err) => {
        this.toastService.error(
          err?.error?.message || "Erreur lors de l'annulation du combo.",
          'Combos',
        );
      },
    });
  }

  deleteCancelledCombo(combo: ComboEnrollment, event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.user) return;

    this.comboService.deleteCombo(combo.id, parseInt(this.user.id)).subscribe({
      next: () => {
        this.toastService.success(
          'Le parcours combo a été supprimé définitivement de la base de données.',
          'Suppression',
        );
        this.loadStagiaireCombos();
      },
      error: (err) => {
        this.toastService.error(
          err?.error?.message || 'Erreur lors de la suppression du combo.',
          'Suppression',
        );
      },
    });
  }

  printComboReceipt(combo: ComboEnrollment): void {
    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (!printWin) return;

    const formationsHtml = (combo.formations || [])
      .map(
        (f, idx) => `
        <tr>
          <td style="padding:10px 0; border-bottom:1px solid #f0f0fa; font-size:13px;">
            <strong>${idx + 1}. ${f.nom}</strong><br>
            <small style="color:#888899">${f.formateurNom || 'Formateur'} · ${f.defaultDurationWeeks || 4} sem.</small>
          </td>
          <td style="padding:10px 0; border-bottom:1px solid #f0f0fa; font-size:13px; text-align:right; font-weight:700;">
            ${(f.totalPrice || 0).toFixed(0)} TND
          </td>
        </tr>`,
      )
      .join('');

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Reçu Combo #${combo.receiptRef || combo.id} — The Bridge</title>
        <style>
          * { box-sizing: border-box; margin:0; padding:0; }
          body { font-family: 'Inter', Arial, sans-serif; background:#fff; color:#1a1a2e; padding:32px; }
          .wrapper { max-width:650px; margin:0 auto; border:2px solid #C62761; border-radius:16px; overflow:hidden; }
          .bar { height:6px; background:linear-gradient(90deg, #C62761, #F5A623); }
          .header { padding:24px 32px; background:#f9f9ff; border-bottom:1px solid #e0e0f0; display:flex; justify-content:space-between; }
          .brand { font-size:20px; font-weight:900; color:#1a1a2e; }
          .section { padding:16px 32px; border-bottom:1px solid #eeeeff; }
          .label { font-size:10px; text-transform:uppercase; color:#888899; margin-bottom:6px; letter-spacing:1px; }
          table { width:100%; border-collapse:collapse; }
          .pricing { padding:16px 32px; }
          .row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; }
          .total { border-top:2px solid #C62761; margin-top:8px; padding-top:10px; font-size:17px; font-weight:900; }
          .footer { padding:12px 32px; font-size:10px; color:#888899; background:#f9f9ff; text-align:center; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="bar"></div>
          <div class="header">
            <div>
              <div class="brand">🌉 The Bridge</div>
              <small style="color:#666688">9antra Formation Professionnelle</small>
            </div>
            <div style="text-align:right;">
              <small style="color:#888899">Reçu Parcours Personnalisé</small>
              <div style="font-family:monospace; font-weight:800; color:#C62761;">${combo.receiptRef || 'BRG-COMBO'}</div>
              <small style="color:#888899">${combo.createdAt || new Date().toLocaleDateString('fr-FR')}</small>
            </div>
          </div>
          <div class="section">
            <div class="label">Bénéficiaire</div>
            <div style="font-weight:700;">${this.user?.prenom || ''} ${this.user?.nom || ''}</div>
            <small style="color:#666688;">${this.user?.email || ''}</small>
          </div>
          <div class="section">
            <div class="label">Formations incluses (${combo.formations?.length || 0})</div>
            <table>
              <tbody>${formationsHtml}</tbody>
            </table>
          </div>
          <div class="pricing">
            <div class="row"><span>Sous-total</span><span>${(combo.totalPrice || 0).toFixed(0)} TND</span></div>
            <div class="row" style="color:#F5A623; font-weight:700;">
              <span>Remise combo (${combo.discountPercent || 0}%)</span>
              <span>- ${((combo.totalPrice || 0) - (combo.finalPrice || 0)).toFixed(0)} TND</span>
            </div>
            <div class="row total">
              <span>TOTAL</span>
              <span style="color:#C62761;">${(combo.finalPrice || 0).toFixed(0)} TND</span>
            </div>
          </div>
          <div class="footer">
            Statut du paiement : <strong>${combo.status === 'ACTIVE' ? '✓ PAYÉ (Stripe)' : '⏳ EN ATTENTE DE PAIEMENT'}</strong><br>
            The Bridge — 9antra | Plateforme certifiée
          </div>
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
      printWin.close();
    }, 500);
  }
}
