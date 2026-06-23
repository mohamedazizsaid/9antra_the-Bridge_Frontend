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
              <ellipse cx="40" cy="34" rx="22" ry="20" stroke="#C62761" stroke-width="6" fill="none"/>
              <ellipse cx="40" cy="66" rx="22" ry="20" stroke="#F5A623" stroke-width="6" fill="none"/>
            </svg>
            <div>
              <div class="footer-brand-name">The Bridge</div>
              <div class="footer-brand-sub">9antra</div>
            </div>
          </div>
          <p class="footer-tagline">Le pont entre l'apprenant et la compétence certifiée</p>
          <div class="social-icons">
            <a href="#" aria-label="LinkedIn" class="social-icon">in</a>
            <a href="#" aria-label="GitHub" class="social-icon">GH</a>
            <a href="#" aria-label="Twitter" class="social-icon">𝕏</a>
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
          <p class="footer-info">📧 contact&#64;thebridge.tn</p>
          <p class="footer-info">📱 +216 XX XXX XXX</p>
          <p class="footer-info">📍 Tunis, Tunisie</p>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© 2026 9antra | The Bridge. Tous droits réservés.</span>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      position: relative;
      z-index: 1;
      padding: 0 24px 24px;
      max-width: 1280px;
      margin: 0 auto;
    }

    .footer-divider {
      height: 1px;
      background: linear-gradient(90deg, var(--bridge-crimson), transparent 50%, var(--bridge-gold));
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
      color: #F5A623;
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
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: color-mix(in srgb, var(--bridge-surface) 88%, transparent);
      border: 1px solid color-mix(in srgb, var(--bridge-border) 55%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: var(--bridge-text-muted);
      text-decoration: none;
      transition: all 200ms;
    }

    .social-icon:hover {
      background: color-mix(in srgb, var(--bridge-crimson) 14%, transparent);
      border-color: color-mix(in srgb, var(--bridge-crimson) 38%, transparent);
      color: var(--bridge-text);
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
      font-size: 14px;
      color: #8888BB;
      margin-bottom: 10px;
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
  `]
})
export class FooterComponent {}
