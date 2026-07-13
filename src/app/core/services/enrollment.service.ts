import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EnrollmentRequest {
  studentId: number;
  formationId: number;
}

export interface EnrollmentResponse {
  id: number;
  studentId: number;
  formationId: number;
  enrollmentDate: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private apiUrl = 'http://localhost:8080/api/enrollments';

  constructor(private http: HttpClient) {}

  enrollStudent(studentId: number, formationId: number): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(this.apiUrl, { studentId, formationId });
  }

  getEnrollmentsByStudent(studentId: number): Observable<EnrollmentResponse[]> {
    return this.http.get<EnrollmentResponse[]>(`${this.apiUrl}/student/${studentId}`);
  }

  getEnrollmentsByFormation(formationId: number): Observable<EnrollmentResponse[]> {
    return this.http.get<EnrollmentResponse[]>(`${this.apiUrl}/formation/${formationId}`);
  }

  cancelEnrollment(enrollmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${enrollmentId}`);
  }
}
