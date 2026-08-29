import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EnrollmentRequest {
  studentId: number;
  formationId: number;
  customDurationWeeks?: number | null;
  motivationMessage?: string | null;
}

export interface EnrollmentResponse {
  id: number;
  studentId: number;
  studentFirstName?: string;
  studentLastName?: string;
  studentEmail?: string;
  studentAvatar?: string;
  formationId: number;
  formationTitle?: string;
  formationDefaultDurationWeeks?: number;
  formateurId?: number;
  formateurName?: string;
  enrollmentDate: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  customDurationWeeks?: number;
  motivationMessage?: string;
  rejectionReason?: string;
  respondedAt?: string;
  customPlan?: string;
}

export interface EnrollmentRespondRequest {
  approved: boolean;
  rejectionReason?: string;
}

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private apiUrl = `${environment.apiUrl}/enrollments`;

  constructor(private http: HttpClient) {}

  /** Inscription standard (parcours par défaut) */
  enrollStudent(studentId: number, formationId: number): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(this.apiUrl, { studentId, formationId });
  }

  /** Inscription avec options (parcours standard ou durée personnalisée) */
  enrollStudentWithOptions(req: EnrollmentRequest): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(this.apiUrl, req);
  }

  /** Réponse du formateur (approbation ou rejet) */
  respondToEnrollment(
    enrollmentId: number,
    approved: boolean,
    rejectionReason?: string,
  ): Observable<EnrollmentResponse> {
    return this.http.put<EnrollmentResponse>(`${this.apiUrl}/${enrollmentId}/respond`, {
      approved,
      rejectionReason: rejectionReason || null,
    });
  }

  /** Enregistrement du plan personnalisé et notification du stagiaire */
  saveCustomPlan(
    enrollmentId: number,
    customPlan: string,
    note?: string,
  ): Observable<EnrollmentResponse> {
    return this.http.put<EnrollmentResponse>(`${this.apiUrl}/${enrollmentId}/custom-plan`, {
      customPlan,
      note: note || '',
    });
  }

  unenrollStudent(studentId: number, formationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/student/${studentId}/formation/${formationId}`);
  }

  getEnrollmentsByStudent(studentId: number): Observable<EnrollmentResponse[]> {
    return this.http.get<EnrollmentResponse[]>(`${this.apiUrl}/student/${studentId}`);
  }

  getEnrollmentsByFormation(formationId: number): Observable<EnrollmentResponse[]> {
    return this.http.get<EnrollmentResponse[]>(`${this.apiUrl}/formation/${formationId}`);
  }

  /** Demandes en attente de validation pour un formateur */
  getPendingEnrollmentsForFormateur(formateurId: number): Observable<EnrollmentResponse[]> {
    return this.http.get<EnrollmentResponse[]>(`${this.apiUrl}/formateur/${formateurId}/pending`);
  }
}
