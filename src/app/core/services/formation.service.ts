import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Formation, Phase, Seance, Presence } from '../models/formation.model';

@Injectable({ providedIn: 'root' })
export class FormationService {

  private mockFormations: Formation[] = [
    {
      id: 'f1',
      nom: 'Développement Web Full-Stack',
      description: 'Formation complète couvrant HTML, CSS, JS, Angular, Node.js et bases de données.',
      formateurId: '2',
      formateurNom: 'Dr. Sami Ben Ali',
      dateDebut: new Date('2026-03-01'),
      dateFin: new Date('2026-09-30'),
      status: 'ACTIVE',
      stagiaires: ['3', '4', '5', '6', '7'],
      phases: [
        {
          id: 'p1', formationId: 'f1', numero: 1, nom: 'Fondamentaux Web',
          description: 'HTML5, CSS3, JavaScript ES6+',
          dateDebut: new Date('2026-03-01'), dateFin: new Date('2026-04-15'),
          status: 'COMPLETEE', progression: 100, seances: []
        },
        {
          id: 'p2', formationId: 'f1', numero: 2, nom: 'Backend & APIs',
          description: 'Node.js, Express, REST APIs, PostgreSQL',
          dateDebut: new Date('2026-04-16'), dateFin: new Date('2026-06-15'),
          status: 'EN_COURS', progression: 65, seances: []
        },
        {
          id: 'p3', formationId: 'f1', numero: 3, nom: 'Frontend Avancé',
          description: 'Angular 18, RxJS, State Management',
          dateDebut: new Date('2026-06-16'), dateFin: new Date('2026-08-15'),
          status: 'VERROUILLEE', progression: 0, seances: []
        },
        {
          id: 'p4', formationId: 'f1', numero: 4, nom: 'Projet Final',
          description: 'Application full-stack complète avec déploiement',
          dateDebut: new Date('2026-08-16'), dateFin: new Date('2026-09-30'),
          status: 'VERROUILLEE', progression: 0, seances: []
        }
      ]
    },
    {
      id: 'f2',
      nom: 'Design UI/UX',
      description: 'Maîtrisez Figma, les principes UX et le design system.',
      formateurId: '2',
      formateurNom: 'Dr. Sami Ben Ali',
      dateDebut: new Date('2026-04-01'),
      dateFin: new Date('2026-07-31'),
      status: 'ACTIVE',
      stagiaires: ['8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'],
      phases: [
        {
          id: 'p5', formationId: 'f2', numero: 1, nom: 'Principes UX',
          description: 'Recherche utilisateur, personas, wireframing',
          dateDebut: new Date('2026-04-01'), dateFin: new Date('2026-05-15'),
          status: 'COMPLETEE', progression: 100, seances: []
        },
        {
          id: 'p6', formationId: 'f2', numero: 2, nom: 'Design UI',
          description: 'Figma, design tokens, composants',
          dateDebut: new Date('2026-05-16'), dateFin: new Date('2026-06-30'),
          status: 'EN_COURS', progression: 45, seances: []
        },
        {
          id: 'p7', formationId: 'f2', numero: 3, nom: 'Prototypage',
          description: 'Prototypes interactifs et tests utilisateur',
          dateDebut: new Date('2026-07-01'), dateFin: new Date('2026-07-31'),
          status: 'VERROUILLEE', progression: 0, seances: []
        }
      ]
    },
    {
      id: 'f3',
      nom: 'Data Science & IA',
      description: 'Python, Machine Learning, Deep Learning et déploiement de modèles.',
      formateurId: '2',
      formateurNom: 'Dr. Sami Ben Ali',
      dateDebut: new Date('2026-05-01'),
      dateFin: new Date('2026-10-31'),
      status: 'ACTIVE',
      stagiaires: ['23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
      phases: [
        {
          id: 'p8', formationId: 'f3', numero: 1, nom: 'Python & Data',
          description: 'Python, NumPy, Pandas, visualisation',
          dateDebut: new Date('2026-05-01'), dateFin: new Date('2026-06-30'),
          status: 'EN_COURS', progression: 30, seances: []
        },
        {
          id: 'p9', formationId: 'f3', numero: 2, nom: 'Machine Learning',
          description: 'Scikit-learn, régressions, classification',
          dateDebut: new Date('2026-07-01'), dateFin: new Date('2026-08-31'),
          status: 'VERROUILLEE', progression: 0, seances: []
        }
      ]
    }
  ];

  private mockSeances: Seance[] = [
    {
      id: 's1', phaseId: 'p2', formationNom: 'Développement Web Full-Stack',
      date: new Date(), heureDebut: '09:00', heureFin: '12:00', duree: '3h',
      salle: 'Salle 201', formateurNom: 'Dr. Sami Ben Ali', type: 'PRESENTIEL',
      presences: this.generatePresences(23)
    },
    {
      id: 's2', phaseId: 'p6', formationNom: 'Design UI/UX',
      date: new Date(), heureDebut: '14:00', heureFin: '17:00', duree: '3h',
      salle: 'En ligne', formateurNom: 'Dr. Sami Ben Ali', type: 'EN_LIGNE',
      presences: this.generatePresences(15)
    },
    {
      id: 's3', phaseId: 'p2', formationNom: 'Développement Web Full-Stack',
      date: new Date(Date.now() + 86400000), heureDebut: '09:00', heureFin: '12:00', duree: '3h',
      salle: 'Salle 201', formateurNom: 'Dr. Sami Ben Ali', type: 'PRESENTIEL'
    },
    {
      id: 's4', phaseId: 'p6', formationNom: 'Design UI/UX',
      date: new Date(Date.now() + 86400000 * 2), heureDebut: '14:00', heureFin: '17:00', duree: '3h',
      salle: 'Salle 305', formateurNom: 'Dr. Sami Ben Ali', type: 'PRESENTIEL'
    },
    {
      id: 's5', phaseId: 'p2', formationNom: 'Développement Web Full-Stack',
      date: new Date(Date.now() + 86400000 * 4), heureDebut: '09:00', heureFin: '12:00', duree: '3h',
      salle: 'Salle 201', formateurNom: 'Dr. Sami Ben Ali', type: 'PRESENTIEL'
    }
  ];

  private generatePresences(count: number): Presence[] {
    const prenoms = ['Hamza', 'Sana', 'Amine', 'Yasmine', 'Mehdi', 'Fatma', 'Omar', 'Leila', 'Karim', 'Nour',
      'Rami', 'Ines', 'Walid', 'Amira', 'Aziz', 'Hana', 'Bilel', 'Rim', 'Taha', 'Dorra',
      'Fares', 'Mariem', 'Yassine'];
    const noms = ['Bouazizi', 'Mejri', 'Saidi', 'Chaker', 'Hamdi', 'Brahem', 'Jlassi', 'Riahi', 'Dridi', 'Maalej',
      'Ksibi', 'Ayari', 'Guesmi', 'Chahed', 'Nasri', 'Dali', 'Turki', 'Sahli', 'Ferchichi', 'Haddad',
      'Bouzid', 'Mnasri', 'Triki'];
    return Array.from({ length: count }, (_, i) => ({
      stagiaireId: (i + 3).toString(),
      stagiaireNom: `${prenoms[i % prenoms.length]} ${noms[i % noms.length]}`,
      present: Math.random() > 0.15
    }));
  }

  getFormations(): Observable<Formation[]> {
    return of(this.mockFormations).pipe(delay(300));
  }

  getFormationById(id: string): Observable<Formation | undefined> {
    return of(this.mockFormations.find(f => f.id === id)).pipe(delay(200));
  }

  getFormationsByFormateur(formateurId: string): Observable<Formation[]> {
    return of(this.mockFormations.filter(f => f.formateurId === formateurId)).pipe(delay(300));
  }

  getFormationsByStagiaire(stagiaireId: string): Observable<Formation[]> {
    return of(this.mockFormations.filter(f => f.stagiaires.includes(stagiaireId))).pipe(delay(300));
  }

  getUpcomingSeances(): Observable<Seance[]> {
    const now = new Date();
    return of(this.mockSeances.filter(s => s.date >= now || this.isToday(s.date))).pipe(delay(200));
  }

  getTodaySeances(): Observable<Seance[]> {
    return of(this.mockSeances.filter(s => this.isToday(s.date))).pipe(delay(200));
  }

  savePresence(seanceId: string, presences: Presence[]): Observable<boolean> {
    const seance = this.mockSeances.find(s => s.id === seanceId);
    if (seance) {
      seance.presences = presences;
    }
    return of(true).pipe(delay(500));
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
}
