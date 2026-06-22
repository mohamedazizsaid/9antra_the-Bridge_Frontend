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
        <div class="feature-card" *ngFor="let f of features; let i = index"
             appReveal [revealDelay]="i * 80">
          <div class="feature-accent" [style.background]="f.accentColor"></div>
          <div class="feature-icon">{{ f.icon }}</div>
          <h3 class="feature-title">{{ f.title }}</h3>
          <p class="feature-desc">{{ f.description }}</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
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
      color: #C62761;
      letter-spacing: 3px;
      text-transform: uppercase;
      display: block;
      margin-bottom: 16px;
    }

    .section-title {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 48px;
      color: #F0F0FF;
      margin-bottom: 12px;
    }

    .section-subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 18px;
      color: #8888BB;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .feature-card {
      position: relative;
      background: rgba(23, 23, 56, 0.6);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(198, 39, 97, 0.15);
      border-radius: 20px;
      padding: 36px 28px;
      transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
      overflow: hidden;
    }

    .feature-card:hover {
      transform: translateY(-8px);
      border-color: rgba(198, 39, 97, 0.4);
      background: rgba(31, 31, 72, 0.8);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3),
                  0 0 30px rgba(198, 39, 97, 0.1);
    }

    .feature-accent {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      border-radius: 20px 20px 0 0;
    }

    .feature-icon {
      font-size: 40px;
      margin-bottom: 20px;
      transition: transform 300ms ease;
    }

    .feature-card:hover .feature-icon {
      transform: scale(1.1);
    }

    .feature-title {
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 20px;
      color: #F0F0FF;
      margin-bottom: 12px;
    }

    .feature-desc {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: #8888BB;
      line-height: 1.7;
    }

    @media (max-width: 1024px) {
      .features-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .features-grid { grid-template-columns: 1fr; }
      .section-title { font-size: 32px; }
    }
  `]
})
export class FeaturesComponent {
  features = [
    {
      icon: '🔐', title: 'Authentification Sécurisée',
      description: 'Système JWT avec rôles (Admin, Formateur, Stagiaire), BCrypt pour le hachage et RBAC complet.',
      accentColor: '#C62761'
    },
    {
      icon: '📚', title: 'Gestion des Formations',
      description: 'Créez des formations multi-phases avec séances, suivi de présence et progression en temps réel.',
      accentColor: '#F5A623'
    },
    {
      icon: '💳', title: 'Paiements Intégrés',
      description: 'Acceptez les paiements via Flouci, Paymee et Stripe avec suivi automatique par phase.',
      accentColor: '#10B981'
    },
    {
      icon: '🔗', title: 'Certification Blockchain',
      description: 'Certificats infalsifiables avec hash SHA-256 sur Polygon, vérifiables par QR Code unique.',
      accentColor: '#8B5CF6'
    },
    {
      icon: '⚡', title: 'Notifications Temps Réel',
      description: 'Alertes instantanées via WebSocket STOMP pour paiements, séances et certifications.',
      accentColor: '#3B82F6'
    },
    {
      icon: '📊', title: 'Tableaux de Bord',
      description: 'Statistiques avancées avec graphiques interactifs et exports CSV/PDF automatisés.',
      accentColor: '#F59E0B'
    }
  ];
}
