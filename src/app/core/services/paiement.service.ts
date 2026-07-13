import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Paiement, PaiementStatus } from '../models/paiement.model';

@Injectable({ providedIn: 'root' })
export class PaiementService {
  private apiUrl = 'http://localhost:8080/api/payments';

  constructor(private http: HttpClient) {}

  private mapPaymentDTO(p: any): Paiement {
    const today = new Date();
    // Default mock dueDate as enrollmentDate + some months, or use paymentDate
    const echeance = p.paymentDate ? new Date(p.paymentDate) : new Date();

    let status: PaiementStatus = 'EN_ATTENTE';
    if (p.status === 'COMPLETED') {
      status = 'PAYE';
    } else if (p.status === 'PENDING') {
      status = today > echeance ? 'EN_RETARD' : 'EN_ATTENTE';
    }

    return {
      id: p.id.toString(),
      stagiaireId: p.studentId.toString(),
      formationId: p.formationId ? p.formationId.toString() : '',
      phaseNumero: p.phaseOrder || 1,
      montant: p.amount || 0,
      devise: 'TND',
      status: status,
      datePaiement: p.paymentDate ? new Date(p.paymentDate) : undefined,
      dateEcheance: echeance,
      methode: p.paymentMethod || 'ESPECES'
    };
  }

  getPaiementsByStagiaire(stagiaireId: string): Observable<Paiement[]> {
    return this.http.get<any[]>(`${this.apiUrl}/student/${stagiaireId}`).pipe(
      map(list => list.map(p => this.mapPaymentDTO(p)))
    );
  }

  getPaiementsByFormation(formationId: string): Observable<Paiement[]> {
    return this.http.get<any[]>(`${this.apiUrl}/formation/${formationId}`).pipe(
      map(list => list.map(p => this.mapPaymentDTO(p)))
    );
  }

  getRetardCount(stagiaireId: string): Observable<number> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/student/${stagiaireId}/retard`).pipe(
      map(res => res.count)
    );
  }
}
