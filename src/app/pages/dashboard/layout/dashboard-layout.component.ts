import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User, Role } from '../../../core/models/user.model';
import { NotificationsPanelComponent } from '../../../shared/components/notifications-panel/notifications-panel.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationsPanelComponent],
  template: `
    <div class="min-h-screen bg-[#08081A] text-white font-inter flex">
      
      <!-- Sidebar -->
      <aside [ngClass]="isSidebarCollapsed ? 'w-20' : 'w-64'" class="hidden md:flex flex-col bg-[#10102A] border-r border-[var(--bridge-border)] transition-all duration-300 relative z-30">
        <!-- Sidebar Header -->
        <div class="h-16 flex items-center px-4 border-b border-[var(--bridge-border)] justify-between">
          <div class="flex items-center gap-3 overflow-hidden" *ngIf="!isSidebarCollapsed">
            <svg class="w-6 h-8 flex-shrink-0" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 10 C20 10 10 25 10 38 C10 51 20 58 40 58 C48 58 54 55 58 50" stroke="#C62761" stroke-width="8" stroke-linecap="round" fill="none" />
              <path d="M40 90 C60 90 70 75 70 62 C70 49 60 42 40 42 C32 42 26 45 22 50" stroke="#F5A623" stroke-width="8" stroke-linecap="round" fill="none" />
            </svg>
            <div>
              <span class="font-syne font-bold text-lg leading-none tracking-wide text-white">The <span class="text-gradient">Bridge</span></span>
              <p class="text-[9px] tracking-[3px] uppercase text-[var(--bridge-text-muted)] leading-none mt-1">9antra</p>
            </div>
          </div>
          <!-- Mini logo for collapsed sidebar -->
          <svg class="w-6 h-8 mx-auto" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" *ngIf="isSidebarCollapsed">
            <path d="M40 10 C20 10 10 25 10 38 C10 51 20 58 40 58 C48 58 54 55 58 50" stroke="#C62761" stroke-width="8" stroke-linecap="round" fill="none" />
            <path d="M40 90 C60 90 70 75 70 62 C70 49 60 42 40 42 C32 42 26 45 22 50" stroke="#F5A623" stroke-width="8" stroke-linecap="round" fill="none" />
          </svg>
        </div>

        <!-- Sidebar Navigation -->
        <nav class="flex-1 py-6 px-3 space-y-1.5">
          <a *ngFor="let item of menuItems" 
             [routerLink]="item.route" 
             routerLinkActive="bg-white/[0.04] text-white border-l-2 border-[var(--bridge-crimson)]"
             [routerLinkActiveOptions]="{exact: true}"
             class="flex items-center gap-3 px-3 py-3 rounded-lg text-[var(--bridge-text-muted)] hover:text-white hover:bg-white/[0.02] transition-all group">
            <span class="text-lg group-hover:scale-110 transition-transform">{{ item.icon }}</span>
            <span *ngIf="!isSidebarCollapsed" class="text-sm font-medium tracking-wide">{{ item.label }}</span>
          </a>
        </nav>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-[var(--bridge-border)] flex items-center gap-3 overflow-hidden">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center font-bold border border-white/10 flex-shrink-0">
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0" *ngIf="!isSidebarCollapsed">
            <h5 class="text-xs font-semibold text-white truncate">{{ user?.prenom }} {{ user?.nom }}</h5>
            <span class="text-[10px] bg-[rgba(245,166,35,0.15)] text-[var(--bridge-gold)] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider mt-1 inline-block">
              {{ user?.role }}
            </span>
          </div>
        </div>

        <!-- Collapse Toggle Button -->
        <button (click)="isSidebarCollapsed = !isSidebarCollapsed" class="absolute -right-3 top-20 bg-[#10102A] border border-[var(--bridge-border)] text-white hover:text-[var(--bridge-gold)] rounded-full p-1 hidden md:block">
          <span class="text-xs">{{ isSidebarCollapsed ? '&rarr;' : '&larr;' }}</span>
        </button>
      </aside>

      <!-- Main Shell -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Top Bar -->
        <header class="h-16 bg-[#10102A] border-b border-[var(--bridge-border)] flex items-center justify-between px-6 sticky top-0 z-20">
          <div class="flex items-center gap-4">
            <h2 class="font-syne font-bold text-lg md:text-xl text-white tracking-wide">
              Tableau de bord {{ userRoleLabel }}
            </h2>
          </div>

          <div class="flex items-center gap-4 relative">
            <!-- Notifications Bell -->
            <button (click)="toggleNotifications()" class="relative p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/[0.04]">
              <span>🔔</span>
              <span *ngIf="unreadCount > 0" class="absolute top-1.5 right-1.5 w-4 h-4 bg-[var(--bridge-crimson)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {{ unreadCount }}
              </span>
            </button>

            <!-- Notifications Dropdown -->
            <div *ngIf="showNotifications" class="absolute right-0 top-12 z-50">
              <app-notifications-panel (close)="showNotifications = false"></app-notifications-panel>
            </div>

            <!-- Logout Button -->
            <button (click)="logout()" class="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-rose-500/10 text-white/80 hover:text-rose-400 border border-white/10 hover:border-rose-500/20 rounded-lg text-xs font-semibold transition-all">
              <span>🚪</span> <span class="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </header>

        <!-- Main Content View -->
        <main class="flex-1 p-6 overflow-y-auto bg-[#08081A]">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent implements OnInit {
  user: User | null = null;
  unreadCount = 0;
  isSidebarCollapsed = false;
  showNotifications = false;
  menuItems: { label: string; route: string; icon: string }[] = [];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    // Set up menu items based on role
    if (this.user.role === 'STAGIAIRE') {
      this.menuItems = [
        { label: 'Vue d\'ensemble', route: '/dashboard/stagiaire', icon: '📊' },
        { label: 'Mes Formations', route: '/dashboard/stagiaire/formations', icon: '📚' },
        { label: 'Mes Certificats', route: '/dashboard/stagiaire/certificats', icon: '🎓' },
        { label: 'Paiements', route: '/dashboard/stagiaire/paiements', icon: '💰' }
      ];
    } else if (this.user.role === 'FORMATEUR') {
      this.menuItems = [
        { label: 'Vue d\'ensemble', route: '/dashboard/formateur', icon: '📊' },
        { label: 'Mes Classes', route: '/dashboard/formateur/formations', icon: '🏫' },
        { label: 'Évaluations', route: '/dashboard/formateur/evaluations', icon: '📝' }
      ];
    } else {
      this.menuItems = [
        { label: 'Vue d\'ensemble', route: '/dashboard/admin', icon: '📊' }
      ];
    }

    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  get userInitials(): string {
    if (!this.user) return '';
    return `${this.user.prenom[0]}${this.user.nom[0]}`.toUpperCase();
  }

  get userRoleLabel(): string {
    if (!this.user) return '';
    switch (this.user.role) {
      case 'ADMIN': return 'Administrateur';
      case 'FORMATEUR': return 'Formateur';
      case 'STAGIAIRE': return 'Stagiaire';
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
