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
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">{{ filtered.length }} utilisateur(s) trouvé(s)</p>
        </div>
      </div>

      <!-- Search + Filters -->
      <div class="bridge-card p-4 flex flex-wrap gap-3">
        <input [(ngModel)]="searchQ" (ngModelChange)="applyFilter()" 
               placeholder="Rechercher par nom, email..." class="bridge-input flex-1 min-w-48 text-sm">
        <select [(ngModel)]="filterRole" (ngModelChange)="applyFilter()" class="bridge-input text-sm">
          <option value="">Tous les rôles</option>
          <option value="STAGIAIRE">Stagiaires</option>
          <option value="FORMATEUR">Formateurs</option>
          <option value="ADMIN">Admins</option>
        </select>
        <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()" class="bridge-input text-sm">
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
                <th class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Utilisateur</th>
                <th class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Rôle</th>
                <th class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Statut</th>
                <th class="text-left py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Inscription</th>
                <th class="text-right py-3 px-4 text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr *ngFor="let u of filtered" class="hover:bg-white/[0.02] transition-colors group">
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <img [src]="u.avatar" class="w-8 h-8 rounded-full object-cover flex-shrink-0" alt=""
                         onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=U&backgroundColor=c62761'">
                    <div>
                      <p class="text-sm font-semibold text-white">{{ u.prenom }} {{ u.nom }}</p>
                      <p class="text-xs text-[var(--bridge-text-muted)]">{{ u.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span [class]="getRoleClass(u.role)" class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{{ u.role }}</span>
                </td>
                <td class="py-3 px-4">
                  <span [class]="getStatusClass(u.status)" class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{{ u.status }}</span>
                </td>
                <td class="py-3 px-4 text-xs text-[var(--bridge-text-muted)]">{{ u.dateInscription | date:'dd/MM/yyyy' }}</td>
                <td class="py-3 px-4 text-right">
                  <button (click)="viewUser(u)" 
                          class="text-xs text-[var(--bridge-crimson)] hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5">
                    Voir détails
                  </button>
                </td>
              </tr>
              <tr *ngIf="filtered.length === 0">
                <td colspan="5" class="text-center py-12 text-[var(--bridge-text-muted)]">Aucun utilisateur trouvé</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 border-t border-[var(--bridge-border)] flex items-center justify-between">
          <span class="text-xs text-[var(--bridge-text-muted)]">{{ filtered.length }} / {{ users.length }} utilisateurs</span>
          <button (click)="expanded = !expanded" class="text-xs text-[var(--bridge-crimson)] hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-white/5">
            {{ expanded ? '▲ Réduire' : '▼ Tout afficher' }}
          </button>
        </div>
      </div>

      <!-- User Detail Modal -->
      <div *ngIf="selectedUser" class="fixed inset-0 z-50 flex items-center justify-center" (click)="selectedUser=null">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div class="relative bg-[#10102A] rounded-2xl border border-[var(--bridge-border)] p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
             (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center gap-4">
              <img [src]="selectedUser.avatar" class="w-16 h-16 rounded-2xl object-cover border border-[var(--bridge-border)]" alt="">
              <div>
                <h3 class="font-syne font-bold text-xl text-white">{{ selectedUser.firstName }} {{ selectedUser.lastName }}</h3>
                <p class="text-sm text-[var(--bridge-text-muted)]">{{ selectedUser.email }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span [class]="getRoleClass(selectedUser.role)" class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{{ selectedUser.role }}</span>
                  <span [class]="getStatusClass(selectedUser.status)" class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{{ selectedUser.status }}</span>
                </div>
              </div>
            </div>
            <button (click)="selectedUser=null" class="text-white/50 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-all">✕</button>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-white/5 rounded-xl p-3">
              <p class="text-xs text-[var(--bridge-text-muted)]">Âge</p>
              <p class="text-sm text-white font-medium mt-1">{{ selectedUser.age }} ans</p>
            </div>
            <div class="bg-white/5 rounded-xl p-3">
              <p class="text-xs text-[var(--bridge-text-muted)]">Téléphone</p>
              <p class="text-sm text-white font-medium mt-1">{{ selectedUser.phone || 'Non renseigné' }}</p>
            </div>
            <div class="bg-white/5 rounded-xl p-3">
              <p class="text-xs text-[var(--bridge-text-muted)]">Date d'inscription</p>
              <p class="text-sm text-white font-medium mt-1">{{ selectedUser.createdAt | date:'dd/MM/yyyy' }}</p>
            </div>
            <div class="bg-white/5 rounded-xl p-3">
              <p class="text-xs text-[var(--bridge-text-muted)]">Dernière activité</p>
              <p class="text-sm text-white font-medium mt-1">{{ selectedUser.lastActivity | date:'dd/MM/yyyy' }}</p>
            </div>
            <div class="bg-white/5 rounded-xl p-3">
              <p class="text-xs text-[var(--bridge-text-muted)]">Fournisseur auth</p>
              <p class="text-sm text-white font-medium mt-1">{{ selectedUser.authProvider }}</p>
            </div>
            <div class="bg-white/5 rounded-xl p-3">
              <p class="text-xs text-[var(--bridge-text-muted)]">ID</p>
              <p class="text-sm text-white font-medium mt-1 font-mono">{{ selectedUser.id }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 mt-6">
            <select [(ngModel)]="newStatus" class="bridge-input flex-1 text-sm">
              <option value="">Changer le statut...</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="BANNED">BANNED</option>
            </select>
            <button (click)="changeStatus()" [disabled]="!newStatus" class="bridge-btn-primary px-4 py-2 text-sm disabled:opacity-50">
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  `
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

  constructor(private userService: UserService, private adminService: AdminService) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => { this.users = users; this.applyFilter(); }
    });
  }

  applyFilter(): void {
    this.filtered = this.users.filter(u => {
      const q = this.searchQ.toLowerCase();
      const matchQ = !q || u.prenom?.toLowerCase().includes(q) || u.nom?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
      const matchRole = !this.filterRole || u.role === this.filterRole;
      const matchStatus = !this.filterStatus || u.status === this.filterStatus;
      return matchQ && matchRole && matchStatus;
    });
  }

  viewUser(u: any): void {
    this.adminService.getUserById(+u.id).subscribe({
      next: (details) => { this.selectedUser = details; this.newStatus = ''; },
      error: () => { this.selectedUser = { id: u.id, firstName: u.prenom, lastName: u.nom, email: u.email, role: u.role, status: u.status, avatar: u.avatar, age: u.age }; }
    });
  }

  changeStatus(): void {
    if (!this.selectedUser || !this.newStatus) return;
    this.adminService.updateUserStatus(this.selectedUser.id, this.newStatus).subscribe({
      next: () => {
        this.selectedUser.status = this.newStatus;
        const u = this.users.find(x => x.id === this.selectedUser.id.toString());
        if (u) u.status = this.newStatus;
        this.applyFilter();
        this.newStatus = '';
      }
    });
  }

  getRoleClass(role: string): string {
    if (role === 'ADMIN') return 'bg-red-500/10 text-red-400 border border-red-500/20';
    if (role === 'FORMATEUR') return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
  }

  getStatusClass(status: string): string {
    if (status === 'ACTIVE') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (status === 'BANNED') return 'bg-red-500/10 text-red-400 border border-red-500/20';
    return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
  }
}
