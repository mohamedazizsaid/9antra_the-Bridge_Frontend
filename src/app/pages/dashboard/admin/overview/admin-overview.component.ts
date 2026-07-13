import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid gap-6 lg:grid-cols-3 text-white">
      <section class="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <p class="text-[11px] uppercase tracking-[0.35em] text-[var(--bridge-gold)] font-bold">Tableau Admin</p>
        <h1 class="mt-3 text-3xl md:text-4xl font-syne font-bold">Vue d'ensemble administrateur</h1>
        <p class="mt-4 text-sm md:text-base text-[var(--bridge-text-muted)] max-w-2xl leading-relaxed">
          Cet espace est maintenant connecté au backend Spring Boot. Vous pouvez visualiser en temps réel les indicateurs clés de la plateforme.
        </p>

        <div class="mt-8 grid gap-4 sm:grid-cols-3">
          <div class="rounded-2xl border border-white/10 bg-[#10102A] p-4">
            <p class="text-xs text-white/50 uppercase tracking-wider">Utilisateurs</p>
            <p class="mt-2 text-2xl font-bold">{{ stats?.totalUsers ?? '--' }}</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-[#10102A] p-4">
            <p class="text-xs text-white/50 uppercase tracking-wider">Formations</p>
            <p class="mt-2 text-2xl font-bold">{{ stats?.totalFormations ?? '--' }}</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-[#10102A] p-4">
            <p class="text-xs text-white/50 uppercase tracking-wider">Inscriptions</p>
            <p class="mt-2 text-2xl font-bold">{{ stats?.totalEnrollments ?? '--' }}</p>
          </div>
        </div>
      </section>

      <aside class="rounded-3xl border border-[var(--bridge-border)] bg-gradient-to-br from-[#10102A] to-[#171738] p-6 md:p-8">
        <p class="text-xs uppercase tracking-[0.3em] text-[var(--bridge-gold)] font-bold">Session</p>
        <div class="mt-4">
          <p class="text-sm text-white/50">Connecté en tant que</p>
          <p class="text-xl font-semibold mt-1">{{ user?.prenom }} {{ user?.nom }}</p>
          <span class="mt-3 inline-flex rounded-full bg-[rgba(245,166,35,0.15)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--bridge-gold)]">
            {{ user?.role }}
          </span>
        </div>
      </aside>
    </div>
  `
})
export class AdminOverviewComponent implements OnInit {
  user: User | null = null;
  stats: any = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user || this.user.role !== 'ADMIN') {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.userService.getAdminStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: () => {}
    });
  }
}