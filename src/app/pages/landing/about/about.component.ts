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
            9antra | The Bridge est née d'un constat simple : la gestion des formations
            professionnelles en Tunisie reste complexe, fragmentée et manque de traçabilité. Notre
            plateforme apporte une réponse complète et moderne.
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
            <span class="quote-text"
              >قنطرة — le pont entre l'apprenant et la compétence certifiée</span
            >
            <span class="quote-mark">❞</span>
          </blockquote>
        </div>

        <!-- Right Column — Platform Brand Logo Showcase -->
        <div class="about-visual" appReveal [revealDelay]="200">
          <div class="brand-card">
            <div class="glow-orb glow-orb-crimson"></div>
            <div class="glow-orb glow-orb-gold"></div>

            <div class="brand-card-inner">
              <!-- Top Badge -->
              <div class="card-status-badge">
                <span class="live-dot"></span>
                <span>Écosystème Certifié Polygon</span>
              </div>

              <!-- Brand Logo Visual -->
              <div class="logo-showcase">
                <div class="logo-halo"></div>
                <svg
                  class="featured-logo"
                  viewBox="0 0 120 140"
                  fill="none"
                  aria-label="The Bridge 9antra Logo"
                >
                  <defs>
                    <linearGradient id="aboutLogoCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#FF3E7F" />
                      <stop offset="50%" stop-color="#C62761" />
                      <stop offset="100%" stop-color="#9B1E4D" />
                    </linearGradient>
                    <linearGradient id="aboutLogoGold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#FFD07A" />
                      <stop offset="50%" stop-color="#F5A623" />
                      <stop offset="100%" stop-color="#D97706" />
                    </linearGradient>
                    <filter id="aboutGlowCrimson" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow
                        dx="0"
                        dy="0"
                        stdDeviation="5"
                        flood-color="#C62761"
                        flood-opacity="0.45"
                      />
                    </filter>
                    <filter id="aboutGlowGold" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow
                        dx="0"
                        dy="0"
                        stdDeviation="5"
                        flood-color="#F5A623"
                        flood-opacity="0.45"
                      />
                    </filter>
                  </defs>

                  <!-- Dynamic Orbit Background Rings -->
                  <circle
                    cx="60"
                    cy="70"
                    r="58"
                    stroke="rgba(198, 39, 97, 0.2)"
                    stroke-width="1.5"
                    stroke-dasharray="6 8"
                    class="orbit-ring"
                  />
                  <circle
                    cx="60"
                    cy="70"
                    r="48"
                    stroke="rgba(245, 166, 35, 0.15)"
                    stroke-width="1"
                    stroke-dasharray="4 6"
                    class="orbit-ring-rev"
                  />

                  <!-- Upper Loop (Crimson) -->
                  <ellipse
                    cx="60"
                    cy="52"
                    rx="32"
                    ry="28"
                    stroke="url(#aboutLogoCrimson)"
                    stroke-width="8"
                    stroke-linecap="round"
                    fill="none"
                    filter="url(#aboutGlowCrimson)"
                    class="logo-loop"
                  />

                  <!-- Lower Loop (Gold) -->
                  <ellipse
                    cx="60"
                    cy="88"
                    rx="32"
                    ry="28"
                    stroke="url(#aboutLogoGold)"
                    stroke-width="8"
                    stroke-linecap="round"
                    fill="none"
                    filter="url(#aboutGlowGold)"
                    class="logo-loop"
                  />

                  <!-- Center Connection Dot -->
                  <circle cx="60" cy="70" r="3.5" fill="#FFFFFF" opacity="0.9" />
                </svg>

                <div class="brand-headings">
                  <h3 class="brand-name">The Bridge</h3>
                  <span class="brand-tag">9ANTRA • قنطرة</span>
                </div>
              </div>

              <!-- Key Platform Highlights -->
              <div class="brand-features">
                <div class="feature-chip" *ngFor="let item of highlights">
                  <span class="chip-icon">
                    <svg
                      *ngIf="item.iconType === 'ecosystem'"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path
                        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                      />
                    </svg>

                    <svg
                      *ngIf="item.iconType === 'polygon'"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>

                    <svg
                      *ngIf="item.iconType === 'realtime'"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </span>
                  <div class="chip-content">
                    <span class="chip-title">{{ item.title }}</span>
                    <span class="chip-desc">{{ item.desc }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .about-section {
        padding: 120px 24px;
        max-width: 1280px;
        margin: 0 auto;
      }

      .about-grid {
        display: grid;
        grid-template-columns: 1.35fr 1fr;
        gap: 70px;
        align-items: center;
      }

      .section-label {
        font-family: 'Space Mono', monospace;
        font-size: 12px;
        font-weight: 700;
        color: #c62761;
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

      /* ─── Right Column: Brand Card Showcase ─── */
      .about-visual {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
      }

      .brand-card {
        position: relative;
        width: 100%;
        max-width: 440px;
        background: color-mix(in srgb, var(--bridge-card) 75%, transparent);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid color-mix(in srgb, var(--bridge-border) 80%, transparent);
        border-radius: 24px;
        padding: 32px 28px;
        overflow: hidden;
        box-shadow:
          0 20px 50px rgba(0, 0, 0, 0.4),
          0 0 35px rgba(198, 39, 97, 0.12);
        transition:
          transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
          box-shadow 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
          border-color 400ms ease;
      }

      .brand-card:hover {
        transform: translateY(-4px);
        box-shadow:
          0 26px 60px rgba(0, 0, 0, 0.5),
          0 0 45px rgba(198, 39, 97, 0.22);
        border-color: rgba(198, 39, 97, 0.35);
      }

      /* Ambient Glow Elements */
      .glow-orb {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        filter: blur(35px);
        opacity: 0.6;
        transition: opacity 400ms ease;
      }

      .brand-card:hover .glow-orb {
        opacity: 0.85;
      }

      .glow-orb-crimson {
        top: -40px;
        right: -40px;
        width: 190px;
        height: 190px;
        background: radial-gradient(circle, rgba(198, 39, 97, 0.4) 0%, transparent 70%);
      }

      .glow-orb-gold {
        bottom: -40px;
        left: -40px;
        width: 190px;
        height: 190px;
        background: radial-gradient(circle, rgba(245, 166, 35, 0.3) 0%, transparent 70%);
      }

      .brand-card-inner {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      /* Status Badge */
      .card-status-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        background: color-mix(in srgb, var(--bridge-surface) 85%, transparent);
        border: 1px solid rgba(198, 39, 97, 0.25);
        border-radius: 999px;
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        font-weight: 600;
        color: var(--bridge-text);
        letter-spacing: 0.5px;
        margin-bottom: 22px;
      }

      .live-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
        animation: pulseDot 2s infinite ease-in-out;
      }

      @keyframes pulseDot {
        0%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.5;
          transform: scale(0.85);
        }
      }

      /* Logo Showcase Area */
      .logo-showcase {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        position: relative;
        margin-bottom: 24px;
      }

      .logo-halo {
        position: absolute;
        top: 20px;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(198, 39, 97, 0.2) 0%, transparent 70%);
        filter: blur(15px);
        pointer-events: none;
      }

      .featured-logo {
        width: 110px;
        height: 125px;
        margin-bottom: 12px;
        transition: transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        filter: drop-shadow(0 6px 18px rgba(198, 39, 97, 0.25));
        transform-origin: center center;
      }

      .brand-card:hover .featured-logo {
        transform: scale(1.05);
      }

      /* Orbit animations */
      .orbit-ring {
        transform-origin: 60px 70px;
        animation: spinOrbit 25s linear infinite;
      }

      .orbit-ring-rev {
        transform-origin: 60px 70px;
        animation: spinOrbitRev 20s linear infinite;
      }

      @keyframes spinOrbit {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes spinOrbitRev {
        from {
          transform: rotate(360deg);
        }
        to {
          transform: rotate(0deg);
        }
      }

      .brand-headings {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .brand-name {
        font-family: 'Syne', sans-serif;
        font-size: 26px;
        font-weight: 800;
        color: var(--bridge-text);
        line-height: 1.1;
        margin: 0 0 4px 0;
        letter-spacing: -0.5px;
      }

      .brand-tag {
        font-family: 'Space Mono', monospace;
        font-size: 11px;
        font-weight: 700;
        color: var(--bridge-gold);
        letter-spacing: 2.5px;
        text-transform: uppercase;
      }

      /* Highlight Chips */
      .brand-features {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
      }

      .feature-chip {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 11px 15px;
        background: color-mix(in srgb, var(--bridge-surface) 75%, transparent);
        border: 1px solid color-mix(in srgb, var(--bridge-border) 60%, transparent);
        border-radius: 14px;
        transition:
          background 250ms ease,
          border-color 250ms ease,
          transform 250ms ease;
      }

      .feature-chip:hover {
        background: color-mix(in srgb, var(--bridge-card-hover) 85%, transparent);
        border-color: rgba(198, 39, 97, 0.3);
        transform: translateX(4px);
      }

      .chip-icon {
        font-size: 17px;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.04);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .chip-content {
        display: flex;
        flex-direction: column;
      }

      .chip-title {
        font-family: 'Syne', sans-serif;
        font-weight: 700;
        font-size: 13px;
        color: var(--bridge-text);
      }

      .chip-desc {
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        color: var(--bridge-text-muted);
        margin-top: 1px;
      }

      @media (max-width: 1024px) {
        .about-grid {
          grid-template-columns: 1fr;
          gap: 50px;
        }

        .brand-card {
          max-width: 480px;
        }
      }

      @media (max-width: 640px) {
        .about-section {
          padding: 80px 16px;
        }

        .about-title {
          font-size: 32px;
        }

        .brand-card {
          padding: 24px 18px;
        }

        .featured-logo {
          width: 90px;
          height: 105px;
        }

        .brand-name {
          font-size: 22px;
        }
      }
    `,
  ],
})
export class AboutComponent {
  highlights = [
    {
      iconType: 'ecosystem',
      title: 'Écosystème Digital Complet',
      desc: 'Admins, formateurs et stagiaires interconnectés',
    },
    {
      iconType: 'polygon',
      title: 'Certification Polygon',
      desc: 'Diplômes et attestations infalsifiables sur blockchain',
    },
    {
      iconType: 'realtime',
      title: 'Traçabilité en Temps Réel',
      desc: 'Suivi pédagogique, présences et validation continue',
    },
  ];
}
