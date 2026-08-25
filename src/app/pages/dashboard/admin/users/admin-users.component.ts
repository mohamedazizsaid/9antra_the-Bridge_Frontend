import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { AdminService } from '../../../../core/services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <!-- ─── Sliding Container ─── -->
      <div class="relative overflow-hidden w-full">
        <div
          class="flex transition-transform duration-500 ease-in-out w-full items-start"
          [style.transform]="selectedUser ? 'translateX(-100%)' : 'translateX(0%)'"
        >
          <!-- ─── PANEL 1: USERS LIST ─── -->
          <div class="w-full flex-shrink-0 min-w-full space-y-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[var(--bridge-gold)]/30 flex items-center justify-center text-[var(--bridge-gold)]"
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <h1 class="font-syne font-bold text-2xl text-white">Gestion des Utilisateurs</h1>
                  <p class="text-[var(--bridge-text-muted)] text-sm mt-0.5">
                    {{ filtered.length }} utilisateur(s) enregistré(s)
                  </p>
                </div>
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
                <option value="ACTIVE">Actif (ACTIVE)</option>
                <option value="INACTIVE">Inactif (INACTIVE)</option>
                <option value="PENDING">En attente (PENDING)</option>
                <option value="BANNED">Banni (BANNED)</option>
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
                    <tr
                      *ngFor="let u of filtered"
                      class="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-3">
                          <img
                            [src]="u.avatar"
                            class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            alt=""
                            onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=U&backgroundColor=c62761'"
                          />
                          <div>
                            <p class="text-sm font-semibold text-white">
                              {{ u.prenom }} {{ u.nom }}
                            </p>
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
                          class="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                          >{{ u.status }}</span
                        >
                      </td>
                      <td class="py-3 px-4 text-xs text-[var(--bridge-text-muted)]">
                        {{ u.dateInscription | date: 'dd/MM/yyyy' }}
                      </td>
                      <td class="py-3 px-4 text-right">
                        <button
                          (click)="viewUser(u)"
                          class="text-xs font-semibold text-[var(--bridge-crimson)] hover:text-white transition-colors px-2.5 py-1 rounded-lg hover:bg-white/5 flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <span>Voir détails</span>
                          <svg
                            class="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
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
                  class="text-xs text-[var(--bridge-crimson)] hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-white/5 cursor-pointer"
                >
                  {{ expanded ? '▲ Réduire' : '▼ Tout afficher' }}
                </button>
              </div>
            </div>
          </div>

          <!-- ─── PANEL 2: USER DETAILS & STATUS SLIDE VIEW ─── -->
          <div class="w-full flex-shrink-0 min-w-full space-y-6">
            <!-- Return Button Header -->
            <div class="flex items-center justify-between">
              <button
                (click)="selectedUser = null"
                class="bridge-btn-secondary px-4 py-2 text-xs flex items-center gap-2 cursor-pointer group"
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
                <span>Retour à la liste des utilisateurs</span>
              </button>
            </div>

            <!-- Details Card -->
            <div
              *ngIf="selectedUser"
              class="bridge-card p-6 md:p-8 relative overflow-hidden animate-fadeIn"
            >
              <div
                class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623]"
              ></div>

              <!-- Profile Header -->
              <div
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[var(--bridge-border)]"
              >
                <div class="flex items-center gap-5">
                  <div class="relative flex-shrink-0">
                    <div
                      class="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[var(--bridge-crimson)]/40 shadow-xl"
                    >
                      <img
                        [src]="selectedUser.avatar"
                        class="w-full h-full object-cover"
                        alt="Avatar"
                        onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=U&backgroundColor=c62761'"
                      />
                    </div>
                    <div
                      class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#101026]"
                      [class]="
                        selectedUser.status === 'ACTIVE'
                          ? 'bg-emerald-400'
                          : selectedUser.status === 'BANNED'
                            ? 'bg-red-400'
                            : selectedUser.status === 'PENDING'
                              ? 'bg-sky-400'
                              : 'bg-amber-400'
                      "
                    ></div>
                  </div>
                  <div>
                    <h2 class="font-syne font-bold text-2xl text-white">
                      {{ selectedUser.firstName || selectedUser.prenom }}
                      {{ selectedUser.lastName || selectedUser.nom }}
                    </h2>
                    <p class="text-sm text-[var(--bridge-text-muted)] mt-0.5">
                      {{ selectedUser.email }}
                    </p>
                    <div class="flex items-center gap-2 mt-3">
                      <span
                        [class]="getRoleClass(selectedUser.role)"
                        class="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                      >
                        {{ selectedUser.role }}
                      </span>
                      <span
                        [class]="getStatusClass(selectedUser.status)"
                        class="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <span
                          class="w-1.5 h-1.5 rounded-full"
                          [class]="
                            selectedUser.status === 'ACTIVE'
                              ? 'bg-emerald-400'
                              : selectedUser.status === 'BANNED'
                                ? 'bg-red-400'
                                : selectedUser.status === 'PENDING'
                                  ? 'bg-sky-400'
                                  : 'bg-amber-400'
                          "
                        ></span>
                        {{ selectedUser.status }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Information Grid -->
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
                <div class="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  <p
                    class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                  >
                    Identifiant
                  </p>
                  <p class="text-sm font-mono font-bold text-white mt-1">#{{ selectedUser.id }}</p>
                </div>
                <div class="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  <p
                    class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                  >
                    Âge
                  </p>
                  <p class="text-sm font-bold text-white mt-1">{{ selectedUser.age || '—' }} ans</p>
                </div>
                <div class="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  <p
                    class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                  >
                    Téléphone
                  </p>
                  <p class="text-sm font-bold text-white mt-1 truncate">
                    {{ selectedUser.phone || '—' }}
                  </p>
                </div>
                <div class="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  <p
                    class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                  >
                    Date d'inscription
                  </p>
                  <p class="text-sm font-bold text-white mt-1">
                    {{
                      selectedUser.createdAt
                        ? (selectedUser.createdAt | date: 'dd/MM/yyyy HH:mm')
                        : (selectedUser.dateInscription | date: 'dd/MM/yyyy')
                    }}
                  </p>
                </div>
                <div class="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  <p
                    class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                  >
                    Dernière Activité
                  </p>
                  <p class="text-sm font-bold text-white mt-1">
                    {{
                      selectedUser.lastActivity
                        ? (selectedUser.lastActivity | date: 'dd/MM/yyyy HH:mm')
                        : 'Récemment'
                    }}
                  </p>
                </div>
                <div class="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  <p
                    class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold"
                  >
                    Fournisseur Auth
                  </p>
                  <p class="text-sm font-bold text-white mt-1">
                    {{ selectedUser.authProvider || 'LOCAL' }}
                  </p>
                </div>
              </div>

              <!-- Status Change Section (Synced with Backend Enum) -->
              <div class="pt-6 border-t border-[var(--bridge-border)]">
                <div class="flex items-center gap-2 mb-4">
                  <svg
                    class="w-4 h-4 text-[var(--bridge-gold)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <h3 class="font-syne font-bold text-base text-white">
                    Changer le statut en base de données
                  </h3>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <!-- ACTIVE -->
                  <button
                    (click)="updateStatusDirect('ACTIVE')"
                    [disabled]="statusUpdating || selectedUser.status === 'ACTIVE'"
                    class="p-4 rounded-xl border transition-all flex items-center gap-3.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    [class]="
                      selectedUser.status === 'ACTIVE'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'border-white/10 hover:border-emerald-500/40 text-white/70 hover:text-white bg-white/[0.02]'
                    "
                  >
                    <span class="w-3 h-3 rounded-full bg-emerald-400 flex-shrink-0"></span>
                    <div class="text-left">
                      <p class="text-xs font-bold">Actif (ACTIVE)</p>
                      <p class="text-[10px] text-white/40 mt-0.5">Accès autorisé</p>
                    </div>
                  </button>

                  <!-- INACTIVE -->
                  <button
                    (click)="updateStatusDirect('INACTIVE')"
                    [disabled]="statusUpdating || selectedUser.status === 'INACTIVE'"
                    class="p-4 rounded-xl border transition-all flex items-center gap-3.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    [class]="
                      selectedUser.status === 'INACTIVE'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,166,35,0.15)]'
                        : 'border-white/10 hover:border-amber-500/40 text-white/70 hover:text-white bg-white/[0.02]'
                    "
                  >
                    <span class="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0"></span>
                    <div class="text-left">
                      <p class="text-xs font-bold">Inactif (INACTIVE)</p>
                      <p class="text-[10px] text-white/40 mt-0.5">Compte en pause</p>
                    </div>
                  </button>

                  <!-- PENDING -->
                  <button
                    (click)="updateStatusDirect('PENDING')"
                    [disabled]="statusUpdating || selectedUser.status === 'PENDING'"
                    class="p-4 rounded-xl border transition-all flex items-center gap-3.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    [class]="
                      selectedUser.status === 'PENDING'
                        ? 'border-sky-500 bg-sky-500/10 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.15)]'
                        : 'border-white/10 hover:border-sky-500/40 text-white/70 hover:text-white bg-white/[0.02]'
                    "
                  >
                    <span class="w-3 h-3 rounded-full bg-sky-400 flex-shrink-0"></span>
                    <div class="text-left">
                      <p class="text-xs font-bold">En attente (PENDING)</p>
                      <p class="text-[10px] text-white/40 mt-0.5">Vérification requise</p>
                    </div>
                  </button>

                  <!-- BANNED -->
                  <button
                    (click)="updateStatusDirect('BANNED')"
                    [disabled]="statusUpdating || selectedUser.status === 'BANNED'"
                    class="p-4 rounded-xl border transition-all flex items-center gap-3.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    [class]="
                      selectedUser.status === 'BANNED'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                        : 'border-white/10 hover:border-rose-500/40 text-white/70 hover:text-white bg-white/[0.02]'
                    "
                  >
                    <span class="w-3 h-3 rounded-full bg-rose-400 flex-shrink-0"></span>
                    <div class="text-left">
                      <p class="text-xs font-bold">Banni (BANNED)</p>
                      <p class="text-[10px] text-white/40 mt-0.5">Accès verrouillé</p>
                    </div>
                  </button>
                </div>
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
  statusUpdating = false;

  constructor(
    private userService: UserService,
    private adminService: AdminService,
    private toastService: ToastService,
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

  updateStatusDirect(newStatus: string): void {
    if (!this.selectedUser || !newStatus) return;
    this.statusUpdating = true;
    const userName =
      `${this.selectedUser.firstName || this.selectedUser.prenom || ''} ${this.selectedUser.lastName || this.selectedUser.nom || ''}`.trim();

    this.adminService.updateUserStatus(this.selectedUser.id, newStatus).subscribe({
      next: (res: any) => {
        this.statusUpdating = false;
        this.selectedUser.status = newStatus;
        const u = this.users.find((x) => x.id.toString() === this.selectedUser.id.toString());
        if (u) {
          u.status = newStatus;
        }
        this.applyFilter();
        this.toastService.success(
          `Le statut de ${userName} a été mis à jour avec succès vers "${newStatus}" dans la base de données.`,
          'Statut Modifié',
        );
      },
      error: (e) => {
        this.statusUpdating = false;
        const err = e?.error?.message || 'Erreur lors de la mise à jour du statut';
        this.toastService.error(err, 'Erreur');
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
    if (status === 'INACTIVE') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    if (status === 'PENDING') return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
    if (status === 'BANNED') return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
  }
}
