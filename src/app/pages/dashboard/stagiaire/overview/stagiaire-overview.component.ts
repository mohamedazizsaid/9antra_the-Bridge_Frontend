import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { FormationService } from '../../../../core/services/formation.service';
import { PaiementService } from '../../../../core/services/paiement.service';
import { CertificatService } from '../../../../core/services/certificat.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { EnrollmentService } from '../../../../core/services/enrollment.service';
import { User } from '../../../../core/models/user.model';
import { Formation, Seance } from '../../../../core/models/formation.model';
import { Paiement } from '../../../../core/models/paiement.model';
import { Certificat } from '../../../../core/models/certificat.model';
import { Notification } from '../../../../core/models/notification.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stagiaire-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen space-y-6">

      <!-- ═══════════════════════════════ HEADER ═══════════════════════════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="font-syne font-bold text-2xl md:text-3xl text-white flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-lg font-bold shadow-lg">
              {{ user?.prenom?.[0] }}
            </div>
            Bonjour, <span class="bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text text-transparent">{{ user?.prenom }}</span> 👋
          </h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1 ml-13">{{ today }}</p>
        </div>
        <!-- Unread badge -->
        <div class="flex items-center gap-3">
          <button (click)="setActiveTab('notifications')"
                  class="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[rgba(198,39,97,0.3)] transition-all text-sm text-white">
            🔔 Notifications
            <span *ngIf="unreadCount > 0"
                  class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#C62761] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- ═══════════════════════════════ PAYMENT REMINDER BANNER ═══════════════════════════════ -->
      <div *ngIf="urgentPayments.length > 0"
           class="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-500/10 p-4">
        <div class="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent pointer-events-none"></div>
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xl flex-shrink-0 animate-pulse">
            ⚠️
          </div>
          <div class="flex-1">
            <p class="font-semibold text-orange-300 text-sm">Rappel de paiement</p>
            <p class="text-orange-200/70 text-xs mt-0.5">
              Vous avez <strong>{{ urgentPayments.length }}</strong> paiement(s) à effectuer bientôt.
              <span *ngFor="let p of urgentPayments; let last = last">
                Phase {{ p.phaseNumero }} ({{ p.montant }} TND — {{ getDaysUntilDue(p.dateEcheance) }} jrs)<span *ngIf="!last">, </span>
              </span>
            </p>
          </div>
          <button (click)="setActiveTab('paiements'); scrollToSection('payments-section')"
                  class="flex-shrink-0 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-xl transition-all">
            Payer →
          </button>
        </div>
      </div>

      <!-- ═══════════════════════════════ KPI CARDS ═══════════════════════════════ -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <!-- Formations inscrites -->
        <div class="glass-card p-5 border border-[var(--bridge-border)] group hover:border-[rgba(198,39,97,0.3)] transition-all duration-300 cursor-pointer"
             (click)="setActiveTab('mes-formations')">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold">Mes Formations</p>
              <p class="text-4xl font-mono font-black text-[#C62761] mt-2 group-hover:scale-110 transition-transform">{{ myFormations.length }}</p>
              <p class="text-[10px] text-emerald-400 mt-1 font-semibold">{{ activeFormationsCount }} active(s)</p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-[rgba(198,39,97,0.1)] border border-[rgba(198,39,97,0.2)] flex items-center justify-center text-2xl group-hover:bg-[rgba(198,39,97,0.2)] transition-all">
              📚
            </div>
          </div>
          <div class="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-[#C62761] to-[#F5A623] rounded-full transition-all duration-1000"
                 [style.width]="(myFormations.length > 0 ? 100 : 0) + '%'"></div>
          </div>
        </div>

        <!-- Assiduité -->
        <div class="glass-card p-5 border border-[var(--bridge-border)] group hover:border-[rgba(245,166,35,0.3)] transition-all duration-300">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold">Assiduité</p>
              <p class="text-4xl font-mono font-black text-[#F5A623] mt-2 group-hover:scale-110 transition-transform">{{ attendanceRate }}<span class="text-lg">%</span></p>
              <p class="text-[10px] mt-1 font-semibold" [class]="attendanceRate >= 75 ? 'text-emerald-400' : 'text-red-400'">
                {{ attendanceRate >= 75 ? '✓ Satisfaisante' : '⚠ Insuffisante' }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.2)] flex items-center justify-center text-2xl">
              📊
            </div>
          </div>
          <div class="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-1000"
                 [class]="attendanceRate >= 75 ? 'bg-emerald-500' : 'bg-red-500'"
                 [style.width]="attendanceRate + '%'"></div>
          </div>
        </div>

        <!-- Paiements en retard -->
        <div class="glass-card p-5 border border-[var(--bridge-border)] group hover:border-red-500/30 transition-all duration-300 cursor-pointer"
             (click)="setActiveTab('paiements')">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold">Paiements</p>
              <p class="text-4xl font-mono font-black mt-2 group-hover:scale-110 transition-transform"
                 [class]="retardCount > 0 ? 'text-red-400' : 'text-emerald-400'">
                 {{ paidPaymentsCount }}<span class="text-lg text-[var(--bridge-text-muted)]">/{{ paiements.length }}</span>
              </p>
              <p class="text-[10px] mt-1 font-semibold"
                 [class]="retardCount > 0 ? 'text-red-400' : 'text-emerald-400'">
                {{ retardCount > 0 ? retardCount + ' en retard ⚠' : 'À jour ✓' }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                 [class]="retardCount > 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'">
              💳
            </div>
          </div>
          <div class="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                  [style.width]="paymentProgressPercentage"></div>
          </div>
        </div>

        <!-- Certificats -->
        <div class="glass-card p-5 border border-[var(--bridge-border)] group hover:border-[rgba(198,39,97,0.3)] transition-all duration-300 cursor-pointer"
             (click)="setActiveTab('certificats')">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-widest font-semibold">Certificats</p>
              <p class="text-4xl font-mono font-black bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text text-transparent mt-2 group-hover:scale-110 transition-transform">
                {{ certificats.length }}
              </p>
              <p class="text-[10px] text-[var(--bridge-text-muted)] mt-1 font-semibold">🔗 Blockchain</p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[rgba(198,39,97,0.1)] to-[rgba(245,166,35,0.1)] border border-[rgba(198,39,97,0.2)] flex items-center justify-center text-2xl">
              🏆
            </div>
          </div>
          <div class="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-[#C62761] to-[#F5A623] rounded-full" style="width: 100%"></div>
          </div>
        </div>

      </div>

      <!-- ═══════════════════════════════ TAB NAV ═══════════════════════════════ -->
      <div class="flex items-center gap-1 p-1 glass-card border border-[var(--bridge-border)] rounded-2xl overflow-x-auto">
        <button *ngFor="let tab of tabs" (click)="setActiveTab(tab.key)"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0"
                [class]="activeTab === tab.key
                  ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-lg'
                  : 'text-[var(--bridge-text-muted)] hover:text-white hover:bg-white/5'">
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- ═══════════════════════════════ TAB: CATALOGUE FORMATIONS ═══════════════════════════════ -->
      <div *ngIf="activeTab === 'catalogue'" class="space-y-6">

        <!-- Search & Filter -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bridge-text-muted)]">🔍</span>
            <input [(ngModel)]="catalogSearch" (ngModelChange)="filterCatalogue()"
                   placeholder="Rechercher une formation..."
                   class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C62761] transition-all">
          </div>
          <select [(ngModel)]="catalogCategory" (ngModelChange)="filterCatalogue()"
                  class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-all min-w-[160px]">
            <option value="">Toutes les catégories</option>
            <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
          </select>
        </div>

        <!-- Formations grid -->
        <div *ngIf="filteredCatalogue.length > 0" class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div *ngFor="let f of filteredCatalogue"
               class="glass-card border border-[var(--bridge-border)] overflow-hidden group hover:border-[rgba(198,39,97,0.4)] hover:-translate-y-1 transition-all duration-300">
            <!-- Card Top -->
            <div class="h-2 bg-gradient-to-r from-[#C62761] to-[#F5A623]"></div>
            <div class="p-5">
              <!-- Category badge -->
              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[rgba(198,39,97,0.1)] text-[#C62761] border border-[rgba(198,39,97,0.2)]">
                  {{ f.category || 'Général' }}
                </span>
                <span *ngIf="isEnrolled(f.id)"
                      class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ✓ Inscrit
                </span>
              </div>
              <!-- Title -->
              <h3 class="font-syne font-bold text-white text-base leading-tight group-hover:text-[#F5A623] transition-colors">{{ f.nom }}</h3>
              <p class="text-[var(--bridge-text-muted)] text-xs mt-2 line-clamp-2 leading-relaxed">{{ f.description }}</p>
              <!-- Stats -->
              <div class="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-[var(--bridge-text-muted)]">
                <span class="flex items-center gap-1">👨‍🏫 {{ f.formateurNom }}</span>
                <span class="flex items-center gap-1">📋 {{ f.phases.length }} phase(s)</span>
              </div>
              <!-- Price & Enroll -->
              <div class="flex items-center justify-between mt-4">
                <div>
                  <span class="text-xs text-[var(--bridge-text-muted)]">Prix total</span>
                  <p class="font-mono font-bold text-[#F5A623] text-lg">{{ f.totalPrice || 0 }} <span class="text-xs text-[var(--bridge-text-muted)]">TND</span></p>
                </div>
                <button *ngIf="!isEnrolled(f.id)" (click)="enrollFormation(f)"
                        [disabled]="enrollingId === f.id"
                        class="px-4 py-2 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-xs font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-[rgba(198,39,97,0.2)]">
                  {{ enrollingId === f.id ? '⏳...' : "S'inscrire →" }}
                </button>
                <button *ngIf="isEnrolled(f.id)" (click)="setActiveTab('mes-formations')"
                        class="px-4 py-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                  Voir →
                </button>
              </div>
              <!-- Enroll success/error messages -->
              <p *ngIf="enrollSuccessId === f.id" class="text-[10px] text-emerald-400 mt-2 text-center font-semibold">✓ Inscription confirmée !</p>
              <p *ngIf="enrollErrorId === f.id" class="text-[10px] text-red-400 mt-2 text-center">{{ enrollError }}</p>
            </div>
          </div>
        </div>

        <!-- Empty catalogue -->
        <div *ngIf="filteredCatalogue.length === 0 && !loadingCatalogue" class="glass-card border border-[var(--bridge-border)] p-16 text-center">
          <div class="text-5xl mb-4">🔍</div>
          <p class="font-syne font-bold text-lg text-white">Aucune formation trouvée</p>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-2">Essayez une autre recherche ou catégorie.</p>
        </div>

        <!-- Loading -->
        <div *ngIf="loadingCatalogue" class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div *ngFor="let _ of [1,2,3,4,5,6]" class="glass-card border border-[var(--bridge-border)] p-5 animate-pulse">
            <div class="h-2 bg-white/10 rounded mb-4"></div>
            <div class="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-white/5 rounded w-full mb-1"></div>
            <div class="h-3 bg-white/5 rounded w-4/5"></div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════ TAB: MES FORMATIONS ═══════════════════════════════ -->
      <div *ngIf="activeTab === 'mes-formations'" class="space-y-6">

        <!-- Empty state -->
        <div *ngIf="myFormations.length === 0 && !loadingMine" class="glass-card border border-[var(--bridge-border)] p-16 text-center">
          <div class="text-5xl mb-4 animate-bounce">📚</div>
          <p class="font-syne font-bold text-lg text-white">Aucune formation en cours</p>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-2">Parcourez le catalogue et inscrivez-vous à votre première formation.</p>
          <button (click)="setActiveTab('catalogue')"
                  class="mt-6 px-6 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all">
            Voir le catalogue →
          </button>
        </div>

        <!-- Loading -->
        <div *ngIf="loadingMine" class="space-y-4">
          <div *ngFor="let _ of [1,2]" class="glass-card border border-[var(--bridge-border)] p-6 animate-pulse">
            <div class="h-5 bg-white/10 rounded w-1/3 mb-4"></div>
            <div class="h-3 bg-white/5 rounded w-full mb-2"></div>
            <div class="h-3 bg-white/5 rounded w-3/4"></div>
          </div>
        </div>

        <!-- Formation cards -->
        <div *ngFor="let f of myFormations" class="glass-card border border-[var(--bridge-border)] overflow-hidden">
          <!-- Card header -->
          <div class="flex items-center justify-between p-6 border-b border-[var(--bridge-border)]">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xl shadow-lg flex-shrink-0">
                📚
              </div>
              <div>
                <h3 class="font-syne font-bold text-white text-lg">{{ f.nom }}</h3>
                <p class="text-[var(--bridge-text-muted)] text-sm">{{ f.formateurNom }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-[10px] font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACTIF</span>
              <button (click)="goToFormationDetail(f)"
                      class="text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white rounded-lg hover:opacity-90 transition-all">
                Détails →
              </button>
            </div>
          </div>

          <!-- Overall progress bar -->
          <div class="px-6 pt-5">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-[var(--bridge-text-muted)] font-semibold uppercase tracking-wider">Progression globale</span>
              <span class="font-mono text-xs font-bold text-[#F5A623]">{{ getFormationProgress(f) }}%</span>
            </div>
            <div class="h-2 rounded-full bg-white/5 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-[#C62761] to-[#F5A623] rounded-full transition-all duration-1000"
                   [style.width]="getFormationProgress(f) + '%'"></div>
            </div>
          </div>

          <!-- Phases timeline -->
          <div class="p-6 space-y-4">
            <div *ngFor="let phase of f.phases; let i = index" class="relative">
              <!-- Connector line -->
              <div *ngIf="i < f.phases.length - 1"
                   class="absolute left-5 top-10 w-0.5 h-full bg-white/10 z-0"></div>
              <div class="flex items-start gap-4 relative z-10">
                <!-- Status dot -->
                <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold border-2 shadow-lg"
                     [class]="phase.status === 'COMPLETEE'
                       ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-500/20'
                       : phase.status === 'EN_COURS'
                       ? 'bg-[rgba(198,39,97,0.2)] text-[#C62761] border-[rgba(198,39,97,0.5)] shadow-[rgba(198,39,97,0.2)] animate-pulse'
                       : 'bg-white/5 text-white/30 border-white/10'">
                  {{ phase.status === 'COMPLETEE' ? '✓' : phase.status === 'EN_COURS' ? '▶' : '🔒' }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <p class="text-sm font-bold" [class]="phase.status === 'VERROUILLEE' ? 'text-white/30' : 'text-white'">
                      Phase {{ phase.numero }} — {{ phase.nom }}
                    </p>
                    <span class="text-xs font-mono" [class]="phase.status === 'COMPLETEE' ? 'text-emerald-400' : 'text-[var(--bridge-text-muted)]'">
                      {{ phase.status !== 'VERROUILLEE' ? (phase.progression + '%') : '' }}
                    </span>
                  </div>
                  <p class="text-xs text-[var(--bridge-text-muted)] leading-relaxed">{{ phase.description }}</p>
                  <!-- Phase progress bar -->
                  <div class="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden" *ngIf="phase.status !== 'VERROUILLEE'">
                    <div class="h-full rounded-full transition-all duration-1000"
                         [class]="phase.status === 'COMPLETEE' ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#C62761] to-[#F5A623]'"
                         [style.width]="phase.progression + '%'"></div>
                  </div>
                  <!-- Sessions count -->
                  <div class="flex items-center gap-4 mt-2 text-[10px] text-[var(--bridge-text-muted)]" *ngIf="phase.status !== 'VERROUILLEE'">
                    <span>📅 {{ phase.seances.length }} séances</span>
                    <span *ngIf="phase.status === 'COMPLETEE'" class="text-emerald-400 font-semibold">✓ Phase complétée</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Upcoming sessions of this formation -->
          <div class="border-t border-[var(--bridge-border)] p-6" *ngIf="getUpcomingForFormation(f).length > 0">
            <h4 class="text-xs font-bold text-[var(--bridge-text-muted)] uppercase tracking-wider mb-3">Prochaines séances</h4>
            <div class="space-y-2">
              <div *ngFor="let s of getUpcomingForFormation(f)" class="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div class="text-center w-10">
                  <div class="text-[10px] font-bold uppercase text-[#F5A623]">{{ formatDay(s.date) }}</div>
                  <div class="text-lg font-mono font-bold text-white">{{ formatDayNum(s.date) }}</div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-white">{{ s.heureDebut }}</p>
                  <p class="text-xs text-[var(--bridge-text-muted)]">{{ s.salle || (s.type === 'EN_LIGNE' ? 'En ligne' : 'Salle non définie') }}</p>
                </div>
                <span class="text-[10px] px-2 py-1 rounded-full border"
                      [class]="s.type === 'EN_LIGNE' ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' : 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'">
                  {{ s.type === 'EN_LIGNE' ? '🌐' : '🏫' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════ TAB: PAIEMENTS ═══════════════════════════════ -->
      <div *ngIf="activeTab === 'paiements'" id="payments-section" class="space-y-6">

        <!-- Summary bar -->
        <div class="grid grid-cols-3 gap-4">
          <div class="glass-card border border-emerald-500/20 p-4 text-center">
            <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider mb-1">Payés</p>
            <p class="text-2xl font-mono font-bold text-emerald-400">{{ paidPaymentsCount }}</p>
            <p class="text-xs text-emerald-400/70 font-mono mt-1">{{ getTotalPaid() }} TND</p>
          </div>
          <div class="glass-card border border-orange-500/20 p-4 text-center">
            <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider mb-1">En attente</p>
            <p class="text-2xl font-mono font-bold text-[#F5A623]">{{ pendingPaymentsCount }}</p>
            <p class="text-xs text-[#F5A623]/70 font-mono mt-1">{{ getTotalPending() }} TND</p>
          </div>
          <div class="glass-card border border-red-500/20 p-4 text-center">
            <p class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider mb-1">En retard</p>
            <p class="text-2xl font-mono font-bold text-red-400">{{ retardCount }}</p>
            <p class="text-xs text-red-400/70 font-mono mt-1">{{ getTotalLate() }} TND</p>
          </div>
        </div>

        <!-- Payment timeline -->
        <div class="glass-card border border-[var(--bridge-border)] overflow-hidden">
          <div class="p-6 border-b border-[var(--bridge-border)] flex items-center justify-between">
            <h3 class="font-syne font-bold text-lg">💰 Historique des Paiements</h3>
            <span class="text-xs text-[var(--bridge-text-muted)]">{{ paiements.length }} transaction(s)</span>
          </div>

          <div *ngIf="paiements.length === 0" class="p-12 text-center">
            <div class="text-4xl mb-3">💳</div>
            <p class="text-[var(--bridge-text-muted)] text-sm">Aucun paiement enregistré</p>
          </div>

          <div class="divide-y divide-white/[0.03]">
            <div *ngFor="let p of paiements"
                 class="flex items-center gap-5 px-6 py-4 hover:bg-white/[0.02] transition-colors"
                 [class]="p.status === 'EN_RETARD' ? 'bg-red-500/[0.03] border-l-2 border-red-500/50' : ''">
              <!-- Status Icon -->
              <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                   [class]="p.status === 'PAYE' ? 'bg-emerald-500/15 border border-emerald-500/20'
                          : p.status === 'EN_RETARD' ? 'bg-red-500/15 border border-red-500/20 animate-pulse'
                          : 'bg-orange-500/15 border border-orange-500/20'">
                {{ p.status === 'PAYE' ? '✅' : p.status === 'EN_RETARD' ? '⚠️' : '⏳' }}
              </div>
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-white">Phase {{ p.phaseNumero }}</p>
                <div class="flex items-center gap-3 mt-0.5">
                  <p class="text-xs text-[var(--bridge-text-muted)] font-mono">
                    {{ p.datePaiement ? (p.datePaiement | date:'dd/MM/yyyy') : 'Non payé' }}
                  </p>
                  <span class="text-[10px] text-[var(--bridge-text-muted)]">•</span>
                  <p class="text-xs text-[var(--bridge-text-muted)]">{{ p.methode || '—' }}</p>
                </div>
                <!-- Due date warning -->
                <p *ngIf="p.status !== 'PAYE'" class="text-[10px] mt-0.5"
                   [class]="p.status === 'EN_RETARD' ? 'text-red-400' : 'text-orange-400'">
                  Échéance : {{ p.dateEcheance | date:'dd/MM/yyyy' }}
                  <span *ngIf="getDaysUntilDue(p.dateEcheance) >= 0"> — {{ getDaysUntilDue(p.dateEcheance) }} jrs restants</span>
                  <span *ngIf="getDaysUntilDue(p.dateEcheance) < 0"> — {{ -getDaysUntilDue(p.dateEcheance) }} jrs de retard</span>
                </p>
              </div>
              <!-- Amount -->
              <div class="text-right flex-shrink-0">
                <p class="font-mono font-bold text-white text-base">{{ p.montant }} <span class="text-xs text-[var(--bridge-text-muted)]">TND</span></p>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block"
                      [class]="p.status === 'PAYE' ? 'bg-emerald-500/10 text-emerald-400'
                             : p.status === 'EN_RETARD' ? 'bg-red-500/10 text-red-400'
                             : 'bg-orange-500/10 text-orange-400'">
                  {{ p.status === 'PAYE' ? 'Payé' : p.status === 'EN_RETARD' ? 'Retard' : 'Attente' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════ TAB: CERTIFICATS ═══════════════════════════════ -->
      <div *ngIf="activeTab === 'certificats'" class="space-y-6">

        <!-- Empty state -->
        <div *ngIf="certificats.length === 0" class="glass-card border border-[var(--bridge-border)] p-16 text-center">
          <div class="text-6xl mb-4">🏆</div>
          <p class="font-syne font-bold text-xl text-white">Pas encore de certificat</p>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-2 max-w-sm mx-auto">
            Complétez vos phases de formation avec 75%+ d'assiduité et de bonnes évaluations pour obtenir vos certificats blockchain.
          </p>
        </div>

        <!-- Certificates grid -->
        <div class="grid md:grid-cols-2 gap-6" *ngIf="certificats.length > 0">
          <div *ngFor="let cert of certificats"
               class="relative glass-card border border-[rgba(198,39,97,0.3)] overflow-hidden group hover:border-[rgba(245,166,35,0.4)] hover:-translate-y-1 transition-all duration-300">
            <!-- Background glow -->
            <div class="absolute inset-0 bg-gradient-to-br from-[rgba(198,39,97,0.05)] via-transparent to-[rgba(245,166,35,0.05)] pointer-events-none"></div>
            <!-- Top bar -->
            <div class="h-1 bg-gradient-to-r from-[#C62761] via-[#F5A623] to-[#C62761] bg-size-200 animate-gradient"></div>
            <div class="p-6">
              <!-- Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[rgba(198,39,97,0.2)] to-[rgba(245,166,35,0.2)] border border-[rgba(198,39,97,0.3)] flex items-center justify-center text-3xl shadow-lg">
                  🏆
                </div>
                <div class="text-right">
                  <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Vérifié Blockchain
                  </span>
                </div>
              </div>
              <!-- Content -->
              <h3 class="font-syne font-bold text-white text-lg leading-tight">{{ cert.phaseNom }}</h3>
              <p class="text-[var(--bridge-text-muted)] text-sm mt-1">{{ cert.formationNom }}</p>
              <!-- Issue date -->
              <div class="flex items-center gap-2 mt-4">
                <span class="text-[#F5A623] text-sm">📅</span>
                <span class="font-mono text-xs text-[var(--bridge-text-muted)]">Émis le {{ cert.dateObtention | date:'dd MMMM yyyy' : '' : 'fr' }}</span>
              </div>
              <!-- Blockchain hash -->
              <div class="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <p class="text-[10px] text-[var(--bridge-text-muted)] font-semibold uppercase tracking-wider mb-1">Hash Blockchain</p>
                <p class="font-mono text-[10px] text-[#F5A623] truncate">{{ cert.hashBlockchain || 'N/A' }}</p>
              </div>
              <!-- Actions -->
              <div class="flex gap-3 mt-5">
                <a *ngIf="cert.pdfUrl" [href]="cert.pdfUrl" target="_blank"
                   class="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-xs font-semibold rounded-xl transition-all">
                  📄 Télécharger PDF
                </a>
                <button (click)="openCertificateVerif(cert)"
                        class="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[rgba(198,39,97,0.15)] to-[rgba(245,166,35,0.1)] hover:from-[rgba(198,39,97,0.25)] hover:to-[rgba(245,166,35,0.2)] border border-[rgba(198,39,97,0.3)] text-[#C62761] text-xs font-semibold rounded-xl transition-all">
                  🔗 Vérifier
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Certificate verif modal -->
        <div *ngIf="selectedCertForVerif" class="fixed inset-0 z-50 flex items-center justify-center p-4"
             (click)="selectedCertForVerif = null">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div class="relative glass-card border border-[rgba(198,39,97,0.4)] rounded-2xl p-8 max-w-md w-full"
               (click)="$event.stopPropagation()">
            <div class="text-center">
              <div class="text-5xl mb-4">🔗</div>
              <h3 class="font-syne font-bold text-xl text-white mb-2">Certificat Vérifié</h3>
              <p class="text-sm text-[var(--bridge-text-muted)] mb-6">{{ selectedCertForVerif.phaseNom }} — {{ selectedCertForVerif.formationNom }}</p>
              <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <div class="flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm mb-2">
                  <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Authentifié sur la Blockchain
                </div>
                <p class="font-mono text-xs text-emerald-300/70 break-all">{{ selectedCertForVerif.hashBlockchain }}</p>
              </div>
              <p class="text-xs text-[var(--bridge-text-muted)] mb-6">Émis le {{ selectedCertForVerif.dateObtention | date:'dd/MM/yyyy' }}</p>
              <button (click)="selectedCertForVerif = null"
                      class="px-6 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all">
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════ TAB: PRÉSENCE & ÉVALUATION ═══════════════════════════════ -->
      <div *ngIf="activeTab === 'presence'" class="space-y-6">

        <!-- Global attendance stat -->
        <div class="glass-card border border-[var(--bridge-border)] p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-syne font-bold text-lg">📊 Mon Assiduité Globale</h3>
            <span class="font-mono text-2xl font-black" [class]="attendanceRate >= 75 ? 'text-emerald-400' : 'text-red-400'">{{ attendanceRate }}%</span>
          </div>
          <div class="h-3 rounded-full bg-white/5 overflow-hidden mb-2">
            <div class="h-full rounded-full transition-all duration-1000"
                 [class]="attendanceRate >= 75 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-orange-500'"
                 [style.width]="attendanceRate + '%'"></div>
          </div>
          <div class="flex items-center justify-between text-xs text-[var(--bridge-text-muted)]">
            <span>Minimum requis : 75%</span>
            <span [class]="attendanceRate >= 75 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'">
              {{ attendanceRate >= 75 ? '✓ Éligible aux certificats' : '⚠ Seuil non atteint' }}
            </span>
          </div>
        </div>

        <!-- Per formation breakdown -->
        <div *ngFor="let f of myFormations" class="glass-card border border-[var(--bridge-border)] overflow-hidden">
          <div class="p-5 border-b border-[var(--bridge-border)] flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-base flex-shrink-0">📚</div>
            <div>
              <h4 class="font-syne font-bold text-white text-base">{{ f.nom }}</h4>
              <p class="text-xs text-[var(--bridge-text-muted)]">{{ f.formateurNom }}</p>
            </div>
          </div>

          <!-- Sessions attendance detail -->
          <div class="p-5">
            <div *ngFor="let phase of f.phases" class="mb-6 last:mb-0">
              <div class="flex items-center justify-between mb-3">
                <h5 class="text-sm font-bold text-white">Phase {{ phase.numero }} — {{ phase.nom }}</h5>
                <span class="text-xs font-mono text-[#F5A623]">{{ phase.progression }}%</span>
              </div>

              <div class="space-y-2" *ngIf="phase.seances && phase.seances.length > 0">
                <div *ngFor="let seance of phase.seances"
                     class="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <!-- Date -->
                  <div class="w-14 text-center flex-shrink-0">
                    <div class="text-[10px] font-bold uppercase text-[#F5A623]">{{ formatDay(seance.date) }}</div>
                    <div class="text-lg font-mono font-bold text-white">{{ formatDayNum(seance.date) }}</div>
                  </div>
                  <!-- Session info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-semibold text-white">{{ seance.heureDebut || '—' }}</p>
                      <span class="text-[10px] px-2 py-0.5 rounded-full border"
                            [class]="seance.type === 'EN_LIGNE' ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' : 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'">
                        {{ seance.type === 'EN_LIGNE' ? '🌐' : '🏫' }}
                      </span>
                    </div>
                    <!-- My presence for this session -->
                    <div class="flex items-center gap-4 mt-2" *ngIf="getMyPresence(seance) as pres">
                      <!-- Present/Absent -->
                      <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                            [class]="pres.present ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'">
                        {{ pres.present ? '✓ Présent' : '✗ Absent' }}
                      </span>
                      <!-- Star rating -->
                      <div *ngIf="pres.starRating" class="flex items-center gap-1">
                        <span *ngFor="let star of [1,2,3,4,5]" class="text-sm"
                              [class]="star <= (pres.starRating || 0) ? 'text-[#F5A623]' : 'text-white/20'">★</span>
                        <span class="text-xs text-[var(--bridge-text-muted)] ml-1">{{ pres.starRating }}/5</span>
                      </div>
                      <!-- Note -->
                      <p *ngIf="pres.sessionNote" class="text-xs text-[var(--bridge-text-muted)] italic truncate max-w-xs">
                        "{{ pres.sessionNote }}"
                      </p>
                    </div>
                    <!-- No record yet -->
                    <p *ngIf="!getMyPresence(seance)" class="text-xs text-white/30 mt-1 italic">Non enregistrée</p>
                  </div>
                </div>
              </div>

              <div *ngIf="!phase.seances || phase.seances.length === 0" class="text-xs text-white/30 italic py-2">
                Aucune séance pour cette phase.
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div *ngIf="myFormations.length === 0 && !loadingMine" class="glass-card border border-[var(--bridge-border)] p-12 text-center">
          <div class="text-4xl mb-3">📋</div>
          <p class="text-[var(--bridge-text-muted)] text-sm">Aucune donnée de présence disponible.</p>
        </div>
      </div>

      <!-- ═══════════════════════════════ TAB: NOTIFICATIONS ═══════════════════════════════ -->
      <div *ngIf="activeTab === 'notifications'" class="space-y-4">

        <div class="flex items-center justify-between">
          <h3 class="font-syne font-bold text-xl text-white">🔔 Mes Notifications</h3>
          <button *ngIf="unreadCount > 0" (click)="markAllRead()"
                  class="text-xs px-4 py-2 rounded-xl border border-[rgba(198,39,97,0.3)] text-[#C62761] hover:bg-[rgba(198,39,97,0.1)] transition-all font-semibold">
            ✓ Tout marquer lu
          </button>
        </div>

        <div *ngIf="allNotifications.length === 0" class="glass-card border border-[var(--bridge-border)] p-12 text-center">
          <div class="text-4xl mb-3">🔔</div>
          <p class="text-[var(--bridge-text-muted)] text-sm">Aucune notification</p>
        </div>

        <div class="space-y-2">
          <div *ngFor="let notif of allNotifications"
               class="flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer hover:bg-white/[0.02]"
               [class]="notif.read ? 'border-white/5 bg-white/[0.01]' : 'border-[rgba(198,39,97,0.2)] bg-[rgba(198,39,97,0.03)]'"
               (click)="markNotifRead(notif.id)">
            <!-- Icon -->
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                 [class]="notif.read ? 'bg-white/5' : 'bg-[rgba(198,39,97,0.1)] border border-[rgba(198,39,97,0.2)]'">
              {{ getNotifIcon(notif.type) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-semibold text-white truncate">{{ notif.title }}</p>
                <span class="text-[10px] font-mono text-white/30 flex-shrink-0">{{ timeAgo(notif.timestamp) }}</span>
              </div>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-1 leading-relaxed line-clamp-2">{{ notif.body }}</p>
            </div>
            <div *ngIf="!notif.read" class="w-2.5 h-2.5 rounded-full bg-[#C62761] flex-shrink-0 mt-1.5"></div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class StagiaireOverviewComponent implements OnInit, OnDestroy {
  user: User | null = null;
  activeTab: string = 'catalogue';

  tabs = [
    { key: 'catalogue',      icon: '🔎', label: 'Catalogue' },
    { key: 'mes-formations', icon: '📚', label: 'Mes Formations' },
    { key: 'paiements',      icon: '💳', label: 'Paiements' },
    { key: 'certificats',    icon: '🏆', label: 'Certificats' },
    { key: 'presence',       icon: '📋', label: 'Présence & Éval.' },
    { key: 'notifications',  icon: '🔔', label: 'Notifications' },
  ];

  // Catalogue
  allFormations: Formation[] = [];
  filteredCatalogue: Formation[] = [];
  catalogSearch = '';
  catalogCategory = '';
  categories: string[] = [];
  loadingCatalogue = true;

  // My formations
  myFormations: Formation[] = [];
  enrolledIds: Set<string> = new Set();
  loadingMine = true;

  // Upcoming sessions
  upcomingSeances: Seance[] = [];

  // Payments
  paiements: Paiement[] = [];
  retardCount = 0;
  urgentPayments: Paiement[] = [];

  // Certificates
  certificats: Certificat[] = [];
  selectedCertForVerif: Certificat | null = null;

  // Notifications
  allNotifications: Notification[] = [];
  unreadCount = 0;

  // Stats
  attendanceRate = 0;

  // Enrollment state
  enrollingId: string | null = null;
  enrollSuccessId: string | null = null;
  enrollErrorId: string | null = null;
  enrollError = '';

  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  private sub = new Subscription();

  get activeFormationsCount(): number { return this.myFormations.length; }

  get paidPaymentsCount(): number {
    return this.paiements ? this.paiements.filter(p => p.status === 'PAYE').length : 0;
  }

  get pendingPaymentsCount(): number {
    return this.paiements ? this.paiements.filter(p => p.status === 'EN_ATTENTE').length : 0;
  }

  get paymentProgressPercentage(): string {
    if (!this.paiements || this.paiements.length === 0) return '0%';
    const paid = this.paidPaymentsCount;
    return `${Math.round((paid / this.paiements.length) * 100)}%`;
  }

  constructor(
    private authService: AuthService,
    private formationService: FormationService,
    private paiementService: PaiementService,
    private certificatService: CertificatService,
    private notificationService: NotificationService,
    private enrollmentService: EnrollmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) return;

    this.sub.add(
      this.router.events.subscribe(() => {
        this.syncTabWithUrl();
      })
    );
    this.syncTabWithUrl();

    // Load catalogue (all formations)
    this.sub.add(
      this.formationService.getFormations().subscribe({
        next: data => {
          this.allFormations = data;
          this.categories = [...new Set(data.map(f => f.category || 'Général').filter(Boolean))];
          this.filterCatalogue();
          this.loadingCatalogue = false;
        },
        error: () => { this.loadingCatalogue = false; }
      })
    );

    // Load my formations
    this.sub.add(
      this.formationService.getFormationsByStagiaire(this.user.id).subscribe({
        next: data => {
          this.myFormations = data;
          this.enrolledIds = new Set(data.map(f => f.id));
          // Calculate attendance rate
          let totalSessions = 0, presentSessions = 0;
          data.forEach(f => {
            f.phases?.forEach(p => {
              p.seances?.forEach(s => {
                s.presences?.forEach(pr => {
                  if (pr.stagiaireId === this.user?.id) {
                    totalSessions++;
                    if (pr.present) presentSessions++;
                  }
                });
              });
            });
          });
          if (totalSessions > 0) {
            this.attendanceRate = Math.round((presentSessions / totalSessions) * 100);
          } else {
            // fallback: average of phase progression
            const allPhases = data.flatMap(f => f.phases || []);
            if (allPhases.length > 0) {
              this.attendanceRate = Math.round(allPhases.reduce((s, p) => s + (p.progression || 0), 0) / allPhases.length);
            }
          }
          this.loadingMine = false;
        },
        error: () => { this.loadingMine = false; }
      })
    );

    // Load upcoming sessions
    this.sub.add(
      this.formationService.getUpcomingSeances().subscribe({
        next: data => { this.upcomingSeances = data; },
        error: () => {}
      })
    );

    // Load payments
    this.sub.add(
      this.paiementService.getPaiementsByStagiaire(this.user.id).subscribe({
        next: data => {
          this.paiements = data.sort((a, b) => new Date(b.dateEcheance).getTime() - new Date(a.dateEcheance).getTime());
          this.retardCount = data.filter(p => p.status === 'EN_RETARD').length;
          // Payments due in 10 days or less & not paid
          const now = new Date();
          this.urgentPayments = data.filter(p => {
            if (p.status === 'PAYE') return false;
            const days = this.getDaysUntilDue(p.dateEcheance);
            return days >= 0 && days <= 10;
          });
        },
        error: () => {}
      })
    );

    // Load certificates
    this.sub.add(
      this.certificatService.getCertificatsByStagiaire(this.user.id).subscribe({
        next: data => { this.certificats = data; },
        error: () => {}
      })
    );

    // Load notifications
    this.sub.add(
      this.notificationService.notifications$.subscribe(data => {
        this.allNotifications = data;
        this.unreadCount = data.filter(n => !n.read).length;
      })
    );

    this.notificationService.refreshNotifications();
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  // ── Catalogue ──────────────────────────────────────────────────────────────
  filterCatalogue(): void {
    const q = this.catalogSearch.toLowerCase();
    const cat = this.catalogCategory;
    this.filteredCatalogue = this.allFormations.filter(f => {
      const matchQ = !q || f.nom.toLowerCase().includes(q) || (f.description || '').toLowerCase().includes(q) || (f.formateurNom || '').toLowerCase().includes(q);
      const matchCat = !cat || (f.category || 'Général') === cat;
      return matchQ && matchCat;
    });
  }

  isEnrolled(formationId: string): boolean { return this.enrolledIds.has(formationId); }

  enrollFormation(f: Formation): void {
    if (!this.user) return;
    this.enrollingId = f.id;
    this.enrollSuccessId = null;
    this.enrollErrorId = null;
    this.enrollmentService.enrollStudent(parseInt(this.user.id), parseInt(f.id)).subscribe({
      next: () => {
        this.enrollingId = null;
        this.enrollSuccessId = f.id;
        this.enrolledIds.add(f.id);
        this.myFormations = [...this.myFormations, f];
        setTimeout(() => { this.enrollSuccessId = null; }, 3000);
      },
      error: (e: any) => {
        this.enrollingId = null;
        this.enrollErrorId = f.id;
        this.enrollError = e?.error?.message || 'Déjà inscrit ou erreur';
        setTimeout(() => { this.enrollErrorId = null; }, 4000);
      }
    });
  }

  // ── Formation utils ────────────────────────────────────────────────────────
  getFormationProgress(f: Formation): number {
    const phases = f.phases || [];
    if (phases.length === 0) return 0;
    return Math.round(phases.reduce((s, p) => s + (p.progression || 0), 0) / phases.length);
  }

  getUpcomingForFormation(f: Formation): Seance[] {
    const now = new Date();
    return this.upcomingSeances.filter(s => s.formationNom === f.nom || f.phases.some(p => p.seances?.some(ps => ps.id === s.id))).filter(s => new Date(s.date) >= now).slice(0, 3);
  }

  // ── Payments ───────────────────────────────────────────────────────────────
  getDaysUntilDue(date: Date): number {
    const diff = new Date(date).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getTotalPaid(): number { return this.paiements.filter(p => p.status === 'PAYE').reduce((s, p) => s + p.montant, 0); }
  getTotalPending(): number { return this.paiements.filter(p => p.status === 'EN_ATTENTE').reduce((s, p) => s + p.montant, 0); }
  getTotalLate(): number { return this.paiements.filter(p => p.status === 'EN_RETARD').reduce((s, p) => s + p.montant, 0); }

  scrollToSection(id: string): void { setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100); }

  // ── Certificates ───────────────────────────────────────────────────────────
  openCertificateVerif(cert: Certificat): void { this.selectedCertForVerif = cert; }

  // ── Presence ───────────────────────────────────────────────────────────────
  getMyPresence(seance: Seance): any {
    if (!seance.presences || !this.user) return null;
    return seance.presences.find(p => p.stagiaireId === this.user!.id) || null;
  }

  // ── Notifications ──────────────────────────────────────────────────────────
  markAllRead(): void { this.notificationService.markAllAsRead(); }
  markNotifRead(id: string): void { this.notificationService.markAsRead(id); }

  // ── Formatters ─────────────────────────────────────────────────────────────
  formatDay(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
  }

  formatDayNum(date: Date): string {
    return new Date(date).getDate().toString().padStart(2, '0');
  }

  getNotifIcon(type: string): string {
    const icons: Record<string, string> = {
      PAIEMENT_CONFIRME: '✅', PAIEMENT_RETARD: '⚠️', PHASE_DEBLOQUEE: '🚀',
      CERTIFICAT_GENERE: '🎓', SEANCE_PLANIFIEE: '📅', EVALUATION_PUBLIEE: '⭐', ANNONCE: '📢'
    };
    return icons[type] || '🔔';
  }

  timeAgo(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `il y a ${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours}h`;
    return `il y a ${Math.floor(hours / 24)}j`;
  }

  syncTabWithUrl(): void {
    const url = this.router.url;
    if (url.includes('/formations')) {
      this.activeTab = 'mes-formations';
    } else if (url.includes('/paiements')) {
      this.activeTab = 'paiements';
    } else if (url.includes('/certificats')) {
      this.activeTab = 'certificats';
    } else if (url.includes('/presence')) {
      this.activeTab = 'presence';
    } else if (url.includes('/notifications')) {
      this.activeTab = 'notifications';
    } else {
      this.activeTab = 'catalogue';
    }
  }

  setActiveTab(key: string): void {
    this.activeTab = key;
    let path = '/dashboard/stagiaire';
    if (key === 'mes-formations') path += '/formations';
    else if (key === 'paiements') path += '/paiements';
    else if (key === 'certificats') path += '/certificats';
    else if (key === 'presence') path += '/presence';
    else if (key === 'notifications') path += '/notifications';
    
    this.router.navigateByUrl(path);
  }

  goToFormationDetail(formation: Formation): void {
    this.router.navigate([`/dashboard/stagiaire/formations/${formation.id}`]);
  }
}
