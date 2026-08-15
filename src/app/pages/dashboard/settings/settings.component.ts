import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { AdminService } from '../../../core/services/admin.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-0 animate-fadeIn">

      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center shadow-lg shadow-[rgba(198,39,97,0.3)]">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <h1 class="font-syne font-bold text-3xl text-white">Paramètres</h1>
            <p class="text-[var(--bridge-text-muted)] text-sm mt-0.5">
              {{ isAdmin ? 'Configuration de la plateforme et du compte' : 'Personnalisez votre expérience' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="flex gap-6">

        <!-- Sidebar Navigation -->
        <div class="w-64 flex-shrink-0 space-y-1">
          <button *ngFor="let tab of availableTabs"
                  (click)="activeTab = tab.key"
                  class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left group"
                  [class]="activeTab === tab.key
                    ? 'bg-gradient-to-r from-[rgba(198,39,97,0.15)] to-[rgba(245,166,35,0.08)] border border-[rgba(198,39,97,0.3)] text-white shadow-[0_0_20px_rgba(198,39,97,0.1)]'
                    : 'text-[var(--bridge-text-muted)] hover:text-white hover:bg-white/[0.04] border border-transparent'">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all"
                 [class]="activeTab === tab.key ? 'bg-gradient-to-br from-[#C62761] to-[#F5A623] shadow-md' : 'bg-white/5 group-hover:bg-white/10'">
              {{ tab.icon }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="leading-tight">{{ tab.label }}</p>
              <p class="text-[10px] font-normal mt-0.5 truncate" [class]="activeTab === tab.key ? 'text-white/50' : 'text-white/20'">
                {{ tab.desc }}
              </p>
            </div>
            <svg *ngIf="activeTab === tab.key" class="w-4 h-4 text-[#C62761] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          <!-- User Card at bottom -->
          <div class="mt-6 p-4 glass-card border border-[var(--bridge-border)] rounded-xl">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0 border-2 border-white/10">
                <img *ngIf="profileForm.avatar" [src]="profileForm.avatar" class="w-full h-full object-cover" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <span *ngIf="!profileForm.avatar" class="flex items-center justify-center w-full h-full text-white">{{ userInitials }}</span>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-white truncate">{{ user?.prenom }} {{ user?.nom }}</p>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mt-0.5"
                      [class]="user?.role === 'ADMIN' ? 'bg-red-500/10 text-red-400' : user?.role === 'FORMATEUR' ? 'bg-orange-500/10 text-orange-400' : 'bg-[rgba(198,39,97,0.1)] text-[#C62761]'">
                  {{ user?.role }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="flex-1 min-w-0">

          <!-- ═══ TAB: Profil ═══ -->
          <div *ngIf="activeTab === 'profile'" class="space-y-5">

            <!-- Avatar Section -->
            <div class="glass-card border border-[var(--bridge-border)] p-6 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-[rgba(198,39,97,0.04)] to-transparent pointer-events-none"></div>
              <div class="relative z-10">
                <h3 class="font-syne font-bold text-white text-base mb-5 flex items-center gap-2">
                  <span class="text-[#C62761]">📸</span> Photo de profil
                </h3>
                <div class="flex flex-col sm:flex-row items-center gap-6">
                  <!-- Avatar Preview -->
                  <div class="relative flex-shrink-0">
                    <div class="w-28 h-28 rounded-2xl bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center text-3xl font-bold border-4 border-[rgba(198,39,97,0.2)] overflow-hidden shadow-xl shadow-[rgba(198,39,97,0.25)] transition-all">
                      <img *ngIf="profileForm.avatar" [src]="profileForm.avatar" class="w-full h-full object-cover" alt="">
                      <span *ngIf="!profileForm.avatar" class="text-white text-2xl font-black">{{ userInitials }}</span>
                    </div>
                    <!-- Online indicator -->
                    <div class="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#10102A] flex items-center justify-center shadow">
                      <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
                    </div>
                    <!-- Remove button -->
                    <button *ngIf="profileForm.avatar" (click)="removeAvatar()"
                            class="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-400 transition-all shadow-md z-10"
                            title="Supprimer la photo">
                      ✕
                    </button>
                  </div>

                  <!-- Upload Zone -->
                  <div class="flex-1 w-full">
                    <!-- Hidden file input -->
                    <input #avatarInput type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                           class="hidden" (change)="onAvatarFileChange($event)">

                    <!-- Drop Zone -->
                    <div class="relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group"
                         [class]="avatarDragOver
                           ? 'border-[#C62761] bg-[rgba(198,39,97,0.08)] scale-[1.01]'
                           : 'border-white/15 hover:border-[rgba(198,39,97,0.4)] hover:bg-[rgba(198,39,97,0.04)]'"
                         (click)="avatarInput.click()"
                         (dragover)="onAvatarDragOver($event)"
                         (dragleave)="onAvatarDragLeave()"
                         (drop)="onAvatarDrop($event)">

                      <!-- Upload Icon & Text -->
                      <div *ngIf="!avatarUploading">
                        <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mx-auto mb-3 group-hover:bg-[rgba(198,39,97,0.1)] group-hover:border-[rgba(198,39,97,0.2)] transition-all">
                          📷
                        </div>
                        <p class="text-sm font-semibold text-white mb-1">
                          {{ avatarDragOver ? 'Relâchez pour uploader' : 'Glissez une photo ici' }}
                        </p>
                        <p class="text-xs text-white/40 mb-3">ou cliquez pour parcourir</p>
                        <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs font-bold rounded-xl shadow-md group-hover:shadow-[rgba(198,39,97,0.3)] transition-all">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                          </svg>
                          Choisir une photo
                        </div>
                        <p class="text-[10px] text-white/25 mt-3">JPG, PNG, WebP — max 5 MB</p>
                      </div>

                      <!-- Uploading state -->
                      <div *ngIf="avatarUploading" class="flex flex-col items-center gap-3">
                        <div class="w-10 h-10 rounded-full border-2 border-[#C62761]/30 border-t-[#C62761] animate-spin"></div>
                        <p class="text-sm text-white/60 font-semibold">Traitement en cours...</p>
                      </div>
                    </div>

                    <!-- Error message -->
                    <p *ngIf="avatarError" class="text-xs text-red-400 mt-2 flex items-center gap-1">
                      <span>⚠</span> {{ avatarError }}
                    </p>
                    <!-- Success message -->
                    <p *ngIf="avatarSuccess" class="text-xs text-emerald-400 mt-2 flex items-center gap-1 animate-fadeIn">
                      <span>✓</span> {{ avatarSuccess }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Personal Info -->
            <div class="glass-card border border-[var(--bridge-border)] p-6">
              <h3 class="font-syne font-bold text-white text-base mb-5 flex items-center gap-2">
                <span class="text-[#F5A623]">👤</span> Informations personnelles
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-[var(--bridge-text-muted)] mb-2 font-semibold uppercase tracking-wider">Prénom</label>
                  <input [(ngModel)]="profileForm.prenom"
                         class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-all">
                </div>
                <div>
                  <label class="block text-xs text-[var(--bridge-text-muted)] mb-2 font-semibold uppercase tracking-wider">Nom</label>
                  <input [(ngModel)]="profileForm.nom"
                         class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-all">
                </div>
                <div>
                  <label class="block text-xs text-[var(--bridge-text-muted)] mb-2 font-semibold uppercase tracking-wider">Email</label>
                  <div class="relative">
                    <input [value]="user?.email" disabled
                           class="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white/40 cursor-not-allowed pr-10">
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-white/20">🔒</span>
                  </div>
                  <p class="text-[10px] text-white/20 mt-1">L'email ne peut pas être modifié</p>
                </div>
                <div>
                  <label class="block text-xs text-[var(--bridge-text-muted)] mb-2 font-semibold uppercase tracking-wider">Téléphone</label>
                  <input [(ngModel)]="profileForm.telephone" placeholder="+216 XX XXX XXX"
                         class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-all">
                </div>
                <div>
                  <label class="block text-xs text-[var(--bridge-text-muted)] mb-2 font-semibold uppercase tracking-wider">Âge</label>
                  <input [(ngModel)]="profileForm.age" type="number" placeholder="25"
                         class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-all">
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-4 mt-6 pt-6 border-t border-white/5">
                <button (click)="saveProfile()" [disabled]="saving"
                        class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-[rgba(198,39,97,0.2)]">
                  <svg *ngIf="saving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  {{ saving ? 'Sauvegarde...' : '💾 Sauvegarder les modifications' }}
                </button>
                <div *ngIf="successMsg" class="flex items-center gap-2 text-emerald-400 text-sm font-semibold animate-fadeIn">
                  <span class="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center text-xs">✓</span>
                  {{ successMsg }}
                </div>
                <div *ngIf="errorMsg" class="flex items-center gap-2 text-red-400 text-sm">
                  <span>⚠</span> {{ errorMsg }}
                </div>
              </div>
            </div>
          </div>

          <!-- ═══ TAB: Sécurité ═══ -->
          <div *ngIf="activeTab === 'security'" class="space-y-5">

            <!-- Change Password -->
            <div class="glass-card border border-[var(--bridge-border)] p-6 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-[rgba(198,39,97,0.03)] to-transparent pointer-events-none"></div>
              <div class="relative z-10">
                <h3 class="font-syne font-bold text-white text-base mb-2 flex items-center gap-2">
                  <span>🔑</span> Changer le mot de passe
                </h3>
                <p class="text-[var(--bridge-text-muted)] text-sm mb-6">Choisissez un mot de passe fort d'au moins 8 caractères.</p>

                <div class="space-y-4 max-w-lg">
                  <!-- Current password -->
                  <div>
                    <label class="block text-xs text-[var(--bridge-text-muted)] mb-2 font-semibold uppercase tracking-wider">Mot de passe actuel</label>
                    <div class="relative">
                      <input [(ngModel)]="passwordForm.current"
                             [type]="showCurrentPwd ? 'text' : 'password'"
                             placeholder="••••••••"
                             class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-all pr-12">
                      <button (click)="showCurrentPwd = !showCurrentPwd"
                              class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors text-base">
                        {{ showCurrentPwd ? '🙈' : '👁️' }}
                      </button>
                    </div>
                  </div>

                  <!-- New password -->
                  <div>
                    <label class="block text-xs text-[var(--bridge-text-muted)] mb-2 font-semibold uppercase tracking-wider">Nouveau mot de passe</label>
                    <div class="relative">
                      <input [(ngModel)]="passwordForm.newPwd"
                             [type]="showNewPwd ? 'text' : 'password'"
                             placeholder="••••••••"
                             (ngModelChange)="checkPasswordStrength($event)"
                             class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-all pr-12">
                      <button (click)="showNewPwd = !showNewPwd"
                              class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors text-base">
                        {{ showNewPwd ? '🙈' : '👁️' }}
                      </button>
                    </div>
                    <!-- Strength meter -->
                    <div *ngIf="passwordForm.newPwd" class="mt-3">
                      <div class="flex gap-1.5 mb-1.5">
                        <div *ngFor="let bar of [1,2,3,4]"
                             class="h-1.5 flex-1 rounded-full transition-all duration-300"
                             [class]="passwordStrength >= bar ? getStrengthBarClass() : 'bg-white/10'"></div>
                      </div>
                      <div class="flex items-center justify-between">
                        <p class="text-xs font-semibold" [class]="getStrengthColor()">{{ getStrengthLabel() }}</p>
                        <p class="text-[10px] text-white/30">{{ passwordForm.newPwd.length }} caractères</p>
                      </div>
                      <!-- Criteria list -->
                      <div class="mt-3 grid grid-cols-2 gap-1.5">
                        <div *ngFor="let crit of passwordCriteria"
                             class="flex items-center gap-1.5 text-[11px]"
                             [class]="crit.met ? 'text-emerald-400' : 'text-white/30'">
                          <span class="text-xs">{{ crit.met ? '✓' : '○' }}</span>
                          {{ crit.label }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Confirm password -->
                  <div>
                    <label class="block text-xs text-[var(--bridge-text-muted)] mb-2 font-semibold uppercase tracking-wider">Confirmer le mot de passe</label>
                    <div class="relative">
                      <input [(ngModel)]="passwordForm.confirm"
                             [type]="showConfirmPwd ? 'text' : 'password'"
                             placeholder="••••••••"
                             class="w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all pr-12"
                             [class]="passwordForm.confirm && passwordForm.newPwd !== passwordForm.confirm
                               ? 'border-red-500/50 focus:border-red-500'
                               : passwordForm.confirm && passwordForm.newPwd === passwordForm.confirm
                               ? 'border-emerald-500/50 focus:border-emerald-500'
                               : 'border-white/10 focus:border-[#C62761]'">
                      <button (click)="showConfirmPwd = !showConfirmPwd"
                              class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors text-base">
                        {{ showConfirmPwd ? '🙈' : '👁️' }}
                      </button>
                      <!-- Match indicator -->
                      <div *ngIf="passwordForm.confirm" class="absolute right-10 top-1/2 -translate-y-1/2">
                        <span *ngIf="passwordForm.newPwd === passwordForm.confirm" class="text-emerald-400 text-sm">✓</span>
                        <span *ngIf="passwordForm.newPwd !== passwordForm.confirm" class="text-red-400 text-sm">✗</span>
                      </div>
                    </div>
                    <p *ngIf="passwordForm.confirm && passwordForm.newPwd !== passwordForm.confirm"
                       class="text-red-400 text-xs mt-2">❌ Les mots de passe ne correspondent pas</p>
                  </div>

                  <!-- Submit -->
                  <div class="pt-2 flex items-center gap-4">
                    <button (click)="savePassword()"
                            [disabled]="savingPwd || !passwordForm.current || !passwordForm.newPwd || passwordForm.newPwd !== passwordForm.confirm || passwordStrength < 2"
                            class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[rgba(198,39,97,0.2)]">
                      <svg *ngIf="savingPwd" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      {{ savingPwd ? 'Mise à jour...' : '🔐 Changer le mot de passe' }}
                    </button>
                    <div *ngIf="pwdSuccess" class="flex items-center gap-2 text-emerald-400 text-sm font-semibold animate-fadeIn">
                      <span class="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center text-xs">✓</span>
                      {{ pwdSuccess }}
                    </div>
                    <div *ngIf="pwdError" class="flex items-center gap-2 text-red-400 text-sm">
                      <span>⚠</span> {{ pwdError }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Security Info -->
            <div class="glass-card border border-[var(--bridge-border)] p-6">
              <h3 class="font-syne font-bold text-white text-base mb-5 flex items-center gap-2">
                <span>🛡️</span> Informations de sécurité
              </h3>
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg flex-shrink-0">🔒</div>
                  <div>
                    <p class="text-sm font-semibold text-white">Compte sécurisé</p>
                    <p class="text-xs text-white/40 mt-0.5">JWT Token actif</p>
                  </div>
                </div>
                <div class="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg flex-shrink-0">📧</div>
                  <div>
                    <p class="text-sm font-semibold text-white">{{ user?.email }}</p>
                    <p class="text-xs text-white/40 mt-0.5">Email vérifié</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ═══ TAB: Plateforme (Admin) ═══ -->
          <div *ngIf="activeTab === 'platform' && isAdmin">
            <div class="grid md:grid-cols-2 gap-5">
              <div class="glass-card border border-[var(--bridge-border)] p-6">
                <h3 class="font-syne font-bold text-white text-base mb-4 flex items-center gap-2">📧 Configuration Email</h3>
                <div class="space-y-3">
                  <div>
                    <label class="block text-xs text-[var(--bridge-text-muted)] mb-2 font-semibold uppercase tracking-wider">Serveur SMTP</label>
                    <input value="smtp.gmail.com" disabled class="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white/40 cursor-not-allowed">
                  </div>
                  <div>
                    <label class="block text-xs text-[var(--bridge-text-muted)] mb-2 font-semibold uppercase tracking-wider">Port</label>
                    <input value="587" disabled class="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white/40 cursor-not-allowed">
                  </div>
                </div>
                <div class="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <p class="text-xs text-blue-400/70">📋 Configuration via <code class="bg-white/5 px-1 rounded">application.properties</code></p>
                </div>
              </div>

              <div class="glass-card border border-[var(--bridge-border)] p-6">
                <h3 class="font-syne font-bold text-white text-base mb-4 flex items-center gap-2">🛡️ Sécurité Plateforme</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <p class="text-sm text-white font-medium">Vérification email</p>
                      <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">Tous les nouveaux comptes</p>
                    </div>
                    <div class="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer flex-shrink-0 transition-all">
                      <div class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <p class="text-sm text-white font-medium">Audit des connexions</p>
                      <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">Logger toutes les tentatives</p>
                    </div>
                    <div class="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer flex-shrink-0 transition-all">
                      <div class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="glass-card border border-[var(--bridge-border)] p-6">
                <h3 class="font-syne font-bold text-white text-base mb-4 flex items-center gap-2">📊 Paramètres pédagogiques</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs text-[var(--bridge-text-muted)] mb-2 font-semibold uppercase tracking-wider">Note minimale (certif)</label>
                    <input value="12" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-all" type="number">
                  </div>
                  <div>
                    <label class="block text-xs text-[var(--bridge-text-muted)] mb-2 font-semibold uppercase tracking-wider">Assiduité minimale (%)</label>
                    <input value="75" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-all" type="number">
                  </div>
                </div>
              </div>

              <div class="glass-card border border-[var(--bridge-border)] p-6">
                <h3 class="font-syne font-bold text-white text-base mb-4 flex items-center gap-2">🔗 Blockchain</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                    <span class="text-sm text-[var(--bridge-text-muted)]">Réseau</span>
                    <span class="text-sm text-white font-medium">Polygon Mumbai</span>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                    <span class="text-sm text-[var(--bridge-text-muted)]">Statut</span>
                    <span class="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-bold border border-emerald-500/20">
                      <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Actif
                    </span>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                    <span class="text-sm text-[var(--bridge-text-muted)]">Certificats émis</span>
                    <span class="text-sm text-[#F5A623] font-mono font-bold">—</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <style>
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeIn { animation: fadeIn 0.3s ease both; }
    </style>
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
  pwdError = '';

  showCurrentPwd = false;
  showNewPwd = false;
  showConfirmPwd = false;
  passwordStrength = 0;

  profileForm: any = {};
  passwordForm = { current: '', newPwd: '', confirm: '' };

  // Avatar upload properties
  avatarDragOver = false;
  avatarUploading = false;
  avatarError = '';
  avatarSuccess = '';

  passwordCriteria = [
    { label: '8 caractères min.', met: false },
    { label: 'Majuscule', met: false },
    { label: 'Minuscule', met: false },
    { label: 'Chiffre', met: false },
    { label: 'Caractère spécial', met: false },
    { label: 'Pas d\'espace', met: false },
  ];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private adminService: AdminService,
    private http: HttpClient
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
      { key: 'profile', icon: '👤', label: 'Profil', desc: 'Informations personnelles' },
      { key: 'security', icon: '🔐', label: 'Sécurité', desc: 'Mot de passe & accès' },
    ];
    if (this.isAdmin) {
      tabs.push({ key: 'platform', icon: '🏢', label: 'Plateforme', desc: 'Configuration admin' });
    }
    return tabs;
  }

  get userInitials(): string {
    const p = this.user?.prenom?.[0] || '';
    const n = this.user?.nom?.[0] || '';
    return (p + n).toUpperCase();
  }

  checkPasswordStrength(pwd: string): void {
    this.passwordCriteria[0].met = pwd.length >= 8;
    this.passwordCriteria[1].met = /[A-Z]/.test(pwd);
    this.passwordCriteria[2].met = /[a-z]/.test(pwd);
    this.passwordCriteria[3].met = /[0-9]/.test(pwd);
    this.passwordCriteria[4].met = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    this.passwordCriteria[5].met = !/\s/.test(pwd) && pwd.length > 0;
    this.passwordStrength = this.passwordCriteria.filter(c => c.met).length > 5
      ? 4
      : this.passwordCriteria.filter(c => c.met).length >= 4
      ? 3
      : this.passwordCriteria.filter(c => c.met).length >= 2
      ? 2
      : this.passwordCriteria.filter(c => c.met).length >= 1 ? 1 : 0;
  }

  getStrengthLabel(): string {
    const labels = ['', 'Très faible', 'Faible', 'Bon', 'Excellent'];
    return labels[this.passwordStrength] || '';
  }

  getStrengthColor(): string {
    const colors = ['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-emerald-400'];
    return colors[this.passwordStrength] || 'text-white/40';
  }

  getStrengthBarClass(): string {
    const classes = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400'];
    return classes[this.passwordStrength] || '';
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
        this.successMsg = 'Profil mis à jour avec succès !';
        setTimeout(() => this.successMsg = '', 3500);
        this.user = updated;
        this.authService.updateCurrentUser(updated);
      },
      error: (err) => {
        this.saving = false;
        this.errorMsg = err?.error?.message || 'Erreur lors de la sauvegarde';
      }
    });
  }

  savePassword(): void {
    if (this.passwordForm.newPwd !== this.passwordForm.confirm) return;
    if (!this.passwordForm.current || !this.passwordForm.newPwd) return;
    this.savingPwd = true;
    this.pwdSuccess = '';
    this.pwdError = '';
    this.http.post(`${environment.apiUrl}/users/change-password`, {
      currentPassword: this.passwordForm.current,
      newPassword: this.passwordForm.newPwd
    }).subscribe({
      next: () => {
        this.savingPwd = false;
        this.pwdSuccess = 'Mot de passe modifié avec succès !';
        this.passwordForm = { current: '', newPwd: '', confirm: '' };
        this.passwordStrength = 0;
        this.passwordCriteria.forEach(c => c.met = false);
        setTimeout(() => this.pwdSuccess = '', 3500);
      },
      error: (err) => {
        this.savingPwd = false;
        this.pwdError = err?.error?.message || 'Mot de passe actuel incorrect';
        setTimeout(() => this.pwdError = '', 4000);
      }
    });
  }

  removeAvatar(): void {
    this.profileForm.avatar = '';
    this.avatarSuccess = '';
    this.avatarError = '';
  }

  onAvatarDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.avatarDragOver = true;
  }

  onAvatarDragLeave(): void {
    this.avatarDragOver = false;
  }

  onAvatarDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.avatarDragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleAvatarFile(event.dataTransfer.files[0]);
    }
  }

  onAvatarFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleAvatarFile(input.files[0]);
    }
  }

  private handleAvatarFile(file: File): void {
    this.avatarError = '';
    this.avatarSuccess = '';

    if (!file.type.startsWith('image/')) {
      this.avatarError = 'Le fichier doit être une image (JPG, PNG, WebP)';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.avatarError = 'Taille maximale dépassée (5 Mo max)';
      return;
    }

    this.avatarUploading = true;
    const reader = new FileReader();
    reader.onload = () => {
      this.profileForm.avatar = reader.result as string;
      this.avatarUploading = false;
      this.avatarSuccess = 'Photo chargée avec succès !';
      setTimeout(() => this.avatarSuccess = '', 3000);
    };
    reader.onerror = () => {
      this.avatarUploading = false;
      this.avatarError = 'Erreur lors de la lecture du fichier';
    };
    reader.readAsDataURL(file);
  }
}
