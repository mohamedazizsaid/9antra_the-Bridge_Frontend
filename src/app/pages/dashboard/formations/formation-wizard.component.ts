import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FormationService } from '../../../core/services/formation.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

interface WizardPhase {
  title: string;
  content: string;
  price: number;
  minimumAttendance: number;
  minimumGrade: number;
  sessions: WizardSession[];
}

interface WizardSession {
  sessionDate: string;
  startTime: string;
  duration: number;
  location: string;
  meetingLink: string;
}

@Component({
  selector: 'app-formation-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8">
      
      <!-- Top Title -->
      <div class="flex items-center justify-between border-b border-[var(--bridge-border)] pb-6">
        <div>
          <h1 class="font-syne font-bold text-2xl md:text-3xl text-white">
            Wizard de <span class="bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text text-transparent">Création</span>
          </h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">Configurez pas à pas votre formation, ses phases et ses séances.</p>
        </div>
        <button routerLink="/dashboard/formations" class="text-xs text-[var(--bridge-text-muted)] hover:text-white transition-colors">
          ✕ Annuler
        </button>
      </div>

      <!-- Stepper Header -->
      <div class="grid grid-cols-4 gap-2 text-center text-xs">
        <div *ngFor="let s of [1, 2, 3, 4]; let i = index"
             class="py-3 rounded-lg font-bold border transition-all duration-300"
             [class]="step === s ? 'bg-[rgba(198,39,97,0.15)] border-[#C62761] text-white' : 'bg-white/5 border-white/5 text-white/40'">
          Étape {{ s }}
          <span class="block text-[10px] font-normal uppercase tracking-wider mt-1 text-[var(--bridge-text-muted)]">
            {{ getStepLabel(s) }}
          </span>
        </div>
      </div>

      <!-- Main Step View -->
      <div class="glass-card border border-[var(--bridge-border)] p-8">
        
        <!-- STEP 1: General Info -->
        <div *ngIf="step === 1" class="space-y-6 animate-fadeIn">
          <h2 class="font-syne font-bold text-xl text-white">📝 Informations générales</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-2 font-semibold">Titre du programme</label>
              <input [(ngModel)]="formation.title" type="text"
                     class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761]"
                     placeholder="Ex: BootCamp FullStack Angular / Spring" />
            </div>
            <div>
              <label class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-2 font-semibold">Catégorie</label>
              <input [(ngModel)]="formation.category" type="text"
                     class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761]"
                     placeholder="Ex: Web Development" />
            </div>
            <div class="md:col-span-2">
              <label class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-2 font-semibold">Description</label>
              <textarea [(ngModel)]="formation.description" rows="4"
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] resize-none"
                        placeholder="Décrivez les compétences visées..."></textarea>
            </div>
            <div>
              <label class="text-xs text-[var(--bridge-text-muted)] uppercase tracking-wider block mb-2 font-semibold">Prix total (TND)</label>
              <input [(ngModel)]="formation.totalPrice" type="number"
                     class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761]"
                     placeholder="Ex: 1200" />
            </div>
          </div>
        </div>

        <!-- STEP 2: Phases Configuration -->
        <div *ngIf="step === 2" class="space-y-6 animate-fadeIn">
          <div class="flex justify-between items-center">
            <h2 class="font-syne font-bold text-xl text-white">🚀 Phases d'apprentissage</h2>
            <button (click)="addPhase()"
                    class="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all">
              ＋ Ajouter une phase
            </button>
          </div>

          <div class="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            <div *ngFor="let phase of formation.phases; let pi = index"
                 class="p-5 border border-white/5 rounded-2xl bg-white/[0.01] space-y-4 relative">
              <button (click)="removePhase(pi)"
                      class="absolute top-4 right-4 text-xs text-red-400 hover:text-red-300 transition-colors">
                Supprimer
              </button>
              
              <h4 class="font-mono text-xs font-bold text-[#F5A623]">PHASE {{ pi + 1 }}</h4>
              
              <div class="grid md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <input [(ngModel)]="phase.title" type="text"
                         class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C62761]"
                         placeholder="Titre de la phase (Ex: Fondamentaux d'Angular)" />
                </div>
                <div class="md:col-span-2">
                  <input [(ngModel)]="phase.content" type="text"
                         class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#C62761]"
                         placeholder="Contenu / Curriculum de la phase" />
                </div>
                <div>
                  <label class="text-[10px] text-white/50 block mb-1">Prix de la phase (TND)</label>
                  <input [(ngModel)]="phase.price" type="number"
                         class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="text-[10px] text-white/50 block mb-1">Note min (/20)</label>
                    <input [(ngModel)]="phase.minimumGrade" type="number" step="0.5"
                           class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                  </div>
                  <div>
                    <label class="text-[10px] text-white/50 block mb-1">Présence min (%)</label>
                    <input [(ngModel)]="phase.minimumAttendance" type="number"
                           class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 3: Sessions Config -->
        <div *ngIf="step === 3" class="space-y-6 animate-fadeIn">
          <h2 class="font-syne font-bold text-xl text-white">📅 Calendrier des Séances</h2>
          
          <div class="space-y-6 max-h-[55vh] overflow-y-auto pr-2">
            <div *ngFor="let phase of formation.phases; let pi = index" class="space-y-3">
              <div class="flex justify-between items-center bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
                <span class="text-xs font-bold text-white">Phase {{ pi + 1 }} : {{ phase.title || 'Sans titre' }}</span>
                <button (click)="addSession(pi)" class="text-[10px] bg-[#C62761]/10 hover:bg-[#C62761]/20 text-[#C62761] border border-[#C62761]/20 px-2.5 py-1 rounded-lg transition-all font-semibold">
                  ＋ Session
                </button>
              </div>

              <div *ngFor="let session of phase.sessions; let si = index"
                   class="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.01] items-end relative group">
                
                <div>
                  <label class="text-[9px] text-white/50 block mb-1">Date</label>
                  <input [(ngModel)]="session.sessionDate" type="date"
                         class="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-[#C62761]" />
                </div>
                <div>
                  <label class="text-[9px] text-white/50 block mb-1">Heure début</label>
                  <input [(ngModel)]="session.startTime" type="time"
                         class="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-[#C62761]" />
                </div>
                <div>
                  <label class="text-[9px] text-white/50 block mb-1">Durée (h)</label>
                  <input [(ngModel)]="session.duration" type="number"
                         class="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-[#C62761]" />
                </div>
                <div>
                  <label class="text-[9px] text-white/50 block mb-1">Lieu / Salle</label>
                  <input [(ngModel)]="session.location" type="text"
                         class="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-[#C62761]"
                         placeholder="Ex: Salle 102" />
                </div>
                <div class="relative">
                  <label class="text-[9px] text-white/50 block mb-1">Lien en ligne (optionnel)</label>
                  <input [(ngModel)]="session.meetingLink" type="text"
                         class="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-[#C62761]"
                         placeholder="Ex: Zoom Link" />
                  <button (click)="removeSession(pi, si)"
                          class="absolute -top-6 -right-1 text-[10px] text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 4: Trainers Assignment -->
        <div *ngIf="step === 4" class="space-y-6 animate-fadeIn">
          <h2 class="font-syne font-bold text-xl text-white">👨‍🏫 Attribution des Formateurs</h2>
          <p class="text-xs text-[var(--bridge-text-muted)]">Sélectionnez les formateurs habilités à encadrer et noter ce programme.</p>
          
          <div class="grid md:grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto">
            <div *ngFor="let trainer of trainersList"
                 (click)="toggleTrainer(trainer.id)"
                 class="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all"
                 [class]="isTrainerSelected(trainer.id) ? 'border-[#F5A623] bg-[rgba(245,166,35,0.05)]' : 'border-white/5 bg-white/[0.01] hover:bg-white/5'">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center font-bold text-sm">
                  {{ trainer.prenom[0] }}{{ trainer.nom[0] }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-white">{{ trainer.prenom }} {{ trainer.nom }}</p>
                  <p class="text-xs text-[var(--bridge-text-muted)] font-mono">{{ trainer.email }}</p>
                </div>
              </div>
              <span class="text-xs">{{ isTrainerSelected(trainer.id) ? '✓ Sélectionné' : '' }}</span>
            </div>
          </div>
        </div>

        <!-- Buttons navigation -->
        <div class="flex justify-between items-center border-t border-white/5 pt-6 mt-8">
          <button (click)="prevStep()"
                  [disabled]="step === 1"
                  class="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all">
            ← Précédent
          </button>
          
          <button *ngIf="step < 4" (click)="nextStep()"
                  [disabled]="!isCurrentStepValid()"
                  class="px-5 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white rounded-xl text-sm font-bold disabled:opacity-40 transition-all">
            Suivant →
          </button>

          <button *ngIf="step === 4" (click)="submit()"
                  [disabled]="loading"
                  class="px-6 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(198,39,97,0.3)] hover:scale-105 transition-all">
            {{ loading ? 'Création...' : 'Créer la formation 🚀' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class FormationWizardComponent implements OnInit {
  step = 1;
  loading = false;
  trainersList: User[] = [];
  selectedTrainers: string[] = [];

  formation = {
    title: '',
    category: '',
    description: '',
    totalPrice: null as number | null,
    phases: [] as WizardPhase[]
  };

  constructor(
    private formationService: FormationService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.trainersList = users.filter(u => u.role === 'FORMATEUR');
    });
  }

  getStepLabel(s: number): string {
    switch (s) {
      case 1: return 'Informations';
      case 2: return 'Phases';
      case 3: return 'Séances';
      case 4: return 'Formateurs';
      default: return '';
    }
  }

  addPhase(): void {
    this.formation.phases.push({
      title: '',
      content: '',
      price: 0,
      minimumAttendance: 75,
      minimumGrade: 10,
      sessions: []
    });
  }

  removePhase(index: number): void {
    this.formation.phases.splice(index, 1);
  }

  addSession(phaseIndex: number): void {
    this.formation.phases[phaseIndex].sessions.push({
      sessionDate: '',
      startTime: '',
      duration: 2,
      location: 'Salle Virtuelle',
      meetingLink: ''
    });
  }

  removeSession(phaseIndex: number, sessionIndex: number): void {
    this.formation.phases[phaseIndex].sessions.splice(sessionIndex, 1);
  }

  toggleTrainer(id: string): void {
    const idx = this.selectedTrainers.indexOf(id);
    if (idx > -1) {
      this.selectedTrainers.splice(idx, 1);
    } else {
      this.selectedTrainers.push(id);
    }
  }

  isTrainerSelected(id: string): boolean {
    return this.selectedTrainers.includes(id);
  }

  isCurrentStepValid(): boolean {
    if (this.step === 1) {
      return !!this.formation.title && !!this.formation.category && !!this.formation.totalPrice;
    }
    if (this.step === 2) {
      return this.formation.phases.length > 0 && this.formation.phases.every(p => !!p.title && !!p.content);
    }
    if (this.step === 3) {
      // Sessions are optional but if present must have date and time
      return this.formation.phases.every(p => p.sessions.every(s => !!s.sessionDate && !!s.startTime));
    }
    return true;
  }

  nextStep(): void {
    if (this.isCurrentStepValid()) this.step++;
  }

  prevStep(): void {
    if (this.step > 1) this.step--;
  }

  submit(): void {
    this.loading = true;
    const trainersMapped = this.selectedTrainers.map(id => ({ id: parseInt(id) }));
    const phasesMapped = this.formation.phases.map((p, idx) => ({
      phaseOrder: idx + 1,
      title: p.title,
      content: p.content,
      price: p.price,
      minimumAttendance: p.minimumAttendance,
      minimumGrade: p.minimumGrade,
      sessions: p.sessions.map(s => ({
        sessionDate: s.sessionDate,
        startTime: s.startTime + ':00', // standard LocalTime
        duration: s.duration,
        location: s.location,
        meetingLink: s.meetingLink || null
      }))
    }));

    const payload = {
      title: this.formation.title,
      category: this.formation.category,
      description: this.formation.description,
      totalPrice: this.formation.totalPrice,
      trainers: trainersMapped,
      phases: phasesMapped
    };

    this.formationService.createFormation(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard/formations']);
      },
      error: (e) => {
        this.loading = false;
        alert(e?.error?.message || 'Erreur lors de la création');
      }
    });
  }
}
