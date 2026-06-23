import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled" [class.mobile-open]="mobileOpen">
      <div class="navbar-inner">
        <!-- Logo -->
        <a routerLink="/home" class="navbar-brand">
          <svg class="nav-logo" viewBox="0 0 80 100" fill="none" aria-label="The Bridge logo">
            <ellipse cx="40" cy="34" rx="22" ry="20" stroke="#C62761" stroke-width="6" fill="none"/>
            <ellipse cx="40" cy="66" rx="22" ry="20" stroke="#F5A623" stroke-width="6" fill="none"/>
          </svg>
          <div class="brand-text">
            <span class="brand-name">The Bridge</span>
            <span class="brand-sub">9antra</span>
          </div>
        </a>

        <!-- Nav Links (Desktop) -->
        <div class="nav-links" [class.show]="mobileOpen">
          <a href="#" class="nav-link" [class.active]="activeSection === 'top'" (click)="scrollTo($event, 'top')">Accueil</a>
          <a href="#apropos" class="nav-link" [class.active]="activeSection === 'apropos'" (click)="scrollTo($event, 'apropos')">À propos</a>
          <a href="#fonctionnalites" class="nav-link" [class.active]="activeSection === 'fonctionnalites'" (click)="scrollTo($event, 'fonctionnalites')">Fonctionnalités</a>
          <a href="#contact" class="nav-link" [class.active]="activeSection === 'contact'" (click)="scrollTo($event, 'contact')">Contact</a>
        </div>

        <!-- Auth Buttons -->
        <div class="nav-actions" [class.show]="mobileOpen">
          <a routerLink="/auth/login" class="btn-nav-ghost">Se connecter</a>
          <a routerLink="/auth/register" class="btn-nav-primary">Commencer →</a>
        </div>

        <!-- Hamburger -->
        <button class="hamburger" (click)="mobileOpen = !mobileOpen"
                [attr.aria-label]="mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'">
          <span [class.open]="mobileOpen"></span>
          <span [class.open]="mobileOpen"></span>
          <span [class.open]="mobileOpen"></span>
        </button>
      </div>

      <!-- Mobile Drawer -->
      <div class="mobile-drawer" *ngIf="mobileOpen">
        <a href="#" class="nav-link" [class.active]="activeSection === 'top'" (click)="scrollTo($event, 'top'); mobileOpen = false">Accueil</a>
        <a href="#apropos" class="nav-link" [class.active]="activeSection === 'apropos'" (click)="scrollTo($event, 'apropos'); mobileOpen = false">À propos</a>
        <a href="#fonctionnalites" class="nav-link" [class.active]="activeSection === 'fonctionnalites'" (click)="scrollTo($event, 'fonctionnalites'); mobileOpen = false">Fonctionnalités</a>
        <a href="#contact" class="nav-link" [class.active]="activeSection === 'contact'" (click)="scrollTo($event, 'contact'); mobileOpen = false">Contact</a>
        <div class="mobile-auth">
          <a routerLink="/auth/login" class="btn-nav-ghost" (click)="mobileOpen = false">Se connecter</a>
          <a routerLink="/auth/register" class="btn-nav-primary" (click)="mobileOpen = false">Commencer →</a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 70px;
      z-index: 100;
      transition: all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .navbar.scrolled {
      background: rgba(23, 23, 56, 0.6);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(198, 39, 97, 0.15);
    }

    .navbar-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }

    .nav-logo {
      width: 32px;
      height: 40px;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 18px;
      color: #F0F0FF;
      line-height: 1.1;
    }

    .brand-sub {
      font-family: 'Syne', sans-serif;
      font-weight: 600;
      font-size: 11px;
      color: #F5A623;
      letter-spacing: 1px;
    }

    .nav-links {
      display: flex;
      gap: 32px;
    }

    .nav-link {
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      font-size: 14px;
      color: #8888BB;
      text-decoration: none;
      position: relative;
      padding: 4px 0;
      transition: color 200ms;
    }

    .nav-link:hover, .nav-link.active {
      color: #F0F0FF;
    }

    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #C62761, #F5A623);
      border-radius: 1px;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-nav-ghost {
      padding: 10px 20px;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      font-size: 14px;
      color: #F0F0FF;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      text-decoration: none;
      transition: all 200ms;
    }

    .btn-nav-ghost:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.4);
    }

    .btn-nav-primary {
      padding: 10px 24px;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 14px;
      color: white;
      background: linear-gradient(135deg, #C62761, #F5A623);
      border-radius: 10px;
      text-decoration: none;
      transition: all 200ms;
    }

    .btn-nav-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(198, 39, 97, 0.4);
    }

    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
    }

    .hamburger span {
      display: block;
      width: 24px;
      height: 2px;
      background: #F0F0FF;
      border-radius: 1px;
      transition: all 300ms;
    }

    .hamburger span.open:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .hamburger span.open:nth-child(2) { opacity: 0; }
    .hamburger span.open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    .mobile-drawer {
      display: none;
      flex-direction: column;
      padding: 16px 24px 24px;
      gap: 16px;
      background: rgba(23, 23, 56, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(198, 39, 97, 0.15);
    }

    .mobile-drawer .nav-link {
      font-size: 16px;
      padding: 8px 0;
    }

    .mobile-auth {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-top: 8px;
    }

    .mobile-auth .btn-nav-ghost,
    .mobile-auth .btn-nav-primary {
      text-align: center;
    }

    @media (max-width: 768px) {
      .nav-links, .nav-actions {
        display: none;
      }

      .hamburger {
        display: flex;
      }

      .mobile-drawer {
        display: flex;
      }
    }
  `]
})
export class NavbarComponent {
  isScrolled = false;
  mobileOpen = false;
  activeSection: 'top' | 'apropos' | 'fonctionnalites' | 'contact' = 'top';

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 80;
  }

  scrollTo(event: Event, targetId: string): void {
    event.preventDefault();
    this.activeSection = targetId as any;
    if (targetId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
