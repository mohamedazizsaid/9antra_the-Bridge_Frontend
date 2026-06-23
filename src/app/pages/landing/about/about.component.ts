import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RevealDirective],
  template: `
    <section class="about-section">
      <div class="about-grid">
        <!-- Left Column -->
        <div class="about-content" appReveal>
          <span class="section-label">NOTRE MISSION</span>
          <h2 class="about-title">La formation professionnelle, réinventée</h2>

          <p class="about-text">
            9antra | The Bridge est née d'un constat simple : la gestion des formations professionnelles
            en Tunisie reste complexe, fragmentée et manque de traçabilité. Notre plateforme apporte
            une réponse complète et moderne.
          </p>

          <p class="about-text">
            En connectant administrateurs, formateurs et stagiaires sur un même écosystème digital,
            nous automatisons chaque étape du parcours formation — de l'inscription au certificat
            blockchain vérifiable.
          </p>

          <p class="about-text">
            Grâce à l'intégration de technologies de pointe comme la blockchain Polygon et les
            notifications en temps réel, The Bridge garantit une expérience fluide, sécurisée et
            transparente pour tous les acteurs.
          </p>

          <blockquote class="about-quote">
            <span class="quote-mark">❝</span>
            <span class="quote-text">قنطرة — le pont entre l'apprenant et la compétence certifiée</span>
            <span class="quote-mark">❞</span>
          </blockquote>
        </div>

        <!-- Right Column — Lifecycle Infographic -->
        <div class="about-visual" appReveal [revealDelay]="200">
          <div class="lifecycle">
            <div *ngFor="let step of steps; let i = index; let last = last" class="lifecycle-step">
              <div class="step-circle" [class.active]="step.active" [style.--color]="step.color">
                <span class="step-icon">{{ step.icon }}</span>
              </div>
              <div class="step-info">
                <span class="step-name">{{ step.name }}</span>
                <span class="step-desc">{{ step.desc }}</span>
              </div>
              <div class="step-connector" *ngIf="!last">
                <svg width="2" height="40" viewBox="0 0 2 40">
                  <line x1="1" y1="0" x2="1" y2="40" stroke="#2A2A5A" stroke-width="2"
                        stroke-dasharray="4 4"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .about-section {
      padding: 120px 24px;
      max-width: 1280px;
      margin: 0 auto;
    }

    .about-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 80px;
      align-items: center;
    }

    .section-label {
      font-family: 'Space Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      color: #C62761;
      letter-spacing: 3px;
      text-transform: uppercase;
      display: block;
      margin-bottom: 20px;
    }

    .about-title {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 44px;
      color: var(--bridge-text);
      line-height: 1.15;
      margin-bottom: 28px;
    }

    .about-text {
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      color: var(--bridge-text-muted);
      line-height: 1.8;
      margin-bottom: 16px;
    }

    .about-quote {
      margin-top: 32px;
      padding: 24px 28px;
      background: color-mix(in srgb, var(--bridge-surface) 84%, transparent);
      border-left: 3px solid var(--bridge-crimson);
      border-radius: 0 12px 12px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .quote-mark {
      font-size: 32px;
      color: var(--bridge-crimson);
      line-height: 1;
    }

    .quote-text {
      font-family: 'Inter', sans-serif;
      font-style: italic;
      font-size: 17px;
      color: var(--bridge-gold);
      line-height: 1.5;
    }

    /* Lifecycle Infographic */
    .lifecycle {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .lifecycle-step {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      position: relative;
      flex-wrap: wrap;
    }

    .step-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--bridge-surface) 86%, transparent);
      border: 2px solid var(--color, var(--bridge-border));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 400ms;
    }

    .step-circle.active {
      border-color: var(--color);
      box-shadow: 0 0 20px rgba(198, 39, 97, 0.3);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 20px rgba(198, 39, 97, 0.2); }
      50% { box-shadow: 0 0 30px rgba(198, 39, 97, 0.5); }
    }

    .step-icon {
      font-size: 24px;
    }

    .step-info {
      display: flex;
      flex-direction: column;
      padding-top: 8px;
    }

    .step-name {
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 16px;
      color: var(--bridge-text);
    }

    .step-desc {
      font-size: 13px;
      color: var(--bridge-text-muted);
      margin-top: 2px;
    }

    .step-connector {
      width: 56px;
      display: flex;
      justify-content: center;
      margin: 4px 0;
    }

    @media (max-width: 1024px) {
      .about-grid {
        grid-template-columns: 1fr;
        gap: 60px;
      }
    }

    @media (max-width: 640px) {
      .about-title { font-size: 32px; }
    }
  `]
})
export class AboutComponent {
  steps = [
    { name: 'Inscription', desc: 'Créez votre compte en 2 minutes', icon: '📝', color: '#C62761', active: false },
    { name: 'Paiement', desc: 'Payez en ligne de façon sécurisée', icon: '💳', color: '#F5A623', active: false },
    { name: 'Formation', desc: 'Suivez votre parcours personnalisé', icon: '📚', color: '#3B82F6', active: true },
    { name: 'Validation', desc: 'Évaluations et suivi de présence', icon: '✅', color: '#10B981', active: false },
    { name: 'Certification', desc: 'Certificat blockchain vérifiable', icon: '🎓', color: '#8B5CF6', active: false },
  ];
}
