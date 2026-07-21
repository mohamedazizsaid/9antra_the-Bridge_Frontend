import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  getEvaluationsByStudent(studentId: string): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/student/${studentId}`);
  }

  getEvaluationsByTrainer(trainerId: string): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/trainer/${trainerId}`);
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
    return this.http.post<Evaluation>(this.apiUrl, payload);
  }

  getEvaluationsByPhase(phaseId: string): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/phase/${phaseId}`);
  }
}
