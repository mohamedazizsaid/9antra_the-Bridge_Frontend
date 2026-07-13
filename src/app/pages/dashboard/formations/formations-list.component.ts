import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormationService } from '../../../core/services/formation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Formation } from '../../../core/models/formation.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-formations-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="font-syne font-bold text-2xl md:text-3xl text-white">
            🎓 Gestion des <span class="bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text text-transparent">Formations</span>
          </h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">
            Gérez le catalogue des programmes et configurez les phases/séances.
          </p>
        </div>
        <button *ngIf="canCreate"
                routerLink="/dashboard/formations/new"
                class="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02] shadow-[0_0_20px_rgba(198,39,97,0.3)]">
          ➕ Nouvelle Formation
        </button>
      </div>

      <!-- List -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="formations.length > 0">
        <div *ngFor="let f of formations" 
             class="glass-card border border-[var(--bridge-border)] p-6 flex flex-col justify-between group hover:border-[#C62761]/40 transition-all duration-300">
          <div>
            <div class="flex justify-between items-start mb-4">
              <span class="text-[10px] px-2.5 py-1 bg-white/5 rounded-full text-white/70 uppercase font-mono tracking-wider font-semibold">
                {{ f.category || 'Général' }}
              </span>
              <span class="text-xs font-mono font-bold text-[#F5A623]">{{ f.totalPrice }} TND</span>
            </div>
            
            <h3 class="font-syne font-bold text-lg text-white mb-2 group-hover:text-[#F5A623] transition-colors">
              {{ f.nom }}
            </h3>
            <p class="text-xs text-[var(--bridge-text-muted)] line-clamp-3 mb-6 leading-relaxed">
              {{ f.description }}
            </p>
          </div>

          <div class="border-t border-white/5 pt-4 space-y-3">
            <div class="flex justify-between text-xs text-[var(--bridge-text-muted)]">
              <span>Phases :</span>
              <span class="font-semibold text-white font-mono">{{ f.phases.length }}</span>
            </div>
            <div class="flex justify-between text-xs text-[var(--bridge-text-muted)]">
              <span>Formateur Principal :</span>
              <span class="font-semibold text-[#C62761]">{{ f.formateurNom || 'Non assigné' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="formations.length === 0" class="glass-card border border-[var(--bridge-border)] p-12 text-center">
        <div class="text-5xl mb-4">📚</div>
        <p class="font-syne font-bold text-lg text-white">Aucune formation disponible</p>
        <p class="text-[var(--bridge-text-muted)] text-sm mt-2 mb-6">Créez le tout premier programme d'enseignement en utilisant le wizard.</p>
        <button *ngIf="canCreate"
                routerLink="/dashboard/formations/new"
                class="px-5 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white rounded-xl text-sm font-bold transition-all hover:opacity-90">
          Créer un programme
        </button>
      </div>
    </div>
  `
})
export class FormationsListComponent implements OnInit {
  formations: Formation[] = [];
  user: User | null = null;

  get canCreate(): boolean {
    return this.user?.role === 'ADMIN' || this.user?.role === 'FORMATEUR';
  }

  constructor(
    private formationService: FormationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadFormations();
  }

  loadFormations(): void {
    if (this.user?.role === 'FORMATEUR') {
      this.formationService.getFormationsByFormateur(this.user.id).subscribe(data => this.formations = data);
    } else {
      this.formationService.getFormations().subscribe(data => this.formations = data);
    }
  }
}
