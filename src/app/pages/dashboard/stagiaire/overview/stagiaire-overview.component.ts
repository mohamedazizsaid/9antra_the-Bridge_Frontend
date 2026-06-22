import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { FormationService } from '../../../../core/services/formation.service';
import { PaiementService } from '../../../../core/services/paiement.service';
import { CertificatService } from '../../../../core/services/certificat.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { User } from '../../../../core/models/user.model';
import { Formation, Seance } from '../../../../core/models/formation.model';
import { Paiement } from '../../../../core/models/paiement.model';
import { Certificat } from '../../../../core/models/certificat.model';
import { Notification } from '../../../../core/models/notification.model';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { TimeagoPipe } from '../../../../shared/pipes/timeago.pipe';

@Component({
  selector: 'app-stagiaire-overview',
  standalone: true,
  imports: [CommonModule, StatCardComponent, TimeagoPipe],
  template: `
    <div class="space-y-8 text-white font-inter">
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-extrabold font-syne tracking-wide">Bonjour, {{ user?.prenom }} 👋</h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">Heureux de vous revoir. Voici un aperçu de vos activités de formation.</p>
        </div>
        <div class="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          Statut: Actif
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card label="Formations" value="{{ formations.length }}" trend="+1 ce semestre" [trendPositive]="true" trendLabel="inscrit">
          <span icon class="text-xl">📚</span>
        </app-stat-card>
        
        <app-stat-card label="Taux de Présence" value="95%" trend="Stable" [trendPositive]="true" trendLabel="moyenne globale">
          <span icon class="text-xl">📅</span>
        </app-stat-card>
        
        <app-stat-card label="Paiements" value="2 / 4 payés" trend="Prochain: 15 Juil" [trendPositive]="false" trendLabel="échéance">
          <span icon class="text-xl">💰</span>
        </app-stat-card>
        
        <app-stat-card label="Certificats Blockchain" value="{{ certificats.length }}" trend="+1 disponible" [trendPositive]="true" trendLabel="vérifiable">
          <span icon class="text-xl">🎓</span>
        </app-stat-card>
      </div>

      <!-- Main Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left: Formation Progression & Upcoming Classes (Col Span 2) -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Current Formation Progress Card -->
          <div *ngIf="activeFormation" class="glass-card p-6 border border-[var(--bridge-border)]">
            <h3 class="font-syne font-bold text-lg mb-6 flex items-center justify-between">
              <span>Formation active: {{ activeFormation.nom }}</span>
              <span class="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-[var(--bridge-gold)]">
                Active
              </span>
            </h3>

            <!-- Phases Layout -->
            <div class="space-y-6">
              <div *ngFor="let phase of activeFormation.phases; let last = last" class="relative">
                <!-- Line connector -->
                <div *ngIf="!last" class="absolute left-6 top-10 bottom-0 w-0.5 bg-[var(--bridge-border)] z-0"></div>
                
                <div class="flex items-start gap-4 relative z-10">
                  <!-- Step Bubble -->
                  <div [ngClass]="{
                    'bg-emerald-500 text-white': phase.status === 'COMPLETEE',
                    'bg-[var(--bridge-crimson)] text-white': phase.status === 'EN_COURS',
                    'bg-[#1F1F48] text-white/40 border border-white/5': phase.status === 'VERROUILLEE'
                  }" class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    <span *ngIf="phase.status === 'COMPLETEE'">✓</span>
                    <span *ngIf="phase.status !== 'COMPLETEE'">{{ phase.numero }}</span>
                  </div>

                  <!-- Details -->
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-baseline gap-2">
                      <h4 class="font-semibold text-sm md:text-base" [ngClass]="{'text-white/40': phase.status === 'VERROUILLEE'}">
                        {{ phase.nom }}
                      </h4>
                      <span class="text-xs font-mono font-bold" [ngClass]="{
                        'text-emerald-400': phase.status === 'COMPLETEE',
                        'text-[var(--bridge-gold)]': phase.status === 'EN_COURS',
                        'text-white/20': phase.status === 'VERROUILLEE'
                      }">
                        {{ phase.progression }}%
                      </span>
                    </div>
                    <p class="text-xs text-[var(--bridge-text-muted)] mt-1 truncate">{{ phase.description }}</p>
                    
                    <!-- Progress bar -->
                    <div *ngIf="phase.status !== 'VERROUILLEE'" class="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div [style.width.%]="phase.progression" 
                           [ngClass]="phase.status === 'COMPLETEE' ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#C62761] to-[#F5A623]'"
                           class="h-full rounded-full transition-all duration-500">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Upcoming Sessions list -->
          <div class="glass-card p-6 border border-[var(--bridge-border)]">
            <h3 class="font-syne font-bold text-lg mb-4 flex items-center gap-2">
              <span>📅</span> Prochaines séances
            </h3>
            
            <div class="divide-y divide-[var(--bridge-border)]">
              <div *ngIf="upcomingSeances.length === 0" class="p-6 text-center text-[var(--bridge-text-muted)] text-sm">
                Aucune séance planifiée.
              </div>
              
              <div *ngFor="let seance of upcomingSeances" class="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div class="space-y-1">
                  <span class="text-[10px] bg-[rgba(198,39,97,0.15)] text-[var(--bridge-crimson)] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                    {{ seance.type }}
                  </span>
                  <h4 class="font-bold text-sm text-white">{{ seance.formationNom }}</h4>
                  <p class="text-xs text-[var(--bridge-text-muted)]">
                    Instructeur: {{ seance.formateurNom }} | Salle: <span class="text-white font-semibold">{{ seance.salle }}</span>
                  </p>
                </div>
                
                <div class="text-right sm:text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                  <span class="text-xs font-semibold px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[var(--bridge-gold)]">
                    {{ seance.date | date:'dd MMM yyyy' }} à {{ seance.heureDebut }}
                  </span>
                  <!-- Countdown -->
                  <span class="text-[10px] text-white/60">
                    Durée: {{ seance.duree }}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: Notifications, payments & Certificates (Col Span 1) -->
        <div class="space-y-8">
          
          <!-- Recent Notifications Feed -->
          <div class="glass-card p-6 border border-[var(--bridge-border)]">
            <h3 class="font-syne font-bold text-lg mb-4 flex items-center justify-between">
              <span>🔔 Actu & Alertes</span>
              <button (click)="markAllNotificationsRead()" class="text-xs text-[var(--bridge-gold)] hover:underline">
                Tout marquer lu
              </button>
            </h3>
            
            <div class="space-y-4">
              <div *ngFor="let notif of recentNotifications" class="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs space-y-1 relative">
                <span *ngIf="!notif.read" class="absolute right-3 top-3 w-1.5 h-1.5 bg-[var(--bridge-crimson)] rounded-full"></span>
                <div class="flex justify-between items-center">
                  <span class="font-bold text-white">{{ notif.title }}</span>
                  <span class="text-[9px] text-[var(--bridge-text-sub)]">{{ notif.timestamp | timeago }}</span>
                </div>
                <p class="text-[var(--bridge-text-muted)] leading-relaxed">{{ notif.body }}</p>
              </div>
            </div>
          </div>

          <!-- Blockchain Certificates Card -->
          <div class="glass-card p-6 border border-[var(--bridge-border)]">
            <h3 class="font-syne font-bold text-lg mb-4 flex items-center gap-2">
              <span>🎓</span> Vos Diplômes Blockchain
            </h3>
            
            <div class="space-y-4">
              <div *ngIf="certificats.length === 0" class="text-center py-6 text-[var(--bridge-text-muted)] text-sm">
                Aucun certificat obtenu pour le moment.
              </div>
              
              <div *ngFor="let cert of certificats" class="p-4 bg-gradient-to-br from-[#10102A] to-[#171738] border border-[var(--bridge-border)] rounded-xl relative overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-tr from-[var(--bridge-crimson)]/5 to-[var(--bridge-gold)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h4 class="font-bold text-xs text-white truncate max-w-[150px]">{{ cert.phaseNom }}</h4>
                    <p class="text-[9px] text-[var(--bridge-text-muted)]">{{ cert.formationNom }}</p>
                  </div>
                  <span class="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                    ✓ Vérifié
                  </span>
                </div>
                
                <div class="bg-black/20 p-2 rounded-lg mt-3 flex flex-col gap-1">
                  <span class="text-[8px] text-[var(--bridge-text-sub)] uppercase font-semibold">Blockchain Transaction Hash</span>
                  <span class="text-[9px] font-mono text-[var(--bridge-gold)] break-all select-all">{{ cert.hashBlockchain }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Payments Status mini table -->
          <div class="glass-card p-6 border border-[var(--bridge-border)]">
            <h3 class="font-syne font-bold text-lg mb-4 flex items-center gap-2">
              <span>💰</span> Paiement Frais
            </h3>
            
            <div class="space-y-3">
              <div *ngFor="let pay of paiements" class="flex justify-between items-center p-3 rounded-lg bg-white/[0.01] border border-white/5 text-xs">
                <div>
                  <p class="font-semibold text-white">Phase {{ pay.phaseNumero }}</p>
                  <p class="text-[10px] text-[var(--bridge-text-muted)]">{{ pay.dateEcheance | date:'dd MMM yyyy' }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-white">{{ pay.montant }} {{ pay.devise }}</p>
                  <span [ngClass]="{
                    'bg-emerald-500/15 text-emerald-400': pay.status === 'PAYE',
                    'bg-amber-500/15 text-amber-400': pay.status === 'EN_ATTENTE',
                    'bg-rose-500/15 text-rose-400': pay.status === 'EN_RETARD'
                  }" class="text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                    {{ pay.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class StagiaireOverviewComponent implements OnInit, OnDestroy {
  user: User | null = null;
  formations: Formation[] = [];
  activeFormation: Formation | null = null;
  upcomingSeances: Seance[] = [];
  certificats: Certificat[] = [];
  paiements: Paiement[] = [];
  recentNotifications: Notification[] = [];
  private sub = new Subscription();

  constructor(
    private authService: AuthService,
    private formationService: FormationService,
    private paiementService: PaiementService,
    private certificatService: CertificatService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user || this.user.role !== 'STAGIAIRE') {
      this.router.navigate(['/login']);
      return;
    }

    // Load Stagiaire Data
    this.sub.add(
      this.formationService.getFormationsByStagiaire(this.user.id).subscribe(data => {
        this.formations = data;
        this.activeFormation = data.find(f => f.status === 'ACTIVE') || data[0] || null;
      })
    );

    this.sub.add(
      this.formationService.getUpcomingSeances().subscribe(data => {
        this.upcomingSeances = data.slice(0, 3);
      })
    );

    this.sub.add(
      this.certificatService.getCertificatsByStagiaire(this.user.id).subscribe(data => {
        this.certificats = data;
      })
    );

    this.sub.add(
      this.paiementService.getPaiementsByStagiaire(this.user.id).subscribe(data => {
        this.paiements = data;
      })
    );

    this.sub.add(
      this.notificationService.notifications$.subscribe(data => {
        this.recentNotifications = data.slice(0, 3);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  markAllNotificationsRead(): void {
    this.notificationService.markAllAsRead();
  }
}
