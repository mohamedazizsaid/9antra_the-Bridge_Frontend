import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-stagiaire-historique',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  template: `
    <div class="space-y-8 animate-fadein pb-10">

      <!-- ════════════════════ HERO HEADER ════════════════════ -->
      <div class="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#10102A] via-[#16163A] to-[#0A0A1C] p-6 sm:p-8 shadow-2xl">
        <!-- Background Ambient Glows -->
        <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#C62761]/15 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#7C3AED]/15 blur-3xl pointer-events-none"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex items-center gap-5">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#C62761] to-[#F5A623] p-0.5 shadow-xl shadow-[rgba(124,58,237,0.3)] flex-shrink-0">
              <div class="w-full h-full bg-[#0E0E24] rounded-[14px] flex items-center justify-center text-3xl">
                📜
              </div>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-[#C62761]/20 to-[#F5A623]/20 border border-[#F5A623]/30 text-[#F5A623]">
                  Suivi Académique & Pédagogique
                </span>
              </div>
              <h1 class="font-syne font-extrabold text-3xl sm:text-4xl text-white mt-1 tracking-tight">
                Mon <span class="bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623] bg-clip-text text-transparent">Historique</span>
              </h1>
              <p class="text-white/60 text-sm mt-1 max-w-xl">
                Consultez le détail de vos évaluations, le registre interactif de vos présences et l'avancement de votre cursus.
              </p>
            </div>
          </div>

          <!-- Quick Metrics Bar in Header -->
          <div class="flex items-center gap-3 self-start md:self-center">
            <!-- Assiduité metric card -->
            <div class="px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                   [class]="attendanceStats.rate >= 75 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'">
                {{ attendanceStats.rate >= 75 ? '🎯' : '⚠️' }}
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Assiduité Globale</p>
                <p class="font-mono font-bold text-xl leading-tight" [class]="attendanceStats.rate >= 75 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ attendanceStats.rate }}%
                </p>
              </div>
            </div>

            <!-- Évaluations metric card -->
            <div class="px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-[#F5A623]/15 border border-[#F5A623]/20 text-[#F5A623] flex items-center justify-center text-lg">
                ⭐
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Évaluations</p>
                <p class="font-mono font-bold text-xl text-[#F5A623] leading-tight">{{ evaluations.length }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════════════════ NAVIGATION TABS ════════════════════ -->
      <div class="flex flex-wrap items-center justify-between gap-4 ">
        <div class="flex items-center gap-1.5 p-1.5 bg-[#10102A]/80 backdrop-blur-xl border border-white/10 rounded-2xl w-fit shadow-lg">
          <button *ngFor="let tab of tabs" (click)="activeTab = tab.key"
                  class="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group cursor-pointer"
                  [class]="activeTab === tab.key
                    ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white shadow-[0_0_20px_rgba(198,39,97,0.35)] scale-[1.02]'
                    : 'text-white/50 hover:text-white hover:bg-white/5'">
            <span class="text-base group-hover:scale-110 transition-transform">{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
            <span *ngIf="tab.count !== undefined"
                  class="text-[11px] font-mono px-2 py-0.5 rounded-full transition-all"
                  [class]="activeTab === tab.key ? 'bg-white/20 text-white font-bold' : 'bg-white/10 text-white/40'">
              {{ tab.count }}
            </span>
          </button>
        </div>

        <!-- Secondary info or filter note -->
        <div class="text-xs text-white/40 font-mono flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Données synchronisées en temps réel
        </div>
      </div>

      <!-- ════════════════════ TAB 1: ÉVALUATIONS ════════════════════ -->
      <div *ngIf="activeTab === 'evals'" class="space-y-6">

        <!-- Loading State -->
        <div *ngIf="loading" class="grid md:grid-cols-2 gap-6">
          <div *ngFor="let _ of [1,2]" class="glass-card border border-white/10 p-6 animate-pulse space-y-4">
            <div class="flex items-center justify-between">
              <div class="h-4 bg-white/10 rounded w-1/3"></div>
              <div class="h-8 bg-white/10 rounded-full w-20"></div>
            </div>
            <div class="h-12 bg-white/5 rounded-xl"></div>
            <div class="h-16 bg-white/5 rounded-xl"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="evaluations.length === 0 && !loading"
             class="glass-card border border-white/10 p-16 text-center rounded-3xl relative overflow-hidden">
          <div class="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mx-auto mb-4">
            📝
          </div>
          <h3 class="font-syne font-bold text-xl text-white">Aucune évaluation enregistrée</h3>
          <p class="text-white/40 text-sm mt-2 max-w-md mx-auto leading-relaxed">
            Vos résultats d'évaluations et appréciations pédagogiques délivrés par vos formateurs apparaîtront ici.
          </p>
        </div>

        <!-- Evaluations Grid -->
        <div *ngIf="evaluations.length > 0" class="grid gap-6">
          <div *ngFor="let e of evaluations; let i = index"
               class="glass-card border border-white/10 rounded-3xl overflow-hidden group hover:border-[#C62761]/40 transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(198,39,97,0.15)] relative"
               [style.animation-delay]="(i * 70) + 'ms'"
               style="animation: fadeSlideIn 0.4s ease both">

            <!-- Top Accent Stripe -->
            <div class="h-1.5 w-full" [class]="getGradeBarClass(e.grade)"></div>

            <div class="p-6 sm:p-8">
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                <!-- Left Block: Badge, Title & Details -->
                <div class="flex-1 space-y-4">
                  <div class="flex flex-wrap items-center gap-3">
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C62761]/15 text-[#C62761] border border-[#C62761]/30">
                      Phase {{ e.phaseOrder || 1 }}
                    </span>
                    <span class="text-xs text-white/40 font-mono flex items-center gap-1">
                      📚 {{ e.formationTitle }}
                    </span>
                  </div>

                  <div>
                    <h3 class="font-syne font-bold text-xl sm:text-2xl text-white group-hover:text-[#F5A623] transition-colors">
                      {{ e.phaseTitle }}
                    </h3>
                    <div class="flex items-center gap-3 mt-1.5 text-xs text-white/50">
                      <span>Formateur : <strong class="text-white/80 font-medium">{{ e.trainerName }}</strong></span>
                      <span>•</span>
                      <span class="font-mono">{{ e.evaluationDate | date:'dd MMMM yyyy' }}</span>
                    </div>
                  </div>

                  <!-- Stars & Grade Bar Container -->
                  <div class="space-y-2 max-w-xl pt-2">
                    <div class="flex items-center justify-between text-xs">
                      <div class="flex items-center gap-1">
                        <span *ngFor="let star of getStars(e.grade)"
                              [class]="star ? 'text-[#F5A623] drop-shadow-[0_0_8px_rgba(245,166,35,0.5)]' : 'text-white/10'"
                              class="text-xl">★</span>
                        <span class="text-xs text-white/50 ml-2 font-mono font-bold">{{ getStarCount(e.grade) }}/5</span>
                      </div>
                      <span class="font-mono text-white/40 font-semibold">{{ ((e.grade / 20) * 100).toFixed(0) }}% acquis</span>
                    </div>
                    <div class="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div class="h-full rounded-full transition-all duration-1000 shadow-sm"
                           [class]="getGradeBarClass(e.grade)"
                           [style.width]="((e.grade / 20) * 100) + '%'"></div>
                    </div>
                  </div>
                </div>

                <!-- Right Block: Giant Grade Badge -->
                <div class="flex lg:flex-col items-center justify-between lg:justify-center p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex-shrink-0 min-w-[180px] text-center">
                  <span class="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Note Finale</span>
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
                <p class="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-2">Appréciation Pédagogique</p>
                <div class="p-4 rounded-2xl bg-gradient-to-r from-white/[0.03] to-transparent border border-white/5 text-sm text-white/80 italic leading-relaxed relative">
                  <span class="text-2xl text-[#C62761]/40 font-serif leading-none absolute top-2 left-2">“</span>
                  <span class="relative z-10 pl-3 block">{{ e.comment }}</span>
                </div>
              </div>

              <!-- Skills Tags -->
              <div *ngIf="e.skills" class="mt-4 flex flex-wrap items-center gap-2">
                <span class="text-[10px] text-white/30 uppercase tracking-widest font-semibold mr-1">Compétences :</span>
                <span *ngFor="let skill of e.skills.split(',')"
                      class="text-xs bg-[#F5A623]/10 text-[#F5A623] px-3 py-1 rounded-xl border border-[#F5A623]/20 font-medium flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#F5A623]"></span>
                  {{ skill.trim() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════════════════ TAB 2: PRÉSENCES ════════════════════ -->
      <div *ngIf="activeTab === 'presence'" class="space-y-5">

        <!-- ── Two-column floating layout ── -->
        <div class="flex flex-col lg:flex-row gap-5 items-start">

          <!-- ════ LEFT COLUMN: Stats Panel (sticky on desktop) ════ -->
          <div class="w-full lg:w-72 flex-shrink-0 space-y-4 lg:sticky lg:top-4">

            <!-- SVG Donut Chart Card -->
            <div class="glass-card rounded-3xl p-5 shadow-xl">
              <p class="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Taux de Présence</p>

              <!-- SVG Donut -->
              <div class="flex items-center justify-center relative py-2">
                <svg width="140" height="140" viewBox="0 0 140 140" class="rotate-[-90deg]">
                  <!-- Background track -->
                  <circle cx="70" cy="70" r="54" fill="none" class="donut-track"
                          stroke="rgba(255,255,255,0.06)" stroke-width="14"/>
                  <!-- Present arc (green) -->
                  <circle cx="70" cy="70" r="54" fill="none"
                          stroke="#10b981" stroke-width="14"
                          stroke-linecap="round"
                          [style.stroke-dasharray]="339.29"
                          [style.stroke-dashoffset]="339.29 * (1 - attendanceStats.rate / 100)"
                          style="transition: stroke-dashoffset 1.2s cubic-bezier(0.25,0.46,0.45,0.94)"/>
                  <!-- Threshold marker at 75% -->
                  <circle cx="70" cy="70" r="54" fill="none"
                          stroke="#F5A623" stroke-width="3"
                          stroke-linecap="round"
                          stroke-dasharray="4 335.29"
                          stroke-dashoffset="-84.82"/>
                </svg>
                <!-- Center label -->
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span class="text-3xl font-black font-mono leading-none"
                        [class]="attendanceStats.rate >= 75 ? 'text-emerald-400' : 'text-rose-400'">
                    {{ attendanceStats.rate }}%
                  </span>
                  <span class="text-[10px] text-white/40 font-medium mt-1">assiduité</span>
                </div>
              </div>

              <!-- Legend rows -->
              <div class="space-y-2 mt-3">
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                    <span class="text-white/60 font-medium">Présences</span>
                  </div>
                  <span class="font-mono font-black text-emerald-400">{{ attendanceStats.present }}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-rose-400 flex-shrink-0"></span>
                    <span class="text-white/60 font-medium">Absences</span>
                  </div>
                  <span class="font-mono font-black text-rose-400">{{ attendanceStats.absent }}</span>
                </div>
                <div class="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-sm bg-[#F5A623] flex-shrink-0"></span>
                    <span class="text-white/60 font-medium">Total séances</span>
                  </div>
                  <span class="font-mono font-black text-white/70">{{ attendances.length }}</span>
                </div>
              </div>
            </div>

            <!-- Eligibility Card -->
            <div class="glass-card rounded-3xl p-5 shadow-xl space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-widest text-white/40">Certificat Blockchain</p>
                  <p class="text-sm font-bold text-white mt-1">Éligibilité</p>
                </div>
                <span class="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border"
                      [class]="attendanceStats.rate >= 75
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/25'">
                  {{ attendanceStats.rate >= 75 ? '✓ Éligible' : '✗ Non Éligible' }}
                </span>
              </div>

              <!-- Progress bar -->
              <div class="relative h-3 rounded-full overflow-hidden" style="background: rgba(255,255,255,0.06)">
                <div class="h-full rounded-full transition-all duration-1000"
                     [class]="attendanceStats.rate >= 75
                       ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400'
                       : 'bg-gradient-to-r from-rose-500 to-orange-400'"
                     [style.width]="attendanceStats.rate + '%'"></div>
                <!-- 75% threshold tick -->
                <div class="absolute top-0 bottom-0 w-px bg-[#F5A623] shadow-[0_0_6px_#F5A623]" style="left:75%"></div>
              </div>
              <div class="flex justify-between text-[10px] font-mono text-white/30">
                <span>0%</span>
                <span class="text-[#F5A623] font-bold">Seuil 75%</span>
                <span>100%</span>
              </div>
              <p class="text-[10px] text-white/40 leading-relaxed">
                Un taux ≥ 75% est requis pour l'obtention automatique du certificat de fin de phase.
              </p>

              <!-- ─── Certificate Download ─── -->
              <div class="mt-1 pt-3 border-t" style="border-color: var(--bridge-border)">

                <!-- Loading -->
                <div *ngIf="certLoading" class="flex items-center gap-2 text-xs py-1"
                     style="color: var(--bridge-text-muted)">
                  <span class="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0"></span>
                  Chargement des certificats…
                </div>

                <!-- Not eligible -->
                <div *ngIf="!certLoading && attendanceStats.rate < 75"
                     class="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
                     style="background: rgba(244,63,94,0.08); border: 1px solid rgba(244,63,94,0.2)">
                  <span class="text-rose-400 text-sm flex-shrink-0 mt-0.5">🔒</span>
                  <p class="text-[11px] text-rose-400 leading-snug font-medium">
                    Atteignez 75% d'assiduité pour débloquer votre certificat blockchain.
                  </p>
                </div>

                <!-- Eligible but awaiting -->
                <div *ngIf="!certLoading && attendanceStats.rate >= 75 && certificates.length === 0"
                     class="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
                     style="background: rgba(245,166,35,0.08); border: 1px solid rgba(245,166,35,0.2)">
                  <span class="text-[#F5A623] text-sm flex-shrink-0 mt-0.5">⏳</span>
                  <p class="text-[11px] font-medium leading-snug" style="color: var(--bridge-text-muted)">
                    Vous êtes éligible ! Votre certificat est en cours d'émission.
                  </p>
                </div>

                <!-- Has certificate(s) → download buttons -->
                <div *ngIf="!certLoading && certificates.length > 0" class="space-y-2">
                  <p class="text-[10px] font-semibold uppercase tracking-wider"
                     style="color: var(--bridge-text-muted)">
                    {{ certificates.length }} certificat(s) disponible(s)
                  </p>

                  <button *ngFor="let cert of certificates"
                          (click)="downloadCertificate(cert)"
                          [disabled]="certDownloading"
                          class="w-full group relative overflow-hidden rounded-2xl
                                 flex items-center justify-between gap-3 px-4 py-3
                                 border transition-all duration-300 cursor-pointer
                                 disabled:opacity-60 disabled:cursor-wait"
                          style="background: linear-gradient(135deg, rgba(198,39,97,0.08), rgba(245,166,35,0.08));
                                 border-color: rgba(198,39,97,0.25);"
                          onmouseover="this.style.borderColor='rgba(198,39,97,0.5)'; this.style.boxShadow='0 4px 20px rgba(198,39,97,0.18)'"
                          onmouseout="this.style.borderColor='rgba(198,39,97,0.25)'; this.style.boxShadow='none'">

                    <!-- Shimmer -->
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
                                pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                    <div class="flex items-center gap-3 min-w-0 relative z-10">
                      <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm shadow-md flex-shrink-0"
                           style="background: linear-gradient(135deg, #C62761, #F5A623)">
                        <span *ngIf="!certDownloading">📄</span>
                        <span *ngIf="certDownloading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs font-bold truncate" style="color: var(--bridge-text)">
                          {{ cert.phaseTitle || 'Certificat Blockchain' }}
                        </p>
                        <p class="text-[10px] font-mono truncate" style="color: var(--bridge-text-muted)">
                          N° {{ cert.certificateNumber }}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-1 flex-shrink-0 relative z-10 text-[#C62761]">
                      <svg *ngIf="!certDownloading" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"/>
                      </svg>
                      <span class="text-[10px] font-black">PDF</span>
                    </div>

                  </button>
                </div>

              </div>
            </div>

            <!-- KPI mini-cards stacked -->
            <div class="space-y-3">
              <div class="glass-card rounded-2xl p-4 flex items-center gap-4 border-l-4 border-emerald-500">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-xl flex-shrink-0">✅</div>
                <div>
                  <p class="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Séances Présentes</p>
                  <p class="text-2xl font-mono font-black text-emerald-400">{{ attendanceStats.present }}</p>
                </div>
              </div>
              <div class="glass-card rounded-2xl p-4 flex items-center gap-4 border-l-4 border-rose-500">
                <div class="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center text-xl flex-shrink-0">❌</div>
                <div>
                  <p class="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Absences</p>
                  <p class="text-2xl font-mono font-black text-rose-400">{{ attendanceStats.absent }}</p>
                </div>
              </div>
            </div>

          </div><!-- END LEFT COLUMN -->

          <!-- ════ RIGHT COLUMN: Sessions Register ════ -->
          <div class="flex-1 min-w-0 space-y-4">

            <!-- Empty state -->
            <div *ngIf="attendances.length === 0 && !loading"
                 class="glass-card rounded-3xl p-16 text-center shadow-xl">
              <div class="text-6xl mb-4">📅</div>
              <h4 class="font-syne font-bold text-lg text-white">Aucune séance enregistrée</h4>
              <p class="text-white/40 text-sm mt-2">Vos fiches d'appel validées s'afficheront ici au fur et à mesure.</p>
            </div>

            <div *ngIf="attendances.length > 0">

              <!-- Register header -->
              <div class="flex items-center justify-between mb-3 px-1">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-sm shadow-lg">
                    📋
                  </div>
                  <div>
                    <h3 class="font-syne font-bold text-white text-base leading-tight">Registre des Séances</h3>
                    <p class="text-[10px] text-white/40 font-mono tracking-wide">{{ attendances.length }} session(s) enregistrée(s)</p>
                  </div>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span class="text-xs font-mono font-black text-emerald-400">{{ attendanceStats.present }}</span>
                  <span class="text-white/20 text-xs">/</span>
                  <span class="text-xs font-mono font-bold text-white/60">{{ attendances.length }}</span>
                </div>
              </div>

              <!-- Session cards list -->
              <div [class]="presenceExpanded ? 'space-y-2.5' : 'space-y-2.5 max-h-[620px] overflow-y-auto pr-1'"
                   style="scrollbar-width: thin; scrollbar-color: rgba(198,39,97,0.3) transparent;">
                <div *ngFor="let a of attendances; let i = index"
                     class="relative group rounded-2xl border transition-all duration-300 overflow-hidden cursor-default"
                     [class]="a.present
                       ? 'border-emerald-500/15 hover:border-emerald-500/35 hover:shadow-[0_4px_24px_rgba(16,185,129,0.1)]'
                       : 'border-rose-500/15 hover:border-rose-500/35 hover:shadow-[0_4px_24px_rgba(244,63,94,0.1)]'"
                     style="background: color-mix(in srgb, var(--bridge-card) 85%, transparent)"
                     [style.animation-delay]="(i * 35) + 'ms'">

                  <!-- Left color strip -->
                  <div class="absolute left-0 top-0 bottom-0 w-[3px]"
                       [class]="a.present ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-gradient-to-b from-rose-400 to-rose-600'"></div>

                  <div class="pl-5 pr-4 py-3.5 flex items-center justify-between gap-4">

                    <!-- Left: number + date + meta -->
                    <div class="flex items-center gap-3.5 min-w-0">
                      <!-- Session index badge -->
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 border"
                           [class]="a.present
                             ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                             : 'bg-rose-500/10 border-rose-500/20 text-rose-400'">
                        {{ i + 1 }}
                      </div>
                      <!-- Date & tags -->
                      <div class="min-w-0">
                        <p class="text-sm font-bold text-white capitalize truncate leading-tight"
                           style="color: var(--bridge-text)">
                          {{ a.sessionDate | date:'EEEE d MMMM yyyy':'':'fr' }}
                        </p>
                        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C62761]/12 text-[#C62761] border border-[#C62761]/20 leading-none">
                            {{ a.phaseTitle || 'Phase' }}
                          </span>
                          <span *ngIf="a.location" class="text-[10px] text-white/40 flex items-center gap-1">
                            📍 {{ a.location }}
                          </span>
                          <span *ngIf="a.startTime" class="text-[10px] font-mono text-white/40 flex items-center gap-1">
                            ⏰ {{ a.startTime }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Right: stars + status -->
                    <div class="flex items-center gap-3 flex-shrink-0">
                      <!-- Star rating -->
                      <div class="hidden sm:flex items-center gap-0.5" *ngIf="a.starRating">
                        <span *ngFor="let s of [1,2,3,4,5]"
                              [class]="s <= a.starRating ? 'text-[#F5A623]' : 'text-white/10'"
                              class="text-xs">★</span>
                      </div>
                      <!-- Status pill -->
                      <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border"
                           [class]="a.present
                             ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                             : 'bg-rose-500/10 text-rose-400 border-rose-500/20'">
                        <span class="w-1.5 h-1.5 rounded-full"
                              [class]="a.present ? 'bg-emerald-400' : 'bg-rose-400'"></span>
                        {{ a.present ? 'Présent' : 'Absent' }}
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <!-- Expand / Collapse toggle -->
              <div *ngIf="attendances.length > 7" class="flex justify-center pt-2">
                <button (click)="presenceExpanded = !presenceExpanded"
                        class="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold border transition-all duration-200
                               border-white/10 text-white/50 hover:text-white hover:bg-[#C62761]/15 hover:border-[#C62761]/30"
                        style="background: color-mix(in srgb, var(--bridge-card) 60%, transparent)">
                  <span class="transition-transform duration-300" [class]="presenceExpanded ? 'rotate-180' : ''">▼</span>
                  {{ presenceExpanded ? 'Réduire le registre' : 'Voir toutes les séances (' + attendances.length + ')' }}
                </button>
              </div>

            </div>
          </div><!-- END RIGHT COLUMN -->

        </div>

      </div>

      <!-- ═══ TAB 3: PROGRESSION ═══ -->
      <div *ngIf="activeTab === 'progression'" class="space-y-6">

        <!-- Empty State -->
        <div *ngIf="progressions.length === 0 && !loading"
             class="glass-card border border-white/10 p-16 text-center rounded-3xl">
          <div class="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mx-auto mb-4">
            📈
          </div>
          <h3 class="font-syne font-bold text-xl text-white">Aucune donnée de progression</h3>
          <p class="text-white/40 text-sm mt-2 max-w-md mx-auto">
            L'avancement dans votre cursus apparaîtra automatiquement dès la validation des premières étapes.
          </p>
        </div>

        <!-- Interactive Timeline Cards -->
        <div class="space-y-6">
          <div *ngFor="let prog of progressions; let i = index; let last = last"
               class="relative pl-0 sm:pl-8"
               [style.animation-delay]="(i * 80) + 'ms'"
               style="animation: fadeSlideIn 0.4s ease both">

            <!-- Vertical Timeline Line (Desktop) -->
            <div *ngIf="!last" class="hidden sm:block absolute left-[15px] top-[48px] w-0.5 h-[calc(100%+24px)] bg-gradient-to-b from-[#C62761] to-white/10 z-0"></div>

            <!-- Timeline Bullet (Desktop) -->
            <div class="hidden sm:flex absolute left-0 top-[20px] w-8 h-8 rounded-full border-2 items-center justify-center z-10 bg-[#0E0E24] shadow-lg"
                 [class]="prog.pedagogicalValidated ? 'border-emerald-400 text-emerald-400 shadow-emerald-500/20' : 'border-white/20 text-white/40'">
              <span class="text-xs">{{ prog.pedagogicalValidated ? '✓' : (i + 1) }}</span>
            </div>

            <div class="glass-card border rounded-3xl overflow-hidden transition-all duration-300 hover:border-[#C62761]/40 shadow-xl relative"
                 [class]="prog.pedagogicalValidated ? 'border-emerald-500/30' : 'border-white/10'">

              <div class="p-6 sm:p-8 space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                  <div>
                    <span class="text-xs font-mono font-semibold text-[#F5A623] tracking-wide uppercase">
                      {{ prog.formationTitle }}
                    </span>
                    <h3 class="font-syne font-bold text-xl text-white mt-1">
                      {{ prog.phaseTitle }}
                    </h3>
                  </div>

                  <span class="px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider self-start sm:self-center shadow-sm"
                        [class]="prog.pedagogicalValidated
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/30'">
                    {{ prog.pedagogicalValidated ? '✅ Phase Validée' : '⏳ En Cours' }}
                  </span>
                </div>

                <!-- 3 Steps Grid Status -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

                  <!-- Step 1: Payment -->
                  <div class="p-4 rounded-2xl border transition-all flex items-center gap-4"
                       [class]="prog.paymentValidated ? 'bg-emerald-500/[0.06] border-emerald-500/20' : 'bg-white/[0.02] border-white/5'">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                         [class]="prog.paymentValidated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30'">
                      {{ prog.paymentValidated ? '💳' : '⏳' }}
                    </div>
                    <div>
                      <p class="text-[10px] uppercase tracking-wider text-white/40 font-bold">Étape 1</p>
                      <p class="text-xs font-bold mt-0.5" [class]="prog.paymentValidated ? 'text-emerald-400' : 'text-white/60'">
                        {{ prog.paymentValidated ? 'Paiement Réglé' : 'Paiement En Attente' }}
                      </p>
                    </div>
                  </div>

                  <!-- Step 2: Pedagogical Validation -->
                  <div class="p-4 rounded-2xl border transition-all flex items-center gap-4"
                       [class]="prog.pedagogicalValidated ? 'bg-emerald-500/[0.06] border-emerald-500/20' : 'bg-white/[0.02] border-white/5'">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                         [class]="prog.pedagogicalValidated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30'">
                      {{ prog.pedagogicalValidated ? '🎓' : '⏳' }}
                    </div>
                    <div>
                      <p class="text-[10px] uppercase tracking-wider text-white/40 font-bold">Étape 2</p>
                      <p class="text-xs font-bold mt-0.5" [class]="prog.pedagogicalValidated ? 'text-emerald-400' : 'text-white/60'">
                        {{ prog.pedagogicalValidated ? 'Assiduité Acquise' : 'En Évaluation' }}
                      </p>
                    </div>
                  </div>

                  <!-- Step 3: Unlocked / Certificate -->
                  <div class="p-4 rounded-2xl border transition-all flex items-center gap-4"
                       [class]="prog.unlocked ? 'bg-[#C62761]/[0.08] border-[#C62761]/30' : 'bg-white/[0.02] border-white/5'">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                         [class]="prog.unlocked ? 'bg-[#C62761]/20 text-[#C62761]' : 'bg-white/5 text-white/30'">
                      {{ prog.unlocked ? '🔓' : '🔒' }}
                    </div>
                    <div>
                      <p class="text-[10px] uppercase tracking-wider text-white/40 font-bold">Étape 3</p>
                      <p class="text-xs font-bold mt-0.5" [class]="prog.unlocked ? 'text-[#C62761]' : 'text-white/60'">
                        {{ prog.unlocked ? 'Accès Débloqué' : 'Étape Verrouillée' }}
                      </p>
                    </div>
                  </div>

                </div>

                <!-- Footer info date -->
                <div *ngIf="prog.validationDate" class="pt-2 text-xs text-white/40 flex items-center gap-2 font-mono">
                  <span>✨</span>
                  <span>Phase officiellement validée le {{ prog.validationDate | date:'dd MMMM yyyy':'':'fr' }}</span>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>

    </div>


    <style>
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  `
})
export class StagiaireHistoriqueComponent implements OnInit {
  activeTab = 'evals';
  loading = false;
  evaluations: any[] = [];
  attendances: any[] = [];
  progressions: any[] = [];
  certificates: any[] = [];
  certLoading = false;
  certDownloading = false;
  presenceExpanded = false;
  attendanceStats = { present: 0, absent: 0, rate: 0 };

  get tabs() {
    return [
      { key: 'evals', icon: '⭐', label: 'Évaluations', count: this.evaluations.length },
      { key: 'presence', icon: '📅', label: 'Présences', count: this.attendances.length },
      { key: 'progression', icon: '📈', label: 'Progression', count: this.progressions.length },
    ];
  }

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.http.get<any[]>('http://localhost:8080/api/evaluations/my').subscribe({
      next: (evals) => {
        this.evaluations = evals;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.http.get<any>('http://localhost:8080/api/attendance/my').subscribe({
      next: (data) => {
        this.attendances = data.attendances || data || [];
        const total = this.attendances.length;
        const present = this.attendances.filter((a: any) => a.present).length;
        this.attendanceStats = {
          present,
          absent: total - present,
          rate: total ? Math.round((present / total) * 100) : 0
        };
      },
      error: () => {}
    });

    this.http.get<any[]>('http://localhost:8080/api/progressions/my').subscribe({
      next: (data) => { this.progressions = data; },
      error: () => {}
    });

    if (user.id) {
      this.certLoading = true;
      this.http.get<any[]>(`http://localhost:8080/api/certificates/student/${user.id}`).subscribe({
        next: (data) => { this.certificates = data || []; this.certLoading = false; },
        error: () => { this.certLoading = false; }
      });
    }
  }

  getStars(grade: number): boolean[] {
    const stars = Math.round((grade / 20) * 5);
    return [1,2,3,4,5].map(s => s <= stars);
  }

  getStarCount(grade: number): number {
    return Math.round((grade / 20) * 5);
  }

  getGradeBarClass(grade: number): string {
    if (grade >= 16) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    if (grade >= 14) return 'bg-gradient-to-r from-blue-500 to-blue-400';
    if (grade >= 12) return 'bg-gradient-to-r from-yellow-500 to-yellow-400';
    return 'bg-gradient-to-r from-red-500 to-orange-500';
  }

  getGradeCircleClass(grade: number): string {
    if (grade >= 16) return 'border-emerald-500/60 text-emerald-400 bg-emerald-500/10';
    if (grade >= 14) return 'border-blue-500/60 text-blue-400 bg-blue-500/10';
    if (grade >= 12) return 'border-yellow-500/60 text-yellow-400 bg-yellow-500/10';
    return 'border-red-500/60 text-red-400 bg-red-500/10';
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
    if (grade >= 10) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/10 text-red-400 border-red-500/30';
  }

  getGradeTextColor(grade: number): string {
    if (grade >= 16) return 'text-emerald-400';
    if (grade >= 14) return 'text-blue-400';
    if (grade >= 12) return 'text-yellow-400';
    if (grade >= 10) return 'text-orange-400';
    return 'text-red-400';
  }

  downloadCertificate(cert: any): void {
    if (this.certDownloading) return;
    this.certDownloading = true;
    this.http.get(
      `http://localhost:8080/api/certificates/download/${cert.certificateNumber}`,
      { responseType: 'blob' }
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a  = document.createElement('a');
        a.href = url;
        a.download = `certificat-${cert.certificateNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.certDownloading = false;
      },
      error: () => { this.certDownloading = false; }
    });
  }
}
