import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormationService } from '../../../core/services/formation.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Formation } from '../../../core/models/formation.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-formations-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fadein">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="font-syne font-bold text-2xl md:text-3xl text-white">
            🎓 Gestion des <span class="bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text text-transparent">Formations</span>
          </h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">
            {{ isAdmin ? 'Administration de toutes les formations.' : 'Gérez vos programmes de formation.' }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Archive toggle -->
          <button (click)="showArchived = !showArchived"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                  [class]="showArchived ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'">
            📦 {{ showArchived ? 'Actives' : 'Archivées' }}
          </button>
          <button *ngIf="canCreate"
                  routerLink="/dashboard/formations/new"
                  class="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02] shadow-[0_0_20px_rgba(198,39,97,0.3)]">
            ➕ Nouvelle Formation
          </button>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div *ngIf="loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let i of [1,2,3]"
             class="glass-card border border-[var(--bridge-border)] p-6 space-y-4 animate-pulse">
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
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
          <input [(ngModel)]="searchQuery" type="text" placeholder="Rechercher une formation..."
                 class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors" />
        </div>
        <select [(ngModel)]="filterCategory"
                class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors">
          <option value="" class="bg-[#10102A]">Toutes les catégories</option>
          <option *ngFor="let cat of categories" [value]="cat" class="bg-[#10102A]">{{ cat }}</option>
        </select>
        <div class="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          <button (click)="viewMode = 'grid'"
                  class="px-3 py-2 rounded-lg text-sm transition-all"
                  [class]="viewMode === 'grid' ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white' : 'text-white/40 hover:text-white'">
            ⊞
          </button>
          <button (click)="viewMode = 'list'"
                  class="px-3 py-2 rounded-lg text-sm transition-all"
                  [class]="viewMode === 'list' ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white' : 'text-white/40 hover:text-white'">
            ☰
          </button>
        </div>
      </div>

      <!-- Grid View -->
      <div *ngIf="!loading && viewMode === 'grid'" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let f of filteredFormations; let i = index"
             class="glass-card border p-6 flex flex-col justify-between cursor-pointer group transition-all duration-300 relative"
             [class]="f.archived
               ? 'border-amber-500/20 opacity-60 hover:opacity-80 hover:border-amber-500/40'
               : 'border-[var(--bridge-border)] hover:border-[#C62761]/40 hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(198,39,97,0.12)]'"
             [style.animation-delay]="(i * 70) + 'ms'"
             style="animation: fadeSlideIn 0.4s ease both">

          <!-- Archived ribbon -->
          <div *ngIf="f.archived" class="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full font-bold uppercase tracking-wide">
            📦 Archivée
          </div>

          <!-- Top Row -->
          <div>
            <div class="flex justify-between items-start mb-4">
              <span class="text-[10px] px-2.5 py-1 bg-white/5 rounded-full text-white/60 uppercase font-mono tracking-wider font-semibold border border-white/10">
                {{ f.category || 'Général' }}
              </span>
              <div class="flex items-center gap-2">
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border"
                      [class]="getStatusClass(f.status)">
                  {{ getStatusLabel(f.status) }}
                </span>
                <span class="text-xs font-mono font-bold text-[#F5A623]">{{ f.totalPrice | number }} TND</span>
              </div>
            </div>

            <h3 class="font-syne font-bold text-lg text-white mb-2 group-hover:text-[#F5A623] transition-colors leading-snug">
              {{ f.nom }}
            </h3>
            <p class="text-xs text-[var(--bridge-text-muted)] line-clamp-3 mb-5 leading-relaxed">
              {{ f.description }}
            </p>
          </div>

          <!-- Progress -->
          <div>
            <div class="mb-4 space-y-1.5">
              <div class="flex justify-between text-[10px] text-white/40">
                <span>Progression globale</span>
                <span class="font-mono">{{ getOverallProgress(f) }}%</span>
              </div>
              <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-[#C62761] to-[#F5A623] transition-all duration-700"
                     [style.width]="getOverallProgress(f) + '%'"></div>
              </div>
            </div>

            <!-- Meta Info -->
            <div class="border-t border-white/5 pt-4 space-y-2.5">
              <div class="flex justify-between text-xs text-[var(--bridge-text-muted)]">
                <span>Formateur :</span>
                <span class="font-semibold text-[#C62761] truncate max-w-[140px]">{{ f.formateurNom || 'Non assigné' }}</span>
              </div>
              <div class="flex justify-between text-xs text-[var(--bridge-text-muted)]">
                <span>Stagiaires :</span>
                <span class="font-semibold text-white/60">{{ f.stagiaires?.length || 0 }}</span>
              </div>
            </div>

            <!-- Actions Bar -->
            <div class="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-white/5">
              <button class="text-xs text-[#C62761] font-semibold hover:text-[#F5A623] transition-colors" (click)="openFormation(f)">
                Voir les détails →
              </button>
              <div *ngIf="canManage(f)" class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <!-- Edit -->
                <button (click)="$event.stopPropagation(); openEditModal(f)"
                        class="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm transition-all" title="Modifier">
                  ✏️
                </button>
                <!-- Archive -->
                <button (click)="$event.stopPropagation(); toggleArchive(f)"
                        class="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all"
                        [class]="f.archived ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'"
                        [title]="f.archived ? 'Désarchiver' : 'Archiver'">
                  {{ f.archived ? '📂' : '📦' }}
                </button>
                <!-- Delete (admin only) -->
                <button *ngIf="isAdmin" (click)="$event.stopPropagation(); confirmDelete(f)"
                        class="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center text-sm transition-all" title="Supprimer">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div *ngIf="!loading && viewMode === 'list'" class="glass-card border border-[var(--bridge-border)] overflow-hidden">
        <div class="grid gap-4 px-5 py-3 bg-white/[0.02] border-b border-white/5"
             [class]="canCreateAny ? 'grid-cols-[1fr_auto_auto_auto_auto]' : 'grid-cols-[1fr_auto_auto_auto]'">
          <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Formation</span>
          <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-center">Phases</span>
          <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-center">Statut</span>
          <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-right">Prix</span>
          <span *ngIf="canCreateAny" class="text-[10px] text-white/40 uppercase tracking-widest font-semibold text-right">Actions</span>
        </div>
        <div class="divide-y divide-white/[0.03]">
          <div *ngFor="let f of filteredFormations; let i = index"
               class="grid gap-4 px-5 py-4 hover:bg-white/[0.02] cursor-pointer transition-colors group items-center"
               [class]="(canCreateAny ? 'grid-cols-[1fr_auto_auto_auto_auto]' : 'grid-cols-[1fr_auto_auto_auto]') + (f.archived ? ' opacity-60' : '')"
               [style.animation-delay]="(i * 40) + 'ms'"
               style="animation: fadeSlideIn 0.3s ease both"
               (click)="openFormation(f)">
            <div class="min-w-0 flex items-center gap-2">
              <div>
                <p class="font-semibold text-white text-sm group-hover:text-[#F5A623] transition-colors truncate">{{ f.nom }}</p>
                <p class="text-xs text-white/40 mt-0.5">{{ f.formateurNom }} · {{ f.category }}</p>
              </div>
              <span *ngIf="f.archived" class="text-[9px] px-1.5 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full font-bold uppercase shrink-0">Archivée</span>
            </div>
            <div class="flex items-center justify-center gap-1">
              <span *ngFor="let p of f.phases; let pi = index"
                    class="w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center"
                    [class]="getPhaseChipClass(p.status)">
                {{ pi + 1 }}
              </span>
            </div>
            <div class="flex items-center justify-center">
              <span class="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border"
                    [class]="getStatusClass(f.status)">
                {{ getStatusLabel(f.status) }}
              </span>
            </div>
            <div class="flex items-center justify-end">
              <span class="text-sm font-mono font-bold text-[#F5A623]">{{ f.totalPrice | number }} TND</span>
            </div>
            <div *ngIf="canCreateAny" class="flex items-center justify-end gap-1.5" (click)="$event.stopPropagation()">
              <button *ngIf="canManage(f)" (click)="openEditModal(f)"
                      class="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs transition-all opacity-0 group-hover:opacity-100" title="Modifier">✏️</button>
              <button *ngIf="canManage(f)" (click)="toggleArchive(f)"
                      class="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all opacity-0 group-hover:opacity-100"
                      [class]="f.archived ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'"
                      [title]="f.archived ? 'Désarchiver' : 'Archiver'">{{ f.archived ? '📂' : '📦' }}</button>
              <button *ngIf="isAdmin && canManage(f)" (click)="confirmDelete(f)"
                      class="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center text-xs transition-all opacity-0 group-hover:opacity-100" title="Supprimer">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredFormations.length === 0"
           class="glass-card border border-[var(--bridge-border)] p-16 text-center">
        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-[rgba(198,39,97,0.1)] to-[rgba(245,166,35,0.05)] flex items-center justify-center text-4xl mx-auto mb-6">
          {{ showArchived ? '📦' : '📚' }}
        </div>
        <p class="font-syne font-bold text-xl text-white">{{ showArchived ? 'Aucune formation archivée' : 'Aucune formation disponible' }}</p>
        <p class="text-[var(--bridge-text-muted)] text-sm mt-3 mb-8 max-w-md mx-auto leading-relaxed">
          {{ showArchived ? 'Les formations archivées apparaîtront ici.' : 'Créez le tout premier programme d\'enseignement.' }}
        </p>
        <button *ngIf="canCreate && !showArchived"
                routerLink="/dashboard/formations/new"
                class="px-6 py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white rounded-xl text-sm font-bold transition-all hover:opacity-90 shadow-[0_0_20px_rgba(198,39,97,0.3)]">
          ➕ Créer un programme
        </button>
      </div>

      <!-- ═══ EDIT MODAL ═══ -->
      <div *ngIf="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="closeEditModal()">
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
                <button (click)="closeEditModal()" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all text-sm">✕</button>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Titre</label>
                  <input [(ngModel)]="editForm.nom" type="text"
                         class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors" />
                </div>
                <div>
                  <label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea [(ngModel)]="editForm.description" rows="3"
                            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-[#C62761] transition-colors"></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Catégorie</label>
                    <input [(ngModel)]="editForm.category" type="text"
                           class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors" />
                  </div>
                  <div>
                    <label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Prix total (TND)</label>
                    <input [(ngModel)]="editForm.totalPrice" type="number" min="0"
                           class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs text-white/50 uppercase tracking-wider mb-1.5">Statut</label>
                  <select [(ngModel)]="editForm.status"
                          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors">
                    <option value="PLANIFIEE" class="bg-[#10102A]">Planifiée</option>
                    <option value="ACTIVE" class="bg-[#10102A]">Active</option>
                    <option value="TERMINEE" class="bg-[#10102A]">Terminée</option>
                  </select>
                </div>
              </div>

              <div class="flex gap-3 mt-6">
                <button (click)="closeEditModal()" class="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold text-sm transition-all border border-white/10">
                  Annuler
                </button>
                <button (click)="saveEdit()" [disabled]="saving"
                        class="flex-1 py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                  <span *ngIf="saving" class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  {{ saving ? 'Enregistrement…' : '✓ Sauvegarder' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ DELETE CONFIRM MODAL ═══ -->
      <div *ngIf="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="closeDeleteModal()">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div class="relative z-10 w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="glass-card border border-red-500/30 overflow-hidden">
            <div class="h-1 bg-gradient-to-r from-red-600 to-red-400"></div>
            <div class="p-6 text-center">
              <div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-3xl mx-auto mb-4">🗑️</div>
              <h3 class="font-syne font-bold text-lg text-white">Supprimer la formation ?</h3>
              <p class="text-white/50 text-sm mt-2 leading-relaxed">
                <span class="text-[#F5A623] font-semibold">{{ formationToDelete?.nom }}</span><br>
                Cette action est irréversible. Toutes les phases, séances et données associées seront supprimées.
              </p>
              <div class="flex gap-3 mt-6">
                <button (click)="closeDeleteModal()" class="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold text-sm transition-all border border-white/10">
                  Annuler
                </button>
                <button (click)="executeDelete()" [disabled]="saving"
                        class="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                  <span *ngIf="saving" class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  {{ saving ? 'Suppression…' : '🗑️ Supprimer définitivement' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <style>
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadein { animation: fadeSlideIn 0.4s ease both; }
    </style>
  `
})
export class FormationsListComponent implements OnInit {
  formations: Formation[] = [];
  user: User | null = null;
  loading = true;
  searchQuery = '';
  filterCategory = '';
  viewMode: 'grid' | 'list' = 'grid';
  showArchived = false;

  // Edit modal
  showEditModal = false;
  editingFormation: Formation | null = null;
  editForm = { nom: '', description: '', category: '', totalPrice: 0, status: 'PLANIFIEE' as Formation['status'] };
  saving = false;

  // Delete modal
  showDeleteModal = false;
  formationToDelete: Formation | null = null;

  get isAdmin(): boolean { return this.user?.role === 'ADMIN'; }
  get isFormateur(): boolean { return this.user?.role === 'FORMATEUR'; }

  get canCreate(): boolean {
    return this.user?.role === 'ADMIN' || this.user?.role === 'FORMATEUR';
  }

  get canCreateAny(): boolean {
    return this.user?.role === 'ADMIN' || this.user?.role === 'FORMATEUR';
  }

  canManage(f: Formation): boolean {
    if (this.isAdmin) return true;
    if (this.isFormateur && f.formateurId === this.user?.id) return true;
    return false;
  }

  get categories(): string[] {
    const set = new Set(this.formations.map(f => f.category).filter(Boolean) as string[]);
    return Array.from(set);
  }

  get filteredFormations(): Formation[] {
    return this.formations.filter(f => {
      const matchArchived = this.showArchived ? f.archived === true : f.archived !== true;
      const matchSearch = !this.searchQuery.trim() ||
        f.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (f.description || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (f.formateurNom || '').toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchCat = !this.filterCategory || f.category === this.filterCategory;
      return matchArchived && matchSearch && matchCat;
    });
  }

  constructor(
    private formationService: FormationService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadFormations();
  }

  loadFormations(): void {
    this.loading = true;
    const obs = this.user?.role === 'FORMATEUR'
      ? this.formationService.getFormationsByFormateur(this.user!.id)
      : this.formationService.getFormations();
    obs.subscribe({
      next: (data) => { this.formations = data; this.loading = false; },
      error: () => { this.loading = false; }
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
    this.editingFormation = f;
    this.editForm = {
      nom: f.nom,
      description: f.description || '',
      category: f.category || '',
      totalPrice: f.totalPrice || 0,
      status: f.status || 'PLANIFIEE'
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingFormation = null;
    this.saving = false;
  }

  saveEdit(): void {
    if (!this.editingFormation || this.saving) return;
    this.saving = true;
    this.formationService.updateFormation(this.editingFormation.id, {
      nom: this.editForm.nom,
      description: this.editForm.description,
      category: this.editForm.category,
      totalPrice: this.editForm.totalPrice,
      status: this.editForm.status
    }).subscribe({
      next: (updated) => {
        const idx = this.formations.findIndex(f => f.id === updated.id);
        if (idx !== -1) this.formations[idx] = updated;
        this.toastService.success('Formation mise à jour avec succès !', '✏️ Modification');
        this.closeEditModal();
      },
      error: () => {
        this.saving = false;
        this.toastService.error('Erreur lors de la modification.', 'Modification');
      }
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
      error: () => this.toastService.error('Erreur lors de l\'archivage.', 'Archivage')
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
        this.formations = this.formations.filter(f => f.id !== this.formationToDelete!.id);
        this.toastService.success('Formation supprimée définitivement.', '🗑️ Suppression');
        this.closeDeleteModal();
      },
      error: () => {
        this.saving = false;
        this.toastService.error('Erreur lors de la suppression.', 'Suppression');
      }
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
      case 'COMPLETEE': return 'bg-emerald-500/20 text-emerald-400';
      case 'EN_COURS': return 'bg-[rgba(198,39,97,0.2)] text-[#C62761]';
      default: return 'bg-white/5 text-white/30';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'TERMINEE': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'PLANIFIEE': return 'bg-[rgba(245,166,35,0.1)] text-[#F5A623] border-[rgba(245,166,35,0.2)]';
      default: return 'bg-white/5 text-white/50 border-white/10';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE': return '● En cours';
      case 'TERMINEE': return '✓ Terminée';
      case 'PLANIFIEE': return '○ Planifiée';
      default: return status;
    }
  }
}
