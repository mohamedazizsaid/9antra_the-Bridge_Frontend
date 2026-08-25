import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="footer-divider"></div>
      <div class="footer-grid">
        <!-- Col 1: Logo & Social -->
        <div class="footer-col">
          <div class="footer-brand">
            <svg class="footer-logo" viewBox="0 0 80 100" fill="none" aria-label="The Bridge logo">
              <ellipse
                cx="40"
                cy="34"
                rx="22"
                ry="20"
                stroke="#C62761"
                stroke-width="6"
                fill="none"
              />
              <ellipse
                cx="40"
                cy="66"
                rx="22"
                ry="20"
                stroke="#F5A623"
                stroke-width="6"
                fill="none"
              />
            </svg>
            <div>
              <div class="footer-brand-name">The Bridge</div>
              <div class="footer-brand-sub">9antra</div>
            </div>
          </div>
          <p class="footer-tagline">Le pont entre l'apprenant et la compétence certifiée</p>
          <div class="social-icons">
            <a href="#" aria-label="LinkedIn" class="social-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
                />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="#" aria-label="GitHub" class="social-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                />
              </svg>
            </a>
            <a href="#" aria-label="Twitter / X" class="social-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- Col 2: Navigation -->
        <div class="footer-col">
          <h4 class="footer-col-title">Navigation</h4>
          <a href="#" class="footer-link">Accueil</a>
          <a href="#fonctionnalites" class="footer-link">Fonctionnalités</a>
          <a href="#apropos" class="footer-link">À propos</a>
          <a href="#contact" class="footer-link">Contact</a>
        </div>

        <!-- Col 3: Legal -->
        <div class="footer-col">
          <h4 class="footer-col-title">Légal</h4>
          <a href="#" class="footer-link">Conditions d'utilisation</a>
          <a href="#" class="footer-link">Politique de confidentialité</a>
          <a href="#" class="footer-link">Mentions légales</a>
        </div>

        <!-- Col 4: Contact -->
        <div class="footer-col">
          <h4 class="footer-col-title">Contact</h4>
          <p class="footer-info">
            <span class="footer-info-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <span>contact&#64;thebridge.tn</span>
          </p>
          <p class="footer-info">
            <span class="footer-info-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                />
              </svg>
            </span>
            <span>+216 XX XXX XXX</span>
          </p>
          <p class="footer-info">
            <span class="footer-info-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <span>Tunis, Tunisie</span>
          </p>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© 2026 9antra | The Bridge. Tous droits réservés.</span>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer {
        position: relative;
        z-index: 1;
        padding: 0 24px 24px;
        max-width: 1280px;
        margin: 0 auto;
      }

      .footer-divider {
        height: 1px;
        background: linear-gradient(
          90deg,
          var(--bridge-crimson),
          transparent 50%,
          var(--bridge-gold)
        );
        margin-bottom: 60px;
      }

      .footer-grid {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 1fr;
        gap: 40px;
        margin-bottom: 48px;
      }

      .footer-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }

      .footer-logo {
        width: 28px;
        height: 35px;
      }

      .footer-brand-name {
        font-family: 'Syne', sans-serif;
        font-weight: 800;
        font-size: 18px;
        color: var(--bridge-text);
        line-height: 1.1;
      }

      .footer-brand-sub {
        font-family: 'Syne', sans-serif;
        font-weight: 600;
        font-size: 11px;
        color: #f5a623;
        letter-spacing: 1px;
      }

      .footer-tagline {
        font-size: 13px;
        color: var(--bridge-text-muted);
        line-height: 1.6;
        margin-bottom: 20px;
      }

      .social-icons {
        display: flex;
        gap: 10px;
      }

      .social-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: color-mix(in srgb, var(--bridge-surface) 88%, transparent);
        border: 1px solid color-mix(in srgb, var(--bridge-border) 55%, transparent);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--bridge-text-muted);
        text-decoration: none;
        transition: all 200ms;
      }

      .social-icon:hover {
        background: color-mix(in srgb, var(--bridge-crimson) 14%, transparent);
        border-color: color-mix(in srgb, var(--bridge-crimson) 38%, transparent);
        color: var(--bridge-text);
        transform: translateY(-2px);
      }

      .footer-col-title {
        font-family: 'Syne', sans-serif;
        font-weight: 700;
        font-size: 14px;
        color: var(--bridge-text);
        margin-bottom: 20px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .footer-link {
        display: block;
        font-size: 14px;
        color: var(--bridge-text-muted);
        text-decoration: none;
        margin-bottom: 12px;
        transition: color 200ms;
      }

      .footer-link:hover {
        color: var(--bridge-text);
      }

      .footer-info {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: var(--bridge-text-muted);
        margin-bottom: 12px;
      }

      .footer-info-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--bridge-crimson);
        flex-shrink: 0;
      }

      .footer-bottom {
        text-align: center;
        padding-top: 24px;
        border-top: 1px solid color-mix(in srgb, var(--bridge-border) 55%, transparent);
        font-size: 13px;
        color: var(--bridge-text-sub);
      }

      @media (max-width: 768px) {
        .footer-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (max-width: 480px) {
        .footer-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class FooterComponent {}
