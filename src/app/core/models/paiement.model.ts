export type PaiementStatus = 'PAYE' | 'EN_ATTENTE' | 'EN_RETARD';

export interface Paiement {
  id: string;
  stagiaireId: string;
  formationId: string;
  phaseNumero: number;
  montant: number;
  devise: string;
  status: PaiementStatus;
  datePaiement?: Date;
  dateEcheance: Date;
  methode?: 'FLOUCI' | 'PAYMEE' | 'STRIPE' | 'ESPECES';
}
