import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, RevealDirective],
  template: `
    <section class="roles-section" appReveal>
      <div class="section-header">
        <span class="section-label">RÔLES</span>
        <h2 class="section-title">Une expérience pour chacun</h2>
        <p class="section-subtitle">Chaque utilisateur bénéficie d'un espace adapté à ses besoins</p>
      </div>

      <div class="role-tabs">
        <button *ngFor="let role of roles; let i = index"
                class="role-tab"
                [class.active]="activeTab === i"
                (click)="activeTab = i"
                [style.--accent]="role.color">
          {{ role.icon }} {{ role.name }}
        </button>
      </div>

      <div class="role-content" [style.--accent]="roles[activeTab].color">
        <div class="role-card">
          <div class="role-glow" [style.background]="'radial-gradient(ellipse at center, ' + roles[activeTab].color + '20 0%, transparent 70%)'"></div>
          <h3 class="role-card-title">{{ roles[activeTab].name }}</h3>
          <p class="role-card-desc">{{ roles[activeTab].description }}</p>
          <ul class="role-capabilities">
            <li *ngFor="let cap of roles[activeTab].capabilities; let j = index" class="capability-item">
              <span class="cap-check" [style.color]="roles[activeTab].color">✓</span>
              {{ cap }}
            </li>
          </ul>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .roles-section {
      padding: 120px 24px;
      max-width: 1280px;
      margin: 0 auto;
    }

    .section-header {
      text-align: center;
      margin-bottom: 48px;
    }

    .section-label {
      font-family: 'Space Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      color: #C62761;
      letter-spacing: 3px;
      text-transform: uppercase;
      display: block;
      margin-bottom: 16px;
    }

    .section-title {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 48px;
      color: #F0F0FF;
      margin-bottom: 12px;
    }

    .section-subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 18px;
      color: #8888BB;
    }

    .role-tabs {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 40px;
    }

    .role-tab {
      padding: 12px 28px;
      font-family: 'Syne', sans-serif;
      font-weight: 600;
      font-size: 15px;
      color: #8888BB;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      cursor: pointer;
      transition: all 300ms;
    }

    .role-tab:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #F0F0FF;
    }

    .role-tab.active {
      background: rgba(198, 39, 97, 0.15);
      border-color: rgba(198, 39, 97, 0.4);
      color: #F0F0FF;
    }

    .role-content {
      max-width: 700px;
      margin: 0 auto;
    }

    .role-card {
      position: relative;
      background: rgba(23, 23, 56, 0.6);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(198, 39, 97, 0.15);
      border-radius: 20px;
      padding: 48px 40px;
      overflow: hidden;
    }

    .role-glow {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .role-card-title {
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 28px;
      color: #F0F0FF;
      margin-bottom: 12px;
      position: relative;
    }

    .role-card-desc {
      font-size: 15px;
      color: #8888BB;
      line-height: 1.7;
      margin-bottom: 28px;
      position: relative;
    }

    .role-capabilities {
      list-style: none;
      padding: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      position: relative;
    }

    .capability-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: #F0F0FF;
    }

    .cap-check {
      font-weight: 700;
      font-size: 16px;
    }

    @media (max-width: 640px) {
      .role-tabs { flex-direction: column; align-items: center; }
      .role-capabilities { grid-template-columns: 1fr; }
      .section-title { font-size: 32px; }
      .role-card { padding: 32px 24px; }
    }
  `]
})
export class RolesComponent {
  activeTab = 0;

  roles = [
    {
      name: 'Administrateur',
      icon: '👑',
      color: '#C62761',
      description: 'Contrôle total sur la plateforme : gestion des utilisateurs, formations, paiements et paramètres système.',
      capabilities: [
        'Gestion complète des utilisateurs',
        'Création et suivi des formations',
        'Validation des paiements',
        'Génération des certificats',
        'Statistiques globales',
        'Configuration système',
        'Gestion des formateurs',
        'Rapports et exports'
      ]
    },
    {
      name: 'Formateur',
      icon: '👨‍🏫',
      color: '#F5A623',
      description: 'Gérez vos formations, suivez la progression des stagiaires et évaluez leurs compétences.',
      capabilities: [
        'Suivi de mes formations',
        'Prise de présence',
        'Évaluation des stagiaires',
        'Planification des séances',
        'Messagerie intégrée',
        'Statistiques de groupe',
        'Envoi d\'annonces',
        'Calendrier interactif'
      ]
    },
    {
      name: 'Stagiaire',
      icon: '🎓',
      color: '#8B5CF6',
      description: 'Suivez votre progression, gérez vos paiements et téléchargez vos certifications blockchain.',
      capabilities: [
        'Tableau de bord personnel',
        'Suivi de progression',
        'Historique de présence',
        'Gestion des paiements',
        'Certificats blockchain',
        'Calendrier des séances',
        'Notifications en temps réel',
        'Profil personnalisable'
      ]
    }
  ];
}
