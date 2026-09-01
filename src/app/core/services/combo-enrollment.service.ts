import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ComboEnrollment, ComboFormationItem } from '../models/combo-enrollment.model';

@Injectable({ providedIn: 'root' })
export class ComboEnrollmentService {
  private apiUrl = `${environment.apiUrl}/combo-enrollments`;

  constructor(private http: HttpClient) {}

  /** Crée un combo + retourne l'URL Stripe Checkout */
  createCombo(
    studentId: number,
    formationIds: number[],
    note?: string,
  ): Observable<ComboEnrollment> {
    return this.http
      .post<any>(this.apiUrl, { studentId, formationIds, note: note || null })
      .pipe(map((r) => this.mapCombo(r)));
  }

  /** Vérifie et confirme le paiement Stripe du combo */
  verifyComboPayment(stripeSessionId: string, comboId: number): Observable<ComboEnrollment> {
    return this.http
      .get<any>(`${this.apiUrl}/stripe/verify`, {
        params: { sessionId: stripeSessionId, comboId: comboId.toString() },
      })
      .pipe(map((r) => this.mapCombo(r)));
  }

  /** Combos d'un stagiaire */
  getCombosByStudent(studentId: number): Observable<ComboEnrollment[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/student/${studentId}`)
      .pipe(map((list) => list.map((r) => this.mapCombo(r))));
  }

  /** Combos vue formateur */
  getCombosByFormateur(formateurId: number): Observable<ComboEnrollment[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/formateur/${formateurId}`)
      .pipe(map((list) => list.map((r) => this.mapCombo(r))));
  }

  /** Tous les combos — admin */
  getAllCombos(): Observable<ComboEnrollment[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(map((list) => list.map((r) => this.mapCombo(r))));
  }

  /** Détail d'un combo */
  getComboById(id: number): Observable<ComboEnrollment> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map((r) => this.mapCombo(r)));
  }

  /** Annuler un combo non payé */
  cancelCombo(comboId: number, studentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${comboId}`, {
      body: { studentId },
    });
  }

  /** Supprimer définitivement un combo annulé ou non payé */
  deleteCombo(comboId: number, studentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${comboId}/delete`, {
      params: { studentId: studentId.toString() },
    });
  }

  /** Régénérer une session Stripe pour un combo existant en attente */
  retryCheckout(comboId: number, studentId: number): Observable<ComboEnrollment> {
    return this.http
      .post<any>(
        `${this.apiUrl}/${comboId}/retry-checkout`,
        {},
        {
          params: { studentId: studentId.toString() },
        },
      )
      .pipe(map((r) => this.mapCombo(r)));
  }

  // ─── Mapping ──────────────────────────────────────────────────────────────

  private mapCombo(r: any): ComboEnrollment {
    return {
      id: r.id,
      studentId: r.studentId,
      studentFirstName: r.studentFirstName,
      studentLastName: r.studentLastName,
      studentEmail: r.studentEmail,
      studentAvatar: r.studentAvatar,
      formations: (r.formations || []).map((f: any) => this.mapFormation(f)),
      totalPrice: r.totalPrice || 0,
      discountPercent: r.discountPercent || 0,
      finalPrice: r.finalPrice || 0,
      status: r.status || 'PENDING_PAYMENT',
      createdAt: r.createdAt,
      paidAt: r.paidAt,
      stripeSessionId: r.stripeSessionId,
      stripeCheckoutUrl: r.stripeCheckoutUrl,
      receiptRef: r.receiptRef,
      note: r.note,
      enrollments: r.enrollments || [],
    };
  }

  private mapFormation(f: any): ComboFormationItem {
    const mainTrainer = f.trainers && f.trainers.length > 0 ? f.trainers[0] : null;
    return {
      id: f.id?.toString(),
      nom: f.title || f.nom || '',
      title: f.title,
      description: f.description,
      category: f.category,
      totalPrice: f.totalPrice,
      formateurNom: mainTrainer
        ? `${mainTrainer.firstName || ''} ${mainTrainer.lastName || ''}`.trim()
        : f.formateurNom || '',
      defaultDurationWeeks: f.defaultDurationWeeks,
      phases: f.phases || [],
    };
  }
}
