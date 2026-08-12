import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Evaluation {
  id?: string;
  grade: number;
  comment: string;
  skills: string;
  evaluationDate?: Date;
  studentId: string;
  studentFirstName?: string;
  studentLastName?: string;
  studentAvatar?: string;
  trainerId: string;
  trainerFirstName?: string;
  trainerLastName?: string;
  phaseId: string;
  phaseTitle?: string;
  formationId?: string;
  formationTitle?: string;
}

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private apiUrl = 'http://localhost:8080/api/evaluations';

  constructor(private http: HttpClient) {}

  /** Normalize all IDs to strings to avoid number vs string comparison bugs */
  private mapEval(e: any): Evaluation {
    return {
      ...e,
      id: e.id?.toString(),
      studentId: e.studentId?.toString(),
      trainerId: e.trainerId?.toString(),
      phaseId: e.phaseId?.toString(),
      formationId: e.formationId?.toString(),
    };
  }

  getEvaluationsByStudent(studentId: string): Observable<Evaluation[]> {
    return this.http.get<any[]>(`${this.apiUrl}/student/${studentId}`).pipe(
      map(list => list.map(e => this.mapEval(e)))
    );
  }

  getEvaluationsByTrainer(trainerId: string): Observable<Evaluation[]> {
    return this.http.get<any[]>(`${this.apiUrl}/trainer/${trainerId}`).pipe(
      map(list => list.map(e => this.mapEval(e)))
    );
  }

  saveEvaluation(evaluation: Evaluation): Observable<Evaluation> {
    const payload = {
      grade: evaluation.grade,
      comment: evaluation.comment,
      skills: evaluation.skills,
      studentId: parseInt(evaluation.studentId),
      trainerId: parseInt(evaluation.trainerId),
      phaseId: parseInt(evaluation.phaseId)
    };
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(e => this.mapEval(e))
    );
  }

  getEvaluationsByPhase(phaseId: string): Observable<Evaluation[]> {
    return this.http.get<any[]>(`${this.apiUrl}/phase/${phaseId}`).pipe(
      map(list => list.map(e => this.mapEval(e)))
    );
  }
}
