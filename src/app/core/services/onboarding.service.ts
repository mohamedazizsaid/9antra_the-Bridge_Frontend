import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  StageInscription,
  OnboardingPayload,
  InternshipStatus,
} from '../models/stage-inscription.model';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * Stagiaire : Soumettre l'onboarding complet (Multipart avec JSON et PDFs)
   */
  submitOnboarding(
    data: OnboardingPayload,
    demandePdf?: File,
    lettrePdf?: File,
  ): Observable<StageInscription> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));

    if (demandePdf) {
      formData.append('demande', demandePdf);
    }
    if (lettrePdf) {
      formData.append('lettre', lettrePdf);
    }

    return this.http.post<StageInscription>(`${this.apiUrl}/onboarding/submit`, formData);
  }

  /**
   * Stagiaire : Récupérer son inscription / statut onboarding
   */
  getMyInscription(): Observable<StageInscription> {
    return this.http.get<StageInscription>(`${this.apiUrl}/onboarding/my`);
  }

  /**
   * Admin : Récupérer toutes les inscriptions aux stages / formations
   */
  getAllInscriptions(): Observable<StageInscription[]> {
    return this.http.get<StageInscription[]>(`${this.apiUrl}/admin/stage-inscriptions`);
  }

  /**
   * Admin : Récupérer les détails d'une inscription
   */
  getInscriptionById(id: number): Observable<StageInscription> {
    return this.http.get<StageInscription>(`${this.apiUrl}/admin/stage-inscriptions/${id}`);
  }

  /**
   * Admin : Valider / Refuser une inscription et assigner un formateur encadrant
   */
  updateStatus(
    id: number,
    status: InternshipStatus,
    notes?: string,
    supervisorId?: number | null,
  ): Observable<StageInscription> {
    return this.http.put<StageInscription>(`${this.apiUrl}/admin/stage-inscriptions/${id}/status`, {
      status,
      notes: notes || '',
      supervisorId: supervisorId || null,
    });
  }

  /**
   * Admin : Récupérer la liste des formateurs disponibles
   */
  getFormateurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/formateurs`);
  }

  /**
   * Admin : Confirmer un paiement manuel (Main-à-main / Banque)
   */
  confirmAdminPayment(id: number): Observable<StageInscription> {
    return this.http.put<StageInscription>(
      `${this.apiUrl}/admin/stage-inscriptions/${id}/confirm-payment`,
      {},
    );
  }

  /**
   * Admin : Mettre à jour le statut de paiement (Payé / Non payé)
   */
  updatePaymentStatus(id: number, paid: boolean): Observable<StageInscription> {
    return this.http.put<StageInscription>(
      `${this.apiUrl}/admin/stage-inscriptions/${id}/payment-status`,
      { paid },
    );
  }

  /**
   * Formateur : Récupérer ses stagiaires de stage facultatif assignés
   */
  getFormateurStageInscriptions(): Observable<StageInscription[]> {
    return this.http.get<StageInscription[]>(`${this.apiUrl}/formateur/stage-inscriptions`);
  }

  /**
   * Admin : Clôturer un stage et générer l'attestation PDF professionnelle
   */
  cloturerStage(id: number): Observable<StageInscription> {
    return this.http.post<StageInscription>(
      `${this.apiUrl}/admin/stage-inscriptions/${id}/cloturer`,
      {},
    );
  }

  /**
   * Stagiaire : Récupérer tout l'historique de mes stages facultatifs
   */
  getMyInscriptionHistory(): Observable<StageInscription[]> {
    return this.http.get<StageInscription[]>(`${this.apiUrl}/onboarding/my/history`);
  }

  /**
   * Stagiaire : Créer ou obtenir la session de paiement Stripe pour un stage approuvé
   */
  createStripeCheckoutSession(id: number): Observable<StageInscription> {
    return this.http.post<StageInscription>(
      `${this.apiUrl}/onboarding/stage/${id}/stripe-checkout`,
      {},
    );
  }

  /**
   * Callback : Vérifier et valider le paiement Stripe d'un stage facultatif
   */
  verifyStagePayment(sessionId: string, stageInscriptionId: number): Observable<StageInscription> {
    return this.http.get<StageInscription>(
      `${this.apiUrl}/onboarding/stage/stripe/verify?sessionId=${sessionId}&stageInscriptionId=${stageInscriptionId}`,
    );
  }
}
