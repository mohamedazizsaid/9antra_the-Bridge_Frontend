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

@Component({
  selector: 'app-formations-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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

        <div class="flex items-center gap-3">
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
            📦 {{ showArchived ? 'Actives' : 'Archivées' }}
          </button>

          <!-- Add formation button (Admin only) -->
          <button
            *ngIf="isAdmin"
            routerLink="/dashboard/formations/new"
            class="bridge-btn-primary px-4 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <span>➕ Nouvelle Formation</span>
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
          <span>🌐 Toutes les formations</span>
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
          <span>🎓 Mes inscriptions</span>
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
          <span>✨ Disponibles à l'inscription</span>
          <span class="text-[10px] font-mono opacity-70">({{ availableCount }})</span>
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
      <!-- GRID VIEW                                                   -->
      <!-- ═══════════════════════════════════════════════════════════ -->
      <div *ngIf="!loading && viewMode === 'grid'" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  *ngIf="isStagiaire && !isEnrolled(f.id)"
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
                  *ngIf="!isEnrolled(f.id)"
                  (click)="enrollFormation(f, $event)"
                  [disabled]="enrollingId === f.id"
                  class="w-full py-2 px-4 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span *ngIf="enrollingId === f.id" class="animate-spin">⏳</span>
                  <span>{{
                    enrollingId === f.id
                      ? 'Inscription...'
                      : "S'inscrire (" + (f.totalPrice || 0) + ' TND) →'
                  }}</span>
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
        *ngIf="!loading && viewMode === 'list'"
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
                <p
                  class="font-semibold text-white text-sm group-hover:text-[#F5A623] transition-colors truncate"
                >
                  {{ f.nom }}
                </p>
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
                *ngIf="isStagiaire && !isEnrolled(f.id)"
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
                *ngIf="isStagiaire && !isEnrolled(f.id)"
                (click)="enrollFormation(f, $event)"
                [disabled]="enrollingId === f.id"
                class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow"
              >
                {{ enrollingId === f.id ? '...' : "S'inscrire" }}
              </button>

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
  stagiaireViewFilter: 'all' | 'mine' | 'available' = 'all';

  // Stagiaire Enrolled IDs Set
  enrolledFormationIds: Set<string> = new Set();
  enrollingId: string | null = null;

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

  constructor(
    private formationService: FormationService,
    private authService: AuthService,
    private enrollmentService: EnrollmentService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadFormations();
    if (this.isStagiaire && this.user) {
      this.loadStagiaireEnrollments();
    }
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
    this.formationService.getFormationsByStagiaire(this.user.id).subscribe({
      next: (myList) => {
        this.enrolledFormationIds = new Set((myList || []).map((f) => f.id.toString()));
      },
      error: () => {},
    });
  }

  enrollFormation(f: Formation, event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.user) return;

    this.enrollingId = f.id;
    const studentId = parseInt(this.user.id);
    const formationId = parseInt(f.id);

    this.enrollmentService.enrollStudent(studentId, formationId).subscribe({
      next: () => {
        this.enrollingId = null;
        this.enrolledFormationIds.add(f.id.toString());
        this.toastService.success(
          `Vous êtes désormais inscrit à la formation « ${f.nom} » !`,
          '🎉 Inscription validée',
        );
      },
      error: (err: any) => {
        this.enrollingId = null;
        this.toastService.error(
          err?.error?.message || "Erreur lors de l'inscription à la formation.",
          'Inscription',
        );
      },
    });
  }

  openFormation(f: Formation): void {
    if (this.user?.role === 'ADMIN') {
      this.router.navigate([`/dashboard/formations/${f.id}`]);
    } else if (this.user?.role === 'FORMATEUR') {
      this.router.navigate([`/dashboard/formateur/formations/${f.id}`]);
    } else {
      this.router.navigate([`/dashboard/stagiaire/formations/${f.id}`]);
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
}
