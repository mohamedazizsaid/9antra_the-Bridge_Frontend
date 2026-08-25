import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SplashComponent } from './pages/splash/splash.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { DashboardLayoutComponent } from './pages/dashboard/layout/dashboard-layout.component';
import { PaymentCallbackComponent } from './pages/payment-callback/payment-callback.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'splash', component: SplashComponent },
  { path: 'home', component: LandingComponent },
  { path: 'payment-success', component: PaymentCallbackComponent },
  { path: 'payment-fail', component: PaymentCallbackComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  { path: 'auth/reset-password', component: ResetPasswordComponent },
  { path: 'auth/register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // ─── Settings (lazy) ────────────────────────────────────────────────────
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/dashboard/settings/settings.component').then((m) => m.SettingsComponent),
      },

      // ─── Stagiaire (lazy) ───────────────────────────────────────────────────
      {
        path: 'stagiaire',
        loadComponent: () =>
          import('./pages/dashboard/stagiaire/overview/stagiaire-overview.component').then(
            (m) => m.StagiaireOverviewComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['STAGIAIRE'] },
      },
      {
        path: 'stagiaire/formations',
        loadComponent: () =>
          import('./pages/dashboard/formations/formations-list.component').then(
            (m) => m.FormationsListComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['STAGIAIRE'] },
      },
      {
        path: 'stagiaire/formations/:id',
        loadComponent: () =>
          import('./pages/dashboard/formations/formation-detail.component').then(
            (m) => m.FormationDetailComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['STAGIAIRE'] },
      },
      {
        path: 'stagiaire/historique',
        loadComponent: () =>
          import('./pages/dashboard/stagiaire/historique/stagiaire-historique.component').then(
            (m) => m.StagiaireHistoriqueComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['STAGIAIRE'] },
      },
      {
        path: 'stagiaire/certificats',
        loadComponent: () =>
          import('./pages/dashboard/stagiaire/certificats/stagiaire-certificats.component').then(
            (m) => m.StagiaireCertificatsComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['STAGIAIRE'] },
      },
      {
        path: 'stagiaire/paiements',
        loadComponent: () =>
          import('./pages/dashboard/stagiaire/paiements/stagiaire-paiements.component').then(
            (m) => m.StagiairePaiementsComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['STAGIAIRE'] },
      },
      {
        path: 'stagiaire/presence',
        loadComponent: () =>
          import('./pages/dashboard/stagiaire/historique/stagiaire-historique.component').then(
            (m) => m.StagiaireHistoriqueComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['STAGIAIRE'] },
      },
      {
        path: 'stagiaire/notifications',
        loadComponent: () =>
          import('./pages/dashboard/stagiaire/overview/stagiaire-overview.component').then(
            (m) => m.StagiaireOverviewComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['STAGIAIRE'] },
      },

      // ─── Formateur (lazy) ───────────────────────────────────────────────────
      {
        path: 'formateur',
        loadComponent: () =>
          import('./pages/dashboard/formateur/overview/formateur-overview.component').then(
            (m) => m.FormateurOverviewComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['FORMATEUR'] },
      },
      {
        path: 'formateur/formations',
        loadComponent: () =>
          import('./pages/dashboard/formations/formations-list.component').then(
            (m) => m.FormationsListComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['FORMATEUR'] },
      },
      {
        path: 'formateur/formations/:id',
        loadComponent: () =>
          import('./pages/dashboard/formations/formation-detail.component').then(
            (m) => m.FormationDetailComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['FORMATEUR'] },
      },
      {
        path: 'formateur/evaluations',
        loadComponent: () =>
          import('./pages/dashboard/formateur/overview/evaluation-history.component').then(
            (m) => m.EvaluationHistoryComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['FORMATEUR'] },
      },
      {
        path: 'formateur/seances',
        loadComponent: () =>
          import('./pages/dashboard/formateur/overview/formateur-seances.component').then(
            (m) => m.FormateurSeancesComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['FORMATEUR'] },
      },
      {
        path: 'formateur/stagiaires',
        loadComponent: () =>
          import('./pages/dashboard/formateur/overview/formateur-stagiaires.component').then(
            (m) => m.FormateurStagiairesComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['FORMATEUR'] },
      },

      // ─── Admin (lazy) ────────────────────────────────────────────────────────
      {
        path: 'admin',
        loadComponent: () =>
          import('./pages/dashboard/admin/overview/admin-overview.component').then(
            (m) => m.AdminOverviewComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'admin/formations',
        loadComponent: () =>
          import('./pages/dashboard/formations/formations-list.component').then(
            (m) => m.FormationsListComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'admin/formations/:id',
        loadComponent: () =>
          import('./pages/dashboard/formations/formation-detail.component').then(
            (m) => m.FormationDetailComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'admin/users',
        loadComponent: () =>
          import('./pages/dashboard/admin/users/admin-users.component').then(
            (m) => m.AdminUsersComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'admin/formateurs',
        loadComponent: () =>
          import('./pages/dashboard/admin/formateurs/admin-formateurs.component').then(
            (m) => m.AdminFormateursComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'admin/paiements',
        loadComponent: () =>
          import('./pages/dashboard/admin/paiements/admin-paiements.component').then(
            (m) => m.AdminPaiementsComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'admin/stats',
        loadComponent: () =>
          import('./pages/dashboard/admin/stats/admin-stats.component').then(
            (m) => m.AdminStatsComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'admin/broadcast',
        loadComponent: () =>
          import('./pages/dashboard/admin/broadcast/admin-broadcast.component').then(
            (m) => m.AdminBroadcastComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'admin/logs',
        loadComponent: () =>
          import('./pages/dashboard/admin/logs/admin-logs.component').then(
            (m) => m.AdminLogsComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] },
      },

      // ─── Shared Formations (lazy) ────────────────────────────────────────────
      {
        path: 'formations',
        loadComponent: () =>
          import('./pages/dashboard/formations/formations-list.component').then(
            (m) => m.FormationsListComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'FORMATEUR'] },
      },
      {
        path: 'formations/new',
        loadComponent: () =>
          import('./pages/dashboard/formations/formation-wizard.component').then(
            (m) => m.FormationWizardComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'FORMATEUR'] },
      },
      {
        path: 'formations/:id',
        loadComponent: () =>
          import('./pages/dashboard/formations/formation-detail.component').then(
            (m) => m.FormationDetailComponent,
          ),
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'FORMATEUR'] },
      },

      { path: '', redirectTo: 'stagiaire', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
