import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { AdminService } from '../../../core/services/admin.service';
import {
  AccessibilityService,
  AccessibilityConfig,
  DaltonismMode,
  TextScale,
  LetterSpacing,
  LineHeight,
} from '../../../core/services/accessibility.service';
import { ToastService } from '../../../core/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Subscription, Observable } from 'rxjs';
import { TranslationService, SupportedLang } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

interface TabItem {
  key: string;
  label: string;
  desc: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-0 animate-fadeIn pb-12">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center shadow-lg shadow-[rgba(198,39,97,0.3)]"
          >
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <h1 class="font-syne font-bold text-3xl text-white">Paramètres</h1>
            <p class="text-[var(--bridge-text-muted)] text-sm mt-0.5">
              {{
                isAdmin
                  ? 'Configuration de la plateforme, accessibilité et sécurité'
                  : 'Personnalisez votre compte et votre expérience d’accessibilité'
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Responsive Top Navigation Tabs for Mobile / Tablet -->
      <div
        class="flex items-center gap-2 p-1.5 glass-card border border-[var(--bridge-border)] rounded-2xl overflow-x-auto w-full lg:hidden mb-6"
      >
        <button
          *ngFor="let tab of tabs; trackBy: trackByTabKey"
          type="button"
          (click)="selectTab(tab.key)"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 cursor-pointer"
          [class]="
            activeTab === tab.key
              ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-md'
              : 'text-[var(--bridge-text-muted)] hover:text-white hover:bg-white/5'
          "
        >
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Two-column layout -->
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Sidebar Navigation (Desktop) -->
        <div class="hidden lg:block w-64 flex-shrink-0 space-y-1">
          <button
            *ngFor="let tab of tabs; trackBy: trackByTabKey"
            type="button"
            (click)="selectTab(tab.key)"
            class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left group cursor-pointer"
            [class]="
              activeTab === tab.key
                ? 'bg-gradient-to-r from-[rgba(198,39,97,0.15)] to-[rgba(245,166,35,0.08)] border border-[rgba(198,39,97,0.3)] text-white shadow-[0_0_20px_rgba(198,39,97,0.1)]'
                : 'text-[var(--bridge-text-muted)] hover:text-white hover:bg-white/[0.04] border border-transparent'
            "
          >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
              [class]="
                activeTab === tab.key
                  ? 'bg-gradient-to-br from-[#C62761] to-[#F5A623] shadow-md text-white'
                  : 'bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white'
              "
            >
              <!-- Icon Profile -->
              <svg
                *ngIf="tab.key === 'profile'"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <!-- Icon Security -->
              <svg
                *ngIf="tab.key === 'security'"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <!-- Icon Accessibility -->
              <svg
                *ngIf="tab.key === 'accessibility'"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="4" r="2" />
                <path d="m4.93 10.93 4.24-4.24a2 2 0 0 1 2.83 0l4.24 4.24" />
                <path d="m14 13 3 8" />
                <path d="m10 13-3 8" />
                <line x1="2" y1="13" x2="22" y2="13" />
              </svg>
              <!-- Icon Platform -->
              <svg
                *ngIf="tab.key === 'platform'"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="leading-tight">{{ tab.label }}</p>
              <p
                class="text-[10px] font-normal mt-0.5 truncate"
                [class]="activeTab === tab.key ? 'text-white/50' : 'text-white/20'"
              >
                {{ tab.desc }}
              </p>
            </div>
            <svg
              *ngIf="activeTab === tab.key"
              class="w-4 h-4 text-[#C62761] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <!-- User Card at bottom -->
          <div class="mt-6 p-4 glass-card border border-[var(--bridge-border)] rounded-xl">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0 border-2 border-white/10"
              >
                <img
                  *ngIf="profileForm.avatar"
                  [src]="profileForm.avatar"
                  class="w-full h-full object-cover"
                  alt=""
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
                />
                <span
                  *ngIf="!profileForm.avatar"
                  class="flex items-center justify-center w-full h-full text-white"
                >
                  {{ userInitials }}
                </span>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-white truncate">
                  {{ user?.prenom }} {{ user?.nom }}
                </p>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mt-0.5"
                  [class]="
                    user?.role === 'ADMIN'
                      ? 'bg-red-500/10 text-red-400'
                      : user?.role === 'FORMATEUR'
                        ? 'bg-orange-500/10 text-orange-400'
                        : 'bg-[rgba(198,39,97,0.1)] text-[#C62761]'
                  "
                >
                  {{ user?.role }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="flex-1 min-w-0">
          <!-- ═══════════════════════════════════════════════════════════════════ -->
          <!-- ═══ TAB 1: PROFIL                                              ═══ -->
          <!-- ═══════════════════════════════════════════════════════════════════ -->
          <div *ngIf="activeTab === 'profile'" class="space-y-5">
            <!-- Avatar Section -->
            <div
              class="glass-card border border-[var(--bridge-border)] p-6 relative overflow-hidden"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br from-[rgba(198,39,97,0.04)] to-transparent pointer-events-none"
              ></div>
              <div class="relative z-10">
                <h3 class="font-syne font-bold text-white text-base mb-5 flex items-center gap-2">
                  <span class="text-[#C62761]">
                    <svg
                      class="w-5 h-5 inline-block"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="3" />
                      <circle cx="12" cy="12" r="4" />
                      <path d="M8 5l1.2-2h5.6L16 5" />
                    </svg>
                  </span>
                  Photo de profil
                </h3>
                <div class="flex flex-col sm:flex-row items-center gap-6">
                  <!-- Avatar Preview -->
                  <div class="relative flex-shrink-0">
                    <div
                      class="w-28 h-28 rounded-2xl bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center text-3xl font-bold border-4 border-[rgba(198,39,97,0.2)] overflow-hidden shadow-xl shadow-[rgba(198,39,97,0.25)] transition-all"
                    >
                      <img
                        *ngIf="profileForm.avatar"
                        [src]="profileForm.avatar"
                        class="w-full h-full object-cover"
                        alt=""
                      />
                      <span *ngIf="!profileForm.avatar" class="text-white text-2xl font-black">{{
                        userInitials
                      }}</span>
                    </div>
                    <div
                      class="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#10102A] flex items-center justify-center shadow"
                    >
                      <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
                    </div>
                    <button
                      *ngIf="profileForm.avatar"
                      type="button"
                      (click)="removeAvatar()"
                      class="absolute -top-2 -left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-400 transition-all shadow-md z-10 cursor-pointer"
                      title="Supprimer la photo"
                    >
                      ✕
                    </button>
                  </div>

                  <!-- Upload Zone -->
                  <div class="flex-1 w-full">
                    <input
                      #avatarInput
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      class="hidden"
                      (change)="onAvatarFileChange($event)"
                    />
                    <div
                      class="relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group"
                      [class]="
                        avatarDragOver
                          ? 'border-[#C62761] bg-[rgba(198,39,97,0.08)] scale-[1.01]'
                          : 'border-white/15 hover:border-[rgba(198,39,97,0.4)] hover:bg-[rgba(198,39,97,0.04)]'
                      "
                      (click)="avatarInput.click()"
                      (dragover)="onAvatarDragOver($event)"
                      (dragleave)="onAvatarDragLeave()"
                      (drop)="onAvatarDrop($event)"
                    >
                      <div *ngIf="!avatarUploading">
                        <p class="text-sm font-semibold text-white mb-1">
                          {{ avatarDragOver ? 'Relâchez pour uploader' : 'Glissez une photo ici' }}
                        </p>
                        <p class="text-xs text-white/40 mb-3">ou cliquez pour parcourir</p>
                        <div
                          class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs font-bold rounded-xl shadow-md"
                        >
                          Choisir un fichier
                        </div>
                      </div>
                      <div *ngIf="avatarUploading" class="py-4 space-y-2">
                        <div
                          class="w-8 h-8 border-2 border-[#C62761] border-t-transparent rounded-full animate-spin mx-auto"
                        ></div>
                        <p class="text-xs text-white/60">Téléversement de l'image...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Profile Info Form -->
            <div class="glass-card border border-[var(--bridge-border)] p-6 space-y-5">
              <h3 class="font-syne font-bold text-white text-base">Informations Générales</h3>
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-xs text-white/60 font-semibold uppercase tracking-wider mb-1.5"
                    >Prénom</label
                  >
                  <input
                    [(ngModel)]="profileForm.prenom"
                    class="bridge-input w-full text-sm text-white bg-[#10102A]"
                  />
                </div>
                <div>
                  <label
                    class="block text-xs text-white/60 font-semibold uppercase tracking-wider mb-1.5"
                    >Nom</label
                  >
                  <input
                    [(ngModel)]="profileForm.nom"
                    class="bridge-input w-full text-sm text-white bg-[#10102A]"
                  />
                </div>
                <div>
                  <label
                    class="block text-xs text-white/60 font-semibold uppercase tracking-wider mb-1.5"
                    >Téléphone</label
                  >
                  <input
                    [(ngModel)]="profileForm.telephone"
                    class="bridge-input w-full text-sm text-white bg-[#10102A]"
                  />
                </div>
                <div>
                  <label
                    class="block text-xs text-white/60 font-semibold uppercase tracking-wider mb-1.5"
                    >Âge</label
                  >
                  <input
                    type="number"
                    [(ngModel)]="profileForm.age"
                    class="bridge-input w-full text-sm text-white bg-[#10102A]"
                  />
                </div>
              </div>
              <div class="flex justify-end pt-2">
                <button
                  type="button"
                  (click)="saveProfile()"
                  [disabled]="saving"
                  class="bridge-btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <span>{{ saving ? 'Enregistrement...' : 'Enregistrer les modifications' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════════════════ -->
          <!-- ═══ TAB 2: ACCESSIBILITÉ & NORMES WCAG 2.1 AAA (NOUVEAU)        ═══ -->
          <!-- ═══════════════════════════════════════════════════════════════════ -->
          <div *ngIf="activeTab === 'accessibility'" class="space-y-6 animate-fadeIn">
            <!-- Header Banner WCAG -->
            <div
              class="glass-card border border-[var(--bridge-gold)]/30 p-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[rgba(198,39,97,0.1)] via-[rgba(245,166,35,0.08)] to-transparent"
            >
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3.5">
                  <div
                    class="w-12 h-12 rounded-2xl bg-[var(--bridge-gold)]/20 border border-[var(--bridge-gold)]/40 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg"
                  >
                    ♿
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h2 class="font-syne font-bold text-xl text-white">
                        Moteur d'Accessibilité WCAG 2.1
                      </h2>
                      <span
                        class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      >
                        Niveau AAA
                      </span>
                    </div>
                    <p class="text-xs text-[var(--bridge-text-muted)] mt-1">
                      Filtres de daltonisme, typographie inclusive (OpenDyslexic), synthèse vocale
                      et aides visuelles avancées.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  (click)="resetA11yDefaults()"
                  class="bridge-btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  <span>🔄 Réinitialiser</span>
                </button>
              </div>
            </div>

            <!-- 1. FILTRES DE VISION & DALTONISME -->
            <div class="glass-card border border-[var(--bridge-border)] p-6 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-syne font-bold text-base text-white flex items-center gap-2">
                    <span class="text-[#F5A623]">👁️</span>
                    Filtres de Daltonisme & Perception des Couleurs
                  </h3>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                    Matrices de correction colorimétrique conformes aux troubles de la vision des
                    couleurs.
                  </p>
                </div>
                <span
                  class="text-[10px] font-mono text-[var(--bridge-gold)] uppercase font-semibold"
                >
                  Mode: {{ a11yConfig.daltonism }}
                </span>
              </div>

              <!-- Daltonism Options Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
                <button
                  *ngFor="let opt of daltonismOptions"
                  type="button"
                  (click)="updateA11y({ daltonism: opt.value })"
                  class="p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group"
                  [class]="
                    a11yConfig.daltonism === opt.value
                      ? 'border-[var(--bridge-gold)] bg-white/10 shadow-lg shadow-[rgba(245,166,35,0.1)]'
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20'
                  "
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-bold text-white">{{ opt.label }}</span>
                    <span
                      *ngIf="a11yConfig.daltonism === opt.value"
                      class="text-xs text-[var(--bridge-gold)] font-bold"
                      >✓</span
                    >
                  </div>
                  <p
                    class="text-[11px] text-[var(--bridge-text-muted)] line-clamp-2 leading-relaxed"
                  >
                    {{ opt.desc }}
                  </p>
                  <!-- Visual Color Palette Strip -->
                  <div class="flex items-center gap-1 mt-3 pt-2 border-t border-white/5">
                    <span class="w-4 h-2 rounded bg-red-500"></span>
                    <span class="w-4 h-2 rounded bg-green-500"></span>
                    <span class="w-4 h-2 rounded bg-blue-500"></span>
                    <span class="w-4 h-2 rounded bg-yellow-500"></span>
                    <span class="w-4 h-2 rounded bg-purple-500"></span>
                  </div>
                </button>
              </div>
            </div>

            <!-- 2. TYPOGRAPHIE & DYSLEXIE (OpenDyslexic / Lexend) -->
            <div class="glass-card border border-[var(--bridge-border)] p-6 space-y-6">
              <h3 class="font-syne font-bold text-base text-white flex items-center gap-2">
                <span class="text-[#C62761]">📖</span>
                Typographie, Dyslexie & Confort de Lecture
              </h3>

              <!-- Toggle OpenDyslexic Font -->
              <div
                class="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div>
                  <p class="text-sm font-semibold text-white flex items-center gap-2">
                    <span>Police Adaptée à la Dyslexie (OpenDyslexic / Lexend)</span>
                    <span
                      class="px-2 py-0.5 text-[10px] rounded bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20"
                    >
                      Recommandé
                    </span>
                  </p>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                    Formes de lettres pondérées vers le bas pour éliminer les confusions visuelles
                    et inversions.
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    [checked]="a11yConfig.dyslexicFont"
                    (change)="updateA11y({ dyslexicFont: !a11yConfig.dyslexicFont })"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#C62761] peer-checked:to-[#F5A623]"
                  ></div>
                </label>
              </div>

              <!-- Text Scale (Zoom) -->
              <div class="space-y-2">
                <label
                  class="block text-xs text-[var(--bridge-text-muted)] font-semibold uppercase tracking-wider"
                >
                  Grandeur du texte & Échelle d'affichage
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    *ngFor="let scale of textScaleOptions"
                    type="button"
                    (click)="updateA11y({ textScale: scale.value })"
                    class="py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center"
                    [class]="
                      a11yConfig.textScale === scale.value
                        ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white border-transparent shadow'
                        : 'border-white/10 bg-white/5 text-white/70 hover:text-white'
                    "
                  >
                    {{ scale.label }}
                  </button>
                </div>
              </div>

              <!-- Letter Spacing & Line Height -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-xs text-[var(--bridge-text-muted)] font-semibold uppercase tracking-wider mb-2"
                  >
                    Espacement des lettres (Interlettrage)
                  </label>
                  <select
                    [ngModel]="a11yConfig.letterSpacing"
                    (ngModelChange)="updateA11y({ letterSpacing: $event })"
                    class="bridge-input w-full text-xs text-white bg-[#10102A]"
                  >
                    <option value="normal">Normal (Standard)</option>
                    <option value="wide">Aéré (+6% espacement)</option>
                    <option value="wider">Très aéré (+12% espacement)</option>
                  </select>
                </div>
                <div>
                  <label
                    class="block text-xs text-[var(--bridge-text-muted)] font-semibold uppercase tracking-wider mb-2"
                  >
                    Interligne (Hauteur de ligne)
                  </label>
                  <select
                    [ngModel]="a11yConfig.lineHeight"
                    (ngModelChange)="updateA11y({ lineHeight: $event })"
                    class="bridge-input w-full text-xs text-white bg-[#10102A]"
                  >
                    <option value="normal">Normal (1.5)</option>
                    <option value="relaxed">Détendu (1.8)</option>
                    <option value="loose">Spacieux (2.1)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 3. VOICE ON & LECTEUR AUDIO INTÉGRÉ (Text-to-Speech) -->
            <div class="glass-card border border-[var(--bridge-border)] p-6 space-y-5">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-syne font-bold text-base text-white flex items-center gap-2">
                    <span class="text-emerald-400">🔊</span>
                    Voice On & Synthèse Vocale Interactive
                  </h3>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                    Permet la vocalisation instantanée et la lecture audio interactive des contenus
                    de la plateforme.
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    *ngIf="!isCurrentlySpeaking"
                    type="button"
                    (click)="testVoiceSpeech()"
                    class="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>▶️ Tester la voix</span>
                  </button>
                  <button
                    *ngIf="isCurrentlySpeaking"
                    type="button"
                    (click)="stopVoiceSpeech()"
                    class="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
                  >
                    <span>⏹️ Arrêter l'audio</span>
                  </button>
                </div>
              </div>

              <div class="grid sm:grid-cols-2 gap-4">
                <!-- Toggle Voice On -->
                <div
                  class="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <p class="text-sm font-semibold text-white">Activer Voice On</p>
                    <p class="text-[11px] text-[var(--bridge-text-muted)] mt-0.5">
                      Synthétiseur vocal disponible
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      [checked]="a11yConfig.voiceOn"
                      (change)="updateA11y({ voiceOn: !a11yConfig.voiceOn })"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"
                    ></div>
                  </label>
                </div>

                <!-- Toggle Voice on Hover -->
                <div
                  class="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <p class="text-sm font-semibold text-white">Lecture au Survol</p>
                    <p class="text-[11px] text-[var(--bridge-text-muted)] mt-0.5">
                      Lit automatiquement le texte sous la souris
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      [disabled]="!a11yConfig.voiceOn"
                      [checked]="a11yConfig.voiceHover"
                      (change)="updateA11y({ voiceHover: !a11yConfig.voiceHover })"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-disabled:opacity-40"
                    ></div>
                  </label>
                </div>
              </div>

              <!-- Speed and Language Settings -->
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-xs text-[var(--bridge-text-muted)] font-semibold uppercase tracking-wider mb-2"
                  >
                    Vitesse d'élocution (Débit vocal)
                  </label>
                  <select
                    [ngModel]="a11yConfig.speechRate"
                    (ngModelChange)="updateA11y({ speechRate: +$event })"
                    class="bridge-input w-full text-xs text-white bg-[#10102A]"
                  >
                    <option [value]="0.75">0.75x (Lente & Articulée)</option>
                    <option [value]="1.0">1.0x (Standard)</option>
                    <option [value]="1.25">1.25x (Rapide)</option>
                    <option [value]="1.5">1.5x (Très rapide)</option>
                  </select>
                </div>
                <div>
                  <label
                    class="block text-xs text-[var(--bridge-text-muted)] font-semibold uppercase tracking-wider mb-2"
                  >
                    Langue de vocalisation
                  </label>
                  <select
                    [ngModel]="a11yConfig.speechLanguage"
                    (ngModelChange)="updateA11y({ speechLanguage: $event })"
                    class="bridge-input w-full text-xs text-white bg-[#10102A]"
                  >
                    <option value="fr-FR">🇫🇷 Français (France)</option>
                    <option value="en-US">🇺🇸 English (US)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 4. AIDES VISUELLES & CONFORT DE NAVIGATION -->
            <div class="glass-card border border-[var(--bridge-border)] p-6 space-y-4">
              <h3 class="font-syne font-bold text-base text-white flex items-center gap-2">
                <span class="text-[var(--bridge-gold)]">🎯</span>
                Aides Visuelles & Confort de Navigation
              </h3>

              <div class="grid sm:grid-cols-2 gap-4">
                <!-- Reading Ruler -->
                <div
                  class="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <p class="text-sm font-semibold text-white">Règle de Lecture Horizontale</p>
                    <p class="text-[11px] text-[var(--bridge-text-muted)] mt-0.5">
                      Bande lumineuse suivant le curseur pour guider le regard
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      [checked]="a11yConfig.readingRuler"
                      (change)="updateA11y({ readingRuler: !a11yConfig.readingRuler })"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--bridge-gold)]"
                    ></div>
                  </label>
                </div>

                <!-- Reading Mask -->
                <div
                  class="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <p class="text-sm font-semibold text-white">Masque d'Ombrage Focus</p>
                    <p class="text-[11px] text-[var(--bridge-text-muted)] mt-0.5">
                      Assombrit l'écran pour isoler la ligne lue
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      [checked]="a11yConfig.readingMask"
                      (change)="updateA11y({ readingMask: !a11yConfig.readingMask })"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--bridge-gold)]"
                    ></div>
                  </label>
                </div>

                <!-- Big Cursor -->
                <div
                  class="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <p class="text-sm font-semibold text-white">Curseur Géant Haute Visibilité</p>
                    <p class="text-[11px] text-[var(--bridge-text-muted)] mt-0.5">
                      Pointeur agrandi et contrasté doré & noir
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      [checked]="a11yConfig.bigCursor"
                      (change)="updateA11y({ bigCursor: !a11yConfig.bigCursor })"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--bridge-gold)]"
                    ></div>
                  </label>
                </div>

                <!-- Highlight Links -->
                <div
                  class="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <p class="text-sm font-semibold text-white">Soulignement Renforcé</p>
                    <p class="text-[11px] text-[var(--bridge-text-muted)] mt-0.5">
                      Met en surbrillance tous les liens et boutons cliquables
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      [checked]="a11yConfig.highlightLinks"
                      (change)="updateA11y({ highlightLinks: !a11yConfig.highlightLinks })"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--bridge-gold)]"
                    ></div>
                  </label>
                </div>

                <!-- Reduced Motion -->
                <div
                  class="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between sm:col-span-2"
                >
                  <div>
                    <p class="text-sm font-semibold text-white">
                      Réduction des Animations & Mouvements
                    </p>
                    <p class="text-[11px] text-[var(--bridge-text-muted)] mt-0.5">
                      Désactive les transitions et secousses visuelles (Anti-vertiges / Épilepsie
                      photosensible)
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      [checked]="a11yConfig.reducedMotion"
                      (change)="updateA11y({ reducedMotion: !a11yConfig.reducedMotion })"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--bridge-gold)]"
                    ></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- 5. APERÇU INTERACTIF EN DIRECT -->
            <div
              class="glass-card border border-[var(--bridge-border)] p-6 space-y-4 bg-white/[0.02]"
            >
              <div class="flex items-center justify-between">
                <h4
                  class="font-syne font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2"
                >
                  <span>⚡</span> Zone de Prévisualisation en Temps Réel
                </h4>
                <span class="text-[10px] text-white/40">Testez le rendu immédiat</span>
              </div>
              <div class="p-5 rounded-2xl bg-[#08081A] border border-white/10 space-y-3">
                <div class="flex items-center justify-between">
                  <span
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[var(--bridge-crimson)]/20 text-[var(--bridge-crimson)] border border-[var(--bridge-crimson)]/30"
                  >
                    Exemple de Module de Formation
                  </span>
                  <span class="text-xs font-mono font-bold text-[#F5A623]">2 400 TND</span>
                </div>
                <h3 class="font-syne font-bold text-lg text-white">
                  Développement Full-Stack & Smart Contracts Polygon
                </h3>
                <p class="text-xs text-[var(--bridge-text-muted)] leading-relaxed">
                  Cette zone vous permet de tester immédiatement vos réglages : vérifiez la
                  lisibilité de la police dyslexique, l'effet du filtre de daltonisme, l'espacement
                  et la synthèse vocale.
                </p>
                <div class="pt-2 flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    (click)="testVoiceSpeech()"
                    class="px-4 py-2 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Bouton Interactif Démo
                  </button>
                  <a
                    href="javascript:void(0)"
                    class="text-xs text-[var(--bridge-gold)] font-semibold"
                  >
                    Lien d'exemple vers le cours →
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════════════════ -->
          <!-- ═══ TAB 3: SÉCURITÉ                                             ═══ -->
          <!-- ═══════════════════════════════════════════════════════════════════ -->
          <div *ngIf="activeTab === 'security'" class="space-y-5">
            <!-- Password Form -->
            <div class="glass-card border border-[var(--bridge-border)] p-6 space-y-5">
              <h3 class="font-syne font-bold text-white text-base">Modifier le Mot de Passe</h3>
              <div class="space-y-4">
                <div>
                  <label
                    class="block text-xs text-white/60 font-semibold uppercase tracking-wider mb-1.5"
                    >Mot de passe actuel</label
                  >
                  <input
                    [(ngModel)]="passwordForm.current"
                    type="password"
                    placeholder="••••••••"
                    class="bridge-input w-full text-sm text-white bg-[#10102A]"
                  />
                </div>
                <div>
                  <label
                    class="block text-xs text-white/60 font-semibold uppercase tracking-wider mb-1.5"
                    >Nouveau mot de passe</label
                  >
                  <input
                    [(ngModel)]="passwordForm.newPwd"
                    (ngModelChange)="checkPasswordStrength($event)"
                    type="password"
                    placeholder="••••••••"
                    class="bridge-input w-full text-sm text-white bg-[#10102A]"
                  />
                </div>
                <div>
                  <label
                    class="block text-xs text-white/60 font-semibold uppercase tracking-wider mb-1.5"
                    >Confirmer le nouveau mot de passe</label
                  >
                  <input
                    [(ngModel)]="passwordForm.confirm"
                    type="password"
                    placeholder="••••••••"
                    class="bridge-input w-full text-sm text-white bg-[#10102A]"
                  />
                </div>
              </div>
              <div class="flex justify-end pt-2">
                <button
                  type="button"
                  (click)="savePassword()"
                  [disabled]="
                    savingPwd ||
                    !passwordForm.current ||
                    !passwordForm.newPwd ||
                    passwordForm.newPwd !== passwordForm.confirm
                  "
                  class="bridge-btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <span>{{ savingPwd ? 'Mise à jour...' : 'Mettre à jour le mot de passe' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════════════════ -->
          <!-- ═══ TAB 4: PLATEFORME (ADMIN ONLY)                              ═══ -->
          <!-- ═══════════════════════════════════════════════════════════════════ -->
          <div *ngIf="activeTab === 'platform' && isAdmin" class="space-y-5">
            <div class="grid md:grid-cols-2 gap-5">
              <div class="glass-card border border-[var(--bridge-border)] p-6">
                <h3 class="font-syne font-bold text-white text-base mb-4">Configuration Email</h3>
                <div class="space-y-3">
                  <div>
                    <label
                      class="block text-xs text-white/60 font-semibold uppercase tracking-wider mb-1.5"
                      >Serveur SMTP</label
                    >
                    <input
                      value="smtp.gmail.com"
                      disabled
                      class="bridge-input w-full text-sm text-white/40 bg-white/5 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-xs text-white/60 font-semibold uppercase tracking-wider mb-1.5"
                      >Port</label
                    >
                    <input
                      value="587"
                      disabled
                      class="bridge-input w-full text-sm text-white/40 bg-white/5 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div class="glass-card border border-[var(--bridge-border)] p-6">
                <h3 class="font-syne font-bold text-white text-base mb-4">
                  Smart Contract Polygon
                </h3>
                <div class="space-y-3">
                  <div
                    class="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5"
                  >
                    <span class="text-sm text-[var(--bridge-text-muted)]">Réseau</span>
                    <span class="text-sm text-white font-medium">Polygon Amoy / Mainnet</span>
                  </div>
                  <div
                    class="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5"
                  >
                    <span class="text-sm text-[var(--bridge-text-muted)]">Statut</span>
                    <span
                      class="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-bold border border-emerald-500/20"
                    >
                      <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                      Opérationnel
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent implements OnInit, OnDestroy {
  user: User | null = null;
  activeTab = 'profile';
  saving = false;
  savingPwd = false;
  successMsg = '';
  errorMsg = '';
  pwdSuccess = '';
  pwdError = '';

  profileForm: any = {};
  passwordForm = { current: '', newPwd: '', confirm: '' };

  // Avatar upload
  avatarDragOver = false;
  avatarUploading = false;
  avatarError = '';
  avatarSuccess = '';

  // Tabs List (Fixed array to prevent re-instantiation in *ngFor)
  tabs: TabItem[] = [];

  // ── Accessibility State ──
  a11yConfig: AccessibilityConfig;
  isCurrentlySpeaking = false;
  private a11ySub?: Subscription;
  private speakingSub?: Subscription;

  daltonismOptions: { value: DaltonismMode; label: string; desc: string }[] = [
    { value: 'none', label: 'Standard', desc: 'Couleurs par défaut de la plateforme' },
    {
      value: 'protanopia',
      label: 'Protanopie',
      desc: 'Déficience du rouge (Rouge atténué / indistinguable)',
    },
    {
      value: 'deuteranopia',
      label: 'Deutéranopie',
      desc: 'Déficience du vert (Forme la plus fréquente)',
    },
    { value: 'tritanopia', label: 'Tritanopie', desc: 'Déficience du bleu / jaune' },
    {
      value: 'achromatopsia',
      label: 'Achromatopsie',
      desc: 'Monochrome / Vision en niveaux de gris',
    },
    {
      value: 'high-contrast',
      label: 'Contraste Élevé',
      desc: 'Augmentation des contrastes et de la netteté',
    },
    { value: 'inverted', label: 'Inversion', desc: 'Inversion complète des teintes' },
  ];

  textScaleOptions: { value: TextScale; label: string }[] = [
    { value: 'normal', label: '100% Normal' },
    { value: 'large', label: '112% Confort' },
    { value: 'xlarge', label: '125% Grand' },
    { value: 'huge', label: '140% Géant' },
  ];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private adminService: AdminService,
    private a11yService: AccessibilityService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) {
    this.a11yConfig = this.a11yService.getConfig();
  }

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.profileForm = {
        prenom: this.user.prenom,
        nom: this.user.nom,
        telephone: this.user.telephone,
        age: this.user.age,
        avatar: this.user.avatar,
      };
    }

    this.initTabs();

    this.a11ySub = this.a11yService.config.subscribe((c) => {
      this.a11yConfig = c;
    });

    this.speakingSub = this.a11yService.isSpeaking.subscribe((speaking) => {
      this.isCurrentlySpeaking = speaking;
    });

    this.route.queryParams.subscribe((params) => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.a11ySub) this.a11ySub.unsubscribe();
    if (this.speakingSub) this.speakingSub.unsubscribe();
  }

  initTabs(): void {
    const list: TabItem[] = [
      {
        key: 'profile',
        label: 'Profil',
        desc: 'Informations personnelles',
      },
      {
        key: 'accessibility',
        label: 'Accessibilité & WCAG',
        desc: 'Daltonisme, dyslexie, voix & zoom',
      },
      {
        key: 'security',
        label: 'Sécurité',
        desc: 'Mot de passe & accès',
      },
    ];
    if (this.user?.role === 'ADMIN') {
      list.push({
        key: 'platform',
        label: 'Plateforme',
        desc: 'Configuration admin & blockchain',
      });
    }
    this.tabs = list;
  }

  trackByTabKey(index: number, tab: TabItem): string {
    return tab.key;
  }

  selectTab(tabKey: string): void {
    this.activeTab = tabKey;
  }

  get isAdmin(): boolean {
    return this.user?.role === 'ADMIN';
  }
  get isFormateur(): boolean {
    return this.user?.role === 'FORMATEUR';
  }

  get userInitials(): string {
    const p = this.user?.prenom?.[0] || '';
    const n = this.user?.nom?.[0] || '';
    return (p + n).toUpperCase();
  }

  // ── A11y Controls ──
  updateA11y(partial: Partial<AccessibilityConfig>): void {
    this.a11yService.updateConfig(partial);
  }

  resetA11yDefaults(): void {
    this.a11yService.resetDefaults();
  }

  testVoiceSpeech(): void {
    const msg =
      this.a11yConfig.speechLanguage === 'en-US'
        ? 'Welcome to The Bridge. Accessibility features and screen reader are active.'
        : 'Bienvenue sur la plateforme The Bridge. Le moteur d’accessibilité et la synthèse vocale sont activés.';
    this.a11yService.speak(msg);
  }

  stopVoiceSpeech(): void {
    this.a11yService.stopSpeaking();
  }

  // ── Password Check ──
  checkPasswordStrength(pwd: string): void {
    if (!pwd) return;
  }

  saveProfile(): void {
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.userService
      .updateProfile({
        prenom: this.profileForm.prenom,
        nom: this.profileForm.nom,
        telephone: this.profileForm.telephone,
        age: this.profileForm.age,
        avatar: this.profileForm.avatar,
      })
      .subscribe({
        next: (updated) => {
          this.saving = false;
          this.successMsg = 'Profil mis à jour avec succès !';
          this.user = updated;
          this.authService.updateCurrentUser(updated);
          this.toastService.success(
            'Vos informations personnelles ont été mises à jour.',
            'Profil',
          );
        },
        error: (err) => {
          this.saving = false;
          this.errorMsg = err?.error?.message || 'Erreur lors de la sauvegarde';
          this.toastService.error(this.errorMsg, 'Profil');
        },
      });
  }

  savePassword(): void {
    if (this.passwordForm.newPwd !== this.passwordForm.confirm) {
      this.toastService.error('Les mots de passe ne correspondent pas.', 'Sécurité');
      return;
    }
    if (!this.passwordForm.current || !this.passwordForm.newPwd) return;
    this.savingPwd = true;
    this.http
      .post(`${environment.apiUrl}/users/change-password`, {
        currentPassword: this.passwordForm.current,
        newPassword: this.passwordForm.newPwd,
      })
      .subscribe({
        next: () => {
          this.savingPwd = false;
          this.passwordForm = { current: '', newPwd: '', confirm: '' };
          this.toastService.success('Votre mot de passe a été modifié avec succès.', 'Sécurité');
        },
        error: (err: any) => {
          this.savingPwd = false;
          this.toastService.error(
            err?.error?.message || 'Mot de passe actuel incorrect',
            'Sécurité',
          );
        },
      });
  }

  removeAvatar(): void {
    this.profileForm.avatar = '';
  }

  onAvatarDragOver(event: DragEvent): void {
    event.preventDefault();
    this.avatarDragOver = true;
  }

  onAvatarDragLeave(): void {
    this.avatarDragOver = false;
  }

  onAvatarDrop(event: DragEvent): void {
    event.preventDefault();
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
    if (!file.type.startsWith('image/')) return;
    this.avatarUploading = true;
    const reader = new FileReader();
    reader.onload = () => {
      this.profileForm.avatar = reader.result as string;
      this.avatarUploading = false;
    };
    reader.readAsDataURL(file);
  }
}
