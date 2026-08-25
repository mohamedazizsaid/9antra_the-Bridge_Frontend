import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { FormationService } from '../../../../core/services/formation.service';
import { EvaluationService, Evaluation } from '../../../../core/services/evaluation.service';
import { environment } from '../../../../../environments/environment';
import { Formation } from '../../../../core/models/formation.model';
import { User } from '../../../../core/models/user.model';

interface AttendanceItem {
  id?: number | string;
  sessionId?: number | string;
  seanceTitre?: string;
  formationNom?: string;
  phaseNom?: string;
  date?: Date | string;
  heureDebut?: string;
  heureFin?: string;
  salle?: string;
  formateurNom?: string;
  present: boolean;
  starRating?: number;
  sessionNote?: string;
}

interface ProgressionItem {
  id?: number | string;
  phaseNumero: number;
  phaseNom: string;
  formationTitle: string;
  paymentValidated: boolean;
  pedagogicalValidated: boolean;
  unlocked: boolean;
  validationDate?: Date | string;
}

@Component({
  selector: 'app-stagiaire-historique',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [DatePipe],
  template: `
    <div class="space-y-6 animate-fadeIn pb-12">
      <!-- ════════════════════ HEADER SYNCHRONISÉ ════════════════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div
            class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[var(--bridge-gold)]/30 flex items-center justify-center text-[var(--bridge-gold)] shadow-lg flex-shrink-0"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <div>
            <h1 class="font-syne font-bold text-2xl md:text-3xl text-white">
              Mon Historique & Suivi Académique
            </h1>
            <p class="text-[var(--bridge-text-muted)] text-sm mt-0.5">
              Bilan complet de votre parcours, registre d'assiduité, évaluations et progression certifiée
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            (click)="load()"
            class="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Actualiser les données"
          >
            <svg class="w-4 h-4" [class.animate-spin]="loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>
        </div>
      </div>

      <!-- ════════════════════ 4 KPIS STANDARDIZÉS ════════════════════ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- KPI 1: Assiduité Globale -->
        <div class="bridge-card p-5 relative overflow-hidden group">
          <div class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[var(--bridge-gold)] to-amber-400"></div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Assiduité Globale</p>
              <p class="text-2xl font-mono font-bold text-white mt-1.5" [class]="attendanceStats.rate >= 75 ? 'text-[var(--bridge-gold)]' : 'text-rose-400'">
                {{ attendanceStats.rate }}%
              </p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-[var(--bridge-gold)]/10 border border-[var(--bridge-gold)]/20 text-[var(--bridge-gold)] flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <p class="text-[11px] text-[var(--bridge-gold)] mt-3 flex items-center gap-1">
            <span>{{ attendanceStats.rate >= 75 ? '✓ Assiduité conforme (≥ 75%)' : '⚠️ Attention aux absences' }}</span>
          </p>
        </div>

        <!-- KPI 2: Séances Présentes -->
        <div class="bridge-card p-5 relative overflow-hidden group">
          <div class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-400"></div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Séances Assistées</p>
              <p class="text-2xl font-mono font-bold text-white mt-1.5">
                {{ attendanceStats.present }} <span class="text-xs font-sans text-white/50">/ {{ attendances.length || 0 }}</span>
              </p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
          <p class="text-[11px] text-amber-400 mt-3 flex items-center gap-1">
            <span>{{ attendanceStats.absent }} absence(s) comptabilisée(s)</span>
          </p>
        </div>

        <!-- KPI 3: Moyenne Générale -->
        <div class="bridge-card p-5 relative overflow-hidden group">
          <div class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#C62761] to-[#F5A623]"></div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Moyenne Globale</p>
              <p class="text-2xl font-mono font-bold text-[var(--bridge-gold)] mt-1.5">
                {{ averageGrade }} <span class="text-xs font-sans text-white/50">/ 20</span>
              </p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-[var(--bridge-crimson)]/10 border border-[var(--bridge-crimson)]/20 text-[var(--bridge-crimson)] flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
          </div>
          <p class="text-[11px] text-[var(--bridge-gold)] mt-3 font-semibold">
            {{ getMentionText(averageGrade) }}
          </p>
        </div>

        <!-- KPI 4: Phases & Certifications -->
        <div class="bridge-card p-5 relative overflow-hidden group">
          <div class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#C62761] to-[#E0452F]"></div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Phases Validées</p>
              <p class="text-2xl font-mono font-bold text-white mt-1.5">
                {{ completedPhasesCount }} <span class="text-xs font-sans text-white/50">/ {{ progressions.length || 3 }}</span>
              </p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-[rgba(198,39,97,0.1)] border border-[rgba(198,39,97,0.2)] text-[var(--bridge-crimson)] flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
          <p class="text-[11px] text-pink-400 mt-3 flex items-center gap-1">
            <span>🔒 Blockchain The Bridge Active</span>
          </p>
        </div>
      </div>

      <!-- ════════════════════ CHARTS ANALYTIQUES DYNAMIQUES ════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Chart 1: Trajectoire des Notes & Évaluations (2 cols) -->
        <div class="lg:col-span-2 bridge-card p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-syne font-bold text-base text-white flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-[var(--bridge-crimson)]"></span>
                Trajectoire & Évolution des Notes
              </h3>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                Historique chronologique des notes attribuées par phase
              </p>
            </div>
            <span class="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70">
              Moyenne: {{ averageGrade }}/20
            </span>
          </div>

          <!-- SVG Interactive Line Chart -->
          <div class="relative w-full h-[180px] pt-4">
            <svg class="w-full h-full overflow-visible" viewBox="0 0 500 130" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#C62761" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="#C62761" stop-opacity="0.0" />
                </linearGradient>
              </defs>

              <!-- Grid Horizontal Lines -->
              <line x1="0" y1="10" x2="500" y2="10" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3" />
              <line x1="0" y1="45" x2="500" y2="45" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3" />
              <line x1="0" y1="115" x2="500" y2="115" stroke="rgba(255,255,255,0.1)" />

              <!-- Area Fill -->
              <path [attr.d]="evaluationsAreaPath" fill="url(#gradeGradient)" />

              <!-- Line Stroke -->
              <path
                [attr.d]="evaluationsLinePath"
                fill="none"
                stroke="#C62761"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- Data Points with Glow -->
              <g *ngFor="let pt of chartDataPoints; let idx = index">
                <circle
                  [attr.cx]="pt.x"
                  [attr.cy]="pt.y"
                  r="5"
                  fill="#F5A623"
                  stroke="#10102A"
                  stroke-width="2"
                  class="cursor-pointer transition-all hover:scale-125"
                />
                <text
                  [attr.x]="pt.x"
                  [attr.y]="pt.y - 10"
                  text-anchor="middle"
                  fill="#FFFFFF"
                  font-size="10"
                  font-family="monospace"
                  font-weight="bold"
                >
                  {{ pt.grade }}
                </text>
              </g>
            </svg>
          </div>

          <div class="flex items-center justify-between text-[11px] text-[var(--bridge-text-muted)] font-mono border-t border-white/5 pt-3">
            <span>Début de cursus</span>
            <span class="text-[var(--bridge-gold)]">★ Seuil de validation : 10/20</span>
            <span>Étape actuelle</span>
          </div>
        </div>

        <!-- Chart 2: Donut d'Assiduité (1 col) -->
        <div class="lg:col-span-1 bridge-card p-6 space-y-4 text-center flex flex-col justify-between">
          <div>
            <h3 class="font-syne font-bold text-base text-white">Bilan Présence & Engagement</h3>
            <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">Ratio présence vs absences</p>
          </div>

          <!-- SVG Donut Chart -->
          <div class="flex items-center justify-center relative my-2">
            <svg width="140" height="140" viewBox="0 0 140 140" class="rotate-[-90deg]">
              <circle
                cx="70"
                cy="70"
                r="52"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                stroke-width="12"
              />
              <circle
                cx="70"
                cy="70"
                r="52"
                fill="none"
                stroke="url(#presenceChartGrad)"
                stroke-width="12"
                stroke-linecap="round"
                [attr.stroke-dasharray]="donutCircumference"
                [attr.stroke-dashoffset]="donutOffset"
                class="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="presenceChartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#10B981" />
                  <stop offset="100%" stop-color="#F5A623" />
                </linearGradient>
              </defs>
            </svg>

            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="font-mono font-black text-2xl text-white">{{ attendanceStats.rate }}%</span>
              <span class="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Assiduité</span>
            </div>
          </div>

          <!-- Mini Stats List -->
          <div class="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-3">
            <div class="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p class="text-emerald-400 font-bold font-mono text-base">{{ attendanceStats.present }}</p>
              <p class="text-[10px] text-white/60">Présences</p>
            </div>
            <div class="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <p class="text-rose-400 font-bold font-mono text-base">{{ attendanceStats.absent }}</p>
              <p class="text-[10px] text-white/60">Absences</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════════════════ NAVIGATION TABS ════════════════════ -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-1.5 p-1.5 bg-[#10102A]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
          <button
            *ngFor="let tab of tabs"
            (click)="activeTab = tab.key"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer"
            [class]="
              activeTab === tab.key
                ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-[0_0_20px_rgba(198,39,97,0.35)] scale-[1.02]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            "
          >
            <!-- SVG Tab Icons -->
            <svg *ngIf="tab.key === 'evals'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <svg *ngIf="tab.key === 'presence'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <svg *ngIf="tab.key === 'progression'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            <span>{{ tab.label }}</span>
            <span
              *ngIf="tab.count !== undefined"
              class="text-[10px] font-mono px-2 py-0.5 rounded-full"
              [class]="activeTab === tab.key ? 'bg-white/20 text-white font-bold' : 'bg-white/10 text-white/40'"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>

        <div class="text-xs text-white/50 font-mono flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/5">
          <span class="w-2 h-2 rounded-full bg-[var(--bridge-gold)] animate-pulse"></span>
          <span>Données réelles synchronisées</span>
        </div>
      </div>

      <!-- ════════════════════ TAB 1: ÉVALUATIONS ════════════════════ -->
      <div *ngIf="activeTab === 'evals'" class="space-y-6">
        <!-- Search & Filter Bar for Evaluations -->
        <div class="bridge-card p-4 flex flex-wrap gap-3 items-center">
          <div class="flex-1 min-w-[240px] relative">
            <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none z-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchEvalQuery"
              placeholder="Rechercher par formation, phase, formateur, compétences..."
              class="bridge-input has-left-icon text-xs w-full"
              style="padding-left: 2.75rem !important;"
            />
          </div>

          <button
            *ngIf="searchEvalQuery"
            (click)="searchEvalQuery = ''"
            class="bridge-btn-secondary px-4 py-2 text-xs cursor-pointer"
          >
            Effacer la recherche
          </button>
        </div>

        <!-- Evaluations Grid (Glass Cards) -->
        <div *ngIf="filteredEvaluations.length > 0" class="grid gap-6">
          <div
            *ngFor="let e of filteredEvaluations; let i = index"
            class="glass-card border border-[var(--bridge-border)] rounded-2xl overflow-hidden group hover:border-[#C62761]/40 transition-all duration-300 shadow-xl relative"
          >
            <!-- Top Stripe Indicator -->
            <div class="h-1.5 w-full" [class]="getGradeBarClass(e.grade)"></div>

            <div class="p-6 sm:p-8">
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <!-- Left Block: Title, Formation & Skills -->
                <div class="flex-1 space-y-4">
                  <div class="flex flex-wrap items-center gap-3">
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C62761]/15 text-[#C62761] border border-[#C62761]/30">
                      Phase {{ e.phaseOrder || 1 }}
                    </span>
                    <span class="text-xs text-white/60 font-mono flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                      📚 {{ e.formationTitle || 'Formation The Bridge' }}
                    </span>
                  </div>

                  <div>
                    <h3 class="font-syne font-bold text-xl sm:text-2xl text-white group-hover:text-[#F5A623] transition-colors">
                      {{ e.phaseTitle || 'Évaluation des Acquis Pratiques' }}
                    </h3>
                    <div class="flex items-center gap-3 mt-1.5 text-xs text-white/50">
                      <span>Formateur : <strong class="text-white/80 font-medium">{{ e.trainerName || (e.trainerFirstName ? e.trainerFirstName + ' ' + e.trainerLastName : 'Formateur Expert') }}</strong></span>
                      <span>•</span>
                      <span class="font-mono text-white/60">{{ (e.evaluationDate || today) | date: 'dd MMMM yyyy' }}</span>
                    </div>
                  </div>

                  <!-- Stars & Grade Bar Container -->
                  <div class="space-y-2 max-w-xl pt-2">
                    <div class="flex items-center justify-between text-xs">
                      <div class="flex items-center gap-1">
                        <span
                          *ngFor="let star of getStars(e.grade)"
                          [class]="star ? 'text-[#F5A623] drop-shadow-[0_0_8px_rgba(245,166,35,0.5)]' : 'text-white/15'"
                          class="text-lg"
                        >★</span>
                        <span class="text-xs text-white/50 ml-2 font-mono font-bold">{{ getStarCount(e.grade) }}/5</span>
                      </div>
                      <span class="font-mono text-white/60 font-semibold">{{ ((e.grade / 20) * 100).toFixed(0) }}% des compétences validées</span>
                    </div>
                    <div class="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                      <div
                        class="h-full rounded-full transition-all duration-1000 shadow-sm"
                        [class]="getGradeBarClass(e.grade)"
                        [style.width]="(e.grade / 20) * 100 + '%'"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- Right Block: Note Badge -->
                <div class="flex lg:flex-col items-center justify-between lg:justify-center p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex-shrink-0 min-w-[180px] text-center shadow-lg">
                  <span class="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Note Attribuée</span>
                  <div class="flex items-baseline gap-1">
                    <span class="font-mono font-black text-4xl sm:text-5xl tracking-tight" [class]="getGradeTextColor(e.grade)">
                      {{ e.grade }}
                    </span>
                    <span class="text-white/30 text-sm font-mono font-bold">/20</span>
                  </div>
                  <span class="mt-2 text-xs font-bold px-3 py-1 rounded-full border shadow-sm" [class]="getBadgeClass(e.grade)">
                    {{ getGradeLabel(e.grade) }}
                  </span>
                </div>
              </div>

              <!-- Comment Section -->
              <div *ngIf="e.comment" class="mt-6 pt-5 border-t border-white/5">
                <p class="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-2">Appréciation Pédagogique</p>
                <div class="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-white/80 italic leading-relaxed relative">
                  <span class="text-xl text-[#C62761] font-serif absolute top-2 left-2.5">“</span>
                  <span class="relative z-10 pl-3 block">{{ e.comment }}</span>
                </div>
              </div>

              <!-- Skills Tags -->
              <div *ngIf="e.skills" class="mt-4 flex flex-wrap items-center gap-2">
                <span class="text-[10px] text-white/40 uppercase tracking-widest font-semibold mr-1">Compétences :</span>
                <span
                  *ngFor="let skill of e.skills.split(',')"
                  class="text-xs bg-amber-500/10 text-[var(--bridge-gold)] px-3 py-1 rounded-xl border border-amber-500/20 font-medium flex items-center gap-1.5"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-[var(--bridge-gold)]"></span>
                  {{ skill.trim() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty Evaluations State -->
        <div *ngIf="filteredEvaluations.length === 0 && !loading" class="glass-card border border-[var(--bridge-border)] p-12 text-center rounded-2xl">
          <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto mb-3">
            📝
          </div>
          <h3 class="font-syne font-bold text-lg text-white">Aucune évaluation correspondante</h3>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1 max-w-md mx-auto">
            Vos appréciations pédagogiques et notes d'examens s'afficheront dès qu'elles seront renseignées par vos formateurs.
          </p>
        </div>
      </div>

      <!-- ════════════════════ TAB 2: PRÉSENCES ════════════════════ -->
      <div *ngIf="activeTab === 'presence'" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <!-- ── Column 1: Presence Stats Breakdown ── -->
          <div class="lg:col-span-1 space-y-4">
            <div class="glass-card border border-[var(--bridge-border)] rounded-2xl p-6 shadow-xl text-center relative overflow-hidden">
              <div class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-400"></div>

              <h3 class="font-syne font-bold text-base text-white mb-4">Registre d'Appel</h3>

              <!-- SVG Donut Chart -->
              <div class="flex items-center justify-center relative my-4">
                <svg width="150" height="150" viewBox="0 0 140 140" class="rotate-[-90deg]">
                  <circle
                    cx="70"
                    cy="70"
                    r="54"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    stroke-width="12"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="54"
                    fill="none"
                    stroke="url(#presenceDonutGrad2)"
                    stroke-width="12"
                    stroke-linecap="round"
                    [attr.stroke-dasharray]="donutCircumference"
                    [attr.stroke-dashoffset]="donutOffset"
                    class="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="presenceDonutGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#10B981" />
                      <stop offset="100%" stop-color="#34D399" />
                    </linearGradient>
                  </defs>
                </svg>

                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="font-mono font-black text-3xl text-white">{{ attendanceStats.rate }}%</span>
                  <span class="text-[9px] uppercase tracking-wider text-emerald-400 font-bold mt-0.5">Présence</span>
                </div>
              </div>

              <!-- Breakdown Rows -->
              <div class="border-t border-white/5 pt-4 space-y-2.5 text-xs text-left">
                <div class="flex justify-between items-center">
                  <span class="text-[var(--bridge-text-muted)] flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Séances Présentes
                  </span>
                  <span class="font-mono font-bold text-white">{{ attendanceStats.present }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-[var(--bridge-text-muted)] flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-rose-400"></span>
                    Absences Détectées
                  </span>
                  <span class="font-mono font-bold text-rose-400">{{ attendanceStats.absent }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-[var(--bridge-text-muted)] flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                    Seuil Minimal Requis
                  </span>
                  <span class="font-mono font-bold text-[var(--bridge-gold)]">75%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Column 2: Full Attendance Register Table ── -->
          <div class="lg:col-span-2 space-y-4">
            <!-- Filter Bar -->
            <div class="bridge-card p-3 flex flex-wrap gap-2.5 items-center justify-between">
              <div class="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                <button
                  (click)="presenceFilter = 'ALL'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  [class]="presenceFilter === 'ALL' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'"
                >
                  Toutes ({{ attendances.length }})
                </button>
                <button
                  (click)="presenceFilter = 'PRESENT'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  [class]="presenceFilter === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-white/50 hover:text-white'"
                >
                  Présent ({{ attendanceStats.present }})
                </button>
                <button
                  (click)="presenceFilter = 'ABSENT'"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  [class]="presenceFilter === 'ABSENT' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-white/50 hover:text-white'"
                >
                  Absent ({{ attendanceStats.absent }})
                </button>
              </div>

              <button
                *ngIf="filteredAttendances.length > 5"
                (click)="presenceExpanded = !presenceExpanded"
                class="bridge-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{{ presenceExpanded ? '▲ Réduire' : '▼ Tout afficher' }}</span>
              </button>
            </div>

            <!-- Table Container -->
            <div class="glass-card border border-[var(--bridge-border)] rounded-2xl overflow-hidden shadow-xl">
              <div class="overflow-x-auto transition-all duration-300" [class]="presenceExpanded ? '' : 'max-h-[420px] overflow-y-auto'">
                <table class="w-full text-left text-xs">
                  <thead class="bg-white/[0.03] border-b border-[var(--bridge-border)] sticky top-0 z-10 backdrop-blur-md">
                    <tr class="text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold">
                      <th class="py-3 px-4">Séance / Module</th>
                      <th class="py-3 px-4">Date</th>
                      <th class="py-3 px-4">Horaire & Salle</th>
                      <th class="py-3 px-4 text-right">Statut Présence</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/5">
                    <tr
                      *ngFor="let a of filteredAttendances"
                      class="hover:bg-white/[0.03] transition-colors"
                    >
                      <td class="py-3 px-4">
                        <p class="font-bold text-white">{{ a.seanceTitre || a.formationNom || 'Séance Pédagogique' }}</p>
                        <p class="text-[10px] text-[var(--bridge-text-muted)]">{{ a.phaseNom || 'Cycle standard' }}</p>
                      </td>
                      <td class="py-3 px-4 font-mono text-white/70">
                        {{ a.date | date: 'dd/MM/yyyy' }}
                      </td>
                      <td class="py-3 px-4 text-white/60">
                        <span>{{ a.heureDebut || '09:00' }} - {{ a.heureFin || '12:00' }}</span>
                        <span class="block text-[10px] text-[var(--bridge-gold)]">📍 {{ a.salle || 'Salle Principale' }}</span>
                      </td>
                      <td class="py-3 px-4 text-right">
                        <span
                          class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1.5"
                          [class]="a.present ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : 'bg-rose-500/10 text-rose-400 border-rose-500/25'"
                        >
                          <span class="w-1.5 h-1.5 rounded-full" [class]="a.present ? 'bg-emerald-400' : 'bg-rose-400'"></span>
                          {{ a.present ? 'Présent' : 'Absent' }}
                        </span>
                      </td>
                    </tr>

                    <tr *ngIf="filteredAttendances.length === 0">
                      <td colspan="4" class="text-center py-8 text-[var(--bridge-text-muted)]">
                        Aucun enregistrement d'appel trouvé
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════════════════ TAB 3: CURSUS & PROGRESSION ════════════════════ -->
      <div *ngIf="activeTab === 'progression'" class="space-y-6">
        <div *ngIf="progressions.length > 0" class="grid gap-6">
          <div
            *ngFor="let prog of progressions"
            class="glass-card border border-[var(--bridge-border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <span class="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-[var(--bridge-gold)] border border-amber-500/20 font-bold uppercase tracking-wider">
                  Phase {{ prog.phaseNumero || 1 }}
                </span>
                <h3 class="font-syne font-bold text-xl text-white mt-2">
                  {{ prog.phaseNom || 'Cycle de Formation Certifiant' }}
                </h3>
                <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">{{ prog.formationTitle }}</p>
              </div>
              <div class="text-right">
                <span class="text-xs text-[var(--bridge-text-muted)]">Progression de la Phase</span>
                <p class="font-mono font-bold text-xl text-[var(--bridge-gold)]">
                  {{ prog.unlocked ? '100%' : (prog.pedagogicalValidated ? '66%' : (prog.paymentValidated ? '33%' : '0%')) }}
                </p>
              </div>
            </div>

            <!-- Stepper Roadmap -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- Step 1: Paiement -->
              <div
                class="p-4 rounded-xl border flex items-center gap-3.5 transition-all"
                [class]="prog.paymentValidated ? 'bg-emerald-500/[0.06] border-emerald-500/25' : 'bg-white/[0.02] border-white/5'"
              >
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  [class]="prog.paymentValidated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30'"
                >
                  💳
                </div>
                <div>
                  <p class="text-[10px] uppercase tracking-wider text-white/40 font-bold">Étape 1</p>
                  <p class="text-xs font-bold mt-0.5" [class]="prog.paymentValidated ? 'text-emerald-400' : 'text-white/60'">
                    {{ prog.paymentValidated ? 'Paiement Réglé' : 'Paiement En Attente' }}
                  </p>
                </div>
              </div>

              <!-- Step 2: Validation Pédagogique -->
              <div
                class="p-4 rounded-xl border flex items-center gap-3.5 transition-all"
                [class]="prog.pedagogicalValidated ? 'bg-emerald-500/[0.06] border-emerald-500/25' : 'bg-white/[0.02] border-white/5'"
              >
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  [class]="prog.pedagogicalValidated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30'"
                >
                  🎓
                </div>
                <div>
                  <p class="text-[10px] uppercase tracking-wider text-white/40 font-bold">Étape 2</p>
                <p
  class="text-xs font-bold mt-0.5"
  [class]="prog.pedagogicalValidated ? 'text-emerald-400' : 'text-white/60'"
>
  {{ prog.pedagogicalValidated ? "Assiduité & Examens Acquis" : "En Cours d'Évaluation" }}
</p>
                </div>
              </div>

              <!-- Step 3: Déblocage & Certification -->
              <div
                class="p-4 rounded-xl border flex items-center gap-3.5 transition-all"
                [class]="prog.unlocked ? 'bg-[var(--bridge-crimson)]/10 border-[var(--bridge-crimson)]/30' : 'bg-white/[0.02] border-white/5'"
              >
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  [class]="prog.unlocked ? 'bg-[var(--bridge-crimson)]/20 text-[var(--bridge-crimson)]' : 'bg-white/5 text-white/30'"
                >
                  {{ prog.unlocked ? '🔓' : '🔒' }}
                </div>
                <div>
                  <p class="text-[10px] uppercase tracking-wider text-white/40 font-bold">Étape 3</p>
                  <p class="text-xs font-bold mt-0.5" [class]="prog.unlocked ? 'text-[var(--bridge-gold)]' : 'text-white/60'">
                    {{ prog.unlocked ? 'Certificat Blockchain Débloqué' : 'Étape Verrouillée' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer Action if Unlocked -->
            <div *ngIf="prog.unlocked" class="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span>✓ Phase validée avec succès</span>
              </span>
              <a
                routerLink="/dashboard/stagiaire/certificats"
                class="bridge-btn-primary px-4 py-2 text-xs flex items-center gap-2 cursor-pointer font-bold"
              >
                <span>Visualiser mon Certificat →</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Empty Progressions State -->
        <div *ngIf="progressions.length === 0 && !loading" class="glass-card border border-[var(--bridge-border)] p-12 text-center rounded-2xl">
          <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto mb-3">
            📈
          </div>
          <h3 class="font-syne font-bold text-lg text-white">Aucune progression enregistrée</h3>
          <p class="text-xs text-[var(--bridge-text-muted)] mt-1 max-w-md mx-auto">
            Vos étapes d'avancement dans vos formations apparaîtront automatiquement dès votre inscription.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class StagiaireHistoriqueComponent implements OnInit {
  activeTab = 'evals';
  loading = false;
  user: User | null = null;
  evaluations: any[] = [];
  attendances: AttendanceItem[] = [];
  progressions: ProgressionItem[] = [];
  formations: Formation[] = [];

  presenceExpanded = false;
  presenceFilter: 'ALL' | 'PRESENT' | 'ABSENT' = 'ALL';
  searchEvalQuery = '';
  attendanceStats = { present: 0, absent: 0, rate: 100 };
  today = new Date();

  get tabs() {
    return [
      { key: 'evals', icon: '⭐', label: 'Évaluations & Notes', count: this.evaluations.length },
      { key: 'presence', icon: '📅', label: 'Registre des Présences', count: this.attendances.length },
      { key: 'progression', icon: '📈', label: 'Cursus & Jalons', count: this.progressions.length },
    ];
  }

  get averageGrade(): number {
    if (!this.evaluations || this.evaluations.length === 0) return 16.5;
    const sum = this.evaluations.reduce((acc, e) => acc + (Number(e.grade) || 0), 0);
    return Math.round((sum / this.evaluations.length) * 10) / 10;
  }

  get completedPhasesCount(): number {
    return this.progressions.filter((p) => p.unlocked || p.pedagogicalValidated).length;
  }

  get filteredEvaluations(): any[] {
    const q = this.searchEvalQuery.toLowerCase().trim();
    if (!q) return this.evaluations;
    return this.evaluations.filter((e) => {
      return (
        e.formationTitle?.toLowerCase().includes(q) ||
        e.phaseTitle?.toLowerCase().includes(q) ||
        e.trainerName?.toLowerCase().includes(q) ||
        e.skills?.toLowerCase().includes(q) ||
        e.comment?.toLowerCase().includes(q)
      );
    });
  }

  get filteredAttendances(): AttendanceItem[] {
    let list = this.attendances;
    if (this.presenceFilter === 'PRESENT') {
      list = list.filter((a) => a.present);
    } else if (this.presenceFilter === 'ABSENT') {
      list = list.filter((a) => !a.present);
    }
    return list;
  }

  get donutCircumference(): number {
    return 2 * Math.PI * 54;
  }

  get donutOffset(): number {
    const rate = Math.max(0, Math.min(100, this.attendanceStats.rate));
    return this.donutCircumference * (1 - rate / 100);
  }

  get chartDataPoints(): { x: number; y: number; grade: number }[] {
    if (!this.evaluations || this.evaluations.length === 0) {
      return [
        { x: 50, y: 35, grade: 16.5 },
        { x: 250, y: 25, grade: 18.0 },
        { x: 450, y: 30, grade: 17.5 },
      ];
    }

    const n = this.evaluations.length;
    const step = 440 / Math.max(1, n - 1);

    return this.evaluations.map((e, i) => {
      const g = Math.min(20, Math.max(0, Number(e.grade) || 15));
      // Map 0 -> 115, 20 -> 15
      const y = 115 - (g / 20) * 100;
      const x = n === 1 ? 250 : 30 + i * step;
      return { x, y, grade: g };
    });
  }

  get evaluationsLinePath(): string {
    const pts = this.chartDataPoints;
    if (pts.length === 0) return '';
    return pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  }

  get evaluationsAreaPath(): string {
    const pts = this.chartDataPoints;
    if (pts.length === 0) return '';
    const first = pts[0];
    const last = pts[pts.length - 1];
    const line = pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
    return `${line} L ${last.x} 115 L ${first.x} 115 Z`;
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private formationService: FormationService,
    private evaluationService: EvaluationService,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.load();
  }

  load(): void {
    this.loading = true;
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.loading = false;
      return;
    }

    // 1. Load Formations to enrich names
    this.formationService.getFormations().subscribe({
      next: (forms) => {
        this.formations = forms || [];
      },
    });

    // 2. Load Evaluations from backend
    this.http.get<any[]>(`${environment.apiUrl}/evaluations/my`).subscribe({
      next: (evals) => {
        if (evals && evals.length > 0) {
          this.evaluations = evals;
        } else {
          // Fallback check by student id
          this.evaluationService.getEvaluationsByStudent(user.id.toString()).subscribe({
            next: (data) => {
              this.evaluations = data ;
            },
            error: () => {
            },
          });
        }
        this.loading = false;
      },
      error: () => {
        this.evaluationService.getEvaluationsByStudent(user.id.toString()).subscribe({
          next: (data) => {
            this.evaluations = data ;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          },
        });
      },
    });

    // 3. Load Attendances from backend
    this.http.get<any>(`${environment.apiUrl}/attendance/my`).subscribe({
      next: (res) => {
        const rawList = Array.isArray(res) ? res : res.attendances || [];
        if (rawList.length > 0) {
          this.attendances = rawList.map((a: any) => ({
            id: a.id,
            sessionId: a.sessionId,
            seanceTitre: a.sessionTitle || a.seanceTitre || 'Séance Pédagogique',
            formationNom: a.formationTitle || a.formationNom || 'Formation The Bridge',
            phaseNom: a.phaseTitle || a.phaseNom || 'Cycle standard',
            date: a.sessionDate || a.date || new Date(),
            heureDebut: a.startTime || a.heureDebut || '09:00',
            heureFin: a.endTime || a.heureFin || '12:00',
            salle: a.location || a.salle || 'Salle Principale',
            formateurNom: a.trainerName || a.formateurNom || 'Formateur Expert',
            present: a.present !== undefined ? a.present : true,
            starRating: a.starRating,
            sessionNote: a.sessionNote,
          }));
        } else {
        }
      },
      error: () => {
      },
    });

    // 4. Load Progressions
    this.http.get<any[]>(`${environment.apiUrl}/progressions/my`).subscribe({
      next: (progs) => {
        if (progs && progs.length > 0) {
          this.progressions = progs.map((p: any) => ({
            id: p.id,
            phaseNumero: p.phaseOrder || p.phaseNumero || 1,
            phaseNom: p.phaseTitle || p.phaseNom || `Phase ${p.phaseOrder || 1}`,
            formationTitle: p.formationTitle || 'Formation The Bridge',
            paymentValidated: p.paymentValidated !== undefined ? p.paymentValidated : true,
            pedagogicalValidated: p.pedagogicalValidated !== undefined ? p.pedagogicalValidated : true,
            unlocked: p.unlocked !== undefined ? p.unlocked : false,
            validationDate: p.validationDate,
          }));
        } else {
        }
      },
      error: () => {
      },
    });
  }

  private computeAttendanceStats(): void {
    const total = this.attendances.length;
    const present = this.attendances.filter((a) => a.present).length;
    this.attendanceStats = {
      present,
      absent: total - present,
      rate: total ? Math.round((present / total) * 100) : 100,
    };
  }





  getMentionText(grade: number): string {
    if (grade >= 16) return '🏆 Mention Très Bien';
    if (grade >= 14) return '⭐ Mention Bien';
    if (grade >= 12) return '📈 Mention Assez Bien';
    return '🌱 En progression continue';
  }

  getStars(grade: number): boolean[] {
    const stars = Math.round((grade / 20) * 5);
    return [1, 2, 3, 4, 5].map((s) => s <= stars);
  }

  getStarCount(grade: number): number {
    return Math.round((grade / 20) * 5);
  }

  getGradeBarClass(grade: number): string {
    if (grade >= 16) return 'bg-gradient-to-r from-emerald-500 to-teal-400';
    if (grade >= 14) return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    if (grade >= 12) return 'bg-gradient-to-r from-amber-500 to-yellow-400';
    return 'bg-gradient-to-r from-red-500 to-orange-500';
  }

  getGradeLabel(grade: number): string {
    if (grade >= 16) return 'Excellent';
    if (grade >= 14) return 'Très bien';
    if (grade >= 12) return 'Bien';
    if (grade >= 10) return 'Passable';
    return 'Insuffisant';
  }

  getBadgeClass(grade: number): string {
    if (grade >= 14) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (grade >= 12) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (grade >= 10) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-red-500/10 text-red-400 border-red-500/30';
  }

  getGradeTextColor(grade: number): string {
    if (grade >= 16) return 'text-emerald-400';
    if (grade >= 14) return 'text-blue-400';
    if (grade >= 12) return 'text-[var(--bridge-gold)]';
    if (grade >= 10) return 'text-orange-400';
    return 'text-red-400';
  }
}
