import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SplashComponent } from './pages/splash/splash.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { DashboardLayoutComponent } from './pages/dashboard/layout/dashboard-layout.component';
import { AdminOverviewComponent } from './pages/dashboard/admin/overview/admin-overview.component';
import { StagiaireOverviewComponent } from './pages/dashboard/stagiaire/overview/stagiaire-overview.component';
import { FormateurOverviewComponent } from './pages/dashboard/formateur/overview/formateur-overview.component';
import { EvaluationHistoryComponent } from './pages/dashboard/formateur/overview/evaluation-history.component';
import { FormationsListComponent } from './pages/dashboard/formations/formations-list.component';
import { FormationWizardComponent } from './pages/dashboard/formations/formation-wizard.component';
import { FormationDetailComponent } from './pages/dashboard/formations/formation-detail.component';
import { SettingsComponent } from './pages/dashboard/settings/settings.component';
import { AdminLogsComponent } from './pages/dashboard/admin/logs/admin-logs.component';
import { AdminStatsComponent } from './pages/dashboard/admin/stats/admin-stats.component';
import { AdminUsersComponent } from './pages/dashboard/admin/users/admin-users.component';
import { AdminFormateursComponent } from './pages/dashboard/admin/formateurs/admin-formateurs.component';
import { AdminBroadcastComponent } from './pages/dashboard/admin/broadcast/admin-broadcast.component';
import { StagiaireHistoriqueComponent } from './pages/dashboard/stagiaire/historique/stagiaire-historique.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'home', component: LandingComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  { path: 'auth/reset-password', component: ResetPasswordComponent },
  { path: 'auth/register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'settings', component: SettingsComponent },
      
      // ─── Stagiaire ───────────────────────────────────────────────────────────
      {
        path: 'stagiaire',
        component: StagiaireOverviewComponent,
        canActivate: [RoleGuard],
        data: { roles: ['STAGIAIRE'] }
      },
      {
        path: 'stagiaire/formations',
        component: FormationsListComponent,
        canActivate: [RoleGuard],
        data: { roles: ['STAGIAIRE'] }
      },
      {
        path: 'stagiaire/formations/:id',
        component: FormationDetailComponent,
        canActivate: [RoleGuard],
        data: { roles: ['STAGIAIRE'] }
      },
      {
        path: 'stagiaire/historique',
        component: StagiaireHistoriqueComponent,
        canActivate: [RoleGuard],
        data: { roles: ['STAGIAIRE'] }
      },
      {
        path: 'stagiaire/certificats',
        component: StagiaireOverviewComponent,
        canActivate: [RoleGuard],
        data: { roles: ['STAGIAIRE'] }
      },
      {
        path: 'stagiaire/paiements',
        component: StagiaireOverviewComponent,
        canActivate: [RoleGuard],
        data: { roles: ['STAGIAIRE'] }
      },

      // ─── Formateur ───────────────────────────────────────────────────────────
      {
        path: 'formateur',
        component: FormateurOverviewComponent,
        canActivate: [RoleGuard],
        data: { roles: ['FORMATEUR'] }
      },
      {
        path: 'formateur/formations',
        component: FormationsListComponent,
        canActivate: [RoleGuard],
        data: { roles: ['FORMATEUR'] }
      },
      {
        path: 'formateur/formations/:id',
        component: FormationDetailComponent,
        canActivate: [RoleGuard],
        data: { roles: ['FORMATEUR'] }
      },
      {
        path: 'formateur/evaluations',
        component: EvaluationHistoryComponent,
        canActivate: [RoleGuard],
        data: { roles: ['FORMATEUR'] }
      },

      // ─── Admin ───────────────────────────────────────────────────────────────
      {
        path: 'admin',
        component: AdminOverviewComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/formations',
        component: FormationsListComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/formations/:id',
        component: FormationDetailComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/users',
        component: AdminUsersComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/formateurs',
        component: AdminFormateursComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/stats',
        component: AdminStatsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/broadcast',
        component: AdminBroadcastComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/logs',
        component: AdminLogsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },

      // ─── Shared Formations ───────────────────────────────────────────────────
      {
        path: 'formations',
        component: FormationsListComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'FORMATEUR'] }
      },
      {
        path: 'formations/new',
        component: FormationWizardComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'FORMATEUR'] }
      },
      {
        path: 'formations/:id',
        component: FormationDetailComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'FORMATEUR'] }
      },

      { path: '', redirectTo: 'stagiaire', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
