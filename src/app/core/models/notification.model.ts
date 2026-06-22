export type NotificationType =
  | 'PAIEMENT_CONFIRME'
  | 'PAIEMENT_RETARD'
  | 'PHASE_DEBLOQUEE'
  | 'CERTIFICAT_GENERE'
  | 'SEANCE_PLANIFIEE'
  | 'EVALUATION_PUBLIEE'
  | 'ANNONCE';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  PAIEMENT_CONFIRME:  '#10B981',
  PAIEMENT_RETARD:    '#EF4444',
  PHASE_DEBLOQUEE:    '#F5A623',
  CERTIFICAT_GENERE:  '#C62761',
  SEANCE_PLANIFIEE:   '#3B82F6',
  EVALUATION_PUBLIEE: '#8B5CF6',
  ANNONCE:            '#F0F0FF',
};
