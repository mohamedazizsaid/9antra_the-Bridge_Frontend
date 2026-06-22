import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Paiement } from '../models/paiement.model';

@Injectable({ providedIn: 'root' })
export class PaiementService {

  private mockPaiements: Paiement[] = [
    {
      id: 'pay1', stagiaireId: '3', formationId: 'f1', phaseNumero: 1,
      montant: 300, devise: 'TND', status: 'PAYE',
      datePaiement: new Date('2026-05-15'), dateEcheance: new Date('2026-05-15'),
      methode: 'FLOUCI'
    },
    {
      id: 'pay2', stagiaireId: '3', formationId: 'f1', phaseNumero: 2,
      montant: 300, devise: 'TND', status: 'PAYE',
      datePaiement: new Date('2026-06-15'), dateEcheance: new Date('2026-06-15'),
      methode: 'PAYMEE'
    },
    {
      id: 'pay3', stagiaireId: '3', formationId: 'f1', phaseNumero: 3,
      montant: 300, devise: 'TND', status: 'EN_ATTENTE',
      dateEcheance: new Date('2026-07-15')
    },
    {
      id: 'pay4', stagiaireId: '3', formationId: 'f1', phaseNumero: 4,
      montant: 300, devise: 'TND', status: 'EN_ATTENTE',
      dateEcheance: new Date('2026-08-15')
    }
  ];

  getPaiementsByStagiaire(stagiaireId: string): Observable<Paiement[]> {
    return of(this.mockPaiements.filter(p => p.stagiaireId === stagiaireId)).pipe(delay(300));
  }

  getPaiementsByFormation(formationId: string): Observable<Paiement[]> {
    return of(this.mockPaiements.filter(p => p.formationId === formationId)).pipe(delay(300));
  }

  getRetardCount(stagiaireId: string): Observable<number> {
    return of(this.mockPaiements.filter(p => p.stagiaireId === stagiaireId && p.status === 'EN_RETARD').length).pipe(delay(100));
  }
}
