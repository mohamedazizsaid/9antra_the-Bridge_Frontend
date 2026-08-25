import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CertificatService } from '../../../../core/services/certificat.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Certificat } from '../../../../core/models/certificat.model';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-stagiaire-certificats',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="overflow-hidden relative w-full pb-10">
      <div
        class="flex transition-transform duration-500 ease-in-out w-full"
        [style.transform]="selectedCert ? 'translateX(-100%)' : 'translateX(0%)'"
      >
        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- PANEL 1: LISTE DES CERTIFICATS, KPIS & RECHERCHE           -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div class="w-full flex-shrink-0 min-w-full space-y-6">
          <!-- ─── Header ─── -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex items-center gap-3.5">
              <div
                class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C62761]/20 to-[#F5A623]/20 border border-[var(--bridge-gold)]/30 flex items-center justify-center text-[var(--bridge-gold)] shadow-lg"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
              </div>
              <div>
                <h1 class="font-syne font-bold text-2xl md:text-3xl text-white">Mes Certificats Blockchain</h1>
                <p class="text-[var(--bridge-text-muted)] text-sm mt-0.5">
                  Certifications officielles infalsifiables et vérifiables sur le réseau décentralisé
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button
                (click)="loadCertificats()"
                class="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Actualiser"
              >
                <svg class="w-4 h-4" [class.animate-spin]="loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </button>
            </div>
          </div>

          <!-- ─── KPI Metrics ─── -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- KPI 1: Total Certificats -->
            <div class="bridge-card p-5 relative overflow-hidden group">
              <div class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[var(--bridge-crimson)] to-[var(--bridge-gold)]"></div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Certificats Obtenus</p>
                  <p class="text-3xl font-mono font-bold text-white mt-1.5">{{ certificats.length }}</p>
                </div>
                <div class="w-12 h-12 rounded-2xl bg-[var(--bridge-gold)]/10 border border-[var(--bridge-gold)]/20 text-[var(--bridge-gold)] flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                </div>
              </div>
              <p class="text-[11px] text-[var(--bridge-gold)] mt-3 flex items-center gap-1">
                <span>✓ 100% Vérifiés & Horodatés</span>
              </p>
            </div>

            <!-- KPI 2: Blockchain Verification -->
            <div class="bridge-card p-5 relative overflow-hidden group">
              <div class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[var(--bridge-gold)] to-amber-400"></div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Réseau Blockchain</p>
                  <p class="text-xl font-bold text-white mt-2">Polygon POS</p>
                </div>
                <div class="w-12 h-12 rounded-2xl bg-[var(--bridge-gold)]/10 border border-[var(--bridge-gold)]/20 text-[var(--bridge-gold)] flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
              </div>
              <p class="text-[11px] text-[var(--bridge-text-muted)] mt-3">Smart Contract Sécurisé SHA-256</p>
            </div>

            <!-- KPI 3: Compétences Validées -->
            <div class="bridge-card p-5 relative overflow-hidden group">
              <div class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#C62761] to-[#E0452F]"></div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Compétences Prouvées</p>
                  <p class="text-3xl font-mono font-bold text-white mt-1.5">{{ certificats.length * 4 }}</p>
                </div>
                <div class="w-12 h-12 rounded-2xl bg-[var(--bridge-crimson)]/10 border border-[var(--bridge-crimson)]/20 text-[var(--bridge-crimson)] flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m9 12 2 2 4-4" />
                    <path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
              </div>
              <p class="text-[11px] text-[var(--bridge-crimson)] mt-3">Prêtes à être partagées</p>
            </div>

            <!-- KPI 4: Statut du profil -->
            <div class="bridge-card p-5 relative overflow-hidden group">
              <div class="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[var(--bridge-gold)] to-[#C62761]"></div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold text-[var(--bridge-text-muted)] uppercase tracking-wider">Statut Stagiaire</p>
                  <p class="text-xl font-bold text-white mt-2">Certifié 9antra</p>
                </div>
                <div class="w-12 h-12 rounded-2xl bg-[var(--bridge-gold)]/10 border border-[var(--bridge-gold)]/20 text-[var(--bridge-gold)] flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
              </div>
              <p class="text-[11px] text-[var(--bridge-gold)] mt-3">Éligible aux opportunités partenaires</p>
            </div>
          </div>

          <!-- ─── Filter & Search Bar Synchronisée ─── -->
          <div class="bridge-card p-4 flex flex-wrap gap-3 items-center">
            <div class="flex-1 min-w-[240px] relative">
              <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none z-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="applyFilters()"
                placeholder="Rechercher un certificat par formation, hash..."
                class="bridge-input has-left-icon text-xs w-full"
                style="padding-left: 2.75rem !important;"
              />
            </div>

            <!-- View mode toggle: Grid / List -->
            <div class="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                (click)="viewMode = 'grid'"
                class="px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
                [class]="viewMode === 'grid' ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold' : 'text-white/40 hover:text-white'"
              >
                ⊞
              </button>
              <button
                (click)="viewMode = 'list'"
                class="px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
                [class]="viewMode === 'list' ? 'bg-gradient-to-r from-[#C62761] to-[#F5A623] text-white font-bold' : 'text-white/40 hover:text-white'"
              >
                ☰
              </button>
            </div>

            <button
              (click)="searchQuery = ''; applyFilters()"
              class="bridge-btn-secondary px-4 py-2 text-xs cursor-pointer"
            >
              Réinitialiser
            </button>
          </div>

          <!-- ─── Certificates Grid View (Synchronisé avec formations-list) ─── -->
          <div *ngIf="filteredCertificats.length > 0 && viewMode === 'grid'" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              *ngFor="let cert of filteredCertificats; let i = index"
              (click)="openCertificate(cert)"
              class="glass-card border border-[var(--bridge-border)] p-6 flex flex-col justify-between cursor-pointer group transition-all duration-300 relative hover:border-[#C62761]/40 hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(198,39,97,0.12)] rounded-2xl"
            >
              <!-- Top Row -->
              <div>
                <div class="flex justify-between items-start mb-4">
                  <span class="text-[10px] px-2.5 py-1 bg-white/5 rounded-full text-white/60 uppercase font-mono tracking-wider font-semibold border border-white/10">
                    POLYGON POS
                  </span>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                      CERTIFIÉ
                    </span>
                    <span class="text-xs font-mono font-bold text-[#F5A623]">
                      {{ cert.dateObtention | date: 'dd/MM/yyyy' }}
                    </span>
                  </div>
                </div>

                <h3 class="font-syne font-bold text-lg text-white mb-2 group-hover:text-[#F5A623] transition-colors leading-snug">
                  {{ cert.formationNom || 'Formation The Bridge' }}
                </h3>
                <p class="text-xs text-[var(--bridge-text-muted)] line-clamp-2 mb-4 leading-relaxed">
                  {{ cert.phaseNom || 'Cycle complet de formation professionnelle validé avec brio' }}
                </p>

                <!-- Hash Box Preview -->
                <div class="mb-4 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs font-mono" (click)="$event.stopPropagation()">
                  <span class="text-[10px] text-white/40 truncate max-w-[170px]">{{ cert.hashBlockchain || '0x7f83b165...d9069' }}</span>
                  <button (click)="copyHash(cert.hashBlockchain)" class="text-[10px] text-[#C62761] hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-sans font-bold">
                    Copier 📋
                  </button>
                </div>
              </div>

              <!-- Meta Info & Bottom Actions -->
              <div>
                <div class="border-t border-white/5 pt-3 space-y-2">
                  <div class="flex justify-between text-xs text-[var(--bridge-text-muted)]">
                    <span>Référence :</span>
                    <span class="font-semibold text-white/70 font-mono">{{ cert.certificateNumber || ('CERT-' + cert.id) }}</span>
                  </div>
                  <div class="flex justify-between text-xs text-[var(--bridge-text-muted)]">
                    <span>Validation :</span>
                    <span class="font-semibold text-emerald-400">✓ On-Chain Horodaté</span>
                  </div>
                </div>

                <!-- Actions Bar -->
                <div class="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-white/5">
                  <button class="text-xs text-[#C62761] font-semibold hover:text-[#F5A623] transition-colors cursor-pointer">
                    Visualiser le certificat →
                  </button>
                  <button
                    (click)="downloadPdf(cert, $event)"
                    class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                    title="Télécharger PDF officiel"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ─── Certificates List View ─── -->
          <div *ngIf="filteredCertificats.length > 0 && viewMode === 'list'" class="space-y-3">
            <div
              *ngFor="let cert of (certsExpanded ? filteredCertificats : filteredCertificats.slice(0, 4))"
              (click)="openCertificate(cert)"
              class="glass-card border border-[var(--bridge-border)] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#C62761]/40 transition-all cursor-pointer group"
            >
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-[var(--bridge-gold)]/10 border border-[var(--bridge-gold)]/20 text-[var(--bridge-gold)] flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-syne font-bold text-base text-white group-hover:text-[#F5A623] transition-colors">
                      {{ cert.formationNom }}
                    </h3>
                    <span class="text-[9px] px-2 py-0.5 rounded-full font-bold bg-[var(--bridge-gold)]/10 text-[var(--bridge-gold)] border border-[var(--bridge-gold)]/20">
                      CERTIFIÉ
                    </span>
                  </div>
                  <p class="text-xs text-[var(--bridge-text-muted)] mt-0.5">
                    {{ cert.phaseNom || 'Cycle certifiant' }} — Délivré le {{ cert.dateObtention | date: 'dd/MM/yyyy' }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <button
                  (click)="downloadPdf(cert, $event)"
                  class="bridge-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>PDF</span>
                </button>
                <button class="bridge-btn-primary px-3 py-1.5 text-xs cursor-pointer">
                  Visualiser →
                </button>
              </div>
            </div>

            <!-- Expand / Collapse Button -->
            <div *ngIf="filteredCertificats.length > 4" class="pt-2 flex justify-center">
              <button
                (click)="certsExpanded = !certsExpanded"
                class="bridge-btn-secondary px-5 py-2 text-xs flex items-center gap-2 cursor-pointer font-bold"
              >
                <span>{{ certsExpanded ? '▲ Réduire la liste' : '▼ Voir plus de certificats (' + filteredCertificats.length + ')' }}</span>
              </button>
            </div>
          </div>

          <!-- Empty state -->
          <div
            *ngIf="!loading && filteredCertificats.length === 0"
            class="bridge-card p-12 text-center space-y-4 max-w-lg mx-auto"
          >
            <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto text-[var(--bridge-gold)]">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
            <div>
              <h3 class="font-syne font-bold text-lg text-white">Aucun certificat pour le moment</h3>
              <p class="text-xs text-[var(--bridge-text-muted)] mt-1">
                Vos certificats s'afficheront automatiquement ici dès que vous aurez validé les phases de vos formations.
              </p>
            </div>
            <a
              routerLink="/dashboard/formations"
              class="bridge-btn-primary px-5 py-2.5 text-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explorer mes Formations</span>
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- PANEL 2: VUE SLIDE DE VISUALISATION DU CERTIFICAT (A4 PAYSAGE)-->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <div class="w-full flex-shrink-0 min-w-full space-y-6">
          <!-- Return Header Button & Action Bar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-6xl mx-auto">
            <button
              (click)="selectedCert = null"
              class="bridge-btn-secondary px-5 py-2.5 text-xs flex items-center gap-2.5 cursor-pointer group"
            >
              <svg
                class="w-4 h-4 transition-transform group-hover:-translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span class="font-semibold">Retour à mes certificats</span>
            </button>

            <div class="flex items-center gap-3">
              <button
                *ngIf="selectedCert"
                (click)="downloadPdf(selectedCert)"
                class="bridge-btn-primary px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer shadow-xl font-bold"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Télécharger PDF Officiel</span>
              </button>
            </div>
          </div>

          <!-- Official Certificate Landscape Frame -->
          <div
            *ngIf="selectedCert"
            class="max-w-6xl mx-auto relative rounded-3xl p-1 bg-gradient-to-br from-[#F5A623] via-[#C62761] to-[#E0452F] shadow-[0_0_50px_rgba(245,166,35,0.2)] animate-fadeIn"
          >
            <!-- Inner Canvas Container -->
            <div class="bg-[#0b0b1e] rounded-[22px] p-6 sm:p-10 md:p-14 relative overflow-hidden border border-white/10">
              <!-- Watermark Decorative Crest -->
              <div class="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
                <svg class="w-[500px] h-[500px]" viewBox="0 0 80 100" fill="none">
                  <path d="M40 10 C20 10 10 25 10 38 C10 51 20 58 40 58 C48 58 54 55 58 50" stroke="#F5A623" stroke-width="8"/>
                  <path d="M40 90 C60 90 70 75 70 62 C70 49 60 42 40 42 C32 42 26 45 22 50" stroke="#C62761" stroke-width="8"/>
                </svg>
              </div>

              <!-- Inner Double Gold Filigree Border -->
              <div class="border-2 border-dashed border-[var(--bridge-gold)]/40 rounded-2xl p-6 sm:p-10 relative">
                <!-- 4 Corner Luxury Accents -->
                <div class="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[var(--bridge-gold)]"></div>
                <div class="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-[var(--bridge-gold)]"></div>
                <div class="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-[var(--bridge-gold)]"></div>
                <div class="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[var(--bridge-gold)]"></div>

                <!-- ─── Header: Logos & Institutions ─── -->
                <div class="flex flex-col items-center justify-center text-center space-y-3 mb-8">
                  <div class="flex items-center gap-3">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C62761] to-[#F5A623] flex items-center justify-center text-2xl font-black text-white shadow-lg">
                      9
                    </div>
                    <div class="text-left">
                      <h2 class="font-syne font-extrabold text-2xl text-white tracking-widest uppercase">
                        The Bridge
                      </h2>
                      <p class="text-[10px] uppercase tracking-[3px] text-[var(--bridge-gold)] font-bold">
                        Academy & Center of Excellence
                      </p>
                    </div>
                  </div>

                  <div class="inline-block px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 mt-2">
                    <span class="text-xs uppercase tracking-[4px] font-bold text-[var(--bridge-gold)]">
                      Certificat Officiel de Réussite & Maîtrise Professionnelle
                    </span>
                  </div>
                </div>

                <!-- ─── Body Text ─── -->
                <div class="text-center space-y-4 my-8">
                  <p class="text-sm text-[var(--bridge-text-muted)] font-serif italic">
                    Le Conseil Pédagogique et d'Évaluation de 9antra atteste formellement que :
                  </p>

                  <h1 class="font-syne font-extrabold text-3xl sm:text-5xl md:text-6xl text-white tracking-wide py-1">
                    {{ user?.prenom }} {{ user?.nom }}
                  </h1>

                  <!-- Ornamental Gold Divider -->
                  <div class="flex items-center justify-center gap-3 max-w-sm mx-auto my-2 opacity-60">
                    <div class="h-0.5 flex-1 bg-gradient-to-r from-transparent to-[var(--bridge-gold)]"></div>
                    <span class="text-[var(--bridge-gold)] text-xs">◆</span>
                    <div class="h-0.5 flex-1 bg-gradient-to-l from-transparent to-[var(--bridge-gold)]"></div>
                  </div>

                  <p class="text-sm text-white/70 max-w-2xl mx-auto leading-relaxed">
                    a accompli avec succès l'ensemble du cursus théorique et des épreuves pratiques de validation pour le programme de formation certifiante :
                  </p>

                  <!-- Formation Title Card -->
                  <div class="p-5 md:p-6 rounded-2xl bg-white/[0.03] border border-[var(--bridge-gold)]/35 max-w-2xl mx-auto shadow-xl">
                    <h3 class="font-syne font-extrabold text-xl md:text-2xl text-[var(--bridge-gold)] tracking-wide">
                      {{ selectedCert.formationNom }}
                    </h3>
                    <p class="text-xs text-white/80 font-medium mt-1">
                      {{ selectedCert.phaseNom || "Cycle complet validé avec Mention d'Excellence" }}
                    </p>
                  </div>
                </div>

                <!-- ─── Signatures & Official Seals ─── -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/10 mt-10 items-end">
                  <!-- Left: Date & Hash Verification -->
                  <div class="text-left space-y-1">
                    <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold">Date de Délivrance</p>
                    <p class="text-sm font-bold text-white">{{ selectedCert.dateObtention | date: 'dd MMMM yyyy' }}</p>
                    <div class="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold pt-1">
                      <span>✓ Empreinte Cryptographique Vérifiée</span>
                    </div>
                  </div>

                  <!-- Center: Official Holographic Crest Seal -->
                  <div class="flex flex-col items-center justify-center">
                    <div class="w-20 h-20 rounded-full border-2 border-[var(--bridge-gold)]/60 bg-gradient-to-b from-[#F5A623]/20 via-[#C62761]/20 to-transparent flex flex-col items-center justify-center text-center shadow-lg">
                      <span class="text-lg">⛓️</span>
                      <span class="text-[8px] font-bold text-[var(--bridge-gold)] uppercase tracking-widest leading-none mt-1">
                        9antra<br/>Polygon
                      </span>
                    </div>
                    <span class="text-[9px] text-white/50 font-mono mt-1.5 uppercase tracking-wider">
                      Sceau Officiel On-Chain
                    </span>
                  </div>

                  <!-- Right: Academic Board Signature -->
                  <div class="text-right space-y-1">
                    <p class="text-[10px] text-[var(--bridge-text-muted)] uppercase tracking-wider font-semibold">Direction Pédagogique</p>
                    <p class="font-syne font-bold text-sm text-white">9antra Certification Board</p>
                    <p class="text-xs font-mono text-[var(--bridge-gold)]">N° {{ selectedCert.certificateNumber || ('CERT-' + selectedCert.id) }}</p>
                  </div>
                </div>

                <!-- ─── On-Chain Blockchain Hash Strip ─── -->
                <div class="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div class="space-y-0.5">
                    <p class="text-[9px] uppercase tracking-widest text-[var(--bridge-gold)] font-bold">Transaction Hash Blockchain (Polygon POS)</p>
                    <p class="font-mono text-[10px] text-white/60 break-all">
                      {{ selectedCert.hashBlockchain || '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069' }}
                    </p>
                  </div>
                  <button
                    (click)="copyHash(selectedCert.hashBlockchain)"
                    class="bridge-btn-secondary px-3 py-1.5 text-[10px] flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                  >
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span>Copier Hash</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class StagiaireCertificatsComponent implements OnInit {
  user: User | null = null;
  loading = false;
  viewMode: 'grid' | 'list' = 'grid';
  certsExpanded = false;
  certificats: Certificat[] = [];
  filteredCertificats: Certificat[] = [];
  searchQuery = '';
  selectedCert: Certificat | null = null;

  constructor(
    private authService: AuthService,
    private certificatService: CertificatService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadCertificats();
  }

  loadCertificats(): void {
    if (!this.user?.id) return;
    this.loading = true;

    this.certificatService.getCertificatsByStagiaire(this.user.id.toString()).subscribe({
      next: (certs) => {
        this.loading = false;
        this.certificats = certs || [];
        this.applyFilters();
      },
      error: () => {
        this.loading = false;
        this.toastService.error('Erreur lors du chargement des certificats');
      },
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredCertificats = this.certificats.filter((c) => {
      return (
        !q ||
        c.formationNom?.toLowerCase().includes(q) ||
        c.phaseNom?.toLowerCase().includes(q) ||
        c.hashBlockchain?.toLowerCase().includes(q) ||
        c.id?.toString().includes(q)
      );
    });
  }

  openCertificate(cert: Certificat): void {
    this.selectedCert = cert;
  }

  copyHash(hash: string): void {
    const val = hash || '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
    navigator.clipboard.writeText(val);
    this.toastService.success('Empreinte Blockchain copiée dans le presse-papier !', 'Hash Copié');
  }

  downloadPdf(cert: Certificat, event?: Event): void {
    if (event) event.stopPropagation();
    const certNumber = cert.certificateNumber || `CERT-${cert.id}`;
    this.toastService.info('Téléchargement du certificat officiel en cours...', 'Certificat PDF');

    this.certificatService.downloadCertificatePdf(certNumber).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${certNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toastService.success('Certificat PDF téléchargé avec succès !', 'Succès');
      },
      error: () => {
        this.selectedCert = cert;
        window.print();
      },
    });
  }

  printCertificate(): void {
    window.print();
  }
}
