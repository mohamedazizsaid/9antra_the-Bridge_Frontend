import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, RevealDirective],
  template: `
    <section class="features-section">
      <div class="section-header" appReveal>
        <span class="section-label">FONCTIONNALITÉS</span>
        <h2 class="section-title">Tout ce dont vous avez besoin</h2>
        <p class="section-subtitle">Une plateforme unique, trois expériences sur mesure</p>
      </div>

      <div class="features-grid">
        <div
          class="feature-card"
          *ngFor="let f of features; let i = index"
          appReveal
          [revealDelay]="i * 80"
          [style.--accent]="f.accentColor"
        >
          <div class="feature-accent" [style.background]="f.accentColor"></div>
          <div class="feature-icon-wrapper">
            <svg
              class="feature-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <!-- Shield / Auth -->
              <ng-container *ngIf="f.iconType === 'auth'">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M10 10a2 2 0 1 1 4 0v2h-4v-2z" />
                <rect x="9" y="12" width="6" height="4" rx="1" />
              </ng-container>

              <!-- Formations / Book -->
              <ng-container *ngIf="f.iconType === 'formation'">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <line x1="9" y1="7" x2="16" y2="7" />
                <line x1="9" y1="11" x2="14" y2="11" />
              </ng-container>

              <!-- Payments / Card -->
              <ng-container *ngIf="f.iconType === 'payment'">
                <rect x="2" y="5" width="20" height="14" rx="3" />
                <line x1="2" y1="10" x2="22" y2="10" />
                <line x1="6" y1="15" x2="10" y2="15" />
                <line x1="14" y1="15" x2="16" y2="15" />
              </ng-container>

              <!-- Blockchain / Nodes -->
              <ng-container *ngIf="f.iconType === 'blockchain'">
                <rect x="3" y="3" width="6.5" height="6.5" rx="1.5" />
                <rect x="14.5" y="3" width="6.5" height="6.5" rx="1.5" />
                <rect x="14.5" y="14.5" width="6.5" height="6.5" rx="1.5" />
                <rect x="3" y="14.5" width="6.5" height="6.5" rx="1.5" />
                <path d="M9.5 6.25h5M9.5 17.75h5M6.25 9.5v5M17.75 9.5v5" />
              </ng-container>

              <!-- Notifications / Realtime -->
              <ng-container *ngIf="f.iconType === 'realtime'">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                <circle cx="18" cy="4" r="2.5" fill="currentColor" />
              </ng-container>

              <!-- Dashboard / Stats -->
              <ng-container *ngIf="f.iconType === 'dashboard'">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
                <path d="M3 20h18" />
              </ng-container>
            </svg>
          </div>
          <h3 class="feature-title">{{ f.title }}</h3>
          <p class="feature-desc">{{ f.description }}</p>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .features-section {
        padding: 120px 24px;
        max-width: 1280px;
        margin: 0 auto;
      }

      .section-header {
        text-align: center;
        margin-bottom: 64px;
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
        margin-bottom: 16px;
      }

      .section-subtitle {
        font-family: 'Inter', sans-serif;
        font-size: 18px;
        color: var(--bridge-text-muted);
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }

      .feature-card {
        position: relative;
        background: color-mix(in srgb, var(--bridge-card) 75%, transparent);
        backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid color-mix(in srgb, var(--bridge-border) 70%, transparent);
        border-radius: 20px;
        padding: 36px 28px;
        transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        overflow: hidden;
      }

      .feature-card:hover {
        transform: translateY(-8px);
        border-color: color-mix(in srgb, var(--accent, var(--bridge-crimson)) 45%, transparent);
        background: color-mix(in srgb, var(--bridge-card-hover) 85%, transparent);
        box-shadow:
          0 20px 40px rgba(0, 0, 0, 0.3),
          0 0 30px color-mix(in srgb, var(--accent, var(--bridge-crimson)) 15%, transparent);
      }

      .feature-accent {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        border-radius: 20px 20px 0 0;
      }

      .feature-icon-wrapper {
        width: 54px;
        height: 54px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--accent, var(--bridge-crimson)) 12%, transparent);
        border: 1px solid color-mix(in srgb, var(--accent, var(--bridge-crimson)) 25%, transparent);
        color: var(--accent, #f5a623);
        margin-bottom: 22px;
        transition: all 300ms ease;
      }

      .feature-card:hover .feature-icon-wrapper {
        transform: scale(1.08) translateY(-2px);
        background: color-mix(in srgb, var(--accent, var(--bridge-crimson)) 20%, transparent);
        box-shadow: 0 0 20px
          color-mix(in srgb, var(--accent, var(--bridge-crimson)) 30%, transparent);
      }

      .feature-svg {
        width: 26px;
        height: 26px;
        display: block;
      }

      .feature-title {
        font-family: 'Syne', sans-serif;
        font-weight: 700;
        font-size: 20px;
        color: var(--bridge-text);
        margin-bottom: 12px;
      }

      .feature-desc {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: var(--bridge-text-muted);
        line-height: 1.7;
      }

      @media (max-width: 1024px) {
        .features-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 640px) {
        .features-grid {
          grid-template-columns: 1fr;
        }
        .section-title {
          font-size: 32px;
        }
      }
    `,
  ],
})
export class FeaturesComponent {
  features = [
    {
      iconType: 'auth',
      title: 'Authentification Sécurisée',
      description:
        'Système JWT avec rôles (Admin, Formateur, Stagiaire), BCrypt pour le hachage et RBAC complet.',
      accentColor: '#C62761',
    },
    {
      iconType: 'formation',
      title: 'Gestion des Formations',
      description:
        'Créez des formations multi-phases avec séances, suivi de présence et progression en temps réel.',
      accentColor: '#F5A623',
    },
    {
      iconType: 'payment',
      title: 'Paiements Intégrés',
      description:
        'Acceptez les paiements via Flouci, Paymee et Stripe avec suivi automatique par phase.',
      accentColor: '#C62761',
    },
    {
      iconType: 'blockchain',
      title: 'Certification Blockchain',
      description:
        'Certificats infalsifiables avec hash SHA-256 sur Polygon, vérifiables par QR Code unique.',
      accentColor: '#C62761',
    },
    {
      iconType: 'realtime',
      title: 'Notifications Temps Réel',
      description:
        'Alertes instantanées via WebSocket STOMP pour paiements, séances et certifications.',
      accentColor: '#F5A623',
    },
    {
      iconType: 'dashboard',
      title: 'Tableaux de Bord',
      description:
        'Statistiques avancées avec graphiques interactifs et exports CSV/PDF automatisés.',
      accentColor: '#C62761',
    },
  ];
}
