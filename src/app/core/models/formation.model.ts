export interface Formation {
  id: string;
  nom: string;
  description: string;
  formateurId: string;
  formateurNom: string;
  formateurAvatar?: string;
  dateDebut: Date;
  dateFin: Date;
  phases: Phase[];
  stagiaires: string[];
  status: 'ACTIVE' | 'TERMINEE' | 'PLANIFIEE';
}

export interface Phase {
  id: string;
  formationId: string;
  numero: number;
  nom: string;
  description: string;
  dateDebut: Date;
  dateFin: Date;
  status: 'COMPLETEE' | 'EN_COURS' | 'VERROUILLEE';
  progression: number; // 0-100
  seances: Seance[];
}

export interface Seance {
  id: string;
  phaseId: string;
  formationNom: string;
  date: Date;
  heureDebut: string;
  heureFin: string;
  duree: string;
  salle: string;
  formateurNom: string;
  type: 'PRESENTIEL' | 'EN_LIGNE';
  presences?: Presence[];
}

export interface Presence {
  stagiaireId: string;
  stagiaireNom: string;
  stagiaireAvatar?: string;
  present: boolean;
}
