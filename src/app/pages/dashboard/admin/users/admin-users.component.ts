import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-syne font-bold text-2xl text-white">👥 Gestion des Utilisateurs</h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">
            {{ filtered.length }} utilisateur(s) trouvé(s)
          </p>
        </div>
      </div>

      <!-- Search + Filters -->
      <div class="bridge-card p-4 flex flex-wrap gap-3">
        <input
          [(ngModel)]="searchQ"
          (ngModelChange)="applyFilter()"
          placeholder="Rechercher par nom, email..."
          aria-label="Rechercher un utilisateur par nom ou email"
          class="bridge-input flex-1 min-w-48 text-sm"
        />
        <select
          [(ngModel)]="filterRole"
          (ngModelChange)="applyFilter()"
          aria-label="Filtrer par rôle"
          class="bridge-input text-sm"
        >
          <option value="">Tous les rôles</option>
          <option value="STAGIAIRE">Stagiaires</option>
          <option value="FORMATEUR">Formateurs</option>
          <option value="ADMIN">Admins</option>
        </select>
        <select
          [(ngModel)]="filterStatus"
          (ngModelChange)="applyFilter()"
          aria-label="Filtrer par statut"
          class="bridge-input text-sm"
        >
          <option value="">Tous les statuts</option>
          <option value="ACTIVE">Actif</option>
          <option value="INACTIVE">Inactif</option>
          <option value="BANNED">Banni</option>
        </select>
      </div>

      <!-- Users table -->
      <div class="bridge-card overflow-hidden">
        <div [class]="expanded ? '' : 'max-h-[550px] overflow-y-auto'">
          <table class="w-full text-sm">
            <thead class="border-b border-[var(--bridge-border)] sticky top-0 bg-[#10102A]">
              <tr>
                <th
                  class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                >
                  Utilisateur
                </th>
                <th
                  class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                >
                  Rôle
                </th>
                <th
                  class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                >
                  Statut
                </th>
                <th
                  class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                >
                  Inscription
                </th>
                <th
                  class="text-right py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr *ngFor="let u of filtered" class="hover:bg-white/[0.02] transition-colors group">
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <img
                      [src]="u.avatar"
                      class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      alt=""
                      onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=U&backgroundColor=c62761'"
                    />
                    <div>
                      <p class="text-sm font-semibold text-white">{{ u.prenom }} {{ u.nom }}</p>
                      <p class="text-xs text-[var(--bridge-text-muted)]">{{ u.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span
                    [class]="getRoleClass(u.role)"
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                    >{{ u.role }}</span
                  >
                </td>
                <td class="py-3 px-4">
                  <span
                    [class]="getStatusClass(u.status)"
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                    >{{ u.status }}</span
                  >
                </td>
                <td class="py-3 px-4 text-xs text-[var(--bridge-text-muted)]">
                  {{ u.dateInscription | date: 'dd/MM/yyyy' }}
                </td>
                <td class="py-3 px-4 text-right">
                  <button
                    (click)="viewUser(u)"
                    class="text-xs text-[var(--bridge-crimson)] hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5"
                  >
                    Voir détails
                  </button>
                </td>
              </tr>
              <tr *ngIf="filtered.length === 0">
                <td colspan="5" class="text-center py-12 text-[var(--bridge-text-muted)]">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          class="px-4 py-3 border-t border-[var(--bridge-border)] flex items-center justify-between"
        >
          <span class="text-xs text-[var(--bridge-text-muted)]"
            >{{ filtered.length }} / {{ users.length }} utilisateurs</span
          >
          <button
            (click)="expanded = !expanded"
            class="text-xs text-[var(--bridge-crimson)] hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-white/5"
          >
            {{ expanded ? '▲ Réduire' : '▼ Tout afficher' }}
          </button>
        </div>
      </div>

      <!-- User Detail Modal -->
      <div *ngIf="selectedUser" class="modal-inline-overlay" (click)="selectedUser = null">
        <div class="modal-backdrop"></div>
        <div
          class="modal-panel w-full max-w-lg max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
        >
          <!-- Modal Top Accent Bar -->
          <div
            class="h-1 w-full bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623] rounded-t-3xl"
          ></div>
          <div class="p-7">
            <!-- Header -->
            <div class="flex items-start justify-between mb-7">
              <div class="flex items-center gap-4">
                <div class="relative">
                  <div
                    class="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[rgba(198,39,97,0.3)] shadow-[0_0_20px_rgba(198,39,97,0.2)]"
                  >
                    <img
                      [src]="selectedUser.avatar"
                      class="w-full h-full object-cover"
                      alt=""
                      onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=U&backgroundColor=C62761'"
                    />
                  </div>
                  <div
                    class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#101026]"
                    [class]="
                      selectedUser.status === 'ACTIVE'
                        ? 'bg-emerald-400'
                        : selectedUser.status === 'BANNED'
                          ? 'bg-red-400'
                          : 'bg-yellow-400'
                    "
                  ></div>
                </div>
                <div>
                  <h3 class="font-syne font-bold text-xl text-white">
                    {{ selectedUser.firstName }} {{ selectedUser.lastName }}
                  </h3>
                  <p class="text-sm text-[var(--bridge-text-muted)] mt-0.5">
                    {{ selectedUser.email }}
                  </p>
                  <div class="flex items-center gap-2 mt-2">
                    <span
                      [class]="getRoleClass(selectedUser.role)"
                      class="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                      >{{ selectedUser.role }}</span
                    >
                    <span
                      [class]="getStatusClass(selectedUser.status)"
                      class="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                      >{{ selectedUser.status }}</span
                    >
                  </div>
                </div>
              </div>
              <button
                (click)="selectedUser = null"
                class="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/5 hover:border-white/10"
              >
                <span class="text-lg leading-none">✕</span>
              </button>
            </div>

            <!-- Info Grid -->
            <div class="grid grid-cols-2 gap-3 mb-6">
              <div
                class="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06] hover:border-[rgba(198,39,97,0.15)] transition-colors"
              >
                <p
                  class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-1"
                >
                  Âge
                </p>
                <p class="text-base text-white font-semibold">
                  {{ selectedUser.age || '—' }} <span class="text-xs text-white/40">ans</span>
                </p>
              </div>
              <div
                class="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06] hover:border-[rgba(198,39,97,0.15)] transition-colors"
              >
                <p
                  class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-1"
                >
                  Téléphone
                </p>
                <p class="text-base text-white font-semibold truncate">
                  {{ selectedUser.phone || '—' }}
                </p>
              </div>
              <div
                class="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06] hover:border-[rgba(198,39,97,0.15)] transition-colors"
              >
                <p
                  class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-1"
                >
                  Inscrit le
                </p>
                <p class="text-base text-white font-semibold">
                  {{ selectedUser.createdAt | date: 'dd/MM/yyyy' }}
                </p>
              </div>
              <div
                class="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06] hover:border-[rgba(198,39,97,0.15)] transition-colors"
              >
                <p
                  class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-1"
                >
                  Dernière activité
                </p>
                <p class="text-base text-white font-semibold">
                  {{ selectedUser.lastActivity | date: 'dd/MM/yyyy' }}
                </p>
              </div>
              <div
                class="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06] hover:border-[rgba(198,39,97,0.15)] transition-colors"
              >
                <p
                  class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-1"
                >
                  Fournisseur auth
                </p>
                <p class="text-base text-white font-semibold">
                  {{ selectedUser.authProvider || '—' }}
                </p>
              </div>
              <div
                class="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06] hover:border-[rgba(198,39,97,0.15)] transition-colors overflow-hidden"
              >
                <p
                  class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-1"
                >
                  ID
                </p>
                <p class="text-sm text-white font-mono truncate">{{ selectedUser.id }}</p>
              </div>
            </div>

            <!-- Divider -->
            <div
              class="h-px bg-gradient-to-r from-transparent via-[rgba(198,39,97,0.2)] to-transparent mb-5"
            ></div>

            <!-- Actions -->
            <div>
              <p
                class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-3"
              >
                Changer le statut
              </p>
              <div class="flex gap-3">
                <select [(ngModel)]="newStatus" class="bridge-input flex-1 text-sm">
                  <option value="">Sélectionner un statut...</option>
                  <option value="ACTIVE">✅ ACTIVE</option>
                  <option value="INACTIVE">⏸ INACTIVE</option>
                  <option value="BANNED">🚫 BANNED</option>
                </select>
                <button
                  (click)="changeStatus()"
                  [disabled]="!newStatus"
                  class="px-5 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(198,39,97,0.2)]"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  filtered: any[] = [];
  searchQ = '';
  filterRole = '';
  filterStatus = '';
  expanded = false;
  selectedUser: any = null;
  newStatus = '';

  constructor(
    private userService: UserService,
    private adminService: AdminService,
  ) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilter();
      },
    });
  }

  applyFilter(): void {
    this.filtered = this.users.filter((u) => {
      const q = this.searchQ.toLowerCase();
      const matchQ =
        !q ||
        u.prenom?.toLowerCase().includes(q) ||
        u.nom?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q);
      const matchRole = !this.filterRole || u.role === this.filterRole;
      const matchStatus = !this.filterStatus || u.status === this.filterStatus;
      return matchQ && matchRole && matchStatus;
    });
  }

  viewUser(u: any): void {
    this.adminService.getUserById(+u.id).subscribe({
      next: (details) => {
        this.selectedUser = details;
        this.newStatus = '';
      },
      error: () => {
        this.selectedUser = {
          id: u.id,
          firstName: u.prenom,
          lastName: u.nom,
          email: u.email,
          role: u.role,
          status: u.status,
          avatar: u.avatar,
          age: u.age,
        };
      },
    });
  }

  changeStatus(): void {
    if (!this.selectedUser || !this.newStatus) return;
    this.adminService.updateUserStatus(this.selectedUser.id, this.newStatus).subscribe({
      next: () => {
        this.selectedUser.status = this.newStatus;
        const u = this.users.find((x) => x.id === this.selectedUser.id.toString());
        if (u) u.status = this.newStatus;
        this.applyFilter();
        this.newStatus = '';
      },
    });
  }

  getRoleClass(role: string): string {
    if (role === 'ADMIN') return 'bg-red-500/10 text-red-400 border border-red-500/20';
    if (role === 'FORMATEUR') return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
  }

  getStatusClass(status: string): string {
    if (status === 'ACTIVE')
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (status === 'BANNED') return 'bg-red-500/10 text-red-400 border border-red-500/20';
    return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
  }
}
