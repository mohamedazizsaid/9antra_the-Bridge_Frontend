import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
    // Extract student IDs — from backend `students` array (now enrolled student IDs)
    const rawStudents = f.students || f.enrolledStudents || f.stagiaires || f.trainees || [];
    const studentIds: string[] = rawStudents.map((s: any) =>
      typeof s === 'object' ? (s.id?.toString() || '') : (s?.toString() || '')
    ).filter((id: string) => id !== '');

    return {
      id: f.id.toString(),
      nom: f.title,
      description: f.description,
      formateurId: mainTrainer ? mainTrainer.id.toString() : '',
      formateurNom: mainTrainer ? `${mainTrainer.firstName} ${mainTrainer.lastName}` : 'Aucun formateur',
      formateurAvatar: mainTrainer ? mainTrainer.avatar : '',
      dateDebut: f.startDate ? new Date(f.startDate) : undefined,
      dateFin: f.endDate ? new Date(f.endDate) : undefined,
      status: (f.status as 'ACTIVE' | 'TERMINEE' | 'PLANIFIEE') || 'PLANIFIEE',
      archived: f.archived || false,
      stagiaires: studentIds,
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
      formationId: s.formationId ? s.formationId.toString() : '',
      formationNom: s.formationTitle || '',
      date: new Date(s.sessionDate),
      heureDebut: s.startTime ? s.startTime.substring(0, 5) : '',
      heureFin: s.endTime ? s.endTime.substring(0, 5) : (s.startTime ? s.startTime.substring(0, 5) : ''),
      duree: s.duration ? `${s.duration}h` : '3h',
      salle: s.location || '',
      formateurNom: s.trainerName || 'Formateur',
      type: s.meetingLink ? 'EN_LIGNE' : 'PRESENTIEL',
      status: s.status === 'CLOSED' ? 'CLOTUREE' : 'OUVERTE',
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

  getUpcomingSeances(trainerId?: string): Observable<Seance[]> {
    const url = trainerId
      ? `${this.apiUrl}/sessions/trainer/${trainerId}/upcoming`
      : `${this.apiUrl}/sessions/upcoming`;
    return this.http.get<any[]>(url).pipe(
      map(list => list.map(s => this.mapSessionDTO(s)))
    );
  }

  getTodaySeances(trainerId?: string): Observable<Seance[]> {
    const url = trainerId
      ? `${this.apiUrl}/sessions/trainer/${trainerId}/today`
      : `${this.apiUrl}/sessions/today`;
    return this.http.get<any[]>(url).pipe(
      map(list => list.map(s => this.mapSessionDTO(s)))
    );
  }

  getAllSeancesByFormateur(trainerId: string): Observable<Seance[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sessions/trainer/${trainerId}`).pipe(
      map(list => list.map(s => this.mapSessionDTO(s))),
      catchError(() => of([]))
    );
  }

  getPastSeancesByFormateur(trainerId: string): Observable<Seance[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sessions/trainer/${trainerId}/past`).pipe(
      map(list => list.map(s => this.mapSessionDTO(s))),
      catchError(() => of([]))
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

  unlockPhase(phaseId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/phases/${phaseId}/unlock`, {});
  }

  updateFormation(id: string, data: Partial<Formation>): Observable<Formation> {
    const payload: any = {};
    if (data.nom !== undefined) payload['title'] = data.nom;
    if (data.description !== undefined) payload['description'] = data.description;
    if (data.category !== undefined) payload['category'] = data.category;
    if (data.totalPrice !== undefined) payload['totalPrice'] = data.totalPrice;
    if (data.status !== undefined) payload['status'] = data.status;
    return this.http.put<any>(`${this.apiUrl}/formations/${id}`, payload).pipe(
      map(f => this.mapFormationDTO(f))
    );
  }

  archiveFormation(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/formations/${id}/archive`, {});
  }

  deleteFormation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/formations/${id}`);
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/dashboard`).pipe(
      catchError(() => of({ totalFormations: 0, totalUsers: 0, totalEnrollments: 0, totalFormateurs: 0, totalStagiaires: 0 }))
    );
  }
}
