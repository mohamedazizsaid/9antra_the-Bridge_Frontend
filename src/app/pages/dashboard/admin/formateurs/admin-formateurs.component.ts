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

      <!-- ─── Formulaire Inline : Créer Formateur ─── -->
      <div *ngIf="showModal" class="bridge-card overflow-hidden inline-view-card">
        <!-- Accent bar -->
        <div class="h-1 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623]"></div>
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--bridge-border)]">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-lg flex-shrink-0">🎓</div>
            <div>
              <h3 class="font-syne font-bold text-white text-sm leading-tight">Créer un compte formateur</h3>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">Remplissez le formulaire ci-dessous</p>
            </div>
          </div>
          <button (click)="showModal=false" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/5 text-sm">✕</button>
        </div>
        <!-- Form body -->
        <div class="p-5 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-2">Prénom *</label>
              <input [(ngModel)]="newFormateur.firstName" placeholder="Prénom" class="bridge-input w-full">
            </div>
            <div>
              <label class="block text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-2">Nom *</label>
              <input [(ngModel)]="newFormateur.lastName" placeholder="Nom" class="bridge-input w-full">
            </div>
          </div>
          <div>
            <label class="block text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-2">Email professionnel *</label>
            <input [(ngModel)]="newFormateur.email" type="email" placeholder="formateur@9antra.tn" class="bridge-input w-full">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-2">Téléphone</label>
              <input [(ngModel)]="newFormateur.phone" placeholder="+216 xx xxx xxx" class="bridge-input w-full">
            </div>
            <div>
              <label class="block text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold mb-2">Âge</label>
              <input [(ngModel)]="newFormateur.age" type="number" placeholder="Ex: 35" class="bridge-input w-full">
            </div>
          </div>
          <!-- Notice -->
          <div class="flex items-start gap-3 bg-amber-500/[0.08] border border-amber-500/20 rounded-xl p-3.5">
            <span class="text-lg flex-shrink-0">⚠️</span>
            <p class="text-xs text-amber-300/80 leading-relaxed">Un email sera envoyé au formateur avec un mot de passe temporaire.</p>
          </div>
          <!-- Feedback -->
          <p *ngIf="createError" class="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2.5">{{ createError }}</p>
          <p *ngIf="createSuccess" class="text-emerald-400 text-xs text-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-2.5">{{ createSuccess }}</p>
        </div>
        <!-- Actions -->
        <div class="flex gap-3 px-5 py-4 border-t border-[var(--bridge-border)]">
          <button (click)="showModal=false" class="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-semibold text-sm rounded-xl border border-white/5 hover:border-white/10 transition-all">
            Annuler
          </button>
          <button (click)="createFormateur()"
                  [disabled]="creating || !newFormateur.firstName || !newFormateur.lastName || !newFormateur.email"
                  class="flex-1 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
            <span *ngIf="creating" class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
            <span>{{ creating ? 'Création...' : '✅ Créer et envoyer email' }}</span>
          </button>
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
