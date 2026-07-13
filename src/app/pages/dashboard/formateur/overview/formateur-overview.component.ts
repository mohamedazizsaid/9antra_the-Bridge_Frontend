import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { FormationService } from '../../../../core/services/formation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { User } from '../../../../core/models/user.model';
import { Formation, Seance, Presence } from '../../../../core/models/formation.model';
import { Notification } from '../../../../core/models/notification.model';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-formateur-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, StatCardComponent],
  template: `
    <div class="space-y-8 text-white font-inter">
      
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-extrabold font-syne tracking-wide">Bonjour, {{ user?.prenom }} 👨‍🏫</h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">Espace formateur. Suivez l'avancement de vos classes et notez les présences.</p>
        </div>
        <div class="flex gap-3">
          <button (click)="openQuickAttendance()" class="px-4 py-2 bg-gradient-to-r from-[#C62761] to-[#F5A623] hover:shadow-[0_0_15px_rgba(198,39,97,0.3)] rounded-xl text-xs font-bold transition-all">
            📝 Appel Rapide
          </button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card label="Classes Actives" value="{{ formations.length }}" trend="3 cours différents" [trendPositive]="true" trendLabel="assignées">
          <span icon class="text-xl">🏫</span>
        </app-stat-card>
        
        <app-stat-card label="Total Apprenants" value="63" trend="+12 ce mois" [trendPositive]="true" trendLabel="inscrits">
          <span icon class="text-xl">👥</span>
        </app-stat-card>
        
        <app-stat-card label="Présence Globale" value="88%" trend="+2% vs sem. dernière" [trendPositive]="true" trendLabel="moyenne">
          <span icon class="text-xl">📊</span>
        </app-stat-card>
        
        <app-stat-card label="Évaluations en attente" value="14" trend="À corriger pour le 25 Juin" [trendPositive]="false" trendLabel="date limite">
          <span icon class="text-xl">📝</span>
        </app-stat-card>
      </div>

      <!-- Main Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left: Today's Sessions & Formations Accordion (Col Span 2) -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Today's Sessions / Attendance Card -->
          <div class="glass-card p-6 border border-[var(--bridge-border)]">
            <h3 class="font-syne font-bold text-lg mb-4 flex items-center justify-between">
              <span>📅 Cours programmés aujourd'hui</span>
              <span class="text-xs text-[var(--bridge-text-muted)]">Cliquez sur une séance pour faire l'appel</span>
            </h3>

            <div class="space-y-4">
              <div *ngIf="todaySeances.length === 0" class="p-8 text-center text-[var(--bridge-text-muted)] text-sm">
                Aucune séance planifiée pour aujourd'hui.
              </div>

              <div *ngFor="let seance of todaySeances" 
                   (click)="openAttendanceModal(seance)"
                   class="p-4 bg-white/[0.02] border border-white/5 hover:border-[var(--bridge-crimson)] rounded-xl cursor-pointer transition-all flex justify-between items-center group">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span [ngClass]="seance.type === 'PRESENTIEL' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'" class="text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                      {{ seance.type }}
                    </span>
                    <span class="text-[10px] text-[var(--bridge-text-muted)] font-semibold">{{ seance.heureDebut }} - {{ seance.heureFin }}</span>
                  </div>
                  <h4 class="font-bold text-sm text-white group-hover:text-[var(--bridge-gold)] transition-colors">{{ seance.formationNom }}</h4>
                  <p class="text-xs text-[var(--bridge-text-muted)]">Salle: {{ seance.salle }} | Statut appel: 
                    <span [ngClass]="seance.presences ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-medium'">
                      {{ seance.presences ? '✓ Fait (' + getPresentCount(seance) + ' présents)' : '⚠️ En attente' }}
                    </span>
                  </p>
                </div>
                <div class="p-2 bg-white/5 group-hover:bg-[var(--bridge-crimson)] rounded-lg transition-colors">
                  <span class="text-xs font-bold text-white">&rarr;</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Formations Accordion / List -->
          <div class="glass-card p-6 border border-[var(--bridge-border)]">
            <h3 class="font-syne font-bold text-lg mb-6">🏫 Mes Programmes de Formation</h3>
            
            <div class="space-y-4">
              <div *ngFor="let formation of formations" class="border border-[var(--bridge-border)] rounded-xl overflow-hidden bg-white/[0.01]">
                <div class="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] border-b border-[var(--bridge-border)]">
                  <div>
                    <h4 class="font-bold text-sm text-white">{{ formation.nom }}</h4>
                    <p class="text-xs text-[var(--bridge-text-muted)]">Du {{ formation.dateDebut | date:'dd MMM yyyy' }} au {{ formation.dateFin | date:'dd MMM yyyy' }}</p>
                  </div>
                  <span class="text-xs px-2.5 py-1 rounded-lg bg-[var(--bridge-crimson)]/20 text-[var(--bridge-crimson)] border border-[var(--bridge-crimson)]/30 font-semibold">
                    {{ formation.stagiaires.length }} apprenants
                  </span>
                </div>
                
                <div class="p-4 space-y-4">
                  <h5 class="text-xs font-bold uppercase tracking-wider text-[var(--bridge-text-muted)]">Phases de progression</h5>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div *ngFor="let phase of formation.phases" class="p-3 bg-black/25 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <p class="font-semibold text-white truncate max-w-[150px]">{{ phase.nom }}</p>
                        <span [ngClass]="{
                          'text-emerald-400': phase.status === 'COMPLETEE',
                          'text-[var(--bridge-gold)]': phase.status === 'EN_COURS',
                          'text-white/20': phase.status === 'VERROUILLEE'
                        }" class="text-[10px] font-bold">
                          {{ phase.status }}
                        </span>
                      </div>
                      <span class="font-mono font-bold text-[var(--bridge-gold)]">{{ phase.progression }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: Evaluations & Activity Feed -->
        <div class="space-y-8">
          
          <!-- Quick evaluations Card -->
          <div class="glass-card p-6 border border-[var(--bridge-border)]">
            <h3 class="font-syne font-bold text-lg mb-4 flex items-center gap-2">
              <span>📝</span> Évaluations Récentes
            </h3>
            
            <div class="space-y-3">
              <div *ngFor="let item of mockEvaluations" class="p-3 rounded-lg bg-white/[0.01] border border-white/5 text-xs flex justify-between items-center">
                <div>
                  <p class="font-semibold text-white">{{ item.name }}</p>
                  <p class="text-[10px] text-[var(--bridge-text-muted)]">{{ item.task }} | {{ item.date }}</p>
                </div>
                <div class="text-right">
                  <span *ngIf="item.score" class="font-bold text-emerald-400 text-sm">{{ item.score }} / 20</span>
                  <span *ngIf="!item.score" class="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold">À Corriger</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Chart Simulator (SVG bar chart) -->
          <div class="glass-card p-6 border border-[var(--bridge-border)]">
            <h3 class="font-syne font-bold text-lg mb-6 flex items-center justify-between">
              <span>📊 Assiduité par classe</span>
              <span class="text-[10px] text-emerald-400 font-semibold">Taux moyen: 88%</span>
            </h3>
            
            <div class="space-y-4">
              <!-- SVG Bar Chart -->
              <div class="flex items-end justify-between h-32 px-4 border-b border-[var(--bridge-border)] pb-2">
                <div class="flex flex-col items-center gap-2">
                  <div class="w-8 bg-gradient-to-t from-[#C62761] to-[#F5A623] rounded-t-md transition-all duration-500" style="height: 95px"></div>
                  <span class="text-[9px] text-[var(--bridge-text-muted)] font-mono">Web FS</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <div class="w-8 bg-gradient-to-t from-[#C62761] to-[#F5A623] rounded-t-md transition-all duration-500" style="height: 85px"></div>
                  <span class="text-[9px] text-[var(--bridge-text-muted)] font-mono">UI/UX</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <div class="w-8 bg-gradient-to-t from-[#C62761] to-[#F5A623] rounded-t-md transition-all duration-500" style="height: 70px"></div>
                  <span class="text-[9px] text-[var(--bridge-text-muted)] font-mono">Data/IA</span>
                </div>
              </div>
              <div class="flex justify-between text-[10px] text-[var(--bridge-text-sub)]">
                <span>Min: 70% (Data)</span>
                <span>Max: 95% (Web FS)</span>
              </div>
            </div>
          </div>

          <!-- Activity Feed -->
          <div class="glass-card p-6 border border-[var(--bridge-border)]">
            <h3 class="font-syne font-bold text-lg mb-4">🔔 Activité Récente</h3>
            <div class="space-y-4">
              <div class="flex gap-3 text-xs">
                <span class="text-sm">💬</span>
                <div>
                  <p class="font-semibold text-white">Yasmine Trabelsi a posé une question</p>
                  <p class="text-[10px] text-[var(--bridge-text-muted)]">"Monsieur, quand est le test final ?" | il y a 30m</p>
                </div>
              </div>
              <div class="flex gap-3 text-xs">
                <span class="text-sm">💰</span>
                <div>
                  <p class="font-semibold text-white">Paiement enregistré</p>
                  <p class="text-[10px] text-[var(--bridge-text-muted)]">Ahmed Mansouri a réglé la Phase 2 | il y a 2h</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- Attendance Modal Component (Inline) -->
      <div *ngIf="showAttendanceModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div (click)="closeAttendanceModal()" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        
        <!-- Modal Content -->
        <div class="relative glass-card w-full max-w-lg p-6 border border-[var(--bridge-border)] shadow-2xl flex flex-col max-h-[90vh]">
          <div class="flex justify-between items-center border-b border-[var(--bridge-border)] pb-4 mb-4">
            <div>
              <h3 class="font-syne font-bold text-lg text-white">🗂️ Feuille d'appel</h3>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">{{ selectedSeance?.formationNom }} | {{ selectedSeance?.heureDebut }}</p>
            </div>
            <button (click)="closeAttendanceModal()" class="text-white/60 hover:text-white text-lg">&times;</button>
          </div>

          <!-- Checklist -->
          <div class="flex-1 overflow-y-auto space-y-2 mb-6 pr-2">
            <div *ngFor="let pres of activePresences" class="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]">
              <span class="text-xs font-semibold text-white">{{ pres.stagiaireNom }}</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="pres.present" class="sr-only peer">
                <div class="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                <span class="ml-2 text-xs font-semibold" [ngClass]="pres.present ? 'text-emerald-400' : 'text-rose-400'">
                  {{ pres.present ? 'Présent' : 'Absent' }}
                </span>
              </label>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex gap-4 pt-4 border-t border-[var(--bridge-border)]">
            <button (click)="closeAttendanceModal()" class="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10 text-sm">
              Annuler
            </button>
            <button (click)="saveAttendance()" class="flex-[2] py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] hover:shadow-[0_0_15px_rgba(198,39,97,0.3)] text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
              <span>Enregistrer</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class FormateurOverviewComponent implements OnInit, OnDestroy {
  user: User | null = null;
  formations: Formation[] = [];
  todaySeances: Seance[] = [];
  private sub = new Subscription();

  // Attendance Modal state
  showAttendanceModal = false;
  selectedSeance: Seance | null = null;
  activePresences: Presence[] = [];

  evaluations: any[] = [];
  mockEvaluations = [
    { name: 'Hamza Bouazizi', task: 'Rapport HTML/CSS', date: '21 Juin', score: 18 },
    { name: 'Yasmine Trabelsi', task: 'Quiz Javascript', date: '20 Juin', score: 16 },
    { name: 'Sana Mejri', task: 'TP Smart Contracts', date: '19 Juin', score: null },
    { name: 'Amine Saidi', task: 'TP Smart Contracts', date: '19 Juin', score: null },
  ];

  constructor(
    private authService: AuthService,
    private formationService: FormationService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user || this.user.role !== 'FORMATEUR') {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Load formations
    this.sub.add(
      this.formationService.getFormationsByFormateur(this.user.id).subscribe(data => {
        this.formations = data;
      })
    );

    // Load today's sessions
    this.sub.add(
      this.formationService.getTodaySeances().subscribe(data => {
        this.todaySeances = data;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getPresentCount(seance: Seance): number {
    return seance.presences ? seance.presences.filter(p => p.present).length : 0;
  }

  openAttendanceModal(seance: Seance): void {
    this.selectedSeance = seance;
    if (seance.presences) {
      this.activePresences = JSON.parse(JSON.stringify(seance.presences));
    } else {
      // If call not made yet, generate default mock student list for this session
      const count = seance.formationNom.includes('UI/UX') ? 15 : 23;
      this.activePresences = this.generateDefaultPresences(count);
    }
    this.showAttendanceModal = true;
  }

  closeAttendanceModal(): void {
    this.showAttendanceModal = false;
    this.selectedSeance = null;
    this.activePresences = [];
  }

  saveAttendance(): void {
    if (this.selectedSeance) {
      this.formationService.savePresence(this.selectedSeance.id, this.activePresences).subscribe(() => {
        this.selectedSeance!.presences = this.activePresences;
        this.closeAttendanceModal();
      });
    }
  }

  openQuickAttendance(): void {
    if (this.todaySeances.length > 0) {
      this.openAttendanceModal(this.todaySeances[0]);
    }
  }

  private generateDefaultPresences(count: number): Presence[] {
    const prenoms = ['Hamza', 'Sana', 'Amine', 'Yasmine', 'Mehdi', 'Fatma', 'Omar', 'Leila', 'Karim', 'Nour',
      'Rami', 'Ines', 'Walid', 'Amira', 'Aziz', 'Hana', 'Bilel', 'Rim', 'Taha', 'Dorra',
      'Fares', 'Mariem', 'Yassine'];
    const noms = ['Bouazizi', 'Mejri', 'Saidi', 'Chaker', 'Hamdi', 'Brahem', 'Jlassi', 'Riahi', 'Dridi', 'Maalej',
      'Ksibi', 'Ayari', 'Guesmi', 'Chahed', 'Nasri', 'Dali', 'Turki', 'Sahli', 'Ferchichi', 'Haddad',
      'Bouzid', 'Mnasri', 'Triki'];
    return Array.from({ length: count }, (_, i) => ({
      stagiaireId: (i + 3).toString(),
      stagiaireNom: `${prenoms[i % prenoms.length]} ${noms[i % noms.length]}`,
      present: true
    }));
  }
}
