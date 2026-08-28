import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { trigger, transition, style, animate, query } from '@angular/animations';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  animations: [
    trigger('routeAnimations', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateX(28px)' }),
            animate(
              '320ms cubic-bezier(0.4, 0, 0.2, 1)',
              style({ opacity: 1, transform: 'translateX(0)' }),
            ),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
  template: `
    <div class="h-screen w-screen bg-[#08081A] text-white font-inter flex overflow-hidden">
      <!-- Sidebar -->
      <aside
        [ngClass]="isSidebarCollapsed ? 'w-20' : 'w-64'"
        class="hidden md:flex flex-col h-full bg-[#10102A] border-r border-[var(--bridge-border)] transition-all duration-300 relative z-30 flex-shrink-0"
      >
        <!-- Sidebar Header -->
        <div
          class="h-16 flex items-center px-4 border-b border-[var(--bridge-border)] justify-between"
        >
          <div class="flex items-center gap-3 overflow-hidden" *ngIf="!isSidebarCollapsed">
            <svg
              class="w-6 h-8 flex-shrink-0"
              viewBox="0 0 80 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M40 10 C20 10 10 25 10 38 C10 51 20 58 40 58 C48 58 54 55 58 50"
                stroke="#C62761"
                stroke-width="8"
                stroke-linecap="round"
                fill="none"
              />
              <path
                d="M40 90 C60 90 70 75 70 62 C70 49 60 42 40 42 C32 42 26 45 22 50"
                stroke="#F5A623"
                stroke-width="8"
                stroke-linecap="round"
                fill="none"
              />
            </svg>
            <div>
              <span class="font-syne font-bold text-lg leading-none tracking-wide text-white"
                >The <span class="text-gradient">Bridge</span></span
              >
              <p
                class="text-[9px] tracking-[3px] uppercase text-[var(--bridge-text-muted)] leading-none mt-1"
              >
                9antra
              </p>
            </div>
          </div>
          <svg
            class="w-6 h-8 mx-auto"
            viewBox="0 0 80 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            *ngIf="isSidebarCollapsed"
          >
            <path
              d="M40 10 C20 10 10 25 10 38 C10 51 20 58 40 58 C48 58 54 55 58 50"
              stroke="#C62761"
              stroke-width="8"
              stroke-linecap="round"
              fill="none"
            />
            <path
              d="M40 90 C60 90 70 75 70 62 C70 49 60 42 40 42 C32 42 26 45 22 50"
              stroke="#F5A623"
              stroke-width="8"
              stroke-linecap="round"
              fill="none"
            />
          </svg>
        </div>

        <!-- Sidebar Navigation -->
        <nav class="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <ng-container *ngFor="let item of menuItems">
            <!-- Section header -->
            <div
              *ngIf="item.section && !isSidebarCollapsed"
              class="text-[9px] font-bold tracking-[3px] uppercase text-[var(--bridge-text-muted)] px-3 pt-4 pb-2 first:pt-0"
            >
              {{ item.section }}
            </div>
            <div
              *ngIf="item.section && isSidebarCollapsed"
              class="border-t border-white/5 my-2"
            ></div>
            <a
              *ngIf="!item.section"
              [routerLink]="item.route"
              routerLinkActive="!text-white !bg-white/[0.06] border-l-2 !border-[var(--bridge-crimson)]"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--bridge-text-muted)] hover:text-white hover:bg-white/[0.03] transition-all group border-l-2 border-transparent"
            >
              <span
                class="w-5 h-5 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0"
              >
                <ng-container [ngSwitch]="item.icon">
                  <!-- home -->
                  <svg
                    *ngSwitchCase="'home'"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <!-- formations / book -->
                  <svg
                    *ngSwitchCase="'book'"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  <!-- certificats / award -->
                  <svg
                    *ngSwitchCase="'award'"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                  <!-- paiements / credit-card -->
                  <svg
                    *ngSwitchCase="'credit-card'"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                  <!-- historique / history -->
                  <svg
                    *ngSwitchCase="'history'"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M12 7v5l4 2" />
                  </svg>
                  <!-- settings -->
                  <svg
                    *ngSwitchCase="'settings'"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <!-- seances / calendar -->
                  <svg
                    *ngSwitchCase="'calendar'"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  <!-- school / mes formations -->
                  <svg
                    *ngSwitchCase="'school'"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="m4 6 8-4 8 4-8 4Z" />
                    <path d="m18 10 4 2v6" />
                    <path d="M6 10v7c0 3 3 5 6 5s6-2 6-5v-7" />
                  </svg>
                  <!-- users / stagiaires -->
                  <svg
                    *ngSwitchCase="'users'"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <!-- evaluations -->
                  <svg
                    *ngSwitchCase="'evaluations'"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                    />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    <path d="m9 14 2 2 4-4" />
                  </svg>
                  <!-- chart / stats -->
                  <svg
                    *ngSwitchCase="'chart'"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="18" x2="18" y1="20" y2="10" />
                    <line x1="12" x2="12" y1="20" y2="4" />
                    <line x1="6" x2="6" y1="20" y2="14" />
                  </svg>
                  <!-- graduation-cap / formateurs -->
                  <svg
                    *ngSwitchCase="'graduation-cap'"
                    class="w-4 h-4"
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
                  <!-- megaphone / broadcast -->
                  <svg
                    *ngSwitchCase="'megaphone'"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="m3 11 18-5v12L3 14v-3z" />
                    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                  </svg>
                  <!-- search / logs -->
                  <svg
                    *ngSwitchCase="'search'"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" x2="16.65" y1="21" y2="16.65" />
                  </svg>
                </ng-container>
              </span>
              <span *ngIf="!isSidebarCollapsed" class="text-sm font-medium tracking-wide">{{
                item.label
              }}</span>
            </a>
          </ng-container>
        </nav>

        <!-- Sidebar Footer - User Info -->
        <div class="p-3 border-t border-[var(--bridge-border)]">
          <div
            class="flex items-center gap-3 overflow-hidden px-1 py-1 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer"
            [routerLink]="settingsRoute"
          >
            <div
              class="w-9 h-9 rounded-full bg-gradient-to-tr from-[#C62761] to-[#F5A623] flex items-center justify-center font-bold border border-white/10 flex-shrink-0 text-sm overflow-hidden"
            >
              <img
                *ngIf="user?.avatar"
                [src]="user!.avatar"
                class="w-full h-full rounded-full object-cover"
                alt="Avatar de l'utilisateur"
                width="36"
                height="36"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
              />
              <span *ngIf="!user?.avatar" class="flex items-center justify-center w-full h-full">{{
                userInitials
              }}</span>
            </div>
            <div class="flex-1 min-w-0" *ngIf="!isSidebarCollapsed">
              <p class="text-xs font-semibold text-white truncate">
                {{ user?.prenom }} {{ user?.nom }}
              </p>
              <span
                class="text-[9px] bg-[rgba(245,166,35,0.15)] text-[var(--bridge-gold)] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider inline-block mt-0.5"
                >{{ user?.role }}</span
              >
            </div>
          </div>
        </div>

        <!-- Collapse Toggle -->
        <button
          (click)="isSidebarCollapsed = !isSidebarCollapsed"
          [attr.aria-label]="
            isSidebarCollapsed ? 'Déplier la barre latérale' : 'Réduire la barre latérale'
          "
          class="absolute -right-3 top-20 bg-[#10102A] border border-[var(--bridge-border)] text-white/70 hover:text-[var(--bridge-gold)] rounded-full p-1.5 hidden md:flex items-center justify-center z-10 transition-colors shadow-lg"
        >
          <svg
            class="w-3.5 h-3.5 transition-transform duration-300"
            [class.rotate-180]="isSidebarCollapsed"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </aside>

      <!-- Main Shell -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top Bar -->
        <header
          class="h-16 bg-[#10102A] border-b border-[var(--bridge-border)] flex items-center justify-between px-6 sticky top-0 z-20 flex-shrink-0"
        >
          <div class="flex items-center gap-4">
            <h2 class="font-syne font-bold text-lg md:text-xl text-white tracking-wide">
              {{ currentPageTitle }}
            </h2>
          </div>

          <div class="flex items-center gap-3 relative">
            <!-- Notifications Bell -->
            <button
              id="notifications-bell"
              (click)="toggleNotifications($event)"
              aria-label="Notifications"
              class="relative p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span
                *ngIf="unreadCount > 0"
                class="absolute top-1 right-1 w-4 h-4 bg-[var(--bridge-crimson)] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse"
              >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>

            <!-- Settings Button -->
            <a
              [routerLink]="settingsRoute"
              class="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </a>

            <!-- Logout -->
            <button
              (click)="logout()"
              aria-label="Se déconnecter"
              class="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-rose-500/10 text-white/70 hover:text-rose-400 border border-white/10 hover:border-rose-500/20 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span class="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </header>

        <!-- ─── Notification Dropdown ─── -->
        <div
          *ngIf="showNotifications"
          class="absolute right-4 top-[64px] w-[380px] max-w-[calc(100vw-2rem)] z-50 bridge-card overflow-hidden bg-[#10102A] backdrop-blur-xl border border-white/10"
          style="animation: dropdownIn 0.2s cubic-bezier(0.34,1.15,0.64,1) both; box-shadow: 0 20px 60px rgba(0,0,0,0.85)"
        >
          <div class="h-0.5 bg-gradient-to-r from-[#C62761] via-[#E0452F] to-[#F5A623]"></div>
          <!-- Header -->
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-[var(--bridge-border)]"
          >
            <div class="flex items-center gap-2">
              <svg
                class="w-4 h-4 text-[var(--bridge-gold)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <div>
                <h3 class="font-syne font-bold text-white text-sm">Notifications</h3>
                <p class="text-[10px] text-[var(--bridge-text-muted)] mt-0.5">
                  {{ unreadCount }} non lue(s)
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                *ngIf="unreadCount > 0"
                (click)="markAllRead()"
                class="text-xs text-[var(--bridge-crimson)] hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5 cursor-pointer"
              >
                Tout lire
              </button>
              <button
                (click)="closeNotifications()"
                aria-label="Fermer les notifications"
                class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Notifications List -->
          <div class="max-h-[70vh] overflow-y-auto">
            <div
              *ngIf="notifications.length === 0"
              class="flex flex-col items-center justify-center text-center px-8 py-12"
            >
              <div
                class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/30 mb-3"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <p class="text-white/60 font-medium text-sm">Aucune notification</p>
              <p class="text-white/30 text-xs mt-1">Vous êtes à jour !</p>
            </div>

            <!-- Notif detail view (inside dropdown) -->
            <div
              *ngIf="selectedNotif"
              style="animation: dropdownIn 0.2s cubic-bezier(0.34,1.15,0.64,1) both"
            >
              <div class="flex items-center gap-3 px-4 py-3 border-b border-[var(--bridge-border)]">
                <button
                  (click)="selectedNotif = null"
                  class="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <h4 class="font-semibold text-white text-xs">Détail de la notification</h4>
              </div>
              <div class="p-5 text-center">
                <div
                  [class]="getNotifIconBg(selectedNotif.type)"
                  class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto"
                >
                  <ng-container [ngSwitch]="selectedNotif.type">
                    <svg
                      *ngSwitchCase="'SEANCE_PLANIFIEE'"
                      class="w-6 h-6 text-blue-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    <svg
                      *ngSwitchCase="'CERTIFICAT_GENERE'"
                      class="w-6 h-6 text-amber-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                    <svg
                      *ngSwitchCase="'EVALUATION_PUBLIEE'"
                      class="w-6 h-6 text-purple-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      />
                    </svg>
                    <svg
                      *ngSwitchCase="'PAIEMENT_CONFIRME'"
                      class="w-6 h-6 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                      <path d="m9 15 2 2 4-4" />
                    </svg>
                    <svg
                      *ngSwitchCase="'PHASE_DEBLOQUEE'"
                      class="w-6 h-6 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                    </svg>
                    <svg
                      *ngSwitchCase="'NOUVELLE_INSCRIPTION'"
                      class="w-6 h-6 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" x2="19" y1="8" y2="14" />
                      <line x1="22" x2="16" y1="11" y2="11" />
                    </svg>
                    <svg
                      *ngSwitchCase="'ANNONCE'"
                      class="w-6 h-6 text-pink-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="m3 11 18-5v12L3 14v-3z" />
                      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                    </svg>
                    <svg
                      *ngSwitchDefault
                      class="w-6 h-6 text-white/70"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </ng-container>
                </div>
                <h3 class="font-syne font-bold text-white text-base mb-2">
                  {{ selectedNotif.title }}
                </h3>
                <p class="text-[var(--bridge-text-muted)] text-xs leading-relaxed mb-4">
                  {{ selectedNotif.body }}
                </p>
                <div class="bg-white/5 rounded-xl p-3 text-left">
                  <p class="text-[10px] text-white/40">Reçu le</p>
                  <p class="text-xs text-white font-medium mt-0.5">
                    {{ selectedNotif.timestamp | date: 'dd MMMM yyyy à HH:mm' }}
                  </p>
                </div>
              </div>
            </div>

            <ng-container *ngIf="!selectedNotif">
              <div
                *ngFor="let notif of notifications"
                [class]="
                  !notif.read ? 'bg-white/[0.02] border-l-2 border-[var(--bridge-crimson)]' : ''
                "
                class="border-b border-white/5 transition-all hover:bg-white/[0.03] cursor-pointer"
                (click)="openNotification(notif)"
              >
                <div class="px-4 py-3">
                  <div class="flex items-start gap-3">
                    <div
                      [class]="getNotifIconBg(notif.type)"
                      class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    >
                      <ng-container [ngSwitch]="notif.type">
                        <svg
                          *ngSwitchCase="'SEANCE_PLANIFIEE'"
                          class="w-4 h-4 text-blue-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                          <line x1="16" x2="16" y1="2" y2="6" />
                          <line x1="8" x2="8" y1="2" y2="6" />
                          <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                        <svg
                          *ngSwitchCase="'CERTIFICAT_GENERE'"
                          class="w-4 h-4 text-amber-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <circle cx="12" cy="8" r="7" />
                          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                        </svg>
                        <svg
                          *ngSwitchCase="'EVALUATION_PUBLIEE'"
                          class="w-4 h-4 text-purple-400"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <polygon
                            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                          />
                        </svg>
                        <svg
                          *ngSwitchCase="'PAIEMENT_CONFIRME'"
                          class="w-4 h-4 text-emerald-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                        <svg
                          *ngSwitchCase="'PHASE_DEBLOQUEE'"
                          class="w-4 h-4 text-emerald-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                        </svg>
                        <svg
                          *ngSwitchCase="'NOUVELLE_INSCRIPTION'"
                          class="w-4 h-4 text-emerald-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <line x1="19" x2="19" y1="8" y2="14" />
                          <line x1="22" x2="16" y1="11" y2="11" />
                        </svg>
                        <svg
                          *ngSwitchCase="'ANNONCE'"
                          class="w-4 h-4 text-pink-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="m3 11 18-5v12L3 14v-3z" />
                          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                        </svg>
                        <svg
                          *ngSwitchDefault
                          class="w-4 h-4 text-white/70"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                      </ng-container>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2">
                        <p class="text-xs font-semibold text-white truncate">{{ notif.title }}</p>
                        <span
                          *ngIf="!notif.read"
                          class="w-1.5 h-1.5 rounded-full bg-[var(--bridge-crimson)] flex-shrink-0"
                        ></span>
                      </div>
                      <p
                        class="text-[11px] text-[var(--bridge-text-muted)] mt-0.5 line-clamp-2 leading-relaxed"
                      >
                        {{ notif.body }}
                      </p>
                      <p class="text-[10px] text-white/30 mt-1">
                        {{ formatTime(notif.timestamp) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- Backdrop to close notifications on outside click -->
        <div
          *ngIf="showNotifications"
          class="fixed inset-0 z-40"
          (click)="closeNotifications()"
        ></div>

        <!-- Main Content View -->
        <main class="flex-1 min-h-0 bg-[#08081A] relative">
          <div class="h-full overflow-y-auto">
            <div class="p-6" [@routeAnimations]="prepareRoute(outlet)">
              <router-outlet #outlet="outlet"></router-outlet>
            </div>
          </div>
        </main>
        <!-- Global Toast Container (Fixed Top Right) -->
        <div
          class="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none"
        >
          <div
            *ngFor="let toast of toasts"
            class="bridge-toast pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 relative overflow-hidden"
            [class]="
              toast.type === 'success'
                ? 'bridge-toast-success'
                : toast.type === 'error'
                  ? 'bridge-toast-error'
                  : toast.type === 'warning'
                    ? 'bridge-toast-warning'
                    : 'bridge-toast-info'
            "
            style="animation: slideInRight 0.3s cubic-bezier(0.34,1.15,0.64,1) both"
          >
            <!-- Type Icon -->
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              [class]="
                toast.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : toast.type === 'error'
                    ? 'bg-red-500/20 text-red-400'
                    : toast.type === 'warning'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-blue-500/20 text-blue-400'
              "
            >
              <ng-container [ngSwitch]="toast.type">
                <!-- Success -->
                <svg
                  *ngSwitchCase="'success'"
                  class="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <!-- Error -->
                <svg
                  *ngSwitchCase="'error'"
                  class="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <!-- Warning -->
                <svg
                  *ngSwitchCase="'warning'"
                  class="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
                  />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <!-- Info default -->
                <svg
                  *ngSwitchDefault
                  class="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </ng-container>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0 pr-6">
              <h4 class="toast-title font-syne font-bold text-sm mb-0.5">{{ toast.title }}</h4>
              <p class="toast-message text-xs leading-relaxed">{{ toast.message }}</p>
            </div>

            <!-- Close Button -->
            <button
              (click)="removeToast(toast.id)"
              class="toast-close absolute top-3 right-3 transition-colors text-xs p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardLayoutComponent implements OnInit {
  user: User | null = null;
  unreadCount = 0;
  isSidebarCollapsed = false;
  showNotifications = false;
  notifications: any[] = [];
  selectedNotif: any = null;
  toasts: any[] = [];
  menuItems: {
    label?: string;
    route?: string;
    icon?: string;
    exact?: boolean;
    section?: string;
  }[] = [];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private toastService: ToastService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
  ) {}

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

    this.authService.currentUser$.subscribe((u) => {
      if (u) {
        this.user = u;
      }
    });

    this.notificationService.unreadCount$.subscribe((count) => (this.unreadCount = count));
    this.notificationService.notifications$.subscribe((notifs) => {
      this.notifications = notifs;
    });

    this.toastService.toasts$.subscribe((t) => {
      this.toasts = t;
    });

    // Fix NG0100: detectChanges after every navigation so animation state is stable
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.cdRef.detectChanges();
      }
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
        { label: "Vue d'ensemble", route: '/dashboard/stagiaire', icon: 'home', exact: true },
        { label: 'Agenda & Planning', route: '/dashboard/stagiaire/agenda', icon: 'calendar' },
        { label: 'Formations', route: '/dashboard/stagiaire/formations', icon: 'book' },
        { section: 'Personnel' },
        { label: 'Certificats', route: '/dashboard/stagiaire/certificats', icon: 'award' },
        { label: 'Paiements', route: '/dashboard/stagiaire/paiements', icon: 'credit-card' },
        { label: 'Mon Historique', route: '/dashboard/stagiaire/historique', icon: 'history' },
        { section: 'Compte' },
        { label: 'Paramètres', route: '/dashboard/settings', icon: 'settings' },
      ];
    } else if (this.user.role === 'FORMATEUR') {
      this.menuItems = [
        { section: 'Principal' },
        { label: "Vue d'ensemble", route: '/dashboard/formateur', icon: 'home', exact: true },
        { label: 'Agenda & Séances', route: '/dashboard/formateur/seances', icon: 'calendar' },
        { label: 'Mes Formations', route: '/dashboard/formateur/formations', icon: 'school' },
        { section: 'Stagiaires' },
        { label: 'Mes Stagiaires', route: '/dashboard/formateur/stagiaires', icon: 'users' },
        { section: 'Pédagogie' },
        { label: 'Évaluations', route: '/dashboard/formateur/evaluations', icon: 'evaluations' },
        { section: 'Compte' },
        { label: 'Paramètres', route: '/dashboard/settings', icon: 'settings' },
      ];
    } else {
      this.menuItems = [
        { section: 'Tableau de bord' },
        { label: "Vue d'ensemble", route: '/dashboard/admin', icon: 'chart', exact: true },
        { label: 'Utilisateurs', route: '/dashboard/admin/users', icon: 'users' },
        { label: 'Formateurs', route: '/dashboard/admin/formateurs', icon: 'graduation-cap' },

        { section: 'Gestion & Finances' },
        { label: 'Formations', route: '/dashboard/admin/formations', icon: 'school' },

        { label: 'Paiements', route: '/dashboard/admin/paiements', icon: 'credit-card' },
        { label: 'Statistiques', route: '/dashboard/admin/stats', icon: 'chart' },
        { label: 'Diffusion', route: '/dashboard/admin/broadcast', icon: 'megaphone' },
        { section: 'Système' },
        { label: 'Logs & Audit', route: '/dashboard/admin/logs', icon: 'search' },
        { label: 'Paramètres', route: '/dashboard/settings', icon: 'settings' },
      ];
    }
  }

  get settingsRoute(): string {
    return '/dashboard/settings';
  }

  get currentPageTitle(): string {
    const url = this.router.url;

    // Stagiaire routes
    if (url.includes('/dashboard/stagiaire/agenda')) return 'Mon Agenda & Séances';
    if (url.includes('/dashboard/stagiaire/certificats')) return 'Mes Certificats Blockchain';
    if (url.includes('/dashboard/stagiaire/paiements')) return 'Mes Paiements & Échéancier';
    if (url.includes('/dashboard/stagiaire/formations')) return 'Mes Formations';
    if (
      url.includes('/dashboard/stagiaire/historique') ||
      url.includes('/dashboard/stagiaire/presence')
    )
      return 'Historique & Présences';
    if (url === '/dashboard/stagiaire') return 'Tableau de bord Stagiaire';

    // Admin routes
    if (url.includes('/dashboard/admin/paiements')) return 'Supervision des Paiements';
    if (url.includes('/dashboard/admin/users')) return 'Gestion des Utilisateurs';
    if (url.includes('/dashboard/admin/formateurs')) return 'Gestion des Formateurs';
    if (url.includes('/dashboard/admin/formations')) return 'Gestion des Formations';
    if (url.includes('/dashboard/admin/stats')) return 'Statistiques Générales';
    if (url.includes('/dashboard/admin/broadcast')) return 'Diffusion des Notifications';
    if (url.includes('/dashboard/admin/logs')) return 'Audit & Journal Système';
    if (url === '/dashboard/admin') return 'Supervision Plateforme';

    // Formateur routes
    if (url.includes('/dashboard/formateur/seances')) return 'Agenda & Séances';
    if (url.includes('/dashboard/formateur/formations')) return 'Mes Formations';
    if (url.includes('/dashboard/formateur/stagiaires')) return 'Mes Stagiaires';
    if (url.includes('/dashboard/formateur/evaluations')) return 'Évaluations & Notes';
    if (url === '/dashboard/formateur') return 'Espace Formateur';

    // Settings
    if (url.includes('/dashboard/settings')) return 'Paramètres du Compte';

    if (!this.user) return 'Tableau de bord';
    switch (this.user.role) {
      case 'ADMIN':
        return 'Administration';
      case 'FORMATEUR':
        return 'Espace Formateur';
      case 'STAGIAIRE':
        return 'Espace Stagiaire';
      default:
        return 'Tableau de bord';
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

  getNotifIconBg(type: string): string {
    const bgs: Record<string, string> = {
      SEANCE_PLANIFIEE: 'bg-blue-500/10',
      CERTIFICAT_GENERE: 'bg-yellow-500/10',
      EVALUATION_PUBLIEE: 'bg-purple-500/10',
      PAIEMENT_CONFIRME: 'bg-green-500/10',
      PHASE_DEBLOQUEE: 'bg-emerald-500/10',
      NOUVELLE_INSCRIPTION: 'bg-emerald-500/10',
      ANNONCE: 'bg-pink-500/10',
    };
    return bgs[type] || 'bg-white/10';
  }

  formatTime(date: Date): string {
    if (!date) return '';
    const now = new Date();
    const diff = (now.getTime() - new Date(date).getTime()) / 1000;
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
    return new Date(date).toLocaleDateString('fr-FR');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  prepareRoute(outlet: RouterOutlet): string | null {
    return outlet?.isActivated
      ? outlet.activatedRoute.snapshot.url.map((s) => s.path).join('/') ||
          outlet.activatedRoute.snapshot.routeConfig?.path ||
          'default'
      : null;
  }
}
