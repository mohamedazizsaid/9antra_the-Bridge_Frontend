import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SplashComponent } from './pages/splash/splash.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { DashboardLayoutComponent } from './pages/dashboard/layout/dashboard-layout.component';
import { StagiaireOverviewComponent } from './pages/dashboard/stagiaire/overview/stagiaire-overview.component';
import { FormateurOverviewComponent } from './pages/dashboard/formateur/overview/formateur-overview.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'home', component: LandingComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'stagiaire',
        component: StagiaireOverviewComponent,
        canActivate: [RoleGuard],
        data: { roles: ['STAGIAIRE'] }
      },
      {
        path: 'formateur',
        component: FormateurOverviewComponent,
        canActivate: [RoleGuard],
        data: { roles: ['FORMATEUR'] }
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
