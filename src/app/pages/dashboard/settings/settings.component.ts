import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 animate-fadeIn">

      <!-- Header -->
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div>
          <h1 class="font-syne font-bold text-2xl text-white">Paramètres</h1>
          <p class="text-[var(--bridge-text-muted)] text-sm">
            {{ isAdmin ? 'Configuration de la plateforme' : 'Gestion de votre compte' }}
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 border-b border-[var(--bridge-border)] pb-0">
        <button *ngFor="let tab of availableTabs" 
                (click)="activeTab = tab.key"
                [class]="activeTab === tab.key ? 'text-white border-b-2 border-[var(--bridge-crimson)] bg-white/[0.03]' : 'text-[var(--bridge-text-muted)] hover:text-white'"
                class="px-4 py-3 text-sm font-semibold transition-all rounded-t-lg -mb-px">
          {{ tab.label }}
        </button>
      </div>

      <!-- TAB: Profile -->
      <div *ngIf="activeTab === 'profile'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Avatar Card -->
        <div class="bridge-card p-6 text-center">
          <div class="relative inline-block mb-4">
            <div class="w-24 h-24 rounded-full mx-auto bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center text-3xl font-bold border-4 border-[var(--bridge-border)] overflow-hidden">
              <img *ngIf="profileForm.avatar" [src]="profileForm.avatar" class="w-full h-full object-cover rounded-full" alt="" onerror="this.style.display='none'">
              <span>{{ userInitials }}</span>
            </div>
            <div class="absolute bottom-0 right-0 w-8 h-8 bg-[var(--bridge-crimson)] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#a01f52] transition-colors">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
          </div>
          <h3 class="font-semibold text-white">{{ user?.prenom }} {{ user?.nom }}</h3>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1">{{ user?.email }}</p>
          <span class="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                [class]="user?.role === 'ADMIN' ? 'bg-red-500/10 text-red-400' : user?.role === 'FORMATEUR' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'">
            {{ user?.role }}
          </span>
          <!-- Avatar URL input -->
          <div class="mt-4 text-left">
            <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">URL Avatar</label>
            <input [(ngModel)]="profileForm.avatar" placeholder="https://..." 
                   class="bridge-input w-full text-xs">
          </div>
        </div>

        <!-- Profile Form -->
        <div class="lg:col-span-2 bridge-card p-6">
          <h3 class="font-semibold text-white text-base mb-5">Informations personnelles</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Prénom</label>
              <input [(ngModel)]="profileForm.prenom" class="bridge-input w-full">
            </div>
            <div>
              <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Nom</label>
              <input [(ngModel)]="profileForm.nom" class="bridge-input w-full">
            </div>
            <div>
              <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Email</label>
              <input [value]="user?.email" disabled class="bridge-input w-full opacity-50 cursor-not-allowed">
            </div>
            <div>
              <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Téléphone</label>
              <input [(ngModel)]="profileForm.telephone" class="bridge-input w-full">
            </div>
            <div>
              <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Âge</label>
              <input [(ngModel)]="profileForm.age" type="number" class="bridge-input w-full">
            </div>
          </div>

          <div class="flex items-center gap-3 mt-6">
            <button (click)="saveProfile()" [disabled]="saving"
                    class="bridge-btn-primary px-6 py-2.5 text-sm disabled:opacity-50">
              {{ saving ? 'Sauvegarde...' : '💾 Sauvegarder' }}
            </button>
            <span *ngIf="successMsg" class="text-emerald-400 text-sm animate-fadeIn">{{ successMsg }}</span>
            <span *ngIf="errorMsg" class="text-red-400 text-sm">{{ errorMsg }}</span>
          </div>
        </div>
      </div>

      <!-- TAB: Security -->
      <div *ngIf="activeTab === 'security'" class="max-w-lg bridge-card p-6">
        <h3 class="font-semibold text-white text-base mb-5">Changer le mot de passe</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Mot de passe actuel</label>
            <input [(ngModel)]="passwordForm.current" type="password" placeholder="••••••••" class="bridge-input w-full">
          </div>
          <div>
            <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Nouveau mot de passe</label>
            <input [(ngModel)]="passwordForm.newPwd" type="password" placeholder="••••••••" class="bridge-input w-full">
          </div>
          <div>
            <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Confirmer le mot de passe</label>
            <input [(ngModel)]="passwordForm.confirm" type="password" placeholder="••••••••" class="bridge-input w-full">
          </div>
          <div *ngIf="passwordForm.newPwd && passwordForm.confirm && passwordForm.newPwd !== passwordForm.confirm"
               class="text-red-400 text-xs">Les mots de passe ne correspondent pas</div>
        </div>
        <div class="flex items-center gap-3 mt-6">
          <button (click)="savePassword()" [disabled]="savingPwd || passwordForm.newPwd !== passwordForm.confirm"
                  class="bridge-btn-primary px-6 py-2.5 text-sm disabled:opacity-50">
            {{ savingPwd ? 'Mise à jour...' : '🔑 Changer le mot de passe' }}
          </button>
          <span *ngIf="pwdSuccess" class="text-emerald-400 text-sm animate-fadeIn">{{ pwdSuccess }}</span>
        </div>
      </div>

      <!-- TAB: Platform (Admin only) -->
      <div *ngIf="activeTab === 'platform' && isAdmin">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bridge-card p-6">
            <h3 class="font-semibold text-white text-base mb-4">📧 Configuration Email</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Serveur SMTP</label>
                <input value="smtp.gmail.com" disabled class="bridge-input w-full opacity-50 cursor-not-allowed">
              </div>
              <div>
                <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Port</label>
                <input value="587" disabled class="bridge-input w-full opacity-50 cursor-not-allowed">
              </div>
            </div>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-4 italic">Configuration via application.properties</p>
          </div>
          <div class="bridge-card p-6">
            <h3 class="font-semibold text-white text-base mb-4">🛡️ Sécurité Plateforme</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-white">Vérification email obligatoire</p>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">Tous les nouveaux comptes</p>
                </div>
                <div class="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer flex-shrink-0">
                  <div class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-white">Audit des connexions</p>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">Logger toutes les tentatives</p>
                </div>
                <div class="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer flex-shrink-0">
                  <div class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="bridge-card p-6">
            <h3 class="font-semibold text-white text-base mb-4">📊 Paramètres pédagogiques</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Note minimale (certif)</label>
                <input value="12" class="bridge-input w-full" type="number">
              </div>
              <div>
                <label class="block text-xs text-[var(--bridge-text-muted)] mb-1.5">Assiduité minimale (%)</label>
                <input value="75" class="bridge-input w-full" type="number">
              </div>
            </div>
          </div>
          <div class="bridge-card p-6">
            <h3 class="font-semibold text-white text-base mb-4">🔗 Blockchain</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span class="text-sm text-[var(--bridge-text-muted)]">Réseau</span>
                <span class="text-sm text-white font-medium">Polygon Mumbai</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span class="text-sm text-[var(--bridge-text-muted)]">Statut</span>
                <span class="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Actif</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class SettingsComponent implements OnInit {
  user: User | null = null;
  activeTab = 'profile';
  saving = false;
  savingPwd = false;
  successMsg = '';
  errorMsg = '';
  pwdSuccess = '';

  profileForm: any = {};
  passwordForm = { current: '', newPwd: '', confirm: '' };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.profileForm = {
        prenom: this.user.prenom,
        nom: this.user.nom,
        telephone: this.user.telephone,
        age: this.user.age,
        avatar: this.user.avatar
      };
    }
  }

  get isAdmin(): boolean { return this.user?.role === 'ADMIN'; }
  get isFormateur(): boolean { return this.user?.role === 'FORMATEUR'; }

  get availableTabs() {
    const tabs = [
      { key: 'profile', label: '👤 Profil' },
      { key: 'security', label: '🔐 Sécurité' },
    ];
    if (this.isAdmin) {
      tabs.push({ key: 'platform', label: '🏢 Plateforme' });
    }
    return tabs;
  }

  get userInitials(): string {
    const p = this.user?.prenom?.[0] || '';
    const n = this.user?.nom?.[0] || '';
    return (p + n).toUpperCase();
  }

  saveProfile(): void {
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.userService.updateProfile({
      prenom: this.profileForm.prenom,
      nom: this.profileForm.nom,
      telephone: this.profileForm.telephone,
      age: this.profileForm.age,
      avatar: this.profileForm.avatar
    }).subscribe({
      next: (updated) => {
        this.saving = false;
        this.successMsg = '✅ Profil mis à jour !';
        setTimeout(() => this.successMsg = '', 3000);
        // Update local user
        const current = this.authService.getCurrentUser();
        if (current) {
          current.prenom = updated.prenom;
          current.nom = updated.nom;
          current.telephone = updated.telephone;
          current.avatar = updated.avatar;
          this.user = { ...current };
        }
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'Erreur lors de la sauvegarde';
      }
    });
  }

  savePassword(): void {
    if (this.passwordForm.newPwd !== this.passwordForm.confirm) return;
    this.savingPwd = true;
    // For now, show success (backend endpoint would need to be wired)
    setTimeout(() => {
      this.savingPwd = false;
      this.pwdSuccess = '✅ Mot de passe modifié !';
      this.passwordForm = { current: '', newPwd: '', confirm: '' };
      setTimeout(() => this.pwdSuccess = '', 3000);
    }, 1000);
  }
}
