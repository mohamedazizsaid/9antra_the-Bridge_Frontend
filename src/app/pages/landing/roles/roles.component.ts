import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, RevealDirective],
  template: `
    <section class="roles-section" appReveal>
      <div class="section-header">
        <span class="section-label">POUR TOUS LES ACTEURS</span>
        <h2 class="section-title">Une expérience pour chacun</h2>
        <p class="section-subtitle">
          Chaque utilisateur bénéficie d'un espace adapté à ses besoins
        </p>
      </div>

      <!-- Tabs Navigation -->
      <div class="role-tabs">
        <button
          *ngFor="let role of roles; let i = index"
          class="role-tab"
          [class.active]="activeTab === i"
          (click)="selectTab(i)"
          [style.--tab-color]="role.color"
        >
          <span class="tab-icon">
            <!-- Formateur Icon -->
            <svg
              *ngIf="role.id === 'formateur'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4M7 8h5M7 12h9" />
            </svg>

            <!-- Stagiaire Icon -->
            <svg
              *ngIf="role.id === 'stagiaire'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </span>
          <span>{{ role.name }}</span>
        </button>
      </div>

      <!-- Sliding Cards Container -->
      <div class="role-slider-wrapper">
        <div class="role-slider-track" [style.transform]="'translateX(' + -activeTab * 100 + '%)'">
          <div *ngFor="let role of roles; let i = index" class="role-slide">
            <div class="role-card">
              <div
                class="role-glow"
                [style.background]="
                  'radial-gradient(ellipse at top right, ' + role.color + '22 0%, transparent 70%)'
                "
              ></div>
              <div class="role-header">
                <span class="role-badge-icon" [style.color]="role.color">
                  <svg
                    *ngIf="role.id === 'formateur'"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4M7 8h5M7 12h9" />
                  </svg>

                  <svg
                    *ngIf="role.id === 'stagiaire'"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </span>
                <h3 class="role-card-title" [style.color]="role.color">
                  {{ role.name }}
                </h3>
              </div>
              <p class="role-card-desc">{{ role.description }}</p>

              <ul class="role-capabilities">
                <li *ngFor="let cap of role.capabilities" class="capability-item">
                  <span class="cap-check" [style.color]="role.color">
                    <svg
                      viewBox="0 0 16 16"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M3.5 8.5l3 3 6-6" />
                    </svg>
                  </span>
                  <span>{{ cap }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .roles-section {
        padding: 120px 24px;
        max-width: 1280px;
        margin: 0 auto;
      }

      .section-header {
        text-align: center;
        margin-bottom: 48px;
      }

      .section-label {
        font-family: 'Space Mono', monospace;
        font-size: 12px;
        font-weight: 700;
        color: #c62761;
        letter-spacing: 3px;
        text-transform: uppercase;
        display: block;
        margin-bottom: 16px;
      }

      .section-title {
        font-family: 'Syne', sans-serif;
        font-weight: 800;
        font-size: 48px;
        color: var(--bridge-text);
        margin-bottom: 12px;
      }

      .section-subtitle {
        font-family: 'Inter', sans-serif;
        font-size: 18px;
        color: var(--bridge-text-muted);
      }

      .role-tabs {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-bottom: 40px;
      }

      .role-tab {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 12px 28px;
        font-family: 'Syne', sans-serif;
        font-weight: 600;
        font-size: 15px;
        color: var(--bridge-text-muted);
        background: color-mix(in srgb, var(--bridge-surface) 80%, transparent);
        border: 1px solid color-mix(in srgb, var(--bridge-border) 60%, transparent);
        border-radius: 12px;
        cursor: pointer;
        transition:
          all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
          transform 200ms ease;
      }

      .tab-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
      }

      .tab-icon svg {
        width: 18px;
        height: 18px;
      }

      .role-tab:hover {
        background: color-mix(in srgb, var(--bridge-surface) 95%, transparent);
        color: var(--bridge-text);
        transform: translateY(-2px);
      }

      .role-tab.active {
        background: color-mix(in srgb, var(--tab-color, var(--bridge-crimson)) 15%, transparent);
        border-color: color-mix(in srgb, var(--tab-color, var(--bridge-crimson)) 50%, transparent);
        color: var(--bridge-text);
      }

      /* Sliding Track */
      .role-slider-wrapper {
        max-width: 720px;
        margin: 0 auto;
        overflow: hidden;
        padding: 4px 0;
      }

      .role-slider-track {
        display: flex;
        width: 100%;
        transition: transform 450ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        will-change: transform;
      }

      .role-slide {
        flex: 0 0 100%;
        min-width: 100%;
        box-sizing: border-box;
        padding: 0 10px;
      }

      .role-card {
        position: relative;
        background: color-mix(in srgb, var(--bridge-card) 75%, transparent);
        backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid color-mix(in srgb, var(--bridge-border) 70%, transparent);
        border-radius: 20px;
        padding: 48px 40px;
        overflow: hidden;
        height: 100%;
        box-sizing: border-box;
      }

      .role-glow {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .role-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        position: relative;
      }

      .role-badge-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .role-badge-icon svg {
        width: 28px;
        height: 28px;
      }

      .role-card-title {
        font-family: 'Syne', sans-serif;
        font-weight: 700;
        font-size: 28px;
        color: var(--bridge-text);
        margin: 0;
      }

      .role-card-desc {
        font-size: 15px;
        color: var(--bridge-text-muted);
        line-height: 1.7;
        margin-bottom: 28px;
        position: relative;
      }

      .role-capabilities {
        list-style: none;
        padding: 0;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        position: relative;
      }

      .capability-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: var(--bridge-text);
      }

      .cap-check {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.05);
        flex-shrink: 0;
      }

      @media (max-width: 640px) {
        .role-tabs {
          flex-direction: column;
          align-items: center;
        }
        .role-capabilities {
          grid-template-columns: 1fr;
        }
        .section-title {
          font-size: 32px;
        }
        .role-card {
          padding: 32px 24px;
        }
      }
    `,
  ],
})
export class RolesComponent {
  activeTab = 0;

  roles = [
    {
      id: 'formateur',
      name: 'Formateur',
      color: '#F5A623',
      description:
        'Gérez vos formations, suivez la progression des stagiaires et évaluez leurs compétences.',
      capabilities: [
        'Suivi de mes formations',
        'Prise de présence',
        'Évaluation des stagiaires',
        'Planification des séances',
        'Messagerie intégrée',
        'Statistiques de groupe',
        "Envoi d'annonces",
        'Calendrier interactif',
      ],
    },
    {
      id: 'stagiaire',
      name: 'Stagiaire',
      color: '#C62761',
      description:
        'Suivez votre progression, gérez vos paiements et téléchargez vos certifications blockchain.',
      capabilities: [
        'Tableau de bord personnel',
        'Suivi de progression',
        'Historique de présence',
        'Gestion des paiements',
        'Certificats blockchain',
        'Calendrier des séances',
        'Notifications en temps réel',
        'Profil personnalisable',
      ],
    },
  ];

  selectTab(index: number): void {
    this.activeTab = index;
  }
}
