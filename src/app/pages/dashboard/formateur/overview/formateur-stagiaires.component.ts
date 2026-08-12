import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { FormationService } from '../../../../core/services/formation.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { Formation, Phase } from '../../../../core/models/formation.model';
import { Evaluation } from '../../../../core/services/evaluation.service';
import { Subscription } from 'rxjs';

interface StagiaireCard {
  user: User;
  formations: { nom: string; id: string }[];
  avgGrade: number | null;
  evaluationCount: number;
  progression: number;
}

@Component({
  selector: 'app-formateur-stagiaires',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fadein">

      <!-- Top Header & Action -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="font-syne font-bold text-2xl md:text-3xl text-white">
            👥 Mes <span class="bg-gradient-to-r from-[#C62761] to-[#F5A623] bg-clip-text text-transparent">Stagiaires</span>
          </h1>
          <p class="text-[var(--bridge-text-muted)] text-sm mt-1">
            {{ stagiaireCards.length }} stagiaire{{ stagiaireCards.length > 1 ? 's' : '' }} dans vos formations
          </p>
        </div>
        <button *ngIf="!showEvalForm" (click)="openEvalModal(null)"
                class="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl text-sm hover:opacity-90 hover:scale-105 transition-all shadow-[0_0_15px_rgba(198,39,97,0.3)]">
          ⭐ Évaluer un stagiaire
        </button>
      </div>

      <!-- Main Layout with Smooth Horizontal Translation -->
      <div class="relative overflow-hidden">
        <div class="flex w-[200%] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)"
             [style.transform]="showEvalForm ? 'translateX(-50%)' : 'translateX(0)'">

          <!-- ════════════════════════ PANEL 1: LISTE STAGIAIRES ════════════════════════ -->
          <div class="w-1/2 pr-0 sm:pr-2 space-y-6 flex-shrink-0">

            <!-- Stats Summary -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="glass-card p-5 border border-[var(--bridge-border)] group hover:border-[rgba(198,39,97,0.3)] transition-all hover:scale-[1.02]">
                <p class="text-xs text-white/40 uppercase tracking-wider">Total</p>
                <p class="text-3xl font-mono font-bold text-[#C62761] mt-2">{{ stagiaireCards.length }}</p>
                <p class="text-xs text-white/30 mt-1">stagiaires</p>
              </div>
              <div class="glass-card p-5 border border-[var(--bridge-border)] group hover:border-[rgba(245,166,35,0.3)] transition-all hover:scale-[1.02]">
                <p class="text-xs text-white/40 uppercase tracking-wider">Moyenne</p>
                <p class="text-3xl font-mono font-bold text-[#F5A623] mt-2">{{ getGlobalAvg() }}</p>
                <p class="text-xs text-white/30 mt-1">note /20</p>
              </div>
              <div class="glass-card p-5 border border-[var(--bridge-border)] group hover:border-emerald-500/30 transition-all hover:scale-[1.02]">
                <p class="text-xs text-white/40 uppercase tracking-wider">Certifiés</p>
                <p class="text-3xl font-mono font-bold text-emerald-400 mt-2">{{ getCertifiedCount() }}</p>
                <p class="text-xs text-white/30 mt-1">≥ 14/20</p>
              </div>
              <div class="glass-card p-5 border border-[var(--bridge-border)] group hover:border-purple-500/30 transition-all hover:scale-[1.02]">
                <p class="text-xs text-white/40 uppercase tracking-wider">Évaluations</p>
                <p class="text-3xl font-mono font-bold text-purple-400 mt-2">{{ evaluations.length }}</p>
                <p class="text-xs text-white/30 mt-1">saisies</p>
              </div>
            </div>

            <!-- Filters -->
            <div class="flex flex-col sm:flex-row gap-3">
              <div class="relative flex-1">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
                <input [(ngModel)]="searchQuery" type="text"
                       placeholder="Rechercher un stagiaire…"
                       class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors" />
              </div>
              <select [(ngModel)]="filterFormation"
                      class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors">
                <option value="" class="bg-[#10102A]">Toutes les formations</option>
                <option *ngFor="let f of formations" [value]="f.id" class="bg-[#10102A]">{{ f.nom }}</option>
              </select>
              <select [(ngModel)]="sortBy"
                      class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors">
                <option value="name" class="bg-[#10102A]">Nom (A→Z)</option>
                <option value="grade_desc" class="bg-[#10102A]">Meilleure note</option>
                <option value="grade_asc" class="bg-[#10102A]">Note la plus basse</option>
              </select>
            </div>

            <!-- Loading -->
            <div *ngIf="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
              <div class="w-12 h-12 rounded-full border-2 border-[#C62761]/30 border-t-[#C62761] animate-spin"></div>
              <p class="text-white/40 text-sm">Chargement des stagiaires…</p>
            </div>

            <!-- Cards Grid -->
            <div *ngIf="!loading" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div *ngFor="let card of paginatedCards; let i = index"
                   class="glass-card border border-[var(--bridge-border)] p-5 hover:border-[rgba(198,39,97,0.3)] transition-all hover:scale-[1.02] cursor-pointer group relative overflow-hidden"
                   [style.animation-delay]="(i * 50) + 'ms'"
                   style="animation: fadeSlideIn 0.4s ease both"
                   (click)="openStudentDetail(card)">

                <!-- Top Row -->
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-11 h-11 rounded-full bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                    <img *ngIf="card.user.avatar" [src]="card.user.avatar" class="w-full h-full object-cover" />
                    <span *ngIf="!card.user.avatar">{{ card.user.prenom[0] }}{{ card.user.nom[0] }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-white text-sm truncate group-hover:text-[#F5A623] transition-colors">
                      {{ card.user.prenom }} {{ card.user.nom }}
                    </p>
                    <p class="text-xs text-white/40 truncate">{{ card.user.email }}</p>
                  </div>
                </div>

                <!-- Formations Badges -->
                <div class="flex flex-wrap gap-1 mb-4">
                  <span *ngFor="let f of card.formations"
                        class="text-[9px] px-2 py-0.5 bg-white/5 rounded-full text-white/60 font-mono truncate max-w-[120px]">
                    {{ f.nom }}
                  </span>
                </div>

                <!-- Footer Stats -->
                <div class="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <p class="text-[10px] text-white/30 uppercase tracking-wider">Note moy.</p>
                    <p class="text-sm font-mono font-bold mt-0.5" [class]="getGradeClass(card.avgGrade)">
                      {{ card.avgGrade !== null ? card.avgGrade.toFixed(1) + '/20' : 'Non noté' }}
                    </p>
                  </div>
                  <div class="text-center">
                    <p class="text-[10px] text-white/30 uppercase tracking-wider">Évals</p>
                    <p class="text-lg font-mono font-bold text-purple-400 mt-0.5">{{ card.evaluationCount }}</p>
                  </div>
                  <button (click)="$event.stopPropagation(); openEvalModal(card)"
                          class="px-3 py-2 rounded-lg text-[10px] font-bold bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-105">
                    ⭐ Évaluer
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div *ngIf="filteredCards.length === 0" class="col-span-full glass-card border border-[var(--bridge-border)] p-16 text-center">
              <div class="text-5xl mb-4">👥</div>
              <p class="font-semibold text-white/50">Aucun stagiaire trouvé</p>
              <p class="text-white/30 text-sm mt-1">Essayez de modifier vos filtres.</p>
            </div>

            <!-- Pagination -->
            <div *ngIf="!loading && totalPages > 1" class="flex items-center justify-between">
              <p class="text-xs text-white/40 font-mono">
                {{ (currentPage-1)*pageSize+1 }}–{{ Math.min(currentPage*pageSize, filteredCards.length) }} sur {{ filteredCards.length }}
              </p>
              <div class="flex items-center gap-1">
                <button (click)="goToPage(currentPage-1)" [disabled]="currentPage===1"
                        class="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">‹</button>
                <button *ngFor="let p of pageNumbers" (click)="goToPage(p)"
                        class="w-9 h-9 rounded-lg text-sm font-mono transition-all"
                        [class]="p===currentPage ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold' : 'border border-white/10 text-white/50 hover:text-white'">{{ p }}</button>
                <button (click)="goToPage(currentPage+1)" [disabled]="currentPage===totalPages"
                        class="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">›</button>
              </div>
            </div>

            <!-- Détail Stagiaire (Sous la liste) -->
            <div *ngIf="selectedStudent && !showEvalForm" class="bridge-card overflow-hidden inline-view-card">
              <div class="h-1 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623]"></div>
              <!-- Header -->
              <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--bridge-border)]">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xl font-bold text-white overflow-hidden flex-shrink-0">
                    <img *ngIf="selectedStudent.user.avatar" [src]="selectedStudent.user.avatar" class="w-full h-full object-cover" />
                    <span *ngIf="!selectedStudent.user.avatar">{{ selectedStudent.user.prenom[0] }}{{ selectedStudent.user.nom[0] }}</span>
                  </div>
                  <div>
                    <h3 class="font-syne font-bold text-white text-sm">{{ selectedStudent.user.prenom }} {{ selectedStudent.user.nom }}</h3>
                    <p class="text-xs text-[var(--bridge-text-muted)]">{{ selectedStudent.user.email }}</p>
                  </div>
                </div>
                <button (click)="selectedStudent = null" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/5 text-sm">✕</button>
              </div>
              <!-- Content -->
              <div class="p-5 space-y-5">
                <!-- Stats -->
                <div class="grid grid-cols-3 gap-3">
                  <div class="text-center p-4 bg-white/[0.03] rounded-xl border border-white/5">
                    <p class="text-[10px] text-white/40 uppercase tracking-wider">Note moy.</p>
                    <p class="text-2xl font-mono font-bold mt-1" [class]="getGradeClass(selectedStudent.avgGrade)">
                      {{ selectedStudent.avgGrade !== null ? selectedStudent.avgGrade.toFixed(1) : '—' }}</p>
                    <p class="text-[10px] text-white/30">/20</p>
                  </div>
                  <div class="text-center p-4 bg-white/[0.03] rounded-xl border border-white/5">
                    <p class="text-[10px] text-white/40 uppercase tracking-wider">Évaluations</p>
                    <p class="text-2xl font-mono font-bold text-purple-400 mt-1">{{ selectedStudent.evaluationCount }}</p>
                  </div>
                  <div class="text-center p-4 bg-white/[0.03] rounded-xl border border-white/5">
                    <p class="text-[10px] text-white/40 uppercase tracking-wider">Progression</p>
                    <p class="text-2xl font-mono font-bold text-[#F5A623] mt-1">{{ selectedStudent.progression }}%</p>
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-4">
                  <!-- Formations -->
                  <div>
                    <p class="text-[10px] text-white/40 uppercase tracking-widest mb-3">Formations</p>
                    <div class="space-y-2">
                      <div *ngFor="let f of selectedStudent.formations"
                           class="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{{ f.nom[0] }}</div>
                        <span class="text-sm text-white/80">{{ f.nom }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Evaluations reçues -->
                  <div *ngIf="getStudentEvals(selectedStudent.user.id).length > 0">
                    <p class="text-[10px] text-white/40 uppercase tracking-widest mb-3">Évaluations reçues</p>
                    <div class="space-y-2">
                      <div *ngFor="let ev of getStudentEvals(selectedStudent.user.id)"
                           class="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                        <div>
                          <p class="text-sm text-white/80">{{ ev.phaseTitle }}</p>
                          <p class="text-[10px] text-white/40 mt-0.5">{{ ev.evaluationDate | date:'dd/MM/yyyy' }}</p>
                        </div>
                        <span class="font-mono font-bold text-sm px-3 py-1 rounded-xl" [class]="getGradeBadgeClass(ev.grade)">{{ ev.grade }}/20</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Actions -->
              <div class="px-5 py-4 border-t border-[var(--bridge-border)] flex gap-3">
                <button (click)="selectedStudent = null" class="py-2.5 px-5 bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-sm rounded-xl border border-white/5 transition-all">
                  Fermer
                </button>
                <button (click)="openEvalModal(selectedStudent)"
                        class="flex-1 py-2.5 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm">
                  ⭐ Évaluer ce stagiaire
                </button>
              </div>
            </div>

          </div>

          <!-- ════════════════════════ PANEL 2: FORMULAIRE D'ÉVALUATION ════════════════════════ -->
          <div class="w-1/2 pl-0 sm:pl-2 flex-shrink-0">
            <div class="glass-card border border-[var(--bridge-border)] overflow-hidden shadow-2xl">
              <div class="h-1.5 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623]"></div>
              
              <!-- Header Formulaire avec Bouton Retour -->
              <div class="flex items-center justify-between p-6 border-b border-[var(--bridge-border)] bg-white/[0.01]">
                <div class="flex items-center gap-4">
                  <button (click)="closeEvalModal()"
                          class="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all hover:scale-105">
                    ← Retour à la liste
                  </button>
                  <div class="h-6 w-px bg-white/10 hidden sm:block"></div>
                  <div>
                    <h3 class="font-syne font-bold text-lg text-white">⭐ Évaluer un Stagiaire</h3>
                    <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">Attribuez une note, des étoiles et commentez les compétences de vos apprenants.</p>
                  </div>
                </div>
              </div>

              <!-- Form Body -->
              <div class="p-8 space-y-6">
                <div class="grid md:grid-cols-2 gap-6">
                  
                  <!-- Formations & Stagiaires -->
                  <div class="space-y-5">
                    <div>
                      <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold">1. Sélectionner la Formation</label>
                      <select [(ngModel)]="evalForm.formationId" (change)="onEvalFormationChange()"
                              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors">
                        <option *ngFor="let f of formations" [value]="f.id" class="bg-[#10102A]">{{ f.nom }}</option>
                      </select>
                    </div>

                    <div>
                      <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold">2. Stagiaire à Évaluer</label>
                      <select [(ngModel)]="evalForm.studentId"
                              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors">
                        <option [ngValue]="null" class="bg-[#10102A]">Choisir un stagiaire…</option>
                        <option *ngFor="let s of availableStudents" [ngValue]="s.id" class="bg-[#10102A]">
                          {{ s.prenom }} {{ s.nom }} ({{ s.email }})
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold">3. Phase du Programme</label>
                      <select [(ngModel)]="evalForm.phaseId"
                              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C62761] transition-colors">
                        <option [ngValue]="null" class="bg-[#10102A]">Sélectionner la phase…</option>
                        <option *ngFor="let p of availablePhases" [ngValue]="p.id" class="bg-[#10102A]">Phase {{ p.numero }} — {{ p.nom }}</option>
                      </select>
                    </div>
                  </div>

                  <!-- Grading & Comments -->
                  <div class="space-y-5">
                    <div>
                      <div class="flex justify-between items-center mb-2">
                        <label class="text-xs text-white/50 uppercase tracking-wider font-semibold">Note attribuée (/20)</label>
                        <span class="text-2xl font-mono font-bold" [class]="getGradeClass(evalForm.grade)">{{ evalForm.grade }}/20</span>
                      </div>
                      <input [(ngModel)]="evalForm.grade" type="range" min="0" max="20" step="0.5" class="w-full accent-[#C62761]" />
                    </div>

                    <div>
                      <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold">Appréciation globale (Étoiles)</label>
                      <div class="flex items-center gap-2">
                        <button *ngFor="let star of [1,2,3,4,5]" (click)="evalForm.starRating = star"
                                class="text-3xl transition-transform hover:scale-125 focus:outline-none"
                                [class]="(evalForm.starRating||0) >= star ? 'text-[#F5A623]' : 'text-white/20'">★</button>
                      </div>
                    </div>

                    <div>
                      <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold">Compétences clés évaluées</label>
                      <input [(ngModel)]="evalForm.skills" type="text"
                             class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors"
                             placeholder="Ex: Angular, RxJS, Backend Spring Boot, Docker…" />
                    </div>
                  </div>

                </div>

                <div>
                  <label class="text-xs text-white/50 uppercase tracking-wider block mb-2 font-semibold">Remarques & Commentaires détaillés</label>
                  <textarea [(ngModel)]="evalForm.comment" rows="3"
                            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C62761] transition-colors resize-none"
                            placeholder="Points forts de l'apprenant, axes d'amélioration..."></textarea>
                </div>

                <!-- Notice Certificat -->
                <div *ngIf="evalForm.grade >= 14"
                     class="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span class="text-2xl">🏅</span>
                  <p class="text-emerald-400 text-xs font-semibold">
                    La note étant supérieure à 14/20, la validation de cette phase générera automatiquement le Certificat Blockchain du stagiaire.
                  </p>
                </div>

                <!-- Footer Buttons -->
                <div class="flex items-center justify-end gap-4 pt-6 border-t border-white/10">
                  <button (click)="closeEvalModal()"
                          class="py-3 px-6 bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-sm rounded-xl border border-white/10 transition-all">
                    ← Revenir sans enregistrer
                  </button>
                  <button (click)="submitEvaluation()"
                          [disabled]="!evalForm.studentId || !evalForm.phaseId || evalSaving"
                          class="py-3 px-8 bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(198,39,97,0.3)] hover:scale-105">
                    <span *ngIf="evalSaving" class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                    <span *ngIf="evalSuccess">✓ Évaluation enregistrée avec succès !</span>
                    <span *ngIf="!evalSuccess && !evalSaving">✓ Valider & Enregistrer l'évaluation</span>
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

    <style>
      @keyframes inlineCardIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .inline-view-card { animation: inlineCardIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) both; }
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadein { animation: fadeSlideIn 0.4s ease both; }
    </style>
  `
})
export class FormateurStagiairesComponent implements OnInit, OnDestroy {
  user: User | null = null;
  formations: Formation[] = [];
  allStudents: User[] = [];
  evaluations: Evaluation[] = [];
  stagiaireCards: StagiaireCard[] = [];
  loading = true;
  protected Math = Math;

  searchQuery = '';
  filterFormation = '';
  sortBy = 'name';

  currentPage = 1;
  pageSize = 8;

  selectedStudent: StagiaireCard | null = null;

  showEvalForm = false;
  evalSaving = false;
  evalSuccess = false;
  evalForm = { formationId: '', studentId: null as any, phaseId: null as any, grade: 10, starRating: 5, skills: '', comment: '' };
  availableStudents: User[] = [];
  availablePhases: Phase[] = [];

  private sub = new Subscription();

  constructor(
    private authService: AuthService,
    private formationService: FormationService,
    private evaluationService: EvaluationService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) return;

    // Load all users to get full student details (names, avatars, emails)
    this.sub.add(
      this.userService.getAllUsers().subscribe(users => {
        this.allStudents = users.filter(u => u.role === 'STAGIAIRE');
        this.buildCards();
      })
    );

    // Load formations assigned to trainer
    this.sub.add(
      this.formationService.getFormationsByFormateur(this.user.id).subscribe(data => {
        this.formations = data;
        this.buildCards();
        if (data.length > 0) {
          this.evalForm.formationId = data[0].id;
          this.onEvalFormationChange();
        }
      })
    );

    this.sub.add(
      this.evaluationService.getEvaluationsByTrainer(this.user.id).subscribe(data => {
        this.evaluations = data || [];
        this.buildCards();
        this.loading = false;
      })
    );
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  buildCards(): void {
    if (!this.formations.length) return;
    const studentMap = new Map<string, { nom: string; id: string }[]>();
    const allEnrolledIds = new Set<string>();

    // Only use students explicitly enrolled in the trainer's formations
    this.formations.forEach(f => {
      if (f.stagiaires && f.stagiaires.length > 0) {
        f.stagiaires.forEach(id => {
          allEnrolledIds.add(id);
          const existing = studentMap.get(id) || [];
          existing.push({ nom: f.nom, id: f.id });
          studentMap.set(id, existing);
        });
      }
    });

    // Build cards using enrolled IDs; match with allStudents for user details if available
    const usedStudents = allEnrolledIds.size > 0
      ? this.allStudents.filter(s => allEnrolledIds.has(s.id))
      : [];

    // If no local user data yet but we have IDs, create placeholder cards
    const idsWithoutUserData = [...allEnrolledIds].filter(id => !usedStudents.find(s => s.id === id));
    const placeholders = idsWithoutUserData.map(id => ({
      id,
      prenom: 'Stagiaire',
      nom: `#${id}`,
      email: '',
      role: 'STAGIAIRE' as any,
      avatar: undefined,
      telephone: '',
      dateInscription: new Date(),
      age: 0,
      status: 'ACTIVE',
      authProvider: 'LOCAL'
    }));

    const finalStudents = [...usedStudents, ...placeholders as any];

    this.stagiaireCards = finalStudents.map(student => {
      const evals = this.evaluations.filter(e => e.studentId === student.id);
      const avgGrade = evals.length > 0
        ? evals.reduce((sum, e) => sum + (e.grade || 0), 0) / evals.length
        : null;
      const forms = studentMap.get(student.id) || [];
      const progression = this.computeProgression(student.id);
      return { user: student, formations: forms, avgGrade, evaluationCount: evals.length, progression };
    });
  }

  computeProgression(studentId: string): number {
    const evals = this.evaluations.filter(e => e.studentId === studentId);
    if (!evals.length) return 0;
    const passCount = evals.filter(e => (e.grade || 0) >= 10).length;
    return Math.round((passCount / evals.length) * 100);
  }

  get filteredCards(): StagiaireCard[] {
    let list = [...this.stagiaireCards];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c =>
        `${c.user.prenom} ${c.user.nom}`.toLowerCase().includes(q) ||
        c.user.email.toLowerCase().includes(q)
      );
    }
    if (this.filterFormation) {
      list = list.filter(c => c.formations.some(f => f.id === this.filterFormation));
    }
    switch (this.sortBy) {
      case 'name': list.sort((a, b) => `${a.user.prenom} ${a.user.nom}`.localeCompare(`${b.user.prenom} ${b.user.nom}`)); break;
      case 'grade_desc': list.sort((a, b) => (b.avgGrade || 0) - (a.avgGrade || 0)); break;
      case 'grade_asc': list.sort((a, b) => (a.avgGrade || 0) - (b.avgGrade || 0)); break;
    }
    return list;
  }

  get paginatedCards(): StagiaireCard[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCards.slice(start, start + this.pageSize);
  }

  get totalPages(): number { return Math.ceil(this.filteredCards.length / this.pageSize); }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(p: number): void { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }

  getGlobalAvg(): string {
    const withGrade = this.stagiaireCards.filter(c => c.avgGrade !== null);
    if (!withGrade.length) return '—';
    const avg = withGrade.reduce((s, c) => s + c.avgGrade!, 0) / withGrade.length;
    return avg.toFixed(1);
  }

  getCertifiedCount(): number {
    return this.stagiaireCards.filter(c => c.avgGrade !== null && c.avgGrade >= 14).length;
  }

  getStudentEvals(studentId: string): Evaluation[] {
    return this.evaluations.filter(e => e.studentId === studentId);
  }

  getGradeClass(grade: number | null): string {
    const g = grade || 0;
    if (g >= 16) return 'text-emerald-400';
    if (g >= 14) return 'text-[#F5A623]';
    if (g >= 10) return 'text-blue-400';
    if (g > 0) return 'text-red-400';
    return 'text-white/30';
  }

  getGradeBadgeClass(grade: number | undefined): string {
    const g = grade || 0;
    if (g >= 16) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (g >= 14) return 'bg-[rgba(245,166,35,0.1)] text-[#F5A623] border border-[rgba(245,166,35,0.2)]';
    if (g >= 10) return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    return 'bg-red-500/10 text-red-400 border border-red-500/20';
  }

  openStudentDetail(card: StagiaireCard): void { this.selectedStudent = card; }

  openEvalModal(card: StagiaireCard | null): void {
    this.showEvalForm = true;
    this.evalSuccess = false;
    this.evalSaving = false;
    if (card) { this.evalForm.studentId = card.user.id; }
    this.onEvalFormationChange();
  }

  closeEvalModal(): void { this.showEvalForm = false; }

  onEvalFormationChange(): void {
    const f = this.formations.find(f => f.id === this.evalForm.formationId);
    if (f) {
      this.availablePhases = f.phases || [];
      // Only show enrolled students for this formation
      this.availableStudents = f.stagiaires.length > 0
        ? this.allStudents.filter(s => f.stagiaires.includes(s.id))
        : [];
    } else {
      this.availablePhases = [];
      this.availableStudents = [];
    }
  }

  submitEvaluation(): void {
    if (!this.evalForm.studentId || !this.evalForm.phaseId || !this.user || this.evalSaving) return;
    this.evalSaving = true;
    const payload = {
      studentId: this.evalForm.studentId.toString(),
      trainerId: this.user.id,
      phaseId: this.evalForm.phaseId.toString(),
      grade: this.evalForm.grade,
      skills: this.evalForm.skills,
      comment: this.evalForm.comment
    };
    this.evaluationService.saveEvaluation(payload as any).subscribe({
      next: () => {
        this.evalSuccess = true;
        this.evalSaving = false;
        // Reload evaluations from backend so grades/counts update instantly
        this.evaluationService.getEvaluationsByTrainer(this.user!.id).subscribe(data => {
          this.evaluations = data || [];
          this.buildCards();
          // Also refresh selectedStudent card if it's open
          if (this.selectedStudent) {
            const refreshed = this.stagiaireCards.find(c => c.user.id === this.selectedStudent!.user.id);
            if (refreshed) this.selectedStudent = refreshed;
          }
        });
        setTimeout(() => {
          this.closeEvalModal();
          this.evalForm = { formationId: this.evalForm.formationId, studentId: null, phaseId: null, grade: 10, starRating: 5, skills: '', comment: '' };
        }, 1500);
      },
      error: () => { this.evalSaving = false; }
    });
  }
}
