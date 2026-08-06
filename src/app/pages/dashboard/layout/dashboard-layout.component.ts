import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';
import { User, Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#08081A] text-white font-inter flex">
      
      <!-- Sidebar -->
      <aside [ngClass]="isSidebarCollapsed ? 'w-20' : 'w-64'" 
             class="hidden md:flex flex-col bg-[#10102A] border-r border-[var(--bridge-border)] transition-all duration-300 relative z-30 flex-shrink-0">
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
          <svg class="w-6 h-8 mx-auto" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" *ngIf="isSidebarCollapsed">
            <path d="M40 10 C20 10 10 25 10 38 C10 51 20 58 40 58 C48 58 54 55 58 50" stroke="#C62761" stroke-width="8" stroke-linecap="round" fill="none" />
            <path d="M40 90 C60 90 70 75 70 62 C70 49 60 42 40 42 C32 42 26 45 22 50" stroke="#F5A623" stroke-width="8" stroke-linecap="round" fill="none" />
          </svg>
        </div>

        <!-- Sidebar Navigation -->
        <nav class="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <ng-container *ngFor="let item of menuItems">
            <!-- Section header -->
            <div *ngIf="item.section && !isSidebarCollapsed" 
                 class="text-[9px] font-bold tracking-[3px] uppercase text-[var(--bridge-text-muted)] px-3 pt-4 pb-2 first:pt-0">
              {{ item.section }}
            </div>
            <div *ngIf="item.section && isSidebarCollapsed" class="border-t border-white/5 my-2"></div>
            <a *ngIf="!item.section"
               [routerLink]="item.route" 
               routerLinkActive="!text-white !bg-white/[0.06] border-l-2 !border-[var(--bridge-crimson)]"
               [routerLinkActiveOptions]="{exact: item.exact ?? false}"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--bridge-text-muted)] hover:text-white hover:bg-white/[0.03] transition-all group border-l-2 border-transparent">
              <span class="text-base group-hover:scale-110 transition-transform flex-shrink-0">{{ item.icon }}</span>
              <span *ngIf="!isSidebarCollapsed" class="text-sm font-medium tracking-wide">{{ item.label }}</span>
            </a>
          </ng-container>
        </nav>

        <!-- Sidebar Footer - User Info -->
        <div class="p-3 border-t border-[var(--bridge-border)]">
          <div class="flex items-center gap-3 overflow-hidden px-1 py-1 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer"
               [routerLink]="settingsRoute">
            <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center font-bold border border-white/10 flex-shrink-0 text-sm overflow-hidden">
              <img *ngIf="user?.avatar" [src]="user!.avatar" class="w-full h-full rounded-full object-cover" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
              <span *ngIf="!user?.avatar" class="flex items-center justify-center w-full h-full">{{ userInitials }}</span>
            </div>
            <div class="flex-1 min-w-0" *ngIf="!isSidebarCollapsed">
              <h5 class="text-xs font-semibold text-white truncate">{{ user?.prenom }} {{ user?.nom }}</h5>
              <span class="text-[9px] bg-[rgba(245,166,35,0.15)] text-[var(--bridge-gold)] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider inline-block mt-0.5">{{ user?.role }}</span>
            </div>
          </div>
        </div>

        <!-- Collapse Toggle -->
        <button (click)="isSidebarCollapsed = !isSidebarCollapsed" 
                class="absolute -right-3 top-20 bg-[#10102A] border border-[var(--bridge-border)] text-white hover:text-[var(--bridge-gold)] rounded-full p-1 hidden md:block z-10 transition-colors">
          <span class="text-xs">{{ isSidebarCollapsed ? '→' : '←' }}</span>
        </button>
      </aside>

      <!-- Main Shell -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top Bar -->
        <header class="h-16 bg-[#10102A] border-b border-[var(--bridge-border)] flex items-center justify-between px-6 sticky top-0 z-20 flex-shrink-0">
          <div class="flex items-center gap-4">
            <h2 class="font-syne font-bold text-lg md:text-xl text-white tracking-wide">
              {{ currentPageTitle }}
            </h2>
          </div>

          <div class="flex items-center gap-3 relative">
            <!-- Notifications Bell -->
            <button id="notifications-bell" (click)="toggleNotifications($event)" 
                    class="relative p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span *ngIf="unreadCount > 0" 
                    class="absolute top-1 right-1 w-4 h-4 bg-[var(--bridge-crimson)] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>

            <!-- Settings Button -->
            <a [routerLink]="settingsRoute"
               class="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </a>

            <!-- Logout -->
            <button (click)="logout()" 
                    class="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-rose-500/10 text-white/70 hover:text-rose-400 border border-white/10 hover:border-rose-500/20 rounded-lg text-xs font-semibold transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span class="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </header>

        <!-- ─── Notification Dropdown ─── -->
        <div *ngIf="showNotifications"
             class="absolute right-4 top-[64px] w-[380px] max-w-[calc(100vw-2rem)] z-50 bridge-card overflow-hidden bg-[#10102A] backdrop-blur-xl border border-white/10"
             style="animation: dropdownIn 0.2s cubic-bezier(0.34,1.15,0.64,1) both; box-shadow: 0 20px 60px rgba(0,0,0,0.85)">
          <div class="h-0.5 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623]"></div>
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-[var(--bridge-border)]">
            <div>
              <h3 class="font-syne font-bold text-white text-sm">🔔 Notifications</h3>
              <p class="text-[10px] text-[var(--bridge-text-muted)] mt-0.5">{{ unreadCount }} non lue(s)</p>
            </div>
            <div class="flex items-center gap-2">
              <button *ngIf="unreadCount > 0" (click)="markAllRead()"
                      class="text-xs text-[var(--bridge-crimson)] hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5">
                Tout lire
              </button>
              <button (click)="closeNotifications()" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Notifications List -->
          <div class="max-h-[70vh] overflow-y-auto">
            <div *ngIf="notifications.length === 0" class="flex flex-col items-center justify-center text-center px-8 py-12">
              <div class="text-4xl mb-3">🔔</div>
              <p class="text-white/60 font-medium text-sm">Aucune notification</p>
              <p class="text-white/30 text-xs mt-1">Vous êtes à jour !</p>
            </div>

            <!-- Notif detail view (inside dropdown) -->
            <div *ngIf="selectedNotif" style="animation: dropdownIn 0.2s cubic-bezier(0.34,1.15,0.64,1) both">
              <div class="flex items-center gap-3 px-4 py-3 border-b border-[var(--bridge-border)]">
                <button (click)="selectedNotif = null"
                        class="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <h4 class="font-semibold text-white text-xs">Détail de la notification</h4>
              </div>
              <div class="p-5 text-center">
                <div [class]="getNotifIconBg(selectedNotif.type)"
                     class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto">
                  {{ getNotifIcon(selectedNotif.type) }}
                </div>
                <h3 class="font-syne font-bold text-white text-base mb-2">{{ selectedNotif.title }}</h3>
                <p class="text-[var(--bridge-text-muted)] text-xs leading-relaxed mb-4">{{ selectedNotif.body }}</p>
                <div class="bg-white/5 rounded-xl p-3 text-left">
                  <p class="text-[10px] text-white/40">Reçu le</p>
                  <p class="text-xs text-white font-medium mt-0.5">{{ selectedNotif.timestamp | date:'dd MMMM yyyy à HH:mm' }}</p>
                </div>
              </div>
            </div>

            <ng-container *ngIf="!selectedNotif">
              <div *ngFor="let notif of notifications"
                   [class]="!notif.read ? 'bg-white/[0.02] border-l-2 border-[var(--bridge-crimson)]' : ''"
                   class="border-b border-white/5 transition-all hover:bg-white/[0.03] cursor-pointer"
                   (click)="openNotification(notif)">
                <div class="px-4 py-3">
                  <div class="flex items-start gap-3">
                    <div [class]="getNotifIconBg(notif.type)"
                         class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm mt-0.5">
                      {{ getNotifIcon(notif.type) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2">
                        <p class="text-xs font-semibold text-white truncate">{{ notif.title }}</p>
                        <span *ngIf="!notif.read" class="w-1.5 h-1.5 rounded-full bg-[var(--bridge-crimson)] flex-shrink-0"></span>
                      </div>
                      <p class="text-[11px] text-[var(--bridge-text-muted)] mt-0.5 line-clamp-2 leading-relaxed">{{ notif.body }}</p>
                      <p class="text-[10px] text-white/30 mt-1">{{ formatTime(notif.timestamp) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- Backdrop to close notifications on outside click -->
        <div *ngIf="showNotifications"
             class="fixed inset-0 z-40"
             (click)="closeNotifications()"></div>

        <!-- Main Content View -->
        <main class="flex-1 min-h-0 bg-[#08081A] relative">
          <div class="h-full overflow-y-auto">
            <div class="p-6">
              <router-outlet></router-outlet>
            </div>
          </div>
        </main>
        <!-- Global Toast Container (Fixed Top Right) -->
        <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
          <div *ngFor="let toast of toasts"
               class="pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 relative overflow-hidden"
               [class]="toast.type === 'success'
                 ? 'bg-[#10102A]/95 border-emerald-500/40 text-white'
                 : toast.type === 'error'
                 ? 'bg-[#10102A]/95 border-red-500/40 text-white'
                 : toast.type === 'warning'
                 ? 'bg-[#10102A]/95 border-amber-500/40 text-white'
                 : 'bg-[#10102A]/95 border-blue-500/40 text-white'"
               style="animation: slideInRight 0.3s cubic-bezier(0.34,1.15,0.64,1) both">

            <!-- Type Icon -->
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                 [class]="toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : toast.type === 'error' ? 'bg-red-500/20 text-red-400' : toast.type === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'">
              {{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '⚠️' : toast.type === 'warning' ? '🔔' : 'ℹ️' }}
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0 pr-6">
              <h4 class="font-syne font-bold text-sm text-white mb-0.5">{{ toast.title }}</h4>
              <p class="text-xs text-white/70 leading-relaxed">{{ toast.message }}</p>
            </div>

            <!-- Close Button -->
            <button (click)="removeToast(toast.id)"
                    class="absolute top-3 right-3 text-white/40 hover:text-white transition-colors text-xs p-1">
              ✕
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class DashboardLayoutComponent implements OnInit {
  user: User | null = null;
  unreadCount = 0;
  isSidebarCollapsed = false;
  showNotifications = false;
  notifications: any[] = [];
  selectedNotif: any = null;
  toasts: any[] = [];
  menuItems: { label?: string; route?: string; icon?: string; exact?: boolean; section?: string }[] = [];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Redirect to role-appropriate home if landing on bare /dashboard
    const url = this.router.url;
    if (url === '/dashboard' || url === '/dashboard/') {
      this.router.navigate([this.authService.getRedirectUrl(this.user.role)]);
      return;
    }

    this.buildMenu();

    this.notificationService.unreadCount$.subscribe(count => this.unreadCount = count);
    this.notificationService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
    });

    this.toastService.toasts$.subscribe(t => {
      this.toasts = t;
    });
  }

  removeToast(id: string): void {
    this.toastService.remove(id);
  }

  private buildMenu(): void {
    if (!this.user) return;
    if (this.user.role === 'STAGIAIRE') {
      this.menuItems = [
        { section: 'Principal' },
        { label: 'Vue d\'ensemble', route: '/dashboard/stagiaire', icon: '🏠', exact: true },
        { label: 'Formations', route: '/dashboard/stagiaire/formations', icon: '📚' },
        { section: 'Personnel' },
        { label: 'Certificats', route: '/dashboard/stagiaire/certificats', icon: '🏅' },
        { label: 'Paiements', route: '/dashboard/stagiaire/paiements', icon: '💳' },
        { label: 'Mon Historique', route: '/dashboard/stagiaire/historique', icon: '📋' },
        { section: 'Compte' },
        { label: 'Paramètres', route: '/dashboard/settings', icon: '⚙️' },
      ];
    } else if (this.user.role === 'FORMATEUR') {
      this.menuItems = [
        { section: 'Principal' },
        { label: 'Vue d\'ensemble', route: '/dashboard/formateur', icon: '🏠', exact: true },
        { label: 'Agenda & Séances', route: '/dashboard/formateur/seances', icon: '📅' },
        { label: 'Mes Formations', route: '/dashboard/formateur/formations', icon: '🏫' },
        { section: 'Stagiaires' },
        { label: 'Mes Stagiaires', route: '/dashboard/formateur/stagiaires', icon: '👥' },
        { section: 'Pédagogie' },
        { label: 'Évaluations', route: '/dashboard/formateur/evaluations', icon: '📝' },
        { section: 'Compte' },
        { label: 'Paramètres', route: '/dashboard/settings', icon: '⚙️' },
      ];
    } else {

      this.menuItems = [
        { section: 'Tableau de bord' },
        { label: 'Vue d\'ensemble', route: '/dashboard/admin', icon: '📊', exact: true },
        { label: 'Formations', route: '/dashboard/admin/formations', icon: '🏫' },
        { label: 'Utilisateurs', route: '/dashboard/admin/users', icon: '👥' },
        { section: 'Gestion' },
        { label: 'Formateurs', route: '/dashboard/admin/formateurs', icon: '🎓' },
        { label: 'Statistiques', route: '/dashboard/admin/stats', icon: '📈' },
        { label: 'Diffusion', route: '/dashboard/admin/broadcast', icon: '📢' },
        { section: 'Système' },
        { label: 'Logs & Audit', route: '/dashboard/admin/logs', icon: '🔍' },
        { label: 'Paramètres', route: '/dashboard/settings', icon: '⚙️' },
      ];
    }
  }

  get settingsRoute(): string {
    return '/dashboard/settings';
  }

  get currentPageTitle(): string {
    if (!this.user) return '';
    switch (this.user.role) {
      case 'ADMIN': return 'Administration';
      case 'FORMATEUR': return 'Espace Formateur';
      case 'STAGIAIRE': return 'Espace Stagiaire';
      default: return 'Tableau de bord';
    }
  }

  get userInitials(): string {
    if (!this.user) return '';
    const p = this.user.prenom?.[0] || '';
    const n = this.user.nom?.[0] || '';
    return (p + n).toUpperCase();
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    this.selectedNotif = null;
    if (this.showNotifications) {
      this.notificationService.refreshNotifications();
    }
  }

  closeNotifications(): void {
    this.showNotifications = false;
    this.selectedNotif = null;
  }

  openNotification(notif: any): void {
    this.selectedNotif = notif;
    if (!notif.read) {
      this.notificationService.markAsRead(notif.id);
    }
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead();
  }

  getNotifIcon(type: string): string {
    const icons: Record<string, string> = {
      'SEANCE_PLANIFIEE': '📅',
      'CERTIFICAT_GENERE': '🏆',
      'EVALUATION_PUBLIEE': '⭐',
      'PAIEMENT_CONFIRME': '💳',
      'PHASE_DEBLOQUEE': '🔓',
      'NOUVELLE_INSCRIPTION': '✅',
      'ANNONCE': '📢',
    };
    return icons[type] || '🔔';
  }

  getNotifIconBg(type: string): string {
    const bgs: Record<string, string> = {
      'SEANCE_PLANIFIEE': 'bg-blue-500/10',
      'CERTIFICAT_GENERE': 'bg-yellow-500/10',
      'EVALUATION_PUBLIEE': 'bg-purple-500/10',
      'PAIEMENT_CONFIRME': 'bg-green-500/10',
      'PHASE_DEBLOQUEE': 'bg-emerald-500/10',
      'NOUVELLE_INSCRIPTION': 'bg-emerald-500/10',
      'ANNONCE': 'bg-pink-500/10',
    };
    return bgs[type] || 'bg-white/10';
  }

  formatTime(date: Date): string {
    if (!date) return '';
    const now = new Date();
    const diff = (now.getTime() - new Date(date).getTime()) / 1000;
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
    return new Date(date).toLocaleDateString('fr-FR');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
