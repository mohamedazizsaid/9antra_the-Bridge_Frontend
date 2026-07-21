import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-admin-formateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="font-syne font-bold text-2xl text-white">🎓 Formateurs</h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">Gestion des comptes formateurs</p>
        </div>
        <button (click)="showModal = true" class="bridge-btn-primary px-4 py-2.5 text-sm">+ Ajouter un formateur</button>
      </div>

      <!-- Formateurs list -->
      <div class="bridge-card overflow-hidden">
        <div class="px-5 py-4 border-b border-[var(--bridge-border)] flex items-center justify-between">
          <h3 class="font-semibold text-white">Liste des formateurs ({{ formateurs.length }})</h3>
        </div>
        <div [class]="expanded ? '' : 'max-h-[500px] overflow-y-auto'">
          <div class="divide-y divide-white/5">
            <div *ngFor="let f of formateurs" class="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-all group">
              <div class="flex items-center gap-3">
                <img [src]="f.avatar" class="w-10 h-10 rounded-full object-cover" alt="" onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed='+f.firstName+f.lastName">
                <div>
                  <p class="text-sm font-semibold text-white">{{ f.prenom }} {{ f.nom }}</p>
                  <p class="text-xs text-[var(--bridge-text-muted)]">{{ f.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span [class]="f.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'"
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{{ f.status }}</span>
                <span class="text-xs text-[var(--bridge-text-muted)]">{{ f.dateInscription | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
            <div *ngIf="formateurs.length === 0" class="text-center py-12 text-[var(--bridge-text-muted)]">
              Aucun formateur trouvé
            </div>
          </div>
        </div>
        <div class="px-5 py-3 border-t border-[var(--bridge-border)]">
          <button (click)="expanded = !expanded" class="text-xs text-[var(--bridge-crimson)] hover:text-white transition-colors">
            {{ expanded ? '▲ Réduire' : '▼ Voir tous (' + formateurs.length + ')' }}
          </button>
        </div>
      </div>

      <!-- Create Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center" (click)="showModal=false">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div class="relative bg-[#10102A] rounded-2xl border border-[var(--bridge-border)] p-6 w-full max-w-md shadow-2xl"
             (click)="$event.stopPropagation()">
          <h3 class="font-syne font-bold text-white text-xl mb-6">Créer un compte formateur</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Prénom *</label>
                <input [(ngModel)]="newFormateur.firstName" placeholder="Prénom" class="bridge-input w-full">
              </div>
              <div>
                <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Nom *</label>
                <input [(ngModel)]="newFormateur.lastName" placeholder="Nom" class="bridge-input w-full">
              </div>
            </div>
            <div>
              <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Email professionnel *</label>
              <input [(ngModel)]="newFormateur.email" type="email" placeholder="formateur@9antra.tn" class="bridge-input w-full">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Téléphone</label>
                <input [(ngModel)]="newFormateur.phone" placeholder="+216 xx xxx xxx" class="bridge-input w-full">
              </div>
              <div>
                <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Âge</label>
                <input [(ngModel)]="newFormateur.age" type="number" placeholder="Ex: 35" class="bridge-input w-full">
              </div>
            </div>
          </div>
          <div class="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mt-4">
            <p class="text-xs text-amber-400">
              ⚠️ Un email sera envoyé au formateur avec un mot de passe temporaire. Il devra le changer lors de sa première connexion.
            </p>
          </div>
          <div class="flex gap-3 mt-6">
            <button (click)="showModal=false" class="bridge-btn-secondary flex-1 py-2.5 text-sm">Annuler</button>
            <button (click)="createFormateur()" [disabled]="creating || !newFormateur.firstName || !newFormateur.lastName || !newFormateur.email"
                    class="bridge-btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">
              {{ creating ? '⏳ Création...' : '✅ Créer et envoyer email' }}
            </button>
          </div>
          <p *ngIf="createError" class="text-red-400 text-xs mt-3 text-center">{{ createError }}</p>
          <p *ngIf="createSuccess" class="text-emerald-400 text-xs mt-3 text-center animate-fadeIn">{{ createSuccess }}</p>
        </div>
      </div>
    </div>
  `
})
export class AdminFormateursComponent implements OnInit {
  formateurs: any[] = [];
  showModal = false;
  creating = false;
  expanded = false;
  createError = '';
  createSuccess = '';
  newFormateur: any = { firstName: '', lastName: '', email: '', phone: '', age: 30 };

  constructor(private adminService: AdminService, private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => { this.formateurs = users.filter(u => u.role === 'FORMATEUR'); }
    });
  }

  createFormateur(): void {
    this.creating = true;
    this.createError = '';
    this.adminService.createFormateur(this.newFormateur).subscribe({
      next: (result) => {
        this.creating = false;
        this.createSuccess = `✅ Formateur ${result.firstName} ${result.lastName} créé ! Email envoyé.`;
        this.formateurs.push({ prenom: result.firstName, nom: result.lastName, email: result.email, status: 'ACTIVE' });
        this.newFormateur = { firstName: '', lastName: '', email: '', phone: '', age: 30 };
        setTimeout(() => { this.showModal = false; this.createSuccess = ''; }, 3000);
      },
      error: (e) => {
        this.creating = false;
        this.createError = e?.error?.message || 'Erreur lors de la création';
      }
    });
  }
}
