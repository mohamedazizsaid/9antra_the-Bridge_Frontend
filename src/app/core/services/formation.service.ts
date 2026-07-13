import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Formation, Phase, Seance, Presence } from '../models/formation.model';

@Injectable({ providedIn: 'root' })
export class FormationService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private mapUserDTO(u: any): any {
    return {
      id: u.id.toString(),
      prenom: u.firstName,
      nom: u.lastName,
      email: u.email,
      telephone: u.phone,
      role: u.role,
      avatar: u.avatar,
      dateInscription: new Date(u.createdAt),
      age: u.age,
      status: u.status,
      authProvider: u.authProvider
    };
  }

  private mapFormationDTO(f: any): Formation {
    const mainTrainer = f.trainers && f.trainers.length > 0 ? f.trainers[0] : null;
    return {
      id: f.id.toString(),
      nom: f.title,
      description: f.description,
      formateurId: mainTrainer ? mainTrainer.id.toString() : '',
      formateurNom: mainTrainer ? `${mainTrainer.firstName} ${mainTrainer.lastName}` : 'Aucun formateur',
      formateurAvatar: mainTrainer ? mainTrainer.avatar : '',
      dateDebut: new Date(),
      dateFin: new Date(),
      status: 'ACTIVE',
      stagiaires: [],
      phases: f.phases ? f.phases.map((p: any) => this.mapPhaseDTO(p)) : [],
      category: f.category,
      totalPrice: f.totalPrice
    };
  }

  private mapPhaseDTO(p: any): Phase {
    return {
      id: p.id.toString(),
      formationId: p.formationId ? p.formationId.toString() : '',
      numero: p.phaseOrder,
      nom: p.title,
      description: p.content || '',
      dateDebut: new Date(),
      dateFin: new Date(),
      status: p.unlocked ? (p.pedagogicalValidated ? 'COMPLETEE' : 'EN_COURS') : 'VERROUILLEE',
      progression: p.attendanceRate ? Math.round(p.attendanceRate) : 0,
      seances: p.sessions ? p.sessions.map((s: any) => this.mapSessionDTO(s)) : []
    };
  }

  private mapSessionDTO(s: any): Seance {
    return {
      id: s.id.toString(),
      phaseId: s.phaseId ? s.phaseId.toString() : '',
      formationNom: s.formationTitle || '',
      date: new Date(s.sessionDate),
      heureDebut: s.startTime ? s.startTime.substring(0, 5) : '',
      heureFin: s.startTime ? s.startTime.substring(0, 5) : '',
      duree: s.duration ? `${s.duration}h` : '3h',
      salle: s.location || '',
      formateurNom: s.formationTitle ? 'Formateur' : '',
      type: s.meetingLink ? 'EN_LIGNE' : 'PRESENTIEL',
      presences: s.attendances ? s.attendances.map((a: any) => ({
        stagiaireId: a.studentId.toString(),
        stagiaireNom: `${a.studentFirstName} ${a.studentLastName}`,
        stagiaireAvatar: a.studentAvatar,
        present: a.present,
        starRating: a.starRating,
        sessionNote: a.sessionNote
      })) : []
    };
  }

  getFormations(): Observable<Formation[]> {
    return this.http.get<any[]>(`${this.apiUrl}/formations`).pipe(
      map(list => list.map(f => this.mapFormationDTO(f)))
    );
  }

  getFormationById(id: string): Observable<Formation | undefined> {
    return this.http.get<any>(`${this.apiUrl}/formations/${id}`).pipe(
      map(f => this.mapFormationDTO(f))
    );
  }

  getFormationsByFormateur(formateurId: string): Observable<Formation[]> {
    return this.http.get<any[]>(`${this.apiUrl}/formations/formateur/${formateurId}`).pipe(
      map(list => list.map(f => this.mapFormationDTO(f)))
    );
  }

  getFormationsByStagiaire(stagiaireId: string): Observable<Formation[]> {
    return this.http.get<any[]>(`${this.apiUrl}/formations/stagiaire/${stagiaireId}`).pipe(
      map(list => list.map(f => this.mapFormationDTO(f)))
    );
  }

  getUpcomingSeances(): Observable<Seance[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sessions/upcoming`).pipe(
      map(list => list.map(s => this.mapSessionDTO(s)))
    );
  }

  getTodaySeances(): Observable<Seance[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sessions/today`).pipe(
      map(list => list.map(s => this.mapSessionDTO(s)))
    );
  }

  savePresence(seanceId: string, presences: Presence[]): Observable<boolean> {
    const payload = presences.map(p => ({
      studentId: parseInt(p.stagiaireId),
      present: p.present,
      starRating: p.starRating || null,
      sessionNote: p.sessionNote || null
    }));
    return this.http.post(`${this.apiUrl}/attendance/session/${seanceId}`, payload).pipe(
      map(() => true)
    );
  }

  createFormation(formation: any): Observable<Formation> {
    return this.http.post<any>(`${this.apiUrl}/formations`, formation).pipe(
      map(f => this.mapFormationDTO(f))
    );
  }

  addPhase(formationId: string, phase: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/formations/${formationId}/phases`, phase);
  }

  addSession(phaseId: string, session: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/phases/${phaseId}/sessions`, session);
  }

  assignTrainers(formationId: string, trainerIds: number[]): Observable<Formation> {
    return this.http.put<any>(`${this.apiUrl}/formations/${formationId}/trainers`, trainerIds).pipe(
      map(f => this.mapFormationDTO(f))
    );
  }

  closeSession(sessionId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sessions/${sessionId}/close`, {});
  }
}
